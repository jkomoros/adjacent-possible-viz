import {
	LOAD_DATA,
	SomeAction,
	UPDATE_INDEX
} from "../actions.js";

import {
	DataState
} from "../types.js";

const INITIAL_STATE : DataState = {
	data: [],
	//-1 signals it should be the default value, either 0 or the last state
	index: -1,
};

const data = (state : DataState = INITIAL_STATE, action : SomeAction) => {
	switch (action.type) {
	case LOAD_DATA:
		return {
			...state,
			data: action.data,
		};
	case UPDATE_INDEX:
		return {
			...state,
			index: action.index,
		};
	default:
		return state;
	}
};

export default data;
