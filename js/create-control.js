var createControl = {
    items: [
        { value: "move", text: "Move",show:true, },
        { value: "end", text: "End",show:true, },
        { value: "keyboard", text: "Keyboard",show:true, },
        { 
            value: "remove", text: "Remove",
            show:function(){
                var o = create.object, points = o.getPoints();
                return create.mode.value === 'polyline' && points.length > 1;  
            } 
        },
        { 
            value: "close", text: "Close",
            show:function(){
                var o = create.object, points = o.getPoints();
                return create.mode.value === 'polyline' && points.length > 2;  
            }
        },
        { 
            value: "join", text: "Join",
            show:function(){
                var o = create.object, lines = o.getLines();
                return create.mode.value === 'polyline' && lines.length > 2 && 
                Lines.getMeet(lines[0], lines[lines.length - 1]) !== false; 
            }
        },

    ],
    style: {
        item_size: 36,
        distance: 80,
        angle: 40,
        start_angle: 90,
    },
    close: function () {
        components.remove('create-control');
        this.coords = false;
    },
    getButtonStyle:function(obj){
        var index = obj.index;
        var s = this.style;
        var style = 'width:'+s.item_size+'px;height:'+s.item_size+'px;';
        style += 'left:'+(s.distance * -1)+'px;top:' + (s.item_size / -2) + 'px;';
        style += 'transform:rotate(' + (index * s.angle + s.start_angle) + 'deg);';
        style+='line-height:'+s.item_size+'px;'
        return style;        
    },
    update:function(coords){
        if(!this.coords){
            this.coords = {x:coords.x,y:coords.y};
            this.render();
        }
        else{
            this.coords = {x:coords.x,y:coords.y};
            components.update(this.renderObject);
        }
    },
    render: function () {
        var angle = this.style.angle,start_angle=this.style.start_angle;
        this.renderObject = {
            id:'create-control',
            attrs:{
                style:function(){
                    var style = '';
                    var coords = app.canvas.canvasToClient(createControl.coords); 
                    style+='left:'+coords.x+'px;top:'+coords.y+'px;';
                    return style;
                }
            },
            html:this.items.map(function(item,i){
                return {
                    index:i,id:'create-control-'+item.value,className:'create-control-item',
                    attrs:{style:'transform:rotate(' + (i * -1 * angle - start_angle) + 'deg);'},
                    show:item.show,
                    callback:function(e){create[$(e.currentTarget).attr("id")](e);},
                    html:[{
                        component:'Button',text:item.text,className:'button',
                        iconClass:item.iconClass,index:i,
                        attrs:{style:createControl.getButtonStyle.bind(createControl)}
                    }]                    
                }
            })
        };
        components.render(this.renderObject,"body");
    },
    getPosition:function(){
        return this.coords;
    }
}