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
        direction: "ltr",
        lightFontColor: '#fff',
        boxShadow: '4px 4px 10px 0px rgba(0,0,0,0.6)',
        font_color: '#fff',
        background: "#3e4146",
        size: 36,
        light_color: "#ddd",
        dark_color: "#222",
        padding: 4,
        button_fontSize: 12,
        icon_fontSize: 18,
        title_fontSize: 12,
        text_fontSize: 12,
        item_height: 26,
        icon_width: 30,
        hMargin: 2,
        vMargin: 6,
        item_borderWidth: 1,
        borderRadius: 3,
        header_background: "#222",
        dropdown_item_margin: 6,
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
        components.init({ style: app.style });
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
    drawLine: function (line) { this.canvas.drawLine(line); },
    drawPoint: function (point) { this.canvas.drawArc({ x: point.x, y: point.y, radius: 2, color: "#fff", mode: "fill" }); },
    drawOpenPoint: function (point) { this.canvas.drawRectangle({ position: "center", x: point.x, y: point.y, width: 4, height: 4, color: "#fff", mode: "fill" }); },
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
        var c = this.canvas, coords = obj.coords || c.getMousePosition(), is = obj.is || {},
        isnt = obj.isnt || {}, area = obj.area || 18 / c.getZoom(), lines = app.state.lines;
        for (var i = 1; i < area; i += 2) {
            for (var j = 0; j < lines.length; j++) {
                var line = lines[j], s = line.start, e = line.end, dip = c.get.line.dip(line), isFiltered = false,
                    minX = Math.min(s.x, e.x), maxX = Math.max(s.x, e.x), minY = Math.min(s.y, e.y), maxY = Math.max(s.y, e.y);
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
    getMin: function (a, b) { if (a <= b) { return a; } else { return b; } },
    getMax: function (a, b) { if (a <= b) { return b; } else { return a; } },
}

var components = {
    state: {},
    init: function (obj) {for (var prop in obj) {this.state[prop] = obj[prop];}},
    items: [],
    findItem: function (id) { for (var i = 0; i < this.items.length; i++) { if (this.items[i].id === id) { return this.items[i]; } } },
    add: function (item) {
        for (var i = 0; i < components.items.length; i++) {if (components.items[i].id === item.id) {components.items[i] = item;return;}}
        components.items.push(item);
    },
    render: function (obj) {
        var template = components.getTemplate[obj.component](obj);
        $(obj.container).append(template);
        components.add(obj);
        components.setEvents[obj.component](obj)
    },
    setEvents: {
        Button:function(obj){
            var element = $(obj.container).find("#" + obj.id);
            app.eventHandler(element, "mousedown", function () {
                var item = components.findItem($(this).attr("id"));
                if (item.callback) { item.callback(item); }
            });
        },
        Dropdown: function (obj) {
            var dropdown = $(obj.container).find("#" + obj.id);
            var dropdownText = dropdown.find(".dropdown-text");
            app.eventHandler(dropdownText, "mousedown", function () {
                var dropdown = $(this).parent();
                var item = components.findItem(dropdown.attr("id"));
                dropdown.html(components.getTemplate.DropdownPopup(item));
                components.setEvents.DropdownBackdrop(item);
                components.setEvents.DropdownItem(item);
            });
        },
        DropdownBackdrop:function(obj){
            if (!obj) { return; }
            var backdrop = $(obj.container + ' #' + obj.id + ' .back-drop');
            app.eventHandler(backdrop, "mousedown", function () {
                var dropdown = $(this).parent();
                var item = components.findItem(dropdown.attr("id"));
                dropdown.html(components.getTemplate.DropdownTitle(item));
                components.setEvents.Dropdown(item);
            });
        },
        DropdownItem: function (obj) {
            if (!obj) { return; }
            var items = $(obj.container + ' #' + obj.id + ' .dropdown-item');
            app.eventHandler(items, "mousedown", function () {
                var dropdownitem = $(this);
                var index = dropdownitem.attr("data-index");
                var dropdown = dropdownitem.parent().parent();
                var item = components.findItem(dropdown.attr("id"));
                var option = item.options[index];
                item.text = option.text;
                if (item.callback) { item.callback(option.value) }
                dropdown.html(components.getTemplate.DropdownTitle(item));
                components.setEvents.Dropdown(item);
            });
        },
        Icon: function (obj) {components.setEvents.Button(obj);}

    },
    update: function (id, obj) {
        var item = components.findItem(id);
        for (var prop in obj) { item[prop] = obj[prop]; }
        var container = $("#" + item.containerId);
        var element = container.find("#" + id);
        var updatedElement = components.getTemplate[item.component](item);
        element.replaceWith(updatedElement);
        components.setEvents(item);
    },
    getTemplate: {
        Button: function (props) {//id,float,width,background,text
            var text = props.text || "";
            text = typeof text === "function" ? text() : text;
            var iconClass = props.iconClass || "";
            iconClass = typeof iconClass === "function" ? iconClass() : iconClass;
            var str = '<div class="' + (props.className|| '') + '" id="' + props.id + '">';
            str += iconClass?'<div class="button-icon ' + props.iconClass + '"></div>':'';
            str += text?'<div class="button-text">'+text+'</div>':'';
            str += '</div>';
            return str;
        },
        Dropdown: function (props) {
            var str = '';
            str += '<div class="' + (props.className || '') + '" id="' + props.id + '">';
            str += components.getTemplate.DropdownTitle(props);
            str += '</div>';
            return str;
        },
        DropdownPopup: function (props) {
            if (!props) { return; }
            function getPopupStyle() {return 'position:absolute;width:100%;left:-1px;top:-1px;z-index: 10;overflow:hidden;';}
            function getItemStyle() {return 'position:relative;width:100%;';}
            var str = '';
            str += '<div class="back-drop" data-id="' + props.id + '"></div>';
            str += '<div class="dropdown-popup" style="' + getPopupStyle() + '">';
            for (var i = 0; i < props.options.length; i++) {
                str += '<div class="dropdown-item" style="' + getItemStyle() + '" data-index="' + i + '">';
                str += props.options[i].text;
                str += '</div>';
            }
            str += '</div>';
            return str;
        },
        DropdownTitle: function (props) {
            var text = props.text || "";
            text = typeof text === "function" ? text() : text;
            var str = '';
            str += '<div class="dropdown-text">'+text+'</div>';
            return str;
        }
    },
}







var display = {
    containers: [
        {
            id: "top-menu", height: 36,
            getStyle: function () {
                var str = '', s = app.style;
                str += 'position:fixed;left:0;top:0;width:calc(100% - ' + (s.hMargin) + 'px);z-index:10;';
                str += 'background:' + s.header_background + ';';
                str += 'padding:0 ' + (s.hMargin / 2) + 'px;';
                return str;
            }
        },
        {
            id: "sub-menu",
            getStyle: function () {
                var s = app.style, str = 'position:fixed;left:0;width:calc(100% - ' + (s.hMargin) + 'px);top:' + s.size + 'px;z-index:1;';
                str += 'background:' + s.header_background + ';';
                str += 'padding:0 ' + (s.hMargin / 2) + 'px;';
                return str;
            }
        }
    ],
    items: [
        { component: "Button", id: "main-menu", iconClass: "mdi mdi-menu",className:"icon", container: "#top-menu" },
        {
            component: "Button", id: "set-app-mode", className: "button", container: "#top-menu",
            text: function () { return app.state.appmode === "create" ? "Create" : "Edit"; },
            callback: function (item) {
                if (app.state.appmode === "create") { app.state.appmode = "edit"; } else { app.state.appmode = "create"; }
                display.render();
            },
        },
        {
            component: "Dropdown", id: "create-modes",className:"dropdown", container: "#top-menu",
            options: [{ text: "Polyline", value: "polyline" }, { text: "Rectangle", value: "rectangle" }, { text: "NGon", value: "ngon" }, ],
            text: function () {
                switch (app.state.createmode) {
                    case 'polyline': return 'Polyline';
                    case 'rectangle': return 'rectangle';
                    case 'ngon': return 'NGon';
                }
            },
            callback: function (value) { app.state.createmode = value; display.render(); },
            show: function () { return app.state.appmode === "create"; },
        },
        {
            component: "Dropdown", id: "edit-modes",className:"dropdown",container: "#top-menu",
            options: [{ text: "Modify", value: "modify" }, { text: "Add Point", value: "addPoint" }, { text: "Connect", value: "connectPoints" }, { text: "Chamfer", value: "chamfer" }, { text: "Join Lines", value: "joinLines" },
            { text: "Offset Line", value: "offsetLine" }, { text: "Extend Line", value: "extendLine" }, { text: "Plumb Line", value: "plumbLine" }, { text: "Divide Line", value: "divide" }],
            text: function () {
                switch (app.state.editmode) {
                    case 'modify': return 'Modify';
                    case 'addPoint': return 'Add Point';
                    case 'connectPoints': return 'Connect';
                    case 'chamfer': return 'Chamfer';
                    case 'joinLines': return 'Join Lines';
                    case 'offsetLine': return 'Offset Line';
                    case 'extendLine': return 'Extend Line';
                    case 'plumLine': return 'Plumb Line';
                    case 'divideLine': return 'Divide Line';
                }
            },
            callback: function (value) { app.state.editmode = value; display.render(); },
            show: function () { return app.state.appmode === "edit"; },
        },
        { id: "layer", component: "Button", iconClass: "mdi mdi-buffer", className: "icon", container: "#top-menu" },
        { id: "snap", component: "Button", iconClass: "mdi mdi-magnet", className: "icon", container: "#top-menu" },
        {
            id: "settings", component: "Button", iconClass: "mdi mdi-settings", className: "icon", container: "#top-menu",
            callback: function () { window[app.state.appmode].setting(); }
        },

        {
            id: "delete-item", component: "Button", iconClass: "mdi mdi-delete", className: "icon", container: "#sub-menu",
            show: function () { return app.state.appmode === "edit" && app.state.editmode === "modify"; },
        },
        {
            id: "select-all", component: "Button", iconClass: "mdi mdi-select-all", className: "icon", container: "#sub-menu",
            show: function () { return app.state.appmode === "edit" && app.state.editmode === "modify"; },
        },
        {
            id: "mirror-x", component: "Button", iconClass: "mdi mdi-unfold-more-horizontal", className: "icon", container: "#sub-menu",
            show: function () { return app.state.appmode === "edit" && app.state.editmode === "modify"; },
        },
        {
            id: "mirror-y", component: "Button", iconClass: "mdi mdi-unfold-more-vertical", className: "icon", container: "#sub-menu",
            show: function () { return app.state.appmode === "edit" && app.state.editmode === "modify"; },
        },
        {
            id: "break-point", component: "Button", iconClass: "", className: "button", text: "Break", container: "#sub-menu",
            show: function () { return app.state.appmode === "edit" && app.state.editmode === "modify" && edit.modify.selectMode === "Point"; },
        },
        {
            id: "weld", component: "Button", iconClass: "", className: "button", text: "Weld", container: "#sub-menu",
            show: function () { return app.state.appmode === "edit" && app.state.editmode === "modify" && edit.modify.selectMode === "Point"; },
        },
        //{
        //    id: "selectMode", component: "Dropdown", float: "right", text: "Point", open: false, container: "#sub-menu", width: 55, title: "Mode:",
        //    options: [{ text: "Point", value: "Point" }, { text: "Line", value: "Line" }, { text: "Spline", value: "Spline" }],
        //    callback: function (value) { edit.modify.selectMode = value; display.render(); },
        //    show: function () { return app.state.appmode === "edit" && app.state.editmode === "modify"; },
        //},
    ],

    getObject: function (id) { for (var i = 0; i < this.items.length; i++) { if (this.items[i].id === id) { return this.items[i]; } } },
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
            components.render(item);
        }

    },
};


