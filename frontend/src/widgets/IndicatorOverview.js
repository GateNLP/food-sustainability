import React from "react";
import { useSelector } from "react-redux";

import Grid from "@material-ui/core/Grid";

import Plotly from 'plotly.js-dist-min'
import createPlotlyComponent from 'react-plotly.js/factory';

import Typography from "@material-ui/core/Typography";

import SVGDownload from './SVGDownload'
import CSVDownload, {
    convertObjToCsv,
} from "./CSVDownload";

const Plot = createPlotlyComponent(Plotly);

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
            title: props.description
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
                        Median {props.description} per Portion
                    </Typography>
                </Grid>

                <Grid item xs={6}>
                    <Typography variant={"h6"} style={{ paddingBottom: 3 }}>
                        per Source
                    </Typography>
                    <Plot divId={fieldSources} style={{ width: "100%" }} data={[ghgeSources]} layout={layout} config={{ responsive: true, 'displayModeBar': false }} />
                </Grid>

                <Grid item xs={6}>
                    <Typography variant={"h6"} style={{ paddingBottom: 3 }}>
                        per Diet
                    </Typography>
                    <Plot divId={fieldDiet} style={{ width: "100%" }} data={[ghgeSuitableFor]} layout={layout} config={{ responsive: true, 'displayModeBar': false }} />
                </Grid>

            </Grid>

        </React.Fragment>

    )
}

export default IndicatorOverview;