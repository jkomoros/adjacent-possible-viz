import { html, css, CSSResultGroup, PropertyValues } from "lit";
import { customElement, state } from 'lit/decorators.js';
import { PageViewElement } from "./page-view-element.js";
import { connect } from "pwa-helpers/connect-mixin.js";

// This element is connected to the Redux store.
import { store } from "../store.js";

import {
	loadData,
	nextIndex,
	prevIndex,
} from "../actions/data.js";

import {
	selectExpandedCurrentMapData,
	selectPageExtra,
	selectCurrentDataIndex,
} from "../selectors.js";

import {
	GIF_COMMAND
} from "../frame.js";

//rendevous point with screenshot service. Duplicated in screenshot.js
const CURRENT_INDEX_VARIABLE = 'current_index';
const PREVIOUS_MAP_VARIABLE = 'previous_map';
const RENDER_COMPLETE_VARIABLE = 'render_complete';
const GIF_NAME_VARIABLE = 'gif_name';

declare global {
	interface Window {
	  [RENDER_COMPLETE_VARIABLE]: boolean;
	  [CURRENT_INDEX_VARIABLE]: number;
	  [PREVIOUS_MAP_VARIABLE]: () => void;
	  [GIF_NAME_VARIABLE]: string | undefined;
	}
  }

window.render_complete = false;

window.previous_map = () => {
	//The main-view will set this high when update is done
	window.render_complete = false;
	store.dispatch(prevIndex());
};


import "./frame-visualization.js";

// These are the shared styles needed by this element.
import { SharedStyles } from "./shared-styles.js";
import { updateIndex } from '../actions/data.js';
import { ConfigData, ExpandedFrameData, RootState } from "../types.js";

const FRAME_DATA_FILE_NAME = 'frame_data.json';
const SAMPLE_FRAME_DATA_FILE_NAME = 'frame_data.SAMPLE.json';

const fetchData = async() => {
	let res : Response | null = null;
	let fetchErrored : Error | null = null;
	try {
		res  = await fetch("/" + FRAME_DATA_FILE_NAME);
	} catch (err : unknown) {
		if (!(err instanceof Error)) throw new Error('Unexpected error');
		fetchErrored = err;
	}

	if (fetchErrored || res === null || !res.ok) {
		console.warn(FRAME_DATA_FILE_NAME + ' not found. Using ' + SAMPLE_FRAME_DATA_FILE_NAME + ' instead.');
		res = await fetch("/" + SAMPLE_FRAME_DATA_FILE_NAME);
	}

	//TODO: verify shape with zod
	const data = await res.json() as ConfigData;

	store.dispatch(loadData(data));
};

@customElement('main-view')
class MainView extends connect(store)(PageViewElement) {

	@state()
		_expandedMapData : ExpandedFrameData | null = null;

	@state()
		_pageExtra : string = '';
	
	@state()
		_currentIndex : number = -1;

	static override get styles(): CSSResultGroup {
		return [
			SharedStyles,
			css`
				:host {
					position:relative;
					height:100vh;
					width: 100vw;
				}
	
				.container {
					display: flex;
					justify-content: center;
					align-items: center;
					height: 100%;
					width: 100%;
					background-color: var(--override-app-background-color, var(--app-background-color, #356F9E));
				}
	
			`
		];
	}

	override firstUpdated() {
		fetchData();
		document.addEventListener('keydown', e => this._handleKeyDown(e));
	}

	_handleKeyDown(e : KeyboardEvent) {
		//We have to hook this to issue content editable commands when we're
		//active. But most of the time we don't want to do anything.
		if (!this.active) return;

		if (e.key == 'ArrowRight') {
			store.dispatch(nextIndex());
		} else if (e.key == 'ArrowLeft') {
			store.dispatch(prevIndex());
		}

	}

	override render() {
		return html`
			<style>
				:host {
					--app-background-color: ${this._backgroundColor}
				}
			</style>
			<div class='container'>
				<frame-visualization .data=${this._expandedMapData}></frame-visualization>
			</div>
		`;
	}

	get _backgroundColor() {
		if (!this._expandedMapData) return 'transparent';
		if (!this._expandedMapData.colors) return 'transparent';
		return this._expandedMapData.colors.background.hex;
	}

	// This is called every time something is updated in the store.
	override stateChanged(state : RootState) {
		this._expandedMapData = selectExpandedCurrentMapData(state);
		this._pageExtra = selectPageExtra(state);
		this._currentIndex = selectCurrentDataIndex(state);

		this.updateComplete.then(() => {
			window[RENDER_COMPLETE_VARIABLE] = true;
		});
	}

	override updated(changedProps : PropertyValues<this>) {
		if (changedProps.has('_pageExtra')) {
			const index = this._pageExtra ? parseInt(this._pageExtra) : -1;
			store.dispatch(updateIndex(index));
		}
		if (changedProps.has('_currentIndex')) {
			window[CURRENT_INDEX_VARIABLE] = this._currentIndex;
		}
		if (changedProps.has('_expandedMapData')) {
			const data : ExpandedFrameData | null = this._expandedMapData;
			if (data) window.gif_name = data.gif;
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'main-view': MainView;
	}
}

