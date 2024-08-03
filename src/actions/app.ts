import {
	UPDATE_PAGE,
	UPDATE_OFFLINE,
	OPEN_SNACKBAR,
	CLOSE_SNACKBAR,
	SomeAction
} from "../actions.js";

import {
	selectPage,
	selectPageExtra,
	selectRawCurrentDataIndex,
	selectMaxLegalIndex,
} from '../selectors.js';

import {
	ThunkSomeAction
} from "../store.js";

//if silent is true, then just passively updates the URL to reflect what it should be.
export const navigatePathTo = (path : string, silent : boolean) : ThunkSomeAction => (dispatch) => {
	//If we're already pointed there, no need to navigate
	if ('/' + path === window.location.pathname) return;
	if (silent) {
		window.history.replaceState({}, '', path);
		return;
	}
	window.history.pushState({}, '', path);
	dispatch(navigate(path));
};

export const canonicalizePath = () : ThunkSomeAction => (dispatch ,getState) => {
	const state = getState();
	const page = selectPage(state);
	const pageExtra = selectPageExtra(state);
	const index = selectRawCurrentDataIndex(state);
	const maxIndex = selectMaxLegalIndex(state);

	let path = page + '/';
	
	if (page == 'main') {
		//If we're max index, then leave it off the URL, so we'll just naturally be whatever the highest state is
		if (index >= 0 && index != maxIndex) path += index;
	} else {
		path += pageExtra;
	}

	dispatch(navigatePathTo(path, true));
};

export const navigate = (path : string) : ThunkSomeAction => (dispatch) => {
	// Extract the page name from path.
	const page = path === "/" ? "main" : path.slice(1);

	// Any other info you might want to extract from the path (like page type),
	// you can do here
	dispatch(loadPage(page));
};

const loadPage = (location : string) : ThunkSomeAction => (dispatch) => {

	const pieces = location.split('/');

	let page = pieces[0];
	let pageExtra = pieces.length < 2 ? '' : pieces.slice(1).join('/');

	switch(page) {
	case "main":
		import("../components/main-view.js");
		break;
	default:
		page = "view404";
		import("../components/my-view404.js");
	}

	dispatch(updatePage(page, pageExtra));
};

const updatePage = (page : string, pageExtra : string) : SomeAction => {
	return {
		type: UPDATE_PAGE,
		page,
		pageExtra,
	};
};

let snackbarTimer : number;

export const showSnackbar = () : ThunkSomeAction => (dispatch) => {
	dispatch({
		type: OPEN_SNACKBAR
	});
	window.clearTimeout(snackbarTimer);
	snackbarTimer = window.setTimeout(() =>
		dispatch({ type: CLOSE_SNACKBAR }), 3000);
};

export const updateOffline = (offline : boolean) : ThunkSomeAction => (dispatch, getState) => {
	// Show the snackbar only if offline status changes.
	if (offline !== getState().app.offline) {
		dispatch(showSnackbar());
	}
	dispatch({
		type: UPDATE_OFFLINE,
		offline
	});
};
