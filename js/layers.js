var layers = {
    id: "2layer", activeIndex: 0,
    showAll: true,
    getId: function () { var id = this.id; this.id = (parseInt(id) + 1) + "layer"; return id; },
    model: [{ id: "1layer", title: "layer 1", color: "#fff", show: true, active: true }],
    open: function () {
        this.render("init"); // in init mode #layers-popup will render by animation
        setTimeout(function () { $("#layer-popup").addClass("active"); }, 10);
    },
    close: function () {
        $("#layer-popup").removeClass("active");
        setTimeout(function () { $("#layer-popup").remove(); }, 300);
    },
    render: function (mode) {
        $("#layer-popup").remove();
        var className = mode === "init" ? '' : 'active';
        var str = '';
        str += '<div id="layer-popup" class="' + className + '">';
        /**/str += components.render({ component: "DIV", id: "layer-back-drop", className: "back-drop", callback: layers.close });
        /**/str += '<div id="layer-header">';
        /*****/for (var i = 0; i < this.headerItems.length; i++) { str += components.render(this.headerItems[i]); }
        /**/str += '</div>';
        str += '<div id="layer-body">';
        for (var i = 0; i < this.model.length; i++) {
            var model = this.model[i];
            str += '<div data-index="' + i + '" class="layer-item' + (model.active ? ' active' : '') + '" style="border-left:4px solid ' + model.color + ';" id="' + model.id + '">';
            str += components.render({
                component: "Button", id: "layer-item-icon" + i, className: "icon", iconClass: model.show ? "mdi mdi-eye" : "mdi mdi-eye-off",
                callback: function (e) { layers.setVisibility($(e.currentTarget).parent().attr("id")); }
            });
            str += components.render({
                component: "Button", id: "layer-item-text" + i, className: "text", text: model.title,
                callback: function (e) { layers.active($(e.currentTarget).parent().attr("id")); }
            });
            str += '</div>';
        }
        str += '</div>';
        str += '<div id="layer-footer">';
        for (var i = 0; i < this.footerItems.length; i++) { str += components.render(this.footerItems[i]); }
        str += '</div>';
        str += '</div>';
        $("body").append(str);
    },
    add: function () {
        this.deactiveAll(); var id = this.getId();
        var length = this.model.length;
        this.model.push({ title: "layer " + parseInt(id), id: id, color: "#fff", show: true, active: true });
        this.activeIndex = length;
        this.render();
    },
    rename: function (title) {
        layers.getActive().title = title;
        layers.render();
    },
    remove: function (id) {
        if (layers.model.length < 2) { return false; }
        var id = layers.getActive().id;
        for (var i = 0; i < app.state.lines.length; i++) {
            var line = app.state.lines[i];
            if (!line) { continue; }
            if (line.layer.id === id) { app.state.lines.splice(i, 1); i--; }
        }
        for (var j = 0; j < app.state.points.length; j++) {
            var point = app.state.points[j];
            if (!point) { continue; }
            if (point.layer.id === id) { app.state.points.splice(j, 1); j--; }
        }
        for (var k = 0; k < layers.model.length; k++) {
            var layer = layers.model[k];
            if (layer.id === id) { layers.model.splice(k, 1); break; }
        }
        layers.active(layers.model[layers.model.length - 1].id);
        layers.render();
        app.redraw();
    },
    moveUp: function () {
        if (!this.activeIndex) { return; }
        var active = this.model[this.activeIndex];
        this.model.splice(this.activeIndex, 1);
        this.model.splice(this.activeIndex - 1, 0, active);
        this.activeIndex--;
        this.render();
    },
    moveDown: function () {
        if (this.activeIndex === this.model.length - 1) { return; }
        var active = this.model[this.activeIndex];
        this.model.splice(this.activeIndex, 1);
        this.model.splice(this.activeIndex + 1, 0, active);
        this.activeIndex++;
        this.render();
    },
    getVisibles: function () { return this.model.map(function (item) { if (item.show) { return item; } }); },
    getHiddens: function () { return this.model.map(function (item) { if (!item.show) { return item; } }); },
    setVisibility: function (id) {
        if (id === "all") { this.showAll = !this.showAll; for (var i = 0; i < this.model.length; i++) { this.model[i].show = this.showAll; } }
        else { var object = layers.getObjectByID(id); object.show = !object.show; }
        this.render(); app.redraw();
    },
    mergeVisibles: function () {
        var list = this.getVisibles();
        if (list.length < 2) { return; }
        var mergedLayer = list[0];
        for (var i = 0; i < app.state.lines.length; i++) {
            var line = app.state.lines[i];
            var success = false;
            for (var i = 1; i < list.length; i++) { if (line.layer.id === list[i].id) { success = true; break; } }
            if (!success) { continue; }
            line.layer = mergedLayer;
        }
        for (var i = 0; i < app.state.points.length; i++) {
            var point = app.state.points[i];
            var success = false;
            for (var i = 1; i < list.length; i++) { if (point.layer.id === list[i].id) { success = true; break; } }
            if (!success) { continue; }
            point.layer = mergedLayer;
        }
        for (var i = 1; i < list.length; i++) { this.remove(list[i]); }
        this.active(id);
        this.render();
        app.redraw();
    },
    active: function (id) { this.deactiveAll(); var index = this.getIndexByID(id); this.model[index].active = true; this.activeIndex = index; this.render(); },
    deactiveAll: function () { for (var i = 0; i < this.model.length; i++) { this.model[i].active = false; } this.activeIndex = null; },
    getActive: function () { return this.model[layers.activeIndex]; },
    getObjectByID: function (id) {
        for (var i = 0; i < layers.model.length; i++) {
            if (layers.model[i].id === id) { return layers.model[i]; }
        }
        return false;
    },
    getIndexByID: function (id) {
        for (var i = 0; i < layers.model.length; i++) {
            if (layers.model[i].id === id) { return i; }
        }
        return false;
    },
    headerItems: [
            {
                component: "Button",
                id: "layer-visibility",
                className: "icon",
                iconClass: function () { return layers.showAll ? 'mdi mdi-eye' : 'mdi mdi-eye-off' },
                callback: function () { layers.setVisibility("all"); }
            },
            {
                component: "Button",
                id: "layer-add",
                className: "icon",
                iconClass: "mdi mdi-plus",
                callback: function () {
                    Alert.open({
                        buttons: [
                            { text: "yes", callback: function () { layers.add(); Alert.close(); } },
                            { text: "cansel", callback: Alert.close }
                        ],
                        template: "Do you want to add new layer?",
                        title: "New Layer."
                    });
                }
            },
            {
                component: "Button",
                id: "layer-duplicate",
                className: "icon",
                iconClass: "mdi mdi-image-filter-none"
            },
            {
                component: "Button",
                id: "layer-move-down",
                className: "icon",
                iconClass: "mdi mdi-arrow-down-bold",
                callback: function () { layers.moveDown(); }
            },
            {
                component: "Button",
                id: "layer-move-up",
                className: "icon",
                iconClass: "mdi mdi-arrow-up-bold",
                callback: function () { layers.moveUp(); }
            },
    ],
    footerItems: [
        {
            id: "layer-pallete", iconClass: "mdi mdi-palette", component: "Button", className: "icon", callback: function () {
                Alert.open({
                    buttons: [{ text: "Close", callback: function () { Alert.close(); } }],
                    template: {
                        type: "color pallete", callback: function (e) {
                            var color = $(e.currentTarget).attr("data-color");
                            var active = layers.getActive();
                            active.color = color;
                            layers.render();
                            app.redraw();
                            Alert.close();
                        }
                    },
                    title: "Select layer color."
                });
            },
        },
        {
            id: "layer-rename", iconClass: "mdi mdi-square-edit-outline", component: "Button", className: "icon", callback: function () {
                var title = layers.getActive().title;
                Alert.open({
                    buttons: [
                        {
                            text: "yes", callback: function () {
                                full_keyboard.open({
                                    text: title,
                                    title: "Inter New Name For Selected Layer:",
                                    callback: layers.rename
                                });
                                Alert.close();
                            }
                        },
                        { text: "cansel", callback: Alert.close }
                    ],
                    template: "Do You Want To Rename Selected Layer?",
                    title: "Rename Layer."
                });
            }
        },
        {
            id: "layer-remove", iconClass: "mdi mdi-delete", component: "Button", className: "icon", callback: function () {
                var id = layers.getActive().id;
                if (layers.model.length < 2) {
                    Alert.open({
                        buttons: [{ text: "close", callback: Alert.close }],
                        template: "Can Not Delete This Layer!!!",
                        title: "Delete Failed."
                    });
                    return false;
                }
                Alert.open({
                    buttons: [
                        { text: "yes", callback: function () { layers.remove(layers.getActive().id); Alert.close(); } },
                        { text: "cansel", callback: Alert.close }
                    ],
                    template: "Do You Want To Delete Selected Layer?",
                    title: "Delete Layer."
                });

            }
        },
        {
            id: "layer-merge-visible", iconClass: "mdi mdi-eye-plus", component: "Button", className: "icon", callback: function () {
                var list = layers.getVisibles();
                if (list.length < 2) {
                    Alert.open({
                        buttons: [{ text: "Close", callback: Alert.close }, ],
                        template: "Visible layers are less than 2.",
                        title: "Merge visibles error."
                    });
                    return false;
                }
                Alert.open({
                    buttons: [
                        { text: "Yes", callback: function () { layers.mergeVisibles(); Alert.close(); } },
                        { text: "Cansel", callback: Alert.close }
                    ],
                    template: "Do You Want To Merge All Visible Layers?",
                    title: "Merge Visible Layers."
                });
            }
        },
        { id: "layer-merge-all", iconClass: "mdi mdi-arrow-collapse-vertical", component: "Button", className: "icon" },
    ],

}

function ColorPalette(props) {
    var str = '';
    str += '<div id="color-palette">';
    str += '<div class="back-drop"></div>';
    str += '<div id="color-palette-header">';
    str += '<div id="color-palette-title">Select Color</div>';
    str += '<div id="color-palette-close">';
    str += '<span class="mdi mdi-close"></span>';
    str += '</div>';
    str += '</div>';
    str += '<div id="color-palette-body">';
    for (var i = 0; i < props.colors.length; i++) {
        str += PaletteItem({ color: props.colors[i] });
    }
    str += '</div>';
    str += '</div>';
    return str;
}

function PaletteItem(props) {
    var str = '';
    str += '<div data-color="' + props.color + '" class="color-palette-item" style="background:' + props.color + '"></div>';
    return str;
}