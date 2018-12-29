var undo = {
    size: 30,
    model: [],
    save: function () {
        var u_points = getCopy(canvas.points);
        var u_lines = getCopy(canvas.lines);
        var u_points_id = points.id;
        var u_lines_id = lines.id;
        var u_layers_model = getCopy(layers.model);
        undo.model.push({ u_points: u_points, u_lines: u_lines, u_points_id: u_points_id, u_lines_id: u_lines_id, u_layers_model: u_layers_model });
        if (undo.model.length > undo.size) { undo.model.splice(0, 1); }
        //console.log("save");
    },
    load: function () {
        if (create.currentSpline) { create.currentSpline.end(); }
        edit.end();
        if (undo.model.length < 2) { return; }
        undo.model.pop();
        var model = undo.model[undo.model.length - 1];
        canvas.points = getCopy(model.u_points);
        canvas.lines = getCopy(model.u_lines);
        points.id = model.u_points_id;
        lines.id = model.u_lines_id;
        layers.model = getCopy(model.u_layers_model);
        layers.init();
        canvas.redraw();
        //console.log("load");
    }
}