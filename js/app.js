﻿var app = {
    state: {
        lines: [],
        points: [],
        isMobile: false,
        showLines: true,
        showPoints: true,
        appmode: "create",
        createmode: "polyline",
        editmode: "modify",
        container: "#container",
        background: "#2c2f37",
        gridLineColor: "70,70,70"
    },
    style: {
        lightFontColor: "#fff",
    },
    init: function () {
        var s = this.state;
        this.canvas = new Canvas({
            isMobile: this.state.isMobile,
            container: s.container,
            background: s.background,
            gridLineColor: s.gridLineColor,
            onmousedown: this.canvasmousedown.bind(this),
        });
        app.eventHandler("window","mousedown",app.windowMouseDown);
        app.eventHandler("window","mousemove",app.windowMouseMove);
        app.eventHandler("window","mouseup",app.windowMouseUp);
        display.render();
    },

    canvasmousedown: function (e) {
        if(this.state.measuremode){
            var line = this.getLine();
            line.showDimension = !line.showDimension;
            app.redraw();
        }
        else{
            window[this.state.appmode].mousedown(e);
        }
    },
    getMousePosition:function(e){
        var obj = { 
            x: e.clientX === undefined ? e.changedTouches[0].clientX : e.clientX, 
            y: e.clientY === undefined ? e.changedTouches[0].clientY : e.clientY 
        };
        return obj; 
    },
    getClient: function (e) {    
         return {x:app.x,y:app.y};
    },
    eventHandler: function (selector, e, action) {
        var mobileEvents = { down: "touchstart", move: "tocuhmove", up: "tocuhend" };
        var element = typeof selector === "string" ? (selector === "window" ? $(window) : $(selector)) : selector;
        var event = this.state.isMobile ? mobileEvents[e] : e;
        element.unbind(event, action).bind(event, action);
    },
    eventRemover: function (selector, e, action) {
        var mobileEvents = { down: "touchstart", move: "tocuhmove", up: "tocuhend" };
        var element = typeof selector === "string" ? (selector === "window" ? $(window) : $(selector)) : selector;
        var event = this.state.isMobile ? mobileEvents[e] : e;
        element.unbind(event, action);
    },
    drawLines: function () {
        var s = this.state;
        if(s.lines.length === 0){return;}
        var layer = layers.getObjectByID(s.lines[0].layerId);
        for (var i = 0; i < s.lines.length; i++) {
            var line = s.lines[i];
            if(layer.id !== line.layerId){
                layer = layers.getObjectByID(line.layerId);
            }
            if (!layer.show) { continue; }
            line.color = layer.color;
            this.drawLine(line);
        }
    },
    drawPoints: function () {
        var s = this.state;
        if (!s.showPoints) { return; }
        if(s.points.length === 0){return;}
        var layer = layers.getObjectByID(s.points[0].layerId);
        for (var i = 0; i < s.points.length; i++) {
            var point = s.points[i];
            if(layer.id !== point.layerId){
                layer = layers.getObjectByID(point.layerId);
            }
            if (!layer.show) { continue; }
            var linesCount = point.connectedLines.length;
            if (linesCount === 1) { this.drawOpenPoint(point) }
            else { this.drawPoint(point); }
        }
    },
    drawLine: function (line) {
        var zoom = this.canvas.getZoom();
        line.lineWidth = 1 / zoom;
        this.canvas.drawLine(line);
    },
    drawPoint: function (point) { this.canvas.drawArc({ x: point.x, y: point.y, radius: 2 / this.canvas.getZoom(), fill: point.selected === true ? "red" : "#fff" }); },
    drawOpenPoint: function (point) { 
        var zoom = this.canvas.getZoom();
        this.canvas.drawRectangle({ center: true, x: point.x, y: point.y, width: 4/zoom, height: 4/zoom, fill: point.selected === true ? "red" : "yellow" }); },
    drawAxes: function () {
        this.ctx.save();
        this.ctx.setLineDash([3, 3]);
        this.drawLine({ start: { x: 0, y: -4002 }, end: { x: 0, y: 4000 }, color: "#777" });
        this.drawLine({ start: { x: -4002, y: 0 }, end: { x: 4000, y: 0 }, color: "#777" });
        this.ctx.restore();
    },
    redraw: function () {
        this.canvas.clear();
        //this.drawAxes();
        this.drawLines();
        this.drawPoints();
    },
    getPoint: function (obj) {
        obj = obj || {};
        var c = this.canvas, coords = obj.coords || c.getMousePosition(), is = obj.is || {}, isnt = obj.isnt || {}, area = obj.area || 18 / c.getZoom(), points = this.state.points;
        for (var i = 1; i < area; i += 2) {
            for (var j = 0; j < points.length; j++) {
                var point = points[j];
                if (Lines.getLength({start:point,end:coords}) > i) { continue; }
                var isFiltered = false;
                for (var prop in is) {
                    if (!Array.isArray(is[prop])) { is[prop] = [is[prop]];}
                    for (var k = 0; k < is[prop].length; k++) {if (point[prop] !== is[prop][k]) { isFiltered = true; break; }}
                }
                if (isFiltered) { continue; }
                for (var prop in isnt) {
                    if (!Array.isArray(isnt[prop])) { isnt[prop] = [isnt[prop]]; }
                    for (var k = 0; k < isnt[prop].length; k++) { if (point[prop] === isnt[prop][k]) { isFiltered = true; break; } }
                }
                if (isFiltered) { continue; }
                return point;
            }
        }
        return false;
    },
    getLine: function (obj) {
        obj = obj || {};
        var c = this.canvas, coords = obj.coords || c.getMousePosition(), is = obj.is || {}, isnt = obj.isnt || {}, area = obj.area || 18 / c.getZoom(), lines = this.state.lines;
        for (var i = 1; i < area; i += 2) {
            for (var j = 0; j < lines.length; j++) {
                var line = lines[j], s = line.start, e = line.end, dip = c.get.line.dip(line), isFiltered = false,
                    minX = Math.min(s.x, e.x), maxX = Math.max(s.x, e.x), minY = Math.min(s.y, e.y), maxY = Math.max(s.y, e.y);
                if (dip === "infinity") { if (Math.abs(minX - coords.x) > i || coords.y < minY || coords.y > maxY) { continue; } }
                else if (Math.abs(dip) <= 1) { if (coords.x < minX || coords.x > maxX || Math.abs(((dip * (coords.x - s.x)) + s.y) - coords.y) > i) { continue; } }
                else { if (coords.y < minY || coords.y > maxY || Math.abs((((coords.y - s.y) / dip) + s.x) - coords.x) > i) { continue; } }
                for (var prop in is) { if (line[prop] !== is[prop]) { isFiltered = true; break; } }
                if (isFiltered) { continue; }
                for (var prop in isnt) { if (line[prop] === isnt[prop]) { isFiltered = true; break; } }
                if (isFiltered) { continue; }
                return line;
            }
        }

        return false;
    },
    // zoom: function (zoom) {
    //     zoom = parseFloat(zoom.toFixed(2));
    //     canvas.setZoom(zoom);
    //     var str =
    //         '<div id="zoomShow" style="position: fixed;top: calc(50% - 90px);left:calc(50% - 50px);"><i class="icon icon-search" style="font-size: 120px;color: rgba(255,255,255,0.15);"></i><span style="position: relative;font-size: 25px;color: rgba(255,255,255,0.4);top:-59px;left:-100px;font-weight: bold;">' +
    //         parseInt(zoom * 100) + '%</span></div>';
    //     $("body").append(str);
    //     $("#zoomShow").fadeOut(400);
    //     setTimeout(function () {
    //         $("#zoomShow").remove();
    //     }, 400);
    //     var a = 100 * zoom,
    //         b = 10 * zoom;
    //     $("canvas").css({
    //         "background-size": "" + a + "px " + a + "px, " + a + "px " + a + "px, " + b + "px " +
    //             b + "px, " + b + "px " + b + "px"
    //     });
    //     var c = create.currentSpline;
    //     if (c) {
    //         create.screenCorrection(function () {
    //             canvas.redraw();
    //             c.draw();
    //             c.drawHelp();
    //             c.setController();
    //         });
    //     }
    // },

    windowMouseDown: function (e) {
        var mousePosition = app.getMousePosition(e);
        app.x = mousePosition.x;
        app.y = mousePosition.y;
    },
    windowMouseMove: function (e) {
        var mousePosition = app.getMousePosition(e);
        app.x = mousePosition.x;
        app.y = mousePosition.y;
    },
    windowMouseUp: function (e) {
        var mousePosition = app.getMousePosition(e);
        app.x = mousePosition.x;
        app.y = mousePosition.y;
    },
    zoom: function (value) {
        var currentZoom = app.canvas.getZoom();
        if(value === 'out' && currentZoom <= 0.2){return;}
        if(value === 'in' && currentZoom >= 2){return;}
        var zoom = currentZoom + (value === "in"? 0.2:-0.2);
        zoom = parseFloat(zoom.toFixed(2));
        app.canvas.setZoom(zoom);
        
        var a = 100 * zoom,
            b = 10 * zoom;
        $("canvas").css({
            "background-size": "" + a + "px " + a + "px, " + a + "px " + a + "px, " + b + "px " +
                b + "px, " + b + "px " + b + "px"
        });
        var createControlPosition = createControl.getPosition();
        var axisPosition = axis.getPosition();
        if(createControlPosition){
            this.canvas.setScreenTo({x:createControlPosition.x,y:createControlPosition.y * -1,animate:true,callback:function(){create.preview();}});
        }
        else if(axisPosition){
            this.canvas.setScreenTo({x:axisPosition.x,y:axisPosition.y * -1,animate:true,callback:function(){
                axis.setPosition(axisPosition);
                app.redraw();
            }});
        }
        else{
            var screenPosition = this.canvas.getScreenPosition();
            this.canvas.setScreenTo({x:screenPosition.x,y:screenPosition.y});
            this.redraw();
        }
        components.update("zoom-show");
    },
    getMin: function (a, b) { if (a <= b) { return a; } else { return b; } },
    getMax: function (a, b) { if (a <= b) { return b; } else { return a; } },
    panremove:function(){
        $(".pan-background").remove();
    },
    panmousedown:function(){
        app.eventHandler("window", "mousemove", $.proxy(this.panmousemove,this));
        app.eventHandler("window", "mouseup", $.proxy(this.panmouseup,this));
        var screenPosition = app.canvas.getScreenPosition();
        var client = this.getClient();
        this.startOffset = { 
            x: client.x, y: client.y, 
            endX: screenPosition.x, endY: screenPosition.y 
        };
    },
    panmouseup: function () {
        app.eventRemover("window", "mousemove", this.panmousemove);
        app.eventRemover("window", "mouseup", this.panmouseup);
    },
    
    panmousemove: function (e) {
        var so = this.startOffset, zoom = this.canvas.getZoom(), coords = this.getClient(e);
        var x = (so.x - coords.x) / zoom + so.endX, y = (coords.y - so.y) / zoom + so.endY;
        this.canvas.setScreenTo({ x: x, y: y, callback: function(){
            if(app.state.appmode === "create"){create.preview();}
            else if(app.state.appmode === "edit"){
                app.redraw();
                var axisPosition = axis.getPosition();
                if(axisPosition){axis.setPosition(axisPosition);}
            }
        } });
    },
}


var display = {
    items: [
        {
            id:"top-menu",html:[
                { 
                    component: "Button", id: "main-menu", iconClass: "mdi mdi-menu", className: "icon left",
                    show:function(){return app.state.measuremode !== true;}
                },
                {
                    component: "Button", id: "set-app-mode", className: "button left", container: "#top-menu",
                    text: function () { return app.state.appmode === "create" ? "Create" : "Edit"; },
                    callback: function (item) {
                        create.end();
                        edit.end();
                        if (app.state.appmode === "create") { app.state.appmode = "edit"; } else { app.state.appmode = "create"; }
                        display.render();
                    },
                    show:function(){return app.state.measuremode !== true;}
                },
                {
                    component: "Dropdown", id: "create-modes", className: "dropdown left", container: "#top-menu",
                    options: [
                        { text: "Polyline", value: "polyline" }, 
                        { text: "Rectangle", value: "rectangle" }, 
                        { text: "NGon", value: "ngon" },
                        { text: "Path", value: "path" }, 
                    ],
                    text: function () {
                        switch (app.state.createmode) {
                            case 'polyline': return 'Polyline';
                            case 'rectangle': return 'rectangle';
                            case 'ngon': return 'NGon';
                            case 'path': return 'Path';
                        }
                    },
                    optionsCallback: function (value) { 
                        app.state.createmode = value; 
                        create.end();  
                        display.render(); 
                    },
                    show: function () { return app.state.appmode === "create" && app.state.measuremode !== true; },
                },
                {
                    component: "Dropdown", id: "edit-modes", className: "dropdown left", container: "#top-menu",
                    options: [
                        { text: "Modify", value: "modify" }, 
                        { text: "Add Point", value: "addPoint" }, 
                        { text: "Align Point", value: "alignPoint" }, 
                        { text: "Chamfer", value: "chamfer" },
                        { text: "Offset Line", value: "offsetLine" }, 
                        { text: "Extend Line", value: "extendLine" }, 
                        { text: "Plumb Line", value: "plumbLine" },
                    ],
                    text: function () {
                        switch (app.state.editmode) {
                            case 'modify': return 'Modify';
                            case 'addPoint': return 'Add Point';
                            case 'connectPoints': return 'Connect';
                            case 'chamfer': return 'Chamfer';
                            case 'joinLines': return 'Join Lines';
                            case 'offsetLine': return 'Offset Line';
                            case 'extendLine': return 'Extend Line';
                            case 'plumbLine': return 'Plumb Line';
                            case 'divideLine': return 'Divide Line';
                            case 'alignPoint': return 'Align Point';
                            case 'measure': return 'Measure';
                        }
                    },
                    optionsCallback: function (value) { app.state.editmode = value; edit.end();},
                    show: function () { return app.state.appmode === "edit" && app.state.measuremode !== true; },
                },
                {
                    component: "Dropdown", id: "select-mode", className: "dropdown left", container: "#top-menu",
                    text: function () { return edit.modify.selectMode },
                    options: [{ text: "Point", value: "Point" }, { text: "Line", value: "Line" }, { text: "Spline", value: "Spline" }],
                    optionsCallback: function (value) { 
                        edit.modify.selectMode = value; edit.end(); 
                    },
                    show: function () { return app.state.appmode === "edit" && app.state.editmode === "modify" && app.state.measuremode !== true; },
                },
                {
                    component: "Dropdown", id: "offset-select-mode", className: "dropdown left",
                    text: function () { return edit.offsetLine.selectMode },
                    options: [{ text: "Line", value: "Line" }, { text: "Spline", value: "Spline" }],
                    optionsCallback: function (value) { 
                        edit.offsetLine.selectMode = value; edit.end(); 
                    },
                    show: function () { return app.state.appmode === "edit" && app.state.editmode === "offsetLine" && app.state.measuremode !== true; },
                },
                { 
                    id: "layer", component: "Button", iconClass: "mdi mdi-buffer", className: "icon", container: "#top-menu", 
                    callback:function() { create.end(); edit.end(); layers.open(); },
                    show:function(){return app.state.measuremode !== true &&app.state.measuremode !== true;}
                },
                {
                    id: "settings", component: "Button", iconClass: "mdi mdi-settings", className: "icon left", container: "#top-menu",
                    callback: function () { window[app.state.appmode].setting(); },
                    show:function(){return app.state.measuremode !== true;}
                },
                {
                    id: "back-button", component: "Button", iconClass: "mdi mdi-arrow-left", className: "icon left", container: "#top-menu",
                    show:function(){return app.state.measuremode === true;},
                    callback:function(){app.state.measuremode = false; display.render();}
                },
                {
                    id: "top-menu-title", component: "Button", className: "text left", container: "#top-menu",
                    show:function(){return app.state.measuremode === true;},
                    text:function(){ return app.state.topMenuTitle;}
                },        
            ]
        },
        {
            id:"sub-menu",html:[
                {
                    id: "delete-item", component: "Button", iconClass: "mdi mdi-delete", className: "icon left",
                    show: function () { return app.state.appmode === "edit" && app.state.editmode === "modify" && app.state.measuremode !== true; },
                    callback:function(){edit.modify.remove();}
                },
                {
                    id: "select-all", component: "Button", iconClass: "mdi mdi-select-all", className: "icon left", container: "#sub-menu",
                    show: function () { return app.state.appmode === "edit" && app.state.editmode === "modify" && app.state.measuremode !== true; },
                    callback:function(){edit.modify.selectAll();}
                },
                {
                    id: "mirror-x", component: "Button", iconClass: "mdi mdi-unfold-more-horizontal", className: "icon left", container: "#sub-menu",
                    show: function () { return app.state.appmode === "edit" && app.state.editmode === "modify" && app.state.measuremode !== true; },
                    callback:function(){edit.modify.mirrorX()}
                },
                {
                    id: "mirror-y", component: "Button", iconClass: "mdi mdi-unfold-more-vertical", className: "icon left", container: "#sub-menu",
                    show: function () { return app.state.appmode === "edit" && app.state.editmode === "modify" && app.state.measuremode !== true; },
                    callback:function(){edit.modify.mirrorY()}
                },
                {
                    id: "break-point", component: "Button", iconClass: "", className: "button left", text: "Break", container: "#sub-menu",
                    show: function () { return edit.modify.breakPointApprove() && app.state.measuremode !== true },
                    callback: function () { edit.modify.breakPoint(); }
                },
                {
                    id: "weld", component: "Button", iconClass: "", className: "button left", text: "Weld", container: "#sub-menu",
                    show: function () { return edit.modify.weldPointApprove() && app.state.measuremode !== true },
                    callback: function () { edit.modify.weldPoint(); }
                },
                {
                    id: "connect", component: "Button", iconClass: "", className: "button left", text: "Connect", container: "#sub-menu",
                    show: function () { return edit.modify.connectPointsApprove() && app.state.measuremode !== true },
                    callback: function () { edit.modify.connectPoints(); }
                },
                {
                    id: "divide", component: "Button", iconClass: "", className: "button left", text: "Divide", container: "#sub-menu",
                    show: function () { return Lines.selected.length === 1 &&app.state.measuremode !== true; },
                    callback: function () {
                        keyboard.open({
                            isMobile: app.state.isMobile,
                            fields: [{ prop: "value", title: "Divide By" }],
                            title: "Divide Line",
                            close: true,
                            negative: false,
                            callback: edit.modify.divide
                        });
                    }
                },
                {
                    id: "join", component: "Button", iconClass: "", className: "button left", text: "Join", container: "#sub-menu",
                    show: function () { 
                        return Lines.selected.length === 2 && 
                        Lines.getMeet(Lines.selected[0], Lines.selected[1]) && 
                        !Lines.isConnect(Lines.selected[0], Lines.selected[1]) &&
                        app.state.measuremode !== true; 
                    },
                    callback: function () { edit.modify.joinLines(); }
                },
                {
                    id: "remove-measures", component: "Button", iconClass: "", className: "button", text: "Remove All", container: "#sub-menu",
                    show: function () { return app.state.appmode === "edit" && app.state.editmode === "measure" && app.state.measuremode !== true; },
                    callback: function () { edit.measure.removeAll(); }
                },
                {
                    id: "all-measure", component: "Button", iconClass: "", className: "button", text: "Add To All", container: "#sub-menu",
                    show: function () { return app.state.appmode === "edit" && app.state.editmode === "measure" && app.state.measuremode !== true; },
                    callback: function () { edit.measure.measureAll(); }
                },
            ]
        },
        {
            id:"bottom-menu",html:[
                {
                    id:"measure",component:"Button",iconClass:"mdi mdi-ruler",className:"icon left",container:"#bottom-menu",
                    callback:function(){
                        if(!app.state.measuremode){
                            app.state.measuremode= true; 
                            $("#measure").addClass("active");
                        }
                        else{app.state.measuremode = false; $("#measure").removeClass("active");}
                        app.state.topMenuTitle = "Measure Mode";
                        display.render();
                    }
                },
                {
                    id:"magnify-plus",component:"Button",iconClass:"mdi mdi-magnify-plus-outline",className:"icon right",
                    callback:function (){app.zoom("in");}
                },
                {
                    id:"zoom-show",component:"Button",className:"text right",
                    text:function(){return (app.canvas.getZoom() * 100) + "%"},
                    attrs:{style:"padding-left:0;padding-right:0;"}
                },
                {
                    id:"magnify-minus",component:"Button",iconClass:"mdi mdi-magnify-minus-outline",className:"icon right",
                    callback:function (){app.zoom("out");}
                },
                {
                    id:"pan-mode",component:"Button",iconClass:"mdi mdi-gesture-tap",className:"icon left",container:"#bottom-menu",
                    callback:function(){
                    $("body").append(
                        '<div class="pan-background"><p>Pan mode is active!!!<br>Drag to pan screen<br>double tap for deactive pan mode</p></div>'
                    );
                        app.eventHandler(".pan-background", "dblclick", $.proxy(app.panremove,app));
                        app.eventHandler(".pan-background", "mousedown", $.proxy(app.panmousedown,app));
                    }
                },
                {
                    id:"undo",component:"Button",iconClass:"mdi mdi-undo",className:"icon right",container:"#bottom-menu",
                    show:function(){return app.state.measuremode !== true;},
                    callback:function(){undo.load();}
                },
                {
                    id:"selected-show",component:"Button",className:"text left",
                    attrs:{style:"padding-left:0;padding-right:0;"},
                    text:function(){
                        var text = '';
                        if(Points.selected.length){
                            text += Points.selected.length + " Point(s) selected"
                        }
                        else if(Lines.selected.length){
                            text += Lines.selected.length + " Line(s) selected"
                        }
                        return text;
                    }
                },
            ]
        },
    ],
    render: function () {
        var str = '';
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            components.remove(item.id);
            components.render(item,"body");
        }
        
    },
};


