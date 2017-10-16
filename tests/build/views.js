if(!window['Test']){
                            window['Test'] = {};
                        }if(!window.Test['Namespace']){
                            window.Test['Namespace'] = {};
                        }
window.Test.Namespace.HelpButton = (function(window,baseType){

                window.Templates.jsonML["Test.Namespace.HelpButton.template"] = 
                    [
  [
    "p",
    {
      "atom-text": "Help"
    }
  ]
];

                (function(window,WebAtoms){
                    this.HelpButton_t0 = function(e) { 
                        var oldInit = AtomUI.attr(e,'base-data-atom-init');
                        if(oldInit){
                            (window.WebAtoms.PageSetup[oldInit]).call(this,e);
                        }
                    
                    };
                }).call(WebAtoms.PageSetup,window,WebAtoms);

                return classCreatorEx({
                    name: "Test.Namespace.HelpButton",
                    base: baseType,
                    start: function(e){
                        
                        var oldInit = AtomUI.attr(e,'data-atom-init');
                        if(oldInit){
                            AtomUI.attr(e, 'base-data-atom-init',oldInit);
                        };
                        AtomUI.attr(e, 'data-atom-init','HelpButton_t0');
                    
                    },
                    methods:{
                        setLocalValue: window.__atomSetLocalValue(baseType)
                    },
                    properties:{
                        
                    }
                })
            })(window, WebAtoms.AtomButton.prototype);
