import React from 'react';
import {Route} from 'react-router';
import authOnEnter from 'utility/authOnEnter';


function getComponents(cb) {
  require.ensure([], (require) => {
    cb(null, require('./GymOwner'));
  });
}

function getChildRoutes(state, cb) {
  require.ensure([], (require) => {
    cb(null, [
      require('./components/GymProfile/routes'),
      require('./components/Transactions/routes'),
      require('./components/Coaches/routes'),
      require('./components/Classes/routes')
    ]);
  });
}

const onEnter = authOnEnter('login');

export default (
  <Route pageName="gym-owner" getComponents={getComponents} getChildRoutes={getChildRoutes} onEnter={onEnter}/>
);