function spline(config, getPoints) {
    var a = {
        state: { points: [], close: false, extraData: {}, },
        init: function (obj) {
            for (var prop in obj) { this.state[prop] = obj[prop]; }
            this.addPoint(this.state.start);
        },
        addPoint: function (point) { this.state.points.push(point); },
        removePoint: function (index) { this.state.points.splice(index, 1); },
        updatePoint: function (index, obj) { for (var prop in obj) { this.state.points[index][prop] = obj[prop]; } },
        getMode: function () { return this.state.mode; },
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
    a.getPoints = getPoints;
    return a;
}
var create = {
    firstPoint: true,
    ngonSides: 6,
    ortho: true,
    mousedown: function (e) {
        app.eventHandler("window", "mousemove", $.proxy(this.mousemove, this));
        app.eventHandler("window", "mouseup", $.proxy(this.mouseup, this));
        var mode = app.state.createmode, coords = app.canvas.getMousePosition(), close = ["rectangle", "ngon"].indexOf(mode) !== -1;
        if (this.firstPoint) {
            this.object = new spline({ start: coords, color: "#fff", mode: mode, sides: this.ngonSides, ortho: this.ortho, close: close }, this.getPoints[mode]);
            this.firstPoint = false;
        } else {
            this.object.addPoint(coords);
            if (close) { this.firstPoint = true; }
        }
        this.preview();
    },
    mousemove: function (e) {
        var coords = app.canvas.getMousePosition(), lastPoint = this.object.getLastPoint();
        lastPoint.x = coords.x; lastPoint.y = coords.y;
        this.preview();
        autoPan.run(app.canvas.canvasToClient(lastPoint), this.mousemove.bind(this));
    },
    mouseup: function (e) {
        app.eventRemover("window", "mousemove", this.mousemove);
        app.eventRemover("window", "mouseup", this.mouseup);
        if (this.firstPoint) { this.end(); }
        screenCorrection.run(app.canvas.canvasToClient(this.object.getLastPoint()), function () { app.redraw(); create.preview();});
    },
    end: function () {
        this.firstPoint = true;
        createControl.close();
        this.save();
        app.redraw();
    },
    preview: function () {
        var points = this.object.getPoints(), lines = this.object.getLines();
        app.canvas.clear();
        for (var i = 0; i < points.length; i++) { app.drawPoint(points[i]); }
        for (var i = 0; i < lines.length; i++) { app.drawLine(lines[i]); }
        this.drawLastPoint();
        this.drawController();
    },
    drawLastPoint: function () {
        var point = this.object.state.points[this.object.state.points.length - 1];
        app.canvas.drawArc({ x: point.x, y: point.y, radius: 3, color: "orange", mode: "fill" });
        app.canvas.drawArc({ x: point.x, y: point.y, radius: 6, color: "orange", mode: "stroke" });
    },
    drawController: function () {
        var o = this.object, points = o.getPoints(), lines = o.getLines(), lastPoint = points[points.length - 1];
        var control = { end: true, keyboard: true, move: true, pan: true };
        if (o.getMode() === "polyline") {
            control.close = points.length > 2;
            control.join = lines.length > 2 && Lines.getMeet(lines[0], lines[lines.length - 1]) !== false;
            control.remove = points.length > 0;
        }
        control.coords = { x: lastPoint.x, y: lastPoint.y };
        createControl.open(control);
    },
    drawcontrolremove: function () { this.object.state.points.pop(); this.preview(); },
    drawcontrolclose: function () { this.object.close(); this.end(); },
    drawcontroljoin: function () { this.object.join(); this.end(); },
    drawcontrolmove: function (e) {
        app.eventHandler("window", "mousemove", this.movemousemove.bind(this));
        app.eventHandler("window", "mouseup", this.movemouseup);
        var lastPoint = this.object.getLastPoint(), client = app.getClient(e);
        this.startOffset = { x: client.x, y: client.y, endX: lastPoint.x, endY: lastPoint.y };
    },
    movemousemove: function (e) {
        var lastPoint = this.object.getLastPoint(), client = app.getClient(e), so = this.startOffset, zoom = app.canvas.getZoom();
        var coords = app.canvas.getSnapedCoords({ x: (client.x - so.x) / zoom + so.endX, y: (client.y - so.y) / zoom + so.endY });
        console.log(client)
        if (lastPoint) { lastPoint.x = coords.x; lastPoint.y = coords.y; }
        this.preview();
    },
    movemouseup: function () {
        app.eventRemover("window", "mousemove", this.movemousemove);
        app.eventRemover("window", "mouseup", this.movemouseup);
        screenCorrection.run(app.canvas.canvasToClient(create.object.getLastPoint()), function () { app.redraw(); create.preview(); });
    },
    drawcontrolend: function () { this.end(); },
    drawcontrolpan: function (e) {
        app.eventHandler("window", "mousemove", this.panmousemove.bind(this));
        app.eventHandler("window", "mouseup", this.panmouseup);
        var screenPosition = app.canvas.getScreenPosition();
        this.startOffset = { x: app.getClient(e, "X"), y: app.getClient(e, "Y"), endX: screenPosition.x, endY: screenPosition.y };
    },
    panmousemove: function (e) {
        var so = this.startOffset, zoom = app.canvas.getZoom(), coords = app.getClient(e);
        var x = (so.x - coords.x) / zoom + so.endX, y = (coords.y - so.y) / zoom + so.endY;
        app.canvas.setScreenTo({ x: x, y: y, callback: this.preview.bind(this) });
        this.preview();
    },
    panmouseup: function () {
        app.eventRemover("window", "mousemove", this.panmousemove);
        app.eventRemover("window", "mouseup", this.panmouseup);
    },
    drawcontrolkeyboard: function () {
        var o = this.object, mode = o.getMode();
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
        var o = this.object, points = o.getPoints(), lines = o.getLines();
        var addedPoints = [] , addedLines = [];
        for (var i = 0; i < points.length; i++) { 
            var addedPoint = Points.add(points[i]); addedPoints.push(addedPoint);
            if(addedLines[i - 1]){
                addedLines[i - 1].end.id = addedPoint.id;
                addedPoint.connectedLines.push({side:"end",id:addedLines[i - 1].id});
            }
            if(lines[i]){
                var addedLine = Lines.add(lines[i]); addedLines.push(addedLine);
                addedPoint.connectedLines.push({side:"start",id:addedLine.id});
                addedLine.start.id = addedPoint.id;
                if(i === points.length - 1){
                    addedLine.end.id = addedPoints[0].id;
                    addedPoints[0].connectedLines.push({side:"end",id:addedLine.id});
                }
            }
        }
    },
    getPoints: {
        polyline: function () {
            return this.state.points;
        },
        rectangle: function () {
            var s = this.state, points = [];
            var start = s.points[0], end = s.points[1]
            points.push({ x: start.x, y: start.y });
            if (!end) { return points; }
            points.push({ x: start.x, y: end.y });
            points.push({ x: end.x, y: end.y });
            points.push({ x: end.x, y: start.y });
            return points;
        },
        ngon: function () {
            var s = this.state, points = [];
            var start = s.points[0], end = s.points[1];
            points.push({ x: start.x, y: start.y });
            if (!end) { return points; }
            var horizontal = Math.abs(start.x - end.x) >= Math.abs(start.y - end.y);
            var startLine = { x: start.x, y: start.y };
            var endLine = { x: s.ortho ? (horizontal ? end.x : start.x) : end.x, y: s.ortho ? (horizontal ? start.y : end.y) : end.y };
            var line = { start: startLine, end: endLine };
            var horizontalSign = Math.sign(end.x - start.x), verticalSign = Math.sign(end.y - start.y);
            var sign = s.ortho ? (horizontal ? horizontalSign * verticalSign || 1 : horizontalSign * verticalSign * -1 || 1) : 1;
            var radian = Lines.getRadian(line), length = Lines.getLength(line), xs = start.x; var ys = start.y, aa = 360 / s.sides * Math.PI / 180, b = radian * Math.PI / 180;
            for (var i = 0; i < s.sides - 1; i++) {
                xs += (Math.cos(aa * i * sign - b) * length);
                ys += (Math.sin(aa * i * sign - b) * length);
                points.push({ x: xs, y: ys });
            }
            return points;
        }
    },
    moving:false,
    autoPan: function (coords, callback) {
        
    },
}

var autoPan = {
    moving:false,
    margin: { left: 40, top: 40, right: 40, bottom: 40 },
    run: function (coords, callback) {
        
        var c = app.canvas;
        if (this.moving || !c.getIsDown()) { return; }
        var speed = 2, x = coords.x, y = coords.y, m = this.margin;
        if (x > c.getWidth() - m.right) { var h = 1; }else if (x < m.left) { var h = -1; }else { var h = 0; }
        if (y > c.getHeight() - m.bottom) { var v = -1; }else if (y < m.top) { var v = 1; }else { var v = 0; }
        
        if (v || h) {
            this.moving = true;
            setTimeout(function () {
                autoPan.moving = false;
                c.setScreenBy({ x: speed * h, y: speed * v });
                if (callback) { callback(); }
            }, 10);
        }
    }
}


var screenCorrection = {
    margin: { left: 80+0, top: 80+0, right: 80+0, bottom: 80+0 },//80 is createControl.style.distance
    run: function (coords,callback) {
        var c = app.canvas;
        var speed = 2, x = coords.x, y = coords.y, m = this.margin, width = c.getWidth(), height = c.getHeight();
        if (x > width - m.right) { var deltaX = x - width + m.right; }
        else if (x < m.left) { var deltaX = x - m.left; }
        else { var deltaX = 0; }
        if (y > height - m.bottom) { var deltaY = y - height + m.bottom; }
        else if (y < m.top) { var deltaY = y - m.top; }
        else { var deltaY = 0; }
        c.setScreenBy({x: deltaX, y: deltaY * -1, animate: true, callback: callback });
    }
}