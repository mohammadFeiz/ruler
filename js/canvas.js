function Canvas(config) {
    var a = {
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
            this.setScreen(s.screenPosition);
        },
        getClient: function (e, axis) {
            axis = axis.toUpperCase();
            return e.clientX ? e["client" + axis] : e.changedTouches[0]["client" + axis];
        },
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
        clientToCanvas: function (coords) { var s = this.state; return { x: (coords.x - s.translate.x) / s.zoom, y: (coords.y - s.translate.y) / s.zoom }; },
        setScreenBy: function (obj) {
            var currentX = this.setScreenPosition.x, currentY = this.setScreenPosition.y;
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
                ctx.save();
                ctx.beginPath();
                ctx.font = this.fontSize / this.zoom + "px arial";
                ctx.translate(Math.min(obj.x1, obj.x2) + (Math.abs(obj.x1 - obj.x2) / 2), Math.min(obj.y1, obj.y2) + (Math.abs(obj.y1 - obj.y2) / 2));
                ctx.rotate(Math.atan((obj.y2 - obj.y1) / (obj.x2 - obj.x1)));
                ctx.textAlign = "center";
                ctx.fillStyle = "yellow";
                ctx.fillText(Math.sqrt(Math.pow(obj.x1 - obj.x2, 2) + Math.pow(obj.y1 - obj.y2, 2)).toFixed(1), 0, -3);
                ctx.closePath();
                ctx.restore();
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
            ctx.rotate(obj.angle * Math.PI / 180);
            ctx.textAlign = obj.textAlign;
            ctx.fillStyle = obj.color;
            ctx.fillText(obj.text, 0, 0);
            ctx.closePath();
            ctx.restore();
        },
        drawArc: function (obj) {
            var ctx = this.ctx;
            ctx.beginPath();
            ctx.arc(obj.x, obj.y, obj.radius, obj.start || 0, obj.end || 2 * Math.PI);
            if (obj.mode === "fill") {
                ctx.fillStyle = obj.color;
                ctx.fill();
            } else {
                ctx.lineWidth = (obj.lineWidth ? obj.lineWidth : 1) / this.zoom;
                ctx.strokeStyle = obj.color;
                ctx.stroke();
            }
            ctx.closePath();
        },
        drawRectangle: function (obj) {
            var ctx = this.ctx;
            ctx.beginPath();
            ctx.rect(obj.x - obj.width / 2, obj.y - obj.height / 2, obj.width, obj.height);
            if (obj.mode === "fill") {
                canvas.ctx.fillStyle = obj.color || "#000";
                canvas.ctx.fill();
            } else {
                ctx.lineWidth = (obj.lineWidth ? obj.lineWidth : 1) / this.zoom;
                ctx.strokeStyle = obj.color;
                ctx.stroke();
            }
            canvas.ctx.closePath();
        },

        setZoom: function (zoom) {
            this.zoom = zoom;
            canvas.setScreenPosition({
                x: canvas.screenPosition.x,
                y: canvas.screenPosition.y
            });
            this.redraw();
        },
        mousedown: function (e) {
            this.eventHandler("window", "move", this.mousemove);
            this.eventHandler("window", "up", this.mouseup);
            this.x = this.getClient(e, "x");
            this.y = this.getClient(e, "y");
            if (this.state.onmousedown) { this.state.onmousedown(); }
        },
        mousemove: function (e) {
            this.x = this.getClient(e, "x");
            this.y = this.getClient(e, "y");
            if (this.state.onmousemove) { this.state.onmousemove(); }
        },
        mouseup: function (e) {
            this.eventRemover("window", "move", this.mousemove);
            this.eventRemover("window", "up", this.mouseup);
            this.x = this.getClient(e, "x");
            this.y = this.getClient(e, "y");
            if (this.state.onmouseup) { this.state.onmouseup(); }
        },
        getScreenPosition:function(){
            return this.state.screenPosition;
        }
    }
    a.update(config);
    return {
        clear: a.clear.bind(a),
        drawLine: a.drawLine.bind(a),
        setScreenTo: a.setScreenTo.bind(a),
        drawText: a.drawText.bind(a),
        getMousePosition: a.getMousePosition.bind(a),
        getScreenPosition: a.getScreenPosition.bind(a),
        drawArc: a.drawArc.bind(a),
        canvasToClient: a.canvasToClient.bind(a),
        getSnapedCoords: a.getSnapedCoords.bind(a),
        getZoom:a.getZoom.bind(a)
    };
}
