var keyboard = {
    negative: true,
    close: false,
    firstInter: true,
    state: {},
    updateState: function (obj) {
        for (var prop in obj) {
            this.state[prop] = obj[prop];
        }
        this.state.activeIndex = this.state.activeIndex || 0;
    },
    open: function (obj) {
        if (obj.fields === undefined) { alert("keybord fields is required"); }
        this.updateState(obj);
        this.render();
    },
    render: function () {
        var str = '';
        str += '<div id="keyboard">';
        str += '<div class="back-drop"></div>';
        str += KeyboardHeader({ title: this.state.title });
        str += KeyboardBody();
        str += KeyboardFooter({ fields: this.state.fields, activeIndex: this.state.activeIndex });
        str += '</div>';
        $("body").append(str);
        this.eventHandler("#keyboard-close", "mousedown", this.hide);
        this.eventHandler(".keyboard-number-key", "mousedown", this.getKey);
        this.eventHandler(".keyboard-number-key", "mouseup", this.keyUp);
        this.eventHandler(".keyboard-field", "mousedown", this.fieldMouseDown);
        this.eventHandler("#keyboard-ok", "mousedown", this.ok);
    },
    getClient: function (e, axis) {
        if (canvas.isMobile) {
            return e.changedTouches[0]["client" + axis];
        }
        else {
            return e["client" + axis];
        }
    },
    hide: function () {
        $("#keyboard").remove();
    },
    fieldMouseDown: function (e) {
        var element = $(e.currentTarget);
        $(".keyboard-field").removeClass("active");
        element.addClass("active");
        this.eventHandler("window", "mousemove", this.fieldMouseMove);
        this.eventHandler("window", "mouseup", this.fieldMouseUp);
        this.state.startOffset = this.getClient(e, "Y");
        this.state.activeIndex = element.attr("data-index");
        this.state.selectedFieldValue = parseFloat(element.find(".keyboard-number-box").html());
        this.state.firstInter = true;
    },
    fieldMouseMove: function (e) {
        var offset = this.state.startOffset - this.getClient(e,"Y");
        if (Math.abs(offset) < 3) { return; }
        var field = $(".keyboard-field .keyboard-number-box").eq(this.state.activeIndex);
        offset = Math.floor(offset / 12);
        field.html(this.state.selectedFieldValue + offset);
    },
    fieldMouseUp: function () {
        this.eventRemover("window","mousemove",this.fieldMouseMove);
        this.eventRemover("window","mouseup",this.fieldMouseUp);
    },
    getKey: function (e) {
        var element = $(e.currentTarget);
        element.addClass("active");
        var key = element.attr("data-key");
        var activeBox = $(".keyboard-field").eq(this.state.activeIndex).find(".keyboard-number-box");
        if (key === "none") { return; }

        if (key === "back") {
            if (this.state.firstInter === true) { activeBox.html(""); this.state.firstInter = false; }
            var currentValue = activeBox.html();
            if (currentValue === "") { activeBox.html("0"); return; }
            if (currentValue.length === 1) { activeBox.html("0"); return; }
            currentValue = currentValue.slice(0, currentValue.length - 1);
            activeBox.html(currentValue);
        }
        else if (key === "-/+") {
            var currentValue = activeBox.html();
            if (this.state.negative === false) { return; }
            if (currentValue === "") { return; }
            if (currentValue === "-") { activeBox.html(""); return; }
            currentValue = parseInt(currentValue);
            activeBox.html(currentValue * -1);
        }
        else {
            if (this.state.firstInter === true) { activeBox.html(""); this.state.firstInter = false; }
            var currentValue = activeBox.html();
            if (currentValue === "0" || currentValue === "-0") { currentValue = ""; }
            if (currentValue[0] === "-") {
                if (currentValue.length > 5) { return; }
            }
            else {
                if (currentValue.length > 4) { return; }
            }
            currentValue += key;
            activeBox.html(currentValue);
        }
    },
    keyUp: function () {
        $(".keyboard-number-key").removeClass("active");
    },
    ok: function () {
        var parameters = {};
        var length = this.state.fields.length;
        for (var i = 0; i < length; i++) {
            var field = this.state.fields[i];
            var value = $(".keyboard-number-box").eq(i).html();
            if (value === "" || value === "-") { value = 0; }
            parameters[field.prop] = parseFloat(value);

        }
        this.state.subscribe(parameters);
        if (this.state.close) { this.hide(); }
    },
    eventHandler: function (selector, event, action) {
        if (canvas.isMobile) {
            if (event === "mousedown") { event = "touchstart"; }
            else if (event === "mousemove") { event = "touchmove"; }
            else if (event === "mouseup") { event = "touchend"; }
        }
        if (selector === "window") { $(window).unbind(event, $.proxy(action,this)).bind(event, $.proxy(action,this)); }
        else if (typeof selector === "string") { $(selector).unbind(event, $.proxy(action,this)).bind(event, $.proxy(action,this)); }
        else { selector.unbind(event, $.proxy(action,this)).bind(event, $.proxy(action,this)); }
    },
    eventRemover: function (selector, event, action) {
        if (canvas.isMobile) {
            if (event === "mousedown") { event = "touchstart"; }
            else if (event === "mousemove") { event = "touchmove"; }
            else if (event === "mouseup") { event = "touchend"; }
        }
        if (selector === "window") { $(window).unbind(event, $.proxy(action,this)); }
        else if (typeof selector === "string") { $(selector).unbind(event, $.proxy(action,this)); }
        else { selector.unbind(event, $.proxy(action,this)); }
    },
}

function KeyboardHeader(props) {
    var str = '';
    str += '<div id="keyboard-header">';
    str += KeyboardTitle({ title: props.title });
    str += KeyboardClose();
    str += '</div>';
    return str;
}

function KeyboardClose() {
    var str = '';
    str += '<div id="keyboard-close"><span class="mdi mdi-close"></span></div>';
    return str;
}

function KeyboardTitle(props) {
    var str = '';
    str += '<div id="keyboard-title">' + props.title + '</div>';
    return str;
}

function KeyboardBody() {
    var str = '';
    str += '<div id="keyboard-body">';
    for (var i = 1; i < 10; i++) {
        str += KeyboardKey({ dataKey: i, text: i });
    }
    str += KeyboardKey({ dataKey: "-/+", text: "-/+" });
    str += KeyboardKey({ dataKey: "0", text: "0" });
    str += KeyboardKey({ dataKey: "back", text: '<span class="mdi mdi-backspace"></span>' });
    str += '</div>';
    return str;
}

function KeyboardKey(props) {
    var str = '';
    str += '<div class="keyboard-number-key" data-key="' + props.dataKey + '">' + props.text + '</div>';
    return str;
}

function KeyboardFooter(props) {
    var str = '';
    str += '<div id="keyboard-footer">';
    for (var i = 0; i < props.fields.length; i++) {
        var field = props.fields[i];
        str += KeyboardField({ title: field.title, value: field.value, active: props.activeIndex === i ? true : false, index: i });
    }
    str += KeyboardOK();
    str += '</div>';
    return str;
}

function KeyboardField(props) {
    var str = '';
    str += '<div data-index="' + props.index + '" class="keyboard-field' + ((props.active) ? ' active' : '') + '">';
    str += '<div class="keyboard-label">' + props.title + '</div>';
    str += '<div class="keyboard-number-box">' + ((props.value === undefined) ? '0' : props.value) + '</div>';
    str += '</div>';
    return str;
}

function KeyboardOK() {
    var str = '';
    str += '<div id="keyboard-ok">OK</div>';
    return str;
}