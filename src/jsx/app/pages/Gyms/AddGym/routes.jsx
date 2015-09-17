import React from 'react';
import {Route, Redirect} from 'react-router';

function getComponents(cb) {
  require.ensure([], (require) => {
    cb(null, require('./AddGym'));
  });
}

export default (
  <Route>
    <Route pageName="add-gym" path="/gyms/add-gym" getComponents={getComponents} />
  </Route>
);