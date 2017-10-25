if(!window['Test']){
                            window['Test'] = {};
                        }if(!window.Test['Namespace']){
                            window.Test['Namespace'] = {};
                        }

                    (function(d){
                        var css = "\r\n";
                        var head = d.head || d.getElementsByTagName('head')[0];
                        var style = d.createElement('style');
                        style.type = 'text/css';
                        style.id = "component_style_Test.Namespace.HelpButton";
                        if(style.styleSheet){
                            style.styleSheet.cssText = css;
                        }else{
                            style.appendChild(d.createTextNode(css));
                        }
                        head.appendChild(style);
                    })(document);
                
                window.Test.Namespace.HelpButton = (function(window,baseType){

                window.Templates.jsonML["Test.Namespace.HelpButton.template"] = 
                    [
  null,
  [
    "p",
    {
      "data-atom-init": "HelpButton_t1",
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
		this.HelpButton_t1 = function(e) { 
                        this.bind(e,'styleDisabled', [["data","a"],["data","b"],["data","c"]], 0, function(v1,v2,v3) { return (v1) ? (v2) : (v3); });
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
