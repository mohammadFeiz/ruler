var Points = {
    id: "1p",
    idGenerator: function () {
        this.id = (parseInt(this.id) + 1) + "p";
    },
    selected: [],
    select: function (obj) {
        var length = points.selected.length;
        for (var i = 0; i < length; i++) {
            var point = points.selected[i];
            if (point.id === obj.id) {
                return;
            }
        }
        points.selected.push(obj);
        obj.color = "red";
        obj.selected = true;
    },
    deselectByID:function(id){
        for (var i = 0; i < points.selected.length; i++) {
            var selected = points.selected[i];
            if (selected.id === id) {
                selected.selected = false;
                points.selected.splice(i, 1);
            }
        }
    },
    deselectAll: function () {
        var length = points.selected.length;
        for (var i = 0; i < length; i++) {
            var point = points.selected[i];
            var layer = layers.getObjectByID(point.layer);
            point.color = layer.color;
            point.selected = false;
        }
        points.selected = [];
    },
    updateSelected:function(){
        var length = points.selected.length;
        for (var i = 0; i < length; i++) {
            var selected = points.selected[i];
            if (!selected) { continue;}
            if (!points.getObjectByID(selected.id)) {
                points.selected.splice(i, 1);
                length--;
                i--;

            }
        }
    },
    add: function (obj) {
        obj.id = this.id;
        obj.connectedLines = obj.connectedLines || [];
        obj.show = obj.show || true;
        //obj.layer = obj.leyer || layers.getActiveLayer().id;
        app.state.points.push(obj);
        this.idGenerator();
        return Points.getLast(1);
    },
    breakPoint:function(point){
        if (point.connectedLines.length < 2) { return; }
        var newPoints = [];
        for (var i = 0; i < point.connectedLines.length; i++) {
            var newPoint = points.add({ x: selected.x, y: selected.y });
            var cl = selected.connectedLines[i];
            var line = lines.getObjectByID(cl.id);
            line[cl.side].id = newPoint.id;
            newPoint.connectedLines.push({ id: cl.id, side: cl.side });
            newPoints.push(newPoint);
        }
        canvas.points.splice(points.getIndexByID(point.id), 1);
        return newPoints;
    },
    getConnectedPoints:function(point){
        var list = [];
        for(var i = 0; i < point.connectedLines.length; i++){
            var connectedLine = point.connectedLines[i];
            var line = lines.getObjectByID(connectedLine.id);
            var side = connectedLine.side;
            var otherSide = (side === "start")?"end":"start";
            list.push(lines.getPointBySide(line,otherSide));
        }
        return list;
    },
    remove: function (point,modifySidePoints) {
        if (point === false) {return;}
        var index = points.getIndexByID(point.id);
        if (index === false) {
            return;
        }
        if(modifySidePoints === true){var connectedPoints = points.getConnectedPoints(point);}
        while(point.connectedLines.length > 0){
            lines.remove(lines.getObjectByID(point.connectedLines[0].id));
        }
        
        canvas.points.splice(index, 1);
        if(modifySidePoints === true){
            if(connectedPoints.length === 2){
                points.connect(connectedPoints[0],connectedPoints[1]);
            }
            else if(connectedPoints.length === 1 && connectedPoints[0].connectedLines.length === 0){
                points.remove(connectedPoints[0]);
            }
            
        }
    },
    getIndexByID: function (id) {
        for (var i = 0; i < canvas.points.length; i++) {
            if (canvas.points[i].id === id) {
                return i;
            }
        }
        return false;
    },
    getObjectByID: function (id) {
        var index = points.getIndexByID(id);
        if (index === false) {
            return false;
        }
        return canvas.points[index];
    },
    getLast: function (n) {
        if (app.state.points.length < n) {
            throw new ("error 1004");
        }
        return app.state.points[app.state.points.length - n];
    },
    getNextID: function (n) {
        return (parseInt(this.id) + n - 1) + "p";
    },
    moveTo: function (obj, x, y) {
        obj.x = x;
        obj.y = y;
        for (var i = 0; i < obj.connectedLines.length; i++) {
            var connectedLine = obj.connectedLines[i];
            var line = lines.getObjectByID(connectedLine.id);
            line[connectedLine.side].x = x;
            line[connectedLine.side].y = y;
        }
    },
    moveBy: function (obj, x, y) {
        points.moveTo(obj, obj.x + x, obj.y + y);
    },
    getCommonLine: function (f, s) {
        for (var i = 0; i < f.connectedLines.length; i++) {
            for (var j = 0; j < s.connectedLines.length; j++) {
                var fcl = f.connectedLines[i];
                var scl = s.connectedLines[j];
                if (fcl.id === scl.id) { return lines.getObjectByID(fcl.id); }
            }
        }
        return false;
    },
    rotateTo: function (point, radian, center) {
        var coords = this.getCoordsByRotate(point, radian, center);
        this.moveTo(point, coords.x, coords.y);
    },
    
    removeConnectedLine: function (point, id) {
        for (var i = 0; i < point.connectedLines.length; i++) {
            var cl = point.connectedLines[i];
            if (cl.id === id) {
                point.connectedLines.splice(i, 1);
                return true;
            }
        }
        return false;
    },
    getConnectedLineByFilterID:function(point,id){
        for(var i = 0; i < point.connectedLines.length; i++){
            var connectedLine = point.connectedLines[i];
            if(connectedLine.id === id){continue;}
            return lines.getObjectByID(connectedLine.id);
        }
        return false;
    },
    getCoordsByRotate: function (point, radian, center) {
        var length = lines.getLength({
            start: point,
            end: center
        });
        radian = radian % 360;
        var sin = Math.sin(radian * Math.PI / 180);
        var cos = Math.cos(radian * Math.PI / 180);
        if (radian == 90) {
            cos = 0;
        } else if (radian == 180) {
            sin = 0;
        } else if (radian == 270) {
            cos = 0;
        }
        var deltaX = cos * length;
        var deltaY = sin * length * -1;
        return {
            x: deltaX + center.x,
            y: deltaY + center.y
        };
    },
    merge: function (f,s, coords) {
        if(points.isConnect(f,s)){
            return points.mergeConnected(f,s,coords);
        }
        else if(f.connectedLines.length === 1 && s.connectedLines.length === 1){
            return points.mergeOpen(f, s, coords);
        }
        else {
            return false;
        }
        
    },
    mergeConnected:function(f,s, coords){
        coords = coords || points.getCenterOfList([f,s]);
        var commonLine = points.getCommonLine(f,s);
        lines.remove(commonLine);
        var connectedLines = [];
        for (var i = 0; i < f.connectedLines.length; i++){
            connectedLines.push(f.connectedLines[i]);
        }
        for (var i = 0; i < s.connectedLines.length; i++){
            connectedLines.push(s.connectedLines[i]);
        }
        points.moveTo(f,coords.x,coords.y);
        points.moveTo(s,coords.x,coords.y);
        var point = points.add({
            x:coords.x,y:coords.y,
            connectedLines:connectedLines,
        });
        for(var i = 0; i < point.connectedLines.length; i++){
            var cl = point.connectedLines[i];
            var line = lines.getObjectByID(cl.id);
            line[cl.side].id  = point.id;
        }
        canvas.points.splice(points.getIndexByID(f.id),1);
        canvas.points.splice(points.getIndexByID(s.id), 1);
        return point;
    },
    mergeOpen:function(f,s,coords){
        coords = coords || points.getCenterOfList([f, s]);
        var connectedLines = [];
        for (var i = 0; i < f.connectedLines.length; i++) {
            connectedLines.push(f.connectedLines[i]);
        }
        for (var i = 0; i < s.connectedLines.length; i++) {
            connectedLines.push(s.connectedLines[i]);
        }
        points.moveTo(f, coords.x, coords.y);
        points.moveTo(s, coords.x, coords.y);
        var point = points.add({
            x: coords.x, y: coords.y,
            connectedLines: connectedLines,
        });
        for (var i = 0; i < point.connectedLines.length; i++) {
            var cl = point.connectedLines[i];
            var line = lines.getObjectByID(cl.id);
            line[cl.side].id = point.id;
        }
        canvas.points.splice(points.getIndexByID(f.id), 1);
        canvas.points.splice(points.getIndexByID(s.id), 1);
        return point;
    },
    isConnect: function (f, s) {
        var fLinesID = [];
        for (var i = 0; i < f.connectedLines.length; i++) {
            fLinesID.push(f.connectedLines[i].id);
        }
        var sLinesID = [];
        for (var i = 0; i < s.connectedLines.length; i++) {
            sLinesID.push(s.connectedLines[i].id);
        }
        for (var i = 0; i < fLinesID.length; i++) {
            if (sLinesID.indexOf(fLinesID[i]) !== -1) {
                return true;
            }
        }
        return false;
    },
    connect: function (f, s) {
        if (f.id === s.id) {
            return false;
        }
        if (points.isConnect(f, s)) {
            return false;
        }
        if (f.connectedLines.length < 2 && f.layer === s.layer) {
            f.connectedLines.push({
                id: lines.getNextID(1),
                side: "start"
            });
            var lineStartID = f.id;
        } else {
            var lineStartID = points.getNextID(1);
            points.add({
                x: f.x,
                y: f.y,
                connectedLines: [{
                    id: lines.getNextID(1),
                    side: "start"
                }]
            });
        }
        if (s.connectedLines.length < 2 && f.layer === s.layer) {
            s.connectedLines.push({
                id: lines.getNextID(1),
                side: "end"
            });
            var lineEndID = s.id;
        } else {
            var lineEndID = points.getNextID(1);
            points.add({
                x: s.x,
                y: s.y,
                connectedLines: [{
                    id: lines.getNextID(1),
                    side: "end"
                }]
            });
        }
        lines.add({
            start: {
                x: f.x,
                y: f.y,
                id: lineStartID
            },
            end: {
                x: s.x,
                y: s.y,
                id: lineEndID
            }
        });
    },
    getCenterOfSelected: function () {
        var length = points.selected.length;
        if (length === 0) {
            return false;
        }
        var minX = points.selected[0].x,
            maxX = points.selected[0].x,
            minY = points.selected[0].y,
            maxY = points.selected[0].y;
        for (var i = 0; i < length; i++) {
            var point = points.selected[i];
            minX = Math.min(minX, point.x);
            minY = Math.min(minY, point.y);
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
        }
        return {
            x: (minX + maxX) / 2,
            y: (minY + maxY) / 2
        };
    },
    getCenterOfList: function (list) {
        var length = list.length;
        if (length === 0) {
            return false;
        }
        var minX = list[0].x,
            maxX = list[0].x,
            minY = list[0].y,
            maxY = list[0].y;
        for (var i = 0; i < length; i++) {
            var point = list[i];
            minX = Math.min(minX, point.x);
            minY = Math.min(minY, point.y);
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
        }
        return {
            x: (minX + maxX) / 2,
            y: (minY + maxY) / 2
        };
    },
}