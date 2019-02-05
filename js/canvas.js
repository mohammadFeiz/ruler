function Canvas(config) {
    var a = {
        isDown:false,
        state: {
            zoom: 1,
            snap: 1,
            screenPosition: { x: 0, y: 0 },
        },
        update: function (config) {
            var s = this.state;
            for (var prop in config) { s[prop] = config[prop]; }
            var container = $(s.container);
            this.ctx = container[0].getContext("2d");
            s.width = container[0].width = container.width();
            s.height = container[0].height = container.height();
            container.css({backgroundColor: s.background});
            if (s.gridLineColor) {
                container.css({
                    backgroundPosition: s.width / 2 / s.zoom + "px " + s.height / 2 / s.zoom + "px",
                    backgroundImage: 'linear-gradient(rgba(' + s.gridLineColor + ',0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(' + s.gridLineColor + ',0.5) 1px, transparent 1px), linear-gradient(rgba(' + s.gridLineColor + ',0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(' + s.gridLineColor + ',0.3) 1px, transparent 1px)',
                    backgroundSize: "100px 100px, 100px 100px, 10px 10px, 10px 10px",
                });
            }
            this.eventHandler(container, "mousedown", this.mousedown.bind(this));
            this.eventHandler(container, "dblclick", this.dblclick.bind(this));
            this.eventHandler("window", "mousedown", this.windowmosedown.bind(this));
            this.setScreen(s.screenPosition);
        },
        getClient: function (e) {return { x: e.clientX === undefined?e.changedTouches[0].clientX:e.clientX, y: e.clientY===undefined?e.changedTouches[0].clientY:e.clientY };},
        getZoom:function(){
            return this.state.zoom;
        },
        eventHandler: function (selector, e, action) {
            var mobileEvents = { down: "touchstart", move: "tocuhmove", up: "tocuhend" };
            var element = typeof selector === "string" ? (selector === "window" ? $(window) : $(selector)) : selector;
            var event = this.isMobile ? mobileEvents[e] : e;
            element.unbind(event, action.bind(this)).bind(event, action.bind(this));
        },
        eventRemover: function (selector, e, action) {
            var mobileEvents = { down: "touchstart", move: "tocuhmove", up: "tocuhend" };
            var element = typeof selector === "string" ? (selector === "window" ? $(window) : $(selector)) : selector;
            var event = this.isMobile ? mobileEvents[e] : e;
            element.unbind(event, action.bind(this));
        },
        getMousePosition: function () { return { x: (this.x - this.state.translate.x) / this.state.zoom, y: (this.y - this.state.translate.y) / this.state.zoom }; },
        getSnapedCoords: function (coords) {
            coords = coords || this.getMousePosition();
            return { x: Math.round(coords.x / this.state.snap) * this.state.snap, y: Math.round(coords.y / this.state.snap) * this.state.snap };
        },
        canvasToClient: function (coords) { var s = this.state; return { x: (coords.x * s.zoom) + s.translate.x, y: (coords.y * s.zoom) + s.translate.y }; },
        clientToCanvas: function (coords) {
            var s = this.state;
            return {
                x: (coords.x - s.translate.x) / s.zoom,
                y: (coords.y - s.translate.y) / s.zoom
            };
        },
        setScreenBy: function (obj) {
            var currentX = this.state.screenPosition.x, currentY = this.state.screenPosition.y;
            var x = obj.x === undefined ? 0 : currentX + obj.x;
            var y = obj.y === undefined ? 0 : currentY + obj.y;
            this.setScreenTo({ x: x, y: y, animate: obj.animate, callback: obj.callback });
        },
        setScreenTo: function (obj) {
            var self = this,s=this.state;
            if (this.screenMoving) { return; }
            var currentX = s.screenPosition.x, currentY = s.screenPosition.y;
            var x = obj.x === undefined ? currentX : obj.x;
            var y = obj.y === undefined ? currentY : obj.y;
            if (!obj.animate) { this.setScreen({ x: x, y: y, callback: obj.callback }); }
            else {
                this.screenMoving = true;
                var interVal, counter = 1, moveX = (x - currentX) / 50, moveY = (y - currentY) / 50;
                interVal = setInterval(function () {
                    self.setScreen({ x: currentX + (counter*moveX), y: currentY + (counter*moveY),callback:obj.callback });
                    if (counter === 50) {
                        clearInterval(interVal);
                        self.setScreen({ x: x, y: y, callback: obj.callback });
                        self.screenMoving = false;
                        return;
                    }
                    counter++;
                }, 1);
            }
        },
        setScreen: function (obj) {
            var x = obj.x, y = obj.y,s = this.state,ctx = this.ctx;
            s.screenPosition = { x: x, y: y };
            s.translate = { x: (s.width / 2) - (x * s.zoom), y: (s.height / 2) - (y * s.zoom * -1) };
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.translate(s.translate.x, s.translate.y);
            ctx.scale(s.zoom, s.zoom);
            $("canvas").css({ "background-position": s.translate.x + "px " + s.translate.y + "px" });
            if (obj.callback) { obj.callback();}
        },
        callback: function () {
            this.clear();
            this.drawLine({ start: {x:0,y:0},end: {x:100,y:100}});
        },
        clear: function () {
            this.ctx.save();
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.clearRect(0, 0, this.state.width, this.state.height);
            this.ctx.restore();
        },
        drawLine: function (obj) {
            var ctx = this.ctx,
                x1 = obj.start.x, y1 = obj.start.y,
                x2 = obj.end.x, y2 = obj.end.y, color = obj.color || "#000", lineWidth = obj.lineWidth || 1;
            if (!obj.lineDash) {
                ctx.beginPath();
                ctx.strokeStyle = color;
                ctx.lineWidth = lineWidth / this.zoom;
                ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
                ctx.stroke();
                ctx.closePath();
            }
            else {
                ctx.save();
                ctx.beginPath();
                ctx.setLineDash(obj.lineDash);
                ctx.strokeStyle = color;
                ctx.lineWidth = lineWidth / this.zoom;
                ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
                ctx.stroke();
                ctx.closePath();
                ctx.restore();
            }
            if (obj.showDimension) {
                var center = this.get.line.center(obj);
                this.drawText({x:center.x,y:center.y,text:this.get.line.length(obj).toFixed(1),angle:this.getTextAngle(obj),textBaseLine:"bottom",color:obj.color,textAlign:"center"});
            }
        },
        getTextAngle:function(line){
            return Math.atan((line.end.y - line.start.y) / (line.start.x - line.end.x)) /Math.PI * 180;
        },
        get:{
            line: {
                length: function (line) {return Math.sqrt(Math.pow(line.start.x - line.end.x, 2) + Math.pow(line.start.y - line.end.y, 2));},
                center: function (line) {
                    return {
                        x: Math.min(line.start.x, line.end.x) + Math.abs(line.start.x - line.end.x) / 2,
                        y: Math.min(line.start.y, line.end.y) + Math.abs(line.start.y - line.end.y) / 2
                    };
                },
                dip:function(line){return line.start.x === line.end.x?'infinity':(line.start.y - line.end.y) / (line.start.x - line.end.x);},
                meet: function (f, s) {
                    var fDip = a.get.line.dip(f),sDip = a.get.line.dip(s);
                    if (fDip === "infinity" && sDip === "infinity") { return false; }
                    else if (fDip == "infinity") { return { x: f.start.x, y: (sDip * (f.start.x - s.start.x)) + s.start.y }; }
                    else if (sDip == "infinity") { return { x: s.start.x, y: (fDip * (s.start.x - f.start.x)) + f.start.y }; }
                    else if (Math.abs(fDip - sDip) < 0.0001) { return false; }
                    else {
                        var x = (s.start.y - f.start.y + (fDip * f.start.x) - (sDip * s.start.x)) / (fDip - sDip);
                        var y = (fDip * (x - f.start.x)) + f.start.y;
                        return { x: x, y: y };
                    }
                },
                angle: function (line) {
                    var length = a.get.line.length(line),cos = (line.end.x - line.start.x) / length,sin = (line.end.y - line.start.y) / length,angle = Math.acos(cos) / Math.PI * 180;
                    if (line.end.y < line.start.y) { angle = 360 - angle; }
                    return 360 - angle;
                },
                xByY: function (line, y, dip) {
                    dip = dip || a.get.dip(line);
                    if (dip === "infinity") { return line.start.x; }
                    if (dip === 0) { return false; }
                    return (y + (dip * line.start.x) - line.start.y) / dip;
                },
                yByX: function (line, x, dip) {
                    dip = dip || a.get.dip(line);
                    if (dip === "infinity") { return false };
                    return (dip * x) - (dip * line.start.x) + line.start.y;
                },
            }

        },
        drawText: function (obj) {//x,y,text,angle,textBaseLine,color,textAlign
            var ctx = this.ctx;
            obj.angle = obj.angle || 0;
            obj.textBaseLine = obj.textBaseLine || "middle";
            obj.fontSize = obj.fontSize || 12;
            ctx.save();
            ctx.beginPath();
            ctx.textBaseline = obj.textBaseLine;
            ctx.font = (obj.fontSize / this.state.zoom) + "px arial";
            ctx.translate(obj.x, obj.y);
            ctx.rotate(obj.angle * Math.PI / -180);
            ctx.textAlign = obj.textAlign;
            ctx.fillStyle = obj.color;
            ctx.fillText(obj.text, 0, 0);
            ctx.closePath();
            ctx.restore();
        },
        //required: x(number) , y(number) , radius(number) 
        //optional: fill(string color) , stroke(string color) , lineWidth(number)(default:1) , start(number)(default=0) , end(number)(default=2*Math.PI)
        drawArc: function (obj) {
            obj.lineWidth = obj.lineWidth || 1;
            obj.start = obj.start === undefined ? 0 : obj.start;
            obj.end = obj.end === undefined ? 2 * Math.PI : obj.end;
            var ctx = this.ctx;
            ctx.beginPath();
            ctx.arc(obj.x, obj.y, obj.radius, obj.start, obj.end);
            ctx.lineWidth = obj.lineWidth / this.zoom;
            if (obj.fill) {ctx.fillStyle = obj.fill; ctx.fill();}
            if(obj.stroke){ctx.strokeStyle = obj.stroke; ctx.stroke();}
            ctx.closePath();
        },
        //required: x(number) , y(number) , width(number) , height(number) 
        //optional: center(boolean)(default:false) , fill(string color) , stroke(string color) , lineWidth(number)(default:1)
        drawRectangle: function (obj) { 
            obj.center = obj.center === undefined ? false : obj.center;
            obj.lineWidth = obj.lineWidth || 1;
            var ctx = this.ctx;
            ctx.beginPath();
            if (obj.center) {ctx.rect(obj.x - obj.width / 2, obj.y - obj.height / 2, obj.width, obj.height);}
            else {ctx.rect(obj.x, obj.y, obj.width, obj.height);}
            ctx.lineWidth = obj.lineWidth / this.zoom;
            if (obj.fill) {ctx.fillStyle = obj.fill; ctx.fill();}
            if(obj.stroke) {ctx.strokeStyle = obj.stroke; ctx.stroke();}
            ctx.closePath();
        },

        setZoom: function (zoom) {
            this.zoom = zoom;
            canvas.setScreenPosition({
                x: canvas.screenPosition.x,
                y: canvas.screenPosition.y
            });
            this.redraw();
        },
        windowmosedown:function(){
            this.isDown = true;
        },
        dblclick:function(e){
            if (this.state.ondblclick) { this.state.ondblclick(e); }
        },
        mousedown: function (e) {
            this.eventHandler("window", "mousemove", this.mousemove);
            this.eventHandler("window", "mouseup", this.mouseup);
            var client = this.getClient(e);
            this.x = client.x;
            this.y = client.y;
            if (this.state.onmousedown) { this.state.onmousedown(e); }
        },
        mousemove: function (e) {
            var client = this.getClient(e);
            this.x = client.x;
            this.y = client.y;
            if (this.state.onmousemove) { this.state.onmousemove(e); }
        },
        mouseup: function (e) {
            this.isDown = false;
            this.eventRemover("window", "mousemove", this.mousemove);
            this.eventRemover("window", "mouseup", this.mouseup);
            var client = this.getClient(e);
            this.x = client.x;
            this.y = client.y;
            if (this.state.onmouseup) { this.state.onmouseup(e); }
        },
        getScreenPosition:function(){
            return this.state.screenPosition;
        },
        getIsDown:function(){
            return this.isDown;
        },
        getWidth: function () { return this.state.width; },
        getHeight: function () { return this.state.height; },
        getSnap: function () {
            return this.state.snap;
        },
        setSnap: function (value) {
            this.state.snap = value;
        }

    }
    a.update(config);
    return {
        clear: a.clear.bind(a),
        drawLine: a.drawLine.bind(a),
        drawArc: a.drawArc.bind(a),
        drawRectangle: a.drawRectangle.bind(a),
        setScreenTo: a.setScreenTo.bind(a),
        setScreenBy: a.setScreenBy.bind(a),
        drawText: a.drawText.bind(a),
        getMousePosition: a.getMousePosition.bind(a),
        getScreenPosition: a.getScreenPosition.bind(a),
        canvasToClient: a.canvasToClient.bind(a),
        clientToCanvas:a.clientToCanvas.bind(a),
        getSnapedCoords: a.getSnapedCoords.bind(a),
        getZoom: a.getZoom.bind(a),
        getWidth: a.getWidth.bind(a),
        getHeight: a.getHeight.bind(a),
        getIsDown: a.getIsDown.bind(a),
        getSnap: a.getSnap.bind(a),
        setSnap: a.setSnap.bind(a),
        get:a.get,
    };
}
