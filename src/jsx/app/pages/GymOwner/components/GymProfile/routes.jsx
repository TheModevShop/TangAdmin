import React from 'react';
import {Route, Redirect} from 'react-router';

function getComponents(cb) {
  require.ensure([], (require) => {
    cb(null, require('./GymProfile'));
  });
}

export default (
  <Route>
    <Route pageName="gym-profile" path="/gym-owner/gym-profile" getComponents={getComponents} />
  </Route>
);