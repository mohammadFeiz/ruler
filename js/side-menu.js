var sideMenu = {
    items: [
        { 
            id: "Dimension", 
            title: "Show Dimension", 
            iconClass: function(){
                if(canvas.showDimention){
                    return "mdi mdi-checkbox-marked-outline";
                }
                else{
                    return "mdi mdi-checkbox-blank-outline";
                }
            },
            callback:function(){
                var state = canvas.showDimention = !canvas.showDimention;
                canvas.redraw();
                create.end();
                sideMenu.close(); 
            }, 
        },
        {
            id: "new", title: "New", iconClass: "mdi mdi-file-outline", callback: function () {
                Location.reload();
            }
        },
        { id: "save", title: "Save", iconClass: "mdi mdi-content-save" },
        { id: "save-as", title: "Save As", iconClass: "mdi mdi-content-save-settings" },
        { id: "open", title: "Open", iconClass: "mdi mdi-folder-open" },
        { id: "export-dxf-file", title: "Export DXF File", iconClass: "mdi mdi-export" },
        { id: "about", title: "About", iconClass: "mdi mdi-information-variant" },
        { id: "exit", title: "Exit", iconClass: "mdi mdi-close" },
    ],
    style: {
        top: top_menu_size,
        size: 36,
        width: 200,
        background: "#fff",
        icon_color: font_color,
        icon_font_size: font_color,
        title_color: font_color,
        title_font_size: 12,
        header_height: 36,
        zIndex: 100000
    },
    getStyle: function () {
        var style = sideMenu.style;
        var str = '';
        str += 'position: fixed;';
        str += 'top:0;';
        str += 'left:0;';
        str += 'width:100%;';
        str += 'height:100%;';
        str += 'z-index:' + style.zIndex + ';';
        return str;
    },
    open: function () {
        
        var str = '';
        str += '<div id="side-menu" style="' + sideMenu.getStyle() + '">';
        str += SideMenuBackDrop();
        str += SideMenuPopup({ items: sideMenu.items, style: sideMenu.style });
        str += '</div>';
        $("body").append(str);
        setTimeout(function () { $("#side-menu-popup").addClass("active"); }, 10);
        sideMenu.setEvents();
    },
    close: function () {
        $("#side-menu-popup").removeClass("active");
        setTimeout(function () { $("#side-menu").remove(); }, 300);
    },
    setEvents: function () {
        for (var i = 0; i < sideMenu.items.length; i++) {
            var item = sideMenu.items[i];
            this.eventHandler("#" + item.id, "mousedown", item.callback);
        }
        this.eventHandler("#side-menu .back-drop", "mousedown", sideMenu.close);
    },
    eventHandler: function (selector, event, action) {
        if (canvas.isMobile) {
            if (event === "mousedown") { event = "touchstart"; }
            else if (event === "mousemove") { event = "touchmove"; }
            else if (event === "mouseup") { event = "touchend"; }
        }
        if (selector === "window") { $(window).unbind(event, $.proxy(action, this)).bind(event, $.proxy(action, this)); }
        else if (typeof selector === "string") { $(selector).unbind(event, $.proxy(action, this)).bind(event, $.proxy(action, this)); }
        else { selector.unbind(event, $.proxy(action, this)).bind(event, $.proxy(action, this)); }
    },
}
function SideMenuBackDrop() {
    function getStyle() {
        var str = '';
        str += 'position:absolute;';
        str += 'z-index:1;';
        str += 'width:100%;';
        str += 'height:100%;';
        str += 'left:0;';
        str += 'top:0;';
        
        return str;
    }
    var str = '';
    str += '<div class="back-drop" style="' + getStyle() + '"></div>';
    return str;
}

function SideMenuPopup(props) {
    var items = props.items;
    var style = props.style;
    function getStyle() {
        var str = '';
        
        return str;
    }
    var str = '';
    str += '<div id="side-menu-popup">';
    str += SideMenuHeader({ style: sideMenu.style });
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        str += SideMenuItem({ style: style, item: item });
    }
    str += '</div>';
    return str;
}

function SideMenuHeader(props) {
    function getStyle() {
        var str = '';
        str += 'position:relative;';
        str += 'width:100%;';
        str += 'height:' + props.style.header_height + 'px;';
        str += 'background:url(ruler.png);';
        str += 'background-size:cover;';
        return str;
    }
    var str = '';
    str += '<div id="side-menu-header" style="' + getStyle() + '"></div>';
    return str;
}

function SideMenuItem(props) {
    var style = props.style, item = props.item;
    function getItemStyle() {
        var str = '';
        str += 'position: relative;';
        str += 'width:100%;';
        str += 'float:left;';
        str += 'color:' + font_color+';';
        str += 'background:rgba(0,0,0,0.5);';
        str += 'height:' + style.size + 'px;';
        return str;
    }
    function getIconContainerStyle() {
        var str = '';
        str += 'position: relative;';
        str += 'float:left;';
        str += 'text-align:center;';
        str += 'width:' + style.size + 'px;';
        str += 'height:' + style.size + 'px;';
        return str;
    }
    function getIconStyle() {
        var str = '';
        str += 'line-height:' + style.size + 'px;';
        str += 'color:' + style.icon_color + 'px;';
        str += 'font-size:' + style.icon_font_size + 'px;';
        return str;
    }
    function getTitleContainerStyle() {
        var str = '';
        str += 'line-height:' + style.size + 'px;';
        str += 'color:' + style.title_color + 'px;';
        str += 'float:left;';
        str += 'font-size:' + style.title_font_size + 'px;';
        return str;
    }
    var iconClass = typeof item.iconClass === "function"?item.iconClass():item.iconClass;
    var str = '';
    str += '<div class="side-menu-item" id="' + item.id + '" style="' + getItemStyle() + '">';
    str += '<div class="icon-container" style="' + getIconContainerStyle() + '">';
    str += '<span class="icon ' + iconClass + '" style="' + getIconStyle() + '"></span>';
    str += '</div>';
    str += '<div class="title-container" style="' + getTitleContainerStyle() + '">' + item.title + '</div>';
    str += '</div>';
    return str;
}