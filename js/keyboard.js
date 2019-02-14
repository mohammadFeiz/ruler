var keyboard = {
    state: { activeIndex: 0, firstInter: true, close: false, negative: true, isMobile:false},
    open: function (obj) {
        if (obj.fields === undefined) { alert("keybord fields is required"); }
        for (var prop in obj) {this.state[prop] = obj[prop];}
        this.render();
    },
    render: function () {
        var s = this.state;
        var backDrop = {className:"back-drop"};
        var close = { 
            id: "keyboard-close", component: "Button", 
            iconClass: "mdi mdi-close", className: "icon", 
            callback: this.close.bind(this) 
        };
        var title = {id: "keyboard-title",component: "Button",text:s.title,className:"text"}
        var header = {className:"header",id:"keyboard-header",html:[close,title]};
        var keys = [];
        for (var i = 1; i < 10; i++) {
            keys.push({ 
                id: "keyboard-key" + i, className: "button keyboard-key",
                text: i , attrs: {"data-key":i},component: "Button", 
                callback: this.getKey.bind(this) 
            });
        }
        keys.push(
            { 
                id: "keyboard-key-minus", className: "button keyboard-key",
                text: "-/+",attrs: { "data-key": "-/+" },component: "Button", 
                callback: this.getKey.bind(this), 
                show:s.negative === true 
            },
            { 
                id: "keyboard-key0", className: "button keyboard-key",
                text: "0",attrs: { "data-key": "0" },component: "Button", 
                callback: this.getKey.bind(this), 
            },
            { 
                id: "keyboard-key-backspace",className: "button keyboard-key", 
                iconClass: "mdi mdi-backspace", attrs: { "data-key": "back" },component: "Button", 
                callback: this.getKey.bind(this),  
            }
        );
        var body = {id:"keyboard-body",html:keys};
        var fields = s.fields.map(function(field,i){
            var className = 'keyboard-field' + (s.activeIndex === i ? ' active' : '');
            return {
                className:className,attrs:{'data-index':i},id:'keyboard-field-'+i,
                html:[
                    { 
                        id: "keyboard-label" + i, component: "Button", 
                        text: field.title, className: "text keyboard-label" 
                    },
                    { 
                        id: "keyboard-numberbox" + i, component: "Numberbox", 
                        value: field.value===undefined?0:field.value, 
                        className: "numberbox keyboard-numberbox" 
                    }
                ],
                callback:keyboard.fieldMouseDown.bind(keyboard)
            }
        });
        var ok = { 
            id: "keyboard-ok", component: "Button", text: "OK", className: "button", 
            callback: this.ok.bind(this) 
        };
        var footer = {id:"keyboard-footer",html:fields.concat(ok)}
        components.render({id:"keyboard",html:[backDrop,header,body,footer]},"body");
    },
    getClient: function (e, axis) {
        axis = axis.toUpperCase();
        return e.clientX ? e["client" + axis] : e.changedTouches[0]["client" + axis];
    },
    close: function () {
        var s = this.state;
        s.activeIndex = 0;
        s.firstInter = true;
        components.remove("keyboard");
    },
    fieldMouseDown: function (e) {
        var element = $(e.currentTarget);
        $(".keyboard-field").removeClass("active");
        element.addClass("active");
        this.eventHandler("window", "mousemove", $.proxy(this.fieldMouseMove,this));
        this.eventHandler("window", "mouseup", $.proxy(this.fieldMouseUp,this));
        this.state.startOffset = this.getClient(e, "Y");
        this.state.activeIndex = element.attr("data-index");
        this.state.selectedFieldValue = parseFloat(element.find(".keyboard-numberbox").html());
        this.state.firstInter = true;
    },
    fieldMouseMove: function (e) {
        var offset = this.state.startOffset - this.getClient(e,"Y");
        if (Math.abs(offset) < 3) { return; }
        var field = $(".keyboard-field .keyboard-numberbox").eq(this.state.activeIndex);
        offset = Math.floor(offset / 12);
        field.html(this.state.selectedFieldValue + offset);
    },
    fieldMouseUp: function () {
        this.eventRemover("window","mousemove",this.fieldMouseMove);
        this.eventRemover("window","mouseup",this.fieldMouseUp);
    },
    getKey: function (e) {
        var element = $(e.currentTarget);
        var key = element.attr("data-key");
        var activeBox = $(".keyboard-field").eq(this.state.activeIndex).find(".keyboard-numberbox");
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
            var value = parseFloat($(".keyboard-numberbox").eq(i).html());
            if(field.max !== undefined && value > field.max){value = field.max}
            if(field.min !== undefined && value < field.min){value = field.min}
            if (value === "" || value === "-") { value = 0; }
            parameters[field.prop] = value;
            $(field.dataTarget).html(value); 
        }
        this.state.callback(parameters);
        if (this.state.close) { this.close(); }
    },
    eventHandler: function (selector, e, action) {
        var mobileEvents = { down: "touchstart", move: "tocuhmove", up: "tocuhend" };
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









