import React from 'react';
import {Route, Redirect} from 'react-router';

function getComponents(cb) {
  require.ensure([], (require) => {
    cb(null, require('./Dashboard'));
  });
}

export default (
  <Route>
    <Route pageName="dashboard" path="/dashboard" getComponents={getComponents} />
  </Route>
);