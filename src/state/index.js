import Baobab from 'baobab';
import AccountFacet from './facets/accountFacet';

const sessionData = localStorage.getItem('sessionData');

const tree = new Baobab({
  gymProfile: {
    name: 'Jons Gym',
    profileImg: 'profile_img.png',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    link: 'http://www.espn.com',
    images: [
              {url: 'https://cdn.tutsplus.com/net/uploads/legacy/958_placeholders/placehold.gif'},
              {url: 'https://cdn.tutsplus.com/net/uploads/legacy/958_placeholders/placehold.gif'},
              {url: 'https://cdn.tutsplus.com/net/uploads/legacy/958_placeholders/placehold.gif'},
              {url: 'https://cdn.tutsplus.com/net/uploads/legacy/958_placeholders/placehold.gif'}
            ],
    phone: '9378305639',
    address: {
      line1: '1234 ABC Street',
      line2: 'Suite 1000',
      city: 'Austin',
      state: 'Texas',
      zip: '78701'
    }

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