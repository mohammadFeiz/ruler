var Lines = {
    id: "1l",splineIDS: [],selected: [],
    idGenerator: function () {this.id = (parseInt(this.id) + 1) + "l";},
    sortSplineRecursive:function(line,side){
        var index =this.splineIDS.indexOf(line.id);
        if(index === -1){this.splineIDS.push(line.id)}
        else{return;}
        var sides = Lines.getLines(line),next = sides[side];
        if (next) {
            var sides = Lines.getLines(next);
            if(sides[side].id === line.id){
                this.reverseDirection(next);
            }
            this.sortSplineRecursive(next,side);
        }
        
    },
    reverseDirection:function(line){
        if(typeof line === "string"){line = this.getObjectByID(line);}
        var points = Lines.getPoints(line),startPoint=points.start,endPoint=points.end;
        var copy = {
            start:{x:line.start.x,y:line.start.y,id:line.start.id},
            end:{x:line.end.x,y:line.end.y,id:line.end.id}
        }
        line.start.x = copy.end.x;
        line.start.y = copy.end.y;
        line.start.id = copy.end.id;
        for(var i = 0; i < startPoint.connectedLines.length; i++){
            var cl = startPoint.connectedLines[i];
            if(cl.id === line.id){cl.side = cl.side === 'start'?'end':'start'}
        }
        line.end.x = copy.start.x;
        line.end.y = copy.start.y;
        line.end.id = copy.start.id;
        for(var i = 0; i < endPoint.connectedLines.length; i++){
            var cl = endPoint.connectedLines[i];
            if(cl.id === line.id){cl.side = cl.side === 'start'?'end':'start'}
        }
    },
    getSplineIDS: function (line) {
        if(typeof line === "string"){line = this.getObjectByID(line);}
        this.splineIDS = [];
        this.sortSplineRecursive(line,'start');
        var startSpline = this.getObjectByID(this.splineIDS[this.splineIDS.length - 1]);
        this.splineIDS = [];
        this.sortSplineRecursive(startSpline,'end');
        
        return this.splineIDS;
    },
    add: function (obj) {
        obj.id = this.id;
        obj.layerId = layers.getActive().id;
        app.state.lines.push(obj);
        this.idGenerator();
        return Lines.getLast(1);
    },
    remove: function (line,modifySidePoints) {
        var index = Lines.getIndexByID(line.id);
        if(index === false){return false; }
        var sidePoints = Lines.getPoints(line);
        var startPoint = sidePoints.start;
        var endPoint = sidePoints.end;
        Points.removeConnectedLine(startPoint, line.id);
        Points.removeConnectedLine(endPoint, line.id);
        if(modifySidePoints === true){
            if (startPoint.connectedLines.length === 0) { Points.remove(startPoint); }
            if (endPoint.connectedLines.length === 0) { Points.remove(endPoint); }
        }
        app.state.lines.splice(index, 1);
    },
    select: function (obj) {
        if(typeof obj === "string"){obj = this.getObjectByID(obj);}
        var length = Lines.selected.length;
        for (var i = 0; i < length; i++) {
            var line = Lines.selected[i];
            if (line.id === obj.id) {return;}
        }
        obj.selected = true;
        obj.showDimention = true;
        obj.lineDash = [2, 3];
        Lines.selected.push(obj);
    },
    selectSpline: function (line) {
        var list = this.getSplineIDS(line);
        for (var i = 0; i < list.length; i++) {this.select(Lines.getObjectByID(list[i]));}
    },
    deselect: function (id) {
        var length = Lines.selected.length;
        for (var i = 0; i < length; i++) {
            var line = Lines.selected[i];
            if (line.id === id) { Lines.selected.splice(i, 1); break; }
        }
        var obj = this.getObjectByID(id);
        if (!obj) { return false; }
        obj.selected = false;
        obj.showDimention = false;
        obj.lineDash = undefined;
    },
    deselectAll: function () {
        var length = this.selected.length;
        for (var i = 0; i < length; i++) {
            var line = Lines.selected[i];
            line.selected = false;
            line.lineDash = undefined;
        }
        this.selected = [];
    },
    getIndexByID: function (id) {
        for (var i = 0; i < app.state.lines.length; i++) {
            if (app.state.lines[i].id === id) {return i;}
        }
        return false;
    },
    getObjectByID: function (id) {
        var index = Lines.getIndexByID(id);
        if (index === false) {return false;}
        return app.state.lines[index];
    },
    getLast: function (n) {
        if (app.state.lines.length < n) {
            throw new("error 1005");
        }
        return app.state.lines[app.state.lines.length - n];
    },
    getNextID: function (n) {return (parseInt(this.id) + n - 1) + "l";},
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
    getLength: function (line) { return Math.sqrt(Math.pow(line.start.x - line.end.x, 2) + Math.pow(line.start.y - line.end.y, 2)); },
    getMeet: function (f, s) {
        var fDip = Lines.getDip(f), sDip = Lines.getDip(s);
        if (fDip === "infinity" && sDip === "infinity") { return false; }
        else if (fDip == "infinity") { return { x: f.start.x, y: (sDip * (f.start.x - s.start.x)) + s.start.y }; }
        else if (sDip == "infinity") { return { x: s.start.x, y: (fDip * (s.start.x - f.start.x)) + f.start.y }; }
        else if (Math.abs(fDip - sDip) < 0.0001) {
            var distance = this.getDistance(f,s.start);
            if(distance < 0.0001){
                return {x:f.end.x,y:f.end.y};
            }
            return false;
        }
        else {
            var x = (s.start.y - f.start.y + (fDip * f.start.x) - (sDip * s.start.x)) / (fDip - sDip);
            var y = (fDip * (x - f.start.x)) + f.start.y;
            return { x: x, y: y };
        }
    },
    getDip: function (line) { return line.start.x === line.end.x ? 'infinity' : (line.start.y - line.end.y) / (line.start.x - line.end.x); },
    getXByY: function (line, y, dip) {
        dip = dip === undefined? this.getDip(line):dip;
        if (dip === "infinity") { return line.start.x; }
        if (dip === 0) { return false; }
        return (y + (dip * line.start.x) - line.start.y) / dip;
    },
    getYByX: function (line, x, dip) {
        dip = dip === undefined? this.getDip(line):dip;
        if (dip === "infinity") { return false };
        return (dip * x) - (dip * line.start.x) + line.start.y;
    },
    extend: function (obj, side, value) {
        if (side === "end") {value *= -1;}
        var l = Lines.getLength(obj);
        var dx = value * (obj.start.x - obj.end.x) / l;
        var dy = value * (obj.start.y - obj.end.y) / l;
        Points.moveBy(Points.getObjectByID(obj[side].id), dx, dy);
    },
    join: function (f, s) {
        ///////validation
        if (f.id === s.id) {
            var A = new Alert({ buttons: [{ title: "OK" }, ], template: "Can not Join Lines With Themselves!!!", title: "Join Lines Warning." });
            return false;
        }
        if (Lines.isConnect(f, s)) {
            var A = new Alert({buttons: [{title: "OK"}, ],template: "Can not Join Connected Lines!!!",title: "Join Lines Warning."});
            return false;
        }
        var meet = Lines.getMeet(f, s);
        if (meet === false) {
            var A = new Alert({buttons: [{title: "OK"}, ],template: "Can not Join Parallel Lines!!!",title: "Join Lines Warning."});
            return false;
        }
        
        
        var fPoints = Lines.getPoints(f);
        if (Lines.getLength({start: fPoints.start,end: meet}) < Lines.getLength({start: fPoints.end,end: meet})) {var fMajor = fPoints.start;var fMinor = fPoints.end;} 
        else {var fMajor = fPoints.end; var fMinor = fPoints.start;}
        if (fPoints.start.connectedLines.length > 1 && fPoints.end.connectedLines.length === 1) {fMajor = fPoints.end; fMinor = fPoints.start;} 
        else if (fPoints.end.connectedLines.length > 1 && fPoints.start.connectedLines.length === 1) {fMajor = fPoints.start; fMinor = fPoints.end;}
        
        var sPoints = Lines.getPoints(s);
        if (Lines.getLength({start: sPoints.start,end: meet}) < Lines.getLength({start: sPoints.end,end: meet})) {var sMajor = sPoints.start;var sMinor = sPoints.end;} 
        else {var sMajor = sPoints.end;var sMinor = sPoints.start;}
        if (sPoints.start.connectedLines.length > 1 && sPoints.end.connectedLines.length === 1) {sMajor = sPoints.end;sMinor = sPoints.start;} 
        else if (sPoints.end.connectedLines.length > 1 && sPoints.start.connectedLines.length === 1) {sMajor = sPoints.start;sMinor = sPoints.end;}
        
        if(fMajor.connectedLines.length === 1){
            Points.moveTo(fMajor, meet.x, meet.y);
            var meetPoint = fMajor;
        }
        else{
            var meetPoint = Points.add({ x: meet.x, y: meet.y, });
            Points.connect(fMajor, meetPoint);
        }
        if (sMajor.connectedLines.length === 1) {
            Points.moveTo(sMajor, meet.x, meet.y);
            Points.merge(meetPoint, sMajor, meet);
        }
        else { Points.connect(meetPoint, sMajor); }

        return true;
    },
    isConnect: function (f, s) {
        var fPointsID = [f.start.id, f.end.id],sPointsID = [s.start.id, s.end.id];
        for (var i = 0; i < fPointsID.length; i++) {
            if (sPointsID.indexOf(fPointsID[i]) !== -1) {return true;}
        }
        return false;
    },
    divide: function (obj, count) {
        var index = Lines.getIndexByID(obj.id);
        app.state.lines.splice(index, 1);
        var startPoint = Points.getObjectByID(obj.start.id);
        var endPoint = Points.getObjectByID(obj.end.id);
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
                Points.add({ x: startPoint.x + dX, y: startPoint.y + dY });
                Points.connect(startPoint, Points.getLast(1));
            } else if (i === count - 1) {
                for (var j = 0; j < endPoint.connectedLines.length; j++) {
                    if (endPoint.connectedLines[j].id === obj.id) {
                        endPoint.connectedLines.splice(j, 1);
                        break;
                    }
                }
                Points.connect(Points.getLast(1), endPoint);
            } else {
                Points.add({ x: startPoint.x + ((i + 1) * dX), y: startPoint.y + ((i + 1) * dY) });
                Points.connect(Points.getLast(2), Points.getLast(1));
            }
        }
    },
    
    getPrependicularPoint: function (line, point) {
        var dip = Lines.getDip(line);
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
        var dip = Lines.getDip(line);
        if (dip === 0) { var y = line.start.y, x = point.x; }
        else if (dip === "infinity") { var y = point.y, x = line.start.x; }
        else {
            var x = ((point.x / dip) + (dip * line.start.x) + point.y - line.start.y) / (dip + (1 / dip)),
                y = (dip * x) - (dip * line.start.x) + line.start.y;
        }
        return {start: {x: x,y: y},end: {x: point.x,y: point.y}};
    },
    getParallelLine:function(line,offset,radian){
        radian = radian===undefined?this.getRadian(line):radian;
        var deltaX = offset * Math.cos((90 - radian) * Math.PI / 180);
        var deltaY = offset * Math.sin((90 - radian) * Math.PI / 180);
        return {
            start: {x: line.start.x + deltaX,y: line.start.y + deltaY},
            end: {x: line.end.x + deltaX,y: line.end.y + deltaY}
        };
    },
    getDistance: function (line, point) {
        var line = Lines.getPrependicularLine(line, point);
        return Lines.getLength(line);
    },  
    getRadianWidth: function (f, s) {return Math.abs(Lines.getRadian(s) - Lines.getRadian(f));},
    getPoints: function (line) {return {start: Points.getObjectByID(line.start.id),end: Points.getObjectByID(line.end.id)};},
    getPointBySide: function (line, side) { return Points.getObjectByID(line[side].id); },
    getLines: function (obj) {
        var start = false,end = false,startSide = false,endSide = false;
        var startPoint = Points.getObjectByID(obj.start.id);
        var endPoint = Points.getObjectByID(obj.end.id);
        for (var i = 0; i < startPoint.connectedLines.length; i++) {
            var line = startPoint.connectedLines[i];
            if (line.id === obj.id) {continue;}
            start = Lines.getObjectByID(line.id);
            startSide = line.side;
        }
        for (var i = 0; i < endPoint.connectedLines.length; i++) {
            var line = endPoint.connectedLines[i];
            if (line.id === obj.id) {continue;}
            end = Lines.getObjectByID(line.id);
            endSide = line.side;
        }
        return {start: start,end: end,startSide: startSide,endSide: endSide,};
    },
    getPointsOfList: function (list) {
        var points = [],ids = [];
        var length = list.length;
        for (var i = 0; i < length; i++) {
            var line = list[i],start = line.start.id,end = line.end.id;
            if (ids.indexOf(start) === -1) {
                points.push(Points.getObjectByID(start));
                ids.push(start);
            }
            if (ids.indexOf(end) === -1) {
                points.push(Points.getObjectByID(end));
                ids.push(end);
            }
        }
        return points;
    },
    getCenterOfList: function (list) {
        var length = list.length;
        if (length === 0) {return false;}
        var minX = list[0].start.x,maxX = list[0].start.x,minY = list[0].start.y,maxY = list[0].start.y;
        for (var i = 0; i < length; i++) {
            var line = list[i];
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
        if (obj.dip === undefined) { obj.dip = Lines.getDip(obj.line); }
        var sin = Math.sin(Lines.getRadian(obj.line) * Math.PI / 180);
        var cos = Math.cos(Lines.getRadian(obj.line) * Math.PI / 180);
        if (obj.dip === "infinity") {
            var dy = y2 - y1;
            dy = Math.round(dy / obj.step) * obj.step;
            y2 = y1 + dy;
        }
        else if (Math.abs(obj.dip) <= 1) {
            var l = Lines.getLength({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 } });
            l = Math.round(l / obj.step) * obj.step;
            var dx = l * cos;
            if (x2 > x1) { var sign = 1 } else { var sign = -1; }
            if (obj.line.start.x > obj.line.end.x) { var sign2 = -1 } else { var sign2 = 1; }
            x2 = x1 + (dx * sign * sign2);
            y2 = Lines.getYByX(obj.line, x2, obj.dip);
        }
        else {
            var l = Lines.getLength({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 } });
            l = Math.round(l / obj.step) * obj.step;
            var dy = l * sin;
            if (y2 > y1) { var sign = 1 } else { var sign = -1; }
            if (obj.line.start.y > obj.line.end.y) { var sign2 = 1 } else { var sign2 = -1; }
            y2 = y1 + (dy * sign * sign2);
            x2 = Lines.getXByY(obj.line, y2, obj.dip);
        }
        var newLine = {};
        newLine[obj.side] = { x: x2, y: y2 };
        newLine[otherSide] = { x: x1, y: y1 };
        return newLine;
    },
    getDelta: function (line,measure) {
        var angle = Lines.getRadian(line);
        return { x: Math.abs(measure * Math.cos(angle * Math.PI / 180)), y: Math.abs(measure * Math.sin(angle * Math.PI / 180)) };
    },
    haveInnerMeet:function(a,b){
        var meet = Lines.getMeet(a,b);
        if(!meet){return false;}
        if (meet.x < a.start.x && meet.x < a.end.x) { return false;}
        if (meet.x > a.start.x && meet.x > a.end.x) { return false; }
        if (meet.x < b.start.x && meet.x < b.end.x) { return false; }
        if (meet.x > b.start.x && meet.x > b.end.x) { return false; }
        if (meet.y < a.start.y && meet.y < a.end.y) { return false; }
        if (meet.y > a.start.y && meet.y > a.end.y) { return false; }
        if (meet.y < b.start.y && meet.y < b.end.y) { return false; }
        if (meet.y > b.start.y && meet.y > b.end.y) { return false; }
        return true;
    }
}