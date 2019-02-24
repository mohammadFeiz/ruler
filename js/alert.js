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
    var close = { 
        component: "Button",id: "alert-close", iconClass: "mdi mdi-close", 
        className: "icon",callback: Alert.close 
    };
    var title = { 
        component: "Button",id: "alert-title", text: props.title, className: "text left" 
    };
    var buttons = props.buttons.map(function(button,i){
        return {
            component: "Button",
            id: "alert-botton-" + i,
            text: button.text,
            attrs:{'data-value':button.value},
            className: "button",
            callback: button.callback,
        }
    });

    if (typeof props.template === "string") { var bodyHTML = [props.template]; }
    else if (!Array.isArray(props.template)) {
        if (props.template.type === "color pallete") {
            var bodyHTML = [
                "#ff0000", "#ff4e00", "#ffa800", "#fcff00","#f5eeb2",
                "#12ff00", "#2e4f0b", "#00f0ff", "#008aff", "#2400ff", 
                "#1c4663","#41366f", "#7c6c92", "#8400ff", "#ff6868", 
                "#ff00ba","#72441c","#482a0b", "#8a8a8a", "#ffffff"
            ].map(function(color,i){
                return {
                    id: "color-pallete-item-" + i, className: "color-pallete-item", 
                    attrs: { "data-color": color,style: "background:" + color + ";" },
                    callback: props.template.callback
                }
            });
        }
        else if(props.template.type === "list"){
            var bodyHTML = props.template.items.map(function(item,i){
                return {
                    id: "alert-list-item-" + i, className: "alert-list-item", 
                    attrs: { "data-value": item.value},
                    html:[item.text],
                    callback: props.template.callback
                }
            });
        }
    }
    else {
        var bodyHTML = props.template.map(function(template,i){
            
            return {
                className:'alert-template-item',attrs:{'data-index':i},
                html:[
                    {className:'alert-template-title',html:[template.title || '']},
                    {className:'alert-template-control',html:[AlertControl[template.type](template,i)]},
                    {
                        className:'alert-template-value',
                        html:[template.value === undefined ?'':template.value],
                        show:template.type === 'slider'
                    }
                ]
            }
        });
    } 
    
    
    components.render({
        id:"alert",
        html:[
            {className:"back-drop"},
            {className:"alert-header header",html:[close,title]},
            {className:"alert-body",html:bodyHTML},
            {className:"alert-footer",html:buttons}
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
        template.keyboard = true;
        return template;
    }
};