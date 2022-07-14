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
    "fww": "Fresh Water Withdrawals (L)",
    "landUse": "Land Use (m²)",
    "acid": "Acidifying Emissions (g of SO₂ eq)",
    "swwu": "Stress Weighted Water Use (L)",
    "ee": "Eutrophying Emissions (g PO₄³⁻ eq)"
}

const faq = {
    "ghge": "This is a measure of the amount of Greenhouse Gasses (GHGs) that are emitted when creating the product. We add up all the GHGs released from the farm through to and including the supermarket shelf using grams of carbon dioxide equivalent, or Kg of CO₂ eq using IPCC (2013) characterization factors with climate-carbon feedbacks.",
    "fww": "This is a measure of water scarcity. We calculate how much freshwater is used from the field, during processing and even water used to clean the processing machine. We look at where it is drawn out of the ground, then multiply it by a number based on how scarce freshwater is at that location.",
    "landUse": "We look at the land used to grow the produce, or rear the animals, and provide an estimate for the amount of land used in this production. ",
    "acid": "This is a measure of the amount of Acidifying Emissions that are emitted when creating the product. Atmospheric emissions of acidifying substances such as sulphur dioxide (SO₂) and nitrogen oxides (NOₓ), can persist in the air for up to a few days and thus can be transported over thousands of kilometres, when they undergo chemical conversion into acids (sulphuric and nitric). The primary pollutants sulphur dioxide, nitrogen dioxide and ammonia (NH₃), together with their reaction products, lead after their deposition to changes in the chemical composition of the soil and surface water. Since the 1970s acidification has been widely recognised as a major threat to the environment.",
    "swwu": "This is a measure that calculates how much water is used in the production of the food. However, this value is weighted by the amount of water 'stress'. Water stress is defined based on the ratio of freshwater withdrawals to renewable freshwater resources. Water stress does not insinuate that a country has water shortages, but does give an indication of how close it may be to exceeding a water basin’s renewable resources.",
    "ee": "This is a measure of the amount of Eutrophying Emissions that are emitted when creating the product. Eutrophication happens when fertiliser or slurry runs off the fields into lakes & rivers, feeding algae which runs wild, robbing those below the surface of oxygen and sunlight. We look at whatever 'eutrophic' substances could be released into the waterways, adding them up using an equivalent measure as there are many types of eutrophic substances."
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
                        Median {descriptions[props.field]} per {props.analyse}
                    </Typography>

                    <Typography variant={"body1"} paragraph>{faq[props.field]}</Typography>
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
            
            <RecipeList addToQuery={props.addToQuery} query={props.query} analyse={props.analyse} indicator={props.field} descriptions={descriptions}/>

        </React.Fragment>

    )
}

export default IndicatorOverview;