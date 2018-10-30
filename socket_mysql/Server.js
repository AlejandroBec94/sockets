//Librerías necesarias
var app     =     require("express")();
var mysql   =     require("mysql");
var http    =     require('http').Server(app);
var io      =     require("socket.io")(http);

// Conectando a mysql
var conexion    =    mysql.createPool({
    connectionLimit   :   100,
    host              :   'localhost',
    user              :   'root',
    password          :   'root',
    database          :   'chat',
    debug             :   false
});

app.get("/",function(req, res){
    res.sendFile(__dirname + '/index.html'); //Ruta para lanzar el index
});

io.on('connection',function(socket){
    socket.on('nuevo',function(status){
        addComentario(status,function(res){
            if(res){
                io.emit('refrescar',status);
            } else {
                io.emit('error');
            }
        });
    });
});

var addComentario = function (status,callback) {
    conexion.getConnection(function(err,connection){
        if (err) {
            connection.release();
            callback(false);
            return;
        }
        connection.query("INSERT INTO `mensajes` (`mensaje`) VALUES ('"+status+"')", function(err,rows){ //Insertando nuestro comentario
            connection.release();
            if(!err) {
                callback(true);
            }
        });
        connection.on('error', function(err) {
            callback(false);
            return;
        });
    });
}

http.listen(5000,function(){ // Puesta en marcha del servidor en el puerto 5000
    console.log("Listening on 5000");
});