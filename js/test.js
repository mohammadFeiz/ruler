var errorLog = [];
var componentsIds = [];
function alltest(){
    errorLog = [];
    test.points();
    test.lines();
    test.layers();
    componentsIds = [];
    test.components(components.items);
    if(errorLog.length !== 0 ){
        console.log(errorLog);
        alert('some things went wrong');
    }
}

var test = {
    points:function(){
        var pointIds = [];
        for(var i = 0; i < app.state.points.length; i++){
            var point = app.state.points[i];
            //check duplicate point ids
            if(pointIds.indexOf(point.id) !== -1){errorLog.push('duplicate app.state.points['+i+'].id');}
            else {pointIds.push(point.id)}
            /*------------------------point.layerId-------------------------------------*/
            // point.layerId is valid?
            if(!point.layerId){ 
                errorLog.push('app.state.points['+i+'].layerId is not valid');
            }
            // is there a layer model by id = point.layerId?
            if(layers.getObjectByID(point.layerId) === false){
                errorLog.push('a layer by id = (app.state.points['+i+'].layerId) is not exist');
            }
            /*------------------------point.connectedLines------------------------------*/
            // point.connectedLines is valid?
            if(!point.connectedLines){
                errorLog.push('app.state.points['+i+'].connectedLines is not valid');
            }
            //each point must have minimum 1 and maximum 2 connectedLines
            if(point.connectedLines.length < 1 || point.connectedLines.length > 2){
                errorLog.push('app.state.points['+i+'].connectedLines.length is not in valid range(1,2)');
            }
            for(var j = 0; j < point.connectedLines.length; j++){
                var connectedLine = point.connectedLines[j];
                var line = Lines.getObjectByID(connectedLine.id);
                var side = connectedLine.side;
                // check connected line side is valid?
                if(side !== 'start' && side !== 'end'){
                    errorLog.push('app.state.points['+i+'].connecteLines['+j+'].side is not valid');
                }
                // check connected line is exixt?     
                if(line === false){
                    errorLog.push('a line by id = (app.state.points['+i+'].connectedLines['+j+'].id) is not exist');
                }
                // check matching connected line id with point id
                if(line[side].id !== point.id){
                    errorLog.push('app.state.points['+i+'].connecteLines['+j+'] => point and connected line are not match in id');
                }
                // check matching connected line coords with point coords
                if(line[side].x !== point.x ||line[side].y !== point.y){
                    errorLog.push('app.state.points['+i+'].connecteLines['+j+'] => point and connected line are not match in coords');
                }
                // check matching connected line layerId with point layerId
                if(line.layerId !== point.layerId){
                    errorLog.push('app.state.points['+i+'].connecteLines['+j+'] => point and connected line are not match in layerId');
                }           
            }
        }
    },
    lines:function(){
        var lineIds = [];
        for(var i = 0; i < app.state.lines.length; i++){
            var line = app.state.lines[i];
            //check duplicate line ids
            if(lineIds.indexOf(line.id) !== -1){errorLog.push('duplicate app.state.lines['+i+'].id');}
            else {lineIds.push(line.id)}
            /*------------------------line.layerId-------------------------------------*/
            // line.layerId is valid?
            if(!line.layerId){ 
                errorLog.push('app.state.lines['+i+'].layerId is not valid');
            }
            // is there a layer model by id = line.layerId?
            if(layers.getObjectByID(line.layerId) === false){
                errorLog.push('a layer by id = (app.state.lines['+i+'].layerId) is not exist');
            }
            /*------------------------line.start------------------------------*/
            var startPoint = Points.getObjectByID(line.start.id);
            // check line.start.id is an exist point?     
            if(startPoint === false){
                errorLog.push('a point by id = (app.state.lines['+i+'].start.id) is not exist');
            }
            // check matching startPoint layerId with line layerId
            if(line.layerId !== startPoint.layerId){
                errorLog.push('app.state.lines['+i+'].start => start point and line are not match in layerId');
            }
            // check matching startPoint layerId with line layerId
            if(line.start.x !== startPoint.x || line.start.y !== startPoint.y){
                errorLog.push('app.state.lines['+i+'].start => start point and line are not match in coords');
            }
            /*------------------------line.end------------------------------*/
            var endPoint = Points.getObjectByID(line.end.id);
            // check line.end.id is an exist point?     
            if(endPoint === false){
                errorLog.push('a point by id = (app.state.lines['+i+'].end.id) is not exist');
            }
            // check matching endPoint layerId with line layerId
            if(line.layerId !== endPoint.layerId){
                errorLog.push('app.state.lines['+i+'].end => end point and line are not match in layerId');
            }
            // check matching endPoint layerId with line layerId
            if(line.end.x !== endPoint.x || line.end.y !== endPoint.y){
                errorLog.push('app.state.lines['+i+'].end => end point and line are not match in coords');
            }
        }
    },
    layers:function(){
        var activeLayers = [];
        var layerIds = [];
        for(var i = 0; i < layers.model.length; i++){
            var layer = layers.model[i];
            //check duplicate layers ids
            if(layerIds.indexOf(layer.id) !== -1){errorLog.push('duplicate layers.model['+i+'].id');}
            else {layerIds.push(layer.id)}
            if(layer.active){activeLayers.push(layer);}
            if(!layer.title || typeof layer.title !== 'string'){errorLog.push('layers.model['+i+'].title is not valid');}
            if(!layer.show || typeof layer.show !== 'boolean'){errorLog.push('layers.model['+i+'].show is not valid');}
        }
        // only one layer must be active
        if(activeLayers.length !== 1){errorLog.push('layers.model must have only one memebr by active:true');}
        // minimum count of layers must be 1
        if(layerIds.length === 0){errorLog.push('layers.model.length is 0');}
    },
    components:function(items){
        for(var i = 0; i <items.length; i++ ){
            var item = items[i];
            var id = typeof item.id === 'function'?item.id():item.id;
            if(id){
                //check duplicate components ids
                if( componentsIds.indexOf(id) !== -1){errorLog.push('duplicate components id =' + id);}
                else {componentsIds.push(id)}    
                //check DOM duplicate
                if($('#'+id).length > 1){
                    errorLog.push('more than 1 DOM for id =' + id);
                }
            }
            else{
                if(item.callback){
                    errorLog.push(JSON.stringify(item) + ':found component item with callback and without id');
                }
            }
            if(item.html){
                test.components(item.html);
            }
        }
    }
};