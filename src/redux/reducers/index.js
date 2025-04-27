import { combineReducers } from 'redux'

const context = require.context('./', false, /\.js$/);
const keys = context.keys().filter(item => !item.includes('index.js'));

const reducers = {};
keys.forEach(key => {
  reducers[key.match(/\/(\w+)\.js/)[1]] = context(key).default;
});

export default combineReducers(reducers);