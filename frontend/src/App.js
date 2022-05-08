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

import {Box, Button, TextField, CircularProgress } from "@material-ui/core";

import Alert from '@material-ui/lab/Alert';

import {useDispatch, useSelector} from "react-redux";
import React, {useState} from "react";

import { setInputURL }  from "./actions";

function App() {

  const dispatch = useDispatch();

  const inputUrl = useSelector(state => state.url);
  const loading = useSelector(state => state.loading);

  const error = useSelector(state => state.error);

  const result = useSelector(state => state.response);

  const [userInput, setUserInput] = useState(inputUrl);

  const submitUrl = (src) => {
    dispatch(setInputURL(src))
  };

  const isRecipe = result?.ingredientList && (result?.BBCGoodFood == "Yes" || result?.allRecipes == "Yes");

  const defined = (literal, ...tags) => {

    let str = literal[0];

    for (var i = 0; i < tags.length; i++) {

      // if we have an undefined variable, i.e. something
      // not returned by the GATE app, then don't display
      // anything for this row and just return the empty
      // string, rather than putting 'undefined' in the
      // UI output
      if (tags[i] == undefined)
        return "";

      // if the value is an array then format it nicely
      // as a comma separated list
      if (Array.isArray(tags[i]))
        tags[i] = tags[i].join(", ");

      // now join the tag and literal together as part
      // of the final output string
      str += tags[i] + literal[i + 1];
    }

    return str;
  }

  // define the output rows here in the order you want them
  // the result variable holds the single Result annotation
  // so it's easy enough to pick the features from it and
  // you can combine multiple features into a single row if
  // you need to.
  const rows = {
    "Ingredients": "${result.ingredientList}",
    //"Cooking Method": "${result.cookingMethodList}",
    //"Cooking Time": "${result.cookingTimeList}",
    "GHGE": "${result.TotalGHGE} (${result.TotalGHGE_Lower} to ${result.TotalGHGE_Upper})",
    "GHGE per Portion": "${result['TotalGHGE/portion']} (${result['TotalGHGE_Lower/portion']} to ${result['TotalGHGE_Upper/portion']})",
    "Eutrophying Emissions": "${result.TotalEutrophyingEmissions} (${result.TotalEutrophyingEmissions_Lower} to ${result.TotalEutrophyingEmissions_Upper})",
    "Eutrophying Emissions per Portion": "${result['TotalEutrophyingEmissions/portion']} (${result['TotalEutrophyingEmissions/portion_Lower']} to ${result['TotalEutrophyingEmissions/portion_Upper']})",
    "Acidifying Emissions": "${result.TotalAcidifyingEmissions} (${result.TotalAcidifyingEmissions_Lower} to ${result.TotalAcidifyingEmissions_Upper})",
    "Acidifying Emissions per Portion": "${result['TotalAcidifyingEmissions/portion']} (${result['TotalAcidifyingEmissions_Lower/portion']} to ${result['TotalAcidifyingEmissions_Upper/portion']})",
    "Freshwater Withdrawals": "${result.TotalFreshwaterWithdrawals} (${result.TotalFreshwaterWithdrawals_Lower} to ${result.TotalFreshwaterWithdrawals_Upper})",
    "Freshwater Withdrawals per Portion": "${result['TotalFreshwaterWithdrawals/portion']} (${result['TotalFreshwaterWithdrawals/portion_Lower']} to ${result['TotalFreshwaterWithdrawals/portion_Upper']})",
    "Stress Weighted Water Use": "${result.TotalStressWeightedWaterUse} (${result.TotalStressWeightedWaterUse_Lower} to ${result.TotalStressWeightedWaterUse_Upper})",
    "Stress Weighted Water Use per Portion": "${result['TotalStressWeightedWaterUse/portion']} (${result['TotalStressWeightedWaterUse_Lower/portion']} to ${result['TotalStressWeightedWaterUse_Upper/portion']})",
  }

/**
 * otallanduse (Totallanduse_lower
 to Totallanduse_upper)

totaleutrophyingemissions/portion (...)
totalacidifyingemissions/portion (...)
totalfreshwaterwithdrawals/portion (...)
Totalstressweightedwateruse/portion (...)
 */

  return (
    <Container>
       <Box my={4}/>
    <Card>
                <CardHeader
                    title="What recipe would you like to process?"
                    
                />
                <Box p={3}>
                    <Grid
                        container
                        direction="row"
                        spacing={3}
                        alignItems="center"
                    >
                        <Grid item xs>
                            <TextField
                                id="standard-full-width"
                                label="URL"
                                placeholder="enter the URL of a recipe to process"
                                fullWidth
                                value={userInput || ""}
                                variant="outlined"
                                onChange={e => setUserInput(e.target.value)}
                                onKeyPress={e => {
                                  if (e.key === 'Enter') {
                                      submitUrl(userInput);
                                  }
                                }}
                            />

            
                        </Grid>

                        <Grid item>
                            <Button variant="contained" color="primary" onClick={() => submitUrl(userInput)}>
                                Process
                            </Button>

                        </Grid>


                    </Grid>

                    <Box pt={2}>
                      <Typography variant="body1">Please be aware that some pages may be slow to process, especially if they contain multiple recipes.</Typography>
                    </Box>

                </Box>

                
            </Card>

            <Box m={4}/>

            {loading ?  
              <Typography variant="body1" style={{textAlign: "center"}}><CircularProgress/> Please wait while the recipe is being processed...</Typography>
              :
              null
            }

            {error ? <Alert severity="error">{error}</Alert> : null}

            {result && isRecipe ?
            <Card>
            <CardHeader
                    title={`Recipe for '${result.Title}'`}
                />
                <Box p={3}>
                    <Grid
                        container
                        direction="row"
                        spacing={3}
                        alignItems="center"
                    >
                      <Table >
                        <TableBody>
                          {Object.keys(rows).map((label, key) => (
                            <TableRow key={key}>
                                <TableCell variant="head">{label}</TableCell>
                                <TableCell>{eval("defined`"+rows[label]+"`")}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                    </Grid>
                </Box>
            </Card> : null}

            {result && !isRecipe ?
            <Alert severity="warning">We were unable to extract information from the specified page. Are you sure it contains a recipe?</Alert>
            : null}
            <Box mt={6} style={{textAlign: "center"}}>
<Typography variant="overline">This tool has been developed with a <Link href="https://www.alprofoundation.org/project/communicating-the-environmental-impact-of-plant-based-recipes/" target="_blank">research grant</Link> from the <Link href="https://www.alprofoundation.org/" target="_blank">Alpro Foundation</Link></Typography>
</Box>
            </Container>  

  );
}

export default App;
