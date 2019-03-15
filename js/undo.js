var undo = {
    size: 30,
    model: [],
    getCopy:function (model) {
        return JSON.parse(JSON.stringify(model));
    },
    getLast:function(){return undo.model[undo.model.length - 1]},
    save: function () {
        var u_points = this.getCopy(app.state.points);
        var u_lines = this.getCopy(app.state.lines);
        var u_points_id = Points.id;
        var u_lines_id = Lines.id;
        var u_layers_model = this.getCopy(layers.model);
        undo.model.push({ 
            u_points: u_points, u_lines: u_lines, 
            u_points_id: u_points_id, u_lines_id: u_lines_id, 
            u_layers_model: u_layers_model 
        });
        if (undo.model.length > undo.size) { undo.model.splice(0, 1); }
        console.log("save");
    },

    load: function () {
        if(create.drawing){create['create-control-remove'](); return;}
        edit.end();
        if (undo.model.length < 2) { return false; }
        undo.model.pop();
        var model = undo.model[undo.model.length - 1];
        app.state.points = this.getCopy(model.u_points);
        app.state.lines = this.getCopy(model.u_lines);
        Points.id = model.u_points_id;
        Lines.id = model.u_lines_id;
        Points.deselectAll();
        Lines.deselectAll();
        layers.model = this.getCopy(model.u_layers_model);
        app.redraw();
        return true;
        //console.log("load");
    }
}