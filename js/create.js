function spline(config) {
    var a = {
        state: { points: [], close: false, extraData: {}, },
        init: function (obj) {
            for (var prop in obj) { this.state[prop] = obj[prop]; }
            this.state.close = ["rectangle", "ngon"].indexOf(this.state.mode) !== -1;
            this.addPoint(this.state.start);
        },
        addPoint: function (point) {this.state.points.push(point);},
        removePoint: function (index) { this.state.points.splice(index, 1); },
        updatePoint: function (index, obj) {for (var prop in obj) { this.state.points[index][prop] = obj[prop]; }},
        getPoints: function () {
            var s = this.state, points = [];
            if (s.mode === "polyline") { points = s.points; }
            else if (s.mode === "rectangle") {
                var start = s.points[0], end = s.points[1]
                points.push({ x: start.x, y: start.y });
                if (!end) { return points; }
                points.push({ x: start.x, y: end.y });
                points.push({ x: end.x, y: end.y });
                points.push({ x: end.x, y: start.y });
            }
            else if (s.mode === "ngon") {
                var start = s.points[0], end = s.points[1];
                points.push({ x: start.x, y: start.y });
                if (!end) { return points; }
                if (!s.ortho) {
                    var line = { start: { x: start.x, y: start.y }, end: { x: end.x, y: end.y } };
                    var sign = 1;
                }
                else {
                    if (Math.abs(start.x - end.x) >= Math.abs(start.y - end.y)) {
                        var sign = Math.sign(end.x - start.x) * Math.sign(end.y - start.y) || 1;
                        var line = { start: { x: start.x, y: start.y }, end: { x: end.x, y: start.y } };
                    }
                    else {
                        var sign = Math.sign(end.x - start.x) * Math.sign(start.y - end.y) || 1;
                        var line = { start: { x: start.x, y: start.y }, end: { x: start.x, y: end.y } };
                    }
                }
                var radian = Lines.getRadian(line),length = Lines.getLength(line),xs = start.x; var ys = start.y,aa = 360 / s.sides * Math.PI / 180, b = radian * Math.PI / 180;
                for (var i = 0; i < s.sides - 1; i++) {
                    xs += (Math.cos(aa * i * sign - b) * length);
                    ys += (Math.sin(aa * i * sign - b) * length);
                    points.push({ x: xs, y: ys });
                }
            }
            return points;
        },
        getMode: function () { return this.state.mode;},
        getLines: function () {
            var s = this.state, lines = [], points = this.getPoints();
            var length = points.length + (s.close ? 1 : 0);
            for (var i = 1; i < length; i++) {
                var prevIndex = i - 1, index = i, lastPoint = points[prevIndex], point = points[index] || points[0];
                var line = { start: { x: lastPoint.x, y: lastPoint.y }, end: { x: point.x, y: point.y }, color: s.color, };
                lines.push(line);
            }
            return lines;
        },
        close: function () { this.state.close = true; },
        join: function () {
            var points = this.state.points, lines = this.getLines(), firstLine = lines[0], lastLine = lines[lines.length - 1], meet = Lines.getMeet(lastLine, firstLine);
            points[0].x = points[points.length - 1].x = meet.x; points[0].y = points[points.length - 1].y = meet.y;
        },
        getLastPoint: function () { return this.state.points[this.state.points.length - 1]; },
        to: function (obj) { this.addPoint(obj); }
    };
    a.init(config);
    return a;
}
var create = {
    firstPoint: true,
    ngonSides: 6,
    ortho: false,
    mousedown: function (e) {
        app.eventHandler("window", "mousemove", $.proxy(this.mousemove,this));
        app.eventHandler("window", "mouseup", $.proxy(this.mouseup,this));
        var coords = app.canvas.getMousePosition(),close = ["rectangle", "ngon"].indexOf(app.createmode) !== -1;
        if (this.firstPoint) {
            this.object = new spline({ start: coords, color: "#fff", mode: app.state.createmode, sides: this.ngonSides, ortho: this.ortho, close: close });
            this.firstPoint = false;
        } else {
            this.object.addPoint(coords);
            if (close) { this.firstPoint = true; }
        }
        this.preview();
    },
    mousemove: function (e) {
        var coords = app.canvas.getMousePosition(),lastPoint = this.object.getLastPoint();
        lastPoint.x = coords.x; lastPoint.y = coords.y;
        this.preview();
    },
    mouseup: function (e) {
        app.eventRemover("window", "mousemove", this.mousemove);
        app.eventRemover("window", "mouseup", this.mouseup);
        if (this.firstPoint) {this.end();}
    },
    end: function () {
        this.firstPoint = true;
        createControl.close();
        this.save();
        app.redraw();
    },
    preview: function () {
        var points = this.object.getPoints(),lines = this.object.getLines();
        app.canvas.clear();
        for (var i = 0; i < points.length; i++) {app.drawPoint(points[i]);}
        for (var i = 0; i < lines.length; i++) {app.drawLine(lines[i]);}
        this.drawLastPoint();
        this.drawController();
    },
    drawLastPoint: function () {
        var point = this.object.state.points[this.object.state.points.length - 1];
        app.canvas.drawArc({x: point.x,y: point.y,radius: 3,color: "orange",mode: "fill"});
        app.canvas.drawArc({x: point.x,y: point.y,radius: 6,color: "orange",mode: "stroke"});
    },
    drawController: function () {
        var o = this.object,points = o.getPoints(),lines = o.getLines(),lastPoint = points[points.length - 1];
        var control = {end: true,keyboard: true,move: true,pan: true};
        if (o.getMode() === "polyline") {
            control.close = points.length > 2;
            control.join = lines.length > 2 && Lines.getMeet(lines[0], lines[lines.length - 1]) !== false;
            control.remove = points.length > 0;
        }
        control.coords = {x: lastPoint.x,y: lastPoint.y};
        createControl.open(control);
    },
    drawcontrolremove: function () {this.object.state.points.pop();this.preview();},
    drawcontrolclose: function () {this.object.close(); this.end();},
    drawcontroljoin: function () {this.object.join(); this.end();},
    drawcontrolmove: function (e) {
        app.eventHandler("window", "mousemove", this.movemousemove.bind(this));
        app.eventHandler("window", "mouseup", this.movemouseup);
        var lastPoint = this.object.getLastPoint(),client = app.getClient(e);
        this.startOffset = {x: client.x,y: client.y,endX: lastPoint.x,endY: lastPoint.y};
    },
    movemousemove: function (e) {
        var lastPoint = this.object.getLastPoint(), coords = app.getClient(e), so = this.startOffset, zoom = app.canvas.getZoom();
        var coords = app.canvas.getSnapedCoords({x: (coords.x - so.x) / zoom + so.endX,y: (coords.y - so.y) / zoom + so.endY});
        if (lastPoint) {lastPoint.x = coords.x;lastPoint.y = coords.y;}
        this.preview();
    },
    movemouseup: function () {
        app.eventRemover("window", "mousemove", this.movemousemove);
        app.eventRemover("window", "mouseup", this.movemouseup);
    },
    drawcontrolend: function () {this.end();},
    drawcontrolpan: function (e) {
        app.eventHandler("window", "mousemove", this.panmousemove.bind(this));
        app.eventHandler("window", "mouseup", this.panmouseup);
        var screenPosition = app.canvas.getScreenPosition();
        this.startOffset = {x: app.getClient(e, "X"),y: app.getClient(e, "Y"),endX: screenPosition.x,endY: screenPosition.y};
    },
    panmousemove: function (e) {
        var so = this.startOffset, zoom = app.canvas.getZoom(),coords = app.getClient(e);
        var x = (so.x - coords.x) / zoom + so.endX,y = (coords.y - so.y) / zoom + so.endY;
        app.canvas.setScreenTo({x: x,y: y,callback: this.preview.bind(this)});
        this.preview();
    },
    panmouseup: function () {
        app.eventRemover("window", "mousemove", this.panmousemove);
        app.eventRemover("window", "mouseup", this.panmouseup);
    },
    drawcontrolkeyboard: function () {
        var o = this.object,mode = o.getMode();
        keyboard.open({
            isMobile: app.state.isMobile,
            fields: [{ prop: "x", title: "X" }, { prop: "y", title: "y" }],
            negative: true,
            title: mode + " to:",
            close: (mode === "ngon" || mode === "rectangle" || mode === "frame"),
            callback: this.object.to
        });
    },
    save: function () {
        var o = this.object,points = o.getPoints(),lines = o.getLines();
        for (var i = 0; i < points.length; i++) {app.state.points.push(points[i]);}
        for (var i = 0; i < lines.length; i++) {app.state.lines.push(lines[i]);}
    },
}