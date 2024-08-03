import {
	SomeAction
} from "../actions.js";

import {
	UPDATE_PAGE,
	UPDATE_OFFLINE,
	OPEN_SNACKBAR,
	CLOSE_SNACKBAR,
} from "../actions.js";

import {
	AppState
} from "../types.js";

const INITIAL_STATE : AppState = {
	page: "",
	pageExtra: "",
	offline: false,
	snackbarOpened: false,
};

const app = (state : AppState = INITIAL_STATE, action : SomeAction) => {
	switch (action.type) {
	case UPDATE_PAGE:
		return {
			...state,
			page: action.page,
			pageExtra: action.pageExtra,
		};
	case UPDATE_OFFLINE:
		return {
			...state,
			offline: action.offline
		};
	case OPEN_SNACKBAR:
		return {
			...state,
			snackbarOpened: true
		};
	case CLOSE_SNACKBAR:
		return {
			...state,
			snackbarOpened: false
		};
	default:
		return state;
	}
};

export default app;
