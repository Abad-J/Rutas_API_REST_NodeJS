//Importa el modulo mongoose, biblioteca de Node.js para trabajar con mongoDB
const mongose = require("mongoose");

//Define una funcion asincrona para conectar la base de datos
const conexion = async() => {
    try{
        //intenta establcer la conexion con mongoDB utilizando la URL de conexion
        //se conecta a mi_blog
     await mongose.connect("mongodb://localhost:27017/mi_blog")
    }catch(error){
        //se imprime un error en consola
        console.log(error);
        //luego lanza un nuevo error con un mensaje
        throw new Error("No se ha podido conectar a la BD 🥲")
    }
}

module.exports = {
	conexion
}