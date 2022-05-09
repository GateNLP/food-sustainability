import React from "react";
import { useSelector } from "react-redux";

import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";

import { Box, Tab, Divider, Button } from "@material-ui/core";
import { TabContext, TabList, TabPanel } from "@material-ui/lab";

import Plotly from 'plotly.js-dist-min'
import createPlotlyComponent from 'react-plotly.js/factory';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import Typography from "@material-ui/core/Typography";

import SVGDownload from './SVGDownload'
import CSVDownload, {
    convertDistToCsv,
    convertObjToCsv,
    convertSunburstToCsv
} from "./CSVDownload";

const Plot = createPlotlyComponent(Plotly);

//#6cbb31

const IndexOverview = (props) => {

    const overview = useSelector(state => state.overview);

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

    const ghgeSources = {
        name: "Median GHGE/Portion per Source",
        marker: {
            color: "#3a7b8d",
        },
        type: "bar",
        orientation: 'h',
        y: Array.from(Object.keys(overview.ghge_sources)).reverse(),
        x: Array.from(Object.values(overview.ghge_sources)).reverse()
    };

    const ghgeSuitableFor = {
        name: "Median GHGE/Portion per Suitable For",
        marker: {
            color: "#3a7b8d",
        },
        type: "bar",
        orientation: 'h',
        y: Array.from(Object.keys(overview.ghge_suitable_for)).reverse(),
        x: Array.from(Object.values(overview.ghge_suitable_for)).reverse()
    };

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
                    <Typography variant={"h6"} style={{ paddingBottom: 3 }}>
                        Median GHGE (Kg of CO<sub>2</sub> eq) per Portion
                    </Typography>
                </Grid>

                <Grid item xs={6}>
                    <Typography variant={"h6"} style={{ paddingBottom: 3 }}>
                        per Source
                    </Typography>
                    <Plot divId="ghge-sources" style={{ width: "100%" }} data={[ghgeSources]} layout={{ margin: { t: 10, b: 20, l: 200 }, autosize: true, height: 450, xaxis: { fixedrange: true }, yaxis: { fixedrange: true } }} config={{ responsive: true, 'displayModeBar': false }} />
                </Grid>

                <Grid item xs={6}>
                    <Typography variant={"h6"} style={{ paddingBottom: 3 }}>
                        per Diet
                    </Typography>
                    <Plot divId="ghge-suitable-for" style={{ width: "100%" }} data={[ghgeSuitableFor]} layout={{ margin: { t: 10, b: 20, l: 200 }, autosize: true, height: 450, xaxis: { fixedrange: true }, yaxis: { fixedrange: true } }} config={{ responsive: true, 'displayModeBar': false }} />
                </Grid>

            </Grid>
        </React.Fragment>

    )
}

export default IndexOverview;