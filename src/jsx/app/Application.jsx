import classNames from 'classnames';
import SidebarMixin from 'global/jsx/sidebar_component';
import PropTypes from 'baobab-react/prop-types';

import Header from 'common/header';
import Sidebar from 'common/sidebar';
import Footer from 'common/footer';

import Baobab from 'baobab';
import React from 'react';
import {root} from 'baobab-react/higher-order';
import tree from 'state'

class Body extends React.Component {
  render() {
    return (
      <Container id='body'>
        {this.props.children}
      </Container>
    );
  }
}

class App extends React.Component {
  render() {
    var classes = classNames({
      'container-open': this.props.open
    });
   var route = _.reduce(_.get(this.context.router, 'state.branch'), function(accum, route) {
     if (route.pageName) {
       accum += route.pageName + ' ';
     }
     return accum;
   }, '');
    
    return (
      <Container id='container' className={classes}>
        <Header/>
        {
          route === 'login' ? <Sidebar/> : null
        }
        <Body>{this.props.children}</Body>
        <Footer />
      </Container>
    );
  }
}

App.contextTypes = {
  router: React.PropTypes.object
};


export default root(App, tree);