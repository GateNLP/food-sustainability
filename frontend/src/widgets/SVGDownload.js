import SavePNGIcon from '@material-ui/icons/PhotoCamera';
import SaveSVGIcon from '@material-ui/icons/Image';
import { select } from "d3-selection";

import Link from "@material-ui/core/Link";

const SVGDownload = ({ id, filename, fill, type }) => {

    function getSVG(id) {

        var div = select("#"+id);

        var svg = div.select("svg");

        var background = null;

        if (fill) {
            var dimensions = div.node().getBoundingClientRect();
            background = svg.append("rect")
                .attr("x",0).attr("y",0)
                .attr("width",dimensions.width).attr("height",dimensions.height)
                .attr("fill",div.style("background"))
                .lower();
        }

        var content = svg.node().outerHTML;

        if (fill) background.remove();

        return content;
    }

    var svgToPng = function (svgText, width, height) {
        // convert an svg text to png using the browser
        return new Promise(function(resolve, reject) {
          try {
            // can use the domUrl function from the browser
            var domUrl = window.URL || window.webkitURL || window;
            if (!domUrl) {
              throw new Error("(browser doesnt support this)")
            }
            
            // it needs a namespace
            if (!svgText.match(/xmlns="/mi)){
              svgText = svgText.replace ('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ') ;  
            }
            
            // create a canvas element to pass through
            var canvas = document.createElement("canvas");
            canvas.width = width;//height+margin*2;
            canvas.height = height; //width+margin*2;
            var ctx = canvas.getContext("2d");
            
            
            // make a blob from the svg
            var svg = new Blob([svgText], {
              type: "image/svg+xml;charset=utf-8"
            });
            
            // create a dom object for that image
            var url = domUrl.createObjectURL(svg);
            
            // create a new image to hold it the converted type
            var img = new Image();
            
            // when the image is loaded we can get it as base64 url
            img.onload = function() {
              // draw it to the canvas
              ctx.drawImage(this, 0, 0);
              
              // we don't need the original any more
              domUrl.revokeObjectURL(url);

              // now we can resolve the promise, passing the base64 url
              resolve(canvas.toDataURL());
            };
            
            // load the image
            img.src = url;
            
          } catch (err) {
            reject('failed to convert svg to png ' + err);
          }
        });
      };

    
    async function saveAsPNG(id, link) {

        link.preventDefault();

        var target = select(link.target).node();

        while (target.nodeName !== "A") {
            target = target.parentNode;
        }

        var content = getSVG(id);
        
        var div = select("#"+id);
        
        var dimensions = div.node().getBoundingClientRect();

        var data = await svgToPng(content,dimensions.width,dimensions.height);

        const alink = document.createElement('a');
        alink.id = 'pngDownload';
        alink.href = data;
        alink.download = target.download;

        alink.click();

        alink.remove();
    }

    function saveAsSVG(id, link) {

        var target = select(link.target).node();

        while (target.nodeName !== "A") {
            target = target.parentNode;
        }

        if (target.href !== "#") {
            window.URL.revokeObjectURL(target.href);
        }

        var content = getSVG(id);
         
        var blob = new Blob([content], {type: "image/svg+xml"});
       
        target.href = window.URL.createObjectURL(blob);

        return true;
    }

    if (type === "PNG") {
        return (
            <Link title="Download PNG" href="#" download={filename} onClick={(e) => {return saveAsPNG(id,e);}}>
                <SavePNGIcon style={{verticalAlign:"middle"}}/>
            </Link>
        )
    }

    return (
        <Link title="Download SVG" href="#" download={filename} onClick={(e) => {return saveAsSVG(id,e);}}>
            <SaveSVGIcon style={{verticalAlign:"middle"}}/>
        </Link>
    )
}

export default SVGDownload;