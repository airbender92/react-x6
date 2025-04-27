import { applyMiddleware, compose, createStore} from 'redux'
import rootReducer from '../reducers'
import middlewares from './middlewares'

const store = createStore(rootReducer, {}, compose(applyMiddleware(...middlewares)))

export default store