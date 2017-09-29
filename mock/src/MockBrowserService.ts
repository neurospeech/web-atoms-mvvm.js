namespace WebAtoms {
	/**
	 * BrowserService provides access to browser attributes
	 * such as title of current window, location etc.
	 *
	 * @export
	 * @class BrowserService
	 */
	export class MockBrowserService {

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

		private _title:string = null;

		/**
		 * Get current window title
		 *
		 * @type {string}
		 * @memberof BrowserService
		 */
		get title():string {
			return this._title;
		}

		/**
		 * Set current window title
		 * @memberof BrowserService
		 */
		set title(v:string) {
			this._title = v;
		}


		private _location:AtomLocation = {};

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
			return this._location;
		}

		/**
		 * Navigate current browser to given url.
		 * @param {string} url
		 * @memberof BrowserService
		 */
		navigate(url:string):void {
			this._location.href = url;
		}

		private static _appScope:any = {};

		/**
		 * Get access to available appScope from Web Atoms.
		 * @readonly
		 * @type {*}
		 * @memberof BrowserService
		 */
		get appScope(): any{
			// tslint:disable-next-line:no-string-literal
			return MockBrowserService._appScope;
		}
	}
}