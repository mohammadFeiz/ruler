var Snap = {
    open: function (obj) {
        var A = new Alert({
            template: [
                {
                    type: "slider",
                    start: 0, step: 10, end: 100, min: 1,
                    title: "Snap Size",
                    value: canvas.getSnap(),
                    onchange: canvas.setSnap
                }
            ],
            buttons: [{ title: "ok" }],
            title: "Set Snap.",
        });
    },
}