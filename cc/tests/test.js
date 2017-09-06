var fs = require("fs");
var vm = require("vm");

//var htmlparser = require("htmlparser");

function loadScript(file){
    var s = fs.readFileSync(file,'utf-8');

    var code = `(function(exports){\r\n${s}\r\n})(module.exports);`;

    var vmModule = module;

    var context = vm.createContext({
        exports: vmModule.exports,
        require: require,
        module: vmModule,
        process: process,
        global: global
    });
    var script = new vm.Script(code, { filename: file });

    script.runInContext(context);
}

global.window = {
    Atom: {

    },
    AtomBinder:{
        
    }
};

loadScript("bin/component-generator.js");


var text = 
`<div atom-component='TaskList' style-display="{ $scope.items ? '' : 'none' }" atom-view-model='{ new TaskListViewModel() }'> 
    <table 
        atom-type="AtomItemsControl" 
        atom-selected-item="$[viewModel.selectedItem]"
        atom-items="[$viewModel.items]">
        <tbody>
            <tr>
                <span>Test</span>
            </tr>
            <tr>
                <td atom-event-click="{ ()=> ($viewModel).onClick() }" ></td>
            </tr>
        </tbody>
    </table>
</div>`;



console.log(HtmlContent.parse(text));

process.exit(0);

