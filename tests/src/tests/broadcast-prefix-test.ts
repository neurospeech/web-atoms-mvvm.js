namespace WebAtoms {

	@Category("Broadcast Prefix")
	export class BroadcastTest extends TestItem {

		@Test("Prefix")
		async prefix(): Promise<any> {

			var svm:SourceViewModel = new SourceViewModel();

			var dvm:DestinationViewModel = new DestinationViewModel();

			await svm.waitForReady();
			await dvm.waitForReady();

			svm.channelPrefix = "c";

			var t: Task = new Task();
			t.label = "new";

			svm.task = t;

			Assert.isFalse(dvm.task ? true : false);

			dvm.channelPrefix = "c";

			t = new Task();
			t.label = "c";

			svm.task = t;

			Assert.equals(svm.task.label, dvm.task.label);


		}

	}

}