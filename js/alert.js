//template => (all required => type,title,value,callback) (slider => start,end,step,min,max)
var Alert = {
    state: {},
    open: function (obj) {
        this.state = {};
        for (prop in obj) { this.state[prop] = obj[prop]; }
        this.state.button = this.state.buttons || [];
        AlertPopup(this.state);
        
    },
    close: function () {
        components.remove("alert");
    }
}

function AlertPopup(props) {
    var s = props.style;
    var headerHTML = [
        { 
            component: "Button",id: "alert-close", iconClass: "mdi mdi-close", 
            className: "icon alert-close",callback: Alert.close 
        },
        { 
            component: "Button",id: "alert-title", text: props.title, className: "text" 
        }
    ];

    var bodyHTML = [];
    if (typeof props.template === "string") { bodyHTML.push(props.template); }
    else if (!Array.isArray(props.template)) {
        if (props.template.type === "color pallete") {
            var colors = ["#ff0000", "#ff4e00", "#ffa800", "#fcff00", "#f5eeb2", "#12ff00", "#2e4f0b", "#00f0ff", "#008aff", "#2400ff", "#1c4663",
            "#41366f", "#7c6c92", "#8400ff", "#ff6868", "#ff00ba", "#72441c", "#482a0b", "#8a8a8a", "#ffffff"];
            for (var i = 0; i < colors.length; i++) {
                bodyHTML.push({
                    id: "color-pallete-item-" + i, className: "color-pallete-item", 
                    attrs: { "data-color": colors[i],style: "background:" + colors[i] + ";" },
                    callback: props.template.callback
                });
            }
        }
    }
    else {
        for (var i = 0; i < props.template.length; i++) {
            var template = props.template[i];
            var templateValue = template.value === undefined || template.type !== 'slider' ? '' : template.value;
            bodyHTML.push({
                className:"alert-template-item",attrs:{"data-index":i},
                html:[
                    {className:"alert-template-title",html:[template.title || '']},
                    {className:"alert-template-control",html:[AlertControl[template.type](template,i)]},
                    {className:"alert-template-value",html:[templateValue]}
                ]
            });
        }
    } 
    var footerHTML = [];
    for (var i = 0; i < props.buttons.length; i++) {
        var button = props.buttons[i];
        footerHTML.push({
            component: "Button",
            id: "alert-botton-" + i,
            text: button.text,
            className: "button alert-button alert-close",
            callback: button.callback,
        })
    }
    
    components.render({
        id:"alert",
        html:[
            {className:"back-drop"},
            {className:"alert-header header",html:headerHTML},
            {className:"alert-body",html:bodyHTML},
            {className:"alert-footer",html:footerHTML}
        ]
    },"body");
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
        return template;
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
        return {className:"alert-switch-container",html:[template]}
    },
    numberbox:function(template,index){
        template.id = "alert-template" + index;
        template.dataTarget = "#alert-template" + index;
        template.component = "Numberbox";
        template.className="numberbox";
        return template;
    }
};