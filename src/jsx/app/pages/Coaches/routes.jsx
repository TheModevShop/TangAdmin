import React from 'react';
import {Route, Redirect} from 'react-router';

function getComponents(cb) {
  require.ensure([], (require) => {
    cb(null, require('./Coaches'));
  });
}

export default (
  <Route>
    <Route pageName="coaches" path="/coaches" getComponents={getComponents} />
  </Route>
);