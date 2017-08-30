# Web Atoms MVVM

Web Atoms MVVM Pattern Library

* Support for ViewModel
* Support for Commands
* Support for Message Broadcast/Subscriptions for communication between ViewModels
* Support for REST Service similar to Retro Fit

# Installation

## Dependency

Web Atoms script has to be added on the page before using `Web Atoms MVVM`

## CDN in Production

    <script 
    src="//cdn.jsdelivr.net/npm/web-atoms-mvvm@1.0.15/web-atoms-mvvm.min.js">

## NPM Package

    npm install web-atoms-mvvm    

## All Samples are in TypeScript

# Sample REST Service

```typescript

    var BaseService = WebAtoms.BaseService;

    class BackendService extends BaseService{

        @Get("/tasks")
        getTasks(
            @Query("deleted") deleted: boolean ):Promise<Task[]>{
            return null;
        }

        @Get("/task/{taskId}")
        getTask(
            @Path("taskId") taskId:number): Promise<Task>{
            return null;
        }

        @Put("/task/{taskId}")
        saveTask(
            @Path("taskId") taskId: number, 
            @Body("") task:Task):Promise<Task>
        {
            return null;
        }

        @Delete("/task/{taskId}")
        deleteTask(
            @Path("taskId") taskId: number
        ):Promise<any>{
            return null;
        }

    }

```

# Sample View Model 

```typescript

    var AtomViewModel = WebAtoms.AtomViewModel;
    var AtomList = WebAtoms.AtomList;
    var AtomCommand = WebAtoms.AtomCommand;
    

    class Task{
        @bindableProperty;
        id: number;

        @bindableProperty
        label:String;

    }

    class TaskViewModel extends AtomViewModel{
        
        @bindableProperty
        list:AtomList<Task>;

        @bindableProperty
        newItem:Task;

        addCommand: AtomCommand<any>;
        removeCommand: AtomCommand<Task>

        backendService: BackendService;

        constructor(){
            this.list = new AtomList<Task>();
            this.newItem = new Task();
            this.addCommand = new AtomCommand(a => onAddCommand());
            this.removeCommand = new AtomCommand(task => 
                onRemoveCommand(task);)

            this.backendService = new BackendService();
        }

        async init():Promise<any>{
            var results = await this.backendService.getTasks(false);
            this.list.addAll(results);
        }

        async addCommand():Promise<any>{

            if(!this.newItem.label){
                this.broadcast(
                    "ui-notification",
                    new AtomNotification(
                        "Task cannot be empty",
                        "Error"
                    ));
                return;
            }

            this.newItem = 
                await this.backendService.saveTask(this.newItem);

            this.list.add(this.newItem);
            this.newItem = new Task();

        }

        async removeCommand(task:Task):Promise<any>{

            await this.backendService.deleteTask(task.id);

            this.list.remove(task);
        }

    }
```

# Sample Broadcast Listener

Let's assume, you have a Atom Component that displays notifications.
And you have set `atom-view-model` to `NotificationServiceViewModel`

```typescript

    class AtomNotification {

        static short(message: string, title: string = ""): AtomNotification {
            return new AtomNotification(message, title);
        }

        constructor(
            message: string, 
            title: string, 
            icon: string = null, 
            delay: number = 5000)
        {
            this.message = message;
            this.title = title;
            this.icon = icon || "";
            this.delay = delay || 5000;
        }

        message: string;
        title: string;

        // displayed on left side..
        icon: string;

        // maximum delay to be displayed
        @bindableProperty
        delay: number;

        timeout: number;

    }

    class NotificationServiceViewModel extends AtomViewModel {

        notifications: AtomList<AtomNotification>;

        removeCommand: AtomCommand<AtomNotification>;

        constructor() {
            super();

            this.notifications = new AtomList<AtomNotification>();

            this.removeCommand = new AtomCommand <AtomNotification>(n => this.onRemoveCommand(n));



            // subscribe to UI notifications sent by anyone...
            AtomDevice.instance.subscribe(
                "ui-notification",
                (m, n) => this.onNotified(n as AtomNotification));
        }

        async onRemoveCommand(n: AtomNotification): Promise<any> {
            this.notifications.remove(n);
            if (n.timeout) {
                clearTimeout(n.timeout);
            }
        }

        async onNotified(n: AtomNotification): Promise<any> {
            this.notifications.add(n);
            if (n.delay > 0) {
                this.updateTimer(n);
            }
        }

        private updateTimer(n: AtomNotification): void {
            if (n.delay > 0) {
                n.delay = n.delay - 1000;
                setTimeout(() => this.updateTimer(n), 1000);
            } else {
                this.notifications.remove(n);
            }
        }

    }
```

# Reference

## AtomCommand
```typescript
    class AtomCommand<T>{

        @bindableProperty
        enabled: boolean;

        constructor( action:(T) => any );
    }
```

## AtomModel
```typescript
    class AtomModel{

        // this will notify bindings to refresh the UI
        refresh(field:string);
    }
```

## AtomViewModel
```typescript
    class AtomViewModel extends AtomModel{
        constructor();
        async init();
        dispose();

        // should only be called in constructor
        onMessage<T>(message:string,action:(T)=>any);

        broadcast(message:string,data:any);
    }
```

## AtomDevice
```typescript

    class AtomDevice{

        // only access static instance
        // never create an instance
        static instance:AtomDevice;

        broadcast(message:string, data:any);

        subscribe(message:string, action:(any)=>any );
        unsubscribe(message:action:(any)=>any);

        // takes care of errors
        runAsync<T>(task:Promise<T>):Promise<any>;
    }

```

## AtomList
```typescript

    class AtomList<T>{
        add(item:T):number;
        addAll(items:Array<T>);
        insert(i: number, item: T);
        removeAt(i: number);
        remove(item: T);
        clear();
        
        // refreshes binding
        refresh();        
    }

```


