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

import Paper from '@material-ui/core/Paper';

import { Box, Tab, Button, TextField, CircularProgress } from "@material-ui/core";
import { TabContext, TabList, TabPanel } from "@material-ui/lab";

import { getIndexOverview } from "./actions";

import LinearProgress from "@material-ui/core/LinearProgress";

import Alert from '@material-ui/lab/Alert';

import { useDispatch, useSelector } from "react-redux";
import React, { useState } from "react";

import IndexOverview from './widgets/IndexOverview';
import IndicatorOverview from './widgets/IndicatorOverview';

import { MuiThemeProvider } from "@material-ui/core";
import { createTheme } from "@material-ui/core/styles";

import { ReactComponent as UoSLogo } from "./images/UoS_Crest.svg"
import { ReactComponent as CityUoLLogo } from "./images/city-uol-logo.svg"
import { ReactComponent as DashboardLogo } from "./images/Nature.svg"

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

  const [value, setValue] = React.useState('1');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

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
          <Typography variant="h3" color={'primary'} style={{ flex: 1 }}>
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
            <Typography variant="h4">Currently summarizing {overview.total.toLocaleString()} recipes.</Typography>
            <Box mt={6} />
            <IndexOverview />

            <TabContext value={value}>
              <Grid component={Paper}
                container
                direction="row"
                spacing={3}
                alignItems="flex-start">

                <Grid item xs={12} style={{ borderBottom: 1, borderColor: 'silver' }}>
                  <TabList onChange={handleChange}
                    variant="scrollable"
                    scrollButtons="auto">
                    <Tab label="Greenhouse Gas Emmisions" value="1" style={{ minWidth: 50 }} />
                    <Tab label="Fresh Water Withdrawls" value="2"  style={{ minWidth: 50 }} />
                    <Tab label="Land Use" value="3"  style={{ minWidth: 50 }} />
                    <Tab label="Acidifying Emissions" value="4"  style={{ minWidth: 50 }} />
                    <Tab label="Stress Weighted Water Use" value="5"  style={{ minWidth: 50 }} />
                    <Tab label="Eutrophying Emissions" value="6"  style={{ minWidth: 50 }} />
                  </TabList>
                </Grid>
                <Grid item xs={12}>
                  <TabPanel value="1"><IndicatorOverview field="ghge" description={<span>Greenhouse Gas Emmissions (Kg of CO<sub>2</sub> eq)</span>} /></TabPanel>
                  <TabPanel value="2"><IndicatorOverview field="fww" description={<span>Fresh Water Withdrawls (L)</span>} /></TabPanel>
                  <TabPanel value="3"><IndicatorOverview field="landUse" description={<span>Land Use (m<sup>2</sup>)</span>} /></TabPanel>
                  <TabPanel value="4"><IndicatorOverview field="acid" description={<span>Acidifying Emissions (g of SO<sub>2</sub> eq)</span>} /></TabPanel>
                  <TabPanel value="5"><IndicatorOverview field="swwu" description={<span>Stress Weighted Water Use (L)</span>} /></TabPanel>
                  <TabPanel value="6"><IndicatorOverview field="ee" description={<span>Eutrophying Emissions (g PO<sub>4</sub><sup>3-</sup> eq)</span>} /></TabPanel>
                </Grid>
              </Grid>
            </TabContext>
          </React.Fragment>
        }
        <Box mt={6} style={{ textAlign: "center" }}>
          <Typography variant="overline" paragraph>This tool has been developed with a <Link href="https://www.alprofoundation.org/project/communicating-the-environmental-impact-of-plant-based-recipes/" target="_blank">research grant</Link> from the <Link href="https://www.alprofoundation.org/" target="_blank">Alpro Foundation</Link></Typography>
          <Typography variant="overline">Logo By <Link href="https://commons.wikimedia.org/w/index.php?curid=10574216">DarKobra</Link> - DeviantArt, CC BY-SA 3.0</Typography>
        </Box>
      </Container>
    </MuiThemeProvider>
  );
}

export default App;
