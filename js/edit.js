var edit = {
    selectRect: { start: null, end: null },
    pan:false,
    mousedown: function (e) {
        this.mousedown(e);
    },
    end: function () {
        Points.deselectAll();
        Lines.deselectAll();
        this.reset();
        app.redraw();
        axis.close();
    },
    drawSelectRect: function () {
        var sr = edit.selectRect;
        var width = sr.end.x - sr.start.x;
        var height = sr.end.y - sr.start.y;
        app.canvas.drawRectangle({ x: sr.start.x, y: sr.start.y, width: width, height: height, fill: "rgba(136,144,148,0.5)" });
    },
    selectBySelectRect: function (mode) {
        var s = this.selectRect, sX = s.start.x, sY = s.start.y, eX = s.end.x, eY = s.end.y;
        if (Lines.getLength(s) < 5) {return false;}
        if (sX > eX) { var help = sX; sX = eX; eX = help; }
        if (sY > eY) { var help = sY; sY = eY; eY = help; }
        var layer = layers.getActive();
        var selectedList = [];
        if (mode === "Point") {
            var points = app.state.points, length = points.length;
            for (var i = 0; i < length; i++) {
                var point = points[i];
                if (point.layerId !== layer.id) { continue; }
                if (point.x <= eX && point.x >= sX && point.y <= eY && point.y >= sY) {
                    Points.select(point); selectedList.push(point);
                }
            }
        } else {
            var lines = app.state.lines, length = lines.length;
            var left = { start: { x: sX, y: sY }, end: { x: sX, y: eY } };
            var right = { start: { x: eX, y: sY }, end: { x: eX, y: eY } };
            var top = { start: { x: sX, y: sY }, end: { x: eX, y: sY } };
            var bottom = { start: { x: sX, y: eY }, end: { x: eX, y: eY } };
            for (var i = 0; i < length; i++) {
                var line = lines[i];
                if (line.layerId !== layer.id) { continue; }
                if (Lines.haveInnerMeet(left, line) || Lines.haveInnerMeet(right, line) ||
                    Lines.haveInnerMeet(top, line) || Lines.haveInnerMeet(bottom, line)) {
                    (mode === "Line") ? Lines.select(line) : Lines.selectSpline(line);
                    selectedList.push(line);
                    continue;
                }
                if (line.start.x >= sX && line.start.x <= eX && line.end.x >= sX && line.end.x <= eX &&
                    line.start.y >= sY && line.start.y <= eY && line.end.y >= sY && line.end.y <= eY) {
                    (mode === "Line") ? Lines.select(line) : Lines.selectSpline(line);
                    selectedList.push(line);
                    continue;
                }
            }
        }
        if(selectedList.length === 0){ return false;}
        else if(mode === "Point"){return Points.getCenterOfList(selectedList)}
        else{return Lines.getCenterOfList(selectedList)}
    },
    selectByClick:function(mode){
        if (mode === "Point") {
            var point = app.getPoint();
            if (point) { Points.select(point); return point; }
        }
        else {
            var line = app.getLine();
            if (line) {
                if (mode === "Line") { Lines.select(line); }
                else { Lines.selectSpline(line); }
                return Lines.getCenterOfList([line]);
            }
        }
        return false;
    },
    drawPoint: function (x, y) {
        var size = 3 / app.canvas.getZoom();
        app.canvas.drawArc({ x: x, y: y, radius: size, fill: "orange" });
        app.canvas.drawArc({ x: x, y: y, radius: size * 2, stroke: "orange" });
    },
    extendLine: {
        side: null,
        startOffset: null,
        step: 10,
        point: null,
        line: null,
        size:100,
        mousedown: function () {
            if(this.step<=0){return;}
            edit.end();
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
            var start = { x:so.x1, y: so.y1 };
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
            Points.moveTo(this.point, extendLine.end.x, extendLine.end.y);
            app.redraw();
            
        },
        mouseup: function () {
            app.eventRemover("window", "mousemove", this.mousemove);
            app.eventRemover("window", "mouseup", this.mouseup);
            Lines.deselectAll();
            app.redraw();
            undo.save();
        },
    },
    isTransformed: false,
    transformMode:false,
    align1:false,
    addPointMode:false,
    extendLineMode:false,
    chamferMode:false,
    selectMode: "Point",
    type: "none",
    rotateNumber: 0,
    copyMode: false,
    startOffset: null,
    clickedOn: "none",
    points: [],
    pointsState: [],
    linesState: [],
    mousePosition: null,
    lines: [],
    copyModel: [],
    magnetArea: 5,
    snapAngle:15,
    weldArea:5,
    selectAll: function () {
        var layer = layers.getActive();
        if (this.selectMode === "Point") {
            for (var i = 0; i < app.state.points.length; i++) {
                var point = app.state.points[i];
                if (layer.id === point.layerId) {
                    Points.select(point);
                }
            }
        }
        else {
            for (var i = 0; i < app.state.lines.length; i++) {
                var line = app.state.lines[i];
                if (layer.id === line.layerId) {
                    Lines.select(line);
                }
            }
        }
        app.redraw();
        components.update('sub-menu');
        components.update('selected-show');
    },
    remove: function () {
        if (this.selectMode === "Point") {
            for (var i = 0; i < Points.selected.length; i++) {
                var point = Points.selected[i];
                Points.remove(point, true);
            }
        }
        else {
            for (var i = 0; i < Lines.selected.length; i++) {
                var line = Lines.selected[i];
                Lines.remove(line, true);
            }
        }
        edit.end();
        undo.save();
        components.update('sub-menu');
        components.update('selected-show');
    },
    mirrorX: function () { this.mirror("x"); },
    mirrorY: function () { this.mirror("y"); },
    mirror: function (ax) {
        var center = axis.getPosition();
        if (this.selectMode === "Point") {
            if (Points.selected.length < 2) { return; }
            for (var i = 0; i < Points.selected.length; i++) {
                var point = Points.selected[i];
                var distance = center[ax] - point[ax];
                var pos = { x: point.x, y: point.y };
                pos[ax] += 2 * distance;
                Points.moveTo(point, pos.x, pos.y);
            }
        }
        else {
            if (Lines.selected.length === 0) { return; }
            var selected = Lines.getPointsOfList(Lines.selected);
            for (var i = 0; i < selected.length; i++) {
                var point = selected[i];
                var distance = center[ax] - point[ax];
                var pos = { x: point.x, y: point.y };
                pos[ax] += 2 * distance;
                Points.moveTo(point, pos.x, pos.y);
            }
        }
        undo.save();
        app.redraw();
    },
    weldPointApprove: function () {
        for (var i = 0; i < Points.selected.length; i++) {
            var f = Points.selected[i];
            for (var j = 0; j < Points.selected.length; j++) {
                if (i === j) { continue; }
                var s = Points.selected[j];
                if(Lines.getLength({start:f,end:s}) > this.weldArea){continue;}
                if (Points.isConnect(f, s)) {
                    return true;
                }
                else if (f.connectedLines.length === 1 && s.connectedLines.length === 1) {
                    return true;
                }
            }
        }
        return false;
    },
    weldPoint: function (state) {
        for (var i = 0; i < Points.selected.length; i++) {
            var selected1 = Points.selected[i];
            var id1 = selected1.id;
            for (var j = 0; j < Points.selected.length; j++) {
                if (i === j) { continue; }
                var selected2 = Points.selected[j];
                var id2 = selected2.id;
                if(Lines.getLength({start:selected1,end:selected2}) > this.weldArea){continue;}
                var point = Points.merge(selected1, selected2);
                if (point === false) { continue; }
                Points.deselect(id1);
                Points.deselect(id2);
                if (point.connectedLines.length === 0) {
                    Points.remove(point);
                }
                else {
                    Points.select(point);
                }
                this.weldPoint();
                return;
            }
        }
        this.end();
        undo.save();
        components.update('sub-menu');
        components.update('selected-show');
    },
    breakPointApprove: function () {
        for (var i = 0; i < Points.selected.length; i++) {
            if (Points.selected[i].connectedLines.length > 1) { return true; }
        }
        return false;
    },
    breakPoint: function () {
        while (Points.selected[0]) {
            var selected = Points.selected[0];
            if (selected.connectedLines.length >= 2) {
                for (var i = 0; i < selected.connectedLines.length; i++) {
                    var point = Points.add({ x: selected.x, y: selected.y });
                    var cl = selected.connectedLines[i];
                    var line = Lines.getObjectByID(cl.id);
                    line[cl.side].id = point.id;
                    point.connectedLines.push({ id: cl.id, side: cl.side });
                }
                app.state.points.splice(Points.getIndexByID(selected.id), 1);
            }
            Points.deselect(selected.id);
        }
        edit.end();
        undo.save();
        components.update('sub-menu');
        components.update('selected-show');
    },
    connectPointsApprove: function () {
        if (Points.selected.length !== 2) { return false; }
        if (Points.isConnect(Points.selected[0], Points.selected[1])) { return false; }
        else { return true; }
    },
    connectPoints: function () {
        Points.connect(Points.selected[0], Points.selected[1]);
        edit.end();
        undo.save();
        components.update('sub-menu');
        components.update('selected-show');
    },
    divide: function (obj) {
        if(obj.value < 2){return;}
        Lines.divide(Lines.selected[0], obj.value);
        edit.end();
        undo.save();
        components.update('sub-menu');
        components.update('selected-show');
    },
    joinLines: function () {
        Lines.join(Lines.selected[0], Lines.selected[1]);
        Lines.deselectAll();
        edit.end();
        undo.save();
        components.update('sub-menu');
        components.update('selected-show');
    },
    updateModel: function () {
        var axisPos = axis.getPosition();
        if(!axisPos){return;}
        if (this.selectMode === "Point") {
            this.points = Points.selected;
        } else {
            this.points = Lines.getPointsOfList(Lines.selected);
        }
        this.pointsState = [];
        var length = this.points.length;
        for (var i = 0; i < length; i++) {
            var point = this.points[i];
            this.pointsState.push({ x: point.x, y: point.y, radian: Lines.getRadian({ start: axisPos, end: point }) });
        }
        this.linesState = [];
        var length = Lines.selected.length;
        for (var i = 0; i < length; i++) {
            var line = Lines.selected[i];
            this.linesState.push({
                start: { x: line.start.x, y: line.start.y, radian: Lines.getRadian({ start: axisPos, end: { x: line.start.x, y: line.start.y } }) },
                end: { x: line.end.x, y: line.end.y, radian: Lines.getRadian({ start: axisPos, end: { x: line.end.x, y: line.end.y } }) },
            });
        }
    },
    mousedown: function (e) {
        if(this.align1 !== false){this.alignPointBefore(); return;}
        if(this.addPointMode){edit.addPoint.mousedown(); return;}
        if(this.extendLineMode){edit.extendLine.mousedown(); return;}
        if(this.chamferMode){edit.chamfer.mousedown(); return;}
        app.eventHandler("window", "mousemove", $.proxy(this.mousemove, this));
        app.eventHandler("window", "mouseup", $.proxy(this.mouseup, this));
        var coords = app.canvas.getMousePosition();
        var axisPos = axis.getPosition() || {x:undefined,y:undefined};
        edit.selectRect = {
            start: { x: coords.x, y: coords.y }, end: { x: coords.x, y: coords.y }
        };
        var client = app.getClient(e);
        this.updateModel();
        this.startOffset = { x: client.x, y: client.y, axisX: axisPos.x, axisY: axisPos.y };
    },
    mousemove: function (e) {
        app.redraw();
        var so = this.startOffset;
        var client = app.getClient(e);
        edit.selectRect.end = app.canvas.getMousePosition();
        if (axis.mode === "none") { edit.drawSelectRect(); }
        else {
            if (["axis-move", "axis-move-horizontal", "axis-move-vertical"].indexOf(axis.mode) !== -1) {

                var offset = app.canvas.getSnapedCoords({ x: (client.x - so.x) / app.canvas.getZoom(), y: (client.y - so.y) / app.canvas.getZoom() });

                offset = { x: (axis.mode === "axis-move-vertical") ? 0 : offset.x, y: (axis.mode === "axis-move-horizontal") ? 0 : offset.y };
                this.move(offset);
            }
            else if (axis.mode === "axis-rotate") {
                var offset = Math.floor(
                    (client.x - so.x) / (this.snapAngle === 1?3:1)
                );
                this.rotate(offset);
            }
        }
    },
    mouseup: function (e) {
        app.eventRemover("window", "mousemove", this.mousemove);
        app.eventRemover("window", "mouseup", this.mouseup);
        if (axis.mode === "none") {
            var position = edit.selectBySelectRect(this.selectMode) || edit.selectByClick(this.selectMode);
            if(position){
                screenCorrection.run(app.canvas.canvasToClient(position), function () {
                    app.redraw();
                    if(edit.transformMode){axis.setPosition(position);}
                });
            }
            else{edit.end();}
            components.update('sub-menu');
            components.update('selected-show');
            return;
        }
        if(this.isTransformed){
            if(this.copyMode){
                this.saveCopy();
            }
            else{
                if (Points.selected.length === 1) {
                    var selected = Points.selected[0];
                    var connectedPoints = Points.getConnectedPoints(selected);
                    var forbidenIds = [selected.id];
                    for (var i = 0; i < connectedPoints.length; i++) {
                        forbidenIds.push(connectedPoints[i].id);
                    }
                    var point = app.getPoint({ area: this.magnetArea, coords: selected, isnt: { id: forbidenIds } });
                    if (point) {
                        Points.moveTo(selected, point.x, point.y);
                        axis.setPosition(point);
                    }
                    app.redraw();
                }
            }
            this.rotateNumber = axis.getPosition()?parseInt($("#axis-angle .value").html()):0;
            this.isTransformed = false;
            screenCorrection.run(app.canvas.canvasToClient(axis.getPosition()), function () {
                app.redraw();
                axis.setPosition(axis.getPosition());
            });
            undo.save();
        }
    },
    transform:function(){
        this.transformMode = true;
        app.state.topMenuTitle = 'Transform '+this.selectMode + 's';
        var center = Lines.getCenterOfList(Lines.selected) ||Points.getCenterOfList(Points.selected);
        if(center){axis.setPosition(center);}
    },
    axisButton:function(e){
        var button = $(e.currentTarget).parent();
        var id = button.attr("id");
        if (button.hasClass("radio")) {
            if (button.hasClass("active")) { button.removeClass("active"); axis.mode = "none"; }
            else { $("#axis .radio").removeClass("active"); button.addClass("active"); axis.mode = button.attr("id"); }
        }
        else if (button.hasClass("toggle")) {
            if (this.selectMode === "Point") {
                Alert.open({ title: "Cannot active clone mode!!!", template: "because select mode is 'Point'. for active copy mode , set select mode to 'Line' or 'Spline'.", buttons: [{text:"ok",callback:Alert.close}]});
            }
            else {
                button.toggleClass("active"); this.copyMode = !this.copyMode;
            }
        }
        else if (id === "axis-center") { axis.setPosition("center"); }
        else if (id === "axis-hide") { axis.close(); axis.mode = "none"; }
        else if (id === "axis-keyboard") {
            keyboard.open({
                fields: [{ title: "X", prop: "x" }, { title: "Y", prop: "y" }, { title: "Angle", prop: "angle" }],
                callback: this.transformTo.bind(this), float: false, negative: true, title: "Transform To:"
            });
        }
    },
    backgroundmousedown:function(e){
        var axisPos = axis.getPosition();
        var client = app.getClient(e);
        edit.startOffset = { x: client.x, y: client.y, axisX: axisPos.x, axisY: axisPos.y };
        app.eventHandler("window", "mousemove", $.proxy(this.backgroundmousemove,this));
        app.eventHandler("window", "mouseup", $.proxy(this.backgroundmouseup,this));
    },
    backgroundmousemove: function (e) {
        var so = edit.startOffset;
        var client = app.getClient(e);
        var offset = { x: (client.x - so.x) / app.canvas.getZoom(), y: (client.y - so.y) / app.canvas.getZoom() };
        axis.setPosition(app.canvas.getSnapedCoords({x:so.axisX + offset.x,y:so.axisY + offset.y}));
    },
    backgroundmouseup: function () {
        app.eventRemover("window", "mousemove", this.backgroundmousemove)
        app.eventRemover("window", "mouseup", this.backgroundmouseup);
        var point = app.getPoint({ area: this.magnetArea, coords: axis.getPosition() });
        if (point) {
            axis.setPosition({x:point.x, y:point.y});
        }
        var axisPosition = axis.getPosition();
        screenCorrection.run(app.canvas.canvasToClient(axisPosition), function () {
                app.redraw();
                axis.setPosition(axis.getPosition());
        });
    },
    move: function (offset) {
        if (Lines.getLength({start:{x:0,y:0},end:{x:offset.x,y:offset.y}}) < 5) { return false; }
        var so = this.startOffset;
        axis.setPosition({ x: so.axisX + offset.x, y: so.axisY + offset.y }); // Move Axis
        if (this.copyMode && this.selectMode !== "Point") {
            app.redraw();
            this.lines = [];
            var length = this.linesState.length;
            for (var k = 0; k < length; k++) {
                var lineState = this.linesState[k];
                var movedStart = { x: lineState.start.x + offset.x, y: lineState.start.y + offset.y };
                var movedEnd = { x: lineState.end.x + offset.x, y: lineState.end.y + offset.y };
                this.lines.push({ start: movedStart, end: movedEnd });
                app.drawLine({ start: movedStart, end: movedEnd, color: "yellow", showDimension: true });
            }
        } else {
            var length = this.points.length;
            for (var k = 0; k < length; k++) {
                var point = this.points[k];
                Points.moveTo(point, this.pointsState[k].x + offset.x, this.pointsState[k].y + offset.y);
            }
            app.redraw();
        }
        this.isTransformed = true;
    },
    rotate: function (offset) {
        offset = Math.round(offset / this.snapAngle) * this.snapAngle;
        if(offset === 0) {return;}
        $("#axis-angle .value").html((this.rotateNumber + offset) + "&deg;");
        var axisPos = axis.getPosition();
        if (this.copyMode && this.selectMode !== "Point") {
            app.redraw();
            this.lines = [];
            var length = this.linesState.length;
            for (var k = 0; k < length; k++) {
                var lineState = this.linesState[k];
                var rotatedStart = Points.getCoordsByRotate({ x: lineState.start.x, y: lineState.start.y }, offset + lineState.start.radian, axisPos);
                var rotatedEnd = Points.getCoordsByRotate({ x: lineState.end.x, y: lineState.end.y }, offset + lineState.end.radian, axisPos);
                this.lines.push({ start: rotatedStart, end: rotatedEnd });
                app.drawLine({ start: rotatedStart, end: rotatedEnd, color: "yellow", showDimension: true });
            }
        } else {
            var length = this.points.length;
            for (var k = 0; k < length; k++) {
                var point = this.points[k];
                var pointsState = this.pointsState[k];
                Points.rotateTo(point, pointsState.radian + offset, axisPos);
            }
            app.redraw();
        }
        this.isTransformed = true;
    },
    transformTo: function (obj) {
        if(obj.x === 0 && obj.y === 0 && obj.angle === 0){return;}
        var axisPosition = axis.getPosition();
        this.startOffset = {
            axisX: axisPosition.x,
            axisY: axisPosition.y,
        };
        this.updateModel();
        this.move({ x: obj.x, y: obj.y });
        this.updateModel();
        this.rotate(obj.angle);
        this.updateModel();
        if(this.copyMode){this.saveCopy();}
        else{
            if (Points.selected.length === 1) {
                var selected = Points.selected[0];
                var connectedPoints = Points.getConnectedPoints(selected);
                var forbidenIds = [selected.id];
                for (var i = 0; i < connectedPoints.length; i++) {
                    forbidenIds.push(connectedPoints[i].id);
                }
                var point = app.getPoint({ area: this.magnetArea, coords: selected, isnt: { id: forbidenIds } });
                if (point) {
                    Points.moveTo(selected, point.x, point.y);
                    axis.setPosition(point);
                }
                app.redraw();
            }
        }
        this.rotateNumber = axis.getPosition()?parseInt($("#axis-angle .value").html()):0;
        this.isTransformed = false;
        screenCorrection.run(app.canvas.canvasToClient(axis.getPosition()), function () {
            app.redraw();
            axis.setPosition(axis.getPosition());
        });
        undo.save();
    },
    saveCopy:function(){
        Lines.deselectAll();
        for (var i = 0; i < this.lines.length; i++) {
            var line = this.lines[i];
            var addedLine = Lines.add({
                start: { x: line.start.x, y: line.start.y, id: Points.getNextID(1) },
                end: { x: line.end.x, y: line.end.y, id: Points.getNextID(2) }
            });
            var addedPoint1 = Points.add({
                x: line.start.x,
                y: line.start.y,
                connectedLines: [{ side: "start", id: addedLine.id }]
            });
            var addedPoint2 = Points.add({
                x: line.end.x,
                y: line.end.y,
                connectedLines: [{ side: "end", id: addedLine.id }]
            });
            Lines.select(addedLine);
        }
        app.redraw();
    },
    alignPointBefore:function() {
        this.align2 = app.getPoint();
        if(!this.align2 || this.align2.id === this.align1.id){ return; }
        Alert.open({
            title: "Align Point",
            buttons: [
                { text: "Align X,Y", callback: function(){this.alignPoint('XY'); Alert.close();} },
                { text: "Align Y", callback: function(){this.alignPoint('Y'); Alert.close();} },
                { text: "Align X", callback: function(){this.alignPoint('X'); Alert.close();} },
            ],
            template: "Select Align Type.",
        });
    },
    alignPoint: function (mode) {
        var x = this.align2.x, y = this.align2.y;
        if (mode === "X") { y = this.align1.y; } else if (mode === "Y") { x = this.align1.x; }
        Points.moveTo(this.align1, x, y); edit.end(); undo.save();
        this.align1 = this.align2 = false;
        app.state.topMenuTitle = false;
        components.update('top-menu');
        components.update('sub-menu');
        components.update('bottom-menu');
    },
    setting: function () {
        var title;
        var buttons = [{text: "OK",callback:Alert.close}];
        var template;
        if(this.addPointMode){
            title = "Add Point Setting";
            template = [
                {
                    type:"numberbox",title: "Distance",negative:false,
                    min:5,value: edit.addPoint.min,
                    callback: function (obj) {edit.addPoint.min = obj.value;}
                }
            ];
        }
        else if(this.extendLineMode){
            title = 'Extend Line Setting';
            template = [
                {
                    type:"numberbox",title: "Step",negative:false,min:0,
                    value: edit.extendLine.step,
                    callback: function (obj) {edit.extendLine.step = obj.value;},
                }
            ];
        }
        else{
            title = 'Edit Options';
            template = [
                {
                    type:"slider",
                    callback: function(value){app.canvas.setSnap(value);},
                    start:1,end:30,step:1,value: app.canvas.getSnap(),
                    title: "Snap Area",
                },
                {
                    type:"slider",
                    callback: function(value){edit.snapAngle = value;},
                    start:0,end:90,step:15,min:1,value: this.snapAngle,
                    title: "Snap Angle",
                },

                {
                    type:"slider",
                    callback: function(value){
                        edit.magnetArea = value;
                        var magnetSize = value * app.canvas.getZoom();

                        $("#axis-magnet").css({
                            width:magnetSize*2,
                            height:magnetSize*2,
                            top:"calc(50% - "+(magnetSize)+"px)",
                            left:"calc(50% - "+(magnetSize)+"px)"
                        });
                    },
                    start:1,end:30,step:1,value: this.magnetArea,
                    title: "Magnet Area",
                },
                {
                    type:"numberbox",
                    callback: function(obj){edit.weldArea = obj.value;},
                    value: this.weldArea,
                    title: "Weld Area",
                },

            ];
        }
        Alert.open({title: title,buttons: buttons,template:template});
    },
    reset: function () {
        this.copyMode = this.selectMode === "Point" ? false : this.copyMode;
        this.align1 = false;
    },
    chamfer: {
        model: [],
        startOffset: null,
        offset: 0,
        points: [],
        breaked: false,
        clickMode: null,
        mousedown: function () {
            var coords = app.canvas.getMousePosition();
            this.startOffset = coords.x;
            var point = app.getPoint({is:{layerId:layers.getActive().id}});
            if (!point) {
                Points.deselectAll();
                edit.selectRect = {
                    start: coords,
                    end: coords
                };
                this.clickMode = "canvas";
            }
            else {
                Points.select(point);
                this.getParameters(coords);
                this.clickMode = "point";
            }
            app.eventHandler("window", "mousemove", $.proxy(this.mousemove, this));
            app.eventHandler("window", "mouseup", $.proxy(this.mouseup, this));
        },
        getParameters: function () {
            this.model = [];
            for (var i = 0; i < Points.selected.length; i++) {
                var point = Points.selected[i];
                if (point.connectedLines.length < 2) { continue; }
                var line1 = Lines.getObjectByID(point.connectedLines[0].id);
                var line2 = Lines.getObjectByID(point.connectedLines[1].id);
                var side1 = point.connectedLines[0].side;
                var otherSide1 = (side1 === "start") ? "end" : "start";
                var side2 = point.connectedLines[1].side;
                var otherSide2 = (side2 === "start") ? "end" : "start";
                var sx1 = Math.sign(line1[otherSide1].x - point.x); var sy1 = Math.sign(line1[otherSide1].y - point.y);
                var sx2 = Math.sign(line2[otherSide2].x - point.x); var sy2 = Math.sign(line2[otherSide2].y - point.y);
                this.model.push({
                    point: Points.selected[i],
                    line1: line1,
                    side1: side1,
                    line1Coords: { start: { x: line1.start.x, y: line1.start.y }, end: { x: line1.end.x, y: line1.end.y } },
                    line2: line2,
                    side2: side2,
                    line2Coords: { start: { x: line2.start.x, y: line2.start.y }, end: { x: line2.end.x, y: line2.end.y } },
                    sx1: sx1,
                    sy1: sy1,
                    sx2: sx2,
                    sy2: sy2,
                });
            }
        },
        undoChanges: function () {
            for (var i = 0; i < this.model.length; i++) {
                var model = this.model[i];
                model.line1.start.x = model.line1Coords.start.x; model.line1.start.y = model.line1Coords.start.y;
                model.line1.end.x = model.line1Coords.end.x; model.line1.end.y = model.line1Coords.end.y;
                model.line2.start.x = model.line2Coords.start.x; model.line2.start.y = model.line2Coords.start.y;
                model.line2.end.x = model.line2Coords.end.x; model.line2.end.y = model.line2Coords.end.y;
            }
        },
        mousemove: function () {
            app.redraw();
            if (this.clickMode === "point") {
                this.doChamfer();
            }
            else{
                edit.selectRect.end = app.canvas.getMousePosition();
                edit.drawSelectRect();
            }
        },
        mouseup: function () {
            app.eventRemover("window", "mousemove", this.mousemove);
            app.eventRemover("window", "mouseup", this.mouseup);
            if (this.clickMode === "canvas") {
                var sr = edit.selectRect;
                if (Math.abs(sr.start.x - sr.end.x) >= 3 &&Math.abs(sr.start.y - sr.end.y) >= 3) {edit.selectBySelectRect("Point");}
            }
            else {
                this.save();
                edit.end();
            }
            app.redraw();
        },
        save: function () {
            if (this.model.length == 0) { return; }
            if (this.offset < 5) { this.undoChanges(); this.reset(); return; }
            for (var i = 0; i < this.model.length; i++) {
                var model = this.model[i];
                var line1 = model.line1;
                var side1 = model.side1;
                var line2 = model.line2;
                var side2 = model.side2;
                var point = model.point;
                var point1 = Points.add({
                    x: model.line1[side1].x, y: model.line1[side1].y,
                    connectedLines: [{ id: line1.id, side: side1 }, { id: Lines.getNextID(1), side: "start" }]
                });
                var point2 = Points.add({
                    x: model.line2[side2].x, y: model.line2[side2].y,
                    connectedLines: [{ id: line2.id, side: side2 }, { id: Lines.getNextID(1), side: "end" }]
                });
                line1[side1].id = point1.id;
                line2[side2].id = point2.id;
                Lines.add({
                    start: { x: point1.x, y: point1.y, id: point1.id },
                    end: { x: point2.x, y: point2.y, id: point2.id }
                });
                app.state.points.splice(Points.getIndexByID(point.id), 1);
            }
            app.redraw();
        },
        doChamfer: function () {
            var coords = app.canvas.getMousePosition()
            var offset = Math.abs(this.startOffset - coords.x);
            this.offset = offset;
            this.undoChanges();
            var length = this.model.length;
            for (var i = 0; i < length; i++) {
                var model = this.model[i];
                var length1 = Lines.getLength(model.line1),length2 = Lines.getLength(model.line2);
                if (length1 == 0 || length2 == 0) { this.offset = 0; return; }
                model.line1[model.side1].x = Math.abs(model.line1.start.x - model.line1.end.x) * offset / length1 * model.sx1 + model.line1Coords[model.side1].x;
                model.line2[model.side2].x = Math.abs(model.line2.start.x - model.line2.end.x) * offset / length2 * model.sx2 + model.line2Coords[model.side2].x;
                model.line1[model.side1].y = Math.abs(model.line1.start.y - model.line1.end.y) * offset / length1 * model.sy1 + model.line1Coords[model.side1].y;
                model.line2[model.side2].y = Math.abs(model.line2.start.y - model.line2.end.y) * offset / length2 * model.sy2 + model.line2Coords[model.side2].y;
                app.drawLine({ start: model.line1[model.side1], end: model.line2[model.side2], color: "yellow", showDimension: true, lineDash: [4, 4] });
            }
        },
        reset: function () { this.model = []; this.offset = 0; Points.deselectAll(); }
    },
    
    addPoint: {
        line: null,
        point: null,
        startPoint: null,
        endPoint: null,
        min: 5,
        mousedown: function () {
            var coords = app.canvas.getMousePosition();
            this.line = app.getLine({coords: coords,is: { layerId: layers.getActive().id }});
            if (!this.line) { return; }
            var length = Lines.getLength(this.line) / 2;
            if (this.min > Math.floor(length)) { this.min = Math.floor(length); }
            var delta = Lines.getDelta(this.line, this.min);
            this.maxX = app.getMax(this.line.start.x, this.line.end.x) - delta.x;
            this.maxY = app.getMax(this.line.start.y, this.line.end.y) - delta.y;
            this.minX = app.getMin(this.line.start.x, this.line.end.x) + delta.x;
            this.minY = app.getMin(this.line.start.y, this.line.end.y) + delta.y;
            this.point = Lines.getPrependicularPoint(this.line, coords);
            var sidePoints = Lines.getPoints(this.line);
            this.startPoint = sidePoints.start;
            this.endPoint = sidePoints.end;
            app.drawLine({ start: this.startPoint, end: this.point, color: "yellow", lineDash: [4, 4], showDimension: true });
            app.drawLine({ start: this.endPoint, end: this.point, color: "yellow", lineDash: [4, 4], showDimension: true });
            edit.drawPoint(this.point.x, this.point.y);
            app.eventHandler("window", "mousemove", $.proxy(this.mousemove, this));
            app.eventHandler("window", "mouseup", $.proxy(this.mouseup, this));
        },
        mousemove: function () {
            if (!this.line) { return; }
            app.redraw();
            var coords = app.canvas.getMousePosition();
            this.point = Lines.getPrependicularPoint(this.line, coords);
            this.point.x += this.point.x > this.maxX ? this.maxX - this.point.x : (this.point.x < this.minX ? this.minX - this.point.x : 0);
            this.point.y += this.point.y > this.maxY ? this.maxY - this.point.y : (this.point.y < this.minY ? this.minY - this.point.y : 0);
            app.drawLine({ start: this.startPoint, end: this.point, color: "yellow", lineDash: [4, 4], showDimension: true });
            app.drawLine({ start: this.endPoint, end: this.point, color: "yellow", lineDash: [4, 4], showDimension: true });
            edit.drawPoint(this.point.x, this.point.y);
        },
        mouseup: function () {
            app.eventRemover("window", "mousemove", this.mousemove);
            app.eventRemover("window", "mouseup", this.mouseup);
            if (!this.line) { return; }
            Lines.remove(this.line);
            var addedPoint = Points.add({ x: this.point.x, y: this.point.y });
            Points.connect(this.startPoint, addedPoint);
            Points.connect(addedPoint, this.endPoint);
            //undo.save();
            app.redraw();
        },
    },
}
var axis = {
    mode: "none",
    position:false,
    buttons: [
        { id: "axis-move-horizontal", iconClass: "mdi mdi-arrow-right-bold", className: "axis-icon-container radio", active: function () { return edit.axisMode === "axis-move-horizontal" ? ' active' : '' } },
        { id: "axis-rotate", iconClass: "mdi mdi-loop", className: "axis-icon-container radio", active: function () { return edit.axisMode === "axis-rotate" ? ' active' : '' } },
        { id: "axis-hide", iconClass: "mdi mdi-cancel", className: "axis-icon-container" },
        { id: "axis-center", iconClass: "mdi mdi-image-filter-center-focus", className: "axis-icon-container" },
        { id: "axis-keyboard", iconClass: "mdi mdi-keyboard", className: "axis-icon-container" },
        { id: "axis-copy", iconClass: "mdi mdi-content-copy", className: "axis-icon-container toggle", active: function () { return edit.copyMode && edit.selectMode !== "Point" ? ' active' : '' } },
        { id: "axis-move-vertical", iconClass: "mdi mdi-arrow-up-bold", className: "axis-icon-container radio", active: function () { return edit.axisMode === "axis-move-vertical" ? ' active' : '' } },
        { id: "axis-move", iconClass: "mdi mdi-arrow-all", className: "axis-icon-container radio", active: function () { return edit.axisMode === "axis-move" ? ' active' : '' } },
    ],
    open: function (coords) {
        this.position = coords;
        edit.rotateNumber = 0;
        var magnetSize = edit.magnetArea * app.canvas.getZoom();
        components.render({
            id:"axis",
            html:[
                {
                    id:"axis-background",
                    html:[
                        {id:"axis-magnet",attrs:{style:'top:calc(50% - '+(magnetSize)+'px);left:calc(50% - '+(magnetSize)+'px);width:'+(magnetSize*2)+'px;height:'+(magnetSize*2)+'px;'}},
                        {id:"axis-x",html:[{className:"title",html:["X:"]},{className:"value"}]},
                        {id:"axis-y",html:[{className:"title",html:["Y:"]},{className:"value"}]},
                        {id:"axis-angle",html:[{className:"title",html:["Angle:"]},{className:"value",html:["0"]}]},
                    ],
                    callback: edit.backgroundmousedown.bind(edit)
                },
                {
                    html:this.buttons.map(function(button,i){
                        return {
                            id:button.id,className:button.className + (button.active ? button.active() : ''),
                            attrs:{style: 'transform:rotate(' + (i * 45) + 'deg);'},
                            html:[
                                {
                                    id: button.id + "-icon", component: "Button",
                                    className: "icon " + button.iconClass,
                                    attrs:{style: 'transform:rotate(' + (i * -45) + 'deg);'},
                                    callback: edit.axisButton.bind(edit),
                                }
                            ]
                        }
                    })
                }
            ]
        },"body");
        this.setPosition(this.position);
    },
    close: function () {
        components.remove("axis");
        this.position = false;
        this.mode = "none";
    },
    setPosition: function (obj) {
        if(!obj){return;}
        if (this.position === false) { axis.open(obj); return;}
        var coords;
        if (obj === "center") { coords = edit.selectMode === "Point" ?
        Points.getCenterOfList(Points.selected) : Lines.getCenterOfList(Lines.selected); }
        else { coords = obj; }
        this.position = coords;
        var bodyCoords = app.canvas.canvasToClient(this.position);
        $("#axis").css({ "left": bodyCoords.x, "top": bodyCoords.y });
        $("#axis-x").html("X:" + coords.x.toFixed(1));
        $("#axis-y").html("Y:" + (coords.y * -1).toFixed(1));
    },
    getPosition: function () {
        return this.position;
    }
}