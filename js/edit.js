var edit = {
    selectRect: {start: null,end: null},
    end: function () {
        Points.deselectAll();
        Lines.deselectAll();
        if (edit[app.state.editmode].reset !== undefined) { edit[app.state.editmode].reset(); }
        app.redraw();
    },
    mousedown: function () {
        app.eventHandler("window", "mousemove", $.proxy(this.mousemove, this));
        app.eventHandler("window", "mouseup", $.proxy(this.mouseup, this));
        this[app.state.editmode].mousedown();
    },
    mousemove: function () {if (this[app.state.editmode].mousemove) { this[app.state.editmode].mousemove(); }},
    mouseup: function () {
        app.eventRemover("window", "mousemove", this.mousemove);
        app.eventRemover("window", "mouseup", this.mouseup);
        if (this[app.state.editmode].mouseup) { this[app.state.editmode].mouseup(); }  
    },
    drawSelectRect: function () {
        edit.selectRect.end = app.canvas.getMousePosition();
        var sr = edit.selectRect;
        var x = app.getMin(sr.start.x, sr.end.x);
        var y = app.getMin(sr.start.y, sr.end.y);
        var width = Math.abs(sr.start.x - sr.end.x);
        var height = Math.abs(sr.start.y - sr.end.y);
        app.canvas.drawRectangle({x: x,y: y,width: width,height: height,mode: "fill",color: "rgba(136,144,148,0.5)"});
    },
    selectBySelectRect: function (mode) {
        var s = this.selectRect,sX = s.start.x,sY = s.start.y,eX = s.end.x,eY = s.end.y;
        if (sX > eX) {var help = sX; sX = eX; eX = help;}
        if (sY > eY) {var help = sY; sY = eY; eY = help;}
        var layer = layers.getActive();
        if (mode === "Point") {
            var points = app.state.points,length = points.length;
            for (var i = 0; i < length; i++) {
                var point = points[i];
                if (point.layer !== layer.id) {continue;}
                if (point.x <= eX && point.x >= sX && point.y <= eY && point.y >= sY) {Points.select(point);}
            }
        } else {
            var lines = app.state.lines,length = lines.length;
            var left = {start:{x:sX,y:sY},end:{x:sX,y:eY}};
            var right = {start:{x:eX,y:sY},end:{x:eX,y:eY}};
            var top = {start:{x:sX,y:sY},end:{x:eX,y:sY}};
            var bottom = {start:{x:sX,y:eY},end:{x:eX,y:eY}};
            for (var i = 0; i < length; i++) {
                var line = lines[i];
                if (line.layer !== layer.id) {continue;}
                if(Lines.haveInnerMeet(left,line)||Lines.haveInnerMeet(right,line)||
                    Lines.haveInnerMeet(top,line)||Lines.haveInnerMeet(bottom,line)){
                        (mode === "Line") ? Lines.select(line) : Lines.selectSpline(line);
                        continue;    
                }
                if (line.start.x >= sX && line.start.x <= eX && line.end.x >= sX && line.end.x <= eX &&
                    line.start.y >= sY && line.start.y <= eY && line.end.y >= sY && line.end.y <= eY) {
                    (mode === "Line") ? Lines.select(line) : Lines.selectSpline(line);
                    continue;
                }
            }
        }
    },
    drawPoint: function (x, y) {
        var size = 3 / app.canvas.getZoom();
        app.canvas.drawArc({x: x,y: y,radius: size,color: "orange",mode: "fill"});
        app.canvas.drawArc({x: x,y: y,radius: size * 2,color: "orange",mode: "stroke"});
    },
    connectPoints: {
        firstPoint: false,
        mousedown: function () {
            var point = app.getPoint({ filter: { layer: layers.getActive().id } });
            var This = edit.connectPoints;
            if (!point) { edit.connectPoints.reset(); return; }
            if (!This.firstPoint) {This.firstPoint = point;edit.drawPoint(point.x, point.y);return;}
            if (point.id === This.firstPoint.id) {This.reset();return;}
            if (Points.isConnect(point, This.firstPoint)) {This.reset();return;            }
            Points.connect(This.firstPoint, point);This.reset();undo.save();app.redraw();
        },
        reset: function () {
            edit.connectPoints.firstPoint = false;
            app.redraw();
        }
    },
    joinLines: {
        firstLine: false,
        mousedown: function () {
            var line = app.getLine({ filter: { layer: layers.getActive().id } });
            var This = edit.joinLines;
            if (!line) { This.reset(); return; }
            if (!This.firstLine) {This.firstLine = line; Lines.select(line); app.redraw(); return;}
            if (This.firstLine.id === line.id) { return; }
            var state = Lines.join(This.firstLine, line);
            This.reset();
            if (state) {undo.save(); }
            app.redraw();
        },
        mousemove: function () { },
        mouseup: function () { },
        reset: function () {edit.joinLines.firstLine = false; Lines.deselectAll(); app.redraw();}
    },
    divide: {
        value: 2,
        mousedown: function () {
            var line = app.getLine({ filter: { layer: layers.getActive().id } });
            if (!line) { return; }
            Lines.divide(line, edit.divide.value);
            undo.save();
            app.redraw();
        },
        setting: function () {
            var A = new Alert({
                title: "Divide Setting",
                buttons: [{
                    title: "OK"
                }],
                template: [{
                    title: "Divide By",
                    value: edit.divide.value,
                    start: 2,
                    step: 1,
                    end: 50,
                    onchange: edit.divide.setValue
                }]
            });
        },
        setValue: function (value) {
            edit.divide.value = value;
        },
    },
    extendLine: {
        side: null,
        startOffset: null,
        step: 10,
        point: null,
        line: null,
        newLine: true,
        //line: null,
        mousedown: function (e) {
            Lines.deselectAll();
            var line = edit.extendLine.line = app.getLine({ filter: { layer: layers.getActive().id } });
            if (!line) { return; }
            Lines.select(line);
            var coords = app.canvas.getMousePosition();
            var Points = Lines.getPoints(line);
            var startDistance = Lines.getLength({ start: coords, end: Points.start });
            var endDistance = Lines.getLength({ start: coords, end: Points.end });
            var side = startDistance < endDistance ? "start" : "end";
            var otherSide = startDistance < endDistance ? "end" : "start";
            var x1 = line[otherSide].x, y1 = line[otherSide].y;
            var point = edit.extendLine.point = Points[side];
            this.startOffset = {
                x: coords.x,
                y: coords.y,
                x1: x1,
                y1: y1,
                dip: Lines.getDip(line),
                pointCoords: { x: point.x, y: point.y }
            };
            app.eventHandler("window", "mousemove", edit.extendLine.windowMouseMove);
            app.eventHandler("window", "mouseup", edit.extendLine.windowMouseUp);
            app.redraw();
        },
        windowMouseMove: function (e) {
            var so = edit.extendLine.startOffset,
            dip = so.dip,
            step = edit.extendLine.step,
            point = edit.extendLine.point,
            line = edit.extendLine.line,
            newLine = edit.extendLine.newLine,
            x1 = (newLine) ? point.x : so.x1,
            y1 = (newLine) ? point.y : so.y1;
            if (newLine) { app.redraw(); }
            var coords = app.canvas.getMousePosition();
            if (dip === "infinity") {
                var y2 = coords.y;
                var x2 = line.start.x;
            }
            else if (dip === 0) {
                var y2 = line.start.y;
                var x2 = coords.x;
            }
            else if (Math.abs(so.dip) <= 1) {
                var x2 = coords.x;
                var y2 = Lines.getYByX(line, x2, so.dip);
                console.log(y2);
            }
            else {
                var y2 = coords.y;
                var x2 = Lines.getXByY(line, y2, so.dip);
            }
            var extendLine = { start: { x: x1, y: y1 }, end: { x: x2, y: y2 } };
            extendLine = Lines.getStepedLine({ line: extendLine, side: "end", step: step, dip: dip });
            if (newLine) {
                edit.extendLine.line = extendLine;
                app.drawLine({start:extendLine.start,end:extendLine.end,color: "yellow",showDimention: true,lineDash: [4, 4]});
            }
            else {
                Points.moveTo(point, extendLine.end.x, extendLine.end.y);
                app.redraw();
            }
        },
        windowMouseUp: function () {
            app.eventRemover("window", "mousemove", edit.extendLine.windowMouseMove);
            app.eventRemover("window", "mouseup", edit.extendLine.windowMouseUp);
            Lines.deselectAll();
            if (edit.extendLine.newLine) {
                var eline = edit.extendLine.line;
                if (eline !== null && Lines.getLength(eline) >= 5) {
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
            }
            edit.extendLine.reset();
            //undo.save();
        },
        reset: function () {
            edit.extendLine.line = null;
            app.redraw();
        },
        setting: function () {
            var A = new Alert({
                title: "Extend Line Setting",
                buttons: [{
                    title: "OK"
                }],
                template: [
                    { title: "New Line", type: "switch", value: edit.extendLine.newLine, text: ["ON", "OFF"], onchange: edit.extendLine.setNewLine, },
                    {
                        title: "Step",
                        value: edit.extendLine.step,
                        start: 0,
                        step: 1,
                        min: 1,
                        end: 100,
                        onchange: edit.extendLine.setStep
                    }
                ]
            });
        },
        setStep: function (value) {
            edit.extendLine.step = value;
        },
        setNewLine: function (value) {
            edit.extendLine.newLine = value;
        }
    },
    offsetLine: {
        startOffset: null,
        step: 10,
        offset: null,
        offsetedLine: null,
        mousedown: function (e) {
            Lines.deselectAll();
            var line = app.getLine({ filter: { layer: layers.getActive().id } });
            if (!line) { return; }
            Lines.select(line);
            var coords = app.canvas.getMousePosition();
            var Points = Lines.getPoints(line);
            this.startOffset = {
                x: canvas.x,
                y: canvas.y,
                line: line,
                dip: Lines.getDip(line),
                step: edit.offsetLine.step,
                radian: Lines.getRadian(line),
            };
            app.eventHandler("window", "mousemove", edit.offsetLine.windowMouseMove);
            app.eventHandler("window", "mouseup", edit.offsetLine.windowMouseUp);
            app.redraw();
        },
        windowMouseMove: function (e) {
            var so = edit.offsetLine.startOffset;
            var line = so.line;
            edit.offsetLine.offset = canvas.x - so.x;
            edit.offsetLine.offset = Math.round(edit.offsetLine.offset / so.step) * so.step;
            edit.offsetLine.offsetedLine = edit.offsetLine.getOffsetedLine();
            var ol = edit.offsetLine.offsetedLine;
            app.redraw();
            app.drawLine({start:ol.start,end:ol.end,color: "yellow",showDimention: true});
            app.drawLine({start: { x: ol.start.x, y: ol.start.y }, end: { x: line.start.x, y: line.start.y },color: "yellow",lineDash: [4, 4],showDimention: true});},
        getOffsetedLine: function () {
            var so = edit.offsetLine.startOffset;
            var offset = edit.offsetLine.offset;
            var line = so.line;
            var radian = so.radian;
            var deltaX = offset * Math.cos((90 - radian) * Math.PI / 180);
            var deltaY = offset * Math.sin((90 - radian) * Math.PI / 180);
            var offsetedLine = {
                start: {
                    x: line.start.x + deltaX,
                    y: line.start.y + deltaY
                },
                end: {
                    x: line.end.x + deltaX,
                    y: line.end.y + deltaY
                }
            };
            return offsetedLine;
        },
        windowMouseUp: function () {
            Lines.deselectAll();
            if (edit.offsetLine.offset !== 0) {
                var ol = edit.offsetLine.offsetedLine;
                var point1 = Points.add({
                    x: ol.start.x,
                    y: ol.start.y,
                    connectedLines: [{
                        id: Lines.getNextID(1),
                        side: "start"
                    }]
                });
                var point2 = Points.add({
                    x: ol.end.x,
                    y: ol.end.y,
                    connectedLines: [{
                        id: Lines.getNextID(1),
                        side: "end"
                    }]
                });
                var line = Lines.add({
                    start: {
                        x: ol.start.x,
                        y: ol.start.y,
                        id: point1.id
                    },
                    end: {
                        x: ol.end.x,
                        y: ol.end.y,
                        id: point2.id
                    }
                });
                //undo.save();
            }
            app.eventRemover("window", "mousemove", edit.offsetLine.windowMouseMove);
            app.eventRemover("window", "mouseup", edit.offsetLine.windowMouseUp);
            app.redraw();
        },
        setting: function () {
            var A = new Alert({
                title: "Offset Line Setting",
                buttons: [{
                    title: "OK"
                }],
                template: [{
                    title: "Step",
                    value: edit.offsetLine.step,
                    start: 0,
                    step: 1,
                    min: 1,
                    end: 100,
                    onchange: edit.offsetLine.setStep
                }]
            });
        },
        setStep: function (value) {
            edit.offsetLine.step = value;
        }
    },
    alignPoint: {
        firstPoint: false,
        secoundPoint: false,
        mode: "xy",

        mousedown: function () {
            var point = app.getPoint();
            if (!point) {
                edit.alignPoint.reset();
                app.redraw();
                return;
            }
            if (!edit.alignPoint.firstPoint) {
                edit.alignPoint.firstPoint = point;
                edit.drawPoint(point.x, point.y);
                return;

            }
            if (point.id === edit.alignPoint.firstPoint.id) {
                edit.alignPoint.reset();
                return;
            }
            edit.alignPoint.secoundPoint = point;
            if (edit.alignPoint.mode === "x") {
                var value = "X";
            } else if (edit.alignPoint.mode === "y") {
                var value = "Y";
            } else if (edit.alignPoint.mode === "xy") {
                var value = "XY";
            }
            var A = new Alert({
                title: "Align By",
                buttons: [
                    { title: "Align X,Y", subscribe: edit.alignPoint.alignXY },
                    { title: "Align Y", subscribe: edit.alignPoint.alignY },
                    { title: "Align X", subscribe: edit.alignPoint.alignX },
                ],
                template: "Select Align Type.",
            });
        },
        alignX: function () {
            edit.alignPoint.align("X");
        },
        alignY: function () {
            edit.alignPoint.align("Y");
        },
        alignXY: function () {
            edit.alignPoint.align("XY");
        },
        align: function (mode) {
            var x = edit.alignPoint.secoundPoint.x;
            var y = edit.alignPoint.secoundPoint.y;
            if (mode === "X") { y = edit.alignPoint.firstPoint.y; }
            else if (mode === "Y") { x = edit.alignPoint.firstPoint.x; }
            Points.moveTo(edit.alignPoint.firstPoint, x, y);
            edit.alignPoint.reset();
            //undo.save();
        },
        mousemove: function () { },
        mouseup: function () { },
        reset: function () {
            edit.alignPoint.firstPoint = false;
            app.redraw();
        }
    },
    modify: {
        isTransformed: false,
        selectMode: "Point",
        axisPos: null,
        type: "none",
        rotateNumber: 0,
        copyMode: true,
        startOffset: null,
        clickedOn: "none",
        points: [],
        pointsState: [],
        linesState: [],
        mousePosition: null,
        lines: [],
        copyModel: [],
        autoWeld: true,
        selectAll: function () {
            Lines.deselectAll();
            Points.deselectAll();
            var layer = layers.getActive();
            if (edit.modify.selectMode === "point") {
                for (var i = 0; i < app.state.points.length; i++) {
                    var point = app.state.points[i];
                    if (layer.id === point.layer) {
                        Points.select(point);
                    }
                }
            }
            else {
                for (var i = 0; i < app.state.lines.length; i++) {
                    var line = app.state.lines[i];
                    if (layer.id === line.layer) {
                        Lines.select(line);
                    }
                }
            }
            app.redraw();
        },
        remove: function () {
            if (edit.modify.selectMode === "point") {
                for (var i = 0; i < Points.selected.length; i++) {
                    var point = Points.selected[i];
                    Points.remove(point, true);
                }
                Points.deselectAll();
            }
            else {
                for (var i = 0; i < Lines.selected.length; i++) {
                    var line = Lines.selected[i];
                    Lines.remove(line, true);
                }
                Lines.deselectAll();
            }
            edit.modify.setAxisPos("hide");
            //undo.save();
            app.redraw();
        },
        mirrorX: function () {edit.modify.mirror("x");},
        mirrorY: function () {edit.modify.mirror("y");},
        mirror: function (axis) {
            var center = edit.modify.axisPos;
            if (edit.modify.selectMode === "point") {
                if (Points.selected.length < 2) { return; }
                for (var i = 0; i < Points.selected.length; i++) {
                    var point = Points.selected[i];
                    var distance = center[axis] - point[axis];
                    var pos = { x: point.x, y: point.y };
                    pos[axis] += 2 * distance;
                    Points.moveTo(point, pos.x, pos.y);
                }
            }
            else {
                if (Lines.selected.length === 0) { return; }
                var selected = Lines.getPointsOfSelected();
                for (var i = 0; i < selected.length; i++) {
                    var point = selected[i];
                    var distance = center[axis] - point[axis];
                    var pos = { x: point.x, y: point.y };
                    pos[axis] += 2 * distance;
                    Points.moveTo(point, pos.x, pos.y);
                }
            }
            app.redraw();
            //undo.save();
        },
        moveToNewLayer: function () {
            if (this.selectMode !== "spline") { return; }
            if (Lines.selected.length === 0) { return; }
            var A = new Alert({
                buttons: [
                { title: "yes", subscribe: edit.modify.exportToNewLayer },
                { title: "cansel" }
                ],
                template: "Do You Want To Export Selected Lines To New Layer?",
                title: "New Layer."
            });
        },
        weldPoint: function () {
            for (var i = 0; i < Points.selected.length; i++) {
                var selected1 = Points.selected[i];
                for (var j = 0; j < Points.selected.length; j++) {
                    if (i === j) { continue; }
                    var selected2 = Points.selected[j];
                    var point = Points.merge(selected1, selected2);
                    if (point === false) { continue; }
                    if (point.connectedLines.length === 0) {
                        Points.remove(point);
                    }
                    else {
                        Points.select(point);
                    }
                    Points.updateSelected();
                    edit.modify.weldPoint();
                    return;
                }
            }
            Points.deselectAll();
            edit.modify.setAxisPos("hide");
            app.redraw();
            //undo.save();
        },
        breakPoint: function () {
            while (Points.selected.length > 0) {
                var selected = Points.selected[0];
                if (selected.connectedLines.length < 2) { return; }
                for (var i = 0; i < selected.connectedLines.length; i++) {
                    var point = Points.add({ x: selected.x, y: selected.y });
                    var cl = selected.connectedLines[i];
                    var line = Lines.getObjectByID(cl.id);
                    line[cl.side].id = point.id;
                    point.connectedLines.push({ id: cl.id, side: cl.side });
                }
                app.state.points.splice(Points.getIndexByID(selected.id), 1);
                Points.updateSelected();
            }
            edit.modify.setAxisPos("hide");
            app.redraw();
            //undo.save();
        },
        updateModel: function () {
            if (edit.modify.selectMode === "point") {
                this.points = Points.selected;
            } else {
                this.points = Lines.getPointsOfSelected();

            }
            this.pointsState = [];
            var axisPos = edit.modify.axisPos;
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
        reset: function () {
            edit.modify.setAxisPos("hide");
        },
        setAxisPos: function (obj) {
            if (obj === "hide") { $("#axis").hide(); return; }
            $("#axis").show();
            var x, y;
            if (obj === "center") {
                if (this.selectMode === "point") { var center = Points.getCenterOfSelected(); }
                else { var center = Lines.getCenterOfSelected(); }
                x = center.x; y = center.y;
            }
            else { x = obj.x; y = obj.y; }
            this.axisPos = { x: x, y: y };
            var bodyCoords = canvas.convertCanvasXYToBodyXY(this.axisPos);
            $("#axis").css({ "left": bodyCoords.x, "top": bodyCoords.y });
            $("#axis-x").html("X:" + this.axisPos.x.toFixed(1));
            $("#axis-y").html("Y:" + (this.axisPos.y * -1).toFixed(1));
        },
        mousedown: function () {
            var coords = app.canvas.getMousePosition();
            edit.selectRect = { start: coords, end: coords };
            this.clickedOn = "canvas";
        },
        windowMouseMove: {
            move: function (e) {
                var mode = edit.modify.clickedOn,
                    so = edit.modify.startOffset;
                var offset = canvas.getSnapXY({ x: (app.getClient(e, "X") - so.x) / app.canvas.getZoom(), y: (app.getClient(e, "Y") - so.y) / app.canvas.getZoom() });
                offset = {
                    x: (mode === "axisMoveUp" || mode === "axisMoveDown") ? 0 : offset.x,
                    y: (mode === "axisMoveLeft" || mode === "axisMoveRight") ? 0 : offset.y
                };
                console.log(offset);
                edit.modify.move(offset);
            },
            rotate: function (e) { edit.modify.rotate(Math.floor((app.getClient(e, "X") - edit.modify.startOffset.x) / 3)); },
            background: function (e) {
                var so = edit.modify.startOffset;
                var offset = canvas.getSnapXY({ x: (app.getClient(e, "X") - so.x) / app.canvas.getZoom(), y: (app.getClient(e, "Y") - so.y) / app.canvas.getZoom() });
                edit.modify.setAxisPos({
                    x: so.axisX + offset.x,
                    y: so.axisY + offset.y
                });
            }
        },
        windowMouseUp: {
            move: function () {
                if (edit.modify.copyMode && edit.modify.selectMode !== "point") {
                    lines.deselectAll();
                    for (var i = 0; i < edit.modify.lines.length; i++) {
                        var line = edit.modify.lines[i];
                        var addedLine = lines.add({
                            start: { x: line.start.x, y: line.start.y, id: points.getNextID(1) },
                            end: { x: line.end.x, y: line.end.y, id: points.getNextID(2) }
                        });
                        var addedPoint1 = points.add({
                            x: line.start.x,
                            y: line.start.y,
                            connectedLines: [{ side: "start", id: addedLine.id }]
                        });
                        var addedPoint2 = points.add({
                            x: line.end.x,
                            y: line.end.y,
                            connectedLines: [{ side: "end", id: addedLine.id }]
                        });
                        lines.select(addedLine);
                    }
                    
                    
                }
                else {
                    if (points.selected.length === 1 && edit.modify.autoWeld) {
                        var point = app.getPoint({ coords: points.selected[0], except: { id: points.selected[0].id } });
                        if (point !== false) {
                            points.moveTo(points.selected[0], point.x, point.y);
                            points.merge(point, points.selected[0]);
                            points.updateSelected();
                            points.deselectAll();
                            edit.modify.setAxisPos("hide");
                        }
                    }
                }
                app.redraw();
                app.eventRemover("window", "mousemove", edit.modify.windowMouseMove.move);
                app.eventRemover("window", "mouseup", edit.modify.windowMouseUp.move);

                if (edit.modify.isTransformed) {
                    edit.modify.isTransformed = false;
                    //undo.save();
                }
            },
            rotate: function () {
                if (edit.modify.copyMode && edit.modify.selectMode !== "point") {
                    Lines.deselectAll();
                    for (var i = 0; i < edit.modify.lines.length; i++) {
                        var line = edit.modify.lines[i];
                        var addedLine = Lines.add({
                            start: { x: line.start.x, y: line.start.y, id: Points.getNextID(1) },
                            end: { x: line.end.x, y: line.end.y, id: Points.getNextID(2) }
                        });
                        var addedPoint1 = Points.add({ x: line.start.x, y: line.start.y, connectedLines: [{ side: "start", id: addedLine.id }] });
                        var addedPoint2 = Points.add({ x: line.end.x, y: line.end.y, connectedLines: [{ side: "end", id: addedLine.id }] });
                        Lines.select(addedLine);
                    }
                    app.redraw();
                }
                $("#axis-angle").html(0);
                app.eventRemover("window", "mousemove", edit.modify.windowMouseMove.rotate);
                app.eventRemover("window", "mouseup", edit.modify.windowMouseUp.rotate);
                if (edit.modify.isTransformed) {
                    edit.modify.isTransformed = false;
                    //undo.save();
                }
            },
            background: function () {
                var axisPos = edit.modify.axisPos;
                var point = app.getPoint({ coords: axisPos });
                if (point) {
                    edit.modify.setAxisPos(point);
                }
                app.eventRemover("window", "mousemove", edit.modify.windowMouseMove.background);
                app.eventRemover("window", "mouseup", edit.modify.windowMouseUp.background);
            }
        },
        mousemove: function () {
            app.redraw();
            edit.drawSelectRect();
        },
        mouseup: function (e) {
            if (Math.abs(edit.selectRect.start.x - edit.selectRect.end.x) >= 3 &&
                Math.abs(edit.selectRect.start.y - edit.selectRect.end.y) >= 3) {
                edit.selectBySelectRect(edit.modify.selectMode);
                if (edit.modify.selectMode === "point") {
                    if (Points.selected.length === 0) { app.redraw(); return; }
                    edit.modify.setAxisPos(Points.getCenterOfSelected());
                } else {
                    if (Lines.selected.length === 0) { app.redraw(); return; }
                    edit.modify.setAxisPos(Lines.getCenterOfSelected());
                }
            } else {
                if (edit.modify.selectMode === "point") {
                    var point = app.getPoint();
                    if (point) {
                        Points.select(point);
                        edit.modify.setAxisPos(point);
                    } else {
                        Points.deselectAll();
                        edit.modify.setAxisPos("hide");
                    }
                } else if (edit.modify.selectMode === "line") {
                    var line = app.getLine();
                    if (line) {
                        Lines.select(line);
                        var center = Lines.getCenter(line);
                        edit.modify.setAxisPos(center);
                    } else {
                        Lines.deselectAll();
                        edit.modify.setAxisPos("hide");
                    }
                } else if (edit.modify.selectMode === "spline") {
                    var line = app.getLine();
                    if (line) {
                        Lines.selectSpline(line);
                        var center = Lines.getCenter(line);
                        edit.modify.setAxisPos(center);
                    } else {
                        Lines.deselectAll();
                        edit.modify.setAxisPos("hide");
                    }
                }
            }
            app.redraw();
        },
        buttonmousedown: function (e) {
            var button = $(e.currentTarget).parent();
            var mode = button.attr("id");
            edit.modify.updateModel();
            edit.modify.startOffset = {
                x: app.getClient(e, "X"),
                y: app.getClient(e, "Y"),
                axisX: edit.modify.axisPos.x,
                axisY: edit.modify.axisPos.y
            };
            edit.modify.clickedOn = mode;
            if (["axisMove", "axisMoveUp", "axisMoveDown", "axisMoveLeft", "axisMoveRight"].indexOf(mode) !== -1) {
                app.eventHandler("window", "mousemove", edit.modify.windowMouseMove.move);
                app.eventHandler("window", "mouseup", edit.modify.windowMouseUp.move);
            }
            else if (mode === "axis") {
                app.eventHandler("window", "mousemove", edit.modify.windowMouseMove.background);
                app.eventHandler("window", "mouseup", edit.modify.windowMouseUp.background);
            }
            else if (mode === "axisRotate") {
                app.eventHandler("window", "mousemove", edit.modify.windowMouseMove.rotate);
                app.eventHandler("window", "mouseup", edit.modify.windowMouseUp.rotate);
            } else if (mode === "axisCenter") {
                edit.modify.setAxisPos("center");
            } else if (mode === "axisKeyboard") {
                keyboard.open({
                    fields: [{ title: "X", prop: "x" }, { title: "Y", prop: "y" }, { title: "Angle", prop: "angle" }],
                    subscribe: edit.modify.transformTo,
                    float: false,
                    negative: true,
                    title: "Transform To:"
                });
            }

        },
        exportToNewLayer: function () {
            var id = layers.getId();
            for (var i = 0 ; i < Lines.selected.length; i++) {
                var line = Lines.selected[i];
                line.layer = id;
                line.color = "#fff";
                var sidePoints = Lines.getPoints(line);
                sidePoints.start.layer = id;
                sidePoints.start.color = "#fff";
                sidePoints.end.layer = id;
                sidePoints.end.color = "#fff";

            }
            layers.add();
        },
        move: function (offset) {
            if (offset.x === 0 && offset.y === 0) { return; }
            var so = edit.modify.startOffset;
            edit.modify.setAxisPos({ x: so.axisX + offset.x, y: so.axisY + offset.y }); // Move Axis
            if (this.copyMode && edit.modify.selectMode !== "point") {
                app.redraw();
                this.lines = [];
                var length = edit.modify.linesState.length;
                for (var k = 0; k < length; k++) {
                    var lineState = edit.modify.linesState[k];
                    var movedStart = { x: lineState.start.x + offset.x, y: lineState.start.y + offset.y };
                    var movedEnd = { x: lineState.end.x + offset.x, y: lineState.end.y + offset.y };
                    this.lines.push({ start: movedStart, end: movedEnd });
                    app.drawLine({start:movedStart,end:movedEnd,color: "yellow",showDimention: true});
                }
            } else {
                var length = edit.modify.points.length;
                for (var k = 0; k < length; k++) {
                    var point = edit.modify.points[k];
                    Points.moveTo(point, edit.modify.pointsState[k].x + offset.x, edit.modify.pointsState[k].y + offset.y);
                }
                app.redraw();
            }
            edit.modify.isTransformed = true;
        },
        rotate: function (offset) {
            $("#axis-angle").html(((offset) % 360) + "&deg;");
            if (this.copyMode && edit.modify.selectMode !== "point") {
                app.redraw();
                this.lines = [];
                var length = edit.modify.linesState.length;
                for (var k = 0; k < length; k++) {
                    var lineState = edit.modify.linesState[k];
                    var axisPos = edit.modify.axisPos;
                    var rotatedStart = Points.getCoordsByRotate({ x: lineState.start.x, y: lineState.start.y }, offset + lineState.start.radian, axisPos);
                    var rotatedEnd = Points.getCoordsByRotate({ x: lineState.end.x, y: lineState.end.y }, offset + lineState.end.radian, axisPos);
                    this.lines.push({ start: rotatedStart, end: rotatedEnd });
                    app.drawLine({start:rotatedStart,end:rotatedEnd,color: "yellow",showDimention: true});
                }
            } else {
                var length = edit.modify.points.length;
                for (var k = 0; k < length; k++) {
                    var point = edit.modify.points[k];
                    var pointsState = edit.modify.pointsState[k];
                    var axisPos = edit.modify.axisPos;
                    Points.rotateTo(point, pointsState.radian + offset, axisPos);
                }
                app.redraw();
            }
            this.isTransformed = true;
        },
        transformTo: function (obj) {
            edit.modify.startOffset = {
                axisX: edit.modify.axisPos.x,
                axisY: edit.modify.axisPos.y,
            };
            edit.modify.move({x: obj.x,y: obj.y});
            edit.modify.updateModel();
            edit.modify.rotate(obj.angle);
            edit.modify.updateModel();
            //undo.save();
        },
        setting: function () {
            var A = new Alert({
                title: "Modify Options",
                buttons: [{
                    title: "OK"
                }],
                template: [
                    {
                        title: "Selection",
                        value: edit.modify.selectMode,
                        buttons: [
                            {
                                active: (edit.modify.selectMode === "point"),
                                iconClass: "icon icon-vertex",
                                value: "Point",
                                id: "select-mode-point",
                                subscribe: edit.modify.setSelectMode
                            },
                            {
                                active: (edit.modify.selectMode === "line"),
                                iconClass: "icon icon-dl",
                                value: "Line",
                                id: "select-mode-line",
                                subscribe: edit.modify.setSelectMode
                            },
                            {
                                active: (edit.modify.selectMode === "spline"),
                                iconClass: "icon icon-spline",
                                value: "Spline",
                                id: "select-mode-spline",
                                subscribe: edit.modify.setSelectMode
                            },
                        ],
                    },
                    {
                        onchange: edit.modify.setAutoWeld,
                        text: ["ON", "OFF"],
                        value: edit.modify.autoWeld,
                        title: "Auto Weld",
                    },

                ]
            });
        },

        setAutoWeld: function (value) {
            edit.modify.autoWeld = value;
        },
        setSelectMode: function (id) {
            Points.deselectAll();
            Lines.deselectAll();
            edit.modify.setAxisPos("hide");
            app.redraw();
            if (id === "select-mode-point") {
                edit.modify.selectMode = "point";
            } else if (id === "select-mode-line") {
                edit.modify.selectMode = "line";
            } else if (id === "select-mode-spline") {
                edit.modify.selectMode = "spline";
            }
            edit.modify.openToolbar();
        }
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
            var point = app.getPoint();
            if (!point) {
                Points.deselectAll();
                edit.selectRect = {
                    start: coords,
                    end: coords
                };
                edit.chamfer.clickMode = "canvas";
            }
            else {
                Points.select(point);
                edit.chamfer.getParameters();
                edit.chamfer.clickMode = "point";
            }
        },
        getParameters: function () {
            edit.chamfer.startOffset = app.canvas.getMousePosition().x;
            edit.chamfer.model = [];
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
            if (edit.chamfer.clickMode === "point") { edit.chamfer.doChamfer(); }
            else { edit.drawSelectRect(); }
        },
        mouseup: function () {
            if (edit.chamfer.clickMode === "canvas") {


                if (Math.abs(edit.selectRect.start.x - edit.selectRect.end.x) >= 3 &&
                    Math.abs(edit.selectRect.start.y - edit.selectRect.end.y) >= 3) {
                    edit.selectBySelectRect("point");
                }
            }
            else {
                edit.chamfer.save();
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
            //undo.save();
            app.redraw();
        },
        doChamfer: function () {
            var coords = app.canvas.getMousePosition()
            var offset = Math.abs(edit.chamfer.startOffset - coords.x);
            this.offset = offset;
            this.undoChanges();
            var length = this.model.length;
            for (var i = 0; i < length; i++) {
                var model = this.model[i];
                var line1 = model.line1;
                var side1 = model.side1
                var length1 = Lines.getLength(line1);
                var line2 = model.line2;
                var side2 = model.side2
                var length2 = Lines.getLength(line2);
                if (length1 == 0 || length2 == 0) { this.offset = 0; return; }
                line1[side1].x = Math.abs(line1.start.x - line1.end.x) * offset / length1 * model.sx1 + model.line1Coords[side1].x;
                line2[side2].x = Math.abs(line2.start.x - line2.end.x) * offset / length2 * model.sx2 + model.line2Coords[side2].x;
                line1[side1].y = Math.abs(line1.start.y - line1.end.y) * offset / length1 * model.sy1 + model.line1Coords[side1].y;
                line2[side2].y = Math.abs(line2.start.y - line2.end.y) * offset / length2 * model.sy2 + model.line2Coords[side2].y;
                app.drawLine({start: line1[side1],end: line2[side2],color: "yellow",showDimention: true,lineDash: [4, 4]});
            }
        },
        reset: function () { this.model = []; this.offset = 0; Points.deselectAll(); }
    },
    plumbLine: {
        line: null,
        plumb: null,
        points: null,
        point: null,
        side: null,
        bond: false,
        autoWeld: true,
        snapArea: 10,
        step: 10,
        mousedown: function (e) {
            Lines.deselectAll();
            var line = app.getLine({ filter: { layer: layers.getActive().id } });
            if (!line) { return; }
            Lines.select(line);
            edit.plumbLine.line = line;
            edit.plumbLine.points = Lines.getPoints(line);
            app.eventHandler("window", "mousemove", edit.plumbLine.windowMouseMove);
            app.eventHandler("window", "mouseup", edit.plumbLine.windowMouseUp);
            app.redraw();
        },
        windowMouseMove: function (e) {
            var line = edit.plumbLine.line;
            var coords = app.canvas.getMousePosition();
            edit.plumbLine.plumb = Lines.getPrependicularLine(line, coords);
            var plumb = edit.plumbLine.plumb;
            var point = plumb.start;
            var points = edit.plumbLine.points;
            var distance = {
                start: Lines.getLength({ start: point, end: points.start }),
                end: Lines.getLength({ start: point, end: points.end })
            }
            if (distance.start <= distance.end) { var side = edit.plumbLine.side = "start"; } else { var side = edit.plumbLine.side = "end"; }
            if (distance[side] < edit.plumbLine.snapArea) {
                var deltaX = points[side].x - point.x, deltaY = points[side].y - point.y;
                edit.plumbLine.bond = true;
            }
            else { var deltaX = 0, deltaY = 0; edit.plumbLine.bond = false; }


            edit.plumbLine.plumb = {
                start: { x: plumb.start.x + deltaX, y: plumb.start.y + deltaY },
                end: { x: plumb.end.x + deltaX, y: plumb.end.y + deltaY }
            };
            edit.plumbLine.plumb = Lines.getStepedLine({ line: edit.plumbLine.plumb, side: "end", step: edit.plumbLine.step });
            app.redraw();
            app.drawLine({start: edit.plumbLine.plumb.start,end: edit.plumbLine.plumb.end,color: "yellow",showDimention: true,lineDash: [4, 4]});
        },

        windowMouseUp: function () {
            Lines.deselectAll();
            if (Lines.getLength(edit.plumbLine.plumb) > 5) {
                var pl = edit.plumbLine.plumb;
                var point1 = Points.add({
                    x: pl.start.x,
                    y: pl.start.y,
                    connectedLines: [{
                        id: Lines.getNextID(1),
                        side: "start"
                    }]
                });
                var point2 = Points.add({
                    x: pl.end.x,
                    y: pl.end.y,
                    connectedLines: [{
                        id: Lines.getNextID(1),
                        side: "end"
                    }]
                });
                var line = Lines.add({
                    start: {
                        x: pl.start.x,
                        y: pl.start.y,
                        id: point1.id
                    },
                    end: {
                        x: pl.end.x,
                        y: pl.end.y,
                        id: point2.id
                    }
                });
                //undo.save();
                var sidePoint = edit.plumbLine.points[edit.plumbLine.side];
                if (edit.plumbLine.bond && sidePoint.connectedLines.length < 2 && edit.plumbLine.autoWeld) {
                    console.log("merge");
                    Points.merge(sidePoint, point1);
                    //undo.save();
                }

            }
            app.eventRemover("window", "mousemove", edit.plumbLine.windowMouseMove);
            app.eventRemover("window", "mouseup", edit.plumbLine.windowMouseUp);
            app.redraw();
        },
        setting: function () {
            var A = new Alert({
                title: "Offset Line Setting",
                buttons: [{
                    title: "OK"
                }],
                template: [
                    {
                        onchange: edit.plumbLine.setAutoWeld,
                        text: ["ON", "OFF"],
                        value: edit.plumbLine.autoWeld,
                        title: "Auto Weld",
                    },
                    {
                        title: "Snap Area",
                        value: edit.plumbLine.snapArea,
                        start: 0,
                        step: 1,
                        min: 1,
                        end: 100,
                        onchange: edit.plumbLine.setSnapArea
                    },
                    {
                        title: "Step",
                        value: edit.plumbLine.step,
                        start: 0,
                        step: 1,
                        min: 1,
                        end: 100,
                        onchange: edit.plumbLine.setStep
                    }
                ]
            });
        },
        setAutoWeld: function (value) {
            edit.plumbLine.autoWeld = value;
        },
        setSnap: function (value) {
            edit.plumbLine.snap = value;
        },
        setSnapArea: function (value) {
            edit.plumbLine.snapArea = value;
        },
        setStep: function (value) {
            edit.plumbLine.step = value;
        },

    },
    addPoint: {
        line: null,
        point: null,
        startPoint: null,
        endPoint: null,
        min: 5,
        mousedown: function () {
            var ap = edit.addPoint;
            var coords = app.canvas.getMousePosition();
            var line = ap.line = app.getLine(
                {
                    coords: coords,
                    //filter: { layer: layers.getActive().id } }
                }
            );
            if (!line) { return; }
            var length = Lines.getLength(line) / 2;
            if (ap.min > Math.floor(length)) { ap.min = Math.floor(length); }
            var delta = Lines.getDelta(line, ap.min);
            ap.maxX = app.getMax(ap.line.start.x, ap.line.end.x) - delta.x;
            ap.maxY = app.getMax(ap.line.start.y, ap.line.end.y) - delta.y;
            ap.minX = app.getMin(ap.line.start.x, ap.line.end.x) + delta.x;
            ap.minY = app.getMin(ap.line.start.y, ap.line.end.y) + delta.y;
            ap.point = Lines.getPrependicularPoint(line, coords);
            var sidePoints = Lines.getPoints(line);
            ap.startPoint = sidePoints.start;
            ap.endPoint = sidePoints.end;
            app.drawLine({start: ap.startPoint,end: ap.point,color: "yellow",lineDash: [4, 4],showDimention: true});
            app.drawLine({start: ap.endPoint,end: ap.point,color: "yellow",lineDash: [4, 4],showDimention: true});
            edit.drawPoint(ap.point.x, ap.point.y);
        },
        mousemove: function () {
            var ap = edit.addPoint;
            if (!ap.line) { return; }
            app.redraw();

            var coords = app.canvas.getMousePosition();
            ap.point = Lines.getPrependicularPoint(ap.line, coords);
            ap.point.x += ap.point.x > ap.maxX ? ap.maxX - ap.point.x : (ap.point.x < ap.minX ? ap.minX - ap.point.x : 0);
            ap.point.y += ap.point.y > ap.maxY ? ap.maxY - ap.point.y : (ap.point.y < ap.minY ? ap.minY - ap.point.y : 0);
            app.drawLine({start: ap.startPoint,end: ap.point,color: "yellow",lineDash: [4, 4],showDimention: true});
            app.drawLine({start: ap.endPoint,end: ap.point,color: "yellow",lineDash: [4, 4],showDimention: true});
            edit.drawPoint(ap.point.x, ap.point.y);
        },
        mouseup: function () {
            var ap = edit.addPoint;
            if (!ap.line) { return; }
            Lines.remove(ap.line);
            var addedPoint = Points.add({ x: ap.point.x, y: ap.point.y });
            Points.connect(ap.startPoint, addedPoint);
            Points.connect(addedPoint, ap.endPoint);
            //undo.save();
            app.redraw();
        },
        setting: function () {
            var A = new Alert({
                title: "Add Point Setting",
                buttons: [{
                    title: "OK"
                }],
                template: [{
                    title: "Min Distance",
                    value: edit.addPoint.min,
                    onchange: edit.addPoint.setMin
                }]
            });
        },
        setMin: function (min) {
            edit.addPoint.min = min;
        },
    },
}