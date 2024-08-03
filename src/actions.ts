import {
    ConfigData
} from "./types";

export const UPDATE_PAGE = "UPDATE_PAGE";
export const UPDATE_OFFLINE = "UPDATE_OFFLINE";
export const OPEN_SNACKBAR = "OPEN_SNACKBAR";
export const CLOSE_SNACKBAR = "CLOSE_SNACKBAR";
export const LOAD_DATA = "LOAD_DATA";
export const UPDATE_INDEX = 'UPDATE_INDEX';

type ActionUpdatePage = {
    type: typeof UPDATE_PAGE;
    page: string;
    pageExtra: string;
};

type ActionUpdateOffline = {
    type: typeof UPDATE_OFFLINE;
    offline: boolean;
}

type ActionOpenSnackbar = {
    type: typeof OPEN_SNACKBAR;
}

type ActionCloseSnackbar = {
    type : typeof CLOSE_SNACKBAR;
}

type ActionLoadData = {
    type: typeof LOAD_DATA;
    data: ConfigData
}

type ActionUpdateIndex = {
    type: typeof UPDATE_INDEX;
    index: number;
}

export type SomeAction = ActionUpdatePage 
    | ActionUpdateOffline
    | ActionOpenSnackbar
    | ActionCloseSnackbar
    | ActionLoadData
    | ActionUpdateIndex;