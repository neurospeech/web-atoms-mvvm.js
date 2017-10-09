namespace WebAtoms {


	export class Task {
		label: string;
	}

	export class SourceViewModel {


		@bindableBroadcast("task-updated")
		task:Task;

	}

	export class DestinationViewModel {

		@bindableReceive("task-updated")
		task:Task;

	}

	export class BindableTest extends TestItem {

		constructor() {
			super();
		}

	}

}