var style = app.style;
var top_menu_size = 36;
var float_toolbar_size = 36;
var alert_size = 36;
var keyboard_size = 36;
var layer_size = 36;
var full_keyboard_height = 36;
var full_keyboard_background = "#425768";
var background2 = 'background:url(bg1.jpg);background-size:250px 350px;';
var active_font_color = "#bebdc2";
var button_background = "#313236";
var color = "#1ad25f";
var zoom_slider_color = "#fff";
var zoom_slider_thickness = 1;
var zoom_slider_fontsize = 11;
var back_drop_background = 'rgba(0,0,0,0.5)';
var transition = "transition:0.3s;";
var slider_background = 'background-image: url(images/slider.jpg);background-size: cover;';
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

    //str += '#top-menu {';
    //str += style.box_shadow;
    //str += 'height: ' + top_menu_size + 'px;';
    //str += background2;
    //str += 'position: fixed;';
    //str += 'width: 100%;';
    //str += 'left: 0;';
    //str += 'z-index: 10;';
    //str += 'top: 0;';
    //str += '}';

    //str += '#top-menu .icon-container {';
    //str += 'width:' + (top_menu_size * 3 / 4) + 'px;';
    //str += 'height:' + (top_menu_size * 3 / 4) + 'px;';
    //str += 'margin:' + (top_menu_size / 8) + 'px;';
    //str += 'border-radius:100%;';
    //str += 'text-align:center;';
    //str += 'position:relative;';
    //str += '}';

    //str += '#top-menu #side-menu-button{';
    //str += 'width:' + (top_menu_size * (0.75)) + 'px;';
    //str += 'background:#666;';
    //str += 'border-radius:3px;';
    //str += '}';

    //str += '#top-menu .icon-container:hover {';
    //str += 'background:rgba(255,255,255,0.3)';
    //str += '}';

    //str += '#top-menu .icon-container .icon {';
    //str += 'color: ' + style.font_color + ';';
    //str += 'line-height:' + (top_menu_size * 3 / 4) + 'px;';
    //str += 'font-size:' + (top_menu_size / 9 * 4) + 'px;';
    //str += '}';

    //str += '#top-menu #app-mode{';
    //str += 'position:relative;';
    //str += 'width:' + (top_menu_size * (2.2)) + 'px;';
    //str += 'height:' + (top_menu_size * 3 / 4) + 'px;';
    //str += 'margin:' + (top_menu_size / 8) + 'px;';
    //str += 'z-index: 1;';
    //str += '}';

    //str += '#top-menu #app-mode .r-slider-text{';
    //str += 'color: ' + style.font_color + ';';
    //str += 'font-size: ' + (top_menu_size *(0.3)) + 'px;';
    //str += '}';

    //str += '#top-menu #app-mode-items{';
    //str += 'position:relative;';
    //str += 'width:' + (top_menu_size * (3)) + 'px;';
    //str += 'height:' + (top_menu_size * 3 / 4) + 'px;';
    //str += 'margin:' + (top_menu_size / 8) + 'px;';
    //str += 'border-radius: 45px;';
    //str += 'background: #222;';
    //str += 'z-index: 10;';
    //str += '}';

    //str += '.app-mode-item{';
    //str += 'position:relative;';
    //str += 'height:' + (top_menu_size * 1) + 'px;';
    //str += 'line-height:' + (top_menu_size * 1) + 'px;';
    //str += 'width:100%;';
    //str += 'font-size: ' + (top_menu_size / 3) + 'px;';
    //str += 'background:#222;';
    //str += 'text-align:center;';
    //str += 'color:' + style.font_color + ';';
    //str += 'box-shadow: inset 2px 2px 10px 1px #222;';
    //str += '}';

    //str += '#app-mode-item-icon{';
    //str += 'position:absolute;';
    //str += 'width:' + (top_menu_size * 3 / 4) + 'px;';
    //str += 'left:0;';
    //str += 'top:0;';
    //str += 'text-align:center;';
    //str += 'font-size:' + (top_menu_size * (0.43)) + 'px;';
    //str += 'height:' + (top_menu_size * 3 / 4) + 'px;';
    //str += 'line-height:' + (top_menu_size * 3 / 4) + 'px;';
    //str += '}';

    //str += '#app-mode-item-title{';
    //str += 'position:absolute;';
    //str += 'text-align:left;';
    //str += 'width:calc(100% - ' + (top_menu_size * 3 / 4) + 'px);';
    //str += 'left:' + (top_menu_size * 3 / 4) + 'px;';
    //str += 'top:0;';
    //str += 'height:' + (top_menu_size * 3/4) + 'px;';
    //str += 'line-height:' + (top_menu_size * 3/4) + 'px;';
    //str += '}';

    //str += '#app-mode-item-caret{';
    //str += 'position:absolute;';
    //str += 'text-align:center;';
    //str += 'width:' + (top_menu_size * 3 / 4) + 'px;';
    //str += 'right:0;';
    //str += 'top:0;';
    //str += 'height:' + (top_menu_size * 3 / 4) + 'px;';
    //str += 'font-size:' + (top_menu_size * 1 / 2) + 'px;';
    //str += 'line-height:' + (top_menu_size * 3 / 4) + 'px;';
    //str += '}';

    //str += '#top-menu #app-mode-items #app-mode-items-title {';
    //str += 'position:absolute;';
    //str += 'width:100%;';
    //str += 'top:0;';
    //str += 'left:0;';
    //str += 'color:' + style.font_color + ';';
    //str += 'font-size: ' + (top_menu_size *(0.3)) + 'px;';

    //str += 'height:100%;';
    //str += 'line-height:' + (top_menu_size * 3 / 4) + 'px;';
    //str += 'border-radius: 15px;';
    //str += '}';

    //str += '#top-menu #app-mode-items #app-mode-items-popup{';
    //str += style.box_shadow;
    //str += 'position:absolute;';
    //str += 'width:100%;';
    //str += 'left:0;';
    //str += 'top:0;';
    //str += 'height:0px;';
    //str += 'z-index: 1;';
    //str += 'overflow: hidden;';
    //str += 'border-radius: 15px;';
    //str += transition;
    //str += '}';

    //str += '#top-menu #app-mode-items.active #app-mode-items-popup{';
    //str += 'height:auto;';
    //str += 'z-index: 100;';
    //str += transition;
    //str += '}';

    //str += '#app-mode-items .back-drop{';
    //str += 'display:none;';

    //str += '}';

    //str += '#app-mode-items.active .back-drop{';
    //str += 'display:block;';
    //str += '}';

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
    str += 'color:' + style.lightFontColor + ';';
    str += 'line-height:' + float_toolbar_size + 'px;';
    str += 'font-size:' + (float_toolbar_size / 2) + 'px;';
    str += '}';
    str += '#zoom-slider{position: relative;';
    str += 'width:calc(100% - ' + (4 * float_toolbar_size) + 'px);';
    str += 'height:' + float_toolbar_size + 'px;';

    str += '}';

    ///////////////////////////////////Alert//////////////////////////////////////////////////////

    str += '#alert{';
    str+='position: fixed;z-index: 1000;top: 50px;';
    str += 'width:' + (alert_size * 8) + 'px;';
    str += 'color:' + style.font_color + ';';
    str += style.box_shadow;
    str += '}';

    str += '.alert-header{';
    str += 'z-index: 10;position: relative;width: 100%;';
    str += 'height:' + alert_size + 'px;';
    str += 'font-size:' + (alert_size * (2 / 5)) + 'px;';
    str += 'font-weight:bold;';
    str += 'background:#2f3034;';
    str += '}';

    str += '.alert-title{';
    str += 'float: left;';
    str += 'line-height:' + alert_size + 'px;';
    str += 'margin-left:' + (alert_size / 3) + 'px;';
    str += '}';

    str += '.alert-close{';
    str+='text-align: center;position: relative;float: right;';
    str += 'width:' + alert_size + 'px;';
    str += 'height:' + alert_size + 'px;';
    str += '}';

    str += '.alert-body{';
    str += 'z-index: 10;position: relative;';
    str += 'padding:' + (alert_size / 3) + 'px;';
    str += style.background;
    str += 'font-size:'+(alert_size/3)+'px;';
    str += 'width:calc(100% - ' + (alert_size * (2 / 3)) + 'px);';
    str += '}';

    str += '.alert-footer{';
    str += 'z-index: 10;position: relative;width: 100%;';
    str += 'height:' + alert_size + 'px;';
    str += style.background;
    str += '}';

    str += '.alert-button-container{';
    str+='position: relative;float: right;width: 33%;';
    str += 'height:' + alert_size + 'px;';
    str += '}';

    str += '.alert-button{';
    str+='position: absolute;text-align: center;';
    str += 'line-height:' + (alert_size * (2 / 3)) + 'px;';
    str += 'height:calc(100% - ' + (alert_size / 3) + 'px);';
    str += 'width:calc(100% - ' + (alert_size / 3) + 'px);';
    str += 'top:' + (alert_size / 6) + 'px;';
    str += 'left:' + (alert_size / 6) + 'px;';
    str += 'background:' + button_background + ';';
    str += 'font-size:' + (alert_size * (2 / 5)) + 'px;';
    str += '}';

    str += '.alert-close span{';
    str += 'line-height:' + alert_size + 'px;';
    str += '}';

    str += '#alert .alert-template-title{';
    str += 'position:relative;';
    str += 'width:60px;';
    str += 'white-space:nowrap;';
    str += 'text-align:left;';
    str += 'font-size:' + (alert_size / 3) + 'px;';
    str += 'float:left;';
    str += 'height:' + alert_size + 'px;';
    str += 'line-height:' + alert_size + 'px;';
    str += 'margin-left:' + (alert_size / 6) + 'px;';
    str += '}';

    str += '#alert .alert-template-value{';
    str += 'position:relative;';
    str += 'width:40px;';
    str += 'text-align:center;';
    str += 'font-size:' + (alert_size / 3) + 'px;';
    str += 'float:right;';
    str += 'height:' + alert_size + 'px;';
    str += 'line-height:' + alert_size + 'px;';
    str += '}';

    str += '#alert .alert-template-item{';
    str += 'position:relative;';
    str += 'width:100%;';
    str += 'border-top:1px solid #535458;';
    str += 'border-bottom:1px solid #141519;';
    str += 'border-left:1px solid #535458;';
    str += 'border-right:1px solid #141519;';
    str += 'height:' + alert_size + 'px;';
    str += '}';

    str += '#alert .alert-template-control{';
    str += 'position:relative;';
    str += 'width:calc(100% - 100px - ' + (alert_size / 6) + 'px);';
    str += 'height:' + alert_size + 'px;';
    str += 'float:right;';
    str += 'line-height:' + alert_size + 'px;';
    str += 'color:' + style.font_color + ';';
    str += 'text-align:center;';
    str += '}';

    str += '#alert .alert-template-button{';
    str += 'position:relative;';
    str += 'height:' + alert_size + 'px;';
    str += 'float:left;';
    str += 'line-height:' + alert_size + 'px;';
    str += 'color:' + style.font_color + ';';
    str += 'opacity:0.3;';
    str += 'padding:0 ' + (alert_size / 6) + 'px;';
    str += 'min-width:' + (alert_size * (2/3))  + 'px;';
    str += '}';

    str += '#alert .alert-template-button.active{';
    str += 'color:red;';
    str += 'opacity:1;';
    str += '}';

    str += '.alert-template-switch{';
    str += 'border-radius: 45px;';
    str += 'background: #222;';
    str += 'box-shadow: inset 2px 2px 10px 1px #222;';
    str += 'position:relative;';
    str += 'width:70px;';
    str += 'text-align:left;';
    str += 'font-size:' + (alert_size / 3) + 'px;';
    str += 'float:left;';
    str += 'height:' + (alert_size * (3 / 4)) + 'px;';
    str += 'margin-top:' + (alert_size * (1 / 8)) + 'px;';
    str += '}';

    str += '.alert-template-numberbox{';
    str += 'background: #222;';
    str += 'box-shadow: inset 2px 2px 10px 1px #222;';
    str += 'position:relative;';
    str += 'width:80px;';
    str += 'text-align:center;';
    str += 'font-size:' + (alert_size / 3) + 'px;';
    str += 'float:right;';
    str += 'height:' + (alert_size * (3 / 4)) + 'px;';
    str += 'line-height:' + (alert_size * (3 / 4)) + 'px;';
    str += 'margin-top:' + (alert_size * (1 / 8)) + 'px;';
    str += 'margin-right:' + (alert_size / 6) + 'px;';
    str += '}';

    ////////////////////////////////////////////////////////////////////////////////////////////////
    str += '#full-keyboard{position:fixed;width:calc(100% - 12px);left:0;bottom:0;z-index: 10000;border:6px solid ' + full_keyboard_background + ';';
    str += 'background:' + full_keyboard_background + ';';
    str += 'height:' + (full_keyboard_height * 6) + 'px;';
    str += '}';
    str += '.full-keyboard-key{float:left;text-align:center;width:10%;color:' + style.lightFontColor + ';position:relative;';
    str += 'height:' + full_keyboard_height + 'px;';
    str += 'line-height: ' + full_keyboard_height + 'px;';
    str += '}';
    str += '#full-keyboard .full-keyboard-row{position: relative;width:100%;z-index:10;';
    str += 'height:' + full_keyboard_height + 'px;';
    str += '}';
    str += '#full-keyboard-title {color:' + style.lightFontColor + ';text-align:left;margin-left:12px;';
    str += 'line-height:' + full_keyboard_height + 'px;';
    str += 'width:calc(100% - 12px);';
    str += '}';
    str += '#full-keyboard-show {color:#71b0ab;text-align:center;float:left;background:rgba(0,0,0,0.2);';
    str += 'line-height:' + full_keyboard_height + 'px;';
    str += 'height:' + full_keyboard_height + 'px;';
    str += 'width:calc(100% - ' + (full_keyboard_height * 2) + 'px);';
    str += '}';
    str += '#full-keyboard-close {text-align:center;float:left;color:' + style.lightFontColor + ';';
    str += 'line-height:' + full_keyboard_height + 'px;';
    str += 'width:' + full_keyboard_height + 'px;';
    str += '}';
    str += '#full-keyboard-ok {text-align:center;float:left;color:' + style.lightFontColor + ';';
    str += 'line-height:' + full_keyboard_height + 'px;';
    str += 'width:' + full_keyboard_height + 'px;';
    str += '}';

    str += '.full-keyboard-key-empty{float:left;width:5%;';
    str += 'height:' + full_keyboard_height + 'px;';
    str += '}';
    str += '.full-keyboard-key.full-keyboard-back-space{width:15%}';
    str += '.full-keyboard-key.full-keyboard-space{width:15%}';
    str += '.full-keyboard-key:before{content:"";position:absolute;width:calc(100% - 6px);height:calc(100% - 6px);border:1px solid rgba(255,255,255,0.1);left:2px;top:2px;border-radius:6px;}';
    ////////////////////////////////////////////////////////////////////////////////////////

    str += '#keyboard{';
    str+='z-index:10000;';
    str += 'position:fixed;';
    str += 'width:' + (keyboard_size * (6)) + 'px;';
    str += 'left:calc(50% - ' + (keyboard_size * (3)) + 'px);';
    str += 'top:50px;';
    str += 'opacity:0.9;';
    str += 'font-size:' + (keyboard_size / 3) + 'px;';
    str += style.background;
    str += transition;
    str += 'color:' + style.font_color + ';';
    str += style.box_shadow;
    str += '}';
    

    str += '#keyboard-header{';
    str += 'z-index:10;';
    str += 'font-weight:bold;';
    str += 'font-size:' + (keyboard_size * (2 / 5)) + 'px;';
    str += 'position: relative;';
    str += 'width:100%;';
    str += 'height:' + keyboard_size + 'px;';
    str += background2;
    str += '}';

    str += '#keyboard-body{';
    str += 'z-index:10;';
    str += 'position:relative;';
    str += 'width:100%;';
    str += 'float:left;';
    str += '}';

    str += '.keyboard-number-key{';
    str += 'position:relative;';
    str += 'text-align: center;';
    str += 'float:left;';
    str += 'width:' + (keyboard_size * (2)) + 'px;';
    str += 'height:' + keyboard_size + 'px;';
    str += 'line-height:' + keyboard_size + 'px;';
    str += 'font-size:' + (keyboard_size * (2 / 5)) + 'px;';
    str += '}';

    str += '.keyboard-number-key.active{';
    str += 'background:rgba(255,255,255,0.1);';
    str += '}';

    str += '#keyboard-footer{';
    str += 'z-index:10;';
    str += 'position: relative;';
    str += 'width:100%;';
    str += 'float:left;';
    str += '}';

    str += '.keyboard-field{';
    str += 'position: relative;';
    str += 'width:calc(100% - ' + (keyboard_size * (2 / 3)) + 'px);';
    str += 'height:' + keyboard_size + 'px;';
    str += 'left:' + (keyboard_size * (1 / 3)) + 'px;';
    str += 'text-align:center;';
    str += 'border-top:1px solid #535458;';
    str += 'border-bottom:1px solid #141519;';
    str += 'border-left:1px solid #535458;';
    str += 'border-right:1px solid #141519;';
    str += '}';

    str += '.keyboard-field.active{';
    str += 'color:' + color + ';';
    str += '}';

    str += '.keyboard-label{';
    str += 'position: relative;';
    str += 'font-size:' + (keyboard_size * (1 / 3)) + 'px;';
    str += 'line-height:' + keyboard_size + 'px;';
    str += 'float:left;';
    str += 'width:calc(100% - ' + ((keyboard_size * (3 / 2)) + (keyboard_size / 3)) + 'px);';
    str += 'text-align:left;';
    str += 'margin-left:' + (keyboard_size / 3) + 'px;';
    str += '}';

    str += '.keyboard-number-box{';
    str += 'height:' + (keyboard_size * (2 / 3)) + 'px;';
    str += 'line-height:' + (keyboard_size * (2 / 3)) + 'px;';
    str += 'margin:' + (keyboard_size * (1 / 6)) + 'px 0;';
    str += 'border-bottom:1px solid;';
    str += 'display: inline-block;';
    str += 'position: relative;';
    str += 'top:0;';
    str += 'width:' + (keyboard_size * (3 / 2)) + 'px;';
    str += 'float:right;';
    str += 'text-align:center;';
    str += '}';

    str += '#keyboard-ok{';
    str += 'height:' + (keyboard_size) + 'px;';
    str += 'line-height:' + (keyboard_size) + 'px;';
    str += 'text-align:center;';
    str += '}';

    str += '#keyboard-close{';
    str += 'float:right;';
    str += 'width:' + (keyboard_size) + 'px;';
    str += 'height:' + (keyboard_size) + 'px;';
    str += 'line-height:' + (keyboard_size) + 'px;';
    str += 'text-align: center;';
    str += '}';

    str += '#keyboard-title{';
    str += 'float:left;';
    str += 'width:calc(100% - ' + (keyboard_size + keyboard_size / 3) + 'px);';
    str += 'margin-left:' + (keyboard_size / 3) + 'px;';
    str += 'height:' + (keyboard_size) + 'px;';
    str += 'line-height: ' + (keyboard_size) + 'px;';
    str += '}';

    /////////////////////////////////////////////////////////////////////////////////////////
    var axis_size = 30;
    str += '#axis{';
    str += 'width:0;';
    str += 'height:0;';
    str += 'opacity:0.6;';
    str += 'position: fixed;';
    str += 'display:none;';
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

    str += '#axisBackground{';
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
    str += 'top:calc(50% + 0px + ' + (axis_size * (1/12)) + 'px);';
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


    str += '#axisBackground:before{';
    str += 'content:"";';
    str += 'position:absolute;';
    str += 'width:6px;';
    str += 'height:6px;';
    str += 'border:1px solid red;';
    str += 'border-radius:100%;';
    str += 'left:calc(50% - 4px);';
    str += 'top:calc(50% - 4px);';
    str += '}';

    str += '.axis-icon-container{';
    str += 'position:absolute;';
    str += 'width:calc(' + (axis_size * (2.5)) + 'px + ' + (axis_size * (2)) + 'px + 0px);';
    str += 'height:0;';
    str += 'top:50%;';
    str += 'left:calc(-' + (axis_size * (1.25)) + 'px - ' + axis_size + 'px + 0px);';
    str += '}';

    str += '.axis-icon{';
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
    str += '}';



    str += '#axisRotate{transform: rotate(45deg);}';

    str += '#axisRotate .axis-icon{';
    str += 'transform: rotate(-45deg);';
    str += '}';

    str += '#axisKeyboard{';
    str += 'transform: rotate(-45deg);';
    str += '}';

    str += '#axisKeyboard .axis-icon{';
    str += 'transform: rotate(45deg);';
    str += '}';
    str += '#axisMoveUp{';
    str += 'transform: rotate(-90deg)';
    str += '}';

    str += '#axisMoveUp .axis-icon{';
    str += 'transform: rotate(90deg);';
    str += '}';

    str += '#axisMoveDown{';
    str += 'transform: rotate(90deg);';
    str += '}';

    str += '#axisMoveDown .axis-icon{';
    str += 'transform: rotate(-90deg);';
    str += '}';

    str += '#axisMoveLeft{';
    str += 'transform: rotate(180deg);';
    str += '}';

    str += '#axisMoveLeft .axis-icon{';
    str += 'transform: rotate(-180deg);';
    str += '}';
    str += '#axisCenter{';
    str += 'transform: rotate(-135deg);';
    str += '}';

    str += '#axisCenter .axis-icon{';
    str += 'transform: rotate(135deg);';
    str += '}';
    str += '#axisMove{';
    str += 'transform: rotate(135deg);';
    str += '}';

    str += '#axisMove .axis-icon{';
    str += 'transform: rotate(-135deg);';
    str += '}';



    //////////////////////////////////////////////////////////////////////////////////////////
    var color_palette_size = 36;
    str += '#color-palette {background: #282a31;position:fixed;z-index:1000;';
    str += 'width:' + (5 * color_palette_size) + 'px;';
    str += 'height:' + (5 * color_palette_size) + 'px;';
    str += 'top:calc(50% - ' + (5 * color_palette_size / 2) + 'px);';
    str += 'left:calc(50% - ' + (5 * color_palette_size / 2) + 'px);';
    str += '}';
    str += '.color-palette-item {float:left;position: relative;';
    str += 'width:' + color_palette_size + 'px;';
    str += 'height:' + color_palette_size + 'px;';
    str += '}';
    str += '#color-palette-body{left:0;position:absolute;width:100%;z-index:10;';
    str += 'top:' + color_palette_size + 'px;';
    str += 'height:calc(100% - ' + color_palette_size + 'px);';
    str += '}';
    str += '#color-palette-header{width:100%;z-index:10;top:0;left:0;position:absolute;';
    str += style.background;
    str += 'font-size:' + (4 * color_palette_size / 9) + 'px;';
    str += 'height:' + color_palette_size + 'px;';
    str += '}';
    str += '#color-palette-title{color:' + style.lightFontColor + ';float:left;';
    str += 'line-height:' + color_palette_size + 'px;';
    str += 'width:calc(100% - ' + color_palette_size + 'px - ' + (color_palette_size / 3) + 'px);';
    str += 'height:' + color_palette_size + 'px;';
    str += 'padding-left:' + (color_palette_size / 3) + 'px;';
    str += '}';
    str += '#color-palette-close{text-align:center;color:' + style.lightFontColor + ';float:right;';
    str += 'line-height:' + color_palette_size + 'px;';
    str += 'width:' + color_palette_size + 'px;';
    str += 'height:' + color_palette_size + 'px;';
    str += '}';
    str += '.switch.active{';
    str += 'border-radius:100%;';
    str += 'box-shadow:inset 0px 0px 12px 0px #b0dc00';
    str += '}';
    str += '.switch.active .icon{';
    str += 'color: #b0dc00 !important;';
    str += '}';
    /////////////////////////////////////////////////////////////////////////////////
    var modify_size = 24;

    str += '#modify-tools{';
    //str += 'height:'+(modify_size)+'px;';
    str += 'font-size:' + (modify_size * 3 / 7) + 'px;';
    str += 'top:' + (top_menu_size) + 'px;';
    str += 'position:fixed;';
    str += 'left:0;';
    str += 'width:100%;';
    str += 'color:'+style.font_color+';';
    
    str += 'background:#2f3034;';
    str += 'border-top:1px solid #000;';
    str += '}';
        
    str += '#modify-tools .modify-button{';
    str += 'font-weight:bold;';
    str += 'display:none;';
    str += 'position:relative;';
    str += 'background:#222;';
    str += 'border-radius:3px;';
    str += 'height:' + (modify_size * 3 / 4) + 'px;';
    str += 'margin:' + (modify_size / 8) + 'px ' + (modify_size / 12) + 'px;';
    str += 'float:left;';
    str += 'padding:'+(modify_size / 8)+'px;';
    str += 'text-align:center;';
    str += 'line-height:' + (modify_size * 3 / 4) + 'px;';
    str += '}';

    str += '#modify-tools .modify-button.clicked{';
    str += 'box-shadow:0 0 6px 3px #fff;';
    str += 'background:#fff;';
    str += 'color:#000;';
    str += '}';
    str += '#modify-tools .modify-button.active{';
    str += 'display:block;';
    str += '}';
    ///////////////////////////////////////////////////////////////////////////
    // str += '#layer-popup{';
    // str += 'position: fixed;';
    // str += 'z-index:100;';
    // str += 'color: ' + style.font_color + ';';
    // str += style.background;
    // str += 'width: ' + (Math.max(layers.footerItems.length,layers.headerItems.length) * layer_size) + 'px;';
    // str += 'height: calc(100% - ' + top_menu_size + 'px);';
    // str += 'right: ' + (Math.max(layers.footerItems.length, layers.headerItems.length) * layer_size * -1) + 'px;';
    // str += 'top: ' + top_menu_size + 'px;';
    // str += transition;
    // str += '}';
    // str += '#layer-popup.active{';
    // str += 'right: 0;';
    // str += transition;
    // str += '}';
    
    // str += '#layer-popup .icon-container{';
    // str += 'border-radius:100%;';
    // str += 'text-align:center;';
    // str += 'float: left;';
    // str += 'width: ' + layer_size + 'px;';
    // str += 'height: ' + layer_size + 'px;';
    // str += 'text-align:center;';
    // str += '}';

    // str += '#layer-popup .icon-container .icon{';
    // str += 'line-height:' + layer_size + 'px;';
    // str += 'font-size:' + (layer_size / 9 * 4) + 'px;';
    // str += '}';

    // str += '#layer-popup .layer-item{';
    // str += 'position: relative;';
    // str += 'width: 100%;';
    // str += 'border-top:1px solid #535458;';
    // str += 'border-bottom:1px solid #141519;';
    // str += style.background;
    // str += 'height: ' + layer_size + 'px;';
    // str += '}';

    // str += '#layer-popup .layer-item.active{';
    // str += 'background:#646464;';
    // str += 'color: ' + color + ';';
    // str += '}';

    // str += '#layer-popup .layer-item .title{';
    // str += 'position: relative;';
    // str += 'float: left;';
    // str += 'font-size:' + (layer_size / 3) + 'px;';
    // str += 'line-height:' + layer_size + 'px;';
    // str += 'padding-left:' + (layer_size / 8) + 'px;';
    // str += 'width: calc(100% - ' + layer_size + 'px - ' + (layer_size / 8) + 'px);';
    // str += '}';

    
    // str += '#layer-popup #layer-header{';
    // str += 'position: absolute;';
    // str += 'width: 100%;';
    // str += 'left: 0;';
    // str += 'top: 0;';
    // str += background2;
    // str += 'z-index:10;';
    // str += '}';

    // str += '#layer-popup #layer-footer{';
    // str += 'position: absolute;';
    // str += 'width: 100%;';
    // str += 'left: 0;';
    // str += 'bottom: 0;';
    // str += background2;
    // str += 'z-index:10;';
    // str += '}';

    // str += '#layer-header .icon-container, #layer-footer .icon-container {';
    // str += 'float: left;';
    // str += '}';

    // str += '#layer-body {';
    // str += 'position: absolute;';
    // str += 'width: 100%;';
    // str += 'left: 0;';
    // str += 'overflow: hidden;';
    // str += 'z-index:10;';
    // str += 'top: ' + layer_size + 'px;';
    // str += 'height: calc(100% - ' + (layer_size * 2) + 'px);';
    // str += '}';
    
    ////////////////////////////////////////////////////////////////////////////////
    str += '#alert .r-slider-button,#app-mode .r-slider-button {';
    str += 'background: #2196f3;';
    str += 'border-radius: 100%;';
    str += 'text-align: center;';
    str += slider_background;
    str += 'box-shadow: 2px 2px 9px 1px #222;';
    str += '}';

    str += '#alert .r-slider-line {';
    str += 'background: #444;';
    str += 'border-radius: 4px;';
    str += 'box-shadow: inset 0 0px 2px 1px #000;';
    str += '}';

    str += '#alert .r-slider-fill {';
    str += 'background: #fff;';
    str += 'border-radius: 4px;';
    str += 'box-shadow: inset 0px 0px 3px 1px #000;';
    str += '}';

    str += '#alert .r-slider-number {';
    str += 'z-index: 1000;';
    str += 'left: calc(50% - 15px);';
    str += 'line-height: 14px;';
    str += 'text-align: center;';
    str += 'color: #2196f3;';
    str += 'font-size: 14px;';
    str += 'width: 30px;';
    str += 'height: 14px;';
    str += '}';

    //////////////////////////////////////////////////////////////////////////////////////////
    str += '#zoom-slider .r-slider-line {';
    str += 'background: ' + zoom_slider_color + ';';
    str += 'border-radius: 4px;';
    str += '}';

    str += '#zoom-slider .r-slider-fill {';
    str += 'background: ' + zoom_slider_color + ';';
    str += '}';

    str += '#zoom-slider .r-slider-button {';
    str += 'background: #222;';
    str += 'box-shadow: inset 0 0 0 ' + zoom_slider_thickness + 'px ' + zoom_slider_color + ';';
    str += 'border-radius: 4px;';
    str += 'text-align: center;';
    str += '}';

    str += '#zoom-slider .r-slider-number {';
    str += 'position: relative;';
    str += 'top: 5px;';
    str += 'left: -5px;';
    str += 'font-size: '+zoom_slider_fontsize+'px;';
    str += 'color: '+zoom_slider_color+';';
    str += '}';

    str += '#zoom-slider .r-slider-number:before {';
    str += 'content: "%";';
    str += 'position: absolute;';
    str += 'top: 0px;';
    str += 'left: 28px;';
    str += 'font-size: ' + zoom_slider_fontsize + 'px;';
    str += 'color: ' + zoom_slider_color + ';';
    str += '}';
    str += '#side-menu-popup{';
    str += 'position: absolute;';
    str += 'z-index:10;';
    str += 'top:' + top_menu_size + 'px;';
    str += 'left:-200px;';
    str += 'width:200px;';
    str += 'height:calc(100% - ' + top_menu_size + 'px);';
    str += 'background:url(bg1.jpg);';
    str += 'background-size:cover;';
    str += 'z-index:10;';
    str += transition;
    str += style.box_shadow;
    str += '}';

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