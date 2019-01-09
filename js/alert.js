
    var Alert = {
        size: 36,
        state:{},
        render: function () {
            $("body").append(AlertPopup(this.state));
            components.render({ id: "alert-close", iconClass: "mdi mdi-close", className: "item icon alert-close", component: "Button", container: ".alert-header",callback:Alert.close });
            components.render({ id: "alert-title", text: this.state.title, className: "item text", component: "Button", container: ".alert-header" });
            for (var i = 0; i < this.state.buttons.length; i++) {
                var button = this.state.buttons[i];
                components.render({
                    component: "Button",
                    id: "alert-botton-" +i,
                    text: button.text,
                    className:"item button alert-button alert-close",
                    container: ".alert-footer",
                    callback: button.callback,
                })
            }
            
        },
        open: function (obj) {
            for (prop in obj) { this.state[prop] = obj[prop]; }
            this.state.button = this.state.buttons || [];
            if (!Array.isArray(this.state.template)) { this.state.template = [this.state.template]; }
            this.render();
            if (typeof this.state.template === "string") { $(".alert-body").append(this.state.template); }
            else {
                for (var i = 0; i < this.state.template.length; i++) {
                    var template = this.state.template[i];
                    AlertItem[template.type](template,this.state.style);                
                }
            }
            
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
    str += '</div>';
    str += '<div class="alert-body" style="float:left;position:relative;"></div>';
    str += '<div class="alert-footer" style="float:left;position:relative;"></div>';
    str += '</div>';
    return str;
}

var AlertItem = {
    slider: function (props, style) {
        
        var str = '';
        str += '<div class="alert-template-item">';
        str += AlertItemTitle(props,style);
        str += '<div class="alert-slider" data-id="'+props.id+'"></div>';
        str += AlertItemValue(props,style);
        str += '</div>';
        $(".alert-body").append(str);
        var A = new slider({
            container: $(".alert-slider[data-id="+props.id+"]"),
            start: props.start, step: props.step, value: props.value,
            end: props.end, min: props.min, max: props.max,
            ondrag: function (obj) { var value = obj.value[0]; props.onchange(value); $(".alert-item-value[data-id=" + props.id + "]").html(value); },
            style: { button_width: 24, button_height: 24, line_width: 4 }
        });
    },
    switch: function (props,style) {
       
        
        var str = '';
        str += '<div class="alert-template-item">';
        str += AlertItemTitle(props, style);
        str += '<div class="alert-switch-container">';
        str += '<div class="alert-switch" data-id="'+props.id+'"></div>';
        str += '</div>';
        str += '</div>';
        $(".alert-body").append(str);
        var A = new slider({
            container: $(".alert-switch[data-id="+props.id+"]"),
            start: 0,
            step: 1,
            end: 1,
            text: props.text,
            value: (props.value) ? 1 : 0,
            ondrag: function (obj) {
                var value = obj.value[0];
                props.onchange(value ? true : false);
            },
            style: { button_width: 24, button_height: 24, line_width: 0 }
        });
    }    
}


function AlertItemTitle(props,style) {
    
    return '<div class="alert-item-title">' + (props.title || '') + '</div>';
}

function AlertItemValue(props, style) {
    
    return '<div class="alert-item-value" data-id="' + props.id + '" data-value="' + (props.value || '') + '">' + (props.value||'') + '</div>';
}







