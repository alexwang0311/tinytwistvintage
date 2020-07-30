import React, { useState } from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';

import Dashboard from './components/pages/dashboard';
import Store from "./components/pages/store";
import Order from './components/pages/order';
import Inventory from './components/pages/inventory';
import SignInSide from './components/pages/signin';

const MyApp = () => {
  const data = localStorage.getItem("password");
  const [signedIn, setSignedIn] = useState(data);

  const signInHandler = (d) => {
    //console.log(`sign in status: ${d}`);
    localStorage.setItem("password", d);
    setSignedIn(d);
    //console.log(signedIn);
  };

  const isSignedIn = () => {return signedIn == "f0f6f0099a18c32189697c8e7dab8ca1a19a54a2372f312810a401de31f4346b";};

  return (
    <BrowserRouter>
      <Route exact path="/" render={p => {
        //console.log("/ called", isSignedIn());
        return isSignedIn() ? <Dashboard /> : <Redirect to="/signin" />
      }}/>
      <Route exact path="/signin" render={p => {
        //console.log("/signin called.", isSignedIn());
        return isSignedIn() ? <Redirect to="/" /> : <SignInSide {...p} signIn = {signInHandler} />
      }} />
      <Route exact path="/inventory" render={p => {
        //console.log("/inventory called.", isSignedIn());
        return isSignedIn() ? <Inventory {...p} signedIn = {signedIn}/> : <Redirect to="/signin" />
      }}/>
      <Route exact path="/store" render={p => {
        //console.log("/store called.", isSignedIn());
        return isSignedIn() ? <Store /> : <Redirect to="/signin" />
      }}/>
      <Route exact path="/order" render={p => {
        //console.log("/order called", isSignedIn());
        return isSignedIn() ? <Order /> : <Redirect to="/signin" />
      }}/>
    </BrowserRouter>
  );
};

render(<MyApp />, document.getElementById("mainDiv"));
