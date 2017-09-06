var fs = require("fs");
var vm = require("vm");

require("htmlparser");

global.System = require("systemjs");

function loadScript(file){
    var s = fs.readFileSync(file,'utf-8');
    var script = new vm.Script(s, { filename: file });
    script.runInThisContext();
}

global.window = {
    Atom: {

    },
    AtomBinder:{
        
    }
};

loadScript("dist/cc.js");

var g =System.import("html-compiler");

g.then(function(gx){

    var text = 
    `<div atom-component='TaskList' atom-view-model='{ new TaskListViewModel() }'> 
        <table atom-type="AtomItemsControl" atom-items="[$viewModel.items]">
        </table>
    </div>`;

    console.log(gx);


    console.log(gx.HtmlContent.parse(text));

});