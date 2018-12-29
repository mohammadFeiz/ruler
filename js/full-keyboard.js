var full_keyboard = {
    state:{},
    updateState: function (obj) {
        for (var prop in obj) {
            this.state[prop] = obj[prop];
        }
        this.state.value = this.state.value || "";
        this.state.title = this.state.title || "";
    },
    open: function (obj) {
        this.updateState(obj);
        this.render();
        this.eventHandler("#full-keyboard-close", "mousedown", this.close);
        this.eventHandler("#full-keyboard-ok", "mousedown", this.submit);
        this.eventHandler(".full-keyboard-key", "mousedown", this.keyDown);
        this.eventHandler("window", "mouseup", this.keyUp);
    },
    render: function () {
        var str = '';
        str += '<div id="full-keyboard" class="">';
        str += '<div class="back-drop"></div>';
        str += FullKeyboardHeader({title:this.state.title});
        str += FullKeyboardDisplay({value:this.state.value});
        var list = [];
        for (var i = 1; i <= 10; i++) {
            var text = i;
            if (i === 10) { text = 0; }
            list.push(text);
        }
        str += FullKeyboardRow({ list: list,lastRow:false });
        list = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"];
        str += FullKeyboardRow({ list: list, lastRow: false });
        list = ["A", "S", "D", "F", "G", "H", "J", "K", "L"];
        str += FullKeyboardRow({ list: list, lastRow: false });
        list = ["Z", "X", "C", "V", "B", "N", "M"];
        str += FullKeyboardRow({ list: list, lastRow: true });
        str += '</div>';
        $("body").append(str);
    },
    close: function () {
        $("#full-keyboard").remove();
    },
    submit: function () {
        var value = $("#full-keyboard-show").html();
        if (value === "") { return; }
        this.state.subscribe(value);
        $("#full-keyboard").remove();
    },
    keyDown: function (e) {
        var element = $(e.currentTarget);
        var id = element.attr("id");
        var display = $("#full-keyboard-show");
        var displayValue = display.html();
        if (id === "full-keyboard-space") {
            if (displayValue[displayValue.length - 1] === " " || displayValue.length === 0) { return; }
            var value = " ";
        }
        else if (id === "full-keyboard-backspace") {
            if (displayValue.length === 0) { return; }
            display.html(displayValue.slice(0, displayValue.length - 1));
            return;
        }
        else {
            var value = element.html();
            value = value.toLowerCase();
        }
        display.html(displayValue + value);
    },
    keyUp: function () {

    },
    eventHandler: function (selector, event, action) {
        if (canvas.isMobile) {
            if (event === "mousedown") { event = "touchstart"; }
            else if (event === "mousemove") { event = "touchmove"; }
            else if (event === "mouseup") { event = "touchend"; }
        }
        if (selector === "window") { $(window).unbind(event, $.proxy(action, this)).bind(event, $.proxy(action, this)); }
        else if (typeof selector === "string") { $(selector).unbind(event, $.proxy(action, this)).bind(event, $.proxy(action, this)); }
        else { selector.unbind(event, $.proxy(action, this)).bind(event, $.proxy(action, this)); }
    },
    eventRemover: function (selector, event, action) {
        if (canvas.isMobile) {
            if (event === "mousedown") { event = "touchstart"; }
            else if (event === "mousemove") { event = "touchmove"; }
            else if (event === "mouseup") { event = "touchend"; }
        }
        if (selector === "window") { $(window).unbind(event, $.proxy(action, this)); }
        else if (typeof selector === "string") { $(selector).unbind(event, $.proxy(action, this)); }
        else { selector.unbind(event, $.proxy(action, this)); }
    },
}
function FullKeyboardRow(props) {
    var str = '';
    str += '<div class="full-keyboard-row">';
    if (props.lastRow) {
        str += '<div class="full-keyboard-key full-keyboard-space" id="full-keyboard-space">space</div>';
    }
    for (var i = 0; i < props.list.length; i++) {
        str += FullKeyboardKey({text:props.list[i]});
    }
    if (props.lastRow) {
        str += '<div class="full-keyboard-key full-keyboard-back-space" id="full-keyboard-backspace">';
        str += '<span class="mdi mdi-backspace"></span>';
        str += '</div>';
    }
    str += '</div>';
    return str;
}

function FullKeyboardKey(props) {
    var str = '';
    str += '<div class="full-keyboard-key">' + props.text + '</div>';
    return str;
}

function FullKeyboardHeader(props) {
    var str = '';
    str += '<div class="full-keyboard-row">';
    str += '<div id="full-keyboard-title">'+props.title+'</div>';
    str += '</div>';
    return str;
}

function FullKeyboardDisplay(props) {
    var str = '';
    str += '<div class="full-keyboard-row">';
    str += '<div id="full-keyboard-close">';
    str += '<span class="mdi mdi-close"></span>';
    str += '</div>';
    str += '<div id="full-keyboard-show">'+props.value+'</div>';
    str += '<div id="full-keyboard-ok">';
    str += '<span class="mdi mdi-send"></span>';
    str += '</div>';
    str += '</div>';
    return str;
}