var edit = {
    selectRect: {
        start: null,
        end: null
    },
    end: function () {
        points.deselectAll();
        lines.deselectAll();
        if (edit[app.editmode].reset !== undefined) { edit[app.editmode].reset(); }
        canvas.redraw();
    },
    mousedown: function () { this[app.editmode].mousedown(); },
    mousemove: function () {
        if (this[app.editmode].mousemove === undefined) { return; }
        this[app.editmode].mousemove();
    },
    mouseup: function () {
        if (this[app.editmode].mouseup === undefined) { return; }
        this[app.editmode].mouseup();
    },
    drawSelectRect: function () {
        edit.selectRect.end = canvas.getCanvasXY();
        var sr = edit.selectRect;
        var x = Math.min(sr.start.x, sr.end.x);
        var y = Math.min(sr.start.y, sr.end.y);
        var width = Math.abs(sr.start.x - sr.end.x);
        var height = Math.abs(sr.start.y - sr.end.y);
        canvas.drawRectangle({
            x: x,
            y: y,
            width: width,
            height: height,
            mode: "fill",
            color: "rgba(136,144,148,0.5)"
        });
    },
    selectBySelectRect: function (mode) {
        var sX = this.selectRect.start.x,
            sY = this.selectRect.start.y,
            eX = this.selectRect.end.x,
            eY = this.selectRect.end.y;
        if (sX > eX) {
            var help = sX;
            sX = eX;
            eX = help;
        }
        if (sY > eY) {
            var help = sY;
            sY = eY;
            eY = help;
        }
        var layer = layers.getActiveLayer();
        if (mode === "point") {
            var length = canvas.points.length;
            for (var i = 0; i < length; i++) {
                var point = canvas.points[i];
                if (point.layer !== layer.id) {
                    continue;
                }
                if (point.x <= eX && point.x >= sX && point.y <= eY && point.y >= sY) {
                    points.select(point);
                }
            }
        } else {
            var length = canvas.lines.length;
            for (var i = 0; i < length; i++) {
                var line = canvas.lines[i];
                if (line.layer !== layer.id) {
                    continue;
                }
                if (line.start.x >= sX && line.start.x <= eX && line.end.x >= sX && line.end.x <= eX &&
                    line.start.y >= sY && line.start.y <= eY && line.end.y >= sY && line.end.y <= eY) {
                    (mode === "line") ? lines.select(line) : lines.selectSpline(line);
                    continue;
                }
                var m = lines.getMeet(line, { start: { x: sX, y: sY }, end: { x: sX, y: eY } });
                if (m) {
                    if (m.y < eY && sY < m.y) {
                        if (m.x < Math.max(line.start.x, line.end.x) && m.x > Math.min(line.start.x,
                                line.end.x)) {
                            (mode === "line") ? lines.select(line) : lines.selectSpline(line);
                            continue;
                        }
                    }
                }
                m = lines.getMeet(line, { start: { x: sX, y: sY }, end: { x: eX, y: sY } });
                if (m) {
                    if (m.x < eX && sX < m.x) {
                        if (m.y < Math.max(line.start.y, line.end.y) && m.y > Math.min(line.start.y,
                                line.end.y)) {
                            (mode === "line") ? lines.select(line) : lines.selectSpline(line);
                            continue;
                        }
                    }
                }
                m = lines.getMeet(line, { start: { x: eX, y: sY }, end: { x: eX, y: eY } });
                if (m) {
                    if (m.y < eY && sY < m.y) {
                        if (m.x < Math.max(line.start.x, line.end.x) && m.x > Math.min(line.start.x,
                                line.end.x)) {
                            (mode === "line") ? lines.select(line) : lines.selectSpline(line);
                            continue;
                        }
                    }
                }
                m = lines.getMeet(line, { start: { x: sX, y: eY }, end: { x: eX, y: eY } });
                if (m != null) {
                    if (m.x < eX && sX < m.x) {
                        if (m.y < Math.max(line.start.y, line.end.y) && m.y > Math.min(line.start.y,
                                line.end.y)) {
                            (mode === "line") ? lines.select(line) : lines.selectSpline(line);
                            continue;
                        }
                    }
                }
            }
        }
    },
    drawPoint: function (x, y) {
        var size = 3 / canvas.zoom;
        canvas.drawArc({
            x: x,
            y: y,
            radius: size,
            color: "orange",
            mode: "fill"
        });
        canvas.drawArc({
            x: x,
            y: y,
            radius: size * 2,
            color: "orange",
            mode: "stroke",
            lineWith: 1
        });
    },
    connectpoints: {
        firstPoint: false,
        mousedown: function () {
            var point = canvas.findPointByCoords({ filter: { layer: layers.getActiveLayer().id } });
            if (!point) { edit.connectpoints.reset(); return; }
            if (!edit.connectpoints.firstPoint) {
                edit.connectpoints.firstPoint = point;
                edit.drawPoint(point.x, point.y);
                return;

            }
            if (point.id === edit.connectpoints.firstPoint.id) {
                edit.connectpoints.reset();
                return;
            }
            if (points.isConnect(point, edit.connectpoints.firstPoint)) {
                edit.connectpoints.reset();
                return;
            }
            points.connect(edit.connectpoints.firstPoint, point);
            edit.connectpoints.reset();
            undo.save();
            canvas.redraw();

        },
        reset: function () {
            edit.connectpoints.firstPoint = false;
            canvas.redraw();
        }
    },
    joinlines: {
        firstLine: false,
        mousedown: function () {
            var line = canvas.findLineByCoords({ filter: { layer: layers.getActiveLayer().id } });
            if (!line) { edit.joinlines.reset(); return; }
            if (!edit.joinlines.firstLine) {
                edit.joinlines.firstLine = line;
                lines.select(line);
                canvas.redraw();
                return;
            }
            if (edit.joinlines.firstLine.id === line.id) { return; }
            var state = lines.join(edit.joinlines.firstLine, line);
            edit.joinlines.reset();
            if (state) { undo.save(); }
            canvas.redraw();
        },
        mousemove: function () { },
        mouseup: function () { },
        reset: function () {
            edit.joinlines.firstLine = false;
            lines.deselectAll();
            canvas.redraw();
        }
    },
    divide: {
        value: 2,
        mousedown: function () {
            var line = canvas.findLineByCoords({ filter: { layer: layers.getActiveLayer().id } });
            if (!line) { return; }
            lines.divide(line, edit.divide.value);
            undo.save();
            canvas.redraw();
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
            lines.deselectAll();
            var line = edit.extendLine.line = canvas.findLineByCoords({ filter: { layer: layers.getActiveLayer().id } });
            if (!line) { return; }
            lines.select(line);
            var coords = canvas.getCanvasXY();
            var Points = lines.getPoints(line);
            var startDistance = lines.getLength({ start: coords, end: Points.start });
            var endDistance = lines.getLength({ start: coords, end: Points.end });
            var side = startDistance < endDistance ? "start" : "end";
            var otherSide = startDistance < endDistance ? "end" : "start";
            var x1 = line[otherSide].x, y1 = line[otherSide].y;
            var point = edit.extendLine.point = Points[side];
            this.startOffset = {
                x: coords.x,
                y: coords.y,
                x1: x1,
                y1: y1,
                dip: lines.getDip(line),
                pointCoords: { x: point.x, y: point.y }
            };
            app.eventHandler("window", "mousemove", edit.extendLine.windowMouseMove);
            app.eventHandler("window", "mouseup", edit.extendLine.windowMouseUp);
            canvas.redraw();
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
            if (newLine) { canvas.redraw(); }
            var coords = canvas.getCanvasXY();
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
                var y2 = lines.getYByX(line, x2, so.dip);
                console.log(y2);
            }
            else {
                var y2 = coords.y;
                var x2 = lines.getXByY(line, y2, so.dip);
            }
            var extendLine = { start: { x: x1, y: y1 }, end: { x: x2, y: y2 } };
            extendLine = lines.getStepedLine({ line: extendLine, side: "end", step: step, dip: dip });
            if (newLine) {
                edit.extendLine.line = extendLine;
                canvas.drawLine({
                    x1: extendLine.start.x,
                    y1: extendLine.start.y,
                    x2: extendLine.end.x,
                    y2: extendLine.end.y,
                    color: "yellow",
                    size: 1 / canvas.zoom,
                    showDimention: true,
                    lineDash: [4, 4]
                });
            }
            else {
                points.moveTo(point, extendLine.end.x, extendLine.end.y);
                canvas.redraw();
            }
        },
        windowMouseUp: function () {
            app.eventRemover("window", "mousemove", edit.extendLine.windowMouseMove);
            app.eventRemover("window", "mouseup", edit.extendLine.windowMouseUp);
            lines.deselectAll();
            if (edit.extendLine.newLine) {
                var eline = edit.extendLine.line;
                if (eline !== null && lines.getLength(eline) >= 5) {
                    var startPoint = points.add({
                        x: eline.start.x, y: eline.start.y,
                        connectedLines: [{ id: lines.getNextID(1), side: "start" }],
                    });
                    var endPoint = points.add({
                        x: eline.end.x, y: eline.end.y,
                        connectedLines: [{ id: lines.getNextID(1), side: "end" }],
                    });
                    var line = lines.add({
                        start: { x: startPoint.x, y: startPoint.y, id: startPoint.id },
                        end: { x: endPoint.x, y: endPoint.y, id: endPoint.id },
                    });
                }
            }
            edit.extendLine.reset();
            undo.save();
        },
        reset: function () {
            edit.extendLine.line = null;
            canvas.redraw();
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
            lines.deselectAll();
            var line = canvas.findLineByCoords({ filter: { layer: layers.getActiveLayer().id } });
            if (!line) { return; }
            lines.select(line);
            var coords = canvas.getCanvasXY();
            var Points = lines.getPoints(line);
            this.startOffset = {
                x: canvas.x,
                y: canvas.y,
                line: line,
                dip: lines.getDip(line),
                step: edit.offsetLine.step,
                radian: lines.getRadian(line),
            };
            app.eventHandler("window", "mousemove", edit.offsetLine.windowMouseMove);
            app.eventHandler("window", "mouseup", edit.offsetLine.windowMouseUp);
            canvas.redraw();
        },
        windowMouseMove: function (e) {
            var so = edit.offsetLine.startOffset;
            var line = so.line;
            edit.offsetLine.offset = canvas.x - so.x;
            edit.offsetLine.offset = Math.round(edit.offsetLine.offset / so.step) * so.step;
            edit.offsetLine.offsetedLine = edit.offsetLine.getOffsetedLine();
            var ol = edit.offsetLine.offsetedLine;
            canvas.redraw();
            canvas.drawLine({
                x1: ol.start.x,
                y1: ol.start.y,
                x2: ol.end.x,
                y2: ol.end.y,
                color: "yellow",
                showDimention: true,
                size: 1 / canvas.zoom,
            });
            canvas.drawLine({
                x1: ol.start.x,
                y1: ol.start.y,
                x2: line.start.x,
                y2: line.start.y,
                color: "yellow",
                lineDash: [4, 4],
                showDimention: true,
                size: 1 / canvas.zoom,
            });
        },
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
            lines.deselectAll();
            if (edit.offsetLine.offset !== 0) {
                var ol = edit.offsetLine.offsetedLine;
                var point1 = points.add({
                    x: ol.start.x,
                    y: ol.start.y,
                    connectedLines: [{
                        id: lines.getNextID(1),
                        side: "start"
                    }]
                });
                var point2 = points.add({
                    x: ol.end.x,
                    y: ol.end.y,
                    connectedLines: [{
                        id: lines.getNextID(1),
                        side: "end"
                    }]
                });
                var line = lines.add({
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
                undo.save();
            }
            app.eventRemover("window", "mousemove", edit.offsetLine.windowMouseMove);
            app.eventRemover("window", "mouseup", edit.offsetLine.windowMouseUp);
            canvas.redraw();
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
            var point = canvas.findPointByCoords();
            if (!point) {
                edit.alignPoint.reset();
                canvas.redraw();
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
            points.moveTo(edit.alignPoint.firstPoint, x, y);
            edit.alignPoint.reset();
            undo.save();
        },
        mousemove: function () { },
        mouseup: function () { },
        reset: function () {
            edit.alignPoint.firstPoint = false;
            canvas.redraw();
        }
    },
    modify: {
        isTransformed: false,
        selectMode: "point",
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
        modifyitems: {
            selectAll: { title: "Select All", id: "select-all", selectModes: ["point", "line", "spline"] },
            remove: { title: "Delete", id: "remove", selectModes: ["point", "line", "spline"] },
            mirrorX: { title: "Mirror X", id: "mirror-x", selectModes: ["point", "line", "spline"] },
            mirrorY: { title: "Mirror Y", id: "mirror-y", selectModes: ["point", "line", "spline"] },
            weldPoint: { title: "Weld", id: "weld", selectModes: ["point"] },
            breakPoint: { title: "Break", id: "break", selectModes: ["point"] },
            moveToNewLayer: { title: "Move To New Layer", id: "new-layer", selectModes: ["spline"] },
        },
        setToolbar: function () {
            if (app.appmode === "edit" && app.editmode === "modify") {
                edit.modify.openToolbar();
            }
            else {
                edit.modify.closeToolbar();
            }
        },
        openToolbar: function () {
            edit.modify.closeToolbar();
            var list = edit.modify.modifyitems;
            var str = '<div id="modify-tools">';
            for (var prop in list) {
                var item = list[prop];
                if (item.selectModes.indexOf(edit.modify.selectMode) === -1) { continue; }
                str += '<div id="' + prop + '" class="modify-button active">' + item.title + '</div>';
            }
            str += '</div>';
            $("body").append(str);
            app.eventHandler(".modify-button", "mousedown", function (e) {
                var element = $(e.currentTarget);
                element.addClass("clicked");
                edit.modify[element.attr("id")]();
            });
            app.eventHandler("window", "mouseup", function () { $(".modify-button").removeClass("clicked"); });
        },
        closeToolbar: function () {
            $("#modify-tools").remove();
        },
        selectAll: function () {
            lines.deselectAll();
            points.deselectAll();
            var layer = layers.getActiveLayer();
            if (edit.modify.selectMode === "point") {
                for (var i = 0; i < canvas.points.length; i++) {
                    var point = canvas.points[i];
                    if (layer.id === point.layer) {
                        points.select(point);
                    }
                }
            }
            else {
                for (var i = 0; i < canvas.lines.length; i++) {
                    var line = canvas.lines[i];
                    if (layer.id === line.layer) {
                        lines.select(line);
                    }
                }
            }
            canvas.redraw();
        },
        remove: function () {
            if (edit.modify.selectMode === "point") {
                for (var i = 0; i < points.selected.length; i++) {
                    var point = points.selected[i];
                    points.remove(point, true);
                }
                points.deselectAll();
            }
            else {
                for (var i = 0; i < lines.selected.length; i++) {
                    var line = lines.selected[i];
                    lines.remove(line, true);
                }
                lines.deselectAll();
            }
            edit.modify.setAxisPos("hide");
            undo.save();
            canvas.redraw();
        },
        mirrorX: function () {
            edit.modify.mirror("x");
        },
        mirrorY: function () {
            edit.modify.mirror("y");
        },
        mirror: function (axis) {
            var center = edit.modify.axisPos;
            if (edit.modify.selectMode === "point") {
                if (points.selected.length < 2) { return; }
                for (var i = 0; i < points.selected.length; i++) {
                    var point = points.selected[i];
                    var distance = center[axis] - point[axis];
                    var pos = { x: point.x, y: point.y };
                    pos[axis] += 2 * distance;
                    points.moveTo(point, pos.x, pos.y);
                }
            }
            else {
                if (lines.selected.length === 0) { return; }
                var selected = lines.getPointsOfSelected();
                for (var i = 0; i < selected.length; i++) {
                    var point = selected[i];
                    var distance = center[axis] - point[axis];
                    var pos = { x: point.x, y: point.y };
                    pos[axis] += 2 * distance;
                    points.moveTo(point, pos.x, pos.y);
                }
            }
            canvas.redraw();
            undo.save();
        },
        moveToNewLayer: function () {
            if (this.selectMode !== "spline") { return; }
            if (lines.selected.length === 0) { return; }
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
            for (var i = 0; i < points.selected.length; i++) {
                var selected1 = points.selected[i];
                for (var j = 0; j < points.selected.length; j++) {
                    if (i === j) { continue; }
                    var selected2 = points.selected[j];
                    var point = points.merge(selected1, selected2);
                    if (point === false) { continue; }
                    if (point.connectedLines.length === 0) {
                        points.remove(point);
                    }
                    else {
                        points.select(point);
                    }
                    points.updateSelected();
                    edit.modify.weldPoint();
                    return;
                }
            }
            points.deselectAll();
            edit.modify.setAxisPos("hide");
            canvas.redraw();
            undo.save();
        },
        breakPoint: function () {
            while (points.selected.length > 0) {
                var selected = points.selected[0];
                if (selected.connectedLines.length < 2) { return; }
                for (var i = 0; i < selected.connectedLines.length; i++) {
                    var point = points.add({ x: selected.x, y: selected.y });
                    var cl = selected.connectedLines[i];
                    var line = lines.getObjectByID(cl.id);
                    line[cl.side].id = point.id;
                    point.connectedLines.push({ id: cl.id, side: cl.side });
                }
                canvas.points.splice(points.getIndexByID(selected.id), 1);
                points.updateSelected();
            }
            edit.modify.setAxisPos("hide");
            canvas.redraw();
            undo.save();
        },
        updateModel: function () {
            if (edit.modify.selectMode === "point") {
                this.points = points.selected;
            } else {
                this.points = lines.getPointsOfSelected();

            }
            this.pointsState = [];
            var axisPos = edit.modify.axisPos;
            var length = this.points.length;
            for (var i = 0; i < length; i++) {
                var point = this.points[i];
                this.pointsState.push({ x: point.x, y: point.y, radian: lines.getRadian({ start: axisPos, end: point }) });
            }
            this.linesState = [];
            var length = lines.selected.length;
            for (var i = 0; i < length; i++) {
                var line = lines.selected[i];
                this.linesState.push({
                    start: { x: line.start.x, y: line.start.y, radian: lines.getRadian({ start: axisPos, end: { x: line.start.x, y: line.start.y } }) },
                    end: { x: line.end.x, y: line.end.y, radian: lines.getRadian({ start: axisPos, end: { x: line.end.x, y: line.end.y } }) },
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
                if (this.selectMode === "point") { var center = points.getCenterOfSelected(); }
                else { var center = lines.getCenterOfSelected(); }
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
            var coords = canvas.getCanvasXY();
            edit.selectRect = { start: coords, end: coords };
            this.clickedOn = "canvas";
        },
        windowMouseMove: {
            move: function (e) {
                var mode = edit.modify.clickedOn,
                    so = edit.modify.startOffset;
                var offset = canvas.getSnapXY({ x: (app.getClient(e, "X") - so.x) / canvas.zoom, y: (app.getClient(e, "Y") - so.y) / canvas.zoom });
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
                var offset = canvas.getSnapXY({ x: (app.getClient(e, "X") - so.x) / canvas.zoom, y: (app.getClient(e, "Y") - so.y) / canvas.zoom });
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
                        var point = canvas.findPointByCoords({ coords: points.selected[0], except: { id: points.selected[0].id } });
                        if (point !== false) {
                            points.moveTo(points.selected[0], point.x, point.y);
                            points.merge(point, points.selected[0]);
                            points.updateSelected();
                            points.deselectAll();
                            edit.modify.setAxisPos("hide");
                        }
                    }
                }
                canvas.redraw();
                app.eventRemover("window", "mousemove", edit.modify.windowMouseMove.move);
                app.eventRemover("window", "mouseup", edit.modify.windowMouseUp.move);

                if (edit.modify.isTransformed) {
                    edit.modify.isTransformed = false;
                    undo.save();
                }
            },
            rotate: function () {
                if (edit.modify.copyMode && edit.modify.selectMode !== "point") {
                    lines.deselectAll();
                    for (var i = 0; i < edit.modify.lines.length; i++) {
                        var line = edit.modify.lines[i];
                        var addedLine = lines.add({
                            start: { x: line.start.x, y: line.start.y, id: points.getNextID(1) },
                            end: { x: line.end.x, y: line.end.y, id: points.getNextID(2) }
                        });
                        var addedPoint1 = points.add({ x: line.start.x, y: line.start.y, connectedLines: [{ side: "start", id: addedLine.id }] });
                        var addedPoint2 = points.add({ x: line.end.x, y: line.end.y, connectedLines: [{ side: "end", id: addedLine.id }] });
                        lines.select(addedLine);
                    }
                    canvas.redraw();
                }
                $("#axis-angle").html(0);
                app.eventRemover("window", "mousemove", edit.modify.windowMouseMove.rotate);
                app.eventRemover("window", "mouseup", edit.modify.windowMouseUp.rotate);
                if (edit.modify.isTransformed) {
                    edit.modify.isTransformed = false;
                    undo.save();
                }
            },
            background: function () {
                var axisPos = edit.modify.axisPos;
                var point = canvas.findPointByCoords({ coords: axisPos });
                if (point) {
                    edit.modify.setAxisPos(point);
                }
                app.eventRemover("window", "mousemove", edit.modify.windowMouseMove.background);
                app.eventRemover("window", "mouseup", edit.modify.windowMouseUp.background);
            }
        },
        mousemove: function () {
            canvas.redraw();
            edit.drawSelectRect();
        },
        mouseup: function (e) {
            if (Math.abs(edit.selectRect.start.x - edit.selectRect.end.x) >= 3 &&
                Math.abs(edit.selectRect.start.y - edit.selectRect.end.y) >= 3) {
                edit.selectBySelectRect(edit.modify.selectMode);
                if (edit.modify.selectMode === "point") {
                    if (points.selected.length === 0) {canvas.redraw(); return;}
                    edit.modify.setAxisPos(points.getCenterOfSelected());
                } else {
                    if (lines.selected.length === 0) {canvas.redraw(); return;}
                    edit.modify.setAxisPos(lines.getCenterOfSelected());
                }
            } else {
                if (edit.modify.selectMode === "point") {
                    var point = canvas.findPointByCoords();
                    if (point) {
                        points.select(point);
                        edit.modify.setAxisPos(point);
                    } else {
                        points.deselectAll();
                        edit.modify.setAxisPos("hide");
                    }
                } else if (edit.modify.selectMode === "line") {
                    var line = canvas.findLineByCoords();
                    if (line) {
                        lines.select(line);
                        var center = lines.getCenter(line);
                        edit.modify.setAxisPos(center);
                    } else {
                        lines.deselectAll();
                        edit.modify.setAxisPos("hide");
                    }
                } else if (edit.modify.selectMode === "spline") {
                    var line = canvas.findLineByCoords();
                    if (line) {
                        lines.selectSpline(line);
                        var center = lines.getCenter(line);
                        edit.modify.setAxisPos(center);
                    } else {
                        lines.deselectAll();
                        edit.modify.setAxisPos("hide");
                    }
                }
            }
            canvas.redraw();
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
            for (var i = 0 ; i < lines.selected.length; i++) {
                var line = lines.selected[i];
                line.layer = id;
                line.color = "#fff";
                var sidePoints = lines.getPoints(line);
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
                canvas.redraw();
                this.lines = [];
                var length = edit.modify.linesState.length;
                for (var k = 0; k < length; k++) {
                    var lineState = edit.modify.linesState[k];
                    var movedStart = { x: lineState.start.x + offset.x, y: lineState.start.y + offset.y };
                    var movedEnd = { x: lineState.end.x + offset.x, y: lineState.end.y + offset.y };
                    this.lines.push({ start: movedStart, end: movedEnd });
                    canvas.drawLine({
                        x1: movedStart.x,
                        y1: movedStart.y,
                        x2: movedEnd.x,
                        y2: movedEnd.y,
                        color: "yellow",
                        showDimention: true,
                        size: 1 / canvas.zoom,
                    });
                }
            } else {
                var length = edit.modify.points.length;
                for (var k = 0; k < length; k++) {
                    var point = edit.modify.points[k];
                    points.moveTo(point, edit.modify.pointsState[k].x + offset.x, edit.modify.pointsState[k].y + offset.y);
                }
                canvas.redraw();
            }
            edit.modify.isTransformed = true;
        },
        rotate: function (offset) {
            $("#axis-angle").html(((offset) % 360) + "&deg;");
            if (this.copyMode && edit.modify.selectMode !== "point") {
                canvas.redraw();
                this.lines = [];
                var length = edit.modify.linesState.length;
                for (var k = 0; k < length; k++) {
                    var lineState = edit.modify.linesState[k];
                    var axisPos = edit.modify.axisPos;
                    var rotatedStart = points.getCoordsByRotate({ x: lineState.start.x, y: lineState.start.y }, offset + lineState.start.radian, axisPos);
                    var rotatedEnd = points.getCoordsByRotate({ x: lineState.end.x, y: lineState.end.y }, offset + lineState.end.radian, axisPos);
                    this.lines.push({ start: rotatedStart, end: rotatedEnd });
                    canvas.drawLine({
                        x1: rotatedStart.x,
                        y1: rotatedStart.y,
                        x2: rotatedEnd.x,
                        y2: rotatedEnd.y,
                        color: "yellow",
                        showDimention: true,
                        size: 1 / canvas.zoom,
                    });
                }
            } else {
                var length = edit.modify.points.length;
                for (var k = 0; k < length; k++) {
                    var point = edit.modify.points[k];
                    var pointsState = edit.modify.pointsState[k];
                    var axisPos = edit.modify.axisPos;
                    points.rotateTo(point, pointsState.radian + offset, axisPos);
                }
                canvas.redraw();
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
            undo.save();
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
            points.deselectAll();
            lines.deselectAll();
            edit.modify.setAxisPos("hide");
            canvas.redraw();
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
            var coords = canvas.getCanvasXY();
            var point = canvas.findPointByCoords();
            if (!point) {
                points.deselectAll();
                edit.selectRect = {
                    start: coords,
                    end: coords
                };
                edit.chamfer.clickMode = "canvas";
            }
            else {
                points.select(point);
                edit.chamfer.getParameters();
                edit.chamfer.clickMode = "point";
            }
        },
        getParameters: function () {
            edit.chamfer.startOffset = canvas.getCanvasXY().x;
            edit.chamfer.model = [];
            for (var i = 0; i < points.selected.length; i++) {
                var point = points.selected[i];
                if (point.connectedLines.length < 2) { continue; }
                var line1 = lines.getObjectByID(point.connectedLines[0].id);
                var line2 = lines.getObjectByID(point.connectedLines[1].id);
                var side1 = point.connectedLines[0].side;
                var otherSide1 = (side1 === "start") ? "end" : "start";
                var side2 = point.connectedLines[1].side;
                var otherSide2 = (side2 === "start") ? "end" : "start";
                var sx1 = Math.sign(line1[otherSide1].x - point.x); var sy1 = Math.sign(line1[otherSide1].y - point.y);
                var sx2 = Math.sign(line2[otherSide2].x - point.x); var sy2 = Math.sign(line2[otherSide2].y - point.y);
                this.model.push({
                    point: points.selected[i],
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
            canvas.redraw();
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
            canvas.redraw();
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
                var point1 = points.add({
                    x: model.line1[side1].x, y: model.line1[side1].y,
                    connectedLines: [{ id: line1.id, side: side1 }, { id: lines.getNextID(1), side: "start" }]
                });
                var point2 = points.add({
                    x: model.line2[side2].x, y: model.line2[side2].y,
                    connectedLines: [{ id: line2.id, side: side2 }, { id: lines.getNextID(1), side: "end" }]
                });
                line1[side1].id = point1.id;
                line2[side2].id = point2.id;
                lines.add({
                    start: { x: point1.x, y: point1.y, id: point1.id },
                    end: { x: point2.x, y: point2.y, id: point2.id }
                });
                canvas.points.splice(points.getIndexByID(point.id), 1);
            }
            undo.save();
            canvas.redraw();
        },
        doChamfer: function () {
            var coords = canvas.getCanvasXY()
            var offset = Math.abs(edit.chamfer.startOffset - coords.x);
            this.offset = offset;
            this.undoChanges();
            var length = this.model.length;
            for (var i = 0; i < length; i++) {
                var model = this.model[i];
                var line1 = model.line1;
                var side1 = model.side1
                var length1 = lines.getLength(line1);
                var line2 = model.line2;
                var side2 = model.side2
                var length2 = lines.getLength(line2);
                if (length1 == 0 || length2 == 0) { this.offset = 0; return; }
                line1[side1].x = Math.abs(line1.start.x - line1.end.x) * offset / length1 * model.sx1 + model.line1Coords[side1].x;
                line2[side2].x = Math.abs(line2.start.x - line2.end.x) * offset / length2 * model.sx2 + model.line2Coords[side2].x;
                line1[side1].y = Math.abs(line1.start.y - line1.end.y) * offset / length1 * model.sy1 + model.line1Coords[side1].y;
                line2[side2].y = Math.abs(line2.start.y - line2.end.y) * offset / length2 * model.sy2 + model.line2Coords[side2].y;
                canvas.drawLine({
                    x1: line1[side1].x,
                    y1: line1[side1].y,
                    x2: line2[side2].x,
                    y2: line2[side2].y,
                    color: "yellow",
                    showDimention: true,
                    size: 1 / canvas.zoom,
                    lineDash: [4, 4]
                });
            }
        },
        reset: function () { this.model = []; this.offset = 0; points.deselectAll(); }
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
            lines.deselectAll();
            var line = canvas.findLineByCoords({ filter: { layer: layers.getActiveLayer().id } });
            if (!line) { return; }
            lines.select(line);
            edit.plumbLine.line = line;
            edit.plumbLine.points = lines.getPoints(line);
            app.eventHandler("window", "mousemove", edit.plumbLine.windowMouseMove);
            app.eventHandler("window", "mouseup", edit.plumbLine.windowMouseUp);
            canvas.redraw();
        },
        windowMouseMove: function (e) {
            var line = edit.plumbLine.line;
            var coords = canvas.getCanvasXY();
            edit.plumbLine.plumb = lines.getPrependicularLine(line, coords);
            var plumb = edit.plumbLine.plumb;
            var point = plumb.start;
            var points = edit.plumbLine.points;
            var distance = {
                start: lines.getLength({ start: point, end: points.start }),
                end: lines.getLength({ start: point, end: points.end })
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
            edit.plumbLine.plumb = lines.getStepedLine({ line: edit.plumbLine.plumb, side: "end", step: edit.plumbLine.step });
            canvas.redraw();
            canvas.drawLine({
                x1: edit.plumbLine.plumb.start.x,
                y1: edit.plumbLine.plumb.start.y,
                x2: edit.plumbLine.plumb.end.x,
                y2: edit.plumbLine.plumb.end.y,
                color: "yellow",
                showDimention: true,
                size: 1 / canvas.zoom,
                lineDash: [4, 4]
            });
        },

        windowMouseUp: function () {
            lines.deselectAll();
            if (lines.getLength(edit.plumbLine.plumb) > 5) {
                var pl = edit.plumbLine.plumb;
                var point1 = points.add({
                    x: pl.start.x,
                    y: pl.start.y,
                    connectedLines: [{
                        id: lines.getNextID(1),
                        side: "start"
                    }]
                });
                var point2 = points.add({
                    x: pl.end.x,
                    y: pl.end.y,
                    connectedLines: [{
                        id: lines.getNextID(1),
                        side: "end"
                    }]
                });
                var line = lines.add({
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
                undo.save();
                var sidePoint = edit.plumbLine.points[edit.plumbLine.side];
                if (edit.plumbLine.bond && sidePoint.connectedLines.length < 2 && edit.plumbLine.autoWeld) {
                    console.log("merge");
                    points.merge(sidePoint, point1);
                    undo.save();
                }

            }
            app.eventRemover("window", "mousemove", edit.plumbLine.windowMouseMove);
            app.eventRemover("window", "mouseup", edit.plumbLine.windowMouseUp);
            canvas.redraw();
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
            var coords = canvas.getCanvasXY();
            var line = ap.line = canvas.findLineByCoords({ filter: { layer: layers.getActiveLayer().id } });
            if (!line) { return; }
            var length = lines.getLength(line) / 2;
            if (ap.min > Math.floor(length)) { ap.min = Math.floor(length); }
            var delta = lines.getDelta(line, ap.min);
            ap.maxX = Math.max(ap.line.start.x, ap.line.end.x) - delta.x;
            ap.maxY = Math.max(ap.line.start.y, ap.line.end.y) - delta.y;
            ap.minX = Math.min(ap.line.start.x, ap.line.end.x) + delta.x;
            ap.minY = Math.min(ap.line.start.y, ap.line.end.y) + delta.y;
            ap.point = lines.getPrependicularPoint(line, coords);
            var sidePoints = lines.getPoints(line);
            ap.startPoint = sidePoints.start;
            ap.endPoint = sidePoints.end;
            canvas.drawLine({
                x1: ap.startPoint.x,
                y1: ap.startPoint.y,
                x2: ap.point.x,
                y2: ap.point.y,
                color: "yellow",
                lineDash: [4, 4],
                showDimention: true,
                size: 1 / canvas.zoom,
            });
            canvas.drawLine({
                x1: ap.endPoint.x,
                y1: ap.endPoint.y,
                x2: ap.point.x,
                y2: ap.point.y,
                color: "yellow",
                lineDash: [4, 4],
                showDimention: true,
                size: 1 / canvas.zoom,
            });
            edit.drawPoint(ap.point.x, ap.point.y);
        },
        mousemove: function () {
            var ap = edit.addPoint;
            if (!ap.line) { return; }
            canvas.redraw();

            var coords = canvas.getCanvasXY();
            ap.point = lines.getPrependicularPoint(ap.line, coords);
            ap.point.x += ap.point.x > ap.maxX ? ap.maxX - ap.point.x : (ap.point.x < ap.minX ? ap.minX - ap.point.x : 0);
            ap.point.y += ap.point.y > ap.maxY ? ap.maxY - ap.point.y : (ap.point.y < ap.minY ? ap.minY - ap.point.y : 0);
            canvas.drawLine({
                x1: ap.startPoint.x,
                y1: ap.startPoint.y,
                x2: ap.point.x,
                y2: ap.point.y,
                color: "yellow",
                lineDash: [4, 4],
                showDimention: true,
                size: 1 / canvas.zoom,
            });
            canvas.drawLine({
                x1: ap.endPoint.x,
                y1: ap.endPoint.y,
                x2: ap.point.x,
                y2: ap.point.y,
                color: "yellow",
                lineDash: [4, 4],
                showDimention: true,
                size: 1 / canvas.zoom,
            });
            edit.drawPoint(ap.point.x, ap.point.y);
        },
        mouseup: function () {
            var ap = edit.addPoint;
            if (!ap.line) { return; }
            lines.remove(ap.line);
            var addedPoint = points.add({ x: ap.point.x, y: ap.point.y });
            points.connect(ap.startPoint, addedPoint);
            points.connect(addedPoint, ap.endPoint);
            undo.save();
            canvas.redraw();
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