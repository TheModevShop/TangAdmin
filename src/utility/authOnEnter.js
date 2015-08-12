export default function authOnEnter(redirect) {
  return function onEnter(nextState, transition, callback) {
    // if (!localStorage.getItem('sessionData')) {
    //   transition.to(redirect);
    // }
    callback();
  };
}