var full_keyboard = {
    state: {},
    open: function (obj) {
        this.state = {};
        for (prop in obj) { this.state[prop] = obj[prop]; }
        this.render();
    },
    render: function () {
        var backDrop = {id: "full-keyboard-back-drop",className: "back-drop", callback: full_keyboard.close};
        var title = {component: "Button",id: "full-keyboard-title", className:"text", text: this.state.title};
        var close = { 
            component: "Button",id: "full-keyboard-close",className: "icon",  
            iconClass: "mdi mdi-close",callback: full_keyboard.close 
        };
        var show = {id: "full-keyboard-show",html:[this.state.text]};
        var ok = { 
            component: "Button",id: "full-keyboard-ok",className: "icon",   
            iconClass: "mdi mdi-send", callback: full_keyboard.submit.bind(full_keyboard) 
        };
        var numbers = [1,2,3,4,5,6,7,8,9,0].map(function(num){
            return { 
                component: "Button", id: "full-keyboard-key" + num,
                className: "button full-keyboard-key",
                text: num, callback: full_keyboard.keyDown,attrs: { 'data-key': num } 
            }
        })
        var chars1 = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"].map(function(char){
            return { 
                component: "Button", id: "full-keyboard-key" + char,
                className: "button full-keyboard-key",
                text: char, callback: full_keyboard.keyDown,attrs: { 'data-key': char } 
            }
        });
        var chars2 = ["A", "S", "D", "F", "G", "H", "J", "K", "L"].map(function(char){
            return { 
                component: "Button", id: "full-keyboard-key" + char,
                className: "button full-keyboard-key",
                text: char, callback: full_keyboard.keyDown,attrs: { 'data-key': char } 
            }
        });
        var chars3 = ["Z", "X", "C", "V", "B", "N", "M"].map(function(char){
            return { 
                component: "Button", id: "full-keyboard-key" + char,
                className: "button full-keyboard-key",
                text: char, callback: full_keyboard.keyDown,attrs: { 'data-key': char } 
            }
        })
        var space = { 
            component: "Button",id: "full-keyboard-space", 
            className: "button full-keyboard-key full-keyboard-space", 
            text: "space",  callback: full_keyboard.keyDown 
        };
        var backSpace = { 
            id: "full-keyboard-backspace", component: "Button", iconClass: "mdi mdi-backspace", 
            className: "icon full-keyboard-key full-keyboard-backspace", 
            callback: full_keyboard.keyDown 
        };
        var row1 = {className: "full-keyboard-row",html:[title,close]};
        var row2 = {className: "full-keyboard-row",html:[show,ok]};
        var row3 = {className: "full-keyboard-row",html:numbers};
        var row4 = {className: "full-keyboard-row",html:chars1};
        var row5 = {className: "full-keyboard-row",html:chars2};
        var row6 = {className:"full-keyboard-row",html:[space].concat(chars3,backSpace)};
        components.render(
            {id:"full-keyboard",html:[backDrop,row1,row2,row3,row4,row5,row6,]},
            "body"
        );
    },
    close: function () {components.remove("full-keyboard");},
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
}
