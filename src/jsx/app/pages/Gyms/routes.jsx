import React from 'react';
import Gyms from './Gyms';
import GymsProfile from './GymsProfile';
import {Route, Redirect} from 'react-router';


export default (
  <Route>
    <Route pageName="gyms" path="/gyms" component={Gyms} />
    <Route pageName="gyms" path="/gyms/:id" component={GymsProfile} />
  </Route>
);