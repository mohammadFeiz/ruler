//template => (all required => type,title,value,callback) (slider => start,end,step,min,max)
var Alert = {
    state: {},
    open: function (obj) {
        this.state = {};
        for (prop in obj) { this.state[prop] = obj[prop]; }
        this.state.button = this.state.buttons || [];
        $("body").append(AlertPopup(this.state));
        
    },
    close: function () {
        $("#alert").remove();
    }
}

function AlertPopup(props) {
    var s = props.style;
    var str = '<div id="alert">';
    str += '<div class="back-drop"></div>';
    str += '<div class="alert-header header" style="float:left;position:relative;">';
    str += components.render({ id: "alert-close", iconClass: "mdi mdi-close", className: "icon alert-close", component: "Button", callback: Alert.close });
    str += components.render({ id: "alert-title", text: props.title, className: "text", component: "Button" });    
    str += '</div>';
    str += '<div class="alert-body" style="float:left;position:relative;">';
    if (typeof props.template === "string") { str += props.template; }
    else if (!Array.isArray(props.template)) {
        if (props.template.type === "color pallete") {
            var colors = ["#ff0000", "#ff4e00", "#ffa800", "#fcff00", "#f5eeb2", "#12ff00", "#2e4f0b", "#00f0ff", "#008aff", "#2400ff", "#1c4663",
            "#41366f", "#7c6c92", "#8400ff", "#ff6868", "#ff00ba", "#72441c", "#482a0b", "#8a8a8a", "#ffffff"];
            for (var i = 0; i < colors.length; i++) {
                str += components.render({
                    component: "DIV", id: "color-pallete-item-" + i, className: "color-pallete-item", attrs: { "data-color": colors[i] }, style: "background:" + colors[i] + ";",
                    callback: props.template.callback
                });
            }
        }
    }
    else {
        for (var i = 0; i < props.template.length; i++) {
            var template = props.template[i];
            str += '<div data-index="' + i + '" class="alert-template-item">';
            str += '<div class="alert-template-title">' + (template.title || '') + '</div>';
            str += '<div class="alert-template-control">';
            str += AlertControl[template.type](template,i);
            str += '</div>';
            str += '<div class="alert-template-value">' + (template.value === undefined || template.type !== 'slider' ? '' : template.value) + '</div>';
            str += '</div>';
        }
    }
    str += '</div>';
    str += '<div class="alert-footer" style="float:left;position:relative;">';
    for (var i = 0; i < props.buttons.length; i++) {
        var button = props.buttons[i];
        str+=components.render({
            component: "Button",
            id: "alert-botton-" + i,
            text: button.text,
            className: "button alert-button alert-close",
            callback: button.callback,
        })
    }
    str += '</div>';
    str += '</div>';
    return str;
}

var AlertControl = {
    slider: function (template,index) {
        template.id = "alert-template" + index;
        template.index = index;
        template.component = "Slider";
        template.ondrag = function (obj) {
            var value = obj.value[0];
            var index = obj.index;
            Alert.state.template[index].callback(value);
            $(".alert-template-item[data-index=" + index + "] .alert-template-value").html(value);
        }
        return components.render(template);
    },
    switch: function (template,index) {
        template.id = "alert-template" + index;
        template.index = index;
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
            Alert.state.template[index].callback(value === 0 ? false : true);
        }
        return '<div class="alert-switch-container">' + components.render(template); +'</div>';
    },
    numberbox:function(template,index){
        template.id = "alert-template" + index;
        template.index = index;
        template.component = "Numberbox";
        template.className="numberbox";
        template.callback = function (obj,state) {
            $("#"+state.id).html(obj.value);
            var index = parseInt(state.id.replace("alert-template",""));
           // Alert.state.template[index].callback(obj.value);
        };
        return components.render(template);
    }
};