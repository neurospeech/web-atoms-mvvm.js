declare class AtomUI {
	static createControl(e:HTMLElement, ctrl: (string | {new (e:any)})): WebAtoms.AtomControl;
}

declare class AtomBinder {

	static getClone(a:any): any;

	static add_CollectionChanged(target: any, f: Function): void;
	static remove_CollectionChanged(target: any, f: Function): void;

	static add_WatchHandler(target: any, key: string, f:Function): void;
	static remove_WatchHandler(target: any, key: string, f:Function): void;

	static invokeItemsEvent(targe: any, key: string, index: number, item:any ):void;

	static setValue(target:any, key: string, value: any): void;

	static getValue(target:any, key: string): any;
}

declare class AtomPromise {
	static json(url: string, query: any, options: WebAtoms.Rest.AjaxOptions): AtomPromise;

	abort(): void;
	then(f:Function): AtomPromise;
	failed(f:Function): AtomPromise;
	showError(v:boolean): void;
	showProgress(v:boolean): void;
	invoke(s:string): void;
	value(v?:any):any;

	error: { msg?:string };
}


namespace WebAtoms {

	export declare class AtomControl {

		_element:HTMLElement;

		constructor(e:HTMLElement);

		init(): void;

		dispose(e?:HTMLElement): void;

		createChildren():void;

		bindEvent(e:HTMLElement, eventName: string, methodName: (string|Function), key?: string, method?:Function):void;

		unbindEvent(e:HTMLElement, eventName: string, methodName: (string | Function), key?: string): void;

		bind(e:HTMLElement,
			key: string,
			value: (Array<string[]> | string[]),
			twoWays?: boolean , vf?: () => any,
			events?: string | string[] ): void;

		viewModel:any;

		setLocalValue(key:any,value:any,element:any,refresh:boolean):void;
	}

	export declare class AtomItemsControl extends AtomControl {
		items: any;
		selectedItem: any;
		readonly selectedItems: any[];

		itemTemplate: any;
		itemsPresenter: any;
	}

	export declare class AtomListBox extends AtomItemsControl {

	}

	var oldFunction:(target:any, key: string, value:any) => void = AtomBinder.setValue;
	AtomBinder.setValue = (target:any, key: string, value: any) => {
		target._$_supressRefresh = target._$_supressRefresh || {};
		target._$_supressRefresh[key] = 1;
		try {
			oldFunction(target,key,value);
		} finally {
			target._$_supressRefresh[key] = 0;
		}
	};

	/**
	 * Core class as an replacement for jQuery
	 * @class Core
	 */
	export class Core {

		static addClass(e:HTMLElement, c: string): void {
			var ex: string = e.className;
			var exa: string[] = ex ? ex.split(" ") : [];
			if( exa.find(f => f === c) ) {
				return;
			}
			exa.push(c);
			e.className = exa.join(" ");
		}

		static removeClass(e:HTMLElement, c: string): void {
			var ex: string[] = (e.className || "").split(" ");
			if(ex.length === 0) {
				return;
			}
			ex = ex.filter(cx => cx !== c);
			e.className = ex.join(" ");
		}

		static atomParent(element:any): AtomControl {
			if (element.atomControl) {
				return element.atomControl;
			}
			if (element === document || element === window || !element.parentNode) {
				return null;
			}
			return Core.atomParent(element._logicalParent || element.parentNode);
		}

		static hasClass(e:HTMLElement, className: string): any {
			return e.classList.contains(className);
        }

		static getOffsetRect(e:HTMLElement): Rect {
			var r:Rect = {
				x: e.offsetLeft,
				y: e.offsetTop,
				width: e.offsetWidth,
				height: e.offsetHeight
			};

			if(e.offsetParent) {
				var rp:Rect = Core.getOffsetRect(e.offsetParent as HTMLElement);
				r.x += rp.x;
				r.y += rp.y;
			}

			return r;
		}

	}


	export type Rect = {
		x: number,
		y: number;
		width: number;
		height: number;
	};

}