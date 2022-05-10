import React from "react";
import { useSelector } from "react-redux";

import { select } from "d3-selection";

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


import ReactWordcloud from 'react-wordcloud';


import SVGDownload from './SVGDownload'
import CSVDownload, {
    convertDistToCsv,
    convertObjToCsv,
    convertSunburstToCsv
} from "./CSVDownload";

const Plot = createPlotlyComponent(Plotly);

//#6cbb31

const IndicatorOverview = (props) => {

    const overview = useSelector(state => state.overview);

    const fieldSources = props.field+"_sources";
    const fieldDiet = props.field+"_suitable_for";

    const ghgeSources = {
        marker: {
            color: "#3a7b8d",
        },
        type: "bar",
        orientation: 'h',
        y: Array.from(Object.keys(overview[fieldSources])).reverse(),
        x: Array.from(Object.values(overview[fieldSources])).reverse()
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
                    <Plot divId={fieldSources} style={{ width: "100%" }} data={[ghgeSources]} layout={{ margin: { t: 10, b: 20, l: 200 }, autosize: true, height: 450, xaxis: { fixedrange: true }, yaxis: { fixedrange: true } }} config={{ responsive: true, 'displayModeBar': false }} />
                </Grid>

                <Grid item xs={6}>
                    <Typography variant={"h6"} style={{ paddingBottom: 3 }}>
                        per Diet
                    </Typography>
                    <Plot divId={fieldDiet} style={{ width: "100%" }} data={[ghgeSuitableFor]} layout={{ margin: { t: 10, b: 20, l: 200 }, autosize: true, height: 450, xaxis: { fixedrange: true }, yaxis: { fixedrange: true } }} config={{ responsive: true, 'displayModeBar': false }} />
                </Grid>

            </Grid>

        </React.Fragment>

    )
}

export default IndicatorOverview;