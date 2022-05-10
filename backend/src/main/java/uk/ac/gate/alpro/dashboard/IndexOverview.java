package uk.ac.gate.alpro.dashboard;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.apache.http.HttpHost;
import org.apache.http.client.config.RequestConfig;
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestClientBuilder;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.common.Strings;
import org.elasticsearch.common.unit.TimeValue;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.Scroll;
import org.elasticsearch.search.aggregations.Aggregation;
import org.elasticsearch.search.aggregations.AggregationBuilders;
import org.elasticsearch.search.aggregations.BucketOrder;
import org.elasticsearch.search.aggregations.bucket.MultiBucketsAggregation;
import org.elasticsearch.search.aggregations.bucket.ParsedSingleBucketAggregation;
import org.elasticsearch.search.aggregations.bucket.terms.ParsedTerms;
import org.elasticsearch.search.aggregations.metrics.ParsedPercentiles;
import org.elasticsearch.search.builder.SearchSourceBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class IndexOverview {

   @Value("${elastic.index}")
   private String ELASTIC_INDEX;

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
   public Map overview() throws Exception {
      Map<String, Object> result = new LinkedHashMap<String, Object>();

      SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();

      sourceBuilder.trackTotalHits(true);

      sourceBuilder.query(QueryBuilders.matchAllQuery());

      sourceBuilder.aggregation(AggregationBuilders.terms("sources").field("source.keyword"));

      sourceBuilder.aggregation(AggregationBuilders.terms("suitableFor").field("suitable_for.keyword"));

      sourceBuilder.aggregation(AggregationBuilders.terms("ghge_source").field("source.keyword")
            .order(BucketOrder.aggregation("median", "50", false))
            .subAggregation(AggregationBuilders.percentiles("median").field("totalghge/portion").percentiles(50)));

      sourceBuilder.aggregation(AggregationBuilders.terms("ghge_suitable_for").field("suitable_for.keyword")
            .order(BucketOrder.aggregation("median", "50", false))
            .subAggregation(AggregationBuilders.percentiles("median").field("totalghge/portion").percentiles(50)));

      sourceBuilder.aggregation(AggregationBuilders.terms("ingredients").field("suitable_for.keyword")
            .subAggregation(AggregationBuilders.terms("suitable_for").field("ingredientlist.keyword").size(50)));

      SearchRequest searchRequest = new SearchRequest(ELASTIC_INDEX);
      searchRequest.source(sourceBuilder);

      // do the actual search
      SearchResponse searchResponse = ELASTIC_CLIENT.search(searchRequest, RequestOptions.DEFAULT);

      result.put("total", searchResponse.getHits().getTotalHits().value);
      result.put("sources", aggregationToMap(searchResponse.getAggregations().get("sources")));
      result.put("suitable_for",
            buildSuitableForData(aggregationToMap(searchResponse.getAggregations().get("suitableFor"))));

      result.put("ghge_sources", medianAggregationToMap(searchResponse.getAggregations().get("ghge_source")));
      result.put("ghge_suitable_for",
            medianAggregationToMap(searchResponse.getAggregations().get("ghge_suitable_for")));

      Map<String, Map<String, Long>> ingredients = new LinkedHashMap<String, Map<String, Long>>();

      for (String diet : new String[] { "omnivores", "vegetarians", "vegans" }) {
         ingredients.put(diet, aggregationToMap(((ParsedTerms) searchResponse.getAggregations().get("ingredients"))
               .getBucketByKey(diet).getAggregations().get("suitable_for")));
      }

      result.put("ingredients", ingredients);

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
}
