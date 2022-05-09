
# make the favicon
inkscape --export-background-opacity=0 --export-width=16 -e public/logo016.png src/images/Nature.svg
inkscape --export-background-opacity=0 --export-width=24 -e public/logo024.png src/images/Nature.svg
inkscape --export-background-opacity=0 --export-width=32 -e public/logo032.png src/images/Nature.svg
inkscape --export-background-opacity=0 --export-width=64 -e public/logo064.png src/images/Nature.svg
convert public/logo016.png public/logo024.png public/logo032.png public/logo064.png public/favicon.ico

# make the larger icons for manifest.json
inkscape --export-background-opacity=0 --export-width=192 -e public/logo192.png src/images/Nature.svg
inkscape --export-background-opacity=0 --export-width=512 -e public/logo512.png src/images/Nature.svg


