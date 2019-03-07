//////////r-slider.js//////////////
function slider(config) {
    var a = {
        style: { button_width: 10, button_height: 10, line_width: 2, margin: 0, },
        state: {
            step: 1, changable: true, direction: "right", showFill: true, showButton: true,

        },
        update: function (obj) { this.updateState(obj); this.render(); },
        getState: function () { return this.state; },
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
        getStyleName: function () {
            var d = this.state.direction;
            if (d === "right") { return { Thickness: "width", Thickness_r: "height", OtherSide: "top", OtherSide_r: "bottom", Axis: "x", Sign: 1, StartSide: "left", EndSide: "right", } }
            else if (d === "left") { return { Thickness: "width", Thickness_r: "height", OtherSide: "top", OtherSide_r: "bottom", Axis: "x", Sign: -1, StartSide: "right", EndSide: "left", } }
            else if (d === "down") { return { Thickness: "height", Thickness_r: "width", OtherSide: "left", OtherSide_r: "right", Axis: "y", Sign: 1, StartSide: "top", EndSide: "bottom", } }
            else if (d === "up") { return { Thickness: "height", Thickness_r: "width", OtherSide: "left", OtherSide_r: "right", Axis: "y", Sign: -1, StartSide: "bottom", EndSide: "top", } }
        },
        getClient: function (e) { return { x: e.clientX === undefined ? e.changedTouches[0].clientX : e.clientX, y: e.clientY === undefined ? e.changedTouches[0].clientY : e.clientY }; },
        spacemousedown: function (e) {
            //e.preventDefault();
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
            this.eventHandler("window", "mousemove", $.proxy(this.spacemousemove,this));
            container.find(".r-slider-number").show();
            this.eventHandler("window", "mouseup", $.proxy(this.mouseup,this));
        },
        buttonmousedown: function (e) {
            //e.preventDefault();
            var s = this.state;
            var element = $(e.currentTarget);
            var index = element.data("index");
            var container = element.parents(".r-slider-container");
            container.find(".r-slider-button").css({ "zIndex": 1000 });
            element.css({ "zIndex": 10000 });
            var client = this.getClient(e);
            this.startOffset = { x: client.x, y: client.y, index: index, element: element,value:s.value[index] };
            this.eventHandler("window", "mousemove", $.proxy(this.buttonmousemove,this));
            container.find(".r-slider-number").show();
            this.eventHandler("window", "mouseup", $.proxy(this.mouseup,this));
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
            var s = this.state, so = this.startOffset, axis = s.styleName.Axis;
            s.value[so.index] = this.getValueByPixel((this.getClient(e)[axis] - so[axis]) * s.styleName.Sign) + so.value;
            this.updateValue(so.index);
            var change = this.moveButtonTo(so.element, s.value[so.index], false);
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
            this.eventRemover("window", "mousemove", this.buttonmousemove);
            this.eventRemover("window", "mousemove", this.spacemousemove);
            this.eventRemover("window", "mouseup", this.mouseup);
            if (s.onchange !== undefined) { s.onchange(s); }
        },
        moveButtonTo: function (button, value, offset) {
            var s = this.state;
            if (offset === true) {
                if (value === 0) { return false; }
               // value += s.value[button.attr("data-index")];
            }
            if (parseFloat(button.attr("data-value")) === value) { return false; }
            var index = button.data("index");
            var sn = s.styleName;
            var percent = this.getPercentByValue(value);
            var percent_b = this.getPercentByValue(s.value[index - 1]) || 0;
            var percent_a = this.getPercentByValue(s.value[index + 1]) || 100;
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
        getEvent:function(event){
            var mobileEvents = { mousedown: "touchstart", mousemove: "touchmove", mouseup: "touchend" };
            return 'ontouchstart' in document.documentElement ? mobileEvents[event] : event;
        },
        eventHandler: function (selector, event, action) {
            var element = typeof selector === "string" ? (selector === "window" ? $(window) : $(selector)) : selector;
            event = this.getEvent(event);
            element.unbind(event, action).bind(event, action);
        },
        eventRemover: function (selector, event, action) {
            var element = typeof selector === "string" ? (selector === "window" ? $(window) : $(selector)) : selector;
            event = this.getEvent(event);
            element.unbind(event, action);
        },
        getHTML: function () {
            return this.html;
        },
        getSpaceStyle: function (index) {
            var s = this.state, sn = s.styleName;
            var percent = this.getPercentByValue(s.value[index]);
            if (percent === undefined) { percent = 100; } //for end space
            var beforePercent = (index === 0) ? 0 : this.getPercentByValue(s.value[index - 1]);
            var str = '';
            str += sn.Thickness + ':' + (percent - beforePercent) + '%;';
            str += sn.StartSide + ':' + beforePercent + '%;';
            return str;
        },
        getTextStyle: function (index) {
            var s = this.state, sn = s.styleName;
            var size = s.style['button_' + sn.Thickness];
            var str = '';
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
            var str = '';
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
            str += '';
            str += 'height:' + s.style.button_height + 'px;';
            str += 'width:' + s.style.button_width + 'px;';
            str += sn.StartSide + ':calc(' + percent + '% - ' + (size / 2) + 'px);';
            return str;
        },
        getLineStyle:function () {
            var s = this.state, sn = s.styleName;
            var str = '';
            str += sn.StartSide + ':0;';
            str += sn.OtherSide + ':calc(50% - ' + (s.style.line_width / 2) + 'px);';
            str += sn.Thickness_r + ':' + s.style.line_width + 'px;'
            return str;
        },
        getPinStyle:function (value) {
            return this.state.styleName.StartSide + ':' + this.getPercentByValue(value) + '%;';
        },
        setEvents:function(){
            var s = this.state;
            if (s.changable !== false) {
                $('body').off(this.getEvent('mousedown'), "#" + s.id + " .r-slider-button");
                $('body').on(this.getEvent('mousedown'), "#" + s.id + " .r-slider-button", this.buttonmousedown.bind(this));
                $('body').off(this.getEvent('mousedown'), "#" + s.id + " .r-slider-space");
                $('body').on(this.getEvent('mousedown'), "#" + s.id + " .r-slider-space", this.spacemousedown.bind(this));
                $('body').off(this.getEvent('mousedown'), "#" + s.id + " .r-slider-label");
                $('body').on(this.getEvent('mousedown'), "#" + s.id + " .r-slider-label", this.labelmousedown.bind(this));
            }
        },
        render: function () {
            var s = this.state;
            var oriention = s.direction==="left" || s.direction === "right" ? "horizontal" : "vertical";
            var str = '';
            str += '<div id="' + s.id + '" class="r-slider-container ' + oriention + '" style="' + this.getcontainerstyle() + '">';
            if(s.pinStep){
                var pinValue = s.start;
                while (pinValue <= s.end) {
                    str += '<div class="r-slider-pin" style="' + this.getPinStyle(pinValue) + '"></div>';
                    pinValue += s.pinStep;
                }
            }
            if(s.labelStep){
                var labelValue = s.start;
                while (labelValue <= s.end) {
                    str += '<div class="r-slider-label" style="' + s.styleName.StartSide + ':' + this.getPercentByValue(labelValue) + '%;"><div>' + labelValue + '</div></div>'
                    labelValue += s.labelStep;
                }
            }
            str += '<div class="r-slider-line" style="' + this.getLineStyle() + '"></div>';
            var length = s.value.length;
            for (var i = 0; i <= length; i++) {
                str += '<div data-index="' + i + '" class="r-slider-space" style="' + this.getSpaceStyle(i) + '">';
                if ((length === 1 || i !== 0) && i !== length) { str += '<div class="r-slider-fill" style="' + this.getFillStyle(i) + '"></div>'; }
                if (s.text) { str += '<div class="r-slider-text" style="' + this.getTextStyle(i) + '">'+(s.text[i] || "")+'</div>'; }
                str += '</div>';
                if(i === length){break;}
                if (s.showButton !== false) {
                    str += '<div data-index="' + i + '" data-value="' + s.value[i] + '" class="r-slider-button" style="' + this.getButtonStyle(i) + '">';
                    if (s.showValue) {str += '<div style="z-index:1000;' + (s.fixValue !== true ? 'display:none;' : '') + '" class="r-slider-number">' + s.value[i] + '</div>';}
                    str += '</div>';
                }
            }
            str += '</div>';
            this.html = str;
            this.setEvents();
        },
    }
    a.update(config);
    return { update: a.update.bind(a), getState: a.getState.bind(a), getHTML: a.getHTML.bind(a)};
}





