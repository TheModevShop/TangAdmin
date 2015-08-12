'use strict';

import React from 'react';
import {render} from 'react-dom';
import {Router} from 'react-router';
import {history} from 'react-router/lib/HashHistory';
import routes from './routes';

function onUpdate(...args) {
  $('body').removeClass('fade-out');
}

React.render(<Router history={history} onUpdate={onUpdate}>{routes}</Router>, document.getElementById('app-container'));