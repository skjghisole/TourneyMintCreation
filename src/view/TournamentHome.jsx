import React, { Component } from 'react';
import { TextField, Grid, Button } from '@material-ui/core';
import { Link } from 'react-router-dom';

class TournamentHome extends Component {
    constructor(props){
        super();
        this.state = {

        }
    }

    handleChange = name => event => {
        this.setState({
          [name]: event.target.value,
        });
      };
    
    

    render() {
        return (
            <Grid container direction="column" justify="center" alignItems="center">
                <Grid item sm={6}>
                    <TextField onChange={this.handleChange("url")} placeholder={"Address Here"}/>
                </Grid>
                <Grid item sm={6}>
                    <Button component={Link} to={`/tournament/${this.state.url}`}>Link Me!</Button>
                </Grid>
            </Grid>
        )
    }
}

export default TournamentHome;