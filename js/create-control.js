var createControl = {
    state: {},
    id: "draw-control",
    items: [
        { name: "move", text: "Move", className: "", fontSize: 10 },
        { name: "end", text: "End", className: "", fontSize: 10 },
        { name: "close", text: "Close", className: "", fontSize: 10 },
        { name: "join", text: "Join", className: "", fontSize: 10 },
        { name: "keyboard", text: "Keyboard", className: "", fontSize: 10 },
        { name: "remove", text: "Remove", className: "", fontSize: 10 },
        { name: "pan", text: "Pan", className: "", fontSize: 10 },
    ],
    style: {
        item_size: 36,
        distance: 80,
        angle: 40,
        start_angle: 90,
        font_color: app.style.lightFontColor,//read from style-genarator.js
        item_background: "rgba(255, 255, 255, 0.1)",
    },
    open: function (items) {
        this.close();
        this.state = {};
        for (var prop in items) { this.state[prop] = items[prop]; }
        this.render();
        this.position = this.state.coords;
        var coords = app.canvas.canvasToClient(this.position);
        $("#" + this.id).css({ left: coords.x, top: coords.y });
    },
    close: function () {
        $("#" + this.id).remove();
        this.position = false;
    },
    render: function () {
        function getStyle() {
            var str = '';
            str += 'position: fixed;';
            return str;
        }
        var str = '';
        str += '<div id="' + this.id + '" style="' + getStyle() + '">';
        var counter = 0;
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            if (this.state[item.name]) {
                item.counter = counter;
                str += CreateControlItem({
                    name: item.name,
                    className: item.className,
                    text: item.text,
                    fontSize: item.fontSize,
                    style: this.style,
                    counter: counter
                });
                counter++;
            }

        }
        str += '</div>';
        $("body").append(str);
        app.eventHandler(".draw-control-item", "mousedown", this.mousedown.bind(this));
    },
    mousedown: function (e) {
        create[$(e.currentTarget).attr("id")](e);
    },
    getPosition:function(){
        return this.position;
    }
}

function CreateControlItem(props) {
    function getIconContainerStyle() {
        var str = '';
        str += 'position: absolute;';
        str += 'background:' + props.style.item_background + ';';
        str += 'border-radius:100%;';
        str += 'text-align:center;';
        str += 'width:' + props.style.item_size + 'px;';
        str += 'height:' + props.style.item_size + 'px;';
        str += 'color:' + props.style.font_color + ';';
        str += 'left:' + (props.style.distance * -1) + 'px;top:' + (props.style.item_size / -2) + 'px;';
        str += 'transform:rotate(' + (props.counter * props.style.angle + props.style.start_angle) + 'deg);';
        str += 'opacity:.5';
        return str;
    }
    function getItemStyle() {
        var str = '';
        str += 'transform:rotate(' + (props.counter * -1 * props.style.angle - props.style.start_angle) + 'deg);';
        return str;
    }
    function getIconStyle() {
        var str = '';
        str += 'line-height:' + props.style.item_size + 'px;';
        str += 'font-size:' + props.fontSize + 'px;';
        return str;
    }
    var str = '';
    str += '<div id="drawcontrol' + props.name + '" class="draw-control-item" style="' + getItemStyle() + '">';
    str += '<div class="icon-container" style="' + getIconContainerStyle() + '">';
    str += '<span class="icon ' + props.className + '" style="' + getIconStyle() + '">' + props.text + '</span>';
    str += '</div>';
    str += '</div>';
    return str;
}