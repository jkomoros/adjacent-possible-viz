import {
	LOAD_DATA,
	SomeAction,
	UPDATE_INDEX
} from "../actions.js";

import {
	canonicalizePath
} from './app.js';

import {
	selectCurrentDataIndex,
	selectMaxLegalIndex
} from '../selectors.js';

import {
	ConfigData
} from "../types.js";

import {
	ThunkSomeAction
} from "../store.js";

export const loadData = (data : ConfigData) : SomeAction => {
	return {
		type: LOAD_DATA,
		data,
	};
};

export const nextIndex = () : ThunkSomeAction => (dispatch, getState) => {
	let currentIndex = selectCurrentDataIndex(getState());
	currentIndex++;
	if (currentIndex > selectMaxLegalIndex(getState())) return;
	dispatch(updateIndex(currentIndex));
};

export const prevIndex = () : ThunkSomeAction => (dispatch, getState) => {
	let currentIndex = selectCurrentDataIndex(getState());
	currentIndex--;
	if (currentIndex < 0) return;
	dispatch(updateIndex(currentIndex));
};

export const updateIndex = (index : number) : ThunkSomeAction => (dispatch) => {
	dispatch({
		type: UPDATE_INDEX,
		index,
	});
	dispatch(canonicalizePath());
};
