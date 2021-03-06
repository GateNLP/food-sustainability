import React, { Component } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";
import Paper from '@material-ui/core/Paper';
import Grid from "@material-ui/core/Grid";
import Link from "@material-ui/core/Link";
import { Box } from "@material-ui/core";

import Checkbox from '@material-ui/core/Checkbox';
import { FormControlLabel } from "@material-ui/core";

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import Typography from "@material-ui/core/Typography";

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
      hasMore: true,
      showVegan: true,
      showVegetarian: true,
      showOmnivores: true
    }

    let url = endpoint + "/recipes?"
      + "query=" + encodeURIComponent(this.props.query || "")
      + "&indicator=" + this.props.indicator
      + "&portion="+ (this.props.analyse === "portion");

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

  handleOmnivores = (event) => {
    this.setState({...this.state, showOmnivores: event.target.checked});
    this.fetchMoreData();
  }

  handleVegetarian = (event) => {
    this.setState({...this.state, showVegetarian: event.target.checked});
    this.fetchMoreData();
  }

  handleVegan = (event) => {
    this.setState({...this.state, showVegan: event.target.checked});
    this.fetchMoreData();
  }

  display = (i) => {

    if (!this.state.showVegan && i.suitable_for.includes("vegans")) return "none";

    if (!this.state.showVegetarian && !i.suitable_for.includes("vegans") && i.suitable_for.includes("vegetarians")) return "none";

    if (!this.state.showOmnivores && i.suitable_for.length === 1) return "none";

    return "block";
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
      <React.Fragment>
        Show Recipes Suitable For: <FormControlLabel control={<Checkbox onChange={this.handleOmnivores} checked={this.state.showOmnivores} />} label="Omnivores" />
        <FormControlLabel control={<Checkbox onChange={this.handleVegetarian} checked={this.state.showVegetarian} />} label="Vegetarians" />
        <FormControlLabel control={<Checkbox onChange={this.handleVegan} checked={this.state.showVegan} />} label="Vegans" />

        <InfiniteScroll
          dataLength={this.state.items.length}
          next={this.fetchMoreData}
          hasMore={this.state.hasMore}
          loader={<h4>Loading...</h4>}
          height={this.props.height ? this.props.height : 600}


          style={{ overflowY: "scroll", margin: "auto" }}>

          {this.state.items.map((i, index) => (

            <div style={{...style, display: this.display(i)}} key={index}>
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
                        {i.suitable_for.includes("vegetarians") ? <span title="suitable for vegetarians" style={{ color: "green" }}>???</span> : null}
                        {i.suitable_for.includes("vegans") ? <span title="suitable for vegans" style={{ paddingLeft: "0.5ex" }}>????</span> : null}
                      </span>
                    </Typography>
                  </Grid>

                  {i.serves ?
                    <Grid item xs={12} style={{ textAlign: "right" }}>
                      Serves: {i.serves}
                    </Grid> : <Box mt={3} />}

                  {i.ingredientlist ?
                    <Grid item xs={12} style={{ textAlign: "left" }}>
                      Ingredients:
                      {i.ingredientlist.map((ingredient, key) => (
                        <React.Fragment key={key}>{key !== 0 ? ", " : ""} <Link href="#" onClick={(e) => { e.preventDefault(); this.props.addToQuery(ingredient); }}>{ingredient}</Link></React.Fragment>
                      ))}
                    </Grid> : null}

                  {i.cookingmethodlist ?
                    <Grid item xs={12} style={{ textAlign: "left" }}>
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
      </React.Fragment>
    );
  }
}

export default RecipeList