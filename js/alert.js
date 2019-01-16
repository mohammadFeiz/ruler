//template => (all required => type,title,value,callback) (slider => start,end,step,min,max)
var Alert = {
    state: {},
    open: function (obj) {
        this.state = {};
        for (prop in obj) { this.state[prop] = obj[prop]; }
        this.state.button = this.state.buttons || [];
        $("body").append(AlertPopup(this.state));
        AlertHeader({ title: this.state.title });
        AlertBody({ template: this.state.template });
        AlertFooter({ buttons: this.state.buttons });
    },
    close: function () {
        $("#alert").remove();
    }
}

function AlertPopup(props) {
    var s = props.style;
    var str = '<div id="alert">';
    str += '<div class="back-drop"></div>';
    str += '<div class="alert-header" style="float:left;position:relative;">';
    str += components.render({ id: "alert-close", iconClass: "mdi mdi-close", className: "icon alert-close", component: "Button", callback: Alert.close });
    str += components.render({ id: "alert-title", text: props.title, className: "text", component: "Button" });    
    str += '</div>';
    str += '<div class="alert-body" style="float:left;position:relative;">';
    if (typeof props.template === "string") { str += props.template; }
    else {
        for (var i = 0; i < props.template.length; i++) {
            var template = props.template[i];
            str += '<div data-index="' + i + '" class="alert-template-item">';
            str += '<div class="alert-template-title">' + (template.title || '') + '</div>';
            str += '<div class="alert-template-control">';
            str += template.type === "switch" ? '<div class="alert-switch-container"></div>' : '';
            str += '</div>';
            str += '<div class="alert-template-value"></div>';
            str += '</div>';
        }
    }
    str += '</div>';
    str += '<div class="alert-footer" style="float:left;position:relative;"></div>';
    str += '</div>';
    return str;
}


function AlertBody(props) {
    if (typeof props.template === "string") { return ''; }
    for (var i = 0; i < props.template.length; i++) {
        var template = props.template[i];
        template.id = "alert-template" + i;
        template.index = i;
        if (template.type === "slider") {
            template.container = ".alert-template-item[data-index=" + i + "] .alert-template-control";
            template.component = "Slider";
            template.ondrag = function (obj) {
                var value = obj.value[0];
                var index = obj.index;
                Alert.state.template[index].callback(value);
                $(".alert-template-item[data-index=" + index + "] .alert-template-value").html(value);
            }
            components.render(template);
            $(".alert-template-item[data-index=" + i + "] .alert-template-value").html(template.value);
        }
        else if (template.type === "switch") {
            template.container = ".alert-template-item[data-index=" + i + "] .alert-template-control .alert-switch-container";
            template.component = "Slider";
            template.start = 0;
            template.step = 1;
            template.end = 1;
            template.text = ["ON", "OFF"],
            template.value = (template.value) ? 1 : 0;
            template.style = { button_width: 24, button_height: 24, line_width: 0 };
            template.ondrag = function (obj) {
                var value = obj.value[0];
                var index = obj.index;
                Alert.state.template[index].callback(value===0?false:true);
            }
            components.render(template);
        }
    }
}

function AlertFooter(props) {
    for (var i = 0; i < props.buttons.length; i++) {
        var button = props.buttons[i];
        components.render({
            component: "Button",
            id: "alert-botton-" + i,
            text: button.text,
            className: "button alert-button alert-close",
            container: ".alert-footer",
            callback: button.callback,
        })
    }
}







