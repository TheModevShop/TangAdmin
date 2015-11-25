const req = require.context('./facets', false, /\.js$/);
const facets = {};
req.keys().forEach((path) => {
  const fileName = path.match(/\.\/(.*)/)[1];
  facets[fileName.replace('Facet.js', '')] = req(path)();
});



export default function getInitialState() {
  const sessionData = localStorage.getItem('sessionData');
  return {
    cursors: {
      views: {
        GymList: null,
        GymProfile: {
          Profile: null,
          ActiveId: null
        },
        AddGym: {},
        CreateAccount: {
          awaitingSave: false,
          serverResponse: {}
        },
      },
      authentication: {
        sessionData: sessionData ? JSON.parse(sessionData) : null
      },
      awaitingAuthentication: false,
    },
    facets: {facets: facets}
  };
}


