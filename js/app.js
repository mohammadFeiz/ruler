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
            header_background:"#222"
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
    canvasmousedown: function (e) {
        var s = this.state,mode = window[s.appmode],subMode = s[s.appmode+"mode"];
        mode.mousedown(e);
    },
    getClient: function (e) { return { x: e.clientX === undefined ? e.changedTouches[0].clientX : e.clientX, y: e.clientY === undefined ? e.changedTouches[0].clientY : e.clientY }; },
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
}
var topMenu = {
    findItemById:function(id){for (var i = 0; i < this.items.length; i++) {if (this.items[i].id === id) { return this.items[i]; }}},
    findSubItemById: function (id) {for (var i = 0; i < this.subItems.length; i++) {if (this.subItems[i].id === id) {return this.subItems[i];}}},
    items: [
        {
            id: "mainMenu",type: "icon", className: "mdi mdi-menu", float: "left",
        },

        {
            id: "setAppMode", type: "button", float: "left", text: "Create",
            callback: function (item) {
                if (app.state.appmode === "create") {app.state.appmode = "edit";item.text = "Edit";}
                else {app.state.appmode = "create";item.text = "Create";}
            }, 
        },

        {
            type: "dropdown", float: "left", text: "Select Mode", activeIndex: 0,
            show: function () {return app.state.appmode === "edit"},
            options: [{text:"Point",},{text: "Line",},{text: "Spline",},{text: "Object",},]
        },

        {
            type: "dropdown", float: "left", text: "Create Mode", activeIndex: 0,
            show: function () { return app.state.appmode === "create" },
            options: [{ text: "Polyline", },{ text: "Rectangle", },{ text: "NGon", },]
        },

        { type: "icon", className: "mdi mdi-buffer", float: "right", },

        { type: "icon", className: "mdi mdi-magnet", float: "right", },

        { type: "icon", className: "mdi mdi-undo-variant", float: "right", },

        { type: "icon", className: "mdi mdi-settings", float: "left", },
    ],
    subItems: [
        {
            type: "button", className: "mdi mdi-delete", float: "left",
            show: function () { return app.state.appmode === "edit" },
        },
        {
            type: "button", className: "mdi mdi-select-all", float: "left",
            show: function () { return app.state.appmode === "edit" },
        },
        {
            type: "button", className: "mdi mdi-unfold-more-horizontal", float: "left",
            show: function () { return app.state.appmode === "edit" },
        },
        {
            type: "button", className: "mdi mdi-unfold-more-vertical", float: "left",
            show: function () { return app.state.appmode === "edit" },
        },
        {
            type: "button", className: "", float: "left", text: "Break",
            show: function () { return app.state.appmode === "edit" },
        },
        {
            type: "button", className: "", float: "left", text: "Weld",
            show: function () { return app.state.appmode === "edit" },
        },
        {
            type: "button", className: "", float: "left", text: "Connect",
            show: function () { return app.state.appmode === "edit" },
        },
        {
            type: "button", className: "", float: "left", text: "Join",
            show: function () { return app.state.appmode === "edit" },
        },
        {
            type: "button", className: "", float: "left", text: "Divide",
            show: function () { return app.state.appmode === "edit" },
        },
    ],
    
    getStyle:function(){
        var str = '',s = app.style.top_menu;
        str += 'position:fixed;left:0;top:0;width:100%;';
        str += 'height:' + s.top_menu_size + 'px;';
        str += 'background:' + s.header_background + ';';
        return str;
    },
    render: function () {
        $(".top-menu,.sub-menu").remove();
        var s = app.style;
        var str = '<div class="top-menu" style="' + this.getStyle() + '">';
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            if (item.show && item.show() === false) { continue; }
            str += this.getItems[item.type](item,"top-menu-item");
        }
        str += '</div>';
        str += this.getSubMenu();
        $("body").append(str);
        app.eventHandler(".top-menu-item","mousedown", function () {
            var item = topMenu.findItemById($(this).attr("data-id"));
            item.callback(item);
            topMenu.render();
        });
    },
    getSubMenu:function(){
        var s = app.style.top_menu;
        function getStyle() {
            var str = 'position:fixed;left:0;width:100%;top:' + s.size + 'px;';
            str += 'background:' + s.header_background + ';';
            return str;
        }
        var str = '';
        str += '<div class="sub-menu" style="'+getStyle()+'">';
        for (var i = 0; i < this.subItems.length; i++) {
            var item = this.subItems[i];
            if (item.show && item.show() === false) { continue; }
            str += this.getItems[item.type](item,"sub-menu-item");
        }
        str += '</div>';
        return str;

    },
    getItems: {
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
            str += '<div class="'+className+'" style="' + getStyle() + '" data-id="'+props.id+'">';
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
            str += '<div class="'+className+'" style="' + getStyle() + '" data-id="' + props.id + '">';
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
            var s = props.style||app.style.top_menu,size = (s.size - (2 * s.vMargin) - (2 * s.item_borderWidth));
            function getStyle() {
                var str = '';
                str += 'float:' + props.float + ';';
                str += 'padding-left:' + s.padding + 'px;';
                str += 'padding-right:' + (s.padding/3 - (s.item_borderWidth)) + 'px;';
                str += 'height:' + size + 'px;';
                str += 'line-height:' + size + 'px;';
                str += 'color:' + s.color1 + ';';
                str += 'margin:' + s.vMargin + 'px ' + s.hMargin + 'px;';
                str += 'border-radius:' + s.borderRadius + 'px;';
                str += 'border:'+s.item_borderWidth+'px solid;';
                str += 'font-size:' + s.button_fontSize + 'px;';
                return str;
            }
            var text = props.options[props.activeIndex].text;
            var str = '';
            str += '<div class="'+className+'" style="' + getStyle() + '" data-id="' + props.id + '">';
            str += props.text;
            str += topMenu.getItems.button({text: text,float: "right",
                style: $.extend({},s, {size: size,vMargin: s.vMargin / 3,hMargin: s.hMargin / 3,borderRadius:s.borderRadius/2})
            });
            str += '</div>';
            return str;
        }
    }
};