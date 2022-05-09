import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import Grid from "@material-ui/core/Grid";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import { Box, Button, TextField, CircularProgress } from "@material-ui/core";

import { getIndexOverview } from "./actions";

import LinearProgress from "@material-ui/core/LinearProgress";

import Alert from '@material-ui/lab/Alert';

import { useDispatch, useSelector } from "react-redux";
import React, { useState } from "react";

import IndexOverview from './widgets/IndexOverview';

import { MuiThemeProvider } from "@material-ui/core";
import { createTheme } from "@material-ui/core/styles";

import { ReactComponent as UoSLogo } from "./images/UoS_Crest.svg"
import { ReactComponent as CityUoLLogo } from "./images/city-uol-logo.svg"
import { ReactComponent as DashboardLogo } from "./images/Tomato.svg"

const theme = createTheme({
  palette: {
    primary: {
      light: '#5cdbe6',
      main: '#6cbb31',
      dark: '#007984',
      contrastText: '#fff',
    },
    secondary: {
      main: '#d2a030',
      contrastText: '#fff'
    },
    error: {
      main: 'rgb(198,57,59)'
    }
  }
});

function App() {

  const dispatch = useDispatch();

  const overview = useSelector(state => state.overview);

  if (overview === null || overview === undefined) {
    dispatch(getIndexOverview())
  }



  return (
    <MuiThemeProvider theme={theme}>
      <Container>
        <Box my={4} />



        <Grid
          container
          direction="row"
          alignItems="center"
        >
          <Typography variant="h4" color={'primary'} style={{ flex: 1 }}>
            <DashboardLogo style={{ height: "1.5em", verticalAlign: "middle", paddingRight: "1ex" }} />
            Food Sustainability Dashboard
          </Typography>

          <Link href="https://gate-socmedia.group.shef.ac.uk/" target="_blank"><UoSLogo style={{ paddingRight: 40 }} /></Link>
          <Link href="https://www.city.ac.uk/" target="_blank"><CityUoLLogo style={{ paddingRight: 20 }} /></Link>

        </Grid>

        {overview === null ?
          <LinearProgress />
          :
          <React.Fragment>
            <Typography variant="body1">Index contains {overview.total.toLocaleString()} recipes.</Typography>

            <IndexOverview />
          </React.Fragment>
        }
        <Box mt={6} style={{ textAlign: "center" }}>
          <Typography variant="overline">This tool has been developed with a <Link href="https://www.alprofoundation.org/project/communicating-the-environmental-impact-of-plant-based-recipes/" target="_blank">research grant</Link> from the <Link href="https://www.alprofoundation.org/" target="_blank">Alpro Foundation</Link></Typography>
        </Box>
      </Container>
    </MuiThemeProvider>
  );
}

export default App;
