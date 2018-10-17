import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Grid } from '@material-ui/core';


const Home = () => <Grid container direction="center" justify="center" alignItems="center">
    <Button to="/create" component={Link}>
        Create
    </Button>
    <Button to="/tournament" component={Link}>
        Tournament
    </Button>
</Grid>

export default Home;