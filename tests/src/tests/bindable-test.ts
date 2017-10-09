namespace WebAtoms {


	export class Task {
		label: string;
	}

	export class SourceViewModel extends AtomViewModel {


		@bindableBroadcast("task-updated")
		task:Task;

	}

	export class DestinationViewModel extends AtomViewModel {

		@bindableReceive("task-updated")
		task:Task;

	}

	@Category("Bindable")
	export class BindableTest extends TestItem {

		constructor() {
			super();
		}

		@Test("bindable")
		async bindable(): Promise<any> {

			var svm:SourceViewModel = new SourceViewModel();

			var dvm:DestinationViewModel = new DestinationViewModel();

			await svm.waitForReady();

			await dvm.waitForReady();

			var t:Task = new Task();
			t.label = "Test";

			svm.task = t;

			Assert.equals("Test", dvm.task.label);

		}

	}

}