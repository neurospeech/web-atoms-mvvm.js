

window.HelpButton = (function(window,baseType){

                window.Templates.jsonML["HelpButton.template"] = 
                    [
  [
    "p",
    {
      "atom-text": "Help"
    }
  ]
];

                (function(window,WebAtoms){
                    
                }).call(WebAtoms.PageSetup,window,WebAtoms);

                return classCreatorEx({
                    name: "HelpButton",
                    base: baseType,
                    start: function(e){
                        
                    },
                    methods:{},
                    properties:{}
                })
            })(window, WebAtoms.AtomButton.prototype)