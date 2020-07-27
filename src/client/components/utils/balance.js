import React, { useState, useEffect } from 'react';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Title from './title';
import moment from 'moment';
import { Container, Grid } from '@material-ui/core';

function preventDefault(event) {
  event.preventDefault();
}

const useStyles = makeStyles({
  depositContext: {
    flex: 1,
  },
});

export default function Balance(props) {
    const classes = useStyles();
    const [data, setData] = useState("");

    useEffect(() => {
        fetch(`/v1/stats/sale`)
        .then(res => res.json())
        .then(d => {
            setData(d);
        })
        .catch(err => {
            console.log(err);
        });
    }, []);

    const date = new Date();
    return (
        <React.Fragment>
        <Title>Balance</Title>
        <Typography component="p" variant="h4">
            {data.balance}
        </Typography>
        <Grid container direction="row" spacing = {2}>
            <Grid item>
                <Title>Reveue</Title>
            </Grid>
            <Grid item>
                <Typography component="p" variant="h6">
                    {data.revenue}
                </Typography>
            </Grid>
        </Grid>
        <Grid container direction="row" spacing = {2}>
            <Grid item>
                <Title>Profit</Title>
            </Grid>
            <Grid item>
                <Typography component="p" variant="h6">
                    {data.profit}
                </Typography>
            </Grid>
        </Grid>
        <Typography color="textSecondary" className={classes.depositContext}>
            {`on ${moment().format("MMM D YYYY")}`}
        </Typography>
        </React.Fragment>
    );
}