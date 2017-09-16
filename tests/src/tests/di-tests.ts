@DIGlobal
class DateTimeService{

    get now(): Date{
        return new Date();
    }

}


class MockDateTimeService extends DateTimeService{

    constructor(){
        super();
        this.current = new Date();
    }

    current: Date

    get now():Date{
        return this.current;
    }

}



@Category("DI Tests")
class DITests extends TestItem{


    @Test("Resolve Test")
    async resolveTest(){
        var ts1 = WebAtoms.DI.resolve(DateTimeService);
        var ts2 = WebAtoms.DI.resolve(DateTimeService);

        Assert.isTrue(ts1 === ts2);

        var d1 = ts1.now;
        
        await this.delay(100);

        var d2 = ts2.now;

        Assert.isTrue(d1.getTime() !== d2.getTime());

        WebAtoms.DI.push(DateTimeService, new MockDateTimeService());

        var mts1 = WebAtoms.DI.resolve(DateTimeService);

        Assert.isTrue(ts1 !== mts1);

        var mts2 = WebAtoms.DI.resolve(DateTimeService);
        
        Assert.isTrue(mts1 === mts2);

        d1 = mts1.now;
        
        await this.delay(100);

        d2 = mts2.now;

        Assert.isTrue(d1.getTime() === d2.getTime());

        WebAtoms.DI.pop(DateTimeService);

        var ts3 = WebAtoms.DI.resolve(DateTimeService);        

        Assert.isTrue(ts1 === ts3);
        
    }


}