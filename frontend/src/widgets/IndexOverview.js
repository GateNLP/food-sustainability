import React from "react";
import { useSelector } from "react-redux";

import { select } from "d3-selection";

import Grid from "@material-ui/core/Grid";

import { Box } from "@material-ui/core";

import Plotly from 'plotly.js-dist-min'
import createPlotlyComponent from 'react-plotly.js/factory';

import Paper from '@material-ui/core/Paper';

import Typography from "@material-ui/core/Typography";

import ReactWordcloud from 'react-wordcloud';

import SVGDownload from './SVGDownload'
import CSVDownload, {
    convertObjToCsv,
    convertSunburstToCsv
} from "./CSVDownload";

const Plot = createPlotlyComponent(Plotly);

const IndexOverview = (props) => {

    const overview = useSelector(state => state.overview);

    const options = {
        rotations: 1,
        rotationAngles: [0],
        fontSizes: [11.25, 45],
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        enableOptimizations: true,
        deterministic: true,
    };

    const recipeSources = {
        name: "Recipe Sources",
        type: "pie",
        labels: Array.from(Object.keys(overview.sources)),
        values: Array.from(Object.values(overview.sources)),
        sort: false
    };

    const suitableFor = {
        name: "",
        type: "sunburst",
        hoverinfo: "label+value+percent parent+percent root",
        hovertemplate: "%{label}<br>%{value}<br>%{percentParent:.2%} of %{parent}<br>%{percentRoot:.2%} of %{root}",
        ids: overview.suitable_for.ids,
        labels: overview.suitable_for.labels,
        values: overview.suitable_for.values,
        parents: overview.suitable_for.parents,
        sort: false,
        branchvalues: "total",
        //leaf: { opacity: 1},
        //textfont: { color: "black" },
        marker: { colorscale: "Viridis" },
        root: {
            color: "green"
        }
    }

    const omnivoresCloud = [];
    Object.keys(overview.ingredients.omnivores).forEach(ingredient => {
        omnivoresCloud.push({ text: ingredient, value: overview.ingredients.omnivores[ingredient] });
    });

    const vegetariansCloud = [];
    Object.keys(overview.ingredients.vegetarians).forEach(ingredient => {
        vegetariansCloud.push({ text: ingredient, value: overview.ingredients.vegetarians[ingredient] });
    });

    const vegansCloud = [];
    Object.keys(overview.ingredients.vegans).forEach(ingredient => {
        vegansCloud.push({ text: ingredient, value: overview.ingredients.vegans[ingredient] });
    });

    function getCallback(callback) {
        return function (word, event) {
            const isActive = callback !== "onWordMouseOut";
            const element = event.target;
            const text = select(element);
            text
                .on("click", () => {
                    if (isActive) {
                        props.addToQuery(word.text);
                    }
                })
                .transition()
                .attr("font-weight", isActive ? "bold" : "normal");
        };
    }

    const callbacks = {
        onWordClick: getCallback("onWordClick"),
        onWordMouseOut: getCallback("onWordMouseOut"),
        onWordMouseOver: getCallback("onWordMouseOver")
    }

    return (
        <React.Fragment>
            <Grid component={Paper}
                container
                direction="row"
                spacing={3}
                alignItems="flex-start">

                <Grid item xs={6}>
                    <Typography variant={"h6"} style={{ paddingBottom: 3 }}>Recipes came from the following sources
                        <SVGDownload id="sources" filename="recipe-sources.svg" />
                        <SVGDownload id="sources" type="PNG" filename="recipe-sources.png" />
                        <CSVDownload filename="recipe-sources" method={convertObjToCsv(overview.sources, ["source", "count"])} />
                    </Typography>
                    <Plot divId="sources" style={{ width: "100%" }} data={[recipeSources]} layout={{ showlegend: true, margin: { t: 10, b: 10 }, autosize: true, barmode: "group", xaxis: { fixedrange: true }, yaxis: { fixedrange: true } }} config={{ responsive: false, 'displayModeBar': false }} />
                </Grid>


                <Grid item xs={6}>
                    <Typography variant={"h6"} style={{ paddingBottom: 3 }}>
                        Recipes are suitable for...
                        <SVGDownload id="suitable-for" filename="suitable-for.svg" />
                        <SVGDownload id="suitable-for" filename="suitable-for" type="PNG" />
                        <CSVDownload filename="suitable-for" method={convertSunburstToCsv(overview.suitable_for, ["suitable for", "subtype of", "count"])} />
                    </Typography>
                    <Plot divId="suitable-for" style={{ width: "100%" }} data={[suitableFor]} layout={{ margin: { t: 10, b: 20, l: 5, r: 5 }, autosize: true }} config={{ responsive: true, 'displayModeBar': false, showEditInChartStudio: true, plotlyServerURL: "https://chart-studio.plotly.com" }} />
                </Grid>

            </Grid>

            <Box mt={6} />

            <Grid component={Paper}
                container
                direction="row"
                spacing={3}
                alignItems="flex-start">

                <Grid item xs={12}>
                    <Typography variant={"h6"}>Most common ingredients in recipes suitable for...</Typography>
                </Grid>

                <Grid item xs={4}>
                    <Typography variant={"h6"} style={{ paddingBottom: 3 }}>
                        Omnivores
                        <SVGDownload id="cloud-omnivores" filename="omnivore-ingredients.svg" />
                        <SVGDownload id="cloud-omnivores" type="PNG" filename="omnivore-ingredients.png" />
                        <CSVDownload filename="omnivore-ingredients" method={convertObjToCsv(overview.ingredients.omnivores, ["ingredient", "recipe count"])} />
                    </Typography>
                    <ReactWordcloud style={{ height: 400 }} id="cloud-omnivores" words={omnivoresCloud} options={options} callbacks={callbacks} />
                </Grid>

                <Grid item xs={4}>
                    <Typography variant={"h6"} style={{ paddingBottom: 3 }}>
                        Vegetarians
                        <SVGDownload id="cloud-vegetarians" filename="vegetarian-ingredients.svg" />
                        <SVGDownload id="cloud-vegetarians" type="PNG" filename="vegetarian-ingredients.png" />
                        <CSVDownload filename="vegetarian-ingredients" method={convertObjToCsv(overview.ingredients.vegetarians, ["ingredient", "recipe count"])} />
                    </Typography>
                    <ReactWordcloud style={{ height: 400 }} id="cloud-vegetarians" words={vegetariansCloud} options={options} callbacks={callbacks} />
                </Grid>

                <Grid item xs={4}>
                    <Typography variant={"h6"} style={{ paddingBottom: 3 }}>
                        Vegans
                        <SVGDownload id="cloud-vegans" filename="vegan-ingredients.svg" />
                        <SVGDownload id="cloud-vegans" type="PNG" filename="vegan-ingredients.png" />
                        <CSVDownload filename="vegans-ingredients" method={convertObjToCsv(overview.ingredients.vegans, ["ingredient", "recipe count"])} />
                    </Typography>
                    <ReactWordcloud style={{ height: 400 }} id="cloud-vegans" words={vegansCloud} options={options} callbacks={callbacks} />
                </Grid>
            </Grid>
            <Box mt={6}/>
        </React.Fragment>

    )
}

export default IndexOverview;