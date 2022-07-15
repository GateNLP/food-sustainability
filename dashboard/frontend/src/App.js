import React, { useRef } from "react";

import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Grid from "@material-ui/core/Grid";

import Paper from '@material-ui/core/Paper';

import { Box, Tab, Button, TextField, MenuItem } from "@material-ui/core";
import { TabContext, TabList, TabPanel } from "@material-ui/lab";

import { getIndexOverview } from "./actions";

import LinearProgress from "@material-ui/core/LinearProgress";

import { useDispatch, useSelector } from "react-redux";


import IndexOverview from './widgets/IndexOverview';
import IndicatorOverview from './widgets/IndicatorOverview';

import { MuiThemeProvider } from "@material-ui/core";
import { createTheme } from "@material-ui/core/styles";

import { ReactComponent as UoSLogo } from "./images/UoS_Crest.svg"
import { ReactComponent as CityUoLLogo } from "./images/City-London.svg"
import { ReactComponent as DashboardLogo } from "./images/Nature.svg"

import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';

import Alert from '@material-ui/lab/Alert';

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
      contrastText: '#fff',
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


  var overview = useSelector(state => state.overview);
  const query = useSelector(state => state.query);
  const failure = useSelector(state => state.failure);

  const [analyse, setAnalyse] = React.useState(useSelector(state => state.analyse));

  const handleAnalysisChange = (event) => {
    setAnalyse(event.target.value);
  };

  if (query == null && (overview === null || overview === undefined)) {
    dispatch(getIndexOverview())
  }

  const dashboardQuery = useRef(query || "");

  const reset = () => {
    overview = null;
    setValue('1');
    dispatch(getIndexOverview());
  }

  const update = () => {
    overview = null;
    setValue('1');
    dispatch(getIndexOverview(dashboardQuery.current.value, analyse));
  }

  const addToQuery = (restriction) => {
    var regex = new RegExp(restriction + '([\\s\\b]|$)', "gim");
    if (dashboardQuery.current.value.match(regex) === null)
      dashboardQuery.current.value = dashboardQuery.current.value + " " + restriction;
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

          <Link href="https://gate.ac.uk/" target="_blank"><UoSLogo style={{ paddingRight: 40 }} /></Link>
          <Link href="https://www.city.ac.uk/research/centres/food-policy" target="_blank"><CityUoLLogo style={{ paddingRight: 20 }} /></Link>

        </Grid>

        <Box mt={6} />

        <Grid
          container
          direction="row"
          alignItems="center">
         
          <Accordion elevation={0}>
            <AccordionSummary expandIcon={<div style={{fontSize:"150%", verticalAlign:"bottom"}}>⮋</div>}>
              <Typography variant={"body1"}>This dashboard provides ways to explore the economic, health and environmental impacts of a database of
                recipes collected from 4 websites: BBC Good Food, Albert Heijn/Allerhande, AllRecipes.com and Kochbar.</Typography>

            </AccordionSummary>
            <AccordionDetails>
              <Typography variant={"body1"} paragraph>The data presented in this dashboard is sourced from <Link href="https://science.sciencemag.org/content/360/6392/987" targte="_blank">the work of Joseph
                Poore and Thomas Nemecek</Link> and are the global mean values across 38,700 commercially viable farms, from 119 countries. There can be large differences in the impacts of the same products
                from different producers. This can be the result of specific production methods, or simply regional differences in terms of the efficiency of production. For this reason we show the mean
                values along with the 5th and 95th percentiles of producing this recipe at a global level.  What we find is that there can be a large difference between the 'best' and 'worst' versions of a
                recipe. This means there is an opportunity to reduce the impacts of recipes by optimizing for the lowest-impact producers. However, what is also clear is that this does not change the ordering
                of the impacts of different foods in recipes - e.g. animal food based recipes have a higher carbon footprint than plant-based alternatives, even if we opt for the lowest-impact producers.
                Unfortunately, data is not available to present this breakdown by country or region.</Typography>
            </AccordionDetails>
          </Accordion>

        </Grid>

        <Box mt={6} />

        {failure ?
          <Alert severity="error">Unfortunately an error occured retrieving the analysed recipes. Please try again later.</Alert>
          :

          overview === null ?
            <LinearProgress />
            :
            <React.Fragment>

              <Grid
                container
                direction="row"
                spacing={3}
                alignItems="center">

                <Grid item xs>
                  <TextField
                    id="dashboardQuery"
                    inputRef={dashboardQuery}
                    defaultValue={query || ""}
                    fullWidth
                    variant="outlined"
                    label="Using These Ingredients"
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        update();
                      }
                    }}
                  />
                </Grid>

                <Grid item>
                  {/*
                  Should really be a select element but it doesn't display properly. work around from
                  https://github.com/mui/material-ui/issues/17890
                */}
                  <TextField
                    label="Analyse"
                    select
                    value={analyse}
                    onChange={handleAnalysisChange}
                    variant="outlined"
                    style={{ marginRight: "1em" }}>
                    <MenuItem value={"portion"}>per Portion</MenuItem>
                    <MenuItem value={"recipe"}>per Recipe</MenuItem>
                  </TextField> <Button style={{ verticalAlign: "bottom" }} size="large" variant="contained" color="primary" onClick={() => update()}>Update</Button> <Button style={{ verticalAlign: "bottom" }} size="large" variant="contained" color="secondary" onClick={() => reset()}>Reset</Button>
                </Grid>
              </Grid>
              <Box mt={6} />

              <Typography variant="h5">Summarizing {overview.total.toLocaleString()} recipes which match the query.</Typography>
              <Box mt={6} />
              <IndexOverview addToQuery={addToQuery} analyse={analyse} />

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
                      <Tab label="Greenhouse Gas Emissions" value="1" style={{ minWidth: 50 }} />
                      <Tab label="Fresh Water Withdrawals" value="2" style={{ minWidth: 50 }} />
                      <Tab label="Land Use" value="3" style={{ minWidth: 50 }} />
                      <Tab label="Acidifying Emissions" value="4" style={{ minWidth: 50 }} />
                      <Tab label="Stress Weighted Water Use" value="5" style={{ minWidth: 50 }} />
                      <Tab label="Eutrophying Emissions" value="6" style={{ minWidth: 50 }} />
                    </TabList>
                  </Grid>
                  <Grid item xs={12}>
                    <TabPanel value="1"><IndicatorOverview addToQuery={addToQuery} analyse={analyse} query={query} field="ghge" description={"Greenhouse Gas Emissions (Kg of CO₂ eq)"} /></TabPanel>
                    <TabPanel value="2"><IndicatorOverview addToQuery={addToQuery} analyse={analyse} query={query} field="fww" description={"Fresh Water Withdrawals (L)"} /></TabPanel>
                    <TabPanel value="3"><IndicatorOverview addToQuery={addToQuery} analyse={analyse} query={query} field="landUse" description={"Land Use (m²)"} /></TabPanel>
                    <TabPanel value="4"><IndicatorOverview addToQuery={addToQuery} analyse={analyse} query={query} field="acid" description={"Acidifying Emissions (g of SO₂ eq)"} /></TabPanel>
                    <TabPanel value="5"><IndicatorOverview addToQuery={addToQuery} analyse={analyse} query={query} field="swwu" description={"Stress Weighted Water Use (L)"} /></TabPanel>
                    <TabPanel value="6"><IndicatorOverview addToQuery={addToQuery} analyse={analyse} query={query} field="ee" description={"Eutrophying Emissions (g PO₄³⁻ eq)"} /></TabPanel>
                  </Grid>
                </Grid>
              </TabContext>

            </React.Fragment>
        }
        <Box mt={6} style={{ textAlign: "center" }}>
          <Typography variant="overline" paragraph style={{ paddingLeft: "10em", paddingRight: "10em" }}>Development of this tool has been funded by a <Link href="https://www.alprofoundation.org/project/communicating-the-environmental-impact-of-plant-based-recipes/" target="_blank">research grant</Link> from the <Link href="https://www.alprofoundation.org/" target="_blank">Alpro Foundation</Link> and by <Link href="https://www.ukri.org/councils/research-england/" target="_blank">Research England</Link> via The University of Sheffield's Internal Knowledge Exchange Scheme</Typography>
          <Typography variant="overline">Logo By <Link href="https://commons.wikimedia.org/w/index.php?curid=10574216">DarKobra</Link> - DeviantArt, CC BY-SA 3.0</Typography>
        </Box>
      </Container>
    </MuiThemeProvider>
  );
}

export default App;
