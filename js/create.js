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
            if (points.length < 2) { return []; }//در حالتی که یک پوینت بیشتر موجود نیست لاینی نباید تولید شود این مشکل در حالت کلوز ترو خود را نشان می دهد
            var length = points.length + (s.close ? 1 : 0);
            for (var i = 1; i < length; i++) {
                var lastPoint = points[i - 1], point = points[i] || points[0];
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
        getLastPoint: function () { 
            return this.state.points[this.state.points.length - 1]; 
        },
        setLastPoint: function (coords) { 
            var lastPoint = this.getLastPoint();
            lastPoint.x = coords.x; lastPoint.y = coords.y;
        },
        to: function (obj) { this.addPoint(obj); }
    };
    a.init(config);
    a.getPoints = getPoints;
    return a;
}
var create = {
    drawing: false,
    firstPoint: true,
    ngonSides: 6,
    ortho: false,
    autoWeldArea: 15,
    getAutoWeldCoords:function(coords){
        var point = app.getPoint({ coords: coords, area: this.autoWeldArea });
        if (point) { return { x: point.x, y: point.y }; }
        else { return app.canvas.getSnapedCoords(coords); }
    },
    dblclick:function(){

    },
    mousedown: function () {
        app.eventHandler("window", "mousemove", $.proxy(this.mousemove, this));
        app.eventHandler("window", "mouseup", $.proxy(this.mouseup, this));
        var mode = app.state.createmode, 
        close = ["rectangle", "ngon"].indexOf(mode) !== -1;
        var coords = this.getAutoWeldCoords(app.canvas.getSnapedCoords());
        if (this.firstPoint) {
            this.object = new spline({ start: coords, color: layers.getActive().color, mode: mode, sides: this.ngonSides, ortho: this.ortho, close: close }, this.getPoints[mode]);
            this.firstPoint = false;
            this.drawing = true;
        } else {
            this.object.addPoint(coords);
            if (close) { this.firstPoint = true; createControl.close(); }
        }
        var lastPoint = this.object.getLastPoint();
        this.startOffset = { deltaX: lastPoint.x - coords.x, deltaY: lastPoint.y - coords.y};
        setTimeout(function(){create.preview()},300);
    },
    mousemove: function () {
        var client = app.getClient(), so = this.startOffset;
        var coords = app.canvas.clientToCanvas(client);
        coords = {x:coords.x + so.deltaX,y:coords.y + so.deltaY};
        coords = app.canvas.getSnapedCoords(coords);
        this.object.setLastPoint(coords);
        this.preview();
        autoPan.run(client, this.mousemove.bind(this));
    },
    mouseup: function () {
        app.eventRemover("window", "mousemove", this.mousemove);
        app.eventRemover("window", "mouseup", this.mouseup);
        var lastPoint = this.object.getLastPoint();
        var coords = this.getAutoWeldCoords(lastPoint);
        this.object.setLastPoint(coords);
        if (this.firstPoint) { this.end(); } // in close mode objects
        setTimeout(function(){
        screenCorrection.run(app.canvas.canvasToClient(lastPoint), function () { create.preview(); });
        },300);
    },
    end: function () {
        if (this.drawing === false) { return;} // drawing = false is mean that current drawing is saved
        if (this.save()){undo.save();}
        this.drawing = false;
        this.firstPoint = true;
        createControl.close();
        app.redraw();
    },
    preview: function () {
        app.redraw();
        if (!this.drawing) {return;}
        var points = this.object.getPoints(), lines = this.object.getLines();
        for (var i = 0; i < points.length; i++) {  app.drawPoint(points[i]); }
        for (var i = 0; i < lines.length; i++) { app.drawLine($.extend({}, lines[i], { showDimension: i === lines.length - 1 })); }
        this.drawLastPoint();
        if(!this.firstPoint){this.drawController();}
    },
    drawLastPoint: function () {
        var lastPoint = this.object.getLastPoint();
        app.canvas.drawArc({ x: lastPoint.x, y: lastPoint.y, radius: 3, fill: "orange" });
        app.canvas.drawArc({ x: lastPoint.x, y: lastPoint.y, radius: 6, stroke: "orange" });
    },
    drawController: function () {
        var o = this.object, points = o.getPoints(), lines = o.getLines();
        var control = { end: true, keyboard: true, move: true };
        if (o.getMode() === "polyline") {
            control.close = points.length > 2;
            control.join = lines.length > 2 && Lines.getMeet(lines[0], lines[lines.length - 1]) !== false;
            control.remove = points.length > 1;
        }
        var lastPoint = o.getLastPoint()
        control.coords = { x: lastPoint.x, y: lastPoint.y };
        createControl.open(control);
    },
    drawcontrolremove: function () { 
        this.object.state.points.pop(); 
        var lastPoint = this.object.getLastPoint();
        if(!lastPoint){this.end(); return;}
        screenCorrection.run(app.canvas.canvasToClient(lastPoint), function () { 
            create.preview(); 
        }); 
    },
    drawcontrolclose: function () { this.object.close(); this.end(); },
    drawcontroljoin: function () { this.object.join(); this.end(); },
    drawcontrolmove: function (e) {
        app.eventHandler("window", "mousemove", $.proxy(this.mousemove,this));
        app.eventHandler("window", "mouseup", $.proxy(this.mouseup,this));
        var lastPoint = this.object.getLastPoint();
        var coords = app.canvas.clientToCanvas(app.getClient());
        this.startOffset = { deltaX: lastPoint.x - coords.x, deltaY: lastPoint.y - coords.y};
    },
    drawcontrolend: function () { this.end(); },
    dblclick: function (e) {
        this.drawcontrolremove();
        this.drawcontrolremove();
        $("body").append(
            '<div class="pan-background"><p>Pan mode is active!!!<br>Drag to pan screen<br>double tap for deactive pan mode</p></div>'
        );
        app.eventHandler(".pan-background", "dblclick", $.proxy(this.panremove,this));
        app.eventHandler(".pan-background", "mousedown", $.proxy(this.panmousedown,this));
        
    },
    panremove:function(){
        $(".pan-background").remove();
    },
    panmousedown:function(){
        app.eventHandler("window", "mousemove", $.proxy(this.panmousemove,this));
        app.eventHandler("window", "mouseup", $.proxy(this.panmouseup,this));
        var screenPosition = app.canvas.getScreenPosition();
        var client = app.getClient();
        this.startOffset = { 
            x: client.x, y: client.y, 
            endX: screenPosition.x, endY: screenPosition.y 
        };
    },
    panmousemove: function (e) {
        var so = this.startOffset, zoom = app.canvas.getZoom(), coords = app.getClient();
        var x = (so.x - coords.x) / zoom + so.endX, y = (coords.y - so.y) / zoom + so.endY;
        app.canvas.setScreenTo({ x: x, y: y, callback: function(){
            app.redraw();
            
        } });
    },
    panmouseup: function () {
        app.eventRemover("window", "mousemove", this.panmousemove);
        app.eventRemover("window", "mouseup", this.panmouseup);
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
            callback: function (obj) {
                var lastPoint = create.object.getLastPoint();
                var newPoint = { x: lastPoint.x + obj.x, y: lastPoint.y + obj.y * -1 };
                create.object.to(newPoint);
                screenCorrection.run(app.canvas.canvasToClient(create.object.getLastPoint()), function () { create.preview(); });
            }
        });
    },
    save: function () {
        var points = this.object.getPoints(), lines = this.object.getLines();
        if (lines.length === 0) { return false; }
        var addedPoints = [], addedLines = [];
        for (var i = 0; i < points.length; i++) {
            var addedPoint = Points.add(points[i]); addedPoints.push(addedPoint);
            if (addedLines[i - 1]) {
                addedLines[i - 1].end.id = addedPoint.id;
                addedPoint.connectedLines.push({ side: "end", id: addedLines[i - 1].id });
            }
            if (lines[i]) {
                var addedLine = Lines.add(lines[i]); addedLines.push(addedLine);
                addedPoint.connectedLines.push({ side: "start", id: addedLine.id });
                addedLine.start.id = addedPoint.id;
                if (i === points.length - 1) {
                    addedLine.end.id = addedPoints[0].id;
                    addedPoints[0].connectedLines.push({ side: "end", id: addedLine.id });
                }
            }
        }
        return true;
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
    setting: function () {
        var template = [
            {
                type: "slider", title: "Auto Weld", value: create.autoWeldArea,
                callback: function (value) {
                    create.autoWeldArea = value;
                },
                start: 1, step: 1, end: 30,
            }
        ];
        if (app.state.createmode === "ngon") {
            template.push({
                type: "slider", title: "Sides", value: create.ngonSides,
                callback: function (value) { create.ngonSides = value; },
                start: 3, step: 1, end: 40,
            });
            template.push({
                type: "switch", title: "Ortho", value: create.ortho,
                callback: function (value) { create.ortho = value; },
            });
        }
        Alert.open({
            buttons: [{ text: "ok", callback: Alert.close }],
            template: template,
            title: app.state.createmode + " setting.",
        });
    },
}

var autoPan = {
    moving: false,
    margin: { left: 40, top: 80, right: 40, bottom: 40 },
    run: function (coords, callback) {
        var c = app.canvas;
        if (this.moving || !c.getIsDown()) { return; }
        var speed = 2, x = coords.x, y = coords.y, m = this.margin;
        if (x > c.getWidth() - m.right) { var h = 1; } else if (x < m.left) { var h = -1; } else { var h = 0; }
        if (y > c.getHeight() - m.bottom) { var v = -1; } else if (y < m.top) { var v = 1; } else { var v = 0; }

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
    margin: { left: 80 + 0, top: 80, right: 80 + 0, bottom: 80 + 0 },//80 is createControl.style.distance
    run: function (coords, callback,endCallback) {
        var c = app.canvas;
        var speed = 2, x = coords.x, y = coords.y, m = this.margin, width = c.getWidth(), height = c.getHeight();
        var top = m.top + (app.state.appmode === "create"?36:72);
        if (x > width - m.right) { var deltaX = x - width + m.right; }
        else if (x < m.left) { var deltaX = x - m.left; }
        else { var deltaX = 0; }
        if (y > height - m.bottom) { var deltaY = y - height + m.bottom; }
        else if (y < top) { var deltaY = y - top; }
        else { var deltaY = 0; }
        c.setScreenBy({ x: deltaX, y: deltaY * -1, animate: true, callback: callback });
    }
}