import React, { Component } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";
import Paper from '@material-ui/core/Paper';
import Grid from "@material-ui/core/Grid";
import Link from "@material-ui/core/Link";
import { Box } from "@material-ui/core";

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import Typography from "@material-ui/core/Typography";
import { grey } from "@material-ui/core/colors";

const style = {
  padding: 8,
  marginBottom: 4,
  textAlign: "center",
  width: "calc(100% - 20px)"
};

const endpoint = ".";//process.env.REACT_APP_CONVERSATION_API

const fields = {
  "ghge": "totalghge",
  "fww": "totalfreshwaterwithdrawals",
  "landUse": "totallanduse",
  "acid": "totalacidifyingemissions",
  "swwu": "totalstressweightedwateruse",
  "ee": "totaleutrophyingemissions"
};

class RecipeList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      items: [],
      hasMore: true
    }

    let url = endpoint + "/recipes?"
      + "query=" + encodeURIComponent(this.props.query || "")
      + "&indicator=" + this.props.indicator;

    axios.get(url)
      .then((response) => {
        this.setState({
          items: response.data.recipes,
          total: response.data.total,
          hasMore: response.data.recipes.length < response.data.total,
          scroll_id: response.data.scroll_id
        });
      }, (error) => {
        console.log(error)
      });

  }

  fetchMoreData = () => {

    if (this.state.items.length >= this.state.total) {
      this.setState({
        hasMore: false
      })

      return
    }

    axios.get(
      endpoint + "/recipes/scroll?id=" + this.state.scroll_id
    )
      .then((response) => {
        // if we didn't hit an error then set the state with the relevant data
        this.setState({
          items: this.state.items.concat(response.data),
        })

        //TODO check what the response looks like for deleted tweet? is it an error code
        //     or a success but with a deleted message in the HTML
      }, (error) => {
        // for now just log the error to the console
        console.log(error);
      });
  }

  render() {
    return (
      <InfiniteScroll
        dataLength={this.state.items.length}
        next={this.fetchMoreData}
        hasMore={this.state.hasMore}
        loader={<h4>Loading...</h4>}
        height={this.props.height ? this.props.height : 600}


        style={{ overflowY: "scoll", margin: "auto" }}>

        {this.state.items.map((i, index) => (

          <div style={style} key={index}>
            <Paper style={{ padding: 10, marginTop: 10, marginBottom: 5, textAlign: "center" }}>

              <Grid
                container
                spacing={0}
                direction="row"
                alignItems="flex-start"
              >

                <Grid item xs={12} style={{ textAlign: "left" }}>
                  <Typography variant="h6">
                    {i.url ?
                      <Link href={i.url} target="_blank">{i.title}</Link>
                      : <span>{i.title}</span>} <span style={{ color: "grey" }}>({i.source})</span>

                    <span style={{ float: "right", fontSize: "1.2em" }}>
                      {i.suitable_for.includes("vegetarians") ? <span title="suitable for vegetarians" style={{ color: "green" }}>Ⓥ</span> : null}
                      {i.suitable_for.includes("vegans") ? <span title="suitable for vegans" style={{ paddingLeft: "0.5ex" }}>🌱</span> : null}
                    </span>
                  </Typography>
                </Grid>

                {i.serves ?
                  <Grid item xs={12} style={{ textAlign: "right" }}>
                    Serves: {i.serves}
                  </Grid> : <Box mt={3} />}

                {i.ingredientlist ?
                  <Grid item xs={12} style={{ textAlign: "left" }}>
                    Ingredients: {i.ingredientlist?.join(", ")}
                  </Grid> : null}

                {i.cookingmethodlist ?
                  <Grid item xs={10} style={{ textAlign: "left" }}>
                    Cooking Methods: {i.cookingmethodlist?.join(", ")}
                  </Grid> : null}

                <Grid item xs={12}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Indicator (per {this.props.analyse})</TableCell>
                        <TableCell>Lower Bound</TableCell>
                        <TableCell>Value</TableCell>
                        <TableCell>Upper Bound</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.keys(this.props.descriptions).map((field, key) => (
                        <TableRow key={key}>
                          <TableCell style={{ fontStyle: field === this.props.indicator ? "italic" : "normal" }}>{this.props.descriptions[field]}</TableCell>
                          <TableCell style={{ fontStyle: field === this.props.indicator ? "italic" : "normal" }} >{(i[fields[field] + "_lower" + (this.props.analyse === "portion" ? "/portion" : "")] || i[fields[field] + (this.props.analyse === "portion" ? "/portion" : "") + "_lower"])?.toLocaleString()}</TableCell>
                          <TableCell style={{ fontStyle: field === this.props.indicator ? "italic" : "normal" }} >{i[fields[field] + (this.props.analyse === "portion" ? "/portion" : "")]?.toLocaleString()}</TableCell>
                          <TableCell style={{ fontStyle: field === this.props.indicator ? "italic" : "normal" }} >{(i[fields[field] + "_upper" + (this.props.analyse === "portion" ? "/portion" : "")] || i[fields[field] + (this.props.analyse === "portion" ? "/portion" : "") + "_upper"])?.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Grid>

              </Grid>

            </Paper>
          </div>
        ))}
      </InfiniteScroll>
    );
  }
}

export default RecipeList