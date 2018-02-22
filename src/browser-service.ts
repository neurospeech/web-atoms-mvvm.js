/// <reference path="__di.ts" />

namespace WebAtoms {

	export type AtomLocation = {
		href?: string,
		hash?: string,
		host?: string,
		hostName?: string,
		port?: string,
		protocol?: string
	};


	/**
	 * BrowserService provides access to browser attributes
	 * such as title of current window, location etc.
	 *
	 * @export
	 * @class BrowserService
	 */
	@WebAtoms.DIGlobal
	export class BrowserService {

		/**
		 * DI Resolved instance
		 *
		 * @readonly
		 * @static
		 * @type {BrowserService}
		 * @memberof BrowserService
		 */
		static get instance(): BrowserService {
			return WebAtoms.DI.resolve(BrowserService);
		}

		/**
		 * Get current window title
		 *
		 * @type {string}
		 * @memberof BrowserService
		 */
		get title():string {
			return window.document.title;
		}

		/**
		 * Set current window title
		 * @memberof BrowserService
		 */
		set title(v:string) {
			window.document.title = v;
		}


		/**
		 * Gets current location of browser, this does not return
		 * actual location but it returns values of browser location.
		 * This is done to provide mocking behaviour for unit testing.
		 *
		 * @readonly
		 * @type {AtomLocation}
		 * @memberof BrowserService
		 */
		get location(): AtomLocation {
			return {
				href: location.href,
				hash: location.hash,
				host: location.host,
				hostName: location.hostname,
				port: location.port,
				protocol: location.protocol
			};
		}

		/**
		 * Navigate current browser to given url.
		 * @param {string} url
		 * @memberof BrowserService
		 */
		navigate(url:string):void {
			location.href = url;
		}

		/**
		 * Get access to available appScope from Web Atoms.
		 * @readonly
		 * @type {*}
		 * @memberof BrowserService
		 */
		get appScope(): any {
			// tslint:disable-next-line:no-string-literal
			return window["appScope"];
		}
	}

}