import React, { useState, useRef } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles, responsiveFontSizes } from '@material-ui/core/styles';
import Copyright from '../utils/copyright';
import { sha256 } from 'js-sha256';
import { Redirect } from 'react-router-dom';
import { Snackbar } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';


const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
  },
  image: {
    backgroundImage: 'url(https://source.unsplash.com/random)',
    backgroundRepeat: 'no-repeat',
    backgroundColor:
      theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function SignInSide(props) {
  const classes = useStyles();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [err, setErr] = useState(false);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setErr(false);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const req = {
      username: sha256(username),
      password: sha256(password)
    };
    console.log(req);
    const res = await fetch("/v1/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req)
    });
    res.json().then(d => {
      //console.log(d);
      props.signIn(sha256(password));
      if(!d.err){
        setErr(false);
        setRedirect(true);
      }
      else{
        setErr(true);
      }
    });
  }

  return redirect ? (<Redirect to="/"/>) : (
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} className={classes.image} />
      <Snackbar open={err} autoHideDuration={6000} onClose={handleClose}>
        <Alert variant="filled" onClose={handleClose} severity="error">
          Authorized User
        </Alert>
      </Snackbar>
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <form className={classes.form} noValidate>
            <TextField
              onChange={e => {setUsername(e.target.value)}}
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
            />
            <TextField
              onChange={e => {setPassword(e.target.value)}}
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            {/*<FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />*/}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={submitHandler}
            >
              Sign In
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="https://www.linkedin.com/in/alexwang990311/" variant="body2">
                  Contact developer
                </Link>
              </Grid>
              <Grid item>
                {/*
                <Link href="#" variant="body2">
                  {"Sign up"}
                </Link>
                */}
              </Grid>
            </Grid>
            <Box mt={5}>
              <Copyright />
            </Box>
          </form>
        </div>
      </Grid>
    </Grid>
  );
}