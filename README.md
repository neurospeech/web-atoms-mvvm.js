# Web Atoms MVVM

Web Atoms MVVM Pattern Library

* Support for ViewModel
* Support for Commands
* Support for Message Broadcast/Subscriptions for communication between ViewModels
* Support for REST Service similar to Retro Fit

# Installation

## Dependency

Please add following Web Atoms to your Html page or Project.

<a href="//github.com/neurospeech/web-atoms.js">`Web Atoms`</a>

## CDN in Production

    <script 
    src="//cdn.jsdelivr.net/npm/web-atoms-mvvm@1.0.16/dist/web-atoms-mvvm.min.js">

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

# Sample HTML
```html

        <div 
            atom-type="AtomApplication"
            atom-view-model="{ new TaskViewModel() }">
            <div>
                <input type="text" 
                    atom-value="$[viewModel.newItem.label]" 
                    placeholder="New Task"/>
                <button 
                        atom-type="AtomButton" 
                        atom-command="{$viewModel.addCommand}">Add Mew</button>
            </div>
                

            <div 
                    atom-type="AtomListBox"
                    atom-items="[$viewModel.list]">
                <div atom-template="itemTemplate">
                    <span atom-text="{$data.label}"></span>
                    <button 
                            atom-type="AtomDeleteButton"
                            atom-command="{$viewModel.removeCommand}"
                            atom-command-parameter="{$data}">Delete</button>
                </div>
            </div>            
        </div>

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
            onMessage<AtomNotification>(
                "ui-notification",
                (m, n) => this.onNotified(n);
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

        // this will reduce delay by 1000 millseconds
        // you can bind `n.delay` to display "Closing in (n) seconds" etc 
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

## Sample Notification UI
```html
    <div 
         atom-type="AtomItemsControl"
         atom-view-model="{ new NotificationServiceViewModel() }"
         atom-items="{$viewModel.notifications}"
         style="position:absolute;top:0;left:0;"
         style-display="[$viewModel.notifications.length ? 'block' : 'none']"
         style-width="100%"
         style-height="100%">

        <div style="margin:200px;position:relative;opacity:0.5;background-color:aquamarine"
             atom-presenter="itemsPresenter">
             <div atom-template="itemTemplate">
                 <div>
                     <span atom-text="{$data.title}"></span>
                     <button 
                             atom-type="AtomButton"
                             atom-command-parameter="{$data}"
                             atom-command="{$viewModel.removeCommand}"
                             >Close</button>
                 </div>
                 <div atom-text="{$data.message}"></div>
                 <div atom-text="['Closing in (' + (($data.delay/1000)+1) + ') seconds.. ']"></div>
             </div>
        </div>

    </div>
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
        onMessage<T>(message:string,action:(msg:string,T)=>any);

        broadcast(message:string,data:any);
    }
```

## AtomDevice
```typescript

    type AtomAction = (msg: string, data: any) => void;

    class AtomDevice{

        // only access static instance
        // never create an instance
        static instance:AtomDevice;

        broadcast(message:string, data:any);

        subscribe(message:string, action:AtomAction ): AtomAction;
        unsubscribe(message:string, action:AtomAction);

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


