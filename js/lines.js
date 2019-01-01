var Lines = {
    id: "1l",splineIDS: [],selected: [],
    idGenerator: function () {this.id = (parseInt(this.id) + 1) + "l";},
    setSplineIDS: function (obj) {
        if (this.splineIDS.indexOf(obj.id) === -1) {this.splineIDS.push(obj.id);}
        var sideLines = lines.getLines(obj);
        if (sideLines.start && this.splineIDS.indexOf(sideLines.start.id) === -1) {
            this.splineIDS.push(sideLines.start.id);
            this.setSplineIDS(sideLines.start);
        }
        if (sideLines.end && this.splineIDS.indexOf(sideLines.end.id) === -1) {
            this.splineIDS.push(sideLines.end.id);
            this.setSplineIDS(sideLines.end);
        }
    },
    getSplineIDS: function (obj) {
        this.setSplineIDS(obj);
        var list = this.splineIDS.slice(0, this.splineIDS.length);
        this.splineIDS = [];
        return list;
    },
    selectSpline: function (obj) {
        var list = this.getSplineIDS(obj);
        for (var i = 0; i < list.length; i++) {this.select(lines.getObjectByID(list[i]));}
    },
    add: function (obj) {
        obj.id = this.id;
        obj.show = obj.show || true;
        //obj.layer = obj.leyer || layers.getActiveLayer().id;
        //obj.color = obj.color || layers.getActiveLayer().color;
        app.state.lines.push(obj);
        this.idGenerator();
        return Lines.getLast(1);
    },
    remove: function (line,modifySidePoints) {
        var index = lines.getIndexByID(line.id);
        if(index === false){return false; }
        var sidePoints = lines.getPoints(line);
        var startPoint = sidePoints.start;
        var endPoint = sidePoints.end;
        points.removeConnectedLine(startPoint,line.id);
        points.removeConnectedLine(endPoint,line.id);
        if(modifySidePoints === true){
            if(startPoint.connectedLines.length === 0){points.remove(startPoint);}
            if(endPoint.connectedLines.length === 0){points.remove(endPoint);}
        }
        canvas.lines.splice(index, 1);
    },
    select: function (obj) {
        var length = lines.selected.length;
        for (var i = 0; i < length; i++) {
            var line = lines.selected[i];
            if (line.id === obj.id) {return;}
        }
        lines.selected.push(obj);
        obj.color = "red";
        obj.selected = true;
        obj.showDimention = true;
    },
    deselectAll: function () {
        var length = lines.selected.length;
        for (var i = 0; i < length; i++) {
            var line = lines.selected[i],layer = layers.getObjectByID(line.layer);
            line.color = layer.color;
            line.selected = false;
            line.showDimention = false;
        }
        lines.selected = [];
    },
    getIndexByID: function (id) {
        for (var i = 0; i < canvas.lines.length; i++) {
            if (canvas.lines[i].id === id) {return i;}
        }
        return false;
    },
    getObjectByID: function (id) {
        var index = lines.getIndexByID(id);
        if (index === false) {return false;}
        return canvas.lines[index];
    },
    getLast: function (n) {
        if (app.state.lines.length < n) {
            throw new("error 1005");
        }
        return app.state.lines[app.state.lines.length - n];
    },
    getNextID: function (n) {return (parseInt(this.id) + n - 1) + "l";},
    findByCoords: function (x, y) {
        if (x === undefined) {
            var pos = canvas.getCanvasXY();
            x = pos.x;
            y = pos.y;
        }
        var layer = layers.getActiveLayer();
        var lines = canvas.lines;
        var length = lines.length;
        for (var t = 1; t < 18; t += 2) {
            for (var i = 0; i < length; i++) { // به ازای تمامی خطوط
                var line = lines[i];
                if (line.layer != layer.id) {continue;}
                if (line.start.x - line.end.x === 0) { // اگر آن خط عمودی بود
                    if (x > line.start.x + t || line.start.x - t > x) {continue;} 
                    if (y < Math.max(line.start.y, line.end.y) && Math.min(line.start.y, line.end.y) < y) {return line;}
                } else {
                    var dip = this.getDip(line);
                    if (1 <= Math.abs(dip)) { 
                        if (x > (((y - line.start.y) / dip) + line.start.x) + t || (((y - line.start.y) /dip) + line.start.x) - t > x) {continue;} 
                        if (y < Math.max(line.start.y, line.end.y) && Math.min(line.start.y, line.end.y) <y) {return line;}
                    } else { 
                        if (y < ((dip * (x - line.start.x)) + line.start.y) - t || ((dip * (x - line.start.x)) + line.start.y) + t < y) {continue;} 
                        if (x < Math.max(line.start.x, line.end.x) && Math.min(line.start.x, line.end.x) <x) { return line;}
                    }
                }
            }
        }
        return false;
    },
    getDip: function (obj) {
        if (obj.start.x === obj.end.x) { return "infinity" }
        else { return (obj.start.y - obj.end.y) / (obj.start.x - obj.end.x);}
    },
    getRadian: function (obj) {
        var x1 = obj.start.x,y1 = obj.start.y,x2 = obj.end.x,y2 = obj.end.y;
        var radian = (Math.atan((y2 - y1) / (x1 - x2)) / Math.PI * 180);
        if (x2 < x1) {
            if (y1 - y2 != 0) { radian = 180 + radian; }
            else {radian = 180;}
        } else if (x1 < x2) {
            if (y2 < y1) { }
            else if (y1 < y2) { radian = 360 + radian; }
            else {radian = 0;}
        } else {
            if (y2 < y1) { radian = 90; }
            else if (y1 < y2) { radian = 270; }
            else {radian = 0;}
        }
        return radian;
    },
    getAngle:function(obj){
        var length = lines.getLength(obj);
        var cos = (obj.end.x - obj.start.x) / length;
        var sin = (obj.end.y - obj.start.y) / length;
        var angle = Math.acos(cos) / Math.PI * 180;
        if (obj.end.y < obj.start.y) { angle = 360 - angle; }
        return 360 - angle;
    },
    getLength: function (obj) {
        return Math.sqrt(Math.pow(obj.start.x - obj.end.x, 2) + Math.pow(obj.start.y - obj.end.y, 2));
    },
    getMeet: function (f, s) {
        var fDip = this.getDip(f);
        var sDip = this.getDip(s);
        if (fDip === "infinity" && sDip === "infinity") { return false; }
        else if (fDip == "infinity") { return { x: f.start.x, y: (sDip * (f.start.x - s.start.x)) + s.start.y }; }
        else if (sDip == "infinity") { return { x: s.start.x, y: (fDip * (s.start.x - f.start.x)) + f.start.y }; }
        else if (Math.abs(fDip - sDip) < 0.0001) { return false; }
        else {
            var x = (s.start.y - f.start.y + (fDip * f.start.x) - (sDip * s.start.x)) / (fDip - sDip);
            var y = (fDip * (x - f.start.x)) + f.start.y;
            return {x: x,y: y};
        }
    },
    extend: function (obj, side, value) {
        if (side === "end") {value *= -1;}
        var l = lines.getLength(obj);
        var dx = value * (obj.start.x - obj.end.x) / l;
        var dy = value * (obj.start.y - obj.end.y) / l;
        points.moveBy(points.getObjectByID(obj[side].id), dx, dy);
    },
    join: function (f, s) {
        ///////validation
        if (f.id === s.id) {
            var A = new Alert({ buttons: [{ title: "OK" }, ], template: "Can not Join Lines With Themselves!!!", title: "Join Lines Warning." });
            return false;
        }
        if (lines.isConnect(f, s)) {
            var A = new Alert({buttons: [{title: "OK"}, ],template: "Can not Join Connected Lines!!!",title: "Join Lines Warning."});
            return false;
        }
        var meet = lines.getMeet(f, s);
        if (meet === false) {
            var A = new Alert({buttons: [{title: "OK"}, ],template: "Can not Join Parallel Lines!!!",title: "Join Lines Warning."});
            return false;
        }
        
        
        var fPoints = lines.getPoints(f);
        if (lines.getLength({start: fPoints.start,end: meet}) < lines.getLength({start: fPoints.end,end: meet})) {var fMajor = fPoints.start;var fMinor = fPoints.end;} 
        else {var fMajor = fPoints.end; var fMinor = fPoints.start;}
        if (fPoints.start.connectedLines.length > 1 && fPoints.end.connectedLines.length === 1) {fMajor = fPoints.end; fMinor = fPoints.start;} 
        else if (fPoints.end.connectedLines.length > 1 && fPoints.start.connectedLines.length === 1) {fMajor = fPoints.start; fMinor = fPoints.end;}
        
        var sPoints = lines.getPoints(s);
        if (lines.getLength({start: sPoints.start,end: meet}) < lines.getLength({start: sPoints.end,end: meet})) {var sMajor = sPoints.start;var sMinor = sPoints.end;} 
        else {var sMajor = sPoints.end;var sMinor = sPoints.start;}
        if (sPoints.start.connectedLines.length > 1 && sPoints.end.connectedLines.length === 1) {sMajor = sPoints.end;sMinor = sPoints.start;} 
        else if (sPoints.end.connectedLines.length > 1 && sPoints.start.connectedLines.length === 1) {sMajor = sPoints.start;sMinor = sPoints.end;}
        
        if(fMajor.connectedLines.length === 1){
            points.moveTo(fMajor,meet.x,meet.y);
            var meetPoint = fMajor;
        }
        else{
            var meetPoint = points.add({x: meet.x,y: meet.y,});
            points.connect(fMajor,meetPoint);    
        }
        if (sMajor.connectedLines.length === 1) {
            points.moveTo(sMajor, meet.x, meet.y);
            points.merge(meetPoint, sMajor, meet);
        }
        else { points.connect(meetPoint, sMajor); }

        return true;
    },
    getCenter: function (obj) {
        return {
            x: Math.min(obj.start.x, obj.end.x) + Math.abs(obj.start.x - obj.end.x) / 2,
            y: Math.min(obj.start.y, obj.end.y) + Math.abs(obj.start.y - obj.end.y) / 2
        };
    },
    isConnect: function (f, s) {
        var fPointsID = [f.start.id, f.end.id],sPointsID = [s.start.id, s.end.id];
        for (var i = 0; i < fPointsID.length; i++) {
            if (sPointsID.indexOf(fPointsID[i]) !== -1) {return true;}
        }
        return false;
    },
    divide: function (obj, count) {
        var index = lines.getIndexByID(obj.id);
        canvas.lines.splice(index, 1);
        var startPoint = points.getObjectByID(obj.start.id);
        var endPoint = points.getObjectByID(obj.end.id);
        var deltaX = obj.end.x - obj.start.x,deltaY = obj.end.y - obj.start.y;
        var dX = deltaX / count,dY = deltaY / count;
        for (var i = 0; i < count; i++) {
            if (i === 0) {
                for (var j = 0; j < startPoint.connectedLines.length; j++) {
                    if (startPoint.connectedLines[j].id === obj.id) {
                        startPoint.connectedLines.splice(j, 1);
                        break;
                    }
                }
                points.add({x: startPoint.x + dX,y: startPoint.y + dY});
                points.connect(startPoint, points.getLast(1));
            } else if (i === count - 1) {
                for (var j = 0; j < endPoint.connectedLines.length; j++) {
                    if (endPoint.connectedLines[j].id === obj.id) {
                        endPoint.connectedLines.splice(j, 1);
                        break;
                    }
                }
                points.connect(points.getLast(1), endPoint);
            } else {
                points.add({x: startPoint.x + ((i + 1) * dX),y: startPoint.y + ((i + 1) * dY)});
                points.connect(points.getLast(2), points.getLast(1));
            }
        }
    },
    getPrependicularPoint: function (line, point) {
        var dip = lines.getDip(line);
        if (dip === 0) {
            var y = line.start.y,x = point.x;
        } else if (dip === "infinity") {
            var y = point.y,x = line.start.x;
        } else {
            var x = ((point.x / dip) + (dip * line.start.x) + point.y - line.start.y) / (dip + (1 / dip));
            var y = (dip * x) - (dip * line.start.x) + line.start.y;
        }
        return {x: x,y: y};
    },
    getPrependicularLine: function (line, point) {
        var dip = lines.getDip(line);
        if (dip === 0) { var y = line.start.y, x = point.x; }
        else if (dip === "infinity") { var y = point.y, x = line.start.x; }
        else {
            var x = ((point.x / dip) + (dip * line.start.x) + point.y - line.start.y) / (dip + (1 / dip)),
                y = (dip * x) - (dip * line.start.x) + line.start.y;
        }
        return {start: {x: x,y: y},end: {x: point.x,y: point.y}};
    },
    getDistance: function (line, point) {
        var line = lines.getPrependicularLine(line, point);
        return lines.getLength(line);
    },
    getXByY: function (line, y, dip) {
        dip = dip || lines.getDip(line);
        if (dip === "infinity") { return line.start.x;}
        if (dip === 0) {return false;}
        return (y + (dip * line.start.x) - line.start.y) / dip;
    },
    getYByX: function (line, x, dip) {
        dip = dip || lines.getDip(line);
        if (dip === "infinity") {return false};
        return (dip * x) - (dip * line.start.x) + line.start.y;
    },
    getRadianWidth: function (f, s) {return Math.abs(lines.getRadian(s) - lines.getRadian(f));},
    getPoints: function (line) {
        var start = points.getObjectByID(line.start.id),end = points.getObjectByID(line.end.id);
        return {start: start,end: end};
    },
    getPointBySide:function(line,side){return points.getObjectByID(line[side].id);},
    getLines: function (obj) {
        var start = false,end = false,startSide = false,endSide = false;
        var startPoint = points.getObjectByID(obj.start.id);
        var endPoint = points.getObjectByID(obj.end.id);
        for (var i = 0; i < startPoint.connectedLines.length; i++) {
            var line = startPoint.connectedLines[i];
            if (line.id === obj.id) {continue;}
            start = lines.getObjectByID(line.id);
            startSide = line.side;
        }
        for (var i = 0; i < endPoint.connectedLines.length; i++) {
            var line = endPoint.connectedLines[i];
            if (line.id === obj.id) {continue;}
            end = lines.getObjectByID(line.id);
            endSide = line.side;
        }
        return {start: start,end: end,startSide: startSide,endSide: endSide,};
    },
    getPointsOfSelected: function () {
        var list = [],ids = [];
        var length = lines.selected.length;
        for (var i = 0; i < length; i++) {
            var line = lines.selected[i],start = line.start.id,end = line.end.id;
            if (ids.indexOf(start) === -1) {
                list.push(points.getObjectByID(start));
                ids.push(start);
            }
            if (ids.indexOf(end) === -1) {
                list.push(points.getObjectByID(end));
                ids.push(end);
            }
        }
        return list;
    },
    getCenterOfSelected: function () {
        var length = lines.selected.length;
        if (length === 0) {return false;}
        var minX = lines.selected[0].start.x,
            maxX = lines.selected[0].start.x,
            minY = lines.selected[0].start.y,
            maxY = lines.selected[0].start.y;
        for (var i = 0; i < length; i++) {
            var line = lines.selected[i];
            minX = Math.min(minX, line.start.x, line.end.x);
            minY = Math.min(minY, line.start.y, line.end.y);
            maxX = Math.max(maxX, line.start.x, line.end.x);
            maxY = Math.max(maxY, line.start.y, line.end.y);
        }
        return {x: (minX + maxX) / 2,y: (minY + maxY) / 2};
    },
    getStepedLine: function (obj) {
        var otherSide = (obj.side === "start") ? "end" : "start";
        var x2 = obj.line[obj.side].x, y2 = obj.line[obj.side].y, x1 = obj.line[otherSide].x, y1 = obj.line[otherSide].y;
        if (obj.dip === undefined) { obj.dip = lines.getDip(obj.line); }
        var sin = Math.sin(lines.getRadian(obj.line) * Math.PI / 180);
        var cos = Math.cos(lines.getRadian(obj.line) * Math.PI / 180);
        if (obj.dip === "infinity") {
            var dy = y2 - y1;
            dy = Math.round(dy / obj.step) * obj.step;
            y2 = y1 + dy;
        }
        else if (Math.abs(obj.dip) <= 1) {
            var l = lines.getLength({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 } });
            l = Math.round(l / obj.step) * obj.step;
            var dx = l * cos;
            if (x2 > x1) { var sign = 1 } else { var sign = -1; }
            if (obj.line.start.x > obj.line.end.x) { var sign2 = -1 } else { var sign2 = 1; }
            x2 = x1 + (dx * sign * sign2);
            y2 = lines.getYByX(obj.line, x2, obj.dip);
        }
        else {
            var l = lines.getLength({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 } });
            l = Math.round(l / obj.step) * obj.step;
            var dy = l * sin;
            if (y2 > y1) { var sign = 1 } else { var sign = -1; }
            if (obj.line.start.y > obj.line.end.y) { var sign2 = 1 } else { var sign2 = -1; }
            y2 = y1 + (dy * sign * sign2);
            x2 = lines.getXByY(obj.line, y2, obj.dip);
        }
        var newLine = {};
        newLine[obj.side] = { x: x2, y: y2 };
        newLine[otherSide] = { x: x1, y: y1 };
        return newLine;
    },
    getDelta: function (line,measure) {
        var angle = lines.getRadian(line);
        return { x: Math.abs(measure * Math.cos(angle * Math.PI / 180)), y: Math.abs(measure * Math.sin(angle * Math.PI / 180)) };
    }
}