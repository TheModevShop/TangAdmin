import React from 'react';
import {Route, Redirect} from 'react-router';

function getComponents(cb) {
  require.ensure([], (require) => {
    cb(null, require('./Classes'));
  });
}

export default (
  <Route>
    <Route pageName="classes" path="/gym-owner/classes" getComponents={getComponents} />
  </Route>
);