import React, { Fragment } from 'react';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch
} from 'react-router-dom';
import Items from '../pages/Items';
import Home from '../pages/Home';
import Share from '../pages/Share';
import Profile from '../pages/Profile';

export default () => (
  <Fragment>
    <Router>
      {/* @TODO: Add your menu component here */}
      <Switch>
        <Route exact path='/items' component={Items} />
        {/* <Route exact path='/home' component={Home} /> */}
        <Route exact path='/share' component={Share} />
        <Route exact path='/profile' component={Profile} />
        <Route exact path='/profile/:id' component={Profile} />
        <Redirect from='*' to='/items' />
      </Switch>
    </Router>
  </Fragment>
);
