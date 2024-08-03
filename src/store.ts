import {
	createStore,
	compose,
	applyMiddleware,
	combineReducers,
	Reducer
} from 'redux';

import { 
	thunk,
	ThunkAction,
	ThunkMiddleware
} from 'redux-thunk';

import {
	SomeAction
} from './actions.js';

import {
	RootState,
	AppState,
	DataState
} from './types.js';

import app from "./reducers/app.js";
import data from "./reducers/data.js";

declare global {
	interface Window {
		process?: object;
		DEBUG_STORE: object;
		__REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
	}
  }

// Sets up a Chrome extension for time travel debugging.
// See https://github.com/zalmoxisus/redux-devtools-extension for more information.
const devCompose = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const store = createStore(
	combineReducers({
		app,
		data
	}) as Reducer<Partial<{ app: AppState; data: DataState; }>, SomeAction>,
	// Apply thunk middleware
	devCompose(
		//Install thunk middleware expecting RootState and SomeAction.
		applyMiddleware(thunk as ThunkMiddleware<RootState, SomeAction>),
	)
);

export type ThunkSomeAction = ThunkAction<void, RootState, undefined, SomeAction>;

export const getState = () : RootState => store.getState() as RootState;