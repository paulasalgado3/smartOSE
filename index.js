var fs = require('fs');
var https = require('https');
//var WebSocketServer = require('ws').Server;
var express = require("express");
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')
var serverConfig = {
    key: fs.readFileSync('./server.key'),
    cert: fs.readFileSync('./server.crt'),
};

var app = express();
var HTTPS_PORT = 8080;
var NOMBRE = process.env.NOMBRE;
var httpsServer = https.createServer(serverConfig, app).listen(HTTPS_PORT);

app.use(bodyParser.json());
app.use(cookieParser());
app.set('views', __dirname + '/views')
app.set('view engine', 'jade');

//DISPOSITIVOS

 var dispositivo1 = new Object();
		dispositivo1.id = "1m2j3l4";
		dispositivo1.tipo = "outlet";
		dispositivo1.ubicacion = "comedor";
		dispositivo1.estado = 0;
		dispositivo1.editar = "";
		var dispositivo2 = new Object();
		dispositivo2.id = "4rfj3l4";
		dispositivo2.tipo = "outlet";
		dispositivo2.ubicacion = "pieza1";
		dispositivo2.estado = 1;
		dispositivo2.editar = "";
		var dispositivos = new Array();
		dispositivos.push(dispositivo1);
		dispositivos.push(dispositivo2);

var sesiones = new Array();
var usuario = "admin";
var password = "1234";
var token ;
function validarUsuario (u,p){
	if(u==usuario && p==password){
		token = Math.random().toString(36).substring(7);
		sesiones.push(token);
		//buscar la forma de borrar la sesion del array cuando expire
	}else{token="incorrecto";}
	

}
////////////////


app.get(/^(.+)$/, function(req, res){ 
    switch(req.params[0]) {
	case '/':
		res.render('login',{title:'Login' , name:NOMBRE});
		res.end();
		break;
        case '/panelDispositivos':
            res.render('panelDispositivos',{title:'Panel Dispositivos', name:NOMBRE});
		res.end();
            break;
	case '/dispositivos':
		var jdispositivos = JSON.stringify(dispositivos);
		res.send(jdispositivos);
		res.end();
	    break;
    default: res.sendFile( __dirname + req.params[0]); 
    }
 });

app.post(/^(.+)$/, function(req, res){ 
    switch(req.params[0]) {
        case '/dispositivos':
            var dispositivonuevo = new Object();
	    dispositivonuevo.id=req.body.id;
	    dispositivonuevo.tipo=req.body.tipo;
	    dispositivos.push(dispositivonuevo);
	    res.end();
            break;
	 case '/validarUsuario':
		token=null;
		validarUsuario(req.body.nombre, req.body.password);
		console.log( "login: "+ token);
                if (token!="incorrecto"){
			res.cookie('token', token, { expires: new Date(Date.now() + 900000) } );
		res.send({ message: 'correcto', accion: 'redirect', destino:'/panelDispositivos' });
		}else{
		res.send({message:'incorrecto', accion: 'redirect', destino:'/panelDispositivos'});
		}
                res.end();
                break;
	case '/validarToken':
		var token_recibido = req.body.id;
		var token_existente = false;
		for (i = 0; i < sesiones.length; i++) {
			if(sesiones[i]==token_recibido){
				token_existente = true;
			}
		}
		if(token_existente==true){
			res.send({message:'correcto', accion: 'nada'});
		}else{
			res.send({message:'incorrecto', accion: 'nada'});
		}
                res.end();
                break;

    default: res.sendFile( __dirname + req.params[0]); 
    }
 });



console.log('Servidor corriendo');
