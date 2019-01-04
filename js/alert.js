
function Alert(obj) {
    var a = {
        size: 36,
        state:{},
        render: function () {
            var str = AlertPopup(this.state);
            var s = this.state.style;
            $("body").append(str);
            components.render({ id: "alertClose", float: s.direction === 'rtl' ? 'left' : 'right', iconClass: "mdi mdi-close", component: "Icon",container:".alert-header",callback:this.close });
            for (var i = 0; i < this.state.buttons.length; i++) {
                var button = this.state.buttons[i];
                components.render({
                    component: "Button",
                    id: "alert-botton" +i,
                    text: button.text,
                    className:"alert-close",
                    float: s.direction === 'rtl' ? 'left' : 'right',
                    width: (this.state.width - (2 * s.padding)) / 3 - (2 * s.hMargin),
                    container: ".alert-footer",
                    callback: button.callback,
                    background: true,
                    style: { light_color: "#36383d", dark_color: this.state.style.light_color }
                })
            }
            app.eventHandler("#alert .alert-close","mousedown", this.close);

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
    a.open(obj);
    return a;
}

function AlertPopup(props) {
    var s = props.style;
    function getStyle() { return 'position: fixed;top: ' + props.top + 'px;width:' + props.width + 'px;left:calc(50% - ' + (props.width / 2) + 'px);'; }
    function getHeaderStyle() { return 'z-index: 10;position: relative;width: 100%;height:' + s.size + 'px;'; }
    function getTitleStyle() { return 'float: ' + (s.direction === 'rtl' ? 'right' : 'left') + ';line-height:' + s.size + 'px;margin-' + (s.direction === 'rtl' ? 'right' : 'left') + ':' + (s.size/4) + 'px;'; }
    function getBodyStyle() { return 'z-index: 10;position: relative;padding:' + s.padding + 'px;width:calc(100% - ' + (2* s.padding) + 'px);'; }
    function getFooterStyle() { return 'z-index: 10;position: relative;padding:' + s.padding + 'px;width:calc(100% - ' + (2 * s.padding) + 'px);height:' + s.size + 'px;'; }
    var str = '<div id="alert" style="' + getStyle() + '">';
    str += '<div class="back-drop"></div>';
    str += '<div class="alert-header" style="'+getHeaderStyle()+'">';
    str += '<div class="header-title" style="'+getTitleStyle()+'">' + props.title + '</div>';
    str += '</div>';
    str += '<div class="alert-body" style="'+getBodyStyle()+'"></div>';
    str += '<div class="alert-footer" style="'+getFooterStyle()+'"></div>';
    str += '</div>';
    return str;
}

var AlertItem = {
    slider: function (props, style) {
        function getStyle() {
            var str = '';
            str += 'position:relative;';
            str += 'width:calc(100% - 110px);';
            str += 'height:' + style.size + 'px;';
            str += 'float:left;';
            str += 'line-height:' + style.size + 'px;';
            str += 'color:' + style.light_color + ';';
            str += 'text-align:center;';
            return str;
        }
        var str = '';
        str += '<div class="alert-template-item">';
        str += AlertItemTitle(props,style);
        str += '<div class="alert-slider" style="'+getStyle()+'" data-id="'+props.id+'"></div>';
        str += AlertItemValue(props,style);
        str += '</div>';
        $(".alert-body").append(str);
        var A = new slider({
            container: $(".alert-slider[data-id="+props.id+"]"),
            start: props.start, step: props.step, value: props.value,
            end: props.end, min: props.min, max: props.max,
            ondrag: function (obj) { var value = obj.value[0]; props.onchange(value); $(".alert-item-value[data-id=" + props.id + "]").html(value); },
            style: { button_width: style.size * (2 / 3), button_height: style.size * (2 / 3), line_width: style.size * (1 / 9) }
        });
    },
    switch: function (props,style) {
        function getStyle() {
            var str = '';
            str += 'border-radius: 45px;';
            str += 'background: #222;';
            str += 'box-shadow: inset 2px 2px 10px 1px #222;';
            str += 'position:relative;';
            str += 'width:70px;';
            str += 'text-align:left;';
            str += 'font-size:' + (style.size / 3) + 'px;';
            str += 'float:left;';
            str += 'height:' + (style.size * (3 / 4)) + 'px;';
            str += 'margin-top:' + (style.size * (1 / 8)) + 'px;';
            return str;
        }
        function getContainerStyle(){
            var str = '';
            str += 'position:relative;';
            str += 'width:calc(100% - 110px - ' + (style.size / 6) + 'px);';
            str += 'height:' + style.size + 'px;';
            str += 'float:' + (style.direction === 'rtl' ? 'right' : 'left') + ';';
            str += 'line-height:' + style.size + 'px;';
            str += 'color:' + style.light_color + ';';
            str += 'text-align:center;';
            return str;
        }
        var str = '';
        str += '<div class="alert-template-item">';
        str += AlertItemTitle(props, style);
        str += '<div class="alert-switch-container" style="' + getContainerStyle() + '">';
        str += '<div class="alert-switch" data-id="'+props.id+'" style="'+getStyle()+'"></div>';
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
            style: { button_width: style.size * (2 / 3), button_height: style.size * (2 / 3), line_width: 0 }
        });
    }    
}


function AlertItemTitle(props,style) {
    function getStyle() {
        var str = '';
        str += 'position:relative;';
        str += 'width:'+(80 - style.size/6)+'px;';
        str += 'white-space:nowrap;';
        str += 'text-align:left;';
        str += 'float:' + (style.direction === 'rtl' ? 'right' : 'left') + ';';
        str += 'height:' + style.size + 'px;';
        str += 'line-height:' + style.size + 'px;';
        str += 'margin-' + (style.direction === 'rtl' ? 'right' : 'left') + ':' + (style.size / 6) + 'px;';
        return str;
    }
    return '<div style="'+getStyle()+'">' + (props.title || '') + '</div>';
}

function AlertItemValue(props, style) {
    function getStyle() {
        var str = '';
        str += 'position:relative;';
        str += 'width:30px;';
        str += 'text-align:center;';
        str += 'font-size:' + (style.size / 3) + 'px;';
        str += 'float:' + (style.direction === 'rtl' ? 'left' : 'right') + ';';
        str += 'height:' + style.size + 'px;';
        str += 'line-height:' + style.size + 'px;';
        return str;
    }
    return '<div class="alert-item-value" style="'+getStyle()+'" data-id="' + props.id + '" data-value="' + (props.value || '') + '">' + (props.value||'') + '</div>';
}







