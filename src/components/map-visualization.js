/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { LitElement, html, css } from "lit-element";
import { repeat } from "lit-html/directives/repeat";

import {
	EMPTY_EXPANDED_MAP_DATA
} from "../map-data.js";

// This is a reusable element. It is not connected to the store. You can
// imagine that it could just as well be a third-party element that you
// got from someone else.
class MapVisualization extends LitElement {
	static get properties() {
		return {
			data: { type: Object },
		};
	}

	static get styles() {
		return [
			css`
				:host {
					--cell-margin: 0.2em;
					--effective-cell-size: var(--cell-size, 3.0em);
					--total-cell-width: calc(var(--effective-cell-size) + (2 * var(--cell-margin)));
				}

				.container {
					display: flex;
					flex-wrap: wrap;
					width: var(--container-size);
				}

				.cell {
					height: var(--effective-cell-size);
					width: var(--effective-cell-size);
					
					margin: var(--cell-margin);
					border-radius: calc(var(--effective-cell-size) / 2);
					box-sizing: border-box;
					overflow: hidden;
					position:relative;
				}

				.cell div.inner {
					background-color: white;
				}

				.cell div {
					position: absolute;
					top: 0;
					left: 0;
					height: 100%;
					width: 100%;
				}

				.cell div.color {
					background-color: var(--positive-cell-color, #38761D);
				}

				.cell div.negative {
					background-color: var(--negative-cell-color, #CC0000);
				}

				.cell.highlighted {
					border: 0.25em solid var(--highlighted-cell-color, white);
				}

				.cell.captured {
					border: 0.25em solid var(--captured-cell-color, black);
				}
			`
		];
	}

	render() {
		return html`
			<style>
				:host {
					--container-size: calc(${this._cleanData.cols} * var(--total-cell-width));
				}
			</style>
			<div class='container'>
				${repeat(this._cleanData.cells,item => "" + item.row + "-" + item.col, item => this._htmlForCell(item))}
			</div>
		`;
	}

	_htmlForCell(cell) {
		const fillOpacity = cell.fillOpacity === undefined ? cell.autoOpacity : cell.fillOpacity;
		const strokeOpacity = cell.strokeOpacity === undefined ? cell.autoOpacity : cell.strokeOpacity;
		return html`<div class='cell ${cell.highlighted ? "highlighted" : ""} ${cell.captured ? 'captured' : ''}' style='opacity:${strokeOpacity}'><div class='inner' style='opacity:${fillOpacity}'><div class='color ${cell.value < 0.0 ? "negative" : ""}' style='opacity:${Math.abs(cell.value)}'></div></div></div>`;
	}

	get _cleanData() {
		return this.data || EMPTY_EXPANDED_MAP_DATA;
	}
}

window.customElements.define("map-visualization", MapVisualization);
