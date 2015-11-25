import tree from 'state/StateTree';
import xhr from 'utility/xhr';
const BASE = 'www.someurl.com/api/v1'
const authentication = tree.select('authentication');
const awaitingAuthentication = tree.select('awaitingAuthentication');
const resetPassword = tree.select(['views', 'ResetPassword']);

refreshSession();

async function setupSession(session) {
  authentication.set({sessionData: session});
  localStorage.setItem('sessionData', JSON.stringify(session));
  tree.commit();
}

function teardownSession() {
  localStorage.removeItem('sessionData');
  authentication.set({});
  tree.commit();
}

export async function refreshSession() {
  const session = await getSession();
  if (session) {
    setupSession(session);
  } else {
    teardownSession();
  }
}

export async function signIn(data) {
  console.log('login submitted');
  console.log(data);
  setupSession({user: '/dashboard'}); //Check the user type that comes back from the server and render that route
  // awaitingAuthentication.set(true);
  // teardownSession();
  // try {
  //   const session = await xhr('POST', `${BASE}/session`, data);
  //   setupSession(session.data);
  // } catch(err) {
  //   authentication.set({error: 'Error creating session.'});
  // }
  // awaitingAuthentication.set(false);
}

export function signOut() {
  teardownSession();
}

export async function getSession() {
  try {
    const session = await xhr('GET', `${BASE}/session`);
    return session;
  } catch(e) {
    return false;
  }
}
