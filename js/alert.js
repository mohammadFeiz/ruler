/////////example//////////////
//var A = new Alert(
    //{ 
        //buttons: [
            //{ title: "yes", subscribe: layers.add }, 
            //{ title: "cansel" }
        //], 
        //template: "Do You Want To Add New Layer?", 
        //title: "New Layer." 
    //}
//);
//var A = new Alert(
    //{ 
        //buttons: [
            //{ title: "yes", subscribe: layers.add }, 
            //{ title: "cansel" }
        //], 
        //title: "New Layer.",
        //template: [
            //{ title: "Snap", type: "switch", value: create.ngon.snap, text: ["ON", "OFF"], onchange: create.ngon.setSnap, },
            //{title: "Snap Size",type: "slider",value: create.ngon.snapSize,onchange: create.ngon.setSnapSize,start: 1,step: 1,end: 30,},
            //{
            //    type: "group button",
            //    title: "Selection",
            //    buttons: [
            //        {
            //            active:(edit.transform.selectMode === "point"),
            //            iconClass: "icon icon-vertex",
            //            value: "Point",
            //            id:"select-mode-point",
            //            subscribe: edit.transform.setSelectMode
            //        },
            //        {
            //            active:(edit.transform.selectMode === "line"),
            //            iconClass: "icon icon-dl",
            //            value: "Line",
            //            id:"select-mode-line",
            //            subscribe: edit.transform.setSelectMode
            //        },
            //        {
            //            active:(edit.transform.selectMode === "spline"),
            //            iconClass: "icon icon-spline",
            //            value: "Spline",
            //            id:"select-mode-spline",
            //            subscribe: edit.transform.setSelectMode
            //        },
            //    ],
            //},
            //],  
    //}
//);

function Alert(obj) {
    var a = {
        size: 36,
        state:{},
        updateState: function (obj) {
            for (prop in obj) {
                this.state[prop] = obj[prop];
            }
            if (!Array.isArray(this.state.template)) { this.state.template = [this.state.template]; }
        },
        setTemplate: function () {
            for (var i = 0; i < this.state.template.length; i++) {
                var template = this.state.template[i];
                if (typeof template === "string") { $(".alert-body").append(template); break; }
                else if (template.start !== undefined) { this.getSliderTemplate(template); }
                else if (typeof template.value === "boolean") {
                    template.mode = "switch";
                    this.getSwitchTemplate(template);
                }
                else if (template.buttons) { this.getGroupButtonTemplate(template); }
                else if (typeof template.value === "number") {
                    template.mode = "numberbox";
                    this.getNumberboxTemplate(template);
                }
            }
            this.Footer();

        },
        getTextTemplate: function (template) {
            
        },
        getSliderTemplate: function (template) {
            $(".alert-body").append(AlertItem({title:template.title,value:template.value}));
            var alert_slider = $(".alert-template-control:last");
            var alert_value = $(".alert-template-value:last");
            var A = new slider({
                container: alert_slider,
                start: template.start,step: template.step,value: template.value,
                end: template.end,min: template.min,max: template.max,
                isMobile:canvas.isMobile,
                ondrag: function (obj) { var value = obj.values[0]; template.onchange(value); alert_value.html(value); },
                style: { button_width: this.size * (2 / 3), button_height: this.size * (2 / 3), line_width: this.size * (1 / 9) }
            });
        },
        getSwitchTemplate: function (template) {
            $(".alert-body").append(AlertItem(template));
            var alert_switch = $(".alert-template-switch:last");
            var A = new slider({
                container: alert_switch,
                start: 0,
                isMobile: canvas.isMobile,
                step: 1,
                end: 1,
                text: template.text,
                value: (template.value) ? 1 : 0,
                ondrag: function (obj) { var value = obj.values[0]; template.onchange((value) ? true : false); },
                style: { button_width: this.size * (2 / 3), button_height: this.size * (2 / 3), line_width: 0 }
            });
        },
        getNumberboxTemplate: function (template) {
            $(".alert-body").append(AlertItem(template));
            var alert_numberbox = $(".alert-template-numberbox:last");
            if (template.onchange !== undefined) {
                app.eventHandler(alert_numberbox, "mousedown", function () {
                    var element = $(this);
                    keyboard.open({
                        title: template.title,
                        close:true,
                        fields: [{
                            title: element.attr("data-title"),
                            value: element.attr("data-value"),
                            prop:"value"
                        }],
                        subscribe: function (p) {
                            var value = p.value;
                            element.attr("data-value",value);
                            element.html(value);
                            template.onchange(value);
                        }
                    });
                });
            }
        },
        getGroupButtonTemplate: function (template) {
            var str = '';
            for (var i = 0; i < template.buttons.length; i++) {
                var button = template.buttons[i];
                str += ButtonOfGroup(button);
            }
            $(".alert-body").append(AlertItem({ title: template.title, value: template.value }));
            $(".alert-template-control:last").append(str);
            for (var i = 0; i < template.buttons.length; i++) {
                var button = template.buttons[i];
                app.eventHandler("#alert #" + button.id, "mousedown", function () {
                    button.subscribe($(this).attr("id"));
                    var parent = $(this).parent();
                    parent.find(".alert-template-button").removeClass("active");
                    $(this).addClass("active");
                    parent.parent().find(".alert-template-value").html($(this).attr("data-value"));
                    if (button.close === true) {
                        $("#alert").remove();
                    }
                });
            }
        },
        setLayout: function () {
            var str = AlertPopup({width:this.state.width,size:this.size,title:this.state.title});
            $("body").append(str);
            $(".alert-close").bind("mousedown", this.close);
        },
        open: function (obj) {
            this.updateState(obj);
            this.setLayout();
            this.setTemplate();
        },
        Footer: function () {
            if (this.state.buttons === null) { return; }
            for (var i = 0; i < this.state.buttons.length; i++) {
                if (i > 2) { return; }
                var button = this.state.buttons[i];
                $(".alert-footer").append(FooterButton({index:i,title:button.title}));
                var alert_button = $(".alert-button-container").eq(i);
                alert_button.bind("mousedown", this.close);
                if (button.subscribe) {
                    alert_button.bind("mousedown", button.subscribe);
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
    var width = props.width || (props.size * 8);
    var str = '<div id="alert" style="width:' + width + 'px;left:calc(50% - ' + (width / 2) + 'px);">';
    str += '<div class="back-drop"></div>';
    str += '<div class="alert-header">';
    str += '<div class="alert-title">' + props.title + '</div>';
    str += '<div class="alert-close"><span class="mdi mdi-close"></span></div>';
    str += '</div>';
    str += '<div class="alert-body"></div>';
    str += '<div class="alert-footer"></div>';
    str += '</div>';
    return str;
}

function FooterButton(props){
    var str = '';
    str += '<div class="alert-button-container" data-index="' + props.index + '">';
    str += '<div class="alert-button">' + props.title + '</div>';
    str += '</div>';
    return str;    
}

function AlertItem(props) {
    var str = '';
    str += '<div class="alert-template-item">';
    str += '<div class="alert-template-title">' + (props.title || '') + '</div>';
    if (props.mode !== "switch" && props.mode !== "numberbox") {
        str += '<div class="alert-template-value" data-value="'+props.value+'">' + props.value + '</div>';
    }
    str += '<div class="alert-template-control">';
    if (props.mode === "switch") {
        str += '<div class="alert-template-switch"></div>';
    }
    else if (props.mode === "numberbox") {
        str += '<div class="alert-template-numberbox" data-title="'+props.title+'" data-value="'+props.value+'">'+props.value+'</div>';
    }
    str += '</div>';
    str += '</div>';
    return str;
}

function ButtonOfGroup(props) {
    var value = (props.iconClass) ? '' : props.value;
    var active = (props.active) ? ' active': '';
    var iconClass = (props.iconClass)? ' ' + props.iconClass:'';
    var str = '';
    str += '<div data-value="' + props.value + '" ';
    str += 'id="' + props.id + '" ';
    str += 'class="alert-template-button' + iconClass + active + '">' + value + '</div>';
    return str;
}




