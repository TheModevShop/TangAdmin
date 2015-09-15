import React from 'react';
import {Route, Redirect} from 'react-router';

function getComponents(cb) {
  require.ensure([], (require) => {
    cb(null, require('./Transactions'));
  });
}

export default (
  <Route>
    <Route pageName="transactions" path="/gym-owner/transactions" getComponents={getComponents} />
  </Route>
);