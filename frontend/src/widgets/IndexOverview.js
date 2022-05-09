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

    return (

        <Grid component={Paper}
            container
            direction="row"
            spacing={3}
            alignItems="flex-start">

            <Grid item xs={12}>
                <Typography variant={"h6"} style={{ paddingBottom: 3 }}>Recipes within the index came from the following sources
                    <SVGDownload id="sources" filename="recipe-sources.svg" />
                    <SVGDownload id="sources" type="PNG" filename="recipe-sources.png" />
                    <CSVDownload filename="recipe-sources" method={convertObjToCsv(overview.sources, ["source", "count"])} />
                </Typography>
            </Grid>

            <Grid item xs={6}>
                <Plot divId="sources" style={{ width: "100%" }} data={[recipeSources]} layout={{ showlegend: true, margin: { t: 10, b: 10 }, autosize: true, barmode: "group", xaxis: { fixedrange: true }, yaxis: { fixedrange: true } }} config={{ responsive: false, 'displayModeBar': false }} />
            </Grid>

            <Grid item xs={6}>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Source</TableCell>
                                <TableCell>Recipes (%)</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {recipeSources.labels.map((source, key) => (
                                <TableRow key={key}>
                                    <TableCell>{source}</TableCell>
                                    <TableCell>{recipeSources.values[key].toLocaleString()} ({(100 * recipeSources.values[key] / overview.total).toFixed(2)}%)</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
        </Grid >
    )
}

export default IndexOverview;