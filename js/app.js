var app = {
    state:{
        lines: [],
        points: [],
        isMobile: false,
        showLines: true,
        showPoints:true,
        appmode: "create",
        createmode: "rectangle",
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



    },
    init:function(){
        var s = this.state;
        this.canvas = new Canvas({
            isMobile:this.state.isMobile,
            container: s.container,
            background: s.background,
            gridLineColor: s.gridLineColor,
            onmousedown:this.canvasmousedown.bind(this)
        });
    },
    canvasmousedown:function(){
        var subMode = this.state.appmode === "create" ? this.state.createmode:this.state.editmode;
        window[this.state.appmode].mousedown({mode:subMode,coords:this.canvas.getMousePosition()});
    },
    getClient: function (e, axis) {
        axis = axis.toUpperCase();
        return e.clientX ? e["client" + axis] : e.changedTouches[0]["client" + axis];
    },
    test: function () {
        var ids = [];
        for (var i = 0; i < canvas.points.length; i++) {
            var point = canvas.points[i];
            if (point.x === undefined) {
                alert("point index" + i + ":missing x");
            };
            if (point.y === undefined) {
                alert("point index" + i + ":missing y");
            };
            if (point.id === undefined) {
                alert("point index" + i + ":missing id");
            };
            var connectedLines = point.connectedLines || alert("point index" + i +
                ":missing connectedLines");
            var length = connectedLines.length || alert("point index" + i +
                ":connectedLines is not an array");
            if (length === 0) {
                alert("point index" + i + ":connectedLines.length === 0");
            }
            if (length > 2) {
                alert("point index" + i + ":connectedLines.length > 2");
            }
            for (var j = 0; j < length; j++) {
                var connectedLine = point.connectedLines[j];
                var id = connectedLine.id || alert("point index" + i + " in connectedLines[" + j +
                    "]:missing id");
                var side = connectedLine.side || alert("point index" + i + " in connectedLines[" + j +
                    "]:missing side");
                var line = lines.getObjectByID(connectedLine.id) || alert("point index" + i +
                    " : connectedLines[" + j + "].id is not an exist line");
                var lineIndex = lines.getIndexByID(connectedLine.id);
                var lineSide = line[side] || alert("point index" + i + " in connectedLines[" + j +
                    "]: " + side + " is not defined");
                var lineSideID = lineSide.id || alert("canvas.lines[" + lineIndex + "]." + side +
                    ".id is not defined");
                var lineSideX = lineSide.x;
                if (lineSideX === undefined) {
                    alert("point index" + i + " in connectedLines[" + j + "]: " + side + " missing x");
                };
                var lineSideY = lineSide.y;
                if (lineSideY === undefined) {
                    alert("point index" + i + " in connectedLines[" + j + "]: " + side + " missing y");
                };
                if (lineSideID !== point.id) {
                    alert("point index" + i + " in connectedLines[" + j + "]: id of " + side +
                        " is not equal point id");
                }
                if (lineSideX !== point.x) {
                    alert("point index" + i + " in connectedLines[" + j + "]:" + side +
                        ".x is not equal point.x");
                }
                if (lineSideY !== point.y) {
                    alert("point index" + i + " in connectedLines[" + j + "]:" + side +
                        ".y is not equal point.y");
                }
                if (line.layer !== point.layer) {
                    alert("point index" + i + " in connectedLines[" + j +
                        "]:point and line arent in same layer");
                }
            }
        }
        for (var i = 0; i < canvas.lines.length; i++) {
            var line = canvas.lines[i];
            var lineID = line.id || alert("canvas.lines[" + i + "].id is not defined");
            var start = line.start || alert("canvas.lines[" + i + "].start is not defined");
            var startID = start.id || alert("canvas.lines[" + i + "].start.id is not defined");
            var startX = start.x;
            if (startX === undefined) {
                alert("canvas.lines[" + i + "].start.x is not defined");
            }
            var startY = start.y;
            if (startY === undefined) {
                alert("canvas.lines[" + i + "].start.y is not defined");
            }
            var startPoint = points.getObjectByID(startID) || alert("canvas.lines[" + i +
                "].start.id :there is not a point with this id(" + startID + ")");
            var end = line.end || alert("canvas.lines[" + i + "].end is not defined");
            var endID = end.id || alert("canvas.lines[" + i + "].end.id is not defined");
            var endX = end.x;
            if (endX === undefined) {
                alert("canvas.lines[" + i + "].end.x is not defined");
            }
            var endY = end.y;
            if (endY === undefined) {
                alert("canvas.lines[" + i + "].end.y is not defined");
            }
            var endPoint = points.getObjectByID(endID) || alert("canvas.lines[" + i +
                "].end.id :there is not a point with this id(" + startID + ")");
            if (!points.isConnect(startPoint, endPoint)) {
                alert("canvas.lines[" + i + "] :start point and end point are not connected");
            }
        }
    },
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
    drawLine:function(line){
        this.canvas.drawLine({
            start: {x: line.start.x,y: line.start.y},
            end: {x: line.end.x,y: line.end.y},
            color: line.color
        });
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
    createitems: {
        polyline: { title: "Polyline", iconClass: "mdi mdi-vector-polyline" },
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
        var value = obj.value[0];
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
    //init: function () {
    //    app.drawControlWidth = Math.ceil(app.sizeA * 3.5);
    //    app.setappmodeitems();
    //    app.eventHandler("#snap", "mousedown", Snap.open);
    //    app.eventHandler("#tools-setting", "mousedown", toolsSetting.open);
    //    app.eventHandler("#layer", "mousedown", function () {
    //        create.end();
    //        edit.end(); layers.open();
    //    });
    //    app.eventHandler(".zoom", "mousedown", app.zoom);
    //    app.eventHandler(".switch", "mousedown", app.switchButton);
    //    app.eventHandler(".axis-icon,#axisBackground", "mousedown", edit.modify.buttonmousedown);
    //    app.eventHandler("#undo-button", "mousedown", undo.load);
    //    app.eventHandler("#side-menu-button", "mousedown", sideMenu.open);
    //    //app.eventHandler("#log", "mousedown", log.show);
    //    //app.eventHandler("#log-clear", "mousedown", log.clear);
    //    //app.eventHandler("#log-hide", "mousedown", log.hide);

    //},
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

    mousedown:function(e){
        this.x = app.getClient(e, "X");
        this.y = app.getClient(e, "Y");
        this.eventHandler("window", "mousemove", this.mousemove);
        this.eventHandler("window", "mouseup", this.mouseup);
        

    },
    mousemove:function(e){
        this.x = app.getClient(e, "X");
        this.y = app.getClient(e, "Y");
    },
    mouseup: function (e) {
        clearInterval(create.autoPanInterval);
        this.eventRemover("window", "mousemove", this.mousemove);
        this.eventRemover("window", "mouseup", this.mouseup);
       
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