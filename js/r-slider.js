//////////r-slider.js//////////////
function slider(config) {
    var a = {
        style: { button_width: 10, button_height: 10, line_width: 2, margin: 0, },
        state: {
            step: 1, changable: true, direction: "right", showFill: true, showButton: true,

        },
        update: function (obj) { this.updateState(obj); this.render(); },
        getState: function () { return this.state; },
        getContainer: function () {
            return typeof this.state.container === "string" ? $(this.state.container) : this.state.container;
        },
        getPercentByValue: function (value) {
            if (value === undefined) { return undefined; }
            return 100 * (value - this.state.start) / (this.state.range) || 0;
        },
        getValueByPixel: function (px) {
            var container = $(".r-slider-container#" + this.state.id);
            return (px * this.state.range) / container[this.state.styleName.Thickness]();
        },
        updateValue: function (index) {
            var s = this.state;
            s.value[index] = (Math.round((s.value[index] - s.start) / s.step) * s.step) + s.start;
            var before = s.value[index - 1] === undefined?s.min:s.value[index - 1];
            var after = s.value[index + 1] === undefined?s.max:s.value[index + 1];
            if (s.value[index] < before) { s.value[index] = before; }
            if (s.value[index] > after) { s.value[index] = after; }
            s.value[index] = parseFloat(s.value[index].toFixed(2));
        },
        changeValues: function (start,end,offset) {
            var s = this.state;
            var before = s.value[start - 1] === undefined ? s.min : s.value[start - 1];
            var after = s.value[end + 1] === undefined ? s.max : s.value[end + 1];
            if (offset < before - s.value[start]) { offset = before - s.value[start]; }
            if (offset > after - s.value[end]) { offset = after - s.value[end]; }
            for (var i = start; i <= end; i++) {
                s.value[i] += offset;
                s.value[i] = (Math.round((s.value[i] - s.start) / s.step) * s.step) + s.start;
                s.value[i] = parseFloat(s.value[i].toFixed(2));
            }
        },
        getSpaceStyle: function (index) {
            var s = this.state, sn = s.styleName;
            var percent = this.getPercentByValue(s.value[index]);
            if (percent === undefined) { percent = 100; } //for end space
            var beforePercent = (index === 0) ? 0 : this.getPercentByValue(s.value[index - 1]);
            var str = 'position:absolute;z-index:100;overflow: hidden;cursor:pointer;';
            str += sn.Thickness + ':' + (percent - beforePercent) + '%;';
            str += sn.StartSide + ':' + beforePercent + '%;';
            str += sn.OtherSide + ':0;';
            str += sn.Thickness_r + ':100%;';
            return str;
        },
        getTextStyle: function (index) {
            var s = this.state, sn = s.styleName;
            var size = s.style['button_' + sn.Thickness];
            var str = 'position:absolute;text-align:center;';
            if (index === 0) {
                str += sn.Thickness + ':calc(100% - ' + size / 2 + 'px);';
                str += sn.StartSide + ':0;';
                str += sn.OtherSide + ':0;';
            } else if (index === s.value.length) {
                str += sn.Thickness + ':calc(100% - ' + size / 2 + 'px);';
                str += sn.EndSide + ':0;';
                str += sn.OtherSide + ':0;';
            } else {
                str += sn.Thickness + ':100%;';
            }
            str += 'line-height:' + s.style.button_height + 'px;';
            return str;
        },
        getFillStyle: function () {
            var s = this.state, sn = s.styleName;
            var str = 'position: absolute;z-index: 10;cursor: pointer;';
            str += sn.Thickness + ':100%;';
            str += sn.StartSide + ':0;';
            str += sn.OtherSide + ':calc(50% - ' + (s.style.line_width / 2) + 'px);';
            str += sn.Thickness_r + ':' + s.style.line_width + 'px;'
            return str;
        },
        getButtonStyle: function (index) {
            var s = this.state, sn = s.styleName;
            var percent = this.getPercentByValue(s.value[index]);
            var size = s.style['button_' + sn.Thickness];
            var str = '';
            str += 'border:none;position:absolute;z-index: 1000;cursor:pointer;';
            str += 'height:' + s.style.button_height + 'px;';
            str += 'width:' + s.style.button_width + 'px;';
            str += sn.StartSide + ':calc(' + percent + '% - ' + (size / 2) + 'px);';
            str += sn.OtherSide + ':0;';
            return str;
        },
        updateState: function (obj) {
            for (var prop in obj) { this.state[prop] = obj[prop]; }
            var s = this.state;
            this.state.range = s.end - s.start;
            if (s.min === undefined || s.min < s.start) { this.state.min = s.start; }
            if (s.max === undefined || s.max > s.end) { this.state.max = s.end; }
            if (typeof s.value === "number") { s.value = [s.value]; }
            for (var i = 0; i < s.value.length; i++) {this.updateValue(i);}
            this.state.styleName = this.getStyleName();
            this.state.style = $.extend({}, this.style, this.state.style);
            this.state.text = s.text || [];
        },
        getValue: function (value) {
            var min = this.state.min, max = this.state.max;
            for (var i = 0; i < value.length; i++) { if (value[i] > max) { value[i] = max; } else if (value[i] < min) { value[i] = min; } }
            return value;
        },

        getStyleName: function () {
            var d = this.state.direction;
            if (d === "right") { return { Thickness: "width", Thickness_r: "height", OtherSide: "top", OtherSide_r: "bottom", Axis: "x", Sign: 1, StartSide: "left", EndSide: "right", } }
            else if (d === "left") { return { Thickness: "width", Thickness_r: "height", OtherSide: "top", OtherSide_r: "bottom", Axis: "x", Sign: -1, StartSide: "right", EndSide: "left", } }
            else if (d === "down") { return { Thickness: "height", Thickness_r: "width", OtherSide: "left", OtherSide_r: "right", Axis: "y", Sign: 1, StartSide: "top", EndSide: "bottom", } }
            else if (d === "up") { return { Thickness: "height", Thickness_r: "width", OtherSide: "left", OtherSide_r: "right", Axis: "y", Sign: -1, StartSide: "bottom", EndSide: "top", } }
        },
        getClient: function (e) { return { x: e.clientX === undefined ? e.changedTouches[0].clientX : e.clientX, y: e.clientY === undefined ? e.changedTouches[0].clientY : e.clientY }; },
        getValueByClick: function (e) {
            var calc = new RSliderCalculator(this.state), d = this.state.direction, x = this.getClient(e, "X"), y = this.getClient(e, "Y");
            var inner = this.getContainer().find(".r-slider-container");
            if (d === "right") { var distance = x + pageXOffset - inner.offset().left; }
            else if (d === "left") { var distance = inner.offset().left + this.width - x - pageXOffset; }
            else if (d === "down") { var distance = y + pageYOffset - inner.offset().top; }
            else if (d === "up") { var distance = inner.offset().top + this.height - y - pageYOffset; }
            return calc.getCorrectValue(calc.getValueByPixel(distance));
        },
        move: function (dir) {
            var s = this.state, buttons = this.getContainer().find(".r-slider-button");
            for (var i = 0; i < s.value.length; i++) { this.moveButtonTo(buttons.eq(i), s.step * dir, true); }
            if (s.ondrag !== undefined) { s.ondrag(s); }
        },
        spacemousedown: function (e) {
            e.preventDefault();
            var s = this.state;
            var element = $(e.currentTarget);
            var index = element.data("index");
            var container = element.parents(".r-slider-container");
            if (index === s.value.length || index === 0) {
                this.changeValues(0, s.value.length - 1, s.step * (index === 0?-1:1));
                for (var i = 0; i < s.value.length; i++) {
                    this.moveButtonTo(container.find(".r-slider-button[data-index="+i+"]"), s.value[i], false);
                }
                if (s.ondrag) { s.ondrag(s); }
                else if (s.onchange) { s.onchange(s); }
                return;
            }
            var before = container.find(".r-slider-button[data-index=" + (index - 1) + "]");
            var after = container.find(".r-slider-button[data-index=" + index + "]");
            container.find(".r-slider-button").css({ "zIndex": 1000 });
            before.css({ "zIndex": 10000 });
            after.css({ "zIndex": 10000 });
            var client = this.getClient(e);
            this.startOffset = {
                x: client.x, y: client.y,
                before: { index: index - 1, element: before, value: s.value[index - 1] },
                after: {index:index, element: after, value: s.value[index]}
            };
            this.eventHandler("window", "mousemove", this.spacemousemove);
            container.find(".r-slider-number").show();
            this.eventHandler("window", "mouseup", this.mouseup);
        },
        buttonmousedown: function (e) {
            e.preventDefault();
            var s = this.state;
            var element = $(e.currentTarget);
            var index = element.data("index");
            var container = element.parents(".r-slider-container");
            container.find(".r-slider-button").css({ "zIndex": 1000 });
            element.css({ "zIndex": 10000 });
            var client = this.getClient(e);
            this.startOffset = { x: client.x, y: client.y, index: index, element: element,value:s.value[index] };
            this.eventHandler("window", "mousemove", this.buttonmousemove.bind(this));
            container.find(".r-slider-number").show();
            this.eventHandler("window", "mouseup", this.mouseup.bind(this));
            if (s.onbuttonmousedown) { s.onbuttonmousedown(s); }
        },
        labelmousedown: function (e) {
            var element = $(e.currentTarget);
            var container = $(".r-slider-container#" + this.state.id);
            if (this.state.value.length !== 1 || !this.state.changable) { return; }
            var value = parseFloat(element.find("span").html());
            this.state.value[0] = value;
            this.moveButtonTo(container.find(".r-slider-button"), value, false);
        },
        buttonmousemove: function (e) {
            var s = this.state, so = this.startOffset, axis = s.styleName.Axis, change;
            s.value[so.index] = this.getValueByPixel((this.getClient(e)[axis] - so[axis]) * s.styleName.Sign) + so.value;
            this.updateValue(so.index);
            change = this.moveButtonTo(so.element, s.value[so.index], false);
            if (s.ondrag !== undefined && change) { s.ondrag(s); }
        },
        spacemousemove: function (e) {
            var s = this.state, so = this.startOffset, axis = s.styleName.Axis, change;
            var offset = this.getValueByPixel((this.getClient(e)[axis] - so[axis]) * s.styleName.Sign);
            s.value[so.before.index] = so.before.value;
            s.value[so.after.index] = so.after.value;
            this.changeValues(so.before.index, so.after.index, offset);
            change = this.moveButtonTo(so.before.element, s.value[so.before.index], false);
            this.moveButtonTo(so.after.element, s.value[so.after.index], false);
            if (s.ondrag !== undefined && change) { s.ondrag(s); }
        },
        mouseup: function () {
            var s = this.state;
            if (s.fixValue !== true) { $(".r-slider-container#"+s.id+" .r-slider-number").fadeOut(100); }
            this.eventRemover("window", "mousemove", this.mousemove);
            this.eventRemover("window", "mouseup", this.mouseup);
            if (s.onchange !== undefined) { s.onchange(s); }
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
            var container = $("#" + this.state.id);
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
        getHTML: function () {
            return this.html;
        },
        render: function () {
            var s = this.state, calc = new RSliderCalculator({ start: s.start, range: s.range });
            var str = '';
            str += '<div id="' + s.id + '" class="r-slider-container" style="' + this.getcontainerstyle() + '">';
            str += RSPins({ start: s.start, end: s.end, styleName: s.styleName, calc: calc, pinStep: s.pinStep });
            str += RSLabels({ start: s.start, end: s.end, calc: calc, styleName: s.styleName, labelStep: s.labelStep });
            str += RSLine({ style: s.style, styleName: s.styleName });
            var length = s.value.length;
            for (var i = 0; i < length; i++) {
                str += RSSpace({ fill: true, index: i, text: s.text[i], fillStyle: this.getFillStyle(i), spaceStyle: this.getSpaceStyle(i), textStyle: this.getTextStyle(i), });
                if (s.showButton !== false) {
                    str += RSButton({ index: i, value: s.value[i], style: this.getButtonStyle(i), fixValue: s.fixValue, showValue: s.showValue });
                }
            }
            str += RSSpace({ fill: false, index: length, text: s.text[length], fillStyle: this.getFillStyle(i), spaceStyle: this.getSpaceStyle(i), textStyle: this.getTextStyle(i) });
            str += '</div>';
            this.html = str;
            if (s.changable !== false) {
                $('body').off('mousedown', "#" + s.id + " .r-slider-button");
                $('body').on('mousedown', "#" + s.id + " .r-slider-button", this.buttonmousedown.bind(this));
                $('body').off('mousedown', "#" + s.id + " .r-slider-space");
                $('body').on('mousedown', "#" + s.id + " .r-slider-space", this.spacemousedown.bind(this));
                $('body').off('mousedown', "#" + s.id + " .r-slider-label");
                $('body').on('mousedown', "#" + s.id + " .r-slider-label", this.labelmousedown.bind(this));
            }
        },
    }
    a.update(config);
    return { update: a.update.bind(a), getState: a.getState.bind(a), getHTML: a.getHTML.bind(a)};
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
    return '<div class="r-slider-fill" style="' + obj.style + '"></div>';
}
function RSSpace(obj) {//calc-styleName-index-value-direction-text-style-showFill
    var str = '';
    str += '<div data-index="' + obj.index + '" class="r-slider-space" style="' + obj.spaceStyle + '">';
    if (obj.fill) { str += RSFill({ style: obj.fillStyle }); }
    if (obj.text) { str += RSText({ style: obj.textStyle, text: obj.text }); }
    str += '</div>';
    return str;
}
function RSText(obj) {//style-styleName-length-index-text
    var str = '';
    str += '<div class="r-slider-text" style="' + obj.style + '">';
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
function RSButton(obj) {
    var str = '<div data-index="' + obj.index + '" data-value="' + obj.value + '" class="r-slider-button" style="' + obj.style + '">';
    if (obj.showValue) {
        str += '<div style="z-index:1000;' + (obj.fixValue !== true ? 'display:none;' : '') + '" class="r-slider-number">' + obj.value + '</div>';
    }
    str += '</div>';
    return str;
}
