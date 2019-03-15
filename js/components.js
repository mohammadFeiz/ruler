var components = {
    isMobile:false,
    items: [],
    findItem: function (id,items) {
        items = items || this.items;
        for (var i = 0; i < items.length; i++) { 
            var item = items[i];
            if (item.id === id) { return item; }
            if(item.html){
                var found = this.findItem(id,item.html);
                if(found){return found;}
            }
        } 
        return false;
    },
    getHTML:function(html){
        if(typeof html === "string" ||typeof html === "number"){html = html;}
        else if(typeof html === "function"){html = html();}
        else if(html.component === "Dropdown"){html = this.DIV(this.Dropdown(html));}
        else if(html.component === "Button"){html = this.DIV(this.Button(html));}
        else if(html.component === "Numberbox"){html = this.DIV(this.Numberbox(html));}
        else if(html.component){html = this[html.component](html);}
        else if(!html.component){html = this.DIV(html);}
        else {alert("error!!!")}
        return html;
    },
    render: function (obj,container) {
        this.items.push(obj);
        $(container).append(this.getHTML(obj));
    },
    removeEvents:function(items){
        for(var i = 0; i < items.length; i++){
            var item = items[i];
            if(item.id){this.eventRemover(item.id,'mousedown');}
            if(item.html){this.removeEvents(item.html)}
        }
    },
    getEvent:function(event){
        var mobileEvents = { mousedown: "touchstart", mousemove: "touchmove", mouseup: "touchend" };
        return 'ontouchstart' in document.documentElement ? mobileEvents[event] : event;
    },
    eventRemover:function(id,event,childs){
        $('body').off(this.getEvent(event),'#' + id);
        if(childs === true){
            var item = this.findItem(id);
            this.removeEvents(item.html); 
        }
    },
    eventHandler:function(id,event,action){
        $('body').off(this.getEvent(event),'#' + id,action);
        $('body').on(this.getEvent(event),'#' + id,action);
    },
    remove:function(id,removeChildsEvents,items){
        items = items || this.items;
        for (var i = 0; i < items.length; i++) { 
            var item = items[i];
            if (item.id === id) {
                this.eventRemover(item.id,'mousedown',removeChildsEvents);
                $("#" + id).remove();
                items.splice(i,1); 
                return; 
            }
            if(item.html){
                this.remove(id,item.html,removeChildsEvents);
            }
        } 
    },
    getValue:function(prop,obj){
        return typeof prop === "function" ? prop(obj) : prop;
    },
    getAttrs:function(obj,item){        
        var attrs = ''; obj = obj || {};
        for (var prop in obj) {
            attrs+=' ' + prop + '="' + (typeof obj[prop] === 'function'?obj[prop](item):obj[prop]) + '"'
        }
        return attrs;
    },
    Button: function (obj) {
        obj.component = "DIV";
        obj.html = [];
        if(obj.iconClass){obj.html.push({className:obj.iconClass,attrs:{style:'display:inline-block;'}});}
        if(obj.text!==undefined){obj.html.push({className:"button-text",html:[obj.text],attrs:{style:'display:inline-block;'}});}
        return obj;
    },
    Numberbox: function (obj) {
        if(!obj.id){alert("missing id in Numberbox");}
        obj.component = "DIV";
        obj.html = [obj.value === undefined ? '' : obj.value]; 
        obj.keyboardCallback = obj.callback;
        obj.callback = function(e){
            var element = $(e.currentTarget);
            var value = parseFloat(element.html());
            var id = element.attr("id");
            var item = components.findItem(id);
            if(!item.keyboard){return;}
            keyboard.open({
                fields:[{prop:"value",title:"value",value:value,dataTarget:item.dataTarget,min:item.min}],
                title:"Inter Number",   
                close:true,
                negative:item.negative===undefined?true:item.negative,
                callback:item.keyboardCallback,   
            });
        };
        return obj;
    },
    Dropdown: function (obj) {
        obj.component = "DIV";
        obj.html = [
            {
                className:"dropdown-text",html:[obj.text],id:obj.id+"-dropdown-text",
                callback:function (e) {
                    var dropdown = $(e.currentTarget).parent();
                    dropdown.find(".back-drop").show();
                    dropdown.find(".dropdown-popup").show();
                }
            },
            {
                className:"back-drop dropdown-back-drop",id:obj.id+"-back-drop",
                callback:function (e) {
                    var dropdown = $(e.currentTarget).parent();
                    dropdown.find(".back-drop").hide();
                    dropdown.find(".dropdown-popup").hide();
                }
            },
            {
                className:"dropdown-popup",html:obj.options.map(function(option,i){
                    return {
                        className:"dropdown-item",
                        attrs:{"data-index":i},html:[option.text],id:obj.id+"-dropdown-item" + i,
                        callback:function (e) {
                            var item = $(e.currentTarget);
                            var index = item.attr("data-index");
                            var dropdown = item.parent().parent();
                            var id = dropdown.attr("id");
                            var object = components.findItem(id);
                            var option = object.options[index];
                            dropdown.find(".dropdown-text").html(option.text);
                            if(object.optionsCallback){object.optionsCallback(option);}
                            dropdown.find(".back-drop").hide();
                            dropdown.find(".dropdown-popup").hide();
                        }
                    }
                })
            }
        ];
        return obj;
    },
    DIV:function(obj){
        var id = this.getValue(obj.id) || "";
        obj.show = obj.show === undefined?true:obj.show;
        if(!this.getValue(obj.show,obj)){
            return '<div id="'+obj.id+'" style="display:none;"></div>';
        }    
        var className = this.getValue(obj.className) || "";
        var attrs = this.getAttrs(obj.attrs,obj);
        var str = '<div ';
        if(className){str += 'class="' + className + '" ';}
        if(id){str += 'id="' + id + '" ';}
        str += attrs;
        str+='>';
        if(obj.html){for(var i = 0; i < obj.html.length; i++){str += this.getHTML(obj.html[i]);}}
        str += '</div>';
        if (obj.callback||obj.affectTo) {
            if(!id){debugger;alert("for set callback, id is required!!!")}
            this.eventRemover(id,'mousedown');
            this.eventHandler(id,'mousedown', function (e) {
                var element = $(e.currentTarget);
                var item = components.findItem(element.attr("id"));
                if(item.callback){item.callback(e);}
                if(item.affectTo){
                    for(var i = 0; i < item.affectTo.length; i++){
                        components.update(item.affectTo[i]);
                    }
                }
            });
        }
        return str;
    },
    Slider: function (obj) {
        obj.show = obj.show === undefined?true:obj.show;
        if(!this.getValue(obj.show,obj)){
            return '<div id="'+obj.id+'" style="display:none;"></div>';
        }
        obj.style = obj.style || { button_width: 24, button_height: 24, line_width: 4 };
        return new slider(obj).getHTML();
    },
    update: function (id, obj) {
        var item = typeof id === 'object' ? id : components.findItem(id);
        if(!item || !item.id) {alert('components error: for update a component id is required');debugger;return;}
        obj = obj || {};
        for (var prop in obj) { item[prop] = obj[prop]; }
        $("#" + item.id).replaceWith(components.getHTML(item));
    },
}