namespace WebAtoms {
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