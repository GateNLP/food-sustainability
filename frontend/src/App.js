import React, { useRef } from "react";

import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Grid from "@material-ui/core/Grid";

import Paper from '@material-ui/core/Paper';

import { Box, Tab, Button, TextField, Select, MenuItem, FormControl, InputLabel } from "@material-ui/core";
import { TabContext, TabList, TabPanel } from "@material-ui/lab";

import { getIndexOverview } from "./actions";

import LinearProgress from "@material-ui/core/LinearProgress";

import { useDispatch, useSelector } from "react-redux";


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

  var overview = useSelector(state => state.overview);
  const query = useSelector(state => state.query);

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

          <Link href="https://gate-socmedia.group.shef.ac.uk/" target="_blank"><UoSLogo style={{ paddingRight: 40 }} /></Link>
          <Link href="https://www.city.ac.uk/" target="_blank"><CityUoLLogo style={{ paddingRight: 20 }} /></Link>

        </Grid>

        <Box mt={6} />

        {overview === null ?
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
                  label="Ingredients"
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
                  <MenuItem value={"portion"}>Portions</MenuItem>
                  <MenuItem value={"recipe"}>Recipes</MenuItem>
                </TextField> <Button style={{ verticalAlign: "bottom" }} size="large" variant="contained" color="primary" onClick={() => update()}>Update</Button> <Button style={{ verticalAlign: "bottom" }} size="large" variant="contained" color="secondary" onClick={() => reset()}>Reset</Button>
              </Grid>
            </Grid>
            <Box mt={6} />

            <Typography variant="h5">Summarizing {overview.total.toLocaleString()} recipes which match the query.</Typography>
            <Box mt={6} />
            <IndexOverview addToQuery={addToQuery} analyse={analyse}/>

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
          <Typography variant="overline" paragraph>This tool has been developed with a <Link href="https://www.alprofoundation.org/project/communicating-the-environmental-impact-of-plant-based-recipes/" target="_blank">research grant</Link> from the <Link href="https://www.alprofoundation.org/" target="_blank">Alpro Foundation</Link></Typography>
          <Typography variant="overline">Logo By <Link href="https://commons.wikimedia.org/w/index.php?curid=10574216">DarKobra</Link> - DeviantArt, CC BY-SA 3.0</Typography>
        </Box>
      </Container>
    </MuiThemeProvider>
  );
}

export default App;
