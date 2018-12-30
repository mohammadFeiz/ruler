function polyline(config) {
    var a = {
        state: {
            points: [],
            color: "#000",
            close: false,
            extraData: {},
        },
        init: function (obj) {
            for (var prop in obj) {
                this.state[prop] = obj[prop];
            }
            this.state.points.push(this.state.start);
        },
        addPoint: function (point) {
            var s = this.state,
                obj = {
                    x: point.x,
                    y: point.y,
                    color: s.color
                };
            for (var prop in s.extraData) {
                obj[prop] = s.extraData[prop];
            }
            s.points.push(obj);
        },
        removePoint: function (index) {
            this.state.points.splice(index, 1);
        },
        updatePoint: function (index, obj) {
            var point = this.state.points[index];
            for (var prop in obj) {
                point[prop] = obj[prop];
            }
        },
        getLines: function () {
            var s = this.state;
            var lines = [];
            var length = s.points.length + (s.close ? 1 : 0);
            for (var i = 1; i < length; i++) {
                var prevIndex = i - 1;
                var index = i;
                var lastPoint = s.points[prevIndex];
                var point = s.points[index] || s.points[0];
                var line = {
                    start: {
                        x: lastPoint.x,
                        y: lastPoint.y
                    },
                    end: {
                        x: point.x,
                        y: point.y
                    },
                    color: s.color,
                };
                for (var prop in s.extraData) {
                    line[prop] = s.extraData[prop];
                }
                lines.push(line);
            }
            return lines;
        },
        close: function () {
            this.state.close = true;
        },
        join: function () {
            var points = this.state.points;
            var lines = this.getLines();
            var firstLine = lines[0];
            var lastLine = lines[lines.length - 1];
            var meet = Lines.getMeet(lastLine,firstLine);
            points[0].x = points[points.length - 1].x = meet.x;
            points[0].y = points[points.length - 1].y = meet.y;
        },
        getLastPoint: function () {
            return this.state.points[this.state.points.length - 1];
        },
        to:function(obj){
            this.addPoint(obj);
        }
    };
    a.init(config);
    return a;
}

var create = {
    firstPoint: true,
    mousedown: function (obj) {
        app.eventHandler("window","mousemove",this.mousemove);
        app.eventHandler("window","mouseup",this.mouseup);
        this.mode = obj.mode;
        this[obj.mode + "mousedown"](obj.coords,obj.mode);
        this.preview();
    },
    end: function () {
        this.firstPoint = true;
        createControl.close();
        this.save();
        app.redraw();
    },
    polylinemousedown: function (coords,mode) {
        if (create.firstPoint) {
            create.object = new polyline({start: coords,color: "#fff",mode:mode});
            create.firstPoint = false;
        } else {
            create.object.addPoint(coords);
        }
    },
    rectanglemousedown: function (coords,mode) {
        if (create.firstPoint) {
            create.object = new polyline({start: coords,color: "#fff",close:true,mode:mode});
            create.firstPoint = false;
        } else {
            var start = create.object.state.start;
            create.object.addPoint({x:start.x,y:coords.y});
            create.object.addPoint(coords);
            create.object.addPoint({x:coords.x,y:start.y});
        }
    },
    preview: function () {
        var points = this.object.state.points;
        var lines = this.object.getLines();
        app.canvas.clear();
        for (var i = 0; i < points.length; i++) {
            app.drawPoint(points[i]);
        }
        for (var i = 0; i < lines.length; i++) {
            app.drawLine(lines[i]);
        }
        this.drawLastPoint();
        this.drawController();
    },
    drawLastPoint: function () {
        var point = this.object.state.points[this.object.state.points.length - 1];
        app.canvas.drawArc({
            x: point.x,
            y: point.y,
            radius: 3,
            color: "orange",
            mode: "fill"
        });
        app.canvas.drawArc({
            x: point.x,
            y: point.y,
            radius: 6,
            color: "orange",
            mode: "stroke"
        });
    },
    drawController: function () {
        var points = create.object.state.points;
        var lines = create.object.getLines();
        var lastPoint = points[points.length - 1];
        var control = {
            end: true,
            keyboard: true,
            move: true,
            pan: true
        };
        if (this.mode === "polyline") {
            control.close = points.length > 2;
            control.join = lines.length > 2 && Lines.getMeet(lines[0], lines[lines.length - 1]) !== false;
            control.remove = points.length > 0;
        }
        control.coords = {
            x: lastPoint.x,
            y: lastPoint.y
        };
        createControl.open(control);
    },
    drawcontrolremove: function () {
        var points = this.object.state.points;
        points.pop();
        this.preview();
    },
    drawcontrolclose: function () {
        this.object.close();
        this.end();
    },
    drawcontroljoin: function () {
        this.object.join();
        this.end();
    },
    drawcontrolmove: function (e) {
        app.eventHandler("window", "mousemove", this.movemousemove.bind(this));
        app.eventHandler("window", "mouseup", this.movemouseup);
        var lastPoint = this.object.getLastPoint();
        this.startOffset = {
            x: app.getClient(e, "X"),
            y: app.getClient(e, "Y"),
            endX: lastPoint.x,
            endY: lastPoint.y
        };
    },
    movemousemove: function (e) {
        var lastPoint = this.object.getLastPoint();
        var coords = app.canvas.getSnapedCoords({
            x: (app.getClient(e, "X") - this.startOffset.x) / app.canvas.getZoom() + this.startOffset.endX,
            y: (app.getClient(e, "Y") - this.startOffset.y) / app.canvas.getZoom() + this.startOffset.endY
        });
        if (lastPoint) {
            lastPoint.x = coords.x;
            lastPoint.y = coords.y;
        }
        this.preview();
    },
    movemouseup: function () {
        app.eventRemover("window", "mousemove", this.movemousemove);
        app.eventRemover("window", "mouseup", this.movemouseup);
    },
    drawcontrolend: function () {
        this.end();
    },
    drawcontrolpan: function (e) {
        app.eventHandler("window", "mousemove", this.panmousemove.bind(this));
        app.eventHandler("window", "mouseup", this.panmouseup);
        var screenPosition = app.canvas.getScreenPosition();
        this.startOffset = {
            x: app.getClient(e, "X"),
            y: app.getClient(e, "Y"),
            endX: screenPosition.x,
            endY: screenPosition.y
        };
    },
    panmousemove: function (e) {
        var x = (this.startOffset.x - app.getClient(e, "X")) / app.canvas.getZoom() + this.startOffset.endX;
        var y = (app.getClient(e, "Y") - this.startOffset.y) / app.canvas.getZoom() + this.startOffset.endY;
        app.canvas.setScreenTo({
            x: x,
            y: y,
            callback: this.preview.bind(this)
        });
        this.preview();
    },
    panmouseup: function () {
        app.eventRemover("window", "mousemove", this.panmousemove);
        app.eventRemover("window", "mouseup", this.panmouseup);
    },
    drawcontrolkeyboard: function () {
        var mode = this.mode;
        keyboard.open({
            isMobile:app.state.isMobile,
            fields: [{prop: "x",title: "X"},{prop: "y",title: "y"}],
            negative: true,
            title: mode + " to:",
            close: (mode === "ngon" || mode === "rectangle" || mode === "frame"),
            callback: create.object.to
        });
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
        if (!this.autoPanMode) {
            return;
        }
        var left = 40,
            right = 40,
            up = 40 + top_menu_size, //read from style-generator.js
            down = 40,
            speed = 1,
            x = coords.x,
            y = coords.y;
        if (x > canvas.width - right) {
            var horizontal = 1;
        } else if (x < left) {
            var horizontal = -1;
        } else {
            var horizontal = 0;
        }
        if (y > canvas.height - down) {
            var vertical = -1;
        } else if (y < up) {
            var vertical = 1;
        } else {
            var vertical = 0;
        }
        if (vertical || horizontal) {
            clearInterval(this.autoPanInterval);
            this.autoPanInterval = setInterval(function () {
                canvas.setScreenPosition({
                    offset: true,
                    x: speed * horizontal,
                    y: speed * vertical
                });
                callback();
            }, 10);
        } else {
            clearInterval(this.autoPanInterval);
        }
    },
    screenCorrection: function (callback) {
        var limit = createControl.style.distance;
        var lastPoint = create.currentSpline.getLastPoint() || create.currentSpline.start;
        console.log(create.currentSpline.start)
        var coords = canvas.convertCanvasXYToBodyXY(lastPoint);
        var x = coords.x,
            y = coords.y;
        if (x > canvas.width - limit) {
            var deltaX = x - canvas.width + limit;
        } else if (x < limit) {
            var deltaX = x - limit;
        } else {
            var deltaX = 0;
        }
        if (y > canvas.height - limit - 36) {
            var deltaY = y - canvas.height + limit + 36;
        } else if (y < limit + top_menu_size) {
            var deltaY = y - limit - top_menu_size;
        } else {
            var deltaY = 0;
        }
        deltaX /= canvas.zoom;
        deltaY /= canvas.zoom;
        canvas.setScreenPosition({
            offset: true,
            x: deltaX,
            y: deltaY * -1,
            animate: true,
            callback: callback
        });
    },

    //end: function () { if (create.currentSpline) { create.currentSpline.end(); } },
    mousemove: function () {
        create.autoPan({
            x: canvas.x,
            y: canvas.y
        }, create.mousemove);
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
        var point = canvas.findPointByCoords({
            area: create.snapArea
        }) || c.findPointByCoords({
            coords: mousePosition,
            area: create.snapArea
        });
        var coords = p || point || mousePosition;
        coords = {
            x: coords.x,
            y: coords.y
        }; //prevent mutual on found point
        create.currentSpline.setPreview(coords);
        c.savePreview();
        c.start = coords; //for last snap
        create.screenCorrection(function () {
            c.update();
            if (c.isClosed && c.points.length > 0) {
                c.end();
            }
        });
    },
    setting: function () {
        var template = [{
            title: "Snap Size",
            value: create.snapArea,
            onchange: function (value) {
                create.snapArea = value;
            },
            start: 1,
            step: 1,
            end: 30,
        }];
        if (app.createmode === "ngon") {
            template.push({
                title: "Sides",
                value: create.ngonSides,
                onchange: function (value) {
                    create.ngonSides = value;
                },
                start: 3,
                step: 1,
                end: 40,
            });
            template.push({
                title: "Ortho",
                value: create.ngonOrtho,
                text: ["ON", "OFF"],
                onchange: function (value) {
                    create.ngonOrtho = value;
                },
            });
        }
        var A = new Alert({
            buttons: [{
                title: "ok"
            }],
            template: template,
            title: app.createmode + " setting.",
        });
    },
    getExitLine: function (coords) {
        var exit = create.exit;
        if (app.createmode === "polyline") {
            var delta = {
                x: 0,
                y: 0
            };
        } else if (app.createmode === "doubleline") {
            var delta = lines.getDelta(exit, create.doubleline.thickness / 2);
        }
        var prep = lines.getPrependicularLine(exit, coords);
        var x = prep.start.x,
            y = prep.start.y;
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
            create.frame.points = [{
                x: start.x,
                y: start.y
            }];
            create.frame.points.push({
                x: coords.x,
                y: start.y
            });
            create.frame.points.push({
                x: coords.x,
                y: coords.y
            });
            create.frame.points.push({
                x: start.x,
                y: coords.y
            });
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
                        [{
                                x: x,
                                y: y,
                            },
                            {
                                x: x + (frameWidth * hSign),
                                y: y,
                            },
                            {
                                x: x + (frameWidth * hSign),
                                y: y + (frameHeight * vSign),
                            },
                            {
                                x: x,
                                y: y + (frameHeight * vSign),
                            },
                        ]
                    );
                }
            }
        },
        mousedown: function () {
            var point = canvas.findPointByCoords({
                area: create.snapArea
            });
            if (!create.snap) {
                point = false;
            }
            var coords = point || canvas.getSnapXY(); //get clicked coords 
            create.frame.start = create.frame.start || coords; //set start coords
            create.pointsStream = [create.frame.start];
            if (lines.getLength({
                    start: create.frame.start,
                    end: coords
                }) >= create.min) { //check minimum of size
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
            if (lines.getLength({
                    start: create.frame.start,
                    end: coords
                }) < create.min) {
                return;
            }
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
                        connectedLines: [{
                                id: lines.getNextID(1),
                                side: "start"
                            },
                            {
                                id: (i === 0) ? lines.getNextID(sides) : lines.getLast(1).id,
                                side: "end"
                            },
                        ]
                    });
                    var line = lines.add({
                        start: {
                            x: point.x,
                            y: point.y,
                            id: point.id
                        },
                        end: {
                            x: create.frame.points[(i + 1) % sides].x,
                            y: create.frame.points[(i + 1) % sides].y,
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
                        connectedLines: [{
                                id: lines.getNextID(1),
                                side: "start"
                            },
                            {
                                id: (j === 0) ? lines.getNextID(sides) : lines.getLast(1).id,
                                side: "end"
                            },
                        ]
                    });
                    var line = lines.add({
                        start: {
                            x: point.x,
                            y: point.y,
                            id: point.id
                        },
                        end: {
                            x: frame[(j + 1) % sides].x,
                            y: frame[(j + 1) % sides].y,
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

            createControl.move({
                x: create.frame.start.x,
                y: create.frame.start.y
            });
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