import Baobab from 'baobab';
import AccountFacet from './facets/accountFacet';

const sessionData = localStorage.getItem('sessionData');

const tree = new Baobab({
  gymProfile: {
    gymName: 'Jons Gym'
  },
  authentication: {
    sessionData: sessionData ? JSON.parse(sessionData) : null
  },
  awaitingAuthentication: false,
  views: {
    CreateAccount: {
      awaitingSave: false,
      serverResponse: {}
    },
  }
}, {
  AccountFacet: AccountFacet
});

export default tree;