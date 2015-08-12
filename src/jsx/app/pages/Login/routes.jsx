import React from 'react';
import {Route, Redirect} from 'react-router';

function getComponents(cb) {
  require.ensure([], (require) => {
    cb(null, require('./login'));
  });
}

export default (
  <Route>
    <Route pageName="login" path="/" getComponents={getComponents} />
    <Route pageName="login" path="/login" getComponents={getComponents} />
  </Route>
);