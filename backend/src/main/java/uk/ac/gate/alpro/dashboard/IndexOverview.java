package uk.ac.gate.alpro.dashboard;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.apache.http.HttpHost;
import org.apache.http.client.config.RequestConfig;
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.action.search.SearchScrollRequest;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestClientBuilder;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.common.unit.TimeValue;
import org.elasticsearch.index.query.Operator;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.Scroll;
import org.elasticsearch.search.SearchHit;
import org.elasticsearch.search.aggregations.Aggregation;
import org.elasticsearch.search.aggregations.AggregationBuilders;
import org.elasticsearch.search.aggregations.BucketOrder;
import org.elasticsearch.search.aggregations.bucket.MultiBucketsAggregation;
import org.elasticsearch.search.aggregations.bucket.ParsedSingleBucketAggregation;
import org.elasticsearch.search.aggregations.bucket.terms.ParsedTerms;
import org.elasticsearch.search.aggregations.bucket.terms.Terms;
import org.elasticsearch.search.aggregations.metrics.ParsedPercentiles;
import org.elasticsearch.search.builder.SearchSourceBuilder;
import org.elasticsearch.search.sort.FieldSortBuilder;
import org.elasticsearch.search.sort.SortOrder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class IndexOverview {

   @Value("${elastic.index}")
   private String ELASTIC_INDEX;

   private static Map<String, String> indicators;

   static {
      indicators = new LinkedHashMap<String, String>();

      // this is a map from sensible short keys to the long versions used in the index
      indicators.put("ghge", "totalghge");
      indicators.put("fww", "totalfreshwaterwithdrawals");
      indicators.put("landUse", "totallanduse");
      indicators.put("acid", "totalacidifyingemissions");
      indicators.put("swwu", "totalstressweightedwateruse");
      indicators.put("ee", "totaleutrophyingemissions");
      indicators.put("calories", "totalcalories");
   }

   private static RestHighLevelClient ELASTIC_CLIENT;

   private static Scroll ELASTIC_SCROLL = new Scroll(TimeValue.timeValueMinutes(60L));

   @Value("${elastic.endpoint}")
   private void setElasticsearchClient(String endpoint) {
      if (ELASTIC_CLIENT != null)
         return;

      ELASTIC_CLIENT = new RestHighLevelClient(RestClient.builder(HttpHost.create(endpoint))
            .setRequestConfigCallback(new RestClientBuilder.RequestConfigCallback() {
               @Override
               public RequestConfig.Builder customizeRequestConfig(RequestConfig.Builder requestConfigBuilder) {
                  return requestConfigBuilder.setConnectTimeout(5000).setSocketTimeout(120000);
               }
            }));
   }

   @GetMapping("overview")
   public Map overview(@RequestParam(name = "query", defaultValue = "") String query,
         @RequestParam(name = "portion", defaultValue = "false") boolean portion) throws Exception {

      Map<String, Object> result = new LinkedHashMap<String, Object>();

      SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();

      sourceBuilder.trackTotalHits(true);

      // if the user wants to restrict by ingredients then convert that into a query
      // to restrict the documents we will run aggregations over
      if (query.equals("")) {
         sourceBuilder.query(QueryBuilders.matchAllQuery());
      } else {
         sourceBuilder.query(
               QueryBuilders.queryStringQuery(query).defaultField("ingredientlist").defaultOperator(Operator.AND));
      }

      // build an aggregation for the sources
      sourceBuilder.aggregation(AggregationBuilders.terms("sources").field("source.keyword"));

      // build an aggregation for the suitable for diet type field
      sourceBuilder.aggregation(AggregationBuilders.terms("suitableFor").field("suitable_for.keyword"));

      // for each of the indicators build two aggregations to calculate the median
      // value when broken down by either source of diet type. Also take into account
      // if we are doing this per recipe or portion
      for (Map.Entry indicator : indicators.entrySet()) {
         sourceBuilder.aggregation(AggregationBuilders.terms(indicator.getKey() + "_source").field("source.keyword")
               .order(BucketOrder.aggregation("median", "50", false)).subAggregation(AggregationBuilders
                     .percentiles("median").field(indicator.getValue() + (portion ? "/portion" : "")).percentiles(50)));

         sourceBuilder.aggregation(AggregationBuilders.terms(indicator.getKey() + "_suitable_for")
               .field("suitable_for.keyword").minDocCount(0L).order(BucketOrder.aggregation("median", "50", false))
               .subAggregation(AggregationBuilders.percentiles("median")
                     .field(indicator.getValue() + (portion ? "/portion" : "")).percentiles(50)));
      }

      // get the top 50 ingredients for the different diet types
      sourceBuilder.aggregation(AggregationBuilders.terms("ingredients").field("suitable_for.keyword")
            .subAggregation(AggregationBuilders.terms("suitable_for").field("ingredientlist.keyword").size(50)));

      // get the top 50 cooking methods for the different diet types
      sourceBuilder.aggregation(AggregationBuilders.terms("method").field("suitable_for.keyword")
            .subAggregation(AggregationBuilders.terms("suitable_for").field("cookingmethodlist.keyword").size(50)));

      // after all that we can actual buld the request
      SearchRequest searchRequest = new SearchRequest(ELASTIC_INDEX);
      searchRequest.source(sourceBuilder);

      // do the actual search
      SearchResponse searchResponse = ELASTIC_CLIENT.search(searchRequest, RequestOptions.DEFAULT);

      // extract the total number of recipes as the total number of hits
      result.put("total", searchResponse.getHits().getTotalHits().value);

      // convert the sources aggregation into a map
      result.put("sources", aggregationToMap(searchResponse.getAggregations().get("sources")));

      // convert the diet based aggregation into the data for the sunburst
      result.put("suitable_for",
            buildSuitableForData(aggregationToMap(searchResponse.getAggregations().get("suitableFor"))));

      // for each indicator get the median values for both source and diet
      for (String indicator : indicators.keySet()) {
         result.put(indicator + "_sources",
               medianAggregationToMap(searchResponse.getAggregations().get(indicator + "_source")));

         result.put(indicator + "_suitable_for",
               medianAggregationToMap(searchResponse.getAggregations().get(indicator + "_suitable_for")));
      }

      Map<String, Map<String, Long>> ingredients = new LinkedHashMap<String, Map<String, Long>>();
      Map<String, Map<String, Long>> methods = new LinkedHashMap<String, Map<String, Long>>();

      // for each diet type....
      for (String diet : new String[] { "omnivores", "vegetarians", "vegans" }) {

         // get the ingredients for this diet and convert to a map
         Terms.Bucket bucket = ((ParsedTerms) searchResponse.getAggregations().get("ingredients")).getBucketByKey(diet);

         if (bucket != null)
            ingredients.put(diet, aggregationToMap(bucket.getAggregations().get("suitable_for")));
         else
            ingredients.put(diet, new HashMap());

         // get the cooking methods for this diet and convert to a map
         bucket = ((ParsedTerms) searchResponse.getAggregations().get("method")).getBucketByKey(diet);

         if (bucket != null)
            methods.put(diet, aggregationToMap(bucket.getAggregations().get("suitable_for")));
         else
            methods.put(diet, new HashMap());

      }

      result.put("ingredients", ingredients);
      result.put("methods", methods);

      return result;
   }

   public static Map<String, Double> medianAggregationToMap(Aggregation a) {
      Map<String, Double> result = new LinkedHashMap<String, Double>();

      ((MultiBucketsAggregation) a).getBuckets().forEach(b -> {
         ParsedPercentiles median = (ParsedPercentiles) b.getAggregations().get("median");

         result.put(b.getKeyAsString(), median.iterator().next().getValue());
      });

      return result;

   }

   public static Map<String, Long> aggregationToMap(Aggregation a, String... levels) {

      Map<String, Long> result = new LinkedHashMap<String, Long>();

      ((MultiBucketsAggregation) a).getBuckets().forEach(b -> {

         ParsedSingleBucketAggregation previous = null;

         for (String level : levels) {
            if (previous == null) {
               previous = b.getAggregations().get(level);
            } else {
               previous = previous.getAggregations().get(level);
            }
         }

         if (previous == null)
            result.put(b.getKeyAsString(), (long) b.getDocCount());
         else
            result.put(b.getKeyAsString(), (long) previous.getDocCount());
      });

      return result;
   }

   private static Map<String, List> buildSuitableForData(Map<String, Long> types) {
      List<String> ids = new ArrayList<String>();
      List<String> labels = new ArrayList<String>();
      List<Long> values = new ArrayList<Long>();
      List<String> parents = new ArrayList<String>();

      ids.add("omnivores");
      labels.add("omnivores");
      values.add(types.getOrDefault("omnivores", 0L));
      parents.add("");

      ids.add("vegetarians");
      labels.add("vegetarians");
      values.add(types.getOrDefault("vegetarians", 0L));
      parents.add("omnivores");

      ids.add("vegans");
      labels.add("vegans");
      values.add(types.getOrDefault("vegans", 0L));
      parents.add("vegetarians");

      Map<String, List> data = new LinkedHashMap<String, List>();

      data.put("ids", ids);
      data.put("labels", labels);
      data.put("values", values);
      data.put("parents", parents);

      return data;
   }

   @GetMapping("/recipes")
   public Map<String, Object> recipes(@RequestParam(value = "query", defaultValue = "") String query,
         @RequestParam(value = "indicator", defaultValue = "ghge") String indicator,
         @RequestParam(name = "portion", defaultValue = "false") boolean portion) throws Exception {

      // this is where we assemble information about what we are interested in
      SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();

      // we want to track the total number of hits as this tells us how many
      // organic tweets there are in the index (i.e. where someone wrote
      // something new)
      sourceBuilder.trackTotalHits(true);

      // we need the document sources so we can extract the relevant info
      sourceBuilder.fetchSource(true);

      // let's get 10 at a time and use a scroll if we want more than that
      sourceBuilder.size(10);

      // if there is an ingredients restriction in place then use it as the query
      if (query.equals("")) {
         sourceBuilder.query(QueryBuilders.matchAllQuery());
      } else {
         sourceBuilder.query(
               QueryBuilders.queryStringQuery(query).defaultField("ingredientlist").defaultOperator(Operator.AND));
      }

      
      FieldSortBuilder sortByIndicator = new FieldSortBuilder(indicators.get(indicator) + (portion ? "/portion" : ""))
            .order(SortOrder.DESC);

      sourceBuilder.sort(sortByIndicator);

      SearchRequest searchRequest = new SearchRequest(ELASTIC_INDEX);
      searchRequest.source(sourceBuilder);
      searchRequest.scroll(ELASTIC_SCROLL);

      // do the actual search
      SearchResponse searchResponse = ELASTIC_CLIENT.search(searchRequest, RequestOptions.DEFAULT);

      Map<String, Object> data = new LinkedHashMap<String, Object>();

      data.put("scroll_id", searchResponse.getScrollId());

      // store the number of replies within the conversation (this is the size of the
      // conversation minus the original tweet)
      data.put("total", searchResponse.getHits().getTotalHits().value);

      data.put("recipes", scroll(searchResponse.getHits().getHits()));

      return data;
   }

   @GetMapping("/recipes/scroll")
   public List<Map<String, Object>> scroll(@RequestParam(value = "id") String id) throws IOException {

      // TODO what happens if the scroll has expired? Can we return a message we can
      // capture

      SearchScrollRequest scrollRequest = new SearchScrollRequest(id);
      scrollRequest.scroll(ELASTIC_SCROLL);
      SearchResponse searchResponse = ELASTIC_CLIENT.scroll(scrollRequest, RequestOptions.DEFAULT);

      return scroll(searchResponse.getHits().getHits());
   }

   private List<Map<String, Object>> scroll(SearchHit[] hits) {
      List<Map<String, Object>> data = new ArrayList<Map<String, Object>>();

      for (SearchHit hit : hits) {
         Map<String, Object> sourceMap = hit.getSourceAsMap();
         // tweet.put("sort", hit.getSortValues());
         data.add(sourceMap);
      }

      return data;
   }

}
