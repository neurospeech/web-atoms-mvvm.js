declare namespace WebAtoms {
	
	export class AtomControl {

		_element:HTMLElement;

		constructor(e:HTMLElement);

		init(): void;

		dispose(): void;

		createChildren():void;

		bindEvent(e:HTMLElement, eventName: string, methodName: (string|Function), key?: string, method?:Function):void;

		
		viewModel:any;
	}
}