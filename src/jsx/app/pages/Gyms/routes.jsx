import React from 'react';
import {Route, Redirect} from 'react-router';

function getComponents(cb) {
  require.ensure([], (require) => {
    cb(null, require('./Gyms'));
  });
}

export default (
  <Route>
    <Route pageName="gyms" path="/gyms" getComponents={getComponents} />
  </Route>
);