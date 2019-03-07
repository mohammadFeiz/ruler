var sideMenu = {
    savedFiles:[],
    reloadAfterSave:false,
    renderObject: {
        id:"side-menu",
        html:[
            {className:'back-drop',id:'side-menu-back-drop',callback:function(){sideMenu.close();}},
            {id:'side-menu-popup',
                html:[
                    {id:'side-menu-header'},
                    {
                        id:'side-menu-file-name',html:[
                        function(){return app.state.fileName}
                        ]
                    },
                    {
                        id: "new", text: "New", iconClass: "mdi mdi-file-outline",component:"Button",className:'button side-menu-item', 
                        callback: function () {create.end(); edit.end(); sideMenu.close(); sideMenu.new();}
                    },
                    { 
                        id: "save", text: "Save", iconClass: "mdi mdi-content-save",component:"Button",className:'button side-menu-item', 
                        callback: function () {create.end(); edit.end(); sideMenu.close(); sideMenu.save();}
                    },
                    { 
                        id: "save-as", text: "Save As", iconClass: "mdi mdi-content-save-settings",component:"Button",className:'button side-menu-item', 
                        callback: function () {create.end(); edit.end(); sideMenu.close(); sideMenu.saveAs();}
                    },
                    { 
                        id: "open", text: "Open", iconClass: "mdi mdi-folder-open",component:"Button",className:'button side-menu-item',
                        callback:function(){create.end(); edit.end(); sideMenu.close(); sideMenu.openFile();}
                    },
                    { 
                        id: "export-dxf-file", text: "Export DXF File", iconClass: "mdi mdi-export",component:"Button",className:'button side-menu-item', 
                        callback:function(){sideMenu.removeAllSavedFiles();}
                    },
                    { id: "about", text: "About", iconClass: "mdi mdi-information-variant",component:"Button",className:'button side-menu-item',},
                    { 
                        id: "exit", text: "Exit", iconClass: "mdi mdi-close",component:"Button",className:'button side-menu-item', 
                        callback:function(){
                            navigator.app.exitApp();
                        }
                    },
                ]      
            }
        ]
    },
    getSavedFiles:function(){
        var savedFiles = localStorage.getItem('rulerSavedFiles');
        localStorage.setItem('rulerSavedFiles',savedFiles || '[]');
        return JSON.parse(localStorage.getItem('rulerSavedFiles'));
    },
    getDefaultName:function(){
        var savedFiles = this.getSavedFiles();
        if(app.state.fileName !== 'Not save'){return app.state.fileName;}
        var j = 1;
        while(savedFiles.indexOf('untitle ' + j) !== -1){
            j++;
        }
        return 'untitle ' + j;
    },
    new:function(){
        Alert.open({
            title:'New drawing',
            buttons:[
                {text:'Yes', callback:function(){Alert.close(); sideMenu.reloadAfterSave = true; sideMenu.save();}},
                {text:'No',callback:function(){location.reload();}},
                {text:'Cansel',callback:function(){Alert.close();}}
            ],
            template:'Do you want save current drawing?'
        });   
    },
    save:function(){
        if(app.state.fileName === 'Not save'){
            this.saveAs();
        }
        else{
            this.finalSave(app.state.fileName);
        }
    },
    saveAs:function(){
        var defaultName = this.getDefaultName();
        full_keyboard.open({
            text: defaultName,
            title: "Inter file name for save.",
            callback: function(name){
                var savedFiles = sideMenu.getSavedFiles();
                if(savedFiles.indexOf(name)!== -1){
                    Alert.open({
                        title:'Confirm Save',
                        template:name + ' already exist. Do you want replace it?',
                        buttons:[
                            {
                                text:'yes',
                                value:name,
                                callback:function(e){
                                    var name = $(e.currentTarget).attr('data-value');
                                    Alert.close();
                                    sideMenu.finalSave(name);
                                }
                            },
                            {text:'No',callback:function(){Alert.close();}}
                        ]
                    })
                }
                else{
                    sideMenu.finalSave(name);
                }
            }
        });
    },
    finalSave:function(name){
        var savedFiles = this.getSavedFiles();
        app.state.fileName = name;
        var index = savedFiles.indexOf(name);
        if(index === -1){
            savedFiles.push(name);
        }
        else {
            savedFiles[index] = name;
        }
        localStorage.setItem('rulerSavedFiles',JSON.stringify(savedFiles));
        localStorage.setItem(name,JSON.stringify(undo.getLast()));
        if(this.reloadAfterSave){location.reload();}
    },
    openFile:function(){
        var savedFiles = this.getSavedFiles();
        var items = savedFiles.map(function(savedFile){
            return {
                text:savedFile,
                value:savedFile
            }
        });
        Alert.open({
            title:'Open file',
            template:{
                type:'list',
                items:items,
                callback:function(e){
                    var value = $(e.currentTarget).attr('data-value');
                    app.state.fileName = value;
                    var file = localStorage.getItem(value);
                    undo.model = [JSON.parse(file),null];
                    undo.load();
                    Alert.close();
                }
            },
            buttons:[{text:'Close',callback:Alert.close}]
        });
    },
    removeAllSavedFiles:function(){
        var savedFiles = this.getSavedFiles();
        for(var i = 0; i < savedFiles.length; i++){
            localStorage.removeItem(savedFiles[i]);
        }
        localStorage.setItem('rulerSavedFiles','[]');
    },
    open: function () {
        components.render(this.renderObject,'body');
        setTimeout(function () { $("#side-menu").addClass("active"); }, 300);
    },
    close: function () {
        $("#side-menu").removeClass("active");
        setTimeout(function () { components.remove("side-menu"); }, 300);
    },
}
