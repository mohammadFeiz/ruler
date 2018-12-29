var createControl = {
    state: {},
    textFontSize: 10,
    iconFontSize: 15,
    id: "draw-control",
    items: [
        { name: "move", text: "", className: "mdi mdi-arrow-all", fontSize: 15 },
        { name: "end", text: "End", className: "", fontSize: 10 },
        { name: "close", text: "Close", className: "", fontSize: 10 },
        { name: "join", text: "Join", className: "", fontSize: 10 },
        { name: "keyboard", text: "", className: "mdi mdi-keyboard", fontSize: 15 },
        { name: "remove", text: "", className: "mdi mdi-delete", fontSize: 15 },
        { name: "pan", text: "", className: "mdi mdi-cursor-pointer", fontSize: 15 },
    ],
    style: {
        item_size: 36,
        distance: 80,
        angle: 40,
        start_angle: 90,
        font_color: lightFontColor,//read from style-genarator.js
        item_background: "rgba(255, 255, 255, 0.1)",
    },
    updateState: function (obj) {
        for (var prop in obj) {
            this.state[prop] = obj[prop];
        }
    },
    open: function (items) {
        this.close();
        this.state = {};
        this.updateState(items);
        this.render();
        this.container = $("#" + this.id);
        var coords = canvas.convertCanvasXYToBodyXY(this.state.coords);
        this.container.css({ left: coords.x, top: coords.y });
    },
    close: function () {
        $("#" + this.id).remove();
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
        app.eventHandler(".draw-control-item", "mousedown",this.mousedown);
    },
    mousedown: function (e) {
        var element = $(e.currentTarget);
        var mode = $(e.currentTarget).attr("id").slice(13);
        create.currentSpline[mode](e);
    },
    move: function (coords) {
        var coords = canvas.convertCanvasXYToBodyXY({ x: coords.x, y: coords.y });
        this.container.css({ left: coords.x, top: coords.y });
    }
}

function CreateControlItem(props) {
    function getIconContainerStyle() {
        var str = '';
        str += 'position: absolute;';
        str += 'background:'+props.style.item_background+';';
        str += 'border-radius:100%;';
        str += 'text-align:center;';
        str += 'width:' + props.style.item_size + 'px;';
        str += 'height:' + props.style.item_size + 'px;';
        str += 'color:' + props.style.font_color + ';';
        str += 'left:' + (props.style.distance * -1) + 'px;top:' + (props.style.item_size / -2) + 'px;';
        str += 'transform:rotate(' + (props.counter * props.style.angle + props.style.start_angle) + 'deg);';
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
    str += '<div id="draw-control-' + props.name + '" class="draw-control-item" style="' + getItemStyle() + '">';
    str += '<div class="icon-container" style="' + getIconContainerStyle() + '">';
    str += '<span class="icon ' + props.className + '" style="' + getIconStyle() + '">' + props.text + '</span>';
    str += '</div>';
    str += '</div>';
    return str;
}



