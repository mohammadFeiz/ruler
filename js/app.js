var app = {
    state:{
        lines: [],
        points: [],
        isMobile: false,
        showLines: true,
        showPoints:true,
        appmode: "create",
        createmode: "polyline",
        editmode: "modify",
        container: "#container",
        background: "#2c2f37",
        gridLineColor: "70,70,70"
    },
    style:{
        lightFontColor:'#fff',
        box_shadow:'4px 4px 10px 0px rgba(0,0,0,0.6)',
        font_color:'#fff',
        background: "#3e4146",
        top_menu:{
            size: 36,
            color1: "#fff",
            color2: "#777",
            padding: 6,
            button_fontSize:12,
            icon_fontSize: 18,
            hMargin: 4,
            vMargin: 6,
            item_borderWidth: 1,
            borderRadius: 5,
            header_background:"#222",
            dropdown_item_margin:8,
        },  
    },
    init:function(){
        var s = this.state;
        this.canvas = new Canvas({
            isMobile:this.state.isMobile,
            container: s.container,
            background: s.background,
            gridLineColor: s.gridLineColor,
            onmousedown: window[s.appmode].mousedown.bind(window[s.appmode]),
        });
        topMenu.render();
    },
    getClient: function (e) { return { x: e.clientX === undefined ? e.changedTouches[0].clientX : e.clientX, y: e.clientY === undefined ? e.changedTouches[0].clientY : e.clientY }; },
    eventHandler: function (selector, e, action) {        
        var mobileEvents = {down:"touchstart",move:"tocuhmove",up:"tocuhend"};
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
        if (!s.showLines) { return; }
        for (var i = 0; i < s.lines.length; i++) {
            var line = s.lines[i];
            if (line.show === false) {continue;}
            this.drawLine(line);
        }
    },
    drawPoints: function () {
        var s = this.state;
        if (!s.showPoints) {return;}
        for (var i = 0; i < s.points.length; i++) {
            var point = s.points[i];
            if (point.show === false) {continue;}
            point.connectedLines = point.connectedLines || [];
            var linesCount = point.connectedLines.length;
            if (linesCount === 1) {this.drawOpenPoint(point)}
            else {this.drawPoint(point);}
        }
    },
    drawLine:function(line){
        this.canvas.drawLine({
            start: {x: line.start.x,y: line.start.y},
            end: {x: line.end.x,y: line.end.y},
            color: line.color
        });
    },
    drawPoint:function(point){
        this.canvas.drawArc({
            x: point.x,
            y: point.y,
            radius: 2,
            color: point.color,
            mode: "fill"
        });
    },
    drawOpenPoint:function(point){
        this.canvas.drawRectangle({position:"center",x: point.x,y: point.y,width: 5,height: 5,color: point.color,mode: "fill"});
    },
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
        var x = obj.x,y = obj.y,is = obj.is || {},isnt = obj.isnt || {},area = obj.area || 18 / canvas.zoom,points = this.canvas.points;
        for (var i = 1; i < area; i += 2) {
            for (var j = 0; j < points.length; j++) {
                var point = points[j];
                var isFiltered = false;
                for (var prop in is) {if (point[prop] !== is[prop]) {isFiltered = true;break;}}
                if (isFiltered) { continue; }
                for (var prop in isnt) {if (point[prop] === isnt[prop]) {isFiltered = true;break;}}
                if (isFiltered) { continue; }
                if (Math.abs(point.x - x) > i) { continue; }
                if (Math.abs(point.y - y) > i) { continue; }
                return point;
            }
        }
        return false;
    },
    getLine: function (obj) {
        var c = this.canvas,x = obj.x, y = obj.y, is = obj.is || {}, isnt = obj.isnt || {}, area = obj.area || 18 / canvas.zoom, lines = c.lines;
        for (var i = 1; i < area; i += 2) {
            for (var j = 0; j < lines.length; j++) {
                var line = lines[j],
                    dip = c.getDip(line),
                    minX = Math.min(line.start.x, line.end.x),
                    maxX = Math.max(line.start.x, line.end.x),
                    minY = Math.min(line.start.y, line.end.y),
                    maxY = Math.max(line.start.y, line.end.y),
                    isFiltered = false;
                for (var prop in is) {if (line[prop] !== is[prop]) {isFiltered = true;break;}}
                if (isFiltered) { continue; }
                for (var prop in isnt) {if (line[prop] === isnt[prop]) {isFiltered = true;break;}}
                if (isFiltered) { continue; }
                if (dip === "infinity") { if (Math.abs(minX - x) > i || y < minY || y > maxY) { continue; } }
                else if (Math.abs(dip) <= 1) { if (x < minX || x > maxX || Math.abs(((dip * (x - line.start.x)) + line.start.y) - y) > i) { continue; } }
                else {if (y < minY || y > maxY || Math.abs((((y - line.start.y) / dip) + line.start.x) - x) > i) {continue;}}
                return line;
            }
        }

        return false;
    },
    mouseDown: function () {
        if (app.measuremode) {
            var line = canvas.findLineByCoords();
            line.showDimention = !line.showDimention;
            canvas.redraw();
        }
        else {
            $("#float-toolbar").hide();
            window[app.appmode].mousedown();
        }
    },
    mouseMove: function (e) {
        if (app.measuremode) {

        }
        else {
            window[app.appmode].mousemove(e);
        }
    },
    mouseUp: function () {
        if (app.measuremode) {

        }
        else {
            $("#float-toolbar").show();
            window[app.appmode].mouseup();
        }
    },
    mousedown: function (e) {
        var client = this.getClient(e);
        this.x = client.x; this.y = client.y;
        this.eventHandler("window", "mousemove", this.mousemove);
        this.eventHandler("window", "mouseup", this.mouseup);
    },
    mousemove:function(e){
        var client = this.getClient(e);
        this.x = client.x; this.y = client.y;
    },
    mouseup: function (e) {
        clearInterval(create.autoPanInterval);
        this.eventRemover("window", "mousemove", this.mousemove);
        this.eventRemover("window", "mouseup", this.mouseup);
        
    },
    zoom: function (zoom) {

        zoom = parseFloat(zoom.toFixed(2));
        canvas.setZoom(zoom);
        var str =
            '<div id="zoomShow" style="position: fixed;top: calc(50% - 90px);left:calc(50% - 50px);"><i class="icon icon-search" style="font-size: 120px;color: rgba(255,255,255,0.15);"></i><span style="position: relative;font-size: 25px;color: rgba(255,255,255,0.4);top:-59px;left:-100px;font-weight: bold;">' +
            parseInt(zoom * 100) + '%</span></div>';
        $("body").append(str);
        $("#zoomShow").fadeOut(400);
        setTimeout(function () {
            $("#zoomShow").remove();
        }, 400);
        var a = 100 * zoom,
            b = 10 * zoom;
        $("canvas").css({
            "background-size": "" + a + "px " + a + "px, " + a + "px " + a + "px, " + b + "px " +
                b + "px, " + b + "px " + b + "px"
        });
        var c = create.currentSpline;
        if (c) {
            create.screenCorrection(function () {
                canvas.redraw();
                c.draw();
                c.drawHelp();
                c.setController();
            });
        }
    }, 


    createitems: {
        polyline: { title: "Polyline", iconClass: "mdi mdi-vector-polyline" },
        //doubleline: { title: "Double Line", iconClass: "mdi mdi-vector-polyline" },
        rectangle: { title: "Rectangle", iconClass: "mdi mdi-vector-rectangle" },
        ngon: { title: "NGon", iconClass: "mdi mdi-hexagon-outline" },
        frame: { title: "Frame", iconClass: "mdi mdi-grid" }
    },
    edititems: {
        modify: { title: "Modify", iconClass: "mdi mdi-select" },
        connectpoints: { title: "Connect", iconClass: "mdi mdi-ray-start-end" },
        alignPoint: { title: "align Point", iconClass: "mdi mdi-source-pull" },
        chamfer: { title: "Chamfer", iconClass: "icon icon-chamfer" },
        addPoint: { title: "Add Point", iconClass: "mdi mdi-ray-vertex" },
        divide: { title: "Divide Line", iconClass: "mdi mdi-ray-vertex" },
        joinlines: { title: "Join Lines", iconClass: "mdi mdi-ray-vertex" },
        extendLine: { title: "Extend Line", iconClass: "mdi mdi-ray-start-arrow" },
        offsetLine: { title: "Offset Line", iconClass: "icon icon-offsetline" },
        plumbLine: { title: "Plumb Line", iconClass: "icon icon-offsetline" },
    },
    
    setappmode: function (obj) {
        create.end();
        edit.end();
        var value = obj.values[0];
        if (value === 0) { app.appmode = "create"; }
        else if (value === 1) { app.appmode = "edit"; }
        else { alert("error"); }
        app.setappmodeitems();
    },
    setappmodeitems: function () {
        edit.modify.setToolbar();
        var appmode = app.appmode; //create
        var appmodeitem = app[appmode + "mode"]; //polyline
        var appmodelist = app[appmode + "items"];
        var modeObject = appmodelist[appmodeitem]; //{ title: "Polyline", iconClass: "mdi mdi-vector-polyline" }
        $("#app-mode-item-title").html(modeObject.title);
        $("#app-mode-item-icon").attr("class", modeObject.iconClass);
        var str = '';
        for (var prop in appmodelist) {
            modeObject = appmodelist[prop]; //{ title: "Polyline", iconClass: "mdi mdi-vector-polyline" }
            str += '<div id="' + prop + '" class="app-mode-item">';
            str += '<div id="app-mode-item-icon" class="' + modeObject.iconClass + '"></div>';
            str += '<div id="app-mode-item-title">' + modeObject.title + '</div>';
            str += '</div>';
        }
        $("#app-mode-items-popup").html(str);
        app.eventHandler(".app-mode-item", "mousedown", function (e) {
            create.end();
            edit.end();
            var appmode = app.appmode; //create
            var mode = $(e.currentTarget).attr("id"); //polyline
            app[appmode + "mode"] = mode; // app.createmode = polyline
            var modeObject = app[appmode + "items"][mode]; // modeObject = { title: "Polyline", iconClass: "mdi mdi-vector-polyline" }
            $("#app-mode-item-title").html(modeObject.title);
            $("#app-mode-item-icon").attr("class", modeObject.iconClass);
            $("#app-mode-items").removeClass("active");
            edit.modify.setToolbar();
        });
        app.eventHandler("#app-mode-items-title", "mousedown", function () {
            $("#app-mode-items").addClass("active");
        });
        app.eventHandler("#app-mode-items .back-drop", "mousedown", function () {
            $("#app-mode-items").removeClass("active");
        });
    },
    

    
    
    
    // init: function () {
    //     app.drawControlWidth = Math.ceil(app.sizeA * 3.5);
    //     app.setappmodeitems();
    //     app.eventHandler("#snap", "mousedown", Snap.open);
    //     app.eventHandler("#tools-setting", "mousedown", toolsSetting.open);
    //     app.eventHandler("#layer", "mousedown", function () {
    //         create.end();
    //         edit.end(); layers.open();
    //     });
    //     app.eventHandler(".zoom", "mousedown", app.zoom);
    //     app.eventHandler(".switch", "mousedown", app.switchButton);
    //     app.eventHandler(".axis-icon,#axisBackground", "mousedown", edit.modify.buttonmousedown);
    //     app.eventHandler("#undo-button", "mousedown", undo.load);
    //     app.eventHandler("#side-menu-button", "mousedown", sideMenu.open);
    //     app.eventHandler("#log", "mousedown", log.show);
    //     app.eventHandler("#log-clear", "mousedown", log.clear);
    //     app.eventHandler("#log-hide", "mousedown", log.hide);

    // },
    mouseDown: function () {
        if (app.measuremode) {
            var line = canvas.findLineByCoords();
            line.showDimention = !line.showDimention;
            canvas.redraw();
        }
        else {
            $("#float-toolbar").hide();
            window[app.appmode].mousedown();
        }
    },
    mouseMove: function (e) {
        if (app.measuremode) {

        }
        else {
            window[app.appmode].mousemove(e);
        }
    },
    mouseUp: function () {
        if (app.measuremode) {

        }
        else {
            $("#float-toolbar").show();
            window[app.appmode].mouseup();
        }
    },

    windowMouseDown:function(e){
        app.x = app.getClient(e, "X");
        app.y = app.getClient(e, "Y");
        app.eventHandler("window", "mousemove", app.windowMouseMove);
        app.eventHandler("window", "mouseup", app.windowMouseUp);
        

    },
    windowMouseMove:function(e){
        app.x = app.getClient(e, "X");
        app.y = app.getClient(e, "Y");
    },
    windowMouseUp: function (e) {
        clearInterval(create.autoPanInterval);
        app.eventRemover("window", "mousemove", app.windowMouseMove);
        app.eventRemover("window", "mouseup", app.windowMouseUp);
        
    },


    switchButton: function (e) {
        var element = $(e.currentTarget);
        var id = element.attr("id");
        var state;
        if (element.hasClass("active")) {
            element.removeClass("active");
            state = false;
        } else {
            element.addClass("active");
            state = true;
        }
        if (id === "pan") {
            canvas.pan = state;
        }
        else if (id === "measure") {
            app.measuremode = state;
        }
    },
    panCallback: function () {
        if (app.appmode === "create") {
            if (create.currentSpline) {
                create.currentSpline.draw();
                create.currentSpline.drawHelp();
                create.currentSpline.setController();
            }
        }
    },
    set_tools_setting_popup_content: function () {
        var id;
        if (app.appmode === "Create") {
            id = app.createmode;
        } else if (app.appmode === "Edit") {
            id = app.editmode;
        }
        $(".tools-setting-group").removeClass("active");
        $("#tools-setting-group-" + id).addClass("active");

    },
    zoom: function (zoom) {

        zoom = parseFloat(zoom.toFixed(2));
        canvas.setZoom(zoom);
        var str =
            '<div id="zoomShow" style="position: fixed;top: calc(50% - 90px);left:calc(50% - 50px);"><i class="icon icon-search" style="font-size: 120px;color: rgba(255,255,255,0.15);"></i><span style="position: relative;font-size: 25px;color: rgba(255,255,255,0.4);top:-59px;left:-100px;font-weight: bold;">' +
            parseInt(zoom * 100) + '%</span></div>';
        $("body").append(str);
        $("#zoomShow").fadeOut(400);
        setTimeout(function () {
            $("#zoomShow").remove();
        }, 400);
        var a = 100 * zoom,
            b = 10 * zoom;
        $("canvas").css({
            "background-size": "" + a + "px " + a + "px, " + a + "px " + a + "px, " + b + "px " +
                b + "px, " + b + "px " + b + "px"
        });
        var c = create.currentSpline;
        if (c) {
            create.screenCorrection(function () {
                canvas.redraw();
                c.draw();
                c.drawHelp();
                c.setController();
            });
        }
    },
    
}

var display = {
    
    render: function () {
        var str = '';
        for(var i = 0; i < containers.length; i++){
            var container = containers[i];
            $('#' + container.id).remove();
            str+='<div id="'+container.id+'" style="'+container.getStyle()+'"></div>';
        }
        $("body").append(str);
        for(var i = 0; i < items.length; i++){
            var item = items[i];
            $("#" + item.containerId).append(getElement[item.id](item));
        }
        var s = app.style;
        var str = '<div class="top-menu" style="' + this.getStyle() + '">';
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (getShow[item.id] && getShow[item.id]() === false) { continue; }
            str += getElement[item.type](item);
        }
        str += '</div>';
        str += subMenu.render();
        $("body").append(str);
        app.eventHandler(".button,.icon","mousedown", function () {
            var id = $(this).attr("data-id");
            if(getCallback[id]){getCallback[id](getObject(id))};
            topMenu.render();
        });
        app.eventHandler(".sub-menu-item.button,.sub-menu-item.icon","mousedown", function () {
            var item = subMenu.findItemById($(this).attr("data-id"));
            if(item.callback(item)){item.callback(item)};
            topMenu.render();
        });
        app.eventHandler(".top-menu-item.dropdown .back-drop","mousedown", function () {
            var item = topMenu.findItemById($(this).attr("data-id"));
            item.open = false;
            topMenu.render();
            subMenu.render();
        });
        app.eventHandler(".top-menu-item.dropdown","mousedown", function () {
            var item = topMenu.findItemById($(this).attr("data-id"));
            item.open = true;
            topMenu.render();
            subMenu.render();
        });
        app.eventHandler(".sub-menu-item.dropdown .back-drop","mousedown", function () {
            var item = subMenu.findItemById($(this).attr("data-id"));
            item.open = false;
            topMenu.render();
            subMenu.render();
        });
    },
};




var subMenu = {
    items: [
        
    ],
    render: function () {
        var s = app.style.top_menu;
        
        var str = '';
        str += '<div class="sub-menu" style="'+getStyle()+'">';
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            if (getShow[item.id] && getShow[item.id]() === false) { continue; }
            str += getElement[item.type](item);
        }
        str += '</div>';
        return str;
    },
};

var containers = [
    {id:"#top-menu",
        getStyle:function(){
            var str = '',s = app.style.top_menu;
            str += 'position:fixed;left:0;top:0;width:100%;';
            str += 'height:' + s.top_menu_size + 'px;';
            str += 'background:' + s.header_background + ';';
            return str;
        }
    },
    {id:"#sub-menu",
        getStyle:function(){
            var s=app.style.top_menu, str = 'position:fixed;left:0;width:100%;top:' + s.size + 'px;';
            str += 'background:' + s.header_background + ';';
            return str;
        }
    }
],

var items = [
    {id: "mainMenu",type: "icon", className: "mdi mdi-menu", float: "left",containerId:"top-menu"},
    {id: "setAppMode", type: "button", float: "left", text: "Create",containerId:"top-menu"},
    {
        id:"createModes",type: "dropdown", float: "left", text: "Polyline", activeIndex: 0,open:true,containerId:"top-menu",
        options: [{ text: "Polyline", },{ text: "Rectangle", },{ text: "NGon", },]
    },
    { id:"layer",type: "icon", className: "mdi mdi-buffer", float: "right",containerId:"top-menu" },
    { id:"snap",type: "icon", className: "mdi mdi-magnet", float: "right",containerId:"top-menu" },
    { id:"undo",type: "icon", className: "mdi mdi-undo-variant", float: "right",containerId:"top-menu" },
    { id:"settings",type: "icon", className: "mdi mdi-settings", float: "left",containerId:"top-menu" },

    {id:"deleteItem", type: "button", className: "mdi mdi-delete", float: "left",containerId:"sub-menu"},
    {id:"selectAll",type: "button", className: "mdi mdi-select-all", float: "left",containerId:"sub-menu"},
    {id:"mirrorX",type: "button", className: "mdi mdi-unfold-more-horizontal", float: "left",containerId:"sub-menu"},
    {id:"mirrorY",type: "button", className: "mdi mdi-unfold-more-vertical", float: "left",containerId:"sub-menu"},
    {id:"break",type: "button", className: "", float: "left", text: "Break",containerId:"sub-menu"},
    {id:"weld",type: "button", className: "", float: "left", text: "Weld",containerId:"sub-menu"},
    {id:"connect",type: "button", className: "", float: "left", text: "Connect",containerId:"sub-menu"},
    {id:"join",type: "button", className: "", float: "left", text: "Join",containerId:"sub-menu"},
    {id:"divide",type: "button", className: "", float: "left", text: "Divide",containerId:"sub-menu"},
];

var getElement= {
    icon: function (props,className) {
        var s = props.style || app.style.top_menu;
        function getStyle() {
            var str = '';
            str += 'float:' + props.float + ';';
            str += 'width:'+(s.size)+'px;';
            str += 'height:' + (s.size) + 'px;';
            str += 'line-height:' + (s.size) + 'px;';
            str += 'color:'+s.color1+';';
            str += 'text-align:center;';
            str += 'border-radius:'+s.borderRadius+'px;';
            str += 'font-size:' + s.icon_fontSize + 'px;';
            return str;
        }
        var str = '';
        str += '<div class="icon '+className+'" style="' + getStyle() + '" data-id="'+props.id+'">';
        str += '<div class="'+props.className+'"></div>';
        str += '</div>';
        return str;
    },
    button: function (props,className) {
        var s = props.style|| app.style.top_menu;
        function getStyle() {
            var str = '';
            str += 'float:' + props.float + ';';
            str += 'padding:0 '+s.padding+'px;';
            str += 'height:' + (s.size - (2 * s.vMargin)) + 'px;';
            str += 'line-height:' + (s.size - (2 * s.vMargin)) + 'px;';
            str += 'color:' + s.color2 + ';';
            str += 'margin:' + s.vMargin + 'px ' + s.hMargin + 'px;';
            str += 'background:' + s.color1 + ';';
            str += 'border-radius:' + s.borderRadius + 'px;';
            str += 'font-size:'+s.button_fontSize+'px;';
            return str;
        }
        var str = '';
        str += '<div class="button '+ className +'" style="' + getStyle() + '" data-id="' + props.id + '">';
        str += props.className ?
            topMenu.getItems.icon({
                className: props.className,float:"left",
                style: $.extend({}, s, {size: (s.size - (2 * s.vMargin)),color1: s.color2,
                })
            }):'';
        str += props.text?props.text:'';
        str += '</div>';
        return str;
    },
    dropdown: function (props,className) {
        var s = props.style||app.style.top_menu,size = (s.size - (2 * s.vMargin));
        function getStyle() {
            var str = '';
            str += 'position:relative;';
            str += 'float:' + props.float + ';';
            str += 'width:80px;';
            str += 'padding:0 ' + s.padding + 'px;';
            str += 'height:' + size + 'px;';
            str += 'line-height:' + size + 'px;';
            str += 'background:' + s.color1 + ';';
            str += 'color:' + s.color2 + ';';
            str += 'margin:' + s.vMargin + 'px ' + s.hMargin + 'px;';
            str += 'border-radius:' + s.borderRadius + 'px;';
            str += 'font-size:' + s.button_fontSize + 'px;';
            return str;
        }
        function getPopupStyle(){
            var str = '';
            str +='position:absolute;width:100%;left:0;top:0;z-index: 1;overflow:hidden;';
            str += 'border-radius:'+s.borderRadius+'px;';
            str+='background:'+s.color1+';';
            return str;
        }
        function getItemStyle(){
            var str = '';
            str+='position:relative;width:calc(100% - '+(2*s.padding)+'px);';
            str+='border-radius:'+s.borderRadius+'px;';
            str += 'padding:0 ' + s.padding + 'px;';
            str += 'background:' + s.color1 + ';';
            str += 'color:' + s.color2 + ';';
            str += 'font-size:' + s.button_fontSize + 'px;';
            str+='margin-bottom:'+s.dropdown_item_margin+'px;';
            return str;
        }
        var text = props.options[props.activeIndex].text;
        var str = '';
        str += '<div class="dropdown '+className+'" style="'+getStyle()+'" data-id="' + props.id + '">';
        if(props.open){
            str += '<div class="back-drop" data-id="' + props.id + '"></div>';        
            str += '<div class="dropdown-popup" style="'+getPopupStyle()+'">';
            for(var i = 0; i < props.options.length; i++){
                str += '<div class="dropdown-item" style="'+getItemStyle()+'">';
                str += props.options[i].text;
                str += '</div>';
            }
            str += '</div>';
        }
        else{
            str+=text;
        }
        str += '</div>';
        return str;
    }
}

var getShow = {
    createModes:function(){return app.state.appmode === "create";},
    deleteItem:function(){return app.state.appmode === "edit";},
    selectAll:function(){return app.state.appmode === "edit";},
    mirrorX:function(){return app.state.appmode === "edit"},
    mirrorY: function () { return app.state.appmode === "edit" },
    break: function () { return app.state.appmode === "edit" },
    weld: function () { return app.state.appmode === "edit" },
    connect: function () { return app.state.appmode === "edit" },
    join: function () { return app.state.appmode === "edit" },
    divide: function () { return app.state.appmode === "edit" },
};
var getCallback={
    setAppMode: function (item) {
        if (app.state.appmode === "create") {app.state.appmode = "edit";item.text = "Edit";}
        else {app.state.appmode = "create";item.text = "Create";}
    }, 
}

function findItemById(id){
    for (var i = 0; i < items.length; i++) {
        if (items[i].id === id) { return this.items[i]; }
    }
}
    
function getItem(){

}
