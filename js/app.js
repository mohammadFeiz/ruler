var app = {
    state: {
        lines: [],
        points: [],
        showLines: true,
        showPoints: true,
        appmode: "create",
        createmode:{ text: "Polyline", value: "polyline",close:false,linesMethod:'singlerow',pointsMethod:'polyline',ortho:true, },
        container: "#container",
        background: "#21242a",
        gridLineColor: "70,70,70",
        fileName:'Not save',
        topMenuTitle : false,
        subMenuTitle : false,
        measuremode:false,
    },
    style: {
        lightFontColor: "#fff",
    },
    init: function () {
        var s = this.state;
        s.isMobile = 'ontouchstart' in document.documentElement?true:false;
        this.canvas = new Canvas({
            container: s.container,
            background: s.background,
            gridLineColor: s.gridLineColor,
            onmousedown: this.canvasmousedown.bind(this),
        });
        this.eventHandler("window","mousedown",$.proxy(this.windowMouseDown,this));
        this.eventHandler("window","mousemove",$.proxy(this.windowMouseMove,this));
        this.eventHandler("window","mouseup",$.proxy(this.windowMouseUp,this));
        document.addEventListener("backbutton", onBackKeyDown, false);
        display.render();
        this.redraw();
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
            x: Math.round(this.state.isMobile ? e.changedTouches[0].clientX : e.clientX), 
            y: Math.round(this.state.isMobile ? e.changedTouches[0].clientY : e.clientY) 
        };
        return obj; 
    },
    getClient: function (e) {    
        return e?this.getMousePosition(e):{x:app.x,y:app.y};
    },
    getEvent:function(event){
        var mobileEvents = { mousedown: "touchstart", mousemove: "touchmove", mouseup: "touchend" };
        return this.state.isMobile ? mobileEvents[event] : event;
    },
    eventHandler: function (selector, event, action) {
        var element = typeof selector === "string" ? (selector === "window" ? $(window) : $(selector)) : selector;
        event = this.getEvent(event);
        element.unbind(event, action).bind(event, action);
    },
    eventRemover: function (selector, event, action) {
        var element = typeof selector === "string" ? (selector === "window" ? $(window) : $(selector)) : selector;
        event = this.getEvent(event);
        element.unbind(event, action);
    },
    drawLines: function () {
        var lines = this.state.lines;
        var length = lines.length;
        for (var i = 0; i < length; i++) {
            var line = lines[i];
            if (!line.show) { continue; }
            this.drawLine(line);
        }
    },
    drawPoints: function () {
        var s = this.state;
        if (!s.showPoints) { return; }
        if(s.points.length === 0){return;}
        for (var i = 0; i < s.points.length; i++) {
            var point = s.points[i];
            if (!point.show) { continue; }
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
        this.drawLine({ start: { x: 0, y: -4002 }, end: { x: 0, y: 4000 }, color: "#555",lineDash:[2,3] });
        this.drawLine({ start: { x: -4002, y: 0 }, end: { x: 4000, y: 0 }, color: "#555",lineDash:[2,3] });
    },
    redraw: function () {
        this.canvas.clear();
        this.drawAxes();
        this.drawLines();
        this.drawPoints();
    },
    getPoint: function (obj) {
        obj = obj || {};
        var c = this.canvas, coords = obj.coords || c.getMousePosition(), is = obj.is || {}, isnt = obj.isnt || {}, area = obj.area || 18 / c.getZoom(), points = this.state.points;
        for (var i = 0; i < area; i += 2) {
            for (var j = points.length - 1; j >= 0 ; j--) {
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
            for (var j = lines.length - 1; j >= 0 ; j--) {
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
    windowMouseDown: function (e) {
        var mousePosition = this.getMousePosition(e);
        app.x = mousePosition.x;
        app.y = mousePosition.y;
    },
    windowMouseMove: function (e) {
        var mousePosition = this.getMousePosition(e);
        app.x = mousePosition.x;
        app.y = mousePosition.y;
    },
    windowMouseUp: function (e) {
        var mousePosition = this.getMousePosition(e);
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
            b = app.canvas.getSnap() * zoom;
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
    },
    getMin: function (a, b) { if (a <= b) { return a; } else { return b; } },
    getMax: function (a, b) { if (a <= b) { return b; } else { return a; } },
    panremove:function(){
        $(".pan-background").remove();
    },
    panmousedown:function(e){
        app.eventHandler("window", "mousemove", $.proxy(this.panmousemove,this));
        app.eventHandler("window", "mouseup", $.proxy(this.panmouseup,this));
        var screenPosition = app.canvas.getScreenPosition();
        var client = this.getClient(e);
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
            id:"top-menu",className:'header',html:[
                { 
                    component: "Button", id: "main-menu", iconClass: "mdi mdi-menu", className: "icon left",
                    show:function(){return app.state.topMenuTitle === false;},
                    callback:function(){sideMenu.open();}
                },
                {
                    component: "Button", id: "set-app-mode", className: "button left", container: "#top-menu",
                    text: function () { return app.state.appmode === "create" ? "Create" : "Edit"; },
                    affectTo:['top-menu','sub-menu','selected-show'],
                    callback: function (e) {
                        create.end(); edit.end();
                        if (app.state.appmode === "create") { app.state.appmode = "edit"; } else { app.state.appmode = "create"; }
                    },
                    show:function(){return app.state.topMenuTitle === false;}
                },
                {
                    component: "Dropdown", id: "create-modes", className: "dropdown left", container: "#top-menu",
                    options: [
                        { text: "Polyline", value: "polyline",close:false,linesMethod:'singlerow',pointsMethod:'polyline',ortho:true }, 
                        { text: "Outline", value: "offsetLine"}, 
                        { text: "Plumb Line", value: "plumbLine"}, 
                        { text: "Extend Line", value: "extendLine"}, 
                        { text: "Doubleline", value: "doubleline",close:false,linesMethod:'doublerow',pointsMethod:'doubleline',ortho:true }, 
                        { text: "Rectangle", value: "rectangle",close:true,linesMethod:'singlerow',pointsMethod:'rectangle' }, 
                        { text: "NGon", value: "ngon",close:true,linesMethod:'singlerow',pointsMethod:'ngon',ortho:true },
                        { text: "Path", value: "path",close:true ,linesMethod:'singlerow',pointsMethod:'polyline',ortho:true},
                        { text: "Double path", value: "doublepath",close:true ,linesMethod:'doublerow',pointsMethod:'doubleline'},
                        { text: "Frame", value: "frame",close:true ,linesMethod:'frame',pointsMethod:'frame'}, 
                    ],
                    affectTo:['offset-select-mode'],
                    text: function () {return app.state.createmode.text;},
                    optionsCallback: function (obj) { 
                        app.state.createmode = obj; 
                        create.end();
                    },
                    show: function () { return app.state.appmode === "create" && app.state.topMenuTitle === false; },
                },
                {
                    component: "Dropdown", id: "select-mode", className: "dropdown left", container: "#top-menu",
                    text: function () { return edit.selectMode },
                    options: [{ text: "Point", value: "Point" }, { text: "Line", value: "Line" }, { text: "Spline", value: "Spline" }],
                    affectTo:['sub-menu','selected-show'],
                    optionsCallback: function (obj) { edit.selectMode = obj.value; edit.end(); },
                    show: function () { return app.state.appmode === "edit" && app.state.topMenuTitle === false; },
                },
                {
                    component: "Dropdown", id: "offset-select-mode", className: "dropdown left",
                    text: function () { return create.offsetLine.selectMode },
                    options: [{ text: "Line", value: "Line" }, { text: "Spline", value: "Spline" }],
                    optionsCallback: function (obj) { 
                        create.offsetLine.selectMode = obj.value; Lines.deselectAll(); app.redraw();; 
                    },
                    show: function () { return app.state.appmode === "create" && app.state.createmode.value === "offsetLine" && app.state.topMenuTitle === false; },
                },
                { 
                    id: "layer", component: "Button", iconClass: "mdi mdi-buffer", className: "icon", container: "#top-menu", 
                    callback:function() { create.end(); edit.end(); layers.open(); },
                    show:function(){return app.state.topMenuTitle === false;},
                    affectTo:['sub-menu','selected-show'],
                },
                {
                    id: "back-button", component: "Button", iconClass: "mdi mdi-arrow-left", className: "icon left", container: "#top-menu",
                    show:function(){return app.state.topMenuTitle !== false;},
                    callback:function(){
                        app.state.measuremode = false;
                        edit.align1 = false; 
                        edit.addPointMode = false;
                        edit.extendLineMode = false;
                        edit.chamferMode = false;
                        edit.transformMode = false;
                        axis.close(); 
                        app.state.topMenuTitle = false;
                    },
                    affectTo:['top-menu','sub-menu','bottom-menu']
                },
                {
                    id: "top-menu-title", component: "Button", className: "text left",
                    show:function(){return app.state.topMenuTitle !== false;},
                    text:function(){ return app.state.topMenuTitle;}
                },
                {
                    id: "settings", component: "Button", iconClass: "mdi mdi-settings", className: "icon left", container: "#top-menu",
                    callback: function () { window[app.state.appmode].setting(); },
                    show:function(){return app.state.measuremode === false && edit.align1 === false;}
                },        
            ]
        },
        {
            id:"sub-menu",className:'header',
            show:function(){return app.state.topMenuTitle === false;},
            html:[
                {
                    id: "delete-item", component: "Button", iconClass: "mdi mdi-delete", className: "icon left",
                    show: function () { 
                        var con1 = app.state.appmode === "edit";
                        var con2 = Lines.selected.length > 0 || Points.selected.length > 0;
                        return con1 && con2;
                    },
                    callback:function(){edit.remove();}
                },
                {
                    id: "select-all", component: "Button", iconClass: "mdi mdi-select-all", className: "icon left", container: "#sub-menu",
                    show: function () { return app.state.appmode === "edit"; },
                    callback:function(){edit.selectAll();}
                },
                {
                    id: "mirror-x", component: "Button", iconClass: "mdi mdi-unfold-more-vertical", className: "icon left", container: "#sub-menu",
                    show: function () { 
                        var con1 = app.state.appmode === "edit";
                        var con2 = Lines.selected.length > 0 || Points.selected.length > 1;
                        return con1 && con2;      
                    },
                    callback:function(){edit.mirrorX()}
                },
                {
                    id: "mirror-y", component: "Button", iconClass: "mdi mdi-unfold-more-horizontal", className: "icon left", container: "#sub-menu",
                    show: function () { 
                        var con1 = app.state.appmode === "edit";
                        var con2 = Lines.selected.length > 0 || Points.selected.length > 1;
                        return con1 && con2;      
                    },
                    callback:function(){edit.mirrorY()}
                },
                {
                    id: "transform", component: "Button", iconClass: "", className: "button left", text: "Transform", container: "#sub-menu",
                    affectTo:['top-menu','sub-menu','bottom-menu'],
                    callback: function () { edit.transform(); },
                    show: function () { return app.state.appmode === 'edit'; },
                },
                {
                    id: "break-point", component: "Button", iconClass: "", className: "button left", text: "Break", container: "#sub-menu",
                    show: function () { return edit.breakPointApprove(); },
                    callback: function () { edit.breakPoint(); }
                },
                {
                    id: "weld", component: "Button", iconClass: "", className: "button left", text: "Weld", container: "#sub-menu",
                    show: function () { return edit.weldPointApprove(); },
                    callback: function () { edit.weldPoint(); }
                },
                
                {
                    id: "connect", component: "Button", iconClass: "", className: "button left", text: "Connect", container: "#sub-menu",
                    show: function () { return edit.connectPointsApprove(); },
                    callback: function () { edit.connectPoints(); }
                },
                {
                    id: "divide", component: "Button", iconClass: "", className: "button left", text: "Divide", container: "#sub-menu",
                    show: function () { return Lines.selected.length === 1; },
                    callback: function () {
                        keyboard.open({
                            isMobile: app.state.isMobile,
                            fields: [{ prop: "value", title: "Divide By",min:2,max:100,value:2 }],
                            title: "Divide Line",
                            close: true,
                            negative: false,
                            callback: edit.divide
                        });
                    }
                },
                {
                    id: "align", component: "Button", iconClass: "", className: "button left", text: "Align", container: "#sub-menu",
                    show: function () { return Points.selected.length === 1; },
                    affectTo:['top-menu','sub-menu','bottom-menu'],
                    callback:function(){
                        app.state.topMenuTitle = "Tap second point to align";
                        edit.align1 = Points.selected[0];
                    } 
                    
                },
                {
                    id: "add-point", component: "Button", iconClass: "", className: "button left", text: "Add Point", container: "#sub-menu",
                    show: function () { 
                        return( 
                            app.state.appmode === 'edit' && 
                            edit.selectMode === 'Point' && 
                            app.state.lines.length > 0 &&
                            Points.selected.length === 0
                        ); 
                    },
                    affectTo:['top-menu','sub-menu','bottom-menu'],
                    callback:function(){
                        app.state.topMenuTitle = "Tap a line and drag to add point";
                        edit.addPointMode = true;
                    } 
                    
                },
                {
                    id: "extend-line", component: "Button", iconClass: "", className: "button left", text: "Resize Line", container: "#sub-menu",
                    show: function () { 
                        return( 
                            app.state.appmode === 'edit' && 
                            edit.selectMode === 'Line' && 
                            app.state.lines.length > 0 &&
                            Lines.selected.length === 0
                        ); 
                    },
                    affectTo:['top-menu','sub-menu','bottom-menu'],
                    callback:function(){
                        app.state.topMenuTitle = "Tap a side of a line and drag to resize";
                        edit.extendLineMode = true;
                    } 
                    
                },
                {
                    id: "join", component: "Button", iconClass: "", className: "button left", text: "Join", container: "#sub-menu",
                    show: function () { 
                        return Lines.selected.length === 2 && 
                        Lines.getMeet(Lines.selected[0], Lines.selected[1]) && 
                        !Lines.isConnect(Lines.selected[0], Lines.selected[1]); 
                    },
                    callback: function () { edit.joinLines(); }
                },
                {
                    id: "chamfer", component: "Button", iconClass: "", className: "button left", text: "Chamfer",
                    show: function () { 
                        return( 
                            app.state.appmode === 'edit' && 
                            edit.selectMode === 'Point' && 
                            app.state.lines.length > 0 &&
                            Points.selected.length === 0
                        ); 
                    },
                    affectTo:['top-menu','sub-menu','bottom-menu'],
                    callback:function(){
                        app.state.topMenuTitle = "Tap a point and drag to chamfer";
                        edit.chamferMode = true;
                    } 
                    
                },
            ]
        },
        {
            id:"bottom-menu",className:'header',html:[
                {
                    id:"measure",component:"Button",iconClass:"mdi mdi-ruler",className:"icon left",container:"#bottom-menu",
                    callback:function(){
                        if(!app.state.measuremode){
                            app.state.measuremode= true; 
                            $("#measure").addClass("active");
                        }
                        else{app.state.measuremode = false; $("#measure").removeClass("active");}
                        app.state.topMenuTitle = "Measure Mode";
                        create.end(); edit.end();
                    },
                    show:function(){return app.state.measuremode === false;},
                    affectTo:['top-menu','sub-menu','bottom-menu']
                },
                {
                    id:"magnify-plus",component:"Button",iconClass:"mdi mdi-magnify-plus-outline",className:"icon right",
                    callback:function (){app.zoom("in");},
                    affectTo:['zoom-show'],
                },
                {
                    id:"zoom-show",component:"Button",className:"text right",
                    text:function(){return (app.canvas.getZoom() * 100) + "%"},
                    attrs:{style:"padding-left:0;padding-right:0;"}
                },
                {
                    id:"magnify-minus",component:"Button",iconClass:"mdi mdi-magnify-minus-outline",className:"icon right",
                    callback:function (){app.zoom("out");},
                    affectTo:['zoom-show'],
                },
                {
                    id:"pan-mode",component:"Button",iconClass:"mdi mdi-gesture-tap",className:"icon left",container:"#bottom-menu",
                    callback:function(){
                    $("body").append(
                        '<div class="pan-background"><p>Pan mode is active!!!<br>Drag to pan screen<br>Tap here for deactive pan mode</p></div>'
                    );
                        app.eventHandler(".pan-background p", "mousedown", $.proxy(app.panremove,app));
                        app.eventHandler(".pan-background", "mousedown", $.proxy(app.panmousedown,app));
                    }
                },
                {
                    id:"undo",component:"Button",iconClass:"mdi mdi-undo",className:"icon right",container:"#bottom-menu",
                    show:function(){return app.state.measuremode === false;},
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


