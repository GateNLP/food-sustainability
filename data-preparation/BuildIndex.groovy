import java.nio.charset.StandardCharsets;
import java.util.zip.GZIPInputStream;

import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.*;

import java.util.concurrent.TimeUnit;

@Grab('org.elasticsearch.client:elasticsearch-rest-high-level-client:7.10.2')
import org.elasticsearch.action.ActionListener;
import org.elasticsearch.action.search.*;
import org.elasticsearch.action.update.*;
import org.elasticsearch.client.*;
import org.elasticsearch.index.query.*;
import org.elasticsearch.search.*;
import org.elasticsearch.search.builder.SearchSourceBuilder;
import org.elasticsearch.common.unit.TimeValue;
import org.elasticsearch.search.sort.*;
import org.elasticsearch.index.reindex.*;
import org.elasticsearch.script.*
import org.elasticsearch.action.admin.indices.refresh.*;
import org.elasticsearch.ElasticsearchException;
import org.elasticsearch.client.RestClientBuilder.HttpClientConfigCallback;
import org.elasticsearch.action.support.WriteRequest.RefreshPolicy;
import org.elasticsearch.action.bulk.BulkProcessor;
import org.elasticsearch.action.bulk.BulkRequest;
import org.elasticsearch.action.bulk.BulkResponse;
import org.elasticsearch.action.index.IndexRequest;
import org.elasticsearch.common.xcontent.XContentType;
import org.elasticsearch.client.indices.CreateIndexRequest;
import org.elasticsearch.client.indices.CreateIndexResponse;


import org.apache.http.client.config.RequestConfig;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.HttpHost;
import org.apache.http.client.methods.*;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.*;
import org.apache.http.message.*;
import org.apache.http.impl.nio.client.HttpAsyncClientBuilder;

@Grab('com.fasterxml.jackson.core:jackson-databind:2.9.8')
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonParser.Feature;
import com.fasterxml.jackson.core.JsonPointer;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.core.io.SerializedString;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.MappingIterator;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

@Grab('commons-io:commons-io:2.11.0')
import org.apache.commons.io.FileUtils;


import java.io.PrintWriter
def cli = new CliBuilder(
  usage: "BuildIndex.groovy [-e endpoint] [-p portnr] -m mappingfile -i indexname -f infile [-h]",
  writer:new PrintWriter(System.err));
cli.e(type:String, defaultValue:"gateservice10.dcs.shef.ac.uk", "ES endpoint URL (gateservice10.dcs.shef.ac.uk)");
cli.p(type:Integer, defaultValue:"9700", "Port number (9700)");
cli.m(required:true, type:String, "Index mapping file (no default, required)");
cli.i(required:true, type:String, "Index name (no default, required)");
cli.f(required:true, type:String, "Input JSON file (no default, required)");
cli.h("Show usage information");
options = cli.parse(args);

if(!options) {
  System.exit(1);
}

if (options.arguments().size() != 0) {
  System.err.println("No positional arguments allowed");
  cli.usage();
  System.exit(1);
}



final String ELASTIC_ENDPOINT = options.e;
final int ELASTIC_PORT = options.p;
final String ELASTIC_INDEX = options.i;

RestHighLevelClient client = new RestHighLevelClient(
        RestClient.builder(
                new HttpHost(ELASTIC_ENDPOINT, ELASTIC_PORT, "http")));

ObjectMapper objectMapper = new ObjectMapper();

long count = 0;


BulkProcessor.Listener listener = new BulkProcessor.Listener() {
			@Override
			public void beforeBulk(long executionId, BulkRequest request) {
				// this happens just before a bulk request, we don't care about this at all
			}

			@Override
			public void afterBulk(long executionId, BulkRequest request, BulkResponse response) {
				// TODO this is crazy. This is called when the bulk request was successful, but
				// may contain error messages for each of the items in the request, so we have
				// to check if there were any failures of individual docs and then log them
				// somehow, although the report will still show them as having been a success.
				System.out.println("*** after bulk success: " + (!response.hasFailures()));
				System.out.println(response.buildFailureMessage());
			}

			@Override
			public void afterBulk(long executionId, BulkRequest request, Throwable failure) {
				System.out.println("*** after bulk failure: " + failure.getMessage());
			}
		};

		bulkProcessor = BulkProcessor.builder(
				(request, bulkListener) -> client.bulkAsync(request, RequestOptions.DEFAULT, bulkListener),
				listener).build();

// read the config file into a variable
				String indexConfig = FileUtils.readFileToString(new File(options.m), StandardCharsets.UTF_8);

				// use the config to make a create index request
				CreateIndexRequest request = new CreateIndexRequest(options.i).source(indexConfig, XContentType.JSON);

				// create the index
				CreateIndexResponse createIndexResponse = client.indices().create(request,
						RequestOptions.DEFAULT);


JsonParser jsonParser = objectMapper.getFactory().createParser(new InputStreamReader(new GZIPInputStream(new FileInputStream(new File(options.f))),"UTF-8")).enable(Feature.AUTO_CLOSE_SOURCE);


	// If the first token in the stream is the start of an array ("[") then
    // assume the stream as a whole is an array of objects, one per document.
    // To handle this, simply clear the token - The MappingIterator returned by
    // readValues will cope with the rest in either form.
    if(jsonParser.nextToken() == JsonToken.START_ARRAY) {
		jsonParser.clearCurrentToken();
    }

    // Lets get an iterator for working through the separate tweets in the file
    MappingIterator<JsonNode> docIterator = objectMapper.readValues(jsonParser, JsonNode.class);

    while(docIterator.hasNext()) {
    	++count;
    
		JsonNode node = docIterator.next();
		
		Map document = objectMapper.convertValue(node,Map.class);
		
		IndexRequest indexRequest = new IndexRequest(options.i).source(document, XContentType.JSON);
        //indexRequest.id(document.get("id_raw"));
        bulkProcessor.add(indexRequest);
		System.err.println(count);
	}


/*
while (row != null) {
	// for each line of the input TSV file...

	// split the row into two parts for the tweet ID and the metadata
	row = row.split("\\t",2);

	// convert the JSON string into a normal Java Map
	Map tweetUpdate = objectMapper.readValue(row[1],Map.class);

	// create an update request to add the map as data on the document with
	// the id of the tweet
	UpdateRequest updateOrig = new UpdateRequest(ELASTIC_INDEX, row[0]).doc(tweetUpdate);

	try {
		// update the document in the index
		UpdateResponse updateResponse = client.update(updateOrig, RequestOptions.DEFAULT);
	}
	catch (Exception e) {
		// if an exception occurs (probably as the tweet doesn't exist) log the id_str
		System.err.println("ERROR: "+row[0]+": "+e.getMessage());
		client.close();
		System.exit(1);
	}

	// some progress info so we know something is happening
	if (count % 1000 == 0) System.out.println(count);
	++count;

	row = csvReader.readLine();
}*/
try {
			bulkProcessor.awaitClose(10, TimeUnit.SECONDS);
		} catch (InterruptedException e) {
			e.printStackTrace();
		} finally {
			client.close();
		}


