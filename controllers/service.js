const Servicio = require("../models/Servicios");
const dbConnection = require("../connect");
const connect = require("../connect");
const connection = dbConnection();
const middleware = require("../middleware/auth");

function validateUser(middleware){
    /* La idea en esta función es que me devuelva el
    us_id si el usuario está logeado, de lo contrario
    que me devuelva null, luego ese us_id se usará para 
    todo lo demás */
}


serviceOperation = function(req,us_id,res) {

    const command = req.body.command;
    switch(command){
        case "CREATE_SERVICE":
            if(us_id == null){
                return res.status(200).send({
                    status: "ERROR",
                    message: "Servicios.js/serviceOperation() - CREATE_SERVICE: Usuario no loggeado",                    
                })
            } else {
                validationCreateService(req,us_id,res);
            }
            break;

        case "SEARCH_SERVICE":
            searchCategory(req,res);
            break;

        case "EDIT_SERVICE":
            if(us_id == null){
                return res.status(200).send({
                    status: "ERROR",
                    message: "Servicios.js/serviceOperation() - EDIT_SERVICE: Usuario no loggeado",                    
                })
            } else {
                editService(req,us_id,res);
            }
            break;

        case "DELETE_SERVICE":
            if(us_id == null){
                return res.status(200).send({
                    status: "ERROR",
                    message: "Servicios.js/serviceOperation() - DELETE_SERVICE: Usuario no loggeado",                    
                })
            } else {
                deleteService(req,us_id,res);
            }
            break;

        case "GET_HOME_SERVICES":
            //Los primeros 10 para el home
            getHomeServices(res);
            break;

        case "GET_MY_SERVICES":
            if(us_id == null){
                return res.status(200).send({
                    status: "ERROR",
                    message: "Servicios.js/serviceOperation() - GET_MY_SERVICES: Usuario no loggeado",                    
                })
            } else {
                getMyServices(us_id,res);
            }
            break;

        default:
            return res.status(500).send({
                status: "ERROR",
                message: "No se ha encontrado la operación",
            })
    }
}

function validationCreateService(req,us_id,res) {
    /*Se creará el servicio solo si no existe una combinación (us_id, cat_id) 
    Además si es que ya ha existido antes y esa combinación, se colocará la nueva
    descripción e imagen, pero el resto de datos se mantendrá. Esto es para evitar
    que cuando se tenga una baja calificación en un servicio se borre y vuelva a crear uno
    sin bajas calificaciones.
    */

    const user = us_id 
    const service = req.body.transaction;
    const newServicio = Servicio(user, service);

    servicioExiste = serviceExists(newServicio.us_id,cat_id);

    switch(servicioExiste){
        case -2:
            recoverService(newServicio,res);
            break;

        case -1:
            return res.status(200).send({
                status: "ERROR",
                message: "Servicios.js/serviceExists(): Error en consulta",
            });

        case 0:
            createService(newServicio,res);
            break;

        case 1:
            return res.status(200).send({
                status: "ERROR",
                message: "Servicios.js/serviceExist(): Existe servicio de usuario" + newServicio.us_id + " de categoria" + cat_id + " pero fue eliminado",
            });
            
    }

}

function serviceExists(us_id,cat_id){

    sql_existe = "SELECT * FROM Servicios WHERE us_id = ? AND cat_id = ? ;", [us_id,cat_id];

    connection.connect();
    connection.query(sql_existe, (err, result) =>{

        if (err) {
            console.log("Servicios.js/serviceExists(): Error en consulta");
            return -1;     
            
        } else if(result.length == 0){
            console.log("Servicios.js/serviceExists(): No existe servicio de usuario", us_id, " de categoria", cat_id);
            return 0;
            
        } else {

            if(result[0].ser_eliminado == 0) {
                console.log("Servicios.js/serviceExist(): Existe servicio de usuario", us_id, " de categoria", cat_id);
                return 1;
            }
            else{
                console.log("Servicios.js/serviceExist(): Existe servicio de usuario", us_id, " de categoria", cat_id, " pero fue eliminado");
                return -2;
            }

        }
    });

}

function recoverService(newServicio,res){
    sql_recuperar = "UPDATE Servicio SET " +
    "ser_descripcion = ?, ser_imagen = ?, ser_eliminado = 0 ;", [newServicio.ser_descripcion, newServicio.ser_imagen];

    connection.connect();
    connection.query(sql_recuperar, (err, result) =>{

        if (err) {
            return res.status(200).send({
                status: "FAILED",
                message: err,
            });
        } else {
            return res.status(200).send({
                status: "SUCCESS",
                message: "Servicio recuperado correctamente",
            });
        }
    });

}

function createService(newServicio,res){
    sql_insertar = "INSERT INTO Servicio " +
    "(us_id, cat_id, ser_descripcion, ser_imagen)" 
    + " VALUES (?,?,?,?) ;", [newServicio.us_id, newServicio.cat_id, newServicio.ser_descripcion, newServicio.ser_imagen];

    connection.connect();
    connection.query(sql_insertar, (err, result) =>{

        if (err) {
            return res.status(200).send({
                status: "FAILED",
                message: err,
            });
        } else {
            return res.status(200).send({
                status: "SUCCESS",
                message: "Servicio registrado correctamente",
            });
        }
    });
}


/* ///////////////////////////////////////////////////////////////////// */


function searchCategory(req, res) {
    /*Se harían 2 búsquedas:
    1) Buscar el cat_id según la cadena de texto
    2) Buscar los servicios que tienen ese cat_id*/
    const CatName = req.body.transaction;
    connection.connect()
    sql_buscarCat = "SELECT * FROM Categoria WHERE cat_nombre LIKE %?% ;", [CatName];

    connection.query(sql_buscarCat, (err, result) => {
        if (err) {
            return res.status(200).send({
                status: "FAILED",
                message: err,
            });
        } else if (result == null ) {
            return res.status(200).send({
                status: "SUCCESS",
                message: "No hay servicios encontrados",
            });
        } else {
            serviciosEncontrados = searchService(result[0].cat_id);
            return res.send(JSON.stringify(serviciosEncontrados))
        }
    });

}

function searchService(cat_id){
    connection.connect()
    sql_buscarSer = "SELECT * FROM Servicio WHERE cat_id = ? ;", [cat_id];

    connection.query(sql_buscarSer, (err, result) => {
        if (err) {
            return res.status(200).send({
                status: "FAILED",
                message: err,
            });
        } else {
            return result;
        }
    });
}


/* ///////////////////////////////////////////////////////////////////// */


function editService(req,us_id,res){

    const user = us_id
    const service = req.body.transaction;

    sql_editar = "UPDATE SERVICIO SET " +
    "ser_descripcion = ?, ser_imagen = ? WHERE us_id = ? AND cat_id = ? ;", [service.ser_descripcion, service.ser_imagen,us_id,service.cat_id];

    connection.connect();
    connection.query(sql_editar, (err, result) =>{

        if (err) {
            return res.status(200).send({
                status: "FAILED",
                message: err,
            });
        } else {
            return res.status(200).send({
                status: "SUCCESS",
                message: "Servicio editado correctamente",
            });
        }
    });
    
}


/* ///////////////////////////////////////////////////////////////////// */


function deleteService(req,us_id,res){

    cat_id = req.body.transaction.cat_id; //REVISAR
    sql_eliminar = "UPDATE SERVICIO SET ser_eliminado = 1 WHERE us_id = ? AND cat_id = ?",[us_id,cat_id]

    connection.connect();
    connection.query(sql_eliminar,(err, result) =>{
        if (err) {
            return res.status(200).send({
                status: "FAILED",
                message: err,
            });
        } else {
            return res.status(200).send({
                status: "SUCCESS",
                message: "Servicio eliminado correctamente",
            });
        }        
    });
}


/* ///////////////////////////////////////////////////////////////////// */


function getHomeServices(res){

    sql_getHomeServices = "SELECT * FROM Services LIMIT 10;"

    connection.connect();
    connection.query(sql_getHomeServices,(err, result) =>{
        if (err) {
            return res.status(200).send({
                status: "FAILED",
                message: err,
            });
        } else {
            return res.status(200).send(JSON.stringify(result));
        }        
    });
}


/* ///////////////////////////////////////////////////////////////////// */


function getMyServices(us_id,res){

    sql_getMyServices = "SELECT * FROM Services WHERE us_id = ? ;",[us_id]

    connection.connect();
    connection.query(sql_getMyServices, (err,result) => {
        if (err) {
            return res.status(200).send({
                status: "FAILED",
                message: err,
            });
        } else {
            return res.status(200).send(JSON.stringify(result));
        }         
    });

}


module.exports = serviceOperation;
