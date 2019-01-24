var full_keyboard = {
    state: {},
    open: function (obj) {
        this.state = {};
        for (prop in obj) { this.state[prop] = obj[prop]; }
        this.render();
    },
    render: function () {
        var str = '';
        str += '<div id="full-keyboard" class="">';
        str += components.render({ component: "DIV", id: "full-keyboard-back-drop", className: "back-drop", callback: full_keyboard.close });
        str += '<div class="full-keyboard-row">';
        str += components.render({ component: "Button", className: "text", id: "full-keyboard-title", text: this.state.title });
        str += components.render({ id: "full-keyboard-close", component: "Button", iconClass: "mdi mdi-close", className: "icon", callback: full_keyboard.close });
        str += '</div>';
        str += '<div class="full-keyboard-row">';
        str += '<div id="full-keyboard-show">' + this.state.text + '</div>';
        str += components.render({ id: "full-keyboard-ok", component: "Button", iconClass: "mdi mdi-send", className: "icon", callback: full_keyboard.submit.bind(full_keyboard) });
        str += '</div>';
        var list = [];
        for (var i = 1; i <= 10; i++) { var text = i; if (i === 10) { text = 0; } list.push(text); }
        str += '<div class="full-keyboard-row">';
        for (var i = 0; i < list.length; i++) {
            str += components.render({ id: "full-keyboard-key" + list[i], component: "Button", text: list[i], className: "button full-keyboard-key", callback: full_keyboard.keyDown, attrs: { 'data-key': list[i] } });
        }
        str += '</div>';
        list = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"];
        str += '<div class="full-keyboard-row">';
        for (var i = 0; i < list.length; i++) {
            str += components.render({ id: "full-keyboard-key" + list[i], component: "Button", text: list[i], className: "button full-keyboard-key", callback: full_keyboard.keyDown, attrs: {'data-key':list[i]} });
        }
        str += '</div>';
        list = ["A", "S", "D", "F", "G", "H", "J", "K", "L"];
        str += '<div class="full-keyboard-row">';
        for (var i = 0; i < list.length; i++) {
            str += components.render({ id: "full-keyboard-key" + list[i], component: "Button", text: list[i], className: "button full-keyboard-key", callback: full_keyboard.keyDown, attrs: { 'data-key': list[i] } });
        }
        str += '</div>';
        list = ["Z", "X", "C", "V", "B", "N", "M"];
        str += '<div class="full-keyboard-row">';
        str += components.render({ id: "full-keyboard-space", component: "Button", text: "space", className: "button full-keyboard-key full-keyboard-space", callback: full_keyboard.keyDown });
        for (var i = 0; i < list.length; i++) {
            str += components.render({ id: "full-keyboard-key" + list[i], component: "Button", text: list[i], className: "button full-keyboard-key", callback: full_keyboard.keyDown, attrs: { 'data-key': list[i] } });
        }
        str += components.render({ id: "full-keyboard-backspace", component: "Button", iconClass: "mdi mdi-backspace", className: "icon full-keyboard-key full-keyboard-backspace", callback: full_keyboard.keyDown });
        str += '</div>';
        str += '</div>';
        $("body").append(str);
    },
    close: function () {
        $("#full-keyboard").remove();
    },
    submit: function () {
        var value = $("#full-keyboard-show").html();
        if (value === "") { return; }
        this.state.callback(value);
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
            var value = element.attr("data-key");
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
