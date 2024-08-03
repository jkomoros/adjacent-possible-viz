import { createSelector } from "reselect";

import {
	FrameCollection
} from "./frame.js";

import {
	RootState
} from "./types.js";

const selectRawMapData = (state : RootState) => state.data ? state.data.data : [];
export const selectRawCurrentDataIndex = (state : RootState) => state.data ? state.data.index : 0;

export const selectPage = (state : RootState) => state.app ? state.app.page : '';
export const selectPageExtra = (state : RootState) => state.app ? state.app.pageExtra : '';

const selectFrameCollection = createSelector(
	selectRawMapData,
	(rawMapData) => new FrameCollection(rawMapData)
);

export const selectCurrentDataIndex = createSelector(
	selectRawCurrentDataIndex,
	selectFrameCollection,
	(rawIndex, collection) => {
		if (rawIndex >= 0) return rawIndex;
		if (collection.length == 0) return 0;
		return collection.length - 1;
	}
);

export const selectMaxLegalIndex = createSelector(
	selectFrameCollection,
	(collection) => collection.length - 1
);

export const selectExpandedCurrentMapData = createSelector(
	selectFrameCollection,
	selectCurrentDataIndex,
	(visualizationCollection, currentIndex) => {
		const data = visualizationCollection.frameForIndex(currentIndex);
		return data ? data.expandedData : null;
	}
);