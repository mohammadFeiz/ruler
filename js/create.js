function spline(obj) {
    var a = {
        state: {
            lineWidth: 1,
            color: "#000",
            min: 1,
            lines: [],
            points:[]
        },
        init: function (obj) {
            for (var prop in obj) { this.state[prop] = obj[prop];}
            //var layer = layers.getActiveLayer();
            this.state.start = obj.start;
            this.state.mode = obj.mode;
            //this.color = layer.color;
            //this.layer = layer.id;
            this.state.isClosed = ["rectangle", "ngon", "frame"].indexOf(this.state.mode) !== -1;
        },
        mode: null, minLength: 5, points: [], lines: [], layer: null, color: "#fff", lineWidth: 1, start: null, previewLines: [],
        startOffset: null,
        preview: function (coords) {
            if (lines.getLength({ start: this.start, end: coords }) < 5) { return; }
            this.previewLines = this.getPreview[this.mode](coords);
            this.drawPreview();
            this.drawHelp();
        },
        getPreview: {
            polyline: function (coords) { return [{ start: { x: a.start.x, y: a.start.y }, end: { x: coords.x, y: coords.y } }] },
            rectangle: function (coords) {
                return [
                    { start: { x: a.start.x, y: a.start.y }, end: { x: coords.x, y: a.start.y } },
                    { start: { x: coords.x, y: a.start.y }, end: { x: coords.x, y: coords.y } },
                    { start: { x: coords.x, y: coords.y }, end: { x: a.start.x, y: coords.y } },
                    { start: { x: a.start.x, y: coords.y }, end: { x: a.start.x, y: a.start.y } },
                ]
            },
            ngon: function (coords) {
                var sides = create.ngonSides, start = a.start, ortho = create.ngonOrtho;
                if (ortho !== true) {
                    var line = { start: { x: start.x, y: start.y }, end: { x: coords.x, y: coords.y } };
                    var sign = 1;
                }
                else {
                    if (Math.abs(start.x - coords.x) >= Math.abs(start.y - coords.y)) {
                        var sign = Math.sign(coords.x - start.x) * Math.sign(coords.y - start.y) || 1;
                        var line = { start: { x: start.x, y: start.y }, end: { x: coords.x, y: start.y } };
                    }
                    else {
                        var sign = Math.sign(coords.x - start.x) * Math.sign(start.y - coords.y) || 1;
                        var line = { start: { x: start.x, y: start.y }, end: { x: start.x, y: coords.y } };
                    }
                }
                var radian = lines.getRadian(line);
                var length = lines.getLength(line);
                var points = [start];
                var preview = [];
                var xs = start.x; var ys = start.y;
                var aa = 360 / sides * Math.PI / 180, b = radian * Math.PI / 180;
                for (var i = 0; i < sides - 1; i++) {
                    xs += (Math.cos(aa * i * sign - b) * length);
                    ys += (Math.sin(aa * i * sign - b) * length);
                    points.push({ x: xs, y: ys });
                    preview.push({ start: { x: points[i].x, y: points[i].y }, end: { x: points[i + 1].x, y: points[i + 1].y } });
                    if (i === sides - 2) {
                        preview.push({ start: { x: points[i + 1].x, y: points[i + 1].y }, end: { x: points[0].x, y: points[0].y } });
                    }
                }
                return preview;
            }
        },
        drawPreview: function () {
            for (var i = 0; i < this.previewLines.length; i++) {
                var line = this.previewLines[i];
                canvas.drawLine({
                    x1: line.start.x, y1: line.start.y, x2: line.end.x, y2: line.end.y,
                    color: "yellow", size: this.lineWidth / canvas.zoom, showDimention: true, lineDash: [4, 4]
                });
            }
        },
        savePreview: function () {
            for (var i = 0; i < a.previewLines.length; i++) {
                var p = a.previewLines[i];
                a.points.push({ x: p.start.x, y: p.start.y });
                a.lines.push({ start: { x: p.start.x, y: p.start.y }, end: { x: p.end.x, y: p.end.y } });
            }
            canvas.redraw(); this.draw(); this.drawHelp();
        },
        draw: function () {
            for (var i = 0; i < this.points.length; i++) { var point = this.points[i]; this.drawPoint(point); }
            for (var i = 0; i < this.lines.length; i++) { var line = this.lines[i]; this.drawLine(line); }
        },
        drawPoint: function (point) { canvas.drawArc({ x: point.x, y: point.y, radius: 2 / canvas.zoom, color: "#fff", mode: "fill" }); },
        drawLine: function (line) { canvas.drawLine({ x1: line.start.x, y1: line.start.y, x2: line.end.x, y2: line.end.y, color: this.color, size: 1 / canvas.zoom, showDimention: false, }); },
        drawHelp: function () {
            var point = this.start;
            var size = 3 / canvas.zoom;
            var x = point.x, y = point.y;
            canvas.drawArc({ x: x, y: y, radius: size, color: "orange", mode: "fill" });
            canvas.drawArc({ x: x, y: y, radius: size * 2, color: "orange", mode: "stroke", lineWith: 1 });
        },
        setController: function () {
            var control = { end: true, keyboard: true, move: true,pan:true };
            control.close = this.mode === "polyline" && this.points.length > 1;
            control.join = this.mode === "polyline" && this.lines.length > 2 && lines.getMeet(this.lines[0], this.lines[this.lines.length - 1]) !== false;
            control.remove = this.mode === "polyline" && this.points.length > 0;
            control.coords = a.start;
            createControl.open(control);
        },
        end: function () {
            create.newSpline = true;
            var lastLine = a.lines[a.lines.length - 1];
            if (!this.isClosed) { a.points.push({ x: lastLine.end.x, y: lastLine.end.y }); }
            var pointlist = [], linelist = [];
            for (var i = 0; i < a.points.length; i++) {
                var point = a.points[i], nextPoint = a.points[i + 1], line = a.lines[i];
                pointlist.push(points.add({ x: point.x, y: point.y, layer: a.layer }));
                if (line) { linelist.push(lines.add({ start: { x: line.start.x, y: line.start.y }, end: { x: line.end.x, y: line.end.y }, layer: a.layer })); }
            }
            for (var i = 0; i < pointlist.length; i++) {
                var point = pointlist[i], beforeline = linelist[i - 1], line = linelist[i];
                if (beforeline) { point.connectedLines.push({ id: beforeline.id, side: "end" }); }
                else {
                    if (this.isClosed) {
                        beforeline = linelist[linelist.length - 1];
                        point.connectedLines.push({ id: beforeline.id, side: "end" });
                    }
                }
                if (line) { point.connectedLines.push({ id: line.id, side: "start" }); }
                else {
                    if (this.isClosed) {
                        line = linelist[0];
                        point.connectedLines.push({ id: line.id, side: "start" });
                    }
                }
            }
            for (var i = 0; i < linelist.length; i++) {
                var line = linelist[i], startPoint = pointlist[i], endPoint = pointlist[i + 1];
                line.start.id = startPoint.id;
                if (endPoint) { line.end.id = endPoint.id; }
                else { line.end.id = pointlist[0].id; }
            }
            createControl.close();
            canvas.redraw();
            create.currentSpline = null;
            app.test();
        },
        move: function (e) {
            app.eventHandler("window", "mousemove", a.movemousemove);
            app.eventHandler("window", "mouseup", a.movemouseup);
            var lastPoint = a.getLastPoint() || a.start;
            this.startOffset = { x: app.getClient(e, "X"), y: app.getClient(e, "Y"), endX: lastPoint.x, endY: lastPoint.y };
        },
        movemousemove: function (e) {
            a.start = canvas.getSnapXY({
                x: (app.getClient(e, "X") - a.startOffset.x) / canvas.zoom + a.startOffset.endX,
                y: (app.getClient(e, "Y") - a.startOffset.y) / canvas.zoom + a.startOffset.endY
            });
            var lastPoint = a.getLastPoint();
            if (lastPoint) {lastPoint.x = a.start.x;lastPoint.y = a.start.y;}
            canvas.redraw(); a.draw(); a.drawHelp(); createControl.move(a.start);
        },
        movemouseup: function () {
            app.eventRemover("window", "mousemove", a.movemousemove);
            app.eventRemover("window", "mouseup", a.movemouseup);
            var point = canvas.findPointByCoords({ coords: a.start, area: create.snapArea }) || a.findPointByCoords({ coords: a.start, area: create.snapArea });
            if (point) {
                var lastPoint = a.getLastPoint() || a.start;
                lastPoint.x = point.x;
                lastPoint.y = point.y;
            }
            create.screenCorrection(function () {
                a.update();
            });
        },
        pan: function (e) {
            app.eventHandler("window", "mousemove", a.panmousemove);
            app.eventHandler("window", "mouseup", a.panmouseup);
            this.startOffset = {
                X: app.getClient(e, "X"), Y: app.getClient(e, "Y"), x: canvas.screenPosition.x,
                y: canvas.screenPosition.y
            };
        },
        panmousemove: function (e) {
            
            canvas.setScreenPosition({
                x: (a.startOffset.X - app.getClient(e, "X")) / canvas.zoom + (a.startOffset.x),
                y: ((app.getClient(e, "Y") - a.startOffset.Y) / canvas.zoom + (a.startOffset.y))
            });
            canvas.redraw(); a.draw(); a.drawHelp(); createControl.move(a.start);
        },
        panmouseup: function () {
            app.eventRemover("window", "mousemove", a.panmousemove);
            app.eventRemover("window", "mouseup", a.panmouseup);
        },
        update: function () {
            var lastPoint = a.getLastPoint();
            if (lastPoint) { a.start.x = lastPoint.x; a.start.y = lastPoint.y; }
            canvas.redraw(); a.draw(); a.drawHelp(); a.setController();
        },
        
        findPointByCoords: function (obj) {
            obj = obj || {};
            var coords = obj.coords;
            var area = obj.area || 18 / canvas.zoom;
            var x = coords.x, y = coords.y;
            var length = a.points.length;
            for (var i = 1; i < area; i += 2) {
                for (var j = 0; j < length; j++) {
                    var point = a.points[j];
                    if (Math.abs(point.x - x) > i || Math.abs(point.y - y) > i) { continue; }
                    return point;
                }
            }
            return false;
        },
        moveLastPointTo: function (coords) {a.start = { x: coords.x, y: coords.y }; a.update();},
        getLastPoint: function () {
            var lastLine = a.lines[a.lines.length - 1];
            if (!lastLine) { return false; }
            return lastLine.end;
        },
        close: function () {
            a.isClosed = true;
            var lastPoint = a.getLastPoint();
            var firstPoint = a.points[0];
            a.points.push({ x: lastPoint.x, y: lastPoint.y });
            a.lines.push({ start: { x: lastPoint.x, y: lastPoint.y }, end: { x: firstPoint.x, y: firstPoint.y } });
            a.end();
            createControl.close();
            canvas.redraw();
            create.newSpline = true;
        },
        join: function () {
            a.isClosed = true;
            var lastLine = a.lines[a.lines.length - 1];
            var firstLine = a.lines[0];
            var firstPoint = a.points[0];
            var meet = lines.getMeet(lastLine, firstLine);
            lastLine.end = { x: meet.x, y: meet.y };
            firstLine.start = { x: meet.x, y: meet.y };
            firstPoint.x = meet.x;
            firstPoint.y = meet.y;
            a.end();
            createControl.close();
            canvas.redraw();
            create.newSpline = true;
        },
        remove: function () {
            
            var firstPoint = a.points[0] || a.start;
            a.points.pop();
            a.lines.pop();
            a.start = a.getLastPoint() || firstPoint;
            create.screenCorrection(a.update);
        },
        keyboard: function () {
            keyboard.open({
                fields: [{ prop: "x", title: "X" }, { prop: "y", title: "y" }],
                subscribe: create.mouseup,
                negative: true,
                title: app.createmode + " to:",
                close: (a.mode === "ngon" || a.mode === "rectangle" || a.mode === "frame"),
            });
        },
    }
    a.init(obj);
    return a;
}


function polyline(config) {
    var a = {
        state: {
            points: [],
            color: "#000",
            close: false,
            extraData: {},
        },
        init: function (obj) {
            for (var prop in obj) { this.state[prop] = obj[prop]; }
            this.state.points.push(this.state.start);
        },
        addPoint: function (point) {
            var s = this.state , obj = {x:point.x,y:point.y,color:s.color};
            for (var prop in s.extraData) { obj[prop] = s.extraData[prop]; }
            s.points.push(obj);
        },
        removePoint: function (index) { this.state.points.splice(index, 1); },
        updatePoint:function(index,obj){
            var point = this.state.points[index];
            for (var prop in obj) {point[prop] = obj[prop];}
        },
        getLines: function () {
            var lines = [];
            for (var i = 1; i < this.state.points.length; i++) {
                var lastPoint = this.state.points[i - 1];
                var point = this.state.points[i];
                var line ={
                    start: { x: lastPoint.x, y: lastPoint.y },
                    end: { x: point.x, y: point.y },
                    color:this.state.color,
                };
                for (var prop in this.state.extraData) { line[prop] = this.state.extraData[prop]; }
                lines.push(line);
            }
            if (this.state.close) {
                var lastPoint = this.state.points[this.state.points.length - 1];
                var point = this.state.points[0];
                var line = {
                    start: { x: lastPoint.x, y: lastPoint.y },
                    end: { x: point.x, y: point.y },
                    color: this.state.color,
                };
                for (var prop in this.state.extraData) { line[prop] = this.state.extraData[prop]; }
                lines.push(line);
            }
            return lines;
        },
        close: function () {
            this.state.close = true;
        },
    };
    a.init(config);
    return a;
}

var createControl = {
    state: {},
    id: "draw-control",
    items: [
        { name: "move", text: "Move", className: "", fontSize: 10 },
        { name: "end", text: "End", className: "", fontSize: 10 },
        { name: "close", text: "Close", className: "", fontSize: 10 },
        { name: "join", text: "Join", className: "", fontSize: 10 },
        { name: "keyboard", text: "Keyboard", className: "", fontSize: 10 },
        { name: "remove", text: "Remove", className: "", fontSize: 10 },
        { name: "pan", text: "Pan", className: "", fontSize: 10 },
    ],
    style: {
        item_size: 36,
        distance: 80,
        angle: 40,
        start_angle: 90,
        font_color: app.style.lightFontColor,//read from style-genarator.js
        item_background: "rgba(255, 255, 255, 0.1)",
    },
    open: function (items) {
        this.close();
        this.state = {};
        for (var prop in items) { this.state[prop] = items[prop]; }
        this.render();
        var coords = app.canvas.canvasToClient(this.state.coords);
        $("#" + this.id).css({ left: coords.x, top: coords.y });
    },
    close: function () {
        $("#" + this.id).remove();
    },
    render: function () {
        function getStyle() {
            var str = '';
            str += 'position: fixed;';
            return str;
        }
        var str = '';
        str += '<div id="' + this.id + '" style="' + getStyle() + '">';
        var counter = 0;
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            if (this.state[item.name]) {
                item.counter = counter;
                str += CreateControlItem({
                    name: item.name,
                    className: item.className,
                    text: item.text,
                    fontSize: item.fontSize,
                    style: this.style,
                    counter: counter
                });
                counter++;
            }

        }
        str += '</div>';
        $("body").append(str);
        app.eventHandler(".draw-control-item", "mousedown", this.mousedown.bind(this));
    },
    mousedown: function (e) {
        var element = $(e.currentTarget);
        create[$(e.currentTarget).attr("id")](e);
    },
    move: function (coords) {
        var coords = canvas.convertCanvasXYToBodyXY({ x: coords.x, y: coords.y });
        this.container.css({ left: coords.x, top: coords.y });
    }
}

function CreateControlItem(props) {
    function getIconContainerStyle() {
        var str = '';
        str += 'position: absolute;';
        str += 'background:' + props.style.item_background + ';';
        str += 'border-radius:100%;';
        str += 'text-align:center;';
        str += 'width:' + props.style.item_size + 'px;';
        str += 'height:' + props.style.item_size + 'px;';
        str += 'color:' + props.style.font_color + ';';
        str += 'left:' + (props.style.distance * -1) + 'px;top:' + (props.style.item_size / -2) + 'px;';
        str += 'transform:rotate(' + (props.counter * props.style.angle + props.style.start_angle) + 'deg);';
        return str;
    }
    function getItemStyle() {
        var str = '';
        str += 'transform:rotate(' + (props.counter * -1 * props.style.angle - props.style.start_angle) + 'deg);';
        return str;
    }
    function getIconStyle() {
        var str = '';
        str += 'line-height:' + props.style.item_size + 'px;';
        str += 'font-size:' + props.fontSize + 'px;';
        return str;
    }
    var str = '';
    str += '<div id="drawcontrol' + props.name + '" class="draw-control-item" style="' + getItemStyle() + '">';
    str += '<div class="icon-container" style="' + getIconContainerStyle() + '">';
    str += '<span class="icon ' + props.className + '" style="' + getIconStyle() + '">' + props.text + '</span>';
    str += '</div>';
    str += '</div>';
    return str;
}






var create = {
    firstPoint: true,
    mousedown: function (obj) {
        this.mode = obj.mode;
        this[obj.mode].mousedown(obj.coords);
        this.preview();
    },
    end: function () {
        this.firstPoint = true;
        createControl.close();
        this.save();
        app.redraw();
    },
    polyline: {
        mousedown: function (coords) {
            if (create.firstPoint) {
                create.object = new polyline({ start: coords, color: "#fff" });
                create.firstPoint = false;
            }
            else {
                create.object.addPoint(coords);
            }
        },
        
    },
    preview: function () {
        var points = this.object.state.points;
        var lines = this.object.getLines();
        app.canvas.clear();
        for (var i = 0; i < points.length; i++) {
            var point = points[i];
            app.canvas.drawArc({
                x: point.x,
                y: point.y,
                radius: 2,
                color: point.color,
                mode: "fill"
            });
        }
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            app.canvas.drawLine({
                start: {
                    x: line.start.x,
                    y: line.start.y
                },
                end: {
                    x: line.end.x,
                    y: line.end.y
                },
                color: line.color
            });
        }
        this.drawLastPoint();
        this.drawController();
    },
    drawLastPoint: function () {
        var point = this.object.state.points[this.object.state.points.length - 1];
        var x = point.x, y = point.y;
        app.canvas.drawArc({ x: point.x, y: point.y, radius: 3, color: "orange", mode: "fill" });
        app.canvas.drawArc({ x: point.x, y: point.y, radius: 6, color: "orange", mode: "stroke" });
    },
    drawController: function () {
        var points = create.object.state.points;
        var lines = create.object.getLines();
        var lastPoint = points[points.length - 1];
        var control = { end: true, keyboard: true, move: true, pan: true };
        if (this.mode === "polyline") {
            control.close = points.length > 2;
            control.join = lines.length > 2 && Lines.getMeet(lines[0], lines[lines.length - 1]) !== false;
            control.remove =  points.length > 0;
        }
        control.coords = {x:lastPoint.x,y:lastPoint.y};
        createControl.open(control);
    },
    drawcontrolremove:function(){
        var points = this.object.state.points;
        points.pop();
        this.preview();
    },
    drawcontrolclose: function () {
        this.object.close();
        this.end();
    },
    drawcontrolmove:function(e){
        app.eventHandler("window", "mousemove", this.movemousemove.bind(this));
        app.eventHandler("window", "mouseup", this.movemouseup.bind(this));
        var points = create.object.state.points;
        var lines = create.object.getLines();
        var lastPoint = points[points.length - 1];
        this.startOffset = { x: app.getClient(e, "X"), y: app.getClient(e, "Y"), endX: lastPoint.x, endY: lastPoint.y };
    },
    movemousemove:function(e){
        var points = create.object.state.points;
        var lines = create.object.getLines();
        var lastPoint = points[points.length - 1];
        var coords = app.canvas.getSnapedCoords({
            x: (app.getClient(e, "X") - this.startOffset.x) / app.canvas.getZoom() + this.startOffset.endX,
            y: (app.getClient(e, "Y") - this.startOffset.y) / app.canvas.getZoom() + this.startOffset.endY
        });
        if (lastPoint) { lastPoint.x = coords.x; lastPoint.y = coords.y; }
        this.preview();
    },
    movemouseup: function () {
        $(window).unbind("mousemove", this.movemousemove.bind(this));
        $(window).unbind("mouseup", this.movemouseup.bind(this));
    },
    save: function () {
        var points = create.object.state.points;
        var lines = create.object.getLines();
        for (var i = 0; i < points.length; i++) {
            app.state.points.push(points[i]);
        }
        for (var i = 0; i < lines.length; i++) {
            app.state.lines.push(lines[i]);
        }
    },






























    currentSpline: null,
    snapArea: 15,
    ngonSides: 6,
    ngonOrtho: false,
    autoPanMode: true,
    autoPanInterval: null,
    
    


    autoPan: function (coords, callback) {
        if (!this.autoPanMode) { return; }
        var left = 40, right = 40, up = 40 + top_menu_size,//read from style-generator.js
            down = 40, speed = 1, x = coords.x, y = coords.y;
        if (x > canvas.width - right) { var horizontal = 1; }
        else if (x < left) { var horizontal = -1; }
        else { var horizontal = 0; }
        if (y > canvas.height - down) { var vertical = -1; }
        else if (y < up) { var vertical = 1; }
        else { var vertical = 0; }
        if (vertical || horizontal) {
            clearInterval(this.autoPanInterval);
            this.autoPanInterval = setInterval(function () {
                canvas.setScreenPosition({ offset: true, x: speed * horizontal, y: speed * vertical });
                callback();
            }, 10);
        }
        else { clearInterval(this.autoPanInterval); }
    },
    screenCorrection: function (callback) {
        var limit = createControl.style.distance;
        var lastPoint = create.currentSpline.getLastPoint() || create.currentSpline.start;
        console.log(create.currentSpline.start)
        var coords = canvas.convertCanvasXYToBodyXY(lastPoint);
        var x = coords.x, y = coords.y;
        if (x > canvas.width - limit) { var deltaX = x - canvas.width + limit; }
        else if (x < limit) { var deltaX = x - limit; }
        else { var deltaX = 0; }
        if (y > canvas.height - limit - 36) { var deltaY = y - canvas.height + limit + 36; }
        else if (y < limit + top_menu_size) { var deltaY = y - limit - top_menu_size; }
        else { var deltaY = 0; }
        deltaX /= canvas.zoom;
        deltaY /= canvas.zoom;
        canvas.setScreenPosition({ offset: true, x: deltaX, y: deltaY * -1, animate: true, callback: callback });
    },
    
    //end: function () { if (create.currentSpline) { create.currentSpline.end(); } },
    mousemove: function () {
        create.autoPan({ x: canvas.x, y: canvas.y }, create.mousemove);
        var coords = canvas.getSnapXY();
        canvas.redraw();
        create.currentSpline.draw();
        create.currentSpline.setPreview(coords);
    },
    mouseup: function (p) {
        var mousePosition = canvas.getSnapXY();
        var c = create.currentSpline;
        if (p) {
            var lastPoint = c.start;
            p.x = p.x + lastPoint.x;
            p.y = (p.y * -1) + lastPoint.y;
        }
        var point = canvas.findPointByCoords({ area: create.snapArea }) || c.findPointByCoords({ coords: mousePosition, area: create.snapArea });
        var coords = p || point || mousePosition;
        coords = { x: coords.x, y: coords.y };//prevent mutual on found point
        create.currentSpline.setPreview(coords);
        c.savePreview();
        c.start = coords;//for last snap
        create.screenCorrection(function () {
            c.update();
            if (c.isClosed && c.points.length > 0) {c.end();}
        });
    },
    setting: function () {
        var template = [
            { title: "Snap Size", value: create.snapArea, onchange: function (value) { create.snapArea = value; }, start: 1, step: 1, end: 30, }
        ];
        if (app.createmode === "ngon") {
            template.push({
                title: "Sides", value: create.ngonSides,
                onchange: function (value) { create.ngonSides = value; },
                start: 3, step: 1, end: 40,
            });
            template.push({
                title: "Ortho", value: create.ngonOrtho, text: ["ON", "OFF"],
                onchange: function (value) { create.ngonOrtho = value; },
            });
        }
        var A = new Alert({
            buttons: [{ title: "ok" }],
            template: template,
            title: app.createmode + " setting.",
        });
    },
    getExitLine: function (coords) {
        var exit = create.exit;
        if (app.createmode === "polyline") { var delta = { x: 0, y: 0 }; }
        else if (app.createmode === "doubleline") { var delta = lines.getDelta(exit, create.doubleline.thickness / 2); }
        var prep = lines.getPrependicularLine(exit, coords);
        var x = prep.start.x, y = prep.start.y;
        var maxX = Math.max(exit.start.x, exit.end.x) - delta.x;
        var minX = Math.min(exit.start.x, exit.end.x) + delta.x;
        var maxY = Math.max(exit.start.y, exit.end.y) - delta.y;
        var minY = Math.min(exit.start.y, exit.end.y) + delta.y;
        var deltaX = x > maxX ? maxX - x : (x < minX ? minX - x : 0);
        var deltaY = y > maxY ? maxY - y : (y < minY ? minY - y : 0);
        prep.start.x += deltaX;
        prep.end.x += deltaX;
        prep.start.y += deltaY;
        prep.end.y += deltaY;
        return prep;
    },
    frame: {
        measures: {
            innerFrameX: 5,
            innerFrameY: 5,
            outerFrameX: 10,
            outerFrameY: 10,
            x_count: 2,
            y_count: 2,
        },
        frames: [],
        frameLines: null,
        points: [],
        start: null,
        setPoints: function (coords) {
            var start = create.frame.start;
            create.frame.points = [{ x: start.x, y: start.y }];
            create.frame.points.push({ x: coords.x, y: start.y });
            create.frame.points.push({ x: coords.x, y: coords.y });
            create.frame.points.push({ x: start.x, y: coords.y });
            create.frame.frames = [];
            var start = create.frame.points[0];
            var end = create.frame.points[2];
            var ofx = create.frame.measures.outerFrameX;
            var ofy = create.frame.measures.outerFrameY;
            var infx = create.frame.measures.innerFrameX;
            var infy = create.frame.measures.innerFrameY;
            var hc = create.frame.measures.x_count;
            var vc = create.frame.measures.y_count;
            var width = end.x - start.x;
            var height = end.y - start.y;
            var hSign = Math.sign(width);
            var vSign = Math.sign(height);
            var frameWidth = (Math.abs(width) - (2 * ofx) - ((hc - 1) * infx)) / hc;
            var frameHeight = (Math.abs(height) - (2 * ofy) - ((vc - 1) * infy)) / vc;
            for (var i = 0; i < hc; i++) {
                for (var j = 0; j < vc; j++) {
                    var x = start.x + (ofx * hSign) + (i * frameWidth * hSign) + (i * infx * hSign);
                    var y = start.y + (ofy * vSign) + (j * frameHeight * vSign) + (j * infy * vSign);
                    create.frame.frames.push(
                        [
                            { x: x, y: y, },
                            { x: x + (frameWidth * hSign), y: y, },
                            { x: x + (frameWidth * hSign), y: y + (frameHeight * vSign), },
                            { x: x, y: y + (frameHeight * vSign), },
                        ]
                    );
                }
            }
        },
        mousedown: function () {
            var point = canvas.findPointByCoords({ area: create.snapArea });
            if (!create.snap) { point = false; }
            var coords = point || canvas.getSnapXY(); //get clicked coords 
            create.frame.start = create.frame.start || coords; //set start coords
            create.pointsStream = [create.frame.start];
            if (lines.getLength({ start: create.frame.start, end: coords }) >= create.min) { //check minimum of size
                create.frame.setPoints(coords);
                create.frame.preview();
            }
            create.drawPoint();
        },
        preview: function () {
            var sides = 4;
            if (create.frame.measures.outerFrameX !== 0 || create.frame.measures.outerFrameY !== 0) {
                for (var i = 0; i < sides; i++) {
                    create.drawLine.polyline({
                        start: create.frame.points[i],
                        end: create.frame.points[(i + 1) % sides]
                    });
                }
            }
            var frames = create.frame.frames;
            for (var i = 0; i < frames.length; i++) {
                var frame = frames[i];
                for (var j = 0; j < frame.length; j++) {
                    create.drawLine.polyline({
                        start: frame[j],
                        end: frame[(j + 1) % sides],
                        showDimention: (i === frames.length - 1) ? true : false,
                    });
                }
            }

        },
        mousemove: function () {
            canvas.redraw();
            var coords = canvas.getSnapXY();
            if (lines.getLength({ start: create.frame.start, end: coords }) < create.min) { return; }
            create.frame.setPoints(coords);
            create.frame.preview();
            create.drawPoint();
        },
        mouseup: function (coords) {
            create.frame.setPoints(coords);
            create.frame.addPointsAndLines();
            create.frame.reset();
            canvas.redraw();
            createControl.close();
        },
        addPointsAndLines: function () {
            var sides = 4;
            if (create.frame.measures.outerFrameX !== 0 || create.frame.measures.outerFrameY !== 0) {
                for (var i = 0; i < sides; i++) {
                    var framePoint = create.frame.points[i];
                    var point = points.add({
                        x: framePoint.x,
                        y: framePoint.y,
                        connectedLines: [
                            { id: lines.getNextID(1), side: "start" },
                            { id: (i === 0) ? lines.getNextID(sides) : lines.getLast(1).id, side: "end" },
                        ]
                    });
                    var line = lines.add({
                        start: { x: point.x, y: point.y, id: point.id },
                        end: {
                            x: create.frame.points[(i + 1) % sides].x, y: create.frame.points[(i + 1) % sides].y,
                            id: (i === sides - 1) ? points.getLast(sides).id : points.getNextID(1)
                        }
                    });
                }
            }
            for (var i = 0; i < create.frame.frames.length; i++) {
                var frame = create.frame.frames[i];
                for (var j = 0; j < frame.length; j++) {
                    var point = points.add({
                        x: frame[j].x,
                        y: frame[j].y,
                        connectedLines: [
                            { id: lines.getNextID(1), side: "start" },
                            { id: (j === 0) ? lines.getNextID(sides) : lines.getLast(1).id, side: "end" },
                        ]
                    });
                    var line = lines.add({
                        start: { x: point.x, y: point.y, id: point.id },
                        end: {
                            x: frame[(j + 1) % sides].x, y: frame[(j + 1) % sides].y,
                            id: (j === sides - 1) ? points.getLast(sides).id : points.getNextID(1)
                        }
                    });
                }
            }
            undo.save();
        },
        movemousedown: function (e) {
            create.startOffset = {
                x: app.getClient(e, "X"),
                y: app.getClient(e, "Y"),
                endX: create.frame.start.x,
                endY: create.frame.start.y
            };
        },
        move: function (e) {
            var coords = {
                x: app.getClient(e, "X"),
                y: app.getClient(e, "Y")
            };
            var so = create.startOffset;
            coords = {
                x: (coords.x - so.x) / canvas.zoom + so.endX,
                y: (coords.y - so.y) / canvas.zoom + so.endY
            };
            coords = canvas.getSnapXY(coords);
            create.frame.start.x = coords.x;
            create.frame.start.y = coords.y;

            createControl.move({ x: create.frame.start.x, y: create.frame.start.y });
            canvas.redraw();
            create.drawPoint();
        },
        setParameters: function (obj) {
            for (var prop in obj) {
                create.frame.measures[prop] = obj[prop];
            }
        },
        reset: function () {
            create.frame.start = null;
            create.pointsStream = [];
            create.frame.points = [];
        },
        setController: function () {
            var control = {
                end: true,
                keyboard: true,
                move: true,
            };
            createControl.open(control);
        },
    },
}