import React from "react";
import { useSelector } from "react-redux";

import Grid from "@material-ui/core/Grid";

import Plotly from 'plotly.js-dist-min'
import createPlotlyComponent from 'react-plotly.js/factory';
import { Box } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";

import RecipeList from './RecipeList';

import SVGDownload from './SVGDownload'
import CSVDownload, {
    convertObjToCsv,
} from "./CSVDownload";

const Plot = createPlotlyComponent(Plotly);

const descriptions = {
    "ghge": "Greenhouse Gas Emissions (Kg of CO₂ eq)",
    "fww": "Fresh Water Withdrawls (L)",
    "landUse": "Land Use (m²)",
    "acid": "Acidifying Emissions (g of SO₂ eq)",
    "swwu": "Stress Weighted Water Use (L)",
    "ee": "Eutrophying Emissions (g PO₄³⁻ eq)"
}

const IndicatorOverview = (props) => {

    const overview = useSelector(state => state.overview);

    const fieldSources = props.field + "_sources";
    const fieldDiet = props.field + "_suitable_for";

    const ghgeSources = {
        marker: {
            color: "#3a7b8d",
        },
        type: "bar",
        orientation: 'h',
        y: Array.from(Object.keys(overview[fieldSources])).reverse(),
        x: Array.from(Object.values(overview[fieldSources])).reverse(),
    };

    const ghgeSuitableFor = {
        marker: {
            color: "#3a7b8d",
        },
        type: "bar",
        orientation: 'h',
        y: Array.from(Object.keys(overview[fieldDiet])).reverse(),
        x: Array.from(Object.values(overview[fieldDiet])).reverse()
    };

    const layout = {
        margin: { t: 10, b: 50, l: 200 },
        autosize: true,
        height: 450,
        xaxis: {
            fixedrange: true,
            title: descriptions[props.field]
        },
        yaxis: { fixedrange: true }
    };

    return (
        <React.Fragment>

            <Grid
                container
                direction="row"
                spacing={3}
                alignItems="flex-start">

                <Grid item xs={12}>
                    <Typography variant={"h6"} style={{ paddingBottom: 3 }}>
                        Median {descriptions[props.field]} per Portion
                    </Typography>
                </Grid>

                <Grid item xs={6}>
                    <Typography variant={"h6"} style={{ paddingBottom: 3 }}>
                        per Source
                        <SVGDownload id="bySource" filename={props.field+"_by_source.svg"} />
                        <SVGDownload id="bySource" type="PNG" filename={props.field+"_by_source.png"} />
                        <CSVDownload filename={props.field+"_by_source"} method={convertObjToCsv(overview[fieldSources], ["source", props.description])} />
                    </Typography>
                    <Plot divId="bySource" style={{ width: "100%" }} data={[ghgeSources]} layout={layout} config={{ responsive: true, 'displayModeBar': false }} />
                </Grid>

                <Grid item xs={6}>
                    <Typography variant={"h6"} style={{ paddingBottom: 3 }}>
                        per Diet
                        <SVGDownload id="byDiet" filename={props.field+"_by_diet.svg"} />
                        <SVGDownload id="byDiet" type="PNG" filename={props.field+"_by_diet.png"} />
                        <CSVDownload filename={props.field+"_by_diet"} method={convertObjToCsv(overview[fieldDiet], ["diet", props.description])} />
                    </Typography>
                    <Plot divId="byDiet" style={{ width: "100%" }} data={[ghgeSuitableFor]} layout={layout} config={{ responsive: true, 'displayModeBar': false }} />
                </Grid>

            </Grid>

            <Box mt={6}/>

            <Typography variant="body1">Selected recipes sorted by decreasing {descriptions[props.field]}</Typography>
            
            <RecipeList query={props.query} indicator={props.field} descriptions={descriptions}/>

        </React.Fragment>

    )
}

export default IndicatorOverview;