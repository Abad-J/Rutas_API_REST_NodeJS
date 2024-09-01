// Importa la función de conexión desde el archivo conexion.js
const { conexion } = require("./baseDatos/conexion.js");
// Framework web para Node.js
const express = require("express");
// Importa el módulo cors, que es un middleware para habilitar CORS (Cross-Origin Resource Sharing)
const cors = require("cors");
// Importa el módulo mongoose para interactuar con MongoDB
const mongoose = require('mongoose');

// Inicializar la APP de Node.js MENSAJE
console.log("App de node arrancada");

// Define el esquema del artículo
const articleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true }
});

// Crea el modelo a partir del esquema
const Article = mongoose.model('Article', articleSchema);

// Inicializa la BD llamando la función conexion
conexion().then(() => {
    console.log("Base de datos conectada");
}).catch(error => {
    console.error("Error al conectar con la base de datos:", error);
});

// Crea una instancia de la aplicación de Express
const app = express();
// Se define el puerto donde se escuchará
const puerto = 3900;

// Configurar los cors para recibir solicitudes de otros dominios (mecanismo de seguridad)
app.use(cors());

// Convertir body a object.js y urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Crear y poner en marcha el servidor en el puerto especificado
app.listen(puerto, () => {
    console.log("Servidor web corriendo desde el puerto " + puerto);
});

// Ruta de prueba para el sitio web
app.get("/probando", (req, res) => {
    console.log("Se ha ejecutado mi endpoint probando");
    return res.status(200).send(`
        <div>
            <h1>Probando nuestra ruta de NodeJS</h1>
            <p>Creando API rest con NodeJS</p>
        </div>
    `);
});

//RUTAS
/*
http://localhost:3900/insertar
http://localhost:3900/consulta
http://localhost:3900/modificar
http://localhost:3900/eliminar
*/




// Ruta para mostrar la página con el botón
app.get('/consulta', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Consulta de Artículos</title>
            </head>
            <body>
                <h1>Consulta de Artículos</h1>
                <!-- Formulario con un botón para realizar la consulta -->
                <form action="/consultar-articulos" method="GET">
                    <button type="submit">Mostrar Artículos</button>
                </form>
            </body>
        </html>
    `);
});
// Ruta para mostrar el formulario de inserción de artículos
app.get('/insertar', (req, res) => {
    console.log("Se ha ejecutado mi endpoint insertar");
    return res.status(200).send(`
        <div>
            <h1>Insertar Nuevo Artículo</h1>
            <form action="/articulos" method="POST">
                <label for="title">Título:</label>
                <input type="text" id="title" name="title" required />
                <br />
                <label for="content">Contenido:</label>
                <textarea id="content" name="content" required></textarea>
                <br />
                <button type="submit">Enviar</button>
            </form>
        </div>
    `);
});
// Ruta para mostrar el formulario de modificación de un artículo
app.get('/modificar', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Modificar Artículo</title>
            </head>
            <body>
                <h1>Modificar Artículo</h1>
                <form action="/modificar-articulo" method="POST">
                    <label for="id">ID del Artículo:</label>
                    <input type="text" id="id" name="id" required />
                    <br />
                    <label for="title">Nuevo Título:</label>
                    <input type="text" id="title" name="title" required />
                    <br />
                    <label for="content">Nuevo Contenido:</label>
                    <textarea id="content" name="content" required></textarea>
                    <br />
                    <button type="submit">Modificar Artículo</button>
                </form>
            </body>
        </html>
    `);
});

// Ruta para mostrar el formulario para eliminar un artículo
app.get('/eliminar', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Eliminar Artículo</title>
            </head>
            <body>
                <h1>Eliminar Artículo</h1>
                <!-- Formulario con un campo de entrada para el ID del artículo a eliminar -->
                <form action="/eliminar-articulo" method="POST">
                    <label for="id">ID del Artículo:</label>
                    <input type="text" id="id" name="id" required />
                    <button type="submit">Eliminar Artículo</button>
                </form>
            </body>
        </html>
    `);
});

// Ruta para manejar la consulta y mostrar los artículos
app.get('/consultar-articulos', async (req, res) => {
    try {
        // Consultar todos los artículos en la base de datos
        const articulos = await Article.find();

        // Crear una cadena HTML para mostrar los artículos
        let html = '<html><head><title>Artículos</title></head><body>';
        html += '<h1>Lista de Artículos</h1>';

        articulos.forEach(article => {
            html += `
                <div class="article">
                    <h3>ID: ${article._id}</h3>
                    <h2>Titulo: ${article.title}</h2>
                    <p>Contenido: ${article.content}</p>
                </div>
            `;
        });

        html += '<br/><a href="/mostrar-articulos">Volver</a>';
        html += '</body></html>';

        // Enviar el HTML con los artículos al navegador
        res.send(html);
    } catch (error) {
        console.error('Error al consultar los artículos:', error);
        res.status(500).send('Error al consultar los artículos');
    }
});


// Ruta para insertar un nuevo artículo
app.post('/articulos', async (req, res) => {
    try {
        console.log("Datos recibidos:", req.body); // Agrega esta línea para depurar

        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: 'Título y contenido son requeridos' });
        }

        // Crear una nueva instancia del modelo Article
        const newArticle = new Article({ title, content });

        // Guardar el nuevo artículo en la base de datos
        await newArticle.save();

        return res.status(201).json({
            message: 'Artículo creado exitosamente',
            article: newArticle
        });
    } catch (error) {
        console.error('Error al insertar el artículo:', error);
        return res.status(500).json({ message: 'Error al insertar el artículo' });
    }
});



// Ruta para manejar la modificación de un artículo
app.post('/modificar-articulo', async (req, res) => {
    try {
        const { id, title, content } = req.body;

        // Verifica que se haya proporcionado un ID, título y contenido
        if (!id || !title || !content) {
            return res.status(400).send('ID, título y contenido son requeridos.');
        }

        // Busca el artículo por ID y lo actualiza
        const article = await Article.findByIdAndUpdate(id, { title, content }, { new: true });

        if (!article) {
            return res.status(404).send('Artículo no encontrado.');
        }
        const articuloModificado = await Article.findByIdAndUpdate(id, { title, content }, { new: true });

        console.log('Artículo después de la modificación:', articuloModificado);

        res.send(`
            <html>
                <head>
                    <title>Artículo Modificado</title>
                </head>
                <body>
                    <h1>Artículo Modificado Exitosamente</h1>
                    <div class="article">
                        <h2>${article.title}</h2>
                        <p>${article.content}</p>
                    </div>
                    <br/><a href="/modificar">Volver a Modificar Otro Artículo</a>
                </body>
            </html>
        `);
    } catch (error) {
        console.error('Error al modificar el artículo:', error);
        res.status(500).send('Error al modificar el artículo');
    }
});


// Ruta para manejar la eliminación del artículo
app.post('/eliminar-articulo', async (req, res) => {
    try {
        const { id } = req.body; // Obtener el ID del cuerpo de la solicitud

        // Verificar si se proporcionó un ID
        if (!id) {
            return res.status(400).send('ID del artículo es requerido');
        }

        // Buscar el artículo antes de eliminar para mostrarlo en la consola
        const articuloAntesDeEliminar = await Article.findById(id);

        if (!articuloAntesDeEliminar) {
            return res.status(404).send(`
                <html>
                    <head>
                        <title>Error</title>
                    </head>
                    <body>
                        <h1>Error</h1>
                        <p>No se encontró ningún artículo con ID: ${id}.</p>
                        <a href="/eliminar">Intentar de nuevo</a>
                    </body>
                </html>
            `);
        }

        console.log('Artículo antes de eliminar:', articuloAntesDeEliminar);

        // Intentar eliminar el artículo de la base de datos
        const resultado = await Article.findByIdAndDelete(id);

        // Verificar si el artículo fue encontrado y eliminado
        if (resultado) {
            console.log(`Artículo con ID: ${id} eliminado exitosamente.`);

            res.send(`
                <html>
                    <head>
                        <title>Artículo Eliminado</title>
                    </head>
                    <body>
                        <h1>Artículo eliminado exitosamente</h1>
                        <p>El artículo con ID: ${id} ha sido eliminado.</p>
                        <a href="/eliminar">Eliminar otro artículo</a>
                    </body>
                </html>
            `);
        } else {
            res.status(404).send(`
                <html>
                    <head>
                        <title>Error</title>
                    </head>
                    <body>
                        <h1>Error</h1>
                        <p>No se encontró ningún artículo con ID: ${id}.</p>
                        <a href="/eliminar">Intentar de nuevo</a>
                    </body>
                </html>
            `);
        }
    } catch (error) {
        console.error('Error al eliminar el artículo:', error);
        res.status(500).send('Error al eliminar el artículo');
    }
});