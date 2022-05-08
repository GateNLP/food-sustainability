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

import { getIndexOverview } from "./actions";

import LinearProgress from "@material-ui/core/LinearProgress";

import Alert from '@material-ui/lab/Alert';

import {useDispatch, useSelector} from "react-redux";
import React, {useState} from "react";

import IndexOverview from './widgets/IndexOverview';

function App() {

  const dispatch = useDispatch();

  const overview = useSelector(state => state.overview);

  if (overview === null || overview === undefined) {
    dispatch(getIndexOverview())
  }
  
  if (overview === null || overview === undefined)
    return (<LinearProgress/>)


  return (
    
    <Container>
       <Box my={4}/>
            <IndexOverview/>
            <Box mt={6} style={{textAlign: "center"}}>
<Typography variant="overline">This tool has been developed with a <Link href="https://www.alprofoundation.org/project/communicating-the-environmental-impact-of-plant-based-recipes/" target="_blank">research grant</Link> from the <Link href="https://www.alprofoundation.org/" target="_blank">Alpro Foundation</Link></Typography>
</Box>
            </Container>  
  );
}

export default App;
