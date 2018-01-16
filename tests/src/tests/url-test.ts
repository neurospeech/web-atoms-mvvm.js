@Category("Url Tests")
class UrlTests extends TestItem {

    @Test("Url Test")
    urlSplit(): void {
        debugger;
        var url:AtomUri = new AtomUri("something?a=b&c=d");
    }

}