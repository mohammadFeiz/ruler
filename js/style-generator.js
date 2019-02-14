var top_menu_size = 36;
var float_toolbar_size = 36;
var alert_size = 36;
var keyboard_size = 36;
var layer_size = 36;
var full_keyboard_height = 36;
var full_keyboard_background = "#425768";
var background = "background:#3e4146;";
var background2 = 'background:url(bg1.jpg);background-size:250px 350px;';
var font_color = "#fff";
var active_font_color = "#bebdc2";
var button_background = "#313236";
var lightFontColor = "#fff";
var color = "#1ad25f";
var zoom_slider_color = "#fff";
var zoom_slider_thickness = 1;
var zoom_slider_fontsize = 11;
var back_drop_background = 'rgba(0,0,0,0.5)';
var transition = "transition:0.3s;";
var slider_background = 'background-image: url(images/slider.jpg);background-size: cover;';
var box_shadow = 'box-shadow:4px 4px 10px 0px rgba(0,0,0,0.6);';
function createStyle() {
    var str = '';
    str += '.back-drop{position:fixed;z-index:1;width:100%;height:100%;left:0;top:0;';
    str += 'background:' + back_drop_background + ';';
    str += '}';

    str += 'canvas {';
    str += 'position: absolute;';
    str += 'left: 0px;';
    str += 'top: 0px;';
    str += 'width: 100%;';
    str += 'height: 100%;';
    str += 'background-color: #2c2f37;';
    str += 'background-image: linear-gradient(rgba(70,70,70,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(70,70,70,0.5) 1px, transparent 1px), linear-gradient(rgba(60,60,60,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(60,60,60,0.5) 1px, transparent 1px);';
    str += 'background-size: 100px 100px, 100px 100px, 10px 10px, 10px 10px;';
    str += '}';

    ///////////////////////////////////////////////////////////////////////////

    str += 'body{';
    str += '-webkit-touch-callout: none;';
    str += '-webkit-user-select: none;';
    str += '-khtml-user-select: none;';
    str += '-moz-user-select: none;';
    str += '-ms-user-select: none;';
    str += 'user-select: none;';
    str += '}';

    str += '.right {';
    str += 'float: right;';
    str += '}';

    str += '.left {';
    str += 'float: left;';
    str += '}';

    str += '.switch-container{';
    str += 'border-radius: 45px;';
    str += 'background: #222;';
    str += 'box-shadow: inset 2px 2px 10px 1px #222;';
    str += '}';

    //////////////////////////////////////////////////////////////////////////
    
    str += '.ngon-sides,.ngon-ortho{';
    str += 'position:relative;';
    str += 'width:100%;';
    str += 'height:' + alert_size + 'px;';
    str += '}';

    //////////////////////////////////////////////////////////////////////////////////////
    str += '#float-toolbar{position :fixed;text-align:center;left:0;bottom:0px;z-index:10;';
    str += 'height:' + float_toolbar_size + 'px;';
    str += 'width:100%;';
    str += '}';
    str += '#float-toolbar .icon-container{position: relative;';
    str += 'width:' + float_toolbar_size + 'px;';
    str += 'height:' + float_toolbar_size + 'px;';
    str += 'text-align:center;';
    str += '}';
    str += '#float-toolbar .icon{position: relative;';
    str += 'color:' + lightFontColor + ';';
    str += 'line-height:' + float_toolbar_size + 'px;';
    str += 'font-size:' + (float_toolbar_size / 2) + 'px;';
    str += '}';
    str += '#zoom-slider{position: relative;';
    str += 'width:calc(100% - ' + (4 * float_toolbar_size) + 'px);';
    str += 'height:' + float_toolbar_size + 'px;';

    str += '}';
    /////////////////////////////////////////////////////////////////////////////////////////
    var axis_size = 30;
    str += '#axis{';
    str += 'width:0;';
    str += 'height:0;';
    str += 'opacity:0.6;';
    str += 'position: fixed;';
    str += '}';
    
    str += '#axis:before{';
    str += 'content:"";';
    str += 'position:absolute;';
    str += 'width:' + (axis_size * (2.5)) + 'px;';
    str += 'height:' + (axis_size * (2.5)) + 'px;';
    str += 'border:' + axis_size + 'px solid #000;';
    str += 'border-radius:100%;';
    str += 'left:calc(-' + (axis_size * (1.25)) + 'px - ' + axis_size + 'px);';
    str += 'opacity: 0;';
    str += 'top:calc(-' + (axis_size * (1.25)) + 'px - ' + axis_size + 'px);';
    str += '}';

    str += '#axis-background{';
    str += 'position:absolute;';
    str += 'left:0;';
    str += 'top:0;';
    str += 'z-index:10;';
    str += 'width:' + (axis_size * (2.5)) + 'px;';
    str += 'height:' + (axis_size * (2.5)) + 'px;';
    str += 'font-size:' + (axis_size * (0.3)) + 'px;';
    str += 'left:calc(-' + (axis_size * (1.25)) + 'px - 1px);';
    str += 'top:calc(-' + (axis_size * (1.25)) + 'px - 1px);';
    str += 'border-radius:100%;';
    str += 'border:1px solid #fff;';
    str += '}';
    
    str += '#axis-angle{';
    str += 'position: absolute;';
    str += 'text-align: center;';
    str += 'width:' + (axis_size * (2)) + 'px;';
    str += 'left:' + (axis_size * (0.25)) + 'px;';
    str += 'height:' + (axis_size * (1/3)) + 'px;';
    str += 'line-height:' + (axis_size * (1/3)) + 'px;';
    str += 'color:#fff;';
    str += 'top:10px;';
    str += '}';

    str += '#axis-angle .title{';
    str += 'position:relative;';
    str += 'display: inline-block;';
    str += '}';

    str += '#axis-angle .value{';
    str += 'position:relative;';
    str += 'display: inline-block;';
    str += '}';

    str += '#axis-x{';
    str += 'position: absolute;';
    str += 'text-align: center;';
    str += 'width:' + (axis_size * (2)) + 'px;';
    str += 'left:' + (axis_size * (0.25)) + 'px;';
    str += 'height:' + (axis_size * (1/3)) + 'px;';
    str += 'line-height:' + (axis_size * (1/3)) + 'px;';
    str += 'color:#fff;';
    str += 'top:calc(50% + ' + (axis_size * (1 / 3)) + 'px + ' + (axis_size * (1/12)) + 'px);';
    str += '}';

    str += '#axis-x .title{';
    str += 'position:relative;';
    str += 'display: inline-block;';
    str += '}';

    str += '#axis-x .value{';
    str += 'position:relative;';
    str += 'display: inline-block;';
    str += '}';

    str += '#axis-y{';
    str += 'position: absolute;';
    str += 'text-align: center;';
    str += 'width:' + (axis_size * (2)) + 'px;';
    str += 'left:' + (axis_size * (0.25)) + 'px;';
    str += 'height:' + (axis_size * (1/3)) + 'px;';
    str += 'line-height:' + (axis_size * (1/3)) + 'px;';
    str += 'color:#fff;';
    str += 'top:calc(50% + ' + (axis_size * (2 / 3)) + 'px + ' + (axis_size * (1/12)) + 'px);';
    str += '}';

    str += '#axis-y .title{';
    str += 'position:relative;';
    str += 'display: inline-block;';
    str += '}';

    str += '#axis-y .value{';
    str += 'position:relative;';
    str += 'display: inline-block;';
    str += '}';


    str += '#axis-background:before{';
    str += 'content:"";';
    str += 'position:absolute;';
    str += 'width:6px;';
    str += 'height:6px;';
    str += 'box-shadow:inset 0 0 0 1px red;';
    str += 'border-radius:100%;';
    str += 'left:calc(50% - 3px);';
    str += 'top:calc(50% - 3px);';
    str += '}';

    str += '.axis-icon-container{';
    str += 'position:absolute;';
    str += 'width:calc(' + (axis_size * (2.5)) + 'px + ' + (axis_size * (2)) + 'px + 0px);';
    str += 'height:0;';
    str += 'top:50%;';
    str += 'left:calc(-' + (axis_size * (1.25)) + 'px - ' + axis_size + 'px + 0px);';
    str += '}';

    str += '#axis .icon{';
    str += 'background:rgba(255,255,255,0.1);';
    str += 'top:-'+(axis_size / 2)+'px;';
    str += 'position:relative;';
    str += 'float:right;';
    str += 'color:#fff;';
    str += 'width:' + axis_size + 'px;';
    str += 'height:' + axis_size + 'px;';
    str += 'text-align:center;';
    str += 'border-radius:100%;';
    str += 'line-height:' + axis_size + 'px;';
    str += 'font-size:' + (axis_size * (0.5)) + 'px;';
    str += 'margin:0;';
    str += '}';

    str += '#axis .axis-icon-container.active .icon{';
    str += 'color:chartreuse;';
    str += 'box-shadow:0 0 4px 1px chartreuse;';
    str += 'background:none';
    str += '}';

    
    ////////////////////////////////////////////////////////////////////////////////
    

    
    //////////////////////////////////////////////////////////////////////////////////////////

    str += '#side-menu-popup.active{';
    str += 'left:0;';
    str += transition;
    str += '}';













    str += '#log-popup{';
    str += 'display:none;';
    str += 'position:fixed;';
    str += 'width: 100%;';
    str += 'height:100%;';
    str += 'z-index:100000000;';
    str += 'background:#fff;';
    str += 'left:0;';
    str += 'top:0;';
    str += '}';

    str += '#log-text{';
    str += 'position:absolute;';
    str += 'left:0;';
    str += 'top:0;';
    str += 'width:100%;';
    str += 'height:calc(100% - 60px);';
    str += 'background:';
    str += '}';

    str += '#log-clear{';
    str += 'color:#fff;';
    str += 'position:absolute;';
    str += 'left:12px;';
    str += 'bottom:12px;';
    str += 'height:36px;';
    str += 'width:80px;';
    str += 'line-height:36px;';
    str += 'background:#000;';
    str += 'text-align:center;';
    str += 'font-size:12px;';
    str += '}';

    str += '#log-hide{';
    str += 'color:#fff;';
    str += 'position:absolute;';
    str += 'right:12px;';
    str += 'bottom:12px;';
    str += 'height:36px;';
    str += 'width:80px;';
    str += 'line-height:36px;';
    str += 'background:#000;';
    str += 'text-align:center;';
    str += 'font-size:12px;';
    str += '}';

    $("#generated-style").html(str);
}