@Grab('com.opencsv:opencsv:5.3')
import com.opencsv.*;
import com.opencsv.enums.*

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

objectMapper = new ObjectMapper();

RFC4180Parser parser =
new RFC4180ParserBuilder()
.withSeparator((char)'\t')
.withQuoteChar((char)'"')
.build();

csvReader =
new CSVReaderBuilder(new FileReader(new File(args[0])))
.withMultilineLimit(-1)
.withCSVParser(parser)
.withKeepCarriageReturn(false)
.withFieldAsNull(CSVReaderNullFieldIndicator.BOTH)
.build();

// header
headers = csvReader.readNext();

row = csvReader.readNext();

long count = 0;

System.out.withWriter("UTF-8") { w ->
    objectMapper.getFactory().createGenerator(w)
            .setRootValueSeparator(new SerializedString("\n"))
            .withCloseable { jsonG ->

while (row != null) {
	count++

	row = new ArrayList<String>(Arrays.asList(row));
	
	Map data = new LinkedHashMap();
	
	for (int i = 0 ; i < row.size() ; ++i) {
		String key = headers[i];
		String rawValue = row[i];
		
		// just skip the nulls
		if (rawValue.equals("(null)")) continue;
		
		data.put(key+"_raw",rawValue);
		
		if (Character.isDigit(rawValue.charAt(0)) || (rawValue.charAt(0) == '-' && Character.isDigit(rawValue.charAt(1)))) {
			// the data is a number so let's index just the number
		
			try {
				String[] parts = rawValue.split("\\s+",2);
				Float floatValue = Float.valueOf(parts[0]);
				data.put(key,floatValue);
				
				if (parts.length > 1) data.put(key+"_unit",parts[1]);
					
				continue;
			}
			catch (Exception e) {
				//ignore this
				e.printStackTrace();
				continue;
			}
		}
		
		if (rawValue.charAt(0) == '[') {
			// data is a list so let's turn it into a list
			
			rawValue = rawValue.substring(1,rawValue.length()-1);
			
			data.put(key,Arrays.asList(rawValue.split(",\\s*")));
			
			continue;
		}
		
		if (rawValue.equals("No")) {
			data.put(key,Boolean.FALSE);
			continue;
		}
		
		if (rawValue.equals("Yes")) {
			data.put(key,Boolean.TRUE);
			continue;
		}
		
		data.put(key,data.remove(key+"_raw"));
	}
	
	if (data.get("allerhande"))
		data.put("source","Allerhande");
	else if (data.get("kochbar"))
		data.put("source", "kochbar");
	else if (data.get("bbcgoodfood"))
		data.put("source", "BBC Good Food");
	else if (data.get("allrecipes"))
		data.put("source","allrecipes");
	else
		data.put("source", "Other");


	List<String> suitableFor = new ArrayList<String>();
	suitableFor.add("omnivores");

	if (data.get("veganrecipe")) {
		//data.put("suitable_for","vegans");
		suitableFor.add("vegans");
		suitableFor.add("vegetarians");
	}
	else if (data.get("vegetarianrecipe"))
		suitableFor.add("vegetarians");

	data.put("suitable_for",suitableFor);

	List<String> ingredients = data.get("ingredientlist");
	for (int i = 0 ; i < ingredients.size() ; ++i) {
		String ingredient = ingredients.get(i);
		
		int c = 0;
		
		while (c < ingredient.length()) {
			if (Character.isLetter(ingredient.charAt(c))) break;
			
			++c;
		}
		
		// doesn't start with a number
		if (c == 0) continue;
		
		// goodness knows
		if (c == ingredient.length()) continue;
		
		ingredient = ingredient.substring(c);
		
		ingredients.set(i,ingredient);
	}


	data.remove("mimetype");
	data.remove("gate.sourceurl");
	data.remove("docnewlinetype");

	objectMapper.writeValue(jsonG, data);

	row = csvReader.readNext();

}
}}

