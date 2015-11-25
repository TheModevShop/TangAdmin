import Baobab from 'baobab';
import getInitialState from './InitialState';

const {cursors, facets} = getInitialState();
const tree = new Baobab(cursors, facets);

export default tree;