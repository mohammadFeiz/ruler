var undo = {
    size: 30,
    model: [{ u_points: [], u_lines: [], u_point_id: "1p", u_line_id: "1l", u_layer_model: { id: "1layer", title: "layer 1", color: "#fff", show: true, active: true } }],
    getCopy:function (model) {
        return JSON.parse(JSON.stringify(model));
    },
    save: function () {
        var u_points = this.getCopy(app.state.points);
        var u_lines = this.getCopy(app.state.lines);
        var u_points_id = Points.id;
        var u_lines_id = Lines.id;
        var u_layers_model = this.getCopy(layers.model);
        undo.model.push({ u_points: u_points, u_lines: u_lines, u_points_id: u_points_id, u_lines_id: u_lines_id, u_layers_model: u_layers_model });
        if (undo.model.length > undo.size) { undo.model.splice(0, 1); }
        //console.log("save");
    },
    load: function () {
        create.end();
        edit.end();
        if (undo.model.length < 2) { return; }
        undo.model.pop();
        var model = undo.model[undo.model.length - 1];
        app.state.points = this.getCopy(model.u_points);
        app.state.lines = this.getCopy(model.u_lines);
        Points.id = model.u_points_id;
        Lines.id = model.u_lines_id;
        layers.model = this.getCopy(model.u_layers_model);
        layers.update();
        app.redraw();
        //console.log("load");
    }
}