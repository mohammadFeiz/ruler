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
        components.init({ style: app.style });
        display.render();
    },

    canvasmousedown: function (e) {
        window[this.state.appmode].mousedown(e);
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
        this.canvas.drawLine(line);
    },
    drawPoint: function (point) { this.canvas.drawArc({ x: point.x, y: point.y, radius: 2, fill: point.selected === true ? "red" : "#fff" }); },
    drawOpenPoint: function (point) { this.canvas.drawRectangle({ center: true, x: point.x, y: point.y, width: 4, height: 4, fill: point.selected === true ? "red" : "yellow" }); },
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
                if (Math.abs(point.x - coords.x) > i) { continue; }
                if (Math.abs(point.y - coords.y) > i) { continue; }
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
    init: function (obj) { for (var prop in obj) { this.state[prop] = obj[prop]; } },
    items: [],
    findItem: function (id) { for (var i = 0; i < this.items.length; i++) { if (this.items[i].id === id) { return this.items[i]; } } },
    add: function (item) {
        for (var i = 0; i < components.items.length; i++) { if (components.items[i].id === item.id) { components.items[i] = item; return; } }
        components.items.push(item);
    },
    render: function (obj) {
        components.add(obj);
        return components[obj.component](obj);
    },
    Button: function (obj) {
        var text = obj.text; text = typeof text === "function" ? text() : text;
        var iconClass = obj.iconClass || ""; iconClass = typeof iconClass === "function" ? iconClass() : iconClass;
        var attrs = '';
        if (obj.attrs) {for (var prop in obj.attrs) {attrs+=' ' + prop + '="' + obj.attrs[prop] + '"'}}
        var str = '<div class="' + (obj.className || '') + '" id="' + obj.id + '"'+attrs+'style="'+(obj.style||'')+'">';
        str += iconClass ? '<div class="button-icon ' + iconClass + '"></div>' : '';
        str += text!==undefined ? '<div class="button-text">' + text + '</div>' : '';
        str += '</div>';
        if (obj.callback) {
            $('body').off('mousedown', '#' + obj.id);
            $('body').on('mousedown', '#' + obj.id, function (e) {
                var element = $(e.currentTarget);
                var item = components.findItem(element.attr("id"));
                item.callback(e);
            });
        }
        return str;
    },
    Numberbox: function (obj) {
        var str = '';
        str += '<div class="' + (obj.className || '') + '" id="' + obj.id + '" data-step="' + obj.step + '">';
        str += obj.value === undefined ? '' : obj.value;
        str += '</div>';
        $('body').off('mousedown', '#' + obj.id);
        $('body').on('mousedown', '#' + obj.id, function (e) {
            var element = $(e.currentTarget);
            var id = element.attr("id");
            var item = components.findItem(id);
            if(item.callback){
                keyboard.open({
                    fields:[{prop:"value",title:"value",value:item.value}],
                    title:"Inter Number", 
                    close:true,
                    id:id,
                    negative:obj.negative===undefined?true:obj.negative,
                    callback:item.callback,   
                });
            }
            
        });
        return str;
    },
    Dropdown: function (obj) {
        var container = $(obj.container);
        var text = obj.text || ""; text = typeof text === "function" ? text() : text;
        var str = '';
        str += '<div class="' + (obj.className || '') + '" id="' + obj.id + '">';
        /**/str += '<div class="dropdown-text">' + text + '</div>';
        str += '<div class="back-drop dropdown-back-drop"></div>';
        str += '<div class="dropdown-popup">';
        for (var i = 0; i < obj.options.length; i++) {
            str += '<div class="dropdown-item" data-index="' + i + '">' + obj.options[i].text + '</div>';
        }
        str += '</div>';
        str += '</div>';
        var dropdownText = '#' + obj.id + " .dropdown-text";
        $('body').off('mousedown', dropdownText);
        $('body').on('mousedown', dropdownText, function (e) {
            var dropdown = $(e.currentTarget).parent();
            dropdown.find(".back-drop").show();
            dropdown.find(".dropdown-popup").show();
        });

        var backDrop = '#' + obj.id + " .back-drop";
        $('body').off('mousedown', backDrop);
        $('body').on('mousedown', backDrop, function (e) {
            var dropdown = $(e.currentTarget).parent();
            dropdown.find(".back-drop").hide();
            dropdown.find(".dropdown-popup").hide();
        });
        if (obj.callback) {
            var item = '#' + obj.id + " .dropdown-item";
            $('body').off('mousedown', item);
            $('body').on('mousedown', item, function (e) {
                var item = $(e.currentTarget);
                var index = item.attr("data-index");
                var dropdown = item.parent().parent();
                var id = dropdown.attr("id");
                var object = components.findItem(id);
                var option = object.options[index];
                dropdown.find(".dropdown-text").html(option.text);
                object.callback(option.value);
                dropdown.find(".back-drop").hide();
                dropdown.find(".dropdown-popup").hide();
            });
        }
        return str;
    },
    DIV:function(obj){
        var attrs = '';
        if (obj.attrs) { for (var prop in obj.attrs) { attrs += ' ' + prop + '="' + obj.attrs[prop] + '"' } }
        var str = '<div class="' + (obj.className || '') + '" id="' + obj.id + '"' + attrs + 'style="' + (obj.style || '') + '"></div>';
        if (obj.callback) {
            $('body').off('mousedown', '#' + obj.id);
            $('body').on('mousedown', '#' + obj.id, function (e) {
                var element = $(e.currentTarget);
                var item = components.findItem(element.attr("id"));
                item.callback(e);
            });
        }
        return str;
    },
    Slider: function (obj) {
        obj.style = obj.style || { button_width: 24, button_height: 24, line_width: 4 };
        return new slider(obj).getHTML();
    },
    update: function (id, obj) {
        var item = components.findItem(id);
        for (var prop in obj) { item[prop] = obj[prop]; }
        $("#" + id).replaceWith(components[item.component](item));
    },
}







var display = {
    containers: [{ id: "top-menu", }, { id: "sub-menu", }],
    items: [
        { component: "Button", id: "main-menu", iconClass: "mdi mdi-menu", className: "icon", container: "#top-menu" },
        {
            component: "Button", id: "set-app-mode", className: "button", container: "#top-menu",
            text: function () { return app.state.appmode === "create" ? "Create" : "Edit"; },
            callback: function (item) {
                create.end();
                if (app.state.appmode === "create") { app.state.appmode = "edit"; } else { app.state.appmode = "create"; }
                display.render();
            },
        },
        {
            component: "Dropdown", id: "create-modes", className: "dropdown", container: "#top-menu",
            options: [{ text: "Polyline", value: "polyline" }, { text: "Rectangle", value: "rectangle" }, { text: "NGon", value: "ngon" }, ],
            text: function () {
                switch (app.state.createmode) {
                    case 'polyline': return 'Polyline';
                    case 'rectangle': return 'rectangle';
                    case 'ngon': return 'NGon';
                }
            },
            callback: function (value) { create.end(); app.state.createmode = value; display.render(); },
            show: function () { return app.state.appmode === "create"; },
        },
        {
            component: "Dropdown", id: "edit-modes", className: "dropdown", container: "#top-menu",
            options: [{ text: "Modify", value: "modify" }, { text: "Add Point", value: "addPoint" }, { text: "Chamfer", value: "chamfer" },
            { text: "Offset Line", value: "offsetLine" }, { text: "Extend Line", value: "extendLine" }, { text: "Plumb Line", value: "plumbLine" }],
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
        {
            component: "Dropdown", id: "select-mode", className: "dropdown", container: "#top-menu",
            text: function () { return edit.modify.selectMode },
            options: [{ text: "Point", value: "Point" }, { text: "Line", value: "Line" }, { text: "Spline", value: "Spline" }],
            callback: function (value) { edit.modify.selectMode = value; edit.modify.reset(); display.render(); },
            show: function () { return app.state.appmode === "edit" && app.state.editmode === "modify"; },
        },
        { id: "layer", component: "Button", iconClass: "mdi mdi-buffer", className: "icon", container: "#top-menu", callback:function() { create.end(); edit.end(); layers.open() }},
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
            callback:function(){edit.modify.mirrorX()}
        },
        {
            id: "mirror-y", component: "Button", iconClass: "mdi mdi-unfold-more-vertical", className: "icon", container: "#sub-menu",
            show: function () { return app.state.appmode === "edit" && app.state.editmode === "modify"; },
            callback:function(){edit.modify.mirrorY()}
        },
        {
            id: "break-point", component: "Button", iconClass: "", className: "button", text: "Break", container: "#sub-menu",
            show: function () { return edit.modify.breakPointApprove() },
            callback: function () { edit.modify.breakPoint(); }
        },
        {
            id: "weld", component: "Button", iconClass: "", className: "button", text: "Weld", container: "#sub-menu",
            show: function () { return edit.modify.weldPointApprove() },
            callback: function () { edit.modify.weldPoint(); }
        },
        {
            id: "connect", component: "Button", iconClass: "", className: "button", text: "Connect", container: "#sub-menu",
            show: function () { return edit.modify.connectPointsApprove() },
            callback: function () { edit.modify.connectPoints(); }
        },
        {
            id: "divide", component: "Button", iconClass: "", className: "button", text: "Divide", container: "#sub-menu",
            show: function () { return Lines.selected.length === 1; },
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
            id: "join", component: "Button", iconClass: "", className: "button", text: "Join", container: "#sub-menu",
            show: function () { return Lines.selected.length === 2 && Lines.getMeet(Lines.selected[0], Lines.selected[1]) && !Lines.isConnect(Lines.selected[0], Lines.selected[1]); },
            callback: function () { edit.modify.joinLines(); }
        },


    ],
    render: function () {
        console.log("ok");
        var str = '';
        for (var i = 0; i < this.containers.length; i++) {
            var container = this.containers[i];
            $('#' + container.id).remove();
            str += '<div id="' + container.id + '">';
            for (var j = 0; j < this.items.length; j++) {
                var item = this.items[j];
                if (item.show && item.show() === false) { continue; }
                if (item.container !== '#' + container.id) { continue; }
                str += components.render(item);
            }
            str += '</div>';
        }
        $("body").append(str);


    },
};


