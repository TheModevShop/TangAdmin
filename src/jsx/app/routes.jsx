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
      require('pages/Login/routes'),
      require('./pages/Classes/routes'),
      require('./pages/Coaches/routes'),
      require('./pages/Dashboard/routes'),
      require('./pages/GymProfile/routes'),
      require('./pages/Transactions/routes'),
      require('./pages/Gyms/routes'),
      require('./pages/Gyms/AddGym/routes')
    ]);
  });
}

export default (
  <Route getComponents={getComponents} getChildRoutes={getChildRoutes} />
);