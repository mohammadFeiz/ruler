var layers = {
    id: "2layer", activeIndex: 0,
    idGenerator: function () {layers.id = (parseInt(layers.id) + 1) + "layer";},
    getEyeIconClass:function(state){
        return state?"icon mdi mdi-eye":"icon mdi mdi-eye-off";
    },
    model: [{ id:"1layer",title: "layer 1", color: "#fff", show: true, active: true }],
    open: function () {
        var str = LayerPopup({headerItems:layers.headerItems,footerItems:layers.footerItems});
        $("body").append(str);
        setTimeout(function () { $("#layer-popup").addClass("active"); }, 10);
        layers.update();
        for (var i = 0; i < layers.headerItems.length; i++) {
            var item = layers.headerItems[i];
            layers.eventHandler("#layer-popup #" + item.id, "mousedown", item.callback);
        }
        for (var i = 0; i < layers.footerItems.length; i++) {
            var item = layers.footerItems[i];
            layers.eventHandler("#layer-popup #" + item.id, "mousedown", item.callback);
        }
        layers.eventHandler("#layer-popup .back-drop","mousedown",layers.close);
    },
    close:function(){
        $("#layer-popup").removeClass("active");
        setTimeout(function () { $("#layer-popup").remove(); }, 300);

    },
    eventHandler: function (selector, event, action) {
        if (canvas.isMobile) {
            if (event === "mousedown") { event = "touchstart"; }
            else if (event === "mousemove") { event = "touchmove"; }
            else if (event === "mouseup") { event = "touchend"; }
        }
        if (selector === "window") { $(window).unbind(event, action).bind(event, action); }
        else if (typeof selector === "string") { $(selector).unbind(event, action).bind(event, action); }
        else { selector.unbind(event, action).bind(event, action); }
    },
    update: function () {
        var str = '';
        for (var i = 0; i < layers.model.length; i++) {
            var item = layers.model[i];
            str += LayerItem({item:item});
        }
        $("#layer-body").html(str);
        layers.eventHandler("#layer-body .icon-container", "mousedown", function (e) {
            var id = $(e.currentTarget).parent().attr("id");
            layers.setVisibility(id);
        });
        layers.eventHandler("#layer-body .title", "mousedown", function (e) {layers.active($(e.currentTarget).parent().attr("id"));});
    },
    add: function () {
        layers.deactiveAll();
        var id = layers.id,num = parseInt(id);
        layers.idGenerator();
        var newLayer = { title: "layer " + num, id: id, color: "#fff", show: true };
        layers.model.push(newLayer);
        layers.update();
        layers.active(id);
    },
    rename: function (title) {
        layers.getActiveLayer().title = title;
        layers.update();
    },
    remove: function (id) {
        if (layers.model.length < 2) { return false; }
        var id = layers.getActiveLayer().id;
        for (var i = 0; i < canvas.lines.length; i++) {
            var line = canvas.lines[i];
            if (!line) { continue; }
            if (line.layer === id) { canvas.lines.splice(i, 1);  i--;  }
            canvas.redraw();
        }
        for (var j = 0; j < canvas.points.length; j++) {
            var point = canvas.points[j];
            if (!point) { continue; }
            if (point.layer === id) { canvas.points.splice(j, 1);  j--; }
        }
        for (var k = 0; k < layers.model.length; k++) {
            var layer = layers.model[k];
            if (layer.id === id) { layers.model.splice(k, 1); break; }
        }
        layers.active(layers.model[layers.model.length - 1].id);
        layers.update();
        canvas.redraw();
    },
    getVisibles:function(){
        var visibleLayers = layers.model.map(function (item) {if (item.show) { return item.id; }});
        return visibleLayers;
    },
    getHiddens:function(){
        var hiddenLayers = layers.model.map(function (item) {if (!item.show) { return item.id; }});
        return hiddenLayers;
    },
    setVisibility:function(id){
        if (id === "all") {
            var element = $("#layer-visibility");
            var items = $(".layer-item");
            element.toggleClass("active");
            var state = element.hasClass("active");
            element.find("span").attr("class", layers.getEyeIconClass(state));
            items.find(".icon-container span").attr("class", layers.getEyeIconClass(state));
            for (var i = 0; i < layers.model.length; i++) {
                var layer = layers.model[i];
                layer.show = state;
            }
        }
        else {
            var object = layers.getObjectByID(id);
            object.show = !object.show;
            $(".layer-item#" + id + " span.icon").attr("class", layers.getEyeIconClass(object.show));
        }
        var hiddenLayers = layers.getHiddens();
        for(var i = 0; i < canvas.lines.length; i++){
            var line = canvas.lines[i];
            if(hiddenLayers.indexOf(line.layer)===-1){line.show = true;}
            else{line.show = false;}
        }
        for(var i = 0; i < canvas.points.length; i++){
            var point = canvas.points[i];
            if(hiddenLayers.indexOf(point.layer)===-1){point.show = true;}
            else{point.show = false;}
        }
        canvas.redraw();
    },  
    mergeVisibles: function () {
        var list = layers.getVisibles();
        var id = list[0];
        var color = layers.getObjectByID(id).color;
        for (var i = 0; i < canvas.lines.length; i++) {
            var line = canvas.lines[i];
            if (line.show) {
                line.layer = id;
                line.color = color;
            }
        }
        for (var i = 0; i < canvas.points.length; i++) {
            var point = canvas.points[i];
            if (point.show) {
                point.layer = id;
            }
        }
        for (var i = 1; i < list.length; i++) {layers.remove(list[i]);}
        layers.active(id);
        layers.update();
        canvas.redraw();
    },
    active: function (id) {
        layers.deactiveAll();
        $("#layer-body .layer-item#" + id).addClass("active");
        var index = layers.getIndexByID(id);
        var object = layers.model[index];
        object.active = true;
        layers.activeIndex = index;
    },
    deactiveAll: function () {
        $("#layer-body .layer-item").removeClass("active");
        for (var i = 0; i < layers.model.length; i++) {
            var layer = layers.model[i]
            layer.active = false;
        }
        layers.activeIndex = null;
    },
    getActiveLayer: function () {
        return layers.model[layers.activeIndex];
    },   
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
                id: "layer-visibility",iconClass: "mdi mdi-eye",active: true,
                callback: function () {layers.setVisibility("all");}
            },
            {
                id: "layer-add",iconClass: "mdi mdi-plus",
                callback: function () {
                    var A = new Alert({
                        buttons: [
                            { title: "yes", subscribe: layers.add },
                            { title: "cansel" }
                        ],
                        template: "Do You Want To Add New Layer?",
                        title: "New Layer."
                    });
                }
            },
            { id: "layer-duplicate", iconClass: "mdi mdi-image-filter-none" },
            { id: "layer-move-down", iconClass: "mdi mdi-arrow-down-bold" },
            { id: "layer-move-up", iconClass: "mdi mdi-arrow-up-bold" },
    ],
    footerItems: [
        { 
            id: "layer-pallete", iconClass: "mdi mdi-palette",callback:function(){
                $("body").append(ColorPalette({ colors: layers.colors }));
                layers.eventHandler("#color-palette .back-drop", "mousedown", function () {
                    $("#color-palette").remove();
                });
                layers.eventHandler("#color-palette .color-palette-item", "mousedown", function (e) {
                    var color = $(e.currentTarget).attr("data-color");
                    var activeLayer = layers.getActiveLayer();
                    activeLayer.color = color;
                    layers.update();
                    for (var i = 0; i < canvas.lines.length; i++) {
                        var line = canvas.lines[i];
                        if (line.layer === activeLayer.id) {line.color = color;}
                    }
                    canvas.redraw();
                    $("#color-palette").remove();
                });
            } 
        },
        {
            id: "layer-rename", iconClass: "mdi mdi-square-edit-outline", callback: function () {
                var title = layers.getActiveLayer().title;
                var A = new Alert({
                    buttons: [
                        {
                            title: "yes", subscribe: function () {
                                full_keyboard.open({
                                    value: title,
                                    title: "Inter New Name For Selected Layer:",
                                    subscribe: layers.rename
                                });
                            }
                        },
                        {title: "cansel"}
                    ],
                    template: "Do You Want To Rename Selected Layer?",
                    title: "Rename Layer."
                });
            }
        },
        {
            id: "layer-remove", iconClass: "mdi mdi-delete", callback: function () {
                var id = layers.getActiveLayer().id;
                if (layers.model.length < 2) {
                    var A = new Alert({
                        buttons: [{ title: "close", subscribe: function () { } }],
                        template: "Can Not Delete This Layer!!!",
                        title: "Delete Failed."
                    });
                    return false;
                }
                var A = new Alert({
                    buttons: [
                        { title: "yes", subscribe: function () { layers.remove(layers.getActiveLayer().id)} },
                        { title: "cansel" }
                    ],
                    template: "Do You Want To Delete Selected Layer?",
                    title: "Delete Layer."
                });

            }
        },
        {
            id: "layer-merge-visible", iconClass: "mdi mdi-eye-plus", callback:function() {
                var list = layers.getVisibles();
                if (list.length < 2) { return false; }
                var A = new Alert({
                    buttons: [
                        { title: "yes", subscribe: layers.mergeVisibles },
                        { title: "cansel" }
                    ],
                    template: "Do You Want To Merge All Visible Layers?",
                    title: "Merge Visible Layers."
                });
            }
        },
        { id: "layer-merge-all", iconClass: "mdi mdi-arrow-collapse-vertical" },
    ],
    colors: ["#ff0000", "#ff4e00", "#ffa800", "#fcff00", "#f5eeb2", "#12ff00", "#2e4f0b", "#00f0ff", "#008aff", "#2400ff", "#1c4663",
        "#41366f", "#7c6c92", "#8400ff", "#ff6868", "#ff00ba", "#72441c", "#482a0b", "#8a8a8a", "#ffffff" ],
}

function LayerPopup(props) {
    var headerItems = props.headerItems;
    var footerItems = props.footerItems;
    var str = '';
    str += '<div id="layer-popup" class="popup">';
    str += LayerBackDrop();
    str += LayerToolbar({id:"layer-header", items: headerItems });
    str += LayerBody();
    str += LayerToolbar({id:"layer-footer", items: footerItems });
    str += '</div>';
    return str;
}

function LayerBackDrop() {return '<div class="back-drop"></div>';}

function LayerToolbar(props) {
    var str = '<div id="'+props.id+'">';
    for (var i = 0; i < props.items.length; i++) {
        var item = props.items[i];
        str += LayerButton({ item: item });
    }
    str += '</div>';
    return str;
}

function LayerButton(props) {
    var item = props.item;
    var active = item.active === true ? ' active' : '';
    var str = '';
    str += '<div class="icon-container layer-button' + active + '" id="' + item.id + '">';
    str += '<span class="icon ' + item.iconClass + '"></span>';
    str += '</div>';
    return str;
}

function LayerBody(props) {return '<div id="layer-body"></div>';}

function LayerItem(props) {
    var item = props.item;
    var active = item.active === true ? ' active' : '';
    var visibilityIconClass = item.show ? 'mdi mdi-eye' : 'mdi mdi-eye-off';
    function getStyle() {
        return 'border-left:4px solid '+item.color+';';
    }
    var str = '<div class="layer-item ' + active + '" style="'+getStyle()+'" id="' + item.id + '">';
    str += '<div class="icon-container">';
    str += '<span class="icon ' + visibilityIconClass + '"></span>';
    str += '</div>';
    str += '<span class="title">' + item.title + '</span>';
    str += '</div>';
    return str;
}

function ColorPalette(props) {
    var str = '';
    str += '<div id="color-palette">';
    str += '<div class="back-drop"></div>';
    str += '<div id="color-palette-header">';
    str += '<div id="color-palette-title">Select Color</div>';
    str += '<div id="color-palette-close">';
    str += '<span class="mdi mdi-close"></span>';
    str += '</div>';
    str += '</div>';
    str += '<div id="color-palette-body">';
    for (var i = 0; i < props.colors.length; i++) {
        str += PaletteItem({color:props.colors[i]});
    }
    str += '</div>';
    str += '</div>';
    return str;
}

function PaletteItem(props) {
    var str = '';
    str += '<div data-color="'+props.color+'" class="color-palette-item" style="background:' + props.color + '"></div>';
    return str;
}