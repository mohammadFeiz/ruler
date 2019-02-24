function spline(config, getPoints,getLines,save) {
    var a = {
        state: { points: [], close: false },
        init: function (obj) {
            for (var prop in obj) { this.state[prop] = obj[prop]; }
            this.addPoint(this.state.start);
        },
        addPoint: function (point) { this.state.points.push(point); },
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
    a.getLines = getLines;
    a.save = save
    return a;
}
var create = {
    drawing: false,
    firstPoint: true,
    ngonSides: 6,//for ngon
    ortho: false,//for ngon
    thickness:10,//for double line
    autoWeldArea: 15,
    getCoords:function(coords){
        if(app.state.createmode.linesMethod === 'doubleRow'){return coords;}
        var point = app.getPoint({ coords: coords, area: this.autoWeldArea });
        if (point) { return { x: point.x, y: point.y }; }
        else { return coords; }
    },
    mousedown: function () {
        app.eventHandler("window", "mousemove", $.proxy(this.mousemove, this));
        app.eventHandler("window", "mouseup", $.proxy(this.mouseup, this));
        var mode = this.mode = app.state.createmode; 
        var coords = this.getCoords(app.canvas.getSnapedCoords());
        if (this.firstPoint) {
            this.object = new spline(
                { 
                    start: coords, color: layers.getActive().color, 
                    sides: this.ngonSides, 
                    ortho: this.ortho, 
                    close: mode.close,
                    thickness:this.thickness
                }, 
                this.getPoints[mode.pointsMethod],
                this.getLines[mode.linesMethod],
                this.save[mode.linesMethod]
            );
            this.firstPoint = false;
            this.drawing = true;
        } else {
            var lastPoint = this.object.getLastPoint();
            if(Lines.getLength({start:lastPoint,end:coords})<5){return;}
            this.object.addPoint(coords);
            if (mode.value === 'rectangle' || mode.value === 'ngon') { 
                this.firstPoint = true; createControl.close(); 
            }
        }
        var lastPoint = this.object.getLastPoint();
        this.startOffset = { deltaX: lastPoint.x - coords.x, deltaY: lastPoint.y - coords.y};
        create.preview();
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
        var coords = this.getCoords(lastPoint);
        this.object.setLastPoint(coords);
        if (this.firstPoint) { this.end(); } // in close mode objects
        screenCorrection.run(app.canvas.canvasToClient(lastPoint), function () { create.preview(); });
    },
    end: function () {
        if (this.drawing === false) { return;} // drawing = false is mean that current drawing is saved
        if (this.object.save()){undo.save();}
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
        for (var i = 0; i < lines.length; i++) { app.drawLine($.extend({}, lines[i], { showDimension: true })); }
        this.drawLastPoint();
        if(!this.firstPoint){this.createController();}
    },
    drawLastPoint: function () {
        var lastPoint = this.object.getLastPoint();
        var zoom = app.canvas.getZoom();
        app.canvas.drawArc({ x: lastPoint.x, y: lastPoint.y, radius: 3/zoom, fill: "orange" });
        app.canvas.drawArc({ x: lastPoint.x, y: lastPoint.y, radius: 6/zoom, stroke: "orange" });
    },
    createController: function () {
        var o = this.object,lastPoint = o.getLastPoint()
        createControl.update({ x: lastPoint.x, y: lastPoint.y });
    },
    'create-control-remove': function () { 
        this.object.state.points.pop(); 
        var lastPoint = this.object.getLastPoint();
        if(!lastPoint){this.end(); return;}
        screenCorrection.run(app.canvas.canvasToClient(lastPoint), function () { 
            create.preview(); 
        }); 
    },
    'create-control-close': function () { this.object.close(); this.end(); },
    'create-control-join': function () { this.object.join(); this.end(); },
    'create-control-move': function () {
        app.eventHandler("window", "mousemove", $.proxy(this.mousemove,this));
        app.eventHandler("window", "mouseup", $.proxy(this.mouseup,this));
        var lastPoint = this.object.getLastPoint();
        var coords = app.canvas.clientToCanvas(app.getClient());
        this.startOffset = { deltaX: lastPoint.x - coords.x, deltaY: lastPoint.y - coords.y};
    },
    'create-control-end': function () { this.end(); },
    'create-control-keyboard': function () {
        keyboard.open({
            isMobile: app.state.isMobile,
            fields: [{ prop: "x", title: "X" }, { prop: "y", title: "y" }],
            negative: true,
            title: this.mode.text + " To:",
            close: (this.mode.value === "ngon" || this.mode.value === "rectangle" || this.mode.value === "frame"),
            callback: function (obj) {
                var lastPoint = create.object.getLastPoint();
                var newPoint = { x: lastPoint.x + obj.x, y: lastPoint.y + obj.y * -1 };
                create.object.to(newPoint);
                screenCorrection.run(app.canvas.canvasToClient(create.object.getLastPoint()), function () { create.preview(); });
            }
        });
    },
    save: {
        singleRow:function () { // use in polyline,ngon,rectangle,path
            var lines = this.getLines();
            if (lines.length === 0) { return false; }
            var points = this.getPoints();
            
            var addedPoints = [], addedLines = [];
            for (var i = 0; i < points.length; i++) {
                var addedPoint = Points.add(points[i]); 
                addedPoints.push(addedPoint);
                if (addedLines[i - 1]) {
                    addedLines[i - 1].end.id = addedPoint.id;
                    addedPoint.connectedLines.push({ side: "end", id: addedLines[i - 1].id });
                }
                if (lines[i]) {
                    var addedLine = Lines.add(lines[i]); 
                    addedLines.push(addedLine);
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
        doubleRow:function(){
            var lines = this.getLines();
            if (lines.length === 0) { return false; }
            var points = this.getPoints();
            var minorPoints = points.slice(0,points.length / 2);
            var minorLines = lines.slice(0,lines.length / 2);
            var majorPoints = points.slice(points.length / 2,points.length);
            var majorLines = lines.slice(lines.length / 2,lines.length);
            var addedPoints = [], addedLines = [];
            for (var i = 0; i < minorPoints.length; i++) {
                var addedPoint = Points.add(minorPoints[i]); 
                app.redraw();
                addedPoints.push(addedPoint);
                if (addedLines[i - 1]) {
                    addedLines[i - 1].end.id = addedPoint.id;
                    addedPoint.connectedLines.push({ side: "end", id: addedLines[i - 1].id });
                }
                if (minorLines[i]) {
                    var addedLine = Lines.add(minorLines[i]); addedLines.push(addedLine);
                    app.redraw();
                    addedPoint.connectedLines.push({ side: "start", id: addedLine.id });
                    addedLine.start.id = addedPoint.id;
                    if (i === minorPoints.length - 1) {
                        addedLine.end.id = addedPoints[0].id;
                        addedPoints[0].connectedLines.push({ side: "end", id: addedLine.id });
                    }
                }
            }
            addedPoints = []; addedLines = [];
            for (var i = 0; i < majorPoints.length; i++) {
                var addedPoint = Points.add(majorPoints[i]);
                app.redraw(); 
                addedPoints.push(addedPoint);
                if (addedLines[i - 1]) {
                    addedLines[i - 1].end.id = addedPoint.id;
                    addedPoint.connectedLines.push({ side: "end", id: addedLines[i - 1].id });
                }
                if (majorLines[i]) {
                    var addedLine = Lines.add(majorLines[i]); addedLines.push(addedLine);
                    app.redraw();
                    addedPoint.connectedLines.push({ side: "start", id: addedLine.id });
                    addedLine.start.id = addedPoint.id;
                    if (i === majorPoints.length - 1) {
                        addedLine.end.id = addedPoints[0].id;
                        addedPoints[0].connectedLines.push({ side: "end", id: addedLine.id });
                    }
                }
            }
            return true; 
        }   
    },
    getPoints: {
        polyline: function () {
            return this.state.points;
        },
        path:function(){
            return this.state.points;
        },
        doubleline:function(){
            var s = this.state, minor = [],major = [],points = [];
            if(s.points.length < 2){return [];}
            for(var i = 0; i < s.points.length; i++){
                var point = s.points[i];
                var nextPoint = s.points[i+1];
                if(!nextPoint){break;}
                var line = {start:point,end:nextPoint};
                minor.push(Lines.getParallelLine(line,s.thickness/2));
                major.push(Lines.getParallelLine(line,s.thickness/-2));
            }
            for(var i = 0; i < minor.length; i++){
                var minor1 = minor[i];
                var minor2 = minor[i + 1];
                if(minor2){
                    var meet = Lines.getMeet(minor1,minor2);
                    minor1.end.x = minor2.start.x = meet.x;
                    minor1.end.y = minor2.start.y = meet.y;
                    points.push(minor1.start);
                }
                else{
                    points.push(minor1.start,minor1.end);
                }
                
            }
            for(var i = 0; i < major.length; i++){
                var major1 = major[i];
                var major2 = major[i + 1];
                if(major2){
                    var meet = Lines.getMeet(major1,major2);
                    major1.end.x = major2.start.x = meet.x;
                    major1.end.y = major2.start.y = meet.y;
                    points.push(major1.start);
                }
                else{
                    points.push(major1.start,major1.end);
                }
                
            }
            return points;
        },
        rectangle: function () {
            var s = this.state, points = [];
            var start = s.points[0], end = s.points[1]
            if (!start) { return false; }
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
    getLines:{
        singleRow: function () {
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
        doubleRow: function () {
            var s = this.state, lines = [], points = this.getPoints();
            if (points.length < 4) { return []; }//در حالتی که یک پوینت بیشتر موجود نیست لاینی نباید تولید شود این مشکل در حالت کلوز ترو خود را نشان می دهد
            var length = (points.length / 2) + (s.close ? 1 : 0);
            for (var i = 1; i < length; i++) {
                var lastPoint = points[i - 1], point = points[i] || points[0];
                var line = { start: { x: lastPoint.x, y: lastPoint.y }, end: { x: point.x, y: point.y }, color: s.color, };
                lines.push(line);
            }
            for (var i = length + 1; i < length * 2; i++) {
                var lastPoint = points[i - 1], point = points[i] || points[0];
                var line = { start: { x: lastPoint.x, y: lastPoint.y }, end: { x: point.x, y: point.y }, color: s.color, };
                lines.push(line);
            }
            return lines;
        },
    },
    setting: function () {
        var template = [
            {
                type: "slider", title: "Snap Area", value: app.canvas.getSnap(),
                callback: function (value) {
                    app.canvas.setSnap(value);
                },
                min:1,start: 0, step: 10, end: 100,
            },
        ];
        if (app.state.createmode.linesMethod === "singleRow") {
            template.push({
                type: "slider", title: "Auto Weld", value: create.autoWeldArea,
                callback: function (value) {
                    create.autoWeldArea = value;
                },
                start: 1, step: 1, end: 30,
            });
        }
        if (app.state.createmode.value === "ngon") {
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
        if (app.state.createmode.value === "doubleline") {
            template.push({
                type: "slider", title: "Thickness", value: create.thickness,
                callback: function (value) { create.thickness = value; },
                min:1,start: 0, step: 10, end: 400,
            });
        }
        Alert.open({
            buttons: [{ text: "ok", callback: Alert.close }],
            template: template,
            title: app.state.createmode.text + " Setting.",
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
        var zoom = app.canvas.getZoom();
        var speed = 2, x = coords.x, y = coords.y, m = this.margin, width = c.getWidth(), height = c.getHeight();
        var top = m.top + (app.state.appmode === "create"?36:72);
        if (x > width - m.right) { var deltaX = x - width + m.right; }
        else if (x < m.left) { var deltaX = x - m.left; }
        else { var deltaX = 0; }
        if (y > height - m.bottom) { var deltaY = y - height + m.bottom; }
        else if (y < top) { var deltaY = y - top; }
        else { var deltaY = 0; }
        if(!deltaX&&!deltaY){callback(); return;}
        c.setScreenBy({ x: deltaX/zoom, y: deltaY * -1/zoom, animate: true, callback: callback });
    }
}