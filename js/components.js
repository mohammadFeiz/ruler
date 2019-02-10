var components = {
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
        else if(html.component){html = this[html.component](html);}
        else if(!html.component){html = this.DIV(html);}
        else {alert("error!!!")}
        return html;
    },
    add: function (item) {
        for (var i = 0; i < this.items.length; i++) { if (this.items[i].id === item.id) { this.items[i] = item; return; } }
        this.items.push(item);
    },
    render: function (obj,container) {
        this.add(obj);
        $(container).append(this.getHTML(obj));
    },
    remove:function(id,items){
        $("#" + id).remove();
        items = items || this.items;
        for (var i = 0; i < items.length; i++) { 
            var item = items[i];
            if (item.id === id) { items.splice(i,1); return; }
            if(item.html){
                this.remove(id,item.html);
            }
        } 
    },
    getValue:function(prop){
        return typeof prop === "function" ? prop() : prop;
    },
    getAttrs:function(obj){
        var attrs = ''; obj = obj || {};
        for (var prop in obj) {attrs+=' ' + prop + '="' + obj[prop] + '"'}
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
        if(this.getValue(obj.show) === false){return "";}    
        var str = '';
        str += '<div class="' + (obj.className || '') + '" id="' + obj.id + '" data-step="' + obj.step + '">';
        str += obj.value === undefined ? '' : obj.value;
        str += '</div>';
        $('body').off('mousedown', '#' + obj.id);
        $('body').on('mousedown', '#' + obj.id, function (e) {
            var element = $(e.currentTarget);
            var id = element.attr("id");
            var item = components.findItem(id);
            if(item.callback){
                keyboard.open({
                    fields:[{min:item.min,prop:"value",title:"value",value:item.value,dataTarget:item.dataTarget}],
                    title:"Inter Number",   
                    close:true,
                    negative:obj.negative===undefined?true:obj.negative,
                    callback:item.callback,   
                });
            }
            
        });
        return str;
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
                            if(object.optionsCallback){object.optionsCallback(option.value);}
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
        if(this.getValue(obj.show) === false){return "";}    
        var id = this.getValue(obj.id) || "";
        var className = this.getValue(obj.className) || "";
        var attrs = this.getAttrs(obj.attrs);
        var str = '<div ';
        if(className){str += 'class="' + className + '" ';}
        if(id){str += 'id="' + id + '" ';}
        str += attrs;
        str+='>';
        if(obj.html){for(var i = 0; i < obj.html.length; i++){str += this.getHTML(obj.html[i]);}}
        str += '</div>';
        if (obj.callback) {
            if(!id){debugger;alert("for set callback, id is required!!!")}
            $('body').off('mousedown', '#' + id);
            $('body').on('mousedown', '#' + id, function (e) {
                var element = $(e.currentTarget);
                var item = components.findItem(element.attr("id"));
                item.callback(e);
            });
        }
        return str;
    },
    Slider: function (obj) {
        if(this.getValue(obj.show) === false){return "";}    
        obj.style = obj.style || { button_width: 24, button_height: 24, line_width: 4 };
        return new slider(obj).getHTML();
    },
    update: function (id, obj) {
        var item = components.findItem(id);
        for (var prop in obj) { item[prop] = obj[prop]; }
        $("#" + id).replaceWith(components[item.component](item));
    },
}