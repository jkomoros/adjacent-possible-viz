import { LitElement, html, css } from "lit-element";
import { connect } from "pwa-helpers/connect-mixin.js";
import { installMediaQueryWatcher } from "pwa-helpers/media-query.js";
import { installOfflineWatcher } from "pwa-helpers/network.js";
import { installRouter } from "pwa-helpers/router.js";
import { updateMetadata } from "pwa-helpers/metadata.js";

// This element is connected to the Redux store.
import { store } from "../store.js";

// These are the actions needed by this element.
import {
	navigate,
	updateOffline,
	updateLayout
} from "../actions/app.js";

// These are the elements needed by this element.
import "./snack-bar.js";

class MyApp extends connect(store)(LitElement) {
	static get properties() {
		return {
			appTitle: { type: String },
			_page: { type: String },
			_snackbarOpened: { type: Boolean },
			_offline: { type: Boolean }
		};
	}

	static get styles() {
		return [
			css`
				:host {
					display: block;
					position: relative;
					width: 100%;
					height: 100%;
				}

				header {
					display: flex;
					flex-direction: column;
					align-items: center;
				}

				.toolbar-list > a {
					display: inline-block;
					color: black;
					text-decoration: none;
					padding: 0 8px;
				}

				.toolbar-list > a[selected] {
					font-weight: bold;
				}

				/* Workaround for IE11 displaying <main> as inline */
				main {
					display: block;
				}

				.page {
					display: none;
				}

				.page[active] {
					display: block;
				}

				footer {
					border-top: 1px solid #ccc;
					text-align: center;
				}

				/* Wide layout */
				@media (min-width: 460px) {
					header {
						flex-direction: row;
					}
				}
			`
		];
	}

	render() {
		// Anything that's related to rendering should be done in here.
		return html`
			<!-- Main content -->
			<main role="main" class="main-content">
				<main-view class="page" ?active="${this._page === "main"}"></main-view>
				<my-view404 class="page" ?active="${this._page === "view404"}"></my-view404>
			</main>
			<snack-bar ?active="${this._snackbarOpened}">
				You are now ${this._offline ? "offline" : "online"}.
			</snack-bar>
		`;
	}

	firstUpdated() {
		installRouter((location) => store.dispatch(navigate(decodeURIComponent(location.pathname))));
		installOfflineWatcher((offline) => store.dispatch(updateOffline(offline)));
		installMediaQueryWatcher("(min-width: 460px)",
			(matches) => store.dispatch(updateLayout(matches)));
	}

	updated(changedProps) {
		if (changedProps.has("_page")) {
			const pageTitle = this.appTitle + " - " + this._page;
			updateMetadata({
				title: pageTitle,
				description: pageTitle
				// This object also takes an image property, that points to an img src.
			});
		}
	}

	stateChanged(state) {
		this._page = state.app.page;
		this._offline = state.app.offline;
		this._snackbarOpened = state.app.snackbarOpened;
	}
}

window.customElements.define("my-app", MyApp);
