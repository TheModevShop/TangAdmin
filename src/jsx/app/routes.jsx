import React from 'react';
import {Route, Redirect} from 'react-router';

function getComponents(cb) {
  require.ensure([], (require) => {
    cb(null, require('./Application'));
  });
}

function getChildRoutes(state, cb) {
  require.ensure([], (require) => {
    cb(null, [
      require('./pages/Login/routes'),
      require('./pages/GymOwner/routes'),
    ]);
  });
}

export default (
  <Route getComponents={getComponents} getChildRoutes={getChildRoutes} />
);