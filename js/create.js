function spline(config,save) {
    var a = {
        state: { points: [], close: false,join:false },
        init: function (obj) {
            for (var prop in obj) { this.state[prop] = obj[prop]; }
            this.state.customSplines = this.state.customSplines || {};
            for(var prop in this.state.customSplines){
                this['get'+prop+'points'] = this.state.customSplines[prop].getPoints;
                this['get'+prop+'lines'] = this.state.customSplines[prop].getLines;
                this['save'+prop] = this.state.customSplines[prop].save;
            }
            this.addPoint(this.state.start);
        },
        addPoint: function (point) { this.state.points.push(point); },
        close: function () { this.state.close = true; },
        join: function () { this.state.join = true; this.state.close = true;},
        getLastPoint: function () { 
            return this.state.points[this.state.points.length - 1]; 
        },
        getOriginalPoints:function(){
            var s = this.state;
            var points = s.points;
            if(s.join){
                var firstPoint = points[0];
                var secondPoint = points[1];  
                var lastPoint = points[points.length - 1];
                var beforeLastPoint = points[points.length - 2];  
                var firstLine = {
                        start:{x:firstPoint.x,y:firstPoint.y},
                        end:{x:secondPoint.x,y:secondPoint.y}
                };
                var lastLine = {
                    start:{x:beforeLastPoint.x,y:beforeLastPoint.y},
                    end:{x:lastPoint.x,y:lastPoint.y}
                }; 
                meet = Lines.getMeet(lastLine, firstLine);
                points[0].x = meet.x; 
                points[0].y = meet.y;
                points.pop();
            }
            return points;
        },
        getRectanglePoints:function(start,end){
            var points = [];
            if (!start) { return false; }
            points.push({ x: start.x, y: start.y });
            if (!end) { return points; }
            points.push({ x: start.x, y: end.y });
            points.push({ x: end.x, y: end.y });
            points.push({ x: end.x, y: start.y });
            return points;
        },
        getsinglerowlines:function(points,close){
            var lines = [];
            if (points.length < 2) { return []; }//در حالتی که یک پوینت بیشتر موجود نیست لاینی نباید تولید شود این مشکل در حالت کلوز ترو خود را نشان می دهد
            var length = points.length + (close ? 1 : 0);
            for (var i = 1; i < length; i++) {
                var lastPoint = points[i - 1], point = points[i] || points[0];
                var line = { start: { x: lastPoint.x, y: lastPoint.y }, end: { x: point.x, y: point.y }, color: this.state.color,showDimension:true };
                lines.push(line);
            }
            return lines;
        },
        getdoublerowlines:function(points,close){
            var lines = [];
            if (points.length < 4) { return []; }//در حالتی که یک پوینت بیشتر موجود نیست لاینی نباید تولید شود این مشکل در حالت کلوز ترو خود را نشان می دهد
            var firstRowPoints = points.slice(0,points.length / 2);
            var secondRowPoints = points.slice(points.length / 2);
            var length = firstRowPoints.length + (close ? 1 : 0);
            for (var i = 1; i < length; i++) {
                var lastPoint = firstRowPoints[i - 1], point = firstRowPoints[i] || firstRowPoints[0];
                var radian = this.getRadian({start:lastPoint,end:point});
                var textBaseLine = radian >= 90 && radian <= 270 ?'bottom':'top';
                var line = { start: { x: lastPoint.x, y: lastPoint.y }, end: { x: point.x, y: point.y }, color: this.state.color,showDimension:true,textBaseLine:textBaseLine };
                lines.push(line);
            }
            for (var i = 1; i < length; i++) {
                var lastPoint = secondRowPoints[i - 1], point = secondRowPoints[i] || secondRowPoints[0];
                var radian = this.getRadian({start:lastPoint,end:point});
                var textBaseLine = radian >= 90 && radian <= 270 ?'top':'bottom';
                var line = { start: { x: lastPoint.x, y: lastPoint.y }, end: { x: point.x, y: point.y }, color: this.state.color,showDimension:true,textBaseLine:textBaseLine };
                lines.push(line);
            }
            return lines;
        },
        getpolylinepoints:function(){
            return this.getOriginalPoints();
        },
        getdoublelinepoints:function(){
            var s = this.state, minor = [],major = [],points = [];
            var originalPoints = this.getOriginalPoints();
            if(originalPoints.length < 2){return [];}
            for(var i = 0; i < originalPoints.length; i++){    
                var point = originalPoints[i];
                var nextPoint = originalPoints[i+1];
                if(!nextPoint){
                    if(s.close){nextPoint = originalPoints[0];}
                    else{ break; }
                }
                var line = {start:point,end:nextPoint};
                minor.push(Lines.getParallelLine(line,s.thickness/2));
                major.push(Lines.getParallelLine(line,s.thickness/-2));
            }
            for(var i = 0; i < minor.length; i++){
                var minor1 = minor[i];
                var minor2 = minor[i + 1];
                if(!minor2 && s.close){minor2 = minor[0];}
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
                if(!major2 && s.close){major2 = major[0];}
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
        getrectanglepoints:function(){
            var points = this.getOriginalPoints();
            return this.getRectanglePoints(points[0],points[1])
        },
        getngonpoints:function(){
            var s = this.state, points = [];
            var originalPoints = this.getOriginalPoints();
            var start = originalPoints[0], end = originalPoints[1];
            points.push({ x: start.x, y: start.y });
            if (!end) { return points; }
            var startLine = { x: start.x, y: start.y };
            var endLine = { x: end.x, y: end.y };
            var line = { start: startLine, end: endLine };
            var sign = 1;
            var radian = Lines.getRadian(line), length = Lines.getLength(line), xs = start.x; var ys = start.y, aa = 360 / s.sides * Math.PI / 180, b = radian * Math.PI / 180;
            for (var i = 0; i < s.sides - 1; i++) {
                xs += (Math.cos(aa * i * sign - b) * length);
                ys += (Math.sin(aa * i * sign - b) * length);
                points.push({ x: xs, y: ys });
            }
            return points;
        },
        savesinglerow:function (points,lines) { // use in polyline,ngon,rectangle,path
            var points = points ||this.getPoints();
            if (points.length < 2) { return false; }
            var lines = lines || this.getLines(points);
            
            var addedPoints = [], addedLines = [];
            for (var i = 0; i < points.length; i++) {
                var addedPoint = Points.add(points[i]); 
                addedPoints.push(addedPoint);
                if (addedLines[i - 1]) {
                    addedLines[i - 1].end.id = addedPoint.id;
                    addedPoint.connectedLines.push({ side: "end", id: addedLines[i - 1].id });
                }
                var line = lines[i];
                if (line) {
                    var addedLine = Lines.add({start:line.start,end:line.end}); 
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
        savedoublerow:function(){
            var points = this.getPoints();
            if (points.length < 4) { return false; }
            var lines = this.getLines(points);
            var minorPoints = points.slice(0,points.length / 2);
            var minorLines = lines.slice(0,lines.length / 2);
            var majorPoints = points.slice(points.length / 2,points.length);
            var majorLines = lines.slice(lines.length / 2,lines.length);
            var addedPoints = [], addedLines = [];
            for (var i = 0; i < minorPoints.length; i++) {
                if(minorPoints[i].x !==0 && !minorPoints[i].x){continue;}
                if(minorPoints[i].y !==0 && !minorPoints[i].y){continue;}
                var addedPoint = Points.add(minorPoints[i]); 
                app.redraw();
                addedPoints.push(addedPoint);
                if (addedLines[i - 1]) {
                    addedLines[i - 1].end.id = addedPoint.id;
                    addedPoint.connectedLines.push({ side: "end", id: addedLines[i - 1].id });
                }
                var minorLine = minorLines[i];
                if (minorLine) {
                    var addedLine = Lines.add({start:minorLine.start,end:minorLine.end}); addedLines.push(addedLine);
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
                if(majorPoints[i].x !==0 && !majorPoints[i].x){continue;}
                if(majorPoints[i].y !==0 && !majorPoints[i].y){continue;}
                var addedPoint = Points.add(majorPoints[i]);
                app.redraw(); 
                addedPoints.push(addedPoint);
                if (addedLines[i - 1]) {
                    addedLines[i - 1].end.id = addedPoint.id;
                    addedPoint.connectedLines.push({ side: "end", id: addedLines[i - 1].id });
                }
                var majorLine = majorLines[i];
                if (majorLine) {
                    var addedLine = Lines.add({start:majorLine.start,end:majorLine.end}); addedLines.push(addedLine);
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
        },
        getLines:function(points){
            return this['get'+this.state.linesMethod+'lines'](points || this.getPoints(),this.state.close);
        },
        getPoints:function(){
            return this['get'+this.state.pointsMethod+'points']();
        },
        save:function(){
            return this['save' + this.state.linesMethod]();
        },
        setLastPoint: function (coords) { 
            var lastPoint = this.getLastPoint();
            lastPoint.x = coords.x; lastPoint.y = coords.y;
        },
        getRadian: function (obj) {
            var x1 = obj.start.x,y1 = obj.start.y,x2 = obj.end.x,y2 = obj.end.y;
            var radian = (Math.atan((y2 - y1) / (x1 - x2)) / Math.PI * 180);
            if (x2 < x1) {
                if (y1 - y2 != 0) { radian = 180 + radian; }else {radian = 180;}
            } else if (x1 < x2) {
                if (y2 < y1) { }else if (y1 < y2) { radian = 360 + radian; }else {radian = 0;}
            } else {
                if (y2 < y1) { radian = 90; } else if (y1 < y2) { radian = 270; }else {radian = 0;}
            }
            return radian;
        },  
        to: function (obj) { this.addPoint(obj); }
    };
    a.init(config);
    return a;
}
var create = {
    drawing: false,
    firstPoint: true,
    ngonSides: 6,//for ngon
    ortho: 0,//for ngon
    thickness:10,//for double line
    autoWeldArea: 5,
    outerFrame:10,
    innerFrame:5,
    xCount:2,
    yCount:2,
    getCoords:function(coords){
        var point = app.getPoint({ coords: coords, area: this.autoWeldArea });
        if (point) { return { x: point.x, y: point.y }; }
        else { return coords; }
    },
    mousedown: function () {
        var mode = this.mode = app.state.createmode; 
        if(['offsetLine','plumbLine','extendLine'].indexOf(mode.value) !== -1){
            this[mode.value].mousedown();
            return;
        }
        app.eventHandler("window", "mousemove", $.proxy(this.mousemove, this));
        app.eventHandler("window", "mouseup", $.proxy(this.mouseup, this));
        var coords = this.getCoords(app.canvas.getSnapedCoords());
        if (this.firstPoint) {
            this.object = new spline(
                { 
                    start: coords, color: layers.getActive().color, 
                    sides: this.ngonSides, 
                    close: mode.close,
                    thickness:this.thickness,
                    linesMethod:mode.linesMethod,
                    pointsMethod:mode.pointsMethod,
                    customSplines:this.customSplines,
                    innerFrame:this.innerFrame,
                    outerFrame:this.outerFrame,
                    xCount:this.xCount,
                    yCount:this.yCount,
                }, 
            );
            this.getOrthoCoords = mode.ortho?this.orthoMethod:function(){return false;}
            this.firstPoint = false;
            this.drawing = true;
        } else {
            var lastPoint = this.object.getLastPoint();
            if(Lines.getLength({start:lastPoint,end:coords})<5){return;}
            this.object.addPoint(coords);
            if (mode.value === 'rectangle' || mode.value === 'ngon' || mode.value === 'frame') { 
                this.firstPoint = true; createControl.close(); 
            }
        }
        var lastPoint = this.object.getLastPoint();
        this.startOffset = { deltaX: lastPoint.x - coords.x, deltaY: lastPoint.y - coords.y}; //for createcontrol move
        this.preview();
    },
    orthoMethod:function(coords){
        var ortho = create.ortho;
        if(!ortho){return false;}
        var o = create.object;
        var points = o.state.points;
        if(points.length < 2){return false;}
        var lastPoint = coords;
        var beforeLastPoint = points[points.length - 2];
        var measure = Lines.getLength({start:beforeLastPoint,end:lastPoint});
        var radian = Lines.getRadian({start:beforeLastPoint,end:lastPoint});
        radian = Math.round(radian / ortho) * ortho;
        return Lines.getLineBySMR(beforeLastPoint,measure,radian).end;
    },
        
    mousemove: function () {
        var client = app.getClient(), so = this.startOffset;
        var coords = app.canvas.clientToCanvas(client);
        coords = {x:coords.x + so.deltaX,y:coords.y + so.deltaY};
        coords = this.getOrthoCoords(coords) || app.canvas.getSnapedCoords(coords);
        this.object.setLastPoint(coords);
        this.preview('move');
        autoPan.run(client, this.mousemove.bind(this));
    },
    mouseup: function () {
        app.eventRemover("window", "mousemove", this.mousemove);
        app.eventRemover("window", "mouseup", this.mouseup);
        var lastPoint = this.object.getLastPoint();
        var coords = this.getCoords(lastPoint);
        this.object.setLastPoint(coords);
        if (this.firstPoint) { this.end(); } // in close mode objects
        screenCorrection.run(app.canvas.canvasToClient(lastPoint), function () { create.preview();});
    },
    end: function () {
        if (this.drawing === false) { return;} // drawing = false is mean that current drawing is saved
        if (this.object.save()){undo.save();}
        this.drawing = false;
        this.firstPoint = true;
        createControl.close();
        app.redraw();
    },
    preview: function (mode) {
        app.redraw();
        if (!this.drawing) {return;}
        var points = this.object.getPoints(), lines = this.object.getLines(points);
        for (var i = 0; i < points.length; i++) {  app.drawPoint(points[i]); }
        for (var i = 0; i < lines.length; i++) { app.drawLine(lines[i]); }
        this.drawLastPoint();
        if(!this.firstPoint){this.createController(mode);}
    },
    drawLastPoint: function () {
        var lastPoint = this.object.getLastPoint();
        var zoom = app.canvas.getZoom();
        app.canvas.drawArc({ x: lastPoint.x, y: lastPoint.y, radius: 3/zoom, fill: "orange" });
        app.canvas.drawArc({ x: lastPoint.x, y: lastPoint.y, radius: 6/zoom, stroke: "orange" });
    },
    createController: function (mode) {
        var lastPoint = this.object.getLastPoint()
        createControl[mode === 'move'?'setPosition':'update']({ x: lastPoint.x, y: lastPoint.y });
    },
    'create-control-remove': function () { 
        this.object.state.points.pop(); 
        var lastPoint = this.object.getLastPoint();
        if(!lastPoint){this.end(); return;}
        var coords = app.canvas.canvasToClient(lastPoint);
        screenCorrection.run(coords, function () { create.preview();}); 
    },
    'create-control-close': function () { this.object.close(); this.end(); },
    'create-control-join': function () { this.object.join(); this.end(); },
    'create-control-move': function (e) {
        app.eventHandler("window", "mousemove", $.proxy(this.mousemove, this));
        app.eventHandler("window", "mouseup", $.proxy(this.mouseup, this));
        var lastPoint = this.object.getLastPoint();
        var coords = app.canvas.clientToCanvas(app.getClient(e));
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
                var coords = app.canvas.canvasToClient(create.object.getLastPoint());
                screenCorrection.run(coords, function () {create.preview(); });
            }
        });
    },
    customSplines:{
        frame:{
            getPoints:function(){
                var outerFrame = this.state.outerFrame;
                var innerFrame = this.state.innerFrame;
                var xCount = this.state.xCount;
                var yCount = this.state.yCount;
                var points = [];
                var originalPoints = this.getOriginalPoints();
                var start = originalPoints[0], end = originalPoints[1];
                points.push({x:start.x,y:start.y});
                if(!end){return points;}
                var minX = Math.min(start.x,end.x);
                var minY = Math.min(start.y,end.y);
                var maxX = Math.max(start.x,end.x);
                var maxY = Math.max(start.y,end.y);
                var totalframeWidth = (2 * outerFrame) + ((xCount - 1) * innerFrame);
                var totalframeHeight = (2 * outerFrame) + ((yCount - 1) * innerFrame);
                var outerWidth = maxX - minX;
                var outerHeight = maxY - minY;
                var innerWidth = (outerWidth - totalframeWidth) / xCount;
                var innerHeight = (outerHeight - totalframeHeight) / yCount;
                points = [];
                points = points.concat(this.getRectanglePoints(start,end));
                for(var i = 0; i < xCount; i++){
                    var innerStartX = minX + outerFrame + (i * innerWidth) + (i * innerFrame);
                    var innerEndX = innerStartX + innerWidth;
                    for(var j = 0; j < yCount; j++){
                        var innerStartY = minY + outerFrame + (j * innerHeight) + (j * innerFrame);
                        var innerEndY = innerStartY + innerHeight;
                        points = points.concat(this.getRectanglePoints({x:innerStartX,y:innerStartY},{x:innerEndX,y:innerEndY}));
                    }    
                }
                return points;
            },
            getLines:function(points){
                var lines = [];
                if (points.length < 2) { return []; }//در حالتی که یک پوینت بیشتر موجود نیست لاینی نباید تولید شود این مشکل در حالت کلوز ترو خود را نشان می دهد
                for(var i = 0; i < points.length; i+=4){
                    lines = lines.concat(this.getsinglerowlines(points.slice(i,i+4),this.state.close))    
                }
                return lines;
            },
            save:function(){
                var points = this.getPoints();
                if (points.length < 2) { return false; }
                var lines = this.getLines();
                for(var i = 0; i < points.length; i+=4){
                    var p = points.slice(i,i+4);
                    var l = lines.slice(i,i+4);    
                    this.savesinglerow(p,l);
                }
                return true;
            },
           
        }
    },
    offsetLine: {
        startOffset: null,
        step: 10,
        offset: null,
        offsetedLines: [],
        model:[],
        selectMode:"Line",
        mousedown: function (e) {
            var coords = app.canvas.getMousePosition();
            this.startOffset = coords.x;
            var line = app.getLine({ is: { layerId: layers.getActive().id } });
            if (!line) {
                Lines.deselectAll();
                edit.selectRect = {
                    start: coords,
                    end: coords
                };
                this.clickMode = "canvas";
            }
            else {
                if(this.selectMode === "Line"){
                    Lines.select(line);
                }
                else{
                    Lines.selectSpline(line)
                }
                this.getParameters(coords);
                this.clickMode = "line";
            }
            app.eventHandler("window", "mousemove", $.proxy(this.mousemove, this));
            app.eventHandler("window", "mouseup", $.proxy(this.mouseup, this));
        },
        getParameters:function(){
            this.model = [];
            for (var i = 0; i < Lines.selected.length; i++) {
                var line = Lines.selected[i];
                this.model.push({line: line,radian:Lines.getRadian(line)});
            }
        },
        mousemove: function (e) {
            app.redraw();
            if (this.clickMode === "line") {
                this.doOffset();
            }
            else{
                edit.selectRect.end = app.canvas.getMousePosition();
                edit.drawSelectRect();
            }
        },
        doOffset:function(){
            app.redraw();
            var coords = app.canvas.getMousePosition()
            var offset = coords.x - this.startOffset;
            this.offset = Math.round(offset / this.step) * this.step;
            this.offsetedLines = [];
            for (var i = 0; i < this.model.length; i++) {
                var model = this.model[i];
                var ol = Lines.getParallelLine(model.line,this.offset,model.radian);
                this.offsetedLines.push(ol);
                app.drawLine({ start: ol.start, end: ol.end, color: "yellow", showDimension: true });
                if(i === 0){
                    app.drawLine({
                        start: { x: ol.start.x, y: ol.start.y },
                        end: { x: model.line.start.x, y: model.line.start.y },
                        color: "yellow", lineDash: [4, 4], showDimension: true
                    });
                }
            }
        },
        mouseup: function () {
            app.eventRemover("window", "mousemove", this.mousemove);
            app.eventRemover("window", "mouseup", this.mouseup);
            if (this.clickMode === "canvas") {
                var sr = edit.selectRect;
                if (Math.abs(sr.start.x - sr.end.x) >= 3 &&Math.abs(sr.start.y - sr.end.y) >= 3) {edit.selectBySelectRect(this.selectMode);}
            }
            else {
                this.save();
                Lines.deselectAll();
            }
            app.redraw();
        },
        save:function(){
            if (this.model.length === 0 || Math.abs(this.offset) < 5) { Lines.deselectAll(); app.redraw(); return; }
            for (var i = 0; i < this.offsetedLines.length; i++) {
                var model = this.model[i];
                var ol = this.offsetedLines[i];
                var point1 = Points.add({ x: ol.start.x, y: ol.start.y, connectedLines: [{ id: Lines.getNextID(1), side: "start" }] });
                var point2 = Points.add({ x: ol.end.x, y: ol.end.y, connectedLines: [{ id: Lines.getNextID(1), side: "end" }] });
                var line = Lines.add({ start: { x: ol.start.x, y: ol.start.y, id: point1.id }, end: { x: ol.end.x, y: ol.end.y, id: point2.id } });
            }
            Lines.deselectAll();
            undo.save();
            app.redraw();
        },
        
    },
    plumbLine: {
        line: null,
        point: null,
        plumb: null,
        points: null,
        side: null,
        bond: false,
        magnetArea: 5,
        step: 10,
        mousedown: function () {
            var coords = app.canvas.getMousePosition();
            this.line = app.getLine({coords: coords,is: { layerId: layers.getActive().id }});
            if (!this.line) { return; }
            this.points = Lines.getPoints(this.line);
            app.redraw();
            app.eventHandler("window", "mousemove", $.proxy(this.mousemove, this));
            app.eventHandler("window", "mouseup", $.proxy(this.mouseup, this));
        },
        mousemove: function () {
            var coords = app.canvas.getMousePosition();
            this.plumb = Lines.getPrependicularLine(this.line, coords);
            var point = this.plumb.start;
            var distance = {
                start: Lines.getLength({ start: point, end: this.points.start }),
                end: Lines.getLength({ start: point, end: this.points.end })
            }
            if (distance.start <= distance.end) { this.side = "start"; } else { this.side = "end"; }
            if (distance[this.side] < this.magnetArea) {
                var deltaX = this.points[this.side].x - point.x, deltaY = this.points[this.side].y - point.y;
                this.bond = true;
            }
            else { var deltaX = 0, deltaY = 0; this.bond = false; }


            this.plumb = {
                start: { x: this.plumb.start.x + deltaX, y: this.plumb.start.y + deltaY },
                end: { x: this.plumb.end.x + deltaX, y: this.plumb.end.y + deltaY }
            };
            this.plumb = Lines.getStepedLine({ line: this.plumb, side: "end", step: this.step });
            app.redraw();
            app.drawLine({ start: this.plumb.start, end: this.plumb.end, color: "yellow", showDimension: true, lineDash: [4, 4] });
            app.drawLine({ start: this.plumb.start, end: this.line.end, color: "yellow", showDimension: true, lineDash: [4, 4] });
            app.drawLine({ start: this.plumb.start, end: this.line.start, color: "yellow", showDimension: true, lineDash: [4, 4] });
        },
        mouseup: function () {
            app.eventRemover("window", "mousemove", this.mousemove);
            app.eventRemover("window", "mouseup", this.mouseup);
            Lines.deselectAll();
            if (Lines.getLength(this.plumb) > 5) {
                var point1 = Points.add({
                    x: this.plumb.start.x,y: this.plumb.start.y,
                    connectedLines: [{id: Lines.getNextID(1),side: "start"}],
                });
                var point2 = Points.add({
                    x: this.plumb.end.x,y: this.plumb.end.y,
                    connectedLines: [{id: Lines.getNextID(1),side: "end"}],
                });
                var line = Lines.add({
                    start: {x: this.plumb.start.x,y: this.plumb.start.y,id: point1.id},
                    end: {x: this.plumb.end.x,y: this.plumb.end.y,id: point2.id}
                });
                undo.save();
            }
            app.redraw();
        },
    },
    extendLine: {
        side: null,
        startOffset: null,
        step: 10,
        point: null,
        line: null,
        mousedown: function () {
            Lines.deselectAll();
            this.line = app.getLine({ is: { layerId: layers.getActive().id } });
            if (!this.line) { return; }
            this.line.showDimension = true;
            Lines.select(this.line);
            var coords = app.canvas.getMousePosition();
            var points = Lines.getPoints(this.line);
            if(Lines.getLength({ start: coords, end: points.start }) < Lines.getLength({ start: coords, end: points.end })){
                var x1 = this.line.end.x, y1 = this.line.end.y;
                this.point = points.start;
            }
            else{
                var x1 = this.line.start.x, y1 = this.line.start.y;
                this.point = points.end;
            }
            this.startOffset = {
                x1: x1,
                y1: y1,
                dip: Lines.getDip(this.line),
                pointCoords: { x: this.point.x, y: this.point.y }
            };
            app.redraw();
            app.eventHandler("window", "mousemove", $.proxy(this.mousemove, this));
            app.eventHandler("window", "mouseup", $.proxy(this.mouseup, this));
        },
        mousemove: function (e) {
            var so = this.startOffset,
            coords = app.canvas.getMousePosition();
            app.redraw();
            var start = { x: this.point.x, y:this.point.y};
            if (so.dip === "infinity") {
                var end = {x:this.line.start.x,y:coords.y};
            }
            else if (so.dip === 0) {
                var end = {x:coords.x,y:this.line.start.y};
            }
            else if (Math.abs(so.dip) <= 1) {
                var end = {x:coords.x,y:Lines.getYByX(this.line, coords.x, so.dip)};
            }
            else {
                var end = {x:Lines.getXByY(this.line, coords.y, so.dip),y:coords.y};
            }
            var extendLine = {start: start, end: end };
            extendLine = Lines.getStepedLine({ line: extendLine, side: "end", step: this.step, dip: so.dip });
            this.line = extendLine;
            app.drawLine({ start: extendLine.start, end: extendLine.end, color: "yellow", showDimension: true, lineDash: [4, 4] });
            
        },
        mouseup: function () {
            app.eventRemover("window", "mousemove", this.mousemove);
            app.eventRemover("window", "mouseup", this.mouseup);
            Lines.selected[0].showDimension = false;
            var eline = this.line;
            if (eline !== null && app.canvas.get.line.length(eline) >= 5) {
                var startPoint = Points.add({
                    x: eline.start.x, y: eline.start.y,
                    connectedLines: [{ id: Lines.getNextID(1), side: "start" }],
                });
                var endPoint = Points.add({
                    x: eline.end.x, y: eline.end.y,
                    connectedLines: [{ id: Lines.getNextID(1), side: "end" }],
                });
                var line = Lines.add({
                    start: { x: startPoint.x, y: startPoint.y, id: startPoint.id },
                    end: { x: endPoint.x, y: endPoint.y, id: endPoint.id },
                });
            }
            Lines.deselectAll();
            app.redraw();
            undo.save();
        },
    },
    setting: function () {
        var mode = app.state.createmode;
        var template = []
        template.push({
            type:"slider",title: "Ortho Angle",
            value: create.ortho,start: 0,step: 15,end: 90,
            callback: function (value) {create.ortho = value;}
        });
        if(['polyline','doubleline','path','doublepath','frame','ngon','rectangle'].indexOf(mode.value) !== -1){
            template.push({
                type: "slider", title: "Snap Area", value: app.canvas.getSnap(),
                callback: function (value) {
                    app.canvas.setSnap(value);
                },
                min:1,start: 0, step: 10, end: 100,
            });
        }
        if(mode.value === 'extendLine'){
            template.push({
                title: "Step",
                type:"slider",
                value: edit.extendLine.step,
                start: 0,
                step: 1,
                min: 1,
                end: 100,
                callback: function (value) {
                    create.extendLine.step = value;
                }
            });
        }
        if(mode.value === 'plumbLine'){
            template.push({
                type:"slider",title: "Magnet Area",
                value: create.plumbLine.magnetArea,start: 0,step: 1,min: 1,end: 20,
                callback: function (value) {
                    console.log(value);
                    create.plumbLine.magnetArea = value;
                }
            },
            {
                type:"slider",title: "Step",
                value: create.plumbLine.step,start: 0,step: 1,min: 1,end: 100,
                callback: function (value) {
                    if(isNaN(value)){debugger;}
                    create.plumbLine.step = value;
                }
            });
        }
        if(mode.value === 'offsetLine'){
            template.push({
                type:"slider",title: "Step", value: create.offsetLine.step, start: 0, step: 1, min: 1, end: 100,
                callback:function (value) {create.offsetLine.step = value;}
            });
        }
        template.push({
            type: "slider", title: "Auto Weld", value: create.autoWeldArea,
            callback: function (value) {
                create.autoWeldArea = value;
            },
            start: 1, step: 1, end: 30,
        });
        if (mode.value === "ngon") {
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
        if (mode.value === "doubleline") {
            template.push({
                type: "slider", title: "Thickness", value: create.thickness,
                callback: function (value) { create.thickness = value; },
                min:1,start: 0, step: 10, end: 400,
            });
        }
        if (mode.value === "frame") {
            template.push({
                type: "numberbox", title: "Out frame", value: create.outerFrame,
                callback: function (obj) { create.outerFrame = obj.value; },
            });
            template.push({
                type: "numberbox", title: "In frame", value: create.innerFrame,
                callback: function (obj) { create.innerFrame = obj.value; },
            });
            template.push({
                type: "numberbox", title: "X frames", value: create.xCount,
                callback: function (obj) { create.xCount = obj.value; },
            });
            template.push({
                type: "numberbox", title: "Y frames", value: create.yCount,
                callback: function (obj) { create.yCount = obj.value; },
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
    margin: { left: 80, top: 120, right: 80, bottom: 80 },
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
    margin: { left: 80 + 0, top: 80, right: 80 + 0, bottom: 80 + 40 },//80 is createControl.style.distance
    run: function (coords, callback,endCallback) {
        var c = app.canvas;
        var zoom = app.canvas.getZoom();
        var x = coords.x, y = coords.y, m = this.margin, width = c.getWidth(), height = c.getHeight();
        var top = m.top + (app.state.appmode === "create"?40:80);
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