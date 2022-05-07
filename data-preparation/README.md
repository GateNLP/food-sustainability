#Notes

1. The CSV (actually a TSV) provided didn't seem to be well valid somewhere
after about 32,000 lines. I re-exported the XLS version to a valid TSV.


# Conversion to JSON

To push a document into Elasticsearch it needs to be a JSON document rather
than a row in a TSV file. We could have done a simple conversion using the 
column header as a key, but this would have made it very difficult to
analyse some of the values (especially via aggregations). So we've modified
the data as follows

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

## Source

In the original TSV file the are boolean columns for the main sources. Whilst
this makes it easy to search for all recipes from a source, using multiple
fields in this way makes it impossible to aggregate. So we look at the boolean
columns and use these to set the source field apprpriately.

Note that the boolean source columns don't actually cover all the sources so
if all of the columns are false then we assign the source as `Other`.

## Suitable For

In a similar way to the sources, there two columns showing if a recipe is
suitable for vegans or vegetarians. We use these to a set a column, which
we call, `suitable_for` to either `vegans`, `vegetarians`, or `omnivores`.
Obviously if it's suitable for vegans then it's also suitable for both
vergetarians and omnivores so we'll need to think about how to display
the numbers, but this way we can aggregate on a single field.

## Raw Values

For fields where we manipulate the original value in some way, we also store
the original in the field `<header>_raw`. And for those fields we don't need
to modify they just end up as `<header>`.


