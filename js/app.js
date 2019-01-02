var app = {
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
        lightFontColor: '#fff',
        box_shadow: '4px 4px 10px 0px rgba(0,0,0,0.6)',
        font_color: '#fff',
        background: "#3e4146",
        top_menu: {
            size: 36,
            color1: "#ddd",
            color2: "#222",
            padding: 8,
            button_fontSize: 12,
            icon_fontSize: 18,
            item_height: 26,
            icon_width:30,
            hMargin: 2,
            vMargin: 6,
            item_borderWidth: 1,
            borderRadius: 3,
            header_background: "#222",
            dropdown_item_margin: 6,
        },
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
        display.render();
    },

    canvasmousedown: function () {
        window[this.state.appmode].mousedown();
    },
    getClient: function (e) { return { x: e.clientX === undefined ? e.changedTouches[0].clientX : e.clientX, y: e.clientY === undefined ? e.changedTouches[0].clientY : e.clientY }; },
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
        if (!s.showLines) { return; }
        for (var i = 0; i < s.lines.length; i++) {
            var line = s.lines[i];
            if (line.show === false) { continue; }
            this.drawLine(line);
        }
    },
    drawPoints: function () {
        var s = this.state;
        if (!s.showPoints) { return; }
        for (var i = 0; i < s.points.length; i++) {
            var point = s.points[i];
            if (point.show === false) { continue; }
            point.connectedLines = point.connectedLines || [];
            var linesCount = point.connectedLines.length;
            if (linesCount === 1) { this.drawOpenPoint(point) }
            else { this.drawPoint(point); }
        }
    },
    drawLine: function (line) {
        this.canvas.drawLine({
            start: { x: line.start.x, y: line.start.y },
            end: { x: line.end.x, y: line.end.y },
            color: line.color
        });
    },
    drawPoint: function (point) {
        this.canvas.drawArc({
            x: point.x,
            y: point.y,
            radius: 2,
            color: "#fff",
            mode: "fill"
        });
    },
    drawOpenPoint: function (point) {
        this.canvas.drawRectangle({ position: "center", x: point.x, y: point.y, width: 4, height: 4, color: "#fff", mode: "fill" });
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
        var coords = obj.coords || this.canvas.getMousePosition(), is = obj.is || {}, isnt = obj.isnt || {}, area = obj.area || 18 / this.canvas.getZoom(), points = this.state.points;
        for (var i = 1; i < area; i += 2) {
            for (var j = 0; j < points.length; j++) {
                var point = points[j];
                var isFiltered = false;
                for (var prop in is) { if (point[prop] !== is[prop]) { isFiltered = true; break; } }
                if (isFiltered) { continue; }
                for (var prop in isnt) { if (point[prop] === isnt[prop]) { isFiltered = true; break; } }
                if (isFiltered) { continue; }
                if (Math.abs(point.x - coords.x) > i) { continue; }
                if (Math.abs(point.y - coords.y) > i) { continue; }
                return point;
            }
        }
        return false;
    },
    getLine: function (obj) {
        var c = this.canvas,coords = obj.coords || c.getMousePosition(), is = obj.is || {}, 
        isnt = obj.isnt || {}, area = obj.area || 18 / c.getZoom(), lines = app.state.lines;
        for (var i = 1; i < area; i += 2) {
            for (var j = 0; j < lines.length; j++) {
                var line = lines[j],s=line.start,e = line.end,dip = Lines.getDip(line),isFiltered = false,
                    minX = Math.min(s.x, e.x),maxX = Math.max(s.x, e.x),minY = Math.min(s.y, e.y),maxY = Math.max(s.y, e.y);
                for (var prop in is) { if (line[prop] !== is[prop]) { isFiltered = true; break; } }
                if (isFiltered) { continue; }
                for (var prop in isnt) { if (line[prop] === isnt[prop]) { isFiltered = true; break; } }
                if (isFiltered) { continue; }
                if (dip === "infinity") { if (Math.abs(minX - coords.x) > i || coords.y < minY || coords.y > maxY) { continue; } }
                else if (Math.abs(dip) <= 1) { if (coords.x < minX || coords.x > maxX || Math.abs(((dip * (coords.x - s.x)) + s.y) - coords.y) > i) { continue; } }
                else { if (coords.y < minY || coords.y > maxY || Math.abs((((coords.y - s.y) / dip) + s.x) - coords.x) > i) { continue; } }
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
    mousemove: function (e) {
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

    windowMouseDown: function (e) {
        app.x = app.getClient(e, "X");
        app.y = app.getClient(e, "Y");
        app.eventHandler("window", "mousemove", app.windowMouseMove);
        app.eventHandler("window", "mouseup", app.windowMouseUp);


    },
    windowMouseMove: function (e) {
        app.x = app.getClient(e, "X");
        app.y = app.getClient(e, "Y");
    },
    windowMouseUp: function (e) {
        clearInterval(create.autoPanInterval);
        app.eventRemover("window", "mousemove", app.windowMouseMove);
        app.eventRemover("window", "mouseup", app.windowMouseUp);

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
    getMin:function(a,b){if(a<=b){return a;}else{return b;}},
    getMax:function(a,b){if(a<=b){return b;}else{return a;}},
}


function Icon(props) {
    var s = props.style || app.style.top_menu;
    var size = s.size - (2 * s.vMargin);
    function getStyle() {
        var str = '';
        str += 'position:relative;';
        str += 'float:' + props.float + ';';
        str += 'width:' + s.icon_width + 'px;';
        str += 'height:' + s.item_height + 'px;';
        str += 'line-height:' + s.item_height + 'px;';
        str += 'margin:' + s.vMargin + 'px ' + s.hMargin + 'px;';
        str += 'text-align:center;';
        if (props.background) { str += 'color:' + s.color2 + ';background:' + s.color1 + ';'; }
        else { str += 'color:' + s.color1 + ';'; }
        str += 'border-radius:' + s.borderRadius + 'px;';
        str += 'font-size:' + s.icon_fontSize + 'px;';
        return str;
    }
    var str = '';
    str += '<div class="icon" style="' + getStyle() + '" data-id="' + props.id + '">';
    str += '<div class="' + props.className + '"></div>';
    str += '</div>';
    return str;
}
function Button(props) {
    var s = props.style || app.style.top_menu;
    function getStyle() {
        var str = '';
        str += 'float:' + props.float + ';';
        if (props.width) {
            str += 'width:' + props.width + 'px;';
        }
        else {
            str += 'padding:0 ' + s.padding + 'px;';
        }
        str += 'height:' + s.item_height + 'px;';
        str += 'line-height:' + s.item_height + 'px;';
        str += 'text-align:center;';
        if (props.background) { str += 'color:' + s.color2 + ';background:' + s.color1 + ';'; }
        else { str += 'color:' + s.color1 + ';'; }
        str += 'margin:' + s.vMargin + 'px ' + s.hMargin + 'px;';
        str += 'border-radius:' + s.borderRadius + 'px;';
        str += 'font-size:' + s.button_fontSize + 'px;';
        return str;
    }
    var str = '';
    str += '<div class="button" style="' + getStyle() + '" data-id="' + props.id + '">';
    str += props.className ?
        display.getElement.icon({
            className: props.className, float: "left",
            style: $.extend({}, s, {
                size: (s.size - (2 * s.vMargin)), color1: s.color2,
            })
        }) : '';
    str += props.text ? props.text : '';
    str += '</div>';
    return str;
}
function Dropdown (props) {
    var s = props.style || app.style.top_menu, size = (s.size - (2 * s.vMargin) - 2);
    function getStyle() {
        var str = '';
        str += 'position:relative;';
        str += 'float:' + props.float + ';';
        str += 'width:'+props.width+'px;';
        str += 'padding:0 ' + s.padding + 'px;';
        str += 'height:' + (s.item_height - 2) + 'px;';
        if (props.background) { str += 'color:' + s.color2 + ';background:' + s.color1 + ';'; }
        else { str += 'color:' + s.color1 + ';'; }
        str += 'line-height:' + s.item_height + 'px;';
        str += 'margin:' + s.vMargin + 'px ' + s.hMargin + 'px;';
        str += 'border-radius:' + s.borderRadius + 'px;';
        str += 'font-size:' + s.button_fontSize + 'px;';
        str += 'border:1px solid'+s.color1+';';
        if(props.disable === true){str+='opacity:0.2;';}
        return str;
    }
    function getPopupStyle() {
        var str = '';
        str += 'position:absolute;width:calc(100% - 0px);left:-1px;top:-1px;z-index: 10;overflow:hidden;';
        if (props.background) {str += 'background:' + s.color1 + ';';}
        else {str += 'background:' + s.color2 + ';';}
        str += 'border-radius:' + s.borderRadius + 'px;';
        str += 'border:1px solid;';

        return str;
    }
    function getItemStyle() {
        var str = '';
        str += 'position:relative;width:calc(100% - ' + (2 * s.padding) + 'px);';
        str += 'border-radius:' + s.borderRadius + 'px;';
        str += 'padding:0 ' + s.padding + 'px;';
        if (props.background) { str += 'background:' + s.color1 + ';color:' + s.color2 + ';'; }
        else { str += 'background:' + s.color2 + ';color:' + s.color1 + ';'; }
        str += 'font-size:' + s.button_fontSize + 'px;';
        str += 'margin-bottom:' + s.dropdown_item_margin + 'px;';
        str += 'margin-top:' + s.dropdown_item_margin + 'px;';
        return str;
    }
    function getCaretStyle() {
        var str = '';
        str+='position: absolute;';
        str+='right:8px;';
        str+='top:calc(50% - 2px);';
        str+='border-top:4px solid '+(props.background?s.color2:s.color1)+';';
        str+='border-left:4px solid transparent;';
        str += 'border-right:4px solid transparent;';
        return str;
    }
    function getTitleStyle(){
        var str = '';
        str += 'position:absolute;';
        str += 'height:' + (s.item_height - 2) + 'px;';
        str += 'color:' + s.color1 + ';';
        str += 'line-height:' + s.item_height + 'px;';
        str += 'font-size:' + s.button_fontSize + 'px;';
        str += 'top:0;';
        str += 'right:calc(100% + '+(s.hMargin * 2)+'px);';
        return str;
    }
    var str = '';
    str += '<div class="dropdown" style="' + getStyle() + '" data-id="' + props.id + '">';
    if(props.title){
        str+='<div class="dropdown-title" style="'+getTitleStyle()+'">';
        str+=props.title;
        str+='</div>';
    }
    str += '<div style="' + getCaretStyle() + '"></div>';
    if (props.open) {
        str += '<div class="back-drop" data-id="' + props.id + '"></div>';
        str += '<div class="dropdown-popup" style="' + getPopupStyle() + '">';
        for (var i = 0; i < props.options.length; i++) {
            str += '<div class="dropdown-item" style="' + getItemStyle() + '" data-index="'+i+'">';
            str += props.options[i].text;
            str += '</div>';
        }
        str += '</div>';
    }
    else {
        str += props.text;
    }
    str += '</div>';
    return str;
}
var display = {
    containers: [
        {
            id: "top-menu",height:36,
            getStyle: function () {
                var str = '', s = app.style.top_menu;
                str += 'position:fixed;left:0;top:0;width:calc(100% - '+(s.hMargin)+'px);z-index:10;';
                str += 'background:' + s.header_background + ';';
                str += 'padding:0 '+(s.hMargin/2)+'px;';
                return str;
            }
        },
        {
            id: "sub-menu",
            getStyle: function () {
                var s = app.style.top_menu, str = 'position:fixed;left:0;width:calc(100% - '+(s.hMargin)+'px);top:' + s.size + 'px;z-index:1;';
                str += 'background:' + s.header_background + ';';
                str += 'padding:0 '+(s.hMargin/2)+'px;';
                return str;
            }
        }
    ],
    items: [
        { id: "mainMenu", component: "Icon", className: "mdi mdi-menu", float: "left", containerId: "top-menu" },
        {
            id: "setAppMode", component: "Button", float: "left", text: "Create", containerId: "top-menu", width: 50, background: true,
            callback: function (item) {
                if (app.state.appmode === "create") { app.state.appmode = "edit"; item.text = "Edit"; }
                else { app.state.appmode = "create"; item.text = "Create"; }
            },
        },
        {
            id: "createModes", component: "Dropdown", float: "left", text: "Polyline", activeIndex: 0, open: false, containerId: "top-menu",width:85,
            options: [{ text: "Polyline",value:"polyline" }, { text: "Rectangle",value:"rectangle" }, { text: "NGon",value:"ngon" }, ],
            callback: function (value) { app.state.createmode = value; },
            show: function () { return app.state.appmode === "create"; },
        },
        {
            id: "editModes", component: "Dropdown", float: "left", text: "Modify", activeIndex: 0, 
            open: false, containerId: "top-menu", width: 85,
            options: [{ text: "Modify",value:"modify" },{ text: "Add Point", value: "addPoint" },{text:"connect",value:"connectPoints"},{ text: "Chamfer", value: "chamfer" },{ text: "Join Lines",value:"joinLines" },
                { text: "Offset Line", value: "offsetLine" },{ text: "Extend Line", value: "extendLine" },{ text: "Plumb Line", value: "plumbLine" },{ text: "Divide Line", value: "divide" }],
            callback: function (value) { app.state.editmode = value; },
            show: function () { return app.state.appmode === "edit"; },
        },
        { id: "layer", component: "Icon", className: "mdi mdi-buffer", float: "right", containerId: "top-menu" },
        { id: "snap", component: "Icon", className: "mdi mdi-magnet", float: "right", containerId: "top-menu" },
        { id: "undo", component: "Icon", className: "mdi mdi-undo-variant", float: "right", containerId: "top-menu"},
        { id: "settings", component: "Icon", className: "mdi mdi-settings", float: "left", containerId: "top-menu" },

        {
            id: "deleteItem", component: "Icon", className: "mdi mdi-delete", float: "left", containerId: "sub-menu",
            show: function () { return app.state.appmode === "edit" && app.state.editmode === "modify"; },
        },
        {
            id: "selectAll", component: "Icon", className: "mdi mdi-select-all", float: "left", containerId: "sub-menu",
            show: function () { return app.state.appmode === "edit" && app.state.editmode === "modify"; },
        },
        {
            id: "mirrorX", component: "Icon", className: "mdi mdi-unfold-more-horizontal", float: "left", containerId: "sub-menu",
            show: function () { return app.state.appmode === "edit" && app.state.editmode === "modify"; },
        },
        {
            id: "mirrorY", component: "Icon", className: "mdi mdi-unfold-more-vertical", float: "left", containerId: "sub-menu",
            show: function () { return app.state.appmode === "edit" && app.state.editmode === "modify"; },
        },
        {
            id: "breakPoint", component: "Button", className: "", float: "left", text: "Break", containerId: "sub-menu",
            show: function () { return app.state.appmode === "edit" && app.state.editmode === "modify" && edit.modify.selectMode === "Point"; },
        },
        {
            id: "weld", component: "Button", className: "", float: "left", text: "Weld", containerId: "sub-menu",
            show: function () { return app.state.appmode === "edit" && app.state.editmode === "modify" && edit.modify.selectMode === "Point"; },
        },
        {
            id: "selectMode", component: "Dropdown", float: "right", text: "Point", open: false, containerId: "sub-menu", width: 45,title:"Mode:",
            options: [{ text: "Point",value:"Point" },{ text: "Line", value: "Line" },{text:"Spline",value:"Spline"}],
            callback: function (value) { edit.modify.selectMode = value; },
            show: function () { return app.state.appmode === "edit" && app.state.editmode === "modify"; },
        },
    ],
    
    getObject: function (id) {for (var i = 0; i < this.items.length; i++) {if (this.items[i].id === id) { return this.items[i]; }}},
    render: function () {
        var str = '';
        for (var i = 0; i < this.containers.length; i++) {
            var container = this.containers[i];
            $('#' + container.id).remove();
            str += '<div id="' + container.id + '" style="' + container.getStyle() + '"></div>';
        }
        $("body").append(str);
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            if (item.show && item.show() === false) { continue; }
            $("#" + item.containerId).append(window[item.component](item));
        }
        app.eventHandler(".dropdown", "mousedown", function () {
            display.getObject($(this).attr("data-id")).open = true; display.render();
        });
        app.eventHandler(".dropdown .dropdown-item", "mousedown", function () {
            var itemElement = $(this);
            var index = itemElement.attr("data-index");
            var parentElement = itemElement.parents(".dropdown");
            var parentObject = display.getObject(parentElement.attr("data-id"));
            var option = parentObject.options[index];
            parentObject.text = option.text;
            parentObject.open = false;
            if (parentObject.callback) { parentObject.callback(option.value); }
            display.render();
        });
        app.eventHandler(".button,.icon", "mousedown", function () {
            var id = $(this).attr("data-id");
            var object = display.getObject(id);
            if (object.callback) { object.callback(object); };
            display.render();
        });
        app.eventHandler(".dropdown .back-drop", "mousedown", function () { var item = display.getObject($(this).attr("data-id")).open = false; display.render(); });
        if(create.drawing){create.end();}
    },
};


