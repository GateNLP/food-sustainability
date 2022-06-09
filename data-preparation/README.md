# Conversion to JSON

To push a document into Elasticsearch it needs to be a JSON document rather
than a row in a TSV file. We could have done a simple conversion using the 
column header as a key, but this would have made it very difficult to
analyse some of the values (especially via aggregations). So we've
written a script that converts the TSV to JSON and modifies the data.

You can run this script using the command

```
groovy convertTSVtoJSON.groovy <input TSV file> > <output JSON file>
```

The data is modified as follows:

## Values

If a cell starts with a number (including negative numbers) then we split the
value into two parts on the first white space. The first part is converted to
a float so it becomes a number not a string in the JSON output. Both parts
are then added to the JSON as `<header>_value` and `<header>_unit`.

## Lists

If a cell starts with a [ then it's a string representation of a list. So we
remove the start and end brackets, and then split the remainder on the commas.
This gives us an array which we convert to a real list and store in the JSON

## Booleans

If a cell has the value of either `Yes` or `No` then these are converted to
the appropriate boolean so again they are represented not as strings in the
final JSON we index

## Null

If the cell is `(null)` then we simply don't add anything to the JSON as the
lack of a field will count as null in the index. The same now goes for cells
that have the value `-`

## Source

In the original TSV file the are boolean columns for the main sources. Whilst
this makes it easy to search for all recipes from a source, using multiple
fields in this way makes it impossible to aggregate. So we look at the boolean
columns and use these to set the source field apprpriately.

Note that the boolean source columns don't actually cover all the sources so
if all of the columns are false then we assign the source as `Other`.

## Suitable For

In a similar way to the sources, there two columns showing if a recipe is
suitable for vegans or vegetarians. To make the aggregations easier we use
these to populate a single `suitable_for` field. This field is actually a
list, into which we always put `everyone` and then add `vegetarians` or
`vegans` based on the values of the individual columns.

## Ingredients

As well as converting the `ingredientlist` field into an actual list we try
to normalise the values. Firstly we remove any instance of `ingredientlist:`
that appears within the name of an ingredient (I assume that's a bug in a
JAPE rule somewhere).

We then srip off any number (including UNICODE fractions) which occur at the
start of the ingredient. We then look to see if the remaining string starts
with a unit of measure. If it does then we strip that off. We keep doing this
in a loop until the string no longer starts with a number, hopefully leaving
us with just an ingredient name.

We then run a morphological analyser over the last word in the ingredient name
to remove plurals to further normalise the names.

## URL

Some of the URLs for the recipes didn't start with a protocol. This is a pain
when building a link in the UI as they get treated as relative links. So, if
the value doesn't start with `http` we now prepend `https://` just to be on the
safe side.

## Cooking Methods

As well as converting to a list, I've removed `cook` from this as I don't think
it really added anything, and it swamped the other values.

## Serves

The `serveslist` field was a list, but only ever has at most one value. This
wasn't always a number (it could be something like `Serves 2` or `Makes 3`) but
I've introduced a new field `serves` which is a real number extracted from the
single list value. Need to check any future data dumps to make sure they don't
end up with multiple values in this list, although if they do, then goodness
knows how the per portion fields are calculated.

## Raw Values

For fields where we manipulate the original value in some way, we also store
the original in the field `<header>_raw`. And for those fields we don't need
to modify they just end up as `<header>`.

# Building the Index

Once you have a file containing the recipes in JSON format we build the index
using the following command `BuildIndex.groovy`. The usage of which is as follows

```
usage: BuildIndex.groovy -e endpoint -p portnr -m mappingfile -i indexname
                         -f infile [-h]
 -e <arg>   ES endpoint URL (no default, required)
 -f <arg>   Input JSON file (no default, required)
 -h         Show usage information
 -i <arg>   Index name (no default, required)
 -m <arg>   Index mapping file (no default, required)
 -p <arg>   Port number (no default, required)
```

The mapping file is provided as `index-mapping.json`.
