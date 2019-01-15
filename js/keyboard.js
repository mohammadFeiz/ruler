var keyboard = {
    
    
    state: { activeIndex: 0, firstInter: true, close: false, negative: true, },
    
    open: function (obj) {
        if (obj.fields === undefined) { alert("keybord fields is required"); }
        for (var prop in obj) {this.state[prop] = obj[prop];}
        this.render();
    },
    render: function () {
        var s = this.state,str = '';
        str += '<div id="keyboard">';
        str += '<div class="back-drop"></div>';
        str += '<div id="keyboard-header"></div>';
        str += KeyboardBody({ negative: s.negative });
        str += '<div id="keyboard-footer">';
        for (var i = 0; i < s.fields.length; i++) {
            var field = s.fields[i];
            str += '<div data-index="' + i + '" class="keyboard-field' + ((s.activeIndex === i) ? ' active' : '') + '">';
            str += '<div class="keyboard-number-box">' + (field.value || 0) + '</div>';
            str += '</div>';
        }
        str += '</div>';
        str += '</div>';
        $("body").append(str);
        components.render({ id: "keyboard-close", component: "Button", iconClass: "mdi mdi-close",className:"icon",callback:this.close.bind(this),container:"#keyboard-header" });
        components.render({ id: "keyboard-title", component: "Button",text:s.title, className: "text", container: "#keyboard-header" });
        components.render({ id: "keyboard-ok", component: "Button", text: "OK", className: "button", container: "#keyboard-footer",callback:this.ok.bind(this) });
        for (var i = 0; i < s.fields.length; i++) {
            var field = s.fields[i];
            components.render({ id: "keyboard-label"+i, component: "Button", text: field.title, className: "text keyboard-label", container: ".keyboard-field[data-index="+i+"]" });
        }
        this.eventHandler(".keyboard-number-key", "mousedown", this.getKey.bind(this));
        this.eventHandler(".keyboard-number-key", "mouseup", this.keyUp);
        this.eventHandler(".keyboard-field", "mousedown", this.fieldMouseDown);
    },
    getClient: function (e, axis) {
        axis = axis.toUpperCase();
        return e.clientX ? e["client" + axis] : e.changedTouches[0]["client" + axis];
    },
    close: function () {
        var s = this.state;
        s.activeIndex = 0;
        s.firstInter = true;
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
            if (this.firstInter === true) { activeBox.html(""); this.state.firstInter = false; }
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
        this.state.callback(parameters);
        if (this.state.close) { this.close(); }
    },
    eventHandler: function (selector, e, action) {        
        var mobileEvents = {mousedown:"touchstart",mousemove:"tocuhmove",mouseup:"tocuhend"};
        var element = typeof selector === "string" ? (selector === "window" ? $(window) : $(selector)) : selector;
        var event = this.state.isMobile ? mobileEvents[e] : e;
        element.unbind(event, action).bind(event, action);
    },
    eventRemover: function (selector, e, action) {
        var mobileEvents = { down: "touchstart", move: "tocuhmove", up: "tocuhend" };
        var element = typeof selector === "string" ? (selector === "window" ? $(window) : $(selector)) : selector;
        var event = this.state.isMobile ? mobileEvents[e] : e;
        element.unbind(event, action);
    },
}


function KeyboardTitle(props) {
    var str = '';
    str += '<div id="keyboard-title">' + props.title + '</div>';
    return str;
}

function KeyboardBody(props) {
    var str = '';
    str += '<div id="keyboard-body">';
    for (var i = 1; i < 10; i++) {
        str += KeyboardKey({ dataKey: i, text: i });
    }
    str += props.negative === true?KeyboardKey({ dataKey: "-/+", text: "-/+" }):'';
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





