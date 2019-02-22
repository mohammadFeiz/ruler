var rulerFiling = {
    createFile:function() {
        var type = window.TEMPORARY;
        var size = 5*1024*1024;
        window.requestFileSystem(type, size, successCallback, errorCallback)
        function successCallback(fs) {
           fs.root.getFile('log.txt', {create: true, exclusive: true}, function(fileEntry) {
              alert('File creation successfull!')
           }, errorCallback);
        }
        function errorCallback(error) {
           alert("ERROR: " + error.code)
        }
     },
     writeFile:function() {
        var type = window.TEMPORARY;
        var size = 5*1024*1024;
        window.requestFileSystem(type, size, successCallback, errorCallback)
        function successCallback(fs) {
           fs.root.getFile('log.txt', {create: true}, function(fileEntry) {
              fileEntry.createWriter(function(fileWriter) {
                 fileWriter.onwriteend = function(e) {
                    alert('Write completed.');
                 };
                 fileWriter.onerror = function(e) {
                    alert('Write failed: ' + e.toString());
                 };
                 var blob = new Blob(['Lorem Ipsum'], {type: 'text/plain'});
                 fileWriter.write(blob);
              }, errorCallback);
           }, errorCallback);
        }
        function errorCallback(error) {
           alert("ERROR: " + error.code)
        }
     },
     readFile:function () {
        var type = window.TEMPORARY;
        var size = 5*1024*1024;
        window.requestFileSystem(type, size, successCallback, errorCallback)
     
        function successCallback(fs) {
           fs.root.getFile('log.txt', {}, function(fileEntry) {
     
              fileEntry.file(function(file) {
                 var reader = new FileReader();
     
                 reader.onloadend = function(e) {
                    var txtArea = document.getElementById('textarea');
                    txtArea.value = this.result;
                 };
                 reader.readAsText(file);
              }, errorCallback);
           }, errorCallback);
        }
     
        function errorCallback(error) {
           alert("ERROR: " + error.code)
        }
     },
     removeFile:function () {
        var type = window.TEMPORARY;
        var size = 5*1024*1024;
        window.requestFileSystem(type, size, successCallback, errorCallback)
     
        function successCallback(fs) {
           fs.root.getFile('log.txt', {create: false}, function(fileEntry) {
     
              fileEntry.remove(function() {
                 alert('File removed.');
              }, errorCallback);
           }, errorCallback);
        }
     
        function errorCallback(error) {
           alert("ERROR: " + error.code)
        }
     }
}


 

 	

 	