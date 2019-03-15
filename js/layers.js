var layers = {
    id: "2layer", activeIndex: 0,
    showAll: true,
    getId: function () { var id = this.id; this.id = (parseInt(id) + 1) + "layer"; return id; },
    model: [{ id: "1layer", title: "layer 1", color: "#fff", show: true, active: true }],
    open: function () {
        this.render("init"); // in init mode #layers-popup will render by animation
        setTimeout(function () { $("#layer-popup").addClass("active"); }, 10);
    },
    close: function () {
        $("#layer-popup").removeClass("active");
        setTimeout(function () { $("#layer-popup").remove(); }, 300);
    },
    
    render: function (mode) {
        components.remove("layer-popup")
        var bodyHeight = Math.floor(window.innerHeight - 120);
        var itemsHeight = this.model.length * 42;
        this.startScroll = this.startScroll ||0;
        if(this.startScroll > itemsHeight - bodyHeight){
            this.startScroll = itemsHeight - bodyHeight;
        }
        if(this.startScroll < 0 ){this.startScroll = 0;}
        var layerBackdrop = { 
            component: "DIV", id: "layer-back-drop", 
            className: "back-drop", callback: layers.close 
        };
        var layerScroll = {
            component:"DIV",
            id:"layer-scroll",
            show:itemsHeight > bodyHeight,
            html:[
                {
                    id:"layer-scroll-up",iconClass:"mdi mdi-menu-up",component:"Button",
                    className:"icon layer-scroll-arrow",attrs:{style:"top:0;"},
                    callback:function(){layers.startScroll -= 42; layers.render();}
                },
                {
                    component:"DIV",id:"layer-scroll-slider-container",
                    html:[
                        {
                            component:"Slider",
                            id:"layer-scroll-slider",
                            start:0,
                            step:1,
                            end:itemsHeight,
                            value:[this.startScroll,this.startScroll + bodyHeight],
                            direction:"down",
                            ondrag:function(obj){
                                layers.startScroll = obj.value[0]; 
                                $("#layer-items-container").css("top",layers.startScroll*-1);
                            },
                            style:{button_height:0,button_width:8,line_width:8}
                        }
                    ]
                },
                {
                    id:"layer-scroll-down",iconClass:"mdi mdi-menu-down",component:"Button",
                    className:"icon layer-scroll-arrow",attrs:{style:"bottom:0;"},
                    callback:function(){layers.startScroll += 42; layers.render();}
                }  
            ]
        };

        var layerHeader = {
            component:"DIV",id:"layer-header",className:"header",
            html:this.headerItems.map(function(item){return item}),
        }
        var layerFooter = {
            component:"DIV",id:"layer-footer",className:"header",
            html:this.footerItems.map(function(item){return item})
        }
        var layerBody = {
            component:"DIV",id:"layer-body",
            html:[
                {
                    component:"DIV",id:"layer-items-container",
                    attrs:{style:'top:'+(this.startScroll * -1)+'px;'},
                    html:this.model.map(function(model,i){
                        return {
                            component:"DIV",id:model.id,
                            className:'layer-item' + (model.active ? ' active' : ''),
                            attrs:{style:'border-left:4px solid ' + model.color + ';'},
                            html:[
                                {
                                    component: "Button", id: "layer-item-icon" + i, className: "icon", iconClass: model.show ? "mdi mdi-eye" : "mdi mdi-eye-off",
                                    callback: function (e) { layers.setVisibility($(e.currentTarget).parent().attr("id")); }
                                },
                                {
                                    component: "Button", id: "layer-item-text" + i, className: "text", 
                                    text: model.title,
                                    callback: function (e) {
                                        var id = $(e.currentTarget).parent().attr("id");
                                        var client = app.getClient(e);
                                        layers.clickedItem = {id:id,y:client.y,startScroll:layers.startScroll};
                                        app.eventHandler('window','mouseup',$.proxy(layers.itemMouseUp,layers));
                                        app.eventHandler('window','mousemove',$.proxy(layers.itemMouseMove,layers));
                                    }
                                }
                            ]
                        }
                    })
                }    
            ]
        };
        components.render({
            component:"DIV",id:"layer-popup",className :mode === "init" ? '' : 'active',
            html:[
                layerBackdrop,
                layerScroll,
                layerHeader,
                layerBody,
                layerFooter
            ]
        },"body");
        
    },
    itemMouseUp:function(e){
        console.log("ok");
        app.eventRemover('window','mouseup',layers.itemMouseUp);
        app.eventRemover('window','mousemove',layers.itemMouseMove);
        if(this.clickedItem.id){layers.active(this.clickedItem.id);} 
    },
    itemMouseMove:function(e){
        var offset = this.clickedItem.y - app.getClient(e).y;
        if(Math.abs(offset) < 5){return;}
        this.clickedItem.id = false; 
        this.startScroll = this.clickedItem.startScroll + offset;
        this.render();
    },
    add: function () {
        this.deactiveAll(); var id = this.getId();
        var length = this.model.length;
        this.model.push({ title: "layer " + parseInt(id), id: id, color: "#fff", show: true, active: true });
        this.activeIndex = length;
        this.render();
    },
    rename: function (name) {layers.getActive().title = name;layers.render();},
    remove: function (id) {
        if (this.model.length < 2) { return false; }
        for (var i = 0; i < app.state.lines.length; i++) {
            var line = app.state.lines[i];
            if (!line) { continue; }
            if (line.layerId === id) { app.state.lines.splice(i, 1); i--; }
        }
        for (var j = 0; j < app.state.points.length; j++) {
            var point = app.state.points[j];
            if (!point) { continue; }
            if (point.layerId === id) { app.state.points.splice(j, 1); j--; }
        }
        for (var k = 0; k < this.model.length; k++) {
            var layer = this.model[k];
            if (layer.id === id) { this.model.splice(k, 1); break; }
        }
    },
    moveUp: function () {
        if (!this.activeIndex) { return; }
        var active = this.model[this.activeIndex];
        this.model.splice(this.activeIndex, 1);
        this.model.splice(this.activeIndex - 1, 0, active);
        this.activeIndex--;
        this.render();
    },
    moveDown: function () {
        if (this.activeIndex === this.model.length - 1) { return; }
        var active = this.model[this.activeIndex];
        this.model.splice(this.activeIndex, 1);
        this.model.splice(this.activeIndex + 1, 0, active);
        this.activeIndex++;
        this.render();
    },
    getVisibles: function () {
        var list = [];
        for (var i = 0; i < this.model.length; i++) {
            if (this.model[i].show) { list.push(this.model[i]); }
        }
        return list;
    },
    getHiddens: function () { return this.model.map(function (item) { if (!item.show) { return item; } }); },
    setVisibility: function (id) {
        if (id === "all") { 
            var show = this.showAll = !this.showAll; 
            for (var i = 0; i < this.model.length; i++) { 
                this.model[i].show = show; 
            }
            for(var i = 0; i < app.state.lines.length; i++){
                var line = app.state.lines[i];
                line.show = show;
            } 
            for(var i = 0; i < app.state.points.length; i++){
                var point = app.state.points[i];
                point.show = show;
            } 
        }
        else { 
            var object = layers.getObjectByID(id); 
            var show = object.show = !object.show;    
            for(var i = 0; i < app.state.lines.length; i++){
                var line = app.state.lines[i];
                if(line.layerId === object.id){
                    line.show = show;
                }
            }
            for(var i = 0; i < app.state.points.length; i++){
                var point = app.state.points[i];
                if(point.layerId === object.id){
                    point.show = show;
                }
            }     
        }
        this.render(); 
        app.redraw();
    },
    mergeVisibles: function () {
        var list = this.getVisibles();
        if (list.length < 2) { return; }
        var mergedLayer = list[0];
        for (var i = 0; i < app.state.lines.length; i++) {
            var line = app.state.lines[i];
            var success = false;
            for (var j = 1; j < list.length; j++) { if (line.layer.id === list[j].id) { success = true; break; } }
            if (!success) { continue; }
            line.layer = mergedLayer;
        }
        for (var i = 0; i < app.state.points.length; i++) {
            var point = app.state.points[i];
            var success = false;
            for (var j = 1; j < list.length; j++) { if (point.layer.id === list[j].id) { success = true; break; } }
            if (!success) { continue; }
            point.layer = mergedLayer;
        }
        for (var i = 1; i < list.length; i++) { this.remove(list[i].id); }
        this.active(mergedLayer.id);
    },
    active: function (id) { 
        this.deactiveAll(); 
        var index = this.getIndexByID(id); 
        this.model[index].active = true; 
        this.activeIndex = index; 
        this.render(); 
    },
    deactiveAll: function () { for (var i = 0; i < this.model.length; i++) { this.model[i].active = false; } this.activeIndex = null; },
    getActive: function () { return this.model[layers.activeIndex]; },
    getObjectByID: function (id) {
        for (var i = 0; i < layers.model.length; i++) {
            if (layers.model[i].id === id) { return layers.model[i]; }
        }
        return false;
    },
    getIndexByID: function (id) {
        for (var i = 0; i < layers.model.length; i++) {
            if (layers.model[i].id === id) { return i; }
        }
        return false;
    },
    headerItems: [
            {
                component: "Button",id: "layer-visibility",className: "icon",
                iconClass: function () { 
                    return layers.showAll ? 'mdi mdi-eye' : 'mdi mdi-eye-off' 
                },
                callback: function () { layers.setVisibility("all"); undo.save();}
            },
            {
                component: "Button",
                id: "layer-add",
                className: "icon",
                iconClass: "mdi mdi-plus",
                callback: function () {
                    Alert.open({
                        buttons: [
                            { 
                                text: "yes", 
                                callback: function () { 
                                    layers.add(); Alert.close(); undo.save(); 
                                } 
                            },
                            { text: "cansel", callback: Alert.close }
                        ],
                        template: "Do you want to add new layer?",
                        title: "New Layer."
                    });
                }
            },
            {
                component: "Button",id: "layer-duplicate",className: "icon",
                iconClass: "mdi mdi-image-filter-none"
            },
            {
                component: "Button",id: "layer-move-down",className: "icon",
                iconClass: "mdi mdi-arrow-down-bold",
                callback: function () { layers.moveDown(); undo.save();}
            },
            {
                component: "Button",id: "layer-move-up",className: "icon",
                iconClass: "mdi mdi-arrow-up-bold",
                callback: function () { layers.moveUp();  undo.save();}
            },
    ],
    footerItems: [
        {
            id: "layer-pallete", iconClass: "mdi mdi-palette", component: "Button", 
            className: "icon", 
            callback: function () {
                Alert.open({
                    buttons: [{ text: "Close", callback: function () { Alert.close(); } }],
                    template: {
                        type: "color pallete", callback: function (e) {
                            var color = $(e.currentTarget).attr("data-color");
                            var active = layers.getActive();
                            active.color = color;
                            layers.render();
                            for(var i = 0; i < app.state.lines.length; i++){
                                var line = app .state.lines[i];
                                if(line.layerId === active.id){
                                    line.color = color;
                                }
                            }
                            app.redraw();
                            Alert.close();
                            undo.save();
                        }
                    },
                    title: "Select layer color."
                });
            },
        },
        {
            id: "layer-rename", iconClass: "mdi mdi-square-edit-outline", component: "Button", 
            className: "icon", 
            callback: function () {
                var title = layers.getActive().title;
                Alert.open({
                    buttons: [
                        {
                            text: "yes", callback: function () {
                                full_keyboard.open({
                                    text: title,
                                    title: "Inter New Name For Selected Layer:",
                                    callback: function(name){layers.rename(name); undo.save();}
                                });
                                Alert.close();
                            }
                        },
                        { text: "cansel", callback: Alert.close }
                    ],
                    template: "Do You Want To Rename Selected Layer?",
                    title: "Rename Layer."
                });
            }
        },
        {
            id: "layer-remove", iconClass: "mdi mdi-delete", component: "Button", className: "icon", 
            callback: function () {
                if (layers.model.length < 2) {
                    Alert.open({
                        buttons: [{ text: "close", callback: Alert.close }],
                        template: "Can Not Delete This Layer!!!",
                        title: "Delete Failed."
                    });
                    return false;
                }
                Alert.open({
                    buttons: [
                        { 
                            text: "yes", 
                            callback: function () { 
                                layers.remove(layers.getActive().id); 
                                layers.active(layers.model[layers.model.length - 1].id); 
                                layers.render(); 
                                Alert.close(); 
                                app.redraw();  
                                undo.save(); 
                            } 
                        },
                        { text: "cansel", callback: Alert.close }
                    ],
                    template: "Do You Want To Delete Selected Layer?",
                    title: "Delete Layer."
                });
            }
        },
        {
            id: "layer-merge-visible", iconClass: "mdi mdi-eye-plus", 
            component: "Button", className: "icon", 
            callback: function () {
                var list = layers.getVisibles();
                if (list.length < 2) {
                    Alert.open({
                        buttons: [{ text: "Close", callback: Alert.close }, ],
                        template: "Visible layers are less than 2.",
                        title: "Merge visibles error."
                    });
                    return false;
                }
                Alert.open({
                    buttons: [
                        {
                            text: "Yes", 
                            callback: function () {
                                layers.mergeVisibles(); 
                                layers.render(); 
                                Alert.close(); 
                                app.redraw();
                                undo.save();
                            }
                        },
                        { text: "Cansel", callback: Alert.close }
                    ],
                    template: "Do You Want To Merge All Visible Layers?",
                    title: "Merge Visible Layers."
                });
            }
        },
        { 
            id: "layers-setting", iconClass: "mdi mdi-settings", 
            component: "Button", className: "icon" 
        },
    ],

}