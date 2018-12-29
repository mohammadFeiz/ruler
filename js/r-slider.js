//////////r-slider.js//////////////
function slider(config) {
    var a = {
        state: { step: 1, changable: true, direction: "right", showFill: true, showButton: true },
        update: function (obj) { this.updateState(obj); this.render(); },
        getState: function () { return this.state; },
        updateState: function (obj) {
            for (var prop in obj) { this.state[prop] = obj[prop]; }
            var s = this.state;
            var container = $(s.container);
            if (!container) { alert("container error!!!"); } if (s.start === undefined) { alert("start is not defined!!!"); } if (s.end === undefined) { alert("end is not defined!!!"); } if (s.start > s.end) { alert("start is greater than end"); }
            var position = container.css("position"); if (position === "static") { container.css("position", "relative"); }
            this.state.range = s.end - s.start;
            if (s.min === undefined || s.min < s.start) { this.state.min = s.start; }
            if (s.max === undefined || s.max > s.end) { this.state.max = s.end; }
            this.state.value = this.getValue(s.value);
            this.state.styleName = this.getStyleName();
            this.state.style = this.getStyle(s.style);
            this.state.text = s.text || [];
        },
        getValue: function (value) {
            var min = this.state.min, max = this.state.max;
            if (value === undefined) { value = [min]; }
            if (typeof value === "number") { value = [value]; }
            for (var i = 0; i < value.length; i++) { if (value[i] > max) { value[i] = max; } else if (value[i] < min) { value[i] = min; } }
            return value;
        },
        render: function () {
            var s = this.state, container = $(this.state.container), calc = new RSliderCalculator({ start: s.start, range: s.range });
            container.html("");
            var str = '';
            str += '<div class="r-slider-container" style="' + this.getcontainerstyle() + '">';
            str += RSPins({ start: s.start, end: s.end, styleName: s.styleName, calc: calc, pinStep: s.pinStep });
            str += RSLabels({ start: s.start, end: s.end, calc: calc, styleName: s.styleName, labelStep: s.labelStep });
            str += RSLine({ style: s.style, styleName: s.styleName });
            var length = s.value.length;
            for (var i = 0; i < length; i++) {
                str += RSSpace({ showFill: s.showFill, index: i, value: s.value, style: s.style, styleName: s.styleName, text: s.text[i], calc: calc, direction: s.direction, });
                if (s.showButton !== false) {
                    str += RSButton({ index: i, value: s.value, style: s.style, styleName: s.styleName, calc: calc, fixValue: s.fixValue, showValue: s.showValue, colors: s.colors });
                }
            }
            str += RSSpace({ showFill: s.showFill, index: length, value: s.value, style: s.style, styleName: s.styleName, text: s.text[length], calc: calc, direction: s.direction });
            str += '</div>';
            container.html(str);
            if (s.changable !== false) {
                this.eventHandler(container.find(".r-slider-button"), "mousedown", this.buttonmousedown);
                this.eventHandler(container.find(".r-slider-space"), "mousedown", this.spacemousedown);
                this.eventHandler(container.find(".r-slider-label"), "mousedown", this.labelmousedown);
            }
        },
        getStyleName: function () {
            var d = this.state.direction;
            if (d === "right") { return { Thickness: "width", Thickness_r: "height", OtherSide: "top", OtherSide_r: "bottom", Axis: "x", Sign: 1, StartSide: "left", EndSide: "right", } }
            else if (d === "left") { return { Thickness: "width", Thickness_r: "height", OtherSide: "top", OtherSide_r: "bottom", Axis: "x", Sign: -1, StartSide: "right", EndSide: "left", } }
            else if (d === "down") { return { Thickness: "height", Thickness_r: "width", OtherSide: "left", OtherSide_r: "right", Axis: "y", Sign: 1, StartSide: "top", EndSide: "bottom", } }
            else if (d === "up") { return { Thickness: "height", Thickness_r: "width", OtherSide: "left", OtherSide_r: "right", Axis: "y", Sign: -1, StartSide: "bottom", EndSide: "top", } }
        },
        getStyle: function (obj) {
            var style = { button_width: 10, button_height: 10, line_width: 2, margin: 0, }, thickness = this.state.styleName.Thickness,
            container = $(this.state.container);
            if (style["button_" + thickness] > container[thickness]()) { style["button_" + thickness] = container[thickness]() }
            if (obj === undefined) { return style; }
            for (prop in obj) { style[prop] = obj[prop]; }
            return style;
        },
        getClient: function (e, axis) { if (e["client" + axis]===undefined) { return e.changedTouches[0]["client" + axis]; } else { return e["client" + axis]; } },
        getValueByClick: function (e) {
            var calc = new RSliderCalculator(this.state), d = this.state.direction, x = this.getClient(e, "X"), y = this.getClient(e, "Y");
            var inner = $(this.state.container).find(".r-slider-container");
            if (d === "right") { var distance = x + pageXOffset - inner.offset().left; }
            else if (d === "left") { var distance = inner.offset().left + this.width - x - pageXOffset; }
            else if (d === "down") { var distance = y + pageYOffset - inner.offset().top; }
            else if (d === "up") { var distance = inner.offset().top + this.height - y - pageYOffset; }
            return calc.getCorrectValue(calc.getValueByPixel(distance));
        },
        move: function (dir) {
            var s = this.state, buttons = $(s.container).find(".r-slider-button");
            for (var i = 0; i < s.value.length; i++) { this.moveButtonTo(buttons.eq(i), s.step * dir, true); }
            if (s.ondrag !== undefined) { s.ondrag(s); }
        },
        spacemousedown: function (e) {
            e.preventDefault();
            this.setWidthHeight();
            var s = this.state, container = $(s.container), element = $(e.currentTarget), index = element.data("index");
            container.find(".r-slider-button").css({ "zIndex": 1000 });
            container.find(".r-slider-button[data-index=" + index + "]").css({ "zIndex": 10000 });
            if (index === 0) { this.move(-1); } //اگر روی فضای خالی ابتدا کلیک شد
            else if (index === s.value.length) { this.move(1); } //اگر روی فضای خالی انتها کلیک شد
            else {
                var button = container.find(".r-slider-button[data-index=" + index + "]");
                var button_b = container.find(".r-slider-button[data-index=" + (index - 1) + "]");
                var value = s.value[index];
                var value_b = s.value[index - 1];
                var diffrence = Math.abs(value - value_b);
                s.startOffset = {
                    x: this.getClient(e, "X"), y: this.getClient(e, "Y"), value: value, value_b: value_b, button: button, button_b: button_b,
                    limit: {
                        before: {
                            min: s.value[index - 2] === undefined ? s.start : s.value[index - 2],
                            max: s.value[index + 1] === undefined ? s.end - diffrence : s.value[index + 1] - diffrence
                        },
                        current: {
                            min: s.value[index - 2] === undefined ? s.start + diffrence : s.value[index - 2] + diffrence,
                            max: s.value[index + 1] === undefined ? s.end : s.value[index + 1]
                        }
                    },
                };
                this.eventHandler("window", "mousemove", this.spacemousemove);
            }
            container.find(".r-slider-number").show();
            this.eventHandler("window", "mouseup", this.mouseup);
        },
        buttonmousedown: function (e) {
            e.preventDefault();
            this.setWidthHeight();
            var s = this.state, container = $(s.container), element = $(e.currentTarget), index = element.data("index");
            container.find(".r-slider-button").css({ "zIndex": 1000 });
            container.find(".r-slider-button[data-index=" + index + "]").css({ "zIndex": 10000 });
            s.startOffset = {
                x: this.getClient(e, "X"), y: this.getClient(e, "Y"), value: s.value[index], button: container.find(".r-slider-button[data-index=" + index + "]"),
                limit: {
                    min: s.value[index - 1] === undefined ? s.start : s.value[index - 1],
                    max: s.value[index + 1] === undefined ? s.end : s.value[index + 1],
                },
            };
            this.eventHandler("window", "mousemove", this.buttonmousemove);
            container.find(".r-slider-number").show();
            this.eventHandler("window", "mouseup", this.mouseup);
            if (s.onbuttonmousedown !== undefined) { s.onbuttonmousedown(s); }
        },
        labelmousedown: function (e) {
            if (this.state.value.length !== 1 || !this.state.changable) { return; }
            var value = parseFloat($(e.currentTarget).find("span").html());
            this.update({ value: value });
        },
        buttonmousemove: function (e) {
            var s = this.state, calc = new RSliderCalculator(s), so = s.startOffset, axis = s.styleName.Axis, change;
            var offsetValue = calc.getValueByPixel((this.getClient(e, axis.toUpperCase()) - so[axis]) * s.styleName.Sign);
            var value = calc.getCorrectValue(offsetValue + so.value);
            if (value < so.limit.min) { value = so.limit.min; }
            if (value > so.limit.max) { value = so.limit.max; }
            change = this.moveButtonTo(so.button, value, false);
            if (s.ondrag !== undefined && change) { s.ondrag(s); }
        },
        spacemousemove: function (e) {
            var s = this.state, calc = new RSliderCalculator(s), so = s.startOffset, axis = s.styleName.Axis, change;
            var offsetValue = calc.getValueByPixel((this.getClient(e, axis.toUpperCase()) - so[axis]) * s.styleName.Sign);
            var value = calc.getCorrectValue(offsetValue + so.value);
            var value_b = calc.getCorrectValue(offsetValue + so.value_b);
            if (value_b < so.limit.before.min) { value_b = so.limit.before.min; }
            if (value_b > so.limit.before.max) { value_b = so.limit.before.max; }
            if (value < so.limit.current.min) { value = so.limit.current.min; }
            if (value > so.limit.current.max) { value = so.limit.current.max; }
            change = this.moveButtonTo(so.button, value, false);
            this.moveButtonTo(so.button_b, value_b, false);
            if (s.ondrag !== undefined && change) { s.ondrag(s); }
        },
        mouseup: function () {
            var s = this.state;
            if (s.fixValue !== true) { $(s.container).find(".r-slider-number").fadeOut(100); }
            this.eventRemover("window", "mousemove", this.mousemove);
            this.eventRemover("window", "mouseup", this.mouseup);
            if (s.onchange !== undefined) { s.onchange(s); }
        },
        setWidthHeight: function () {
            var s = this.state, inner = $(s.container).find(".r-slider-container");
            s.width = inner.width(); s.height = inner.height();
        },
        moveButtonTo: function (button, value, offset) {
            var s = this.state, calc = new RSliderCalculator(s);
            if (offset === true) {
                if (value === 0) { return false; }
                value += parseFloat(button.attr("data-value"));
            }
            if (parseFloat(button.attr("data-value")) === value) { return false; }
            var index = button.data("index");
            var sn = s.styleName;
            var percent = calc.getPercentByValue(value);
            var percent_b = calc.getPercentByValue(s.value[index - 1]) || 0;
            var percent_a = calc.getPercentByValue(s.value[index + 1]) || 100;
            var container = $(s.container);
            var space = container.find(".r-slider-space[data-index=" + (index) + "]");
            var space_a = container.find(".r-slider-space[data-index=" + (index + 1) + "]");
            var style = s.style;
            var size = style['button_' + sn.Thickness];
            button.css(sn.StartSide, 'calc(' + percent + '% - ' + (size / 2) + 'px');
            space.css(sn.Thickness, (percent - percent_b) + '%');
            space_a.css(sn.Thickness, (percent_a - percent) + '%');
            space_a.css(sn.StartSide, percent + '%');
            s.value[index] = value;
            button.attr("data-value", value);
            button.find(".r-slider-number").html(value);
            return true;
        },
        /////////get template////////////////////
        getcontainerstyle: function () {
            var s = this.state, sn = s.styleName, size = s.style['button_' + sn.Thickness], size_r = s.style['button_' + sn.Thickness_r], str = 'position:absolute;';
            //str += 'background:red;opacity:0.3;';
            str += sn.StartSide + ':' + ((size / 2) + s.style.margin) + 'px;';
            str += sn.OtherSide + ':calc(50% - ' + (size_r / 2) + 'px);';
            str += sn.Thickness + ':calc(100% - ' + (size + (s.style.margin * 2)) + 'px);';
            str += sn.Thickness_r + ':' + size_r + 'px;';
            return str;
        },
        eventHandler: function (selector, event, action) {
            if (selector === "window") { $(window).unbind(event, $.proxy(action, this)).bind(event, $.proxy(action, this)); }
            else if (typeof selector === "string") { $(selector).unbind(event, $.proxy(action, this)).bind(event, $.proxy(action, this)); }
            else { selector.unbind(event, $.proxy(action, this)).bind(event, $.proxy(action, this)); }
            if (event === "mousedown") { event = "touchstart"; } else if (event === "mousemove") { event = "touchmove"; } else if (event === "mouseup") { event = "touchend"; }
            if (selector === "window") { $(window).unbind(event, $.proxy(action, this)).bind(event, $.proxy(action, this)); }
            else if (typeof selector === "string") { $(selector).unbind(event, $.proxy(action, this)).bind(event, $.proxy(action, this)); }
            else { selector.unbind(event, $.proxy(action, this)).bind(event, $.proxy(action, this)); }

        },
        eventRemover: function (selector, event, action) {
            if (selector === "window") { $(window).unbind(event, $.proxy(action, this)); }
            else if (typeof selector === "string") { $(selector).unbind(event, $.proxy(action, this)); }
            else { selector.unbind(event, $.proxy(action, this)); }
            if (event === "mousedown") { event = "touchstart"; } else if (event === "mousemove") { event = "touchmove"; } else if (event === "mouseup") { event = "touchend"; }
            if (selector === "window") { $(window).unbind(event, $.proxy(action, this)); }
            else if (typeof selector === "string") { $(selector).unbind(event, $.proxy(action, this)); }
            else { selector.unbind(event, $.proxy(action, this)); }

        },
    }
    a.update(config);
    return { update: a.update.bind(a), getState: a.getState.bind(a) };
}

function RSliderCalculator(obj) {
    var a = {
        state: {},
        init: function (obj) { for (prop in obj) { this.state[prop] = obj[prop]; } },
        getPercentByValue: function (value) {
            if (value === undefined) { return undefined; }
            return 100 * (value - this.state.start) / (this.state.range) || 0;
        },
        getPercentByPixel: function (px) { return Math.round(px * 100 / this.state[this.state.styleName.Thickness]); },
        getValueByPercent: function (percent) { return ((this.state.range / 100) * percent) + this.state.start; },
        getValueByPixel: function (px) { return (px * this.state.range) / this.state[this.state.styleName.Thickness]; },
        getCorrectValue: function (value) {
            value = (Math.round((value - this.state.start) / this.state.step) * this.state.step) + this.state.start;
            if (value < this.state.min) { value = this.state.min; }
            else if (value > this.state.max) { value = this.state.max; }
            value = parseFloat(value.toFixed(2));
            return value;
        },
    }
    a.init(obj);
    return a;
}
function RSPins(obj) {//calc-pinStep-start-end-styleName
    if (!obj.pinStep) { return ""; }
    var value = obj.start;
    var str = '';
    while (value <= obj.end) {
        var percent = obj.calc.getPercentByValue(value);
        value += obj.pinStep;
        str += RSPin({ styleName: obj.styleName, percent: percent });
    }
    return str;
}
function RSPin(obj) {//styleName-percent
    var sn = obj.styleName;
    function getStyle() {
        var str = '';
        str += 'position:absolute;';
        str += sn.OtherSide + ':0;';
        str += sn.Thickness_r + ':100%;';
        str += sn.Thickness + ':1px;';
        str += sn.StartSide + ':' + obj.percent + '%;';
        return str;
    }
    return '<div class="r-slider-pin" style="' + getStyle() + '"></div>';
}
function RSLabels(obj) {//start-end-labelStep-styleName-calc
    if (!obj.labelStep) { return ""; }
    var value = obj.start;
    var str = '';
    while (value <= obj.end) {
        var percent = obj.calc.getPercentByValue(value);
        str += RSLabel({
            styleName: obj.styleName,
            percent: percent,
            value: value
        });
        value += obj.labelStep;
    }
    return str;
}
function RSLabel(obj) {//percent-styleName-value
    var sn = obj.styleName;
    function getStyle() {
        var str = 'position: absolute;line-height: 2px;text-align: center;';
        str += sn.Thickness + ': 40px;';
        str += sn.Thickness_r + ':2px;';
        str += sn.StartSide + ':calc(' + obj.percent + '% - 20px);';
        return str;
    }
    var str = '';
    str += '<div class="r-slider-label" style="' + getStyle() + '"><span>';
    str += obj.value;
    str += '</span></div>';
    return str;
}
function RSFill(obj) {//style-index-value-styleName
    var sn = obj.styleName;
    function getStyle() {
        var str = 'position: absolute;z-index: 10;cursor: pointer;';
        str += sn.Thickness + ':100%;';
        str += sn.StartSide + ':0;';
        str += sn.OtherSide + ':calc(50% - ' + (obj.style.line_width / 2) + 'px);';
        str += sn.Thickness_r + ':' + obj.style.line_width + 'px;'
        return str;
    }
    return '<div data-index="' + obj.index + '" class="r-slider-fill" style="' + getStyle() + '"></div>';
}
function RSSpace(obj) {//calc-styleName-index-value-direction-text-style-showFill
    var sn = obj.styleName;
    var percent = obj.calc.getPercentByValue(obj.value[obj.index]);
    if (percent === undefined) { percent = 100; } //for end space
    var beforePercent = (obj.index === 0) ? 0 : obj.calc.getPercentByValue(obj.value[obj.index - 1]);
    function getStyle() {
        var str = 'position:absolute;z-index:100;overflow: hidden;cursor:pointer;';
        str += sn.Thickness + ':' + (percent - beforePercent) + '%;';
        str += sn.StartSide + ':' + beforePercent + '%;';
        str += sn.OtherSide + ':0;';
        str += sn.Thickness_r + ':100%;';
        return str;
    }
    var str = '';
    str += '<div data-index="' + obj.index + '" class="r-slider-space" style="' + getStyle() + '">';
    if (obj.value.length === 1 || obj.index !== 0) {
        if (obj.index !== obj.value.length && obj.showFill === true) {
            str += RSFill({ style: obj.style, index: obj.index, styleName: obj.styleName, value: obj.value });
        }
    }
    if (obj.text) {
        if (obj.direction === "left" || obj.direction === "right") { str += RSText({ index: obj.index, length: obj.value.length, style: obj.style, styleName: sn, text: obj.text }); }
    }
    str += '</div>';
    return str;
}
function RSText(obj) {//style-styleName-length-index-text
    var sn = obj.styleName;
    function getStyle() {
        var size = obj.style['button_' + sn.Thickness];
        var str = 'position:absolute;text-align:center;';
        if (obj.index === 0) {
            str += sn.Thickness + ':calc(100% - ' + size / 2 + 'px);';
            str += sn.StartSide + ':0;';
            str += sn.OtherSide + ':0;';
        } else if (obj.index === obj.length) {
            str += sn.Thickness + ':calc(100% - ' + size / 2 + 'px);';
            str += sn.EndSide + ':0;';
            str += sn.OtherSide + ':0;';
        } else {
            str += sn.Thickness + ':100%;';
        }
        str += 'line-height:' + obj.style.button_height + 'px;';
        return str;
    }
    var str = '';
    str += '<div data-index="' + obj.index + '" class="r-slider-text" style="' + getStyle() + '">';
    str += obj.text || "";
    str += '</div>';
    return str;
}
function RSLine(obj) {//style-styleName
    var sn = obj.styleName;
    function getStyle() {
        var str = 'position:absolute;z-index:1;';
        str += sn.Thickness + ':100%;';
        str += sn.StartSide + ':0;';
        str += sn.OtherSide + ':calc(50% - ' + (obj.style.line_width / 2) + 'px);';
        str += sn.Thickness_r + ':' + obj.style.line_width + 'px;'
        return str;
    }
    return '<div class="r-slider-line" style="' + getStyle() + '"></div>';
}
function RSButton(obj) {//value-index-style-thickness-styleName-fixValue-showValue
    var sn = obj.styleName;
    var percent = obj.calc.getPercentByValue(obj.value[obj.index]);
    function getStyle() {
        var size = obj.style['button_' + sn.Thickness];
        var str = '';
        str += 'border:none;position:absolute;z-index: 1000;cursor:pointer;';
        str += 'height:' + obj.style.button_height + 'px;';
        str += 'width:' + obj.style.button_width + 'px;';
        str += sn.StartSide + ':calc(' + percent + '% - ' + (size / 2) + 'px);';
        str += sn.OtherSide + ':0;';
        return str;
    }
    var str = '<div data-index="' + obj.index + '" data-value="' + obj.value[obj.index] + '" class="r-slider-button" style="' + getStyle() + '">';
    if (obj.showValue) { str += RSNumber({ style: obj.style, value: obj.value[obj.index], fixValue: obj.fixValue, index: obj.index, }); }
    str += '</div>';
    return str;
}
function RSNumber(obj) {//style-fixValue-index-number
    function getStyle() {
        var str = 'z-index: 1000;';
        if (obj.fixValue !== true) { str += 'display:none;'; }
        return str;
    }
    var str = '';
    str += '<div data-index="' + obj.index + '" style="' + getStyle() + '" class="r-slider-number">';
    str += obj.value;
    str += '</div>';
    return str;
}
