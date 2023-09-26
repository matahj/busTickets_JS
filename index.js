//const mongoose = require('mongoose');
const { connect, Schema, model } = require("mongoose");

//mongodb+srv://<usuario>:<password>@cluster0....mongodb.net/<baseDeDatos>?...
connect('mongodb://127.0.0.1:27017/bus_tickets_db')
    .then(() => console.log('Conexión exitosa a la BD'))
    .catch((error) => {
        console.error('Error de conexión a la BD: ', error);
        process.exit(1);
    });

//ESQUEMAS Y MODELOS
const TerminalesSchema = new Schema(
    {
        id_terminal: { type: Number, unique: true, required: true, min: 1 },
        estado: { type: String, required: true, maxLength: 50 },
        direccion: { type: String, require: true, maxLength: 50, default: "Conocida" },
    },
    { timestamps: true } //Fecha de creación, ultima modificación
);

const AutobusesSchema = new Schema(
    {
        id_autobus: { type: Number, required: true, unique: true, min: 1 },
        numero_asientos: { type: Number, require: true, min: 1, max: 40 },
        clase: { type: String, required: true, maxLength: 50 },
        //terminal: { type: Schema.Types.ObjectId, ref: 'Terminales', required: true },
        terminal: { type: Number, ref: 'Terminales', required: true },
    },
    { timestamps: true } //Fecha de creación, ultima modificación
);


//MODELOS
const TerminalesModel = model('Terminales', TerminalesSchema);
const AutobusesModel = model('Autobuses', AutobusesSchema);


//API
const express = require('express');
const app = express();

app.use(express.json());

app.post('/terminales', async function (request, response) {
    try {
        const instancia = new TerminalesModel(request.body);
        const documento = await instancia.save();
        response.status(201).json(documento);
    } catch (e) {
        console.error(e);
        response.status(500).json({ error: "Error al crear terminal" });
    }
});

app.get('/terminales', async function (request, response) {
    try {
        const documentos = await TerminalesModel.find().exec();
        response.status(200).json(documentos);
    } catch (e) {
        console.log(e);
        response.status(500).json({ error: 'Error al obtener terminales' });
    }
});

app.get('/terminales/:id', async function (request, response) {
    try {
        const { id } = request.params;
        //const documento = await TerminalesModel.findById(id).exec();
        const documento = await TerminalesModel.findOne({ 'id_terminal': id }).exec();
        response.status(200).json(documento);
    } catch (e) {
        console.log(e);
        response.status(500).json({ error: 'Error al obtener terminal por id' });
    }
});

app.delete('/terminales/:id', async function (request, response) {
    try {
        const documento = await TerminalesModel.findOneAndDelete({ 'id_terminal': request.params.id }).exec();
        //console.log(documento);
        response.status(200).json(documento);
    } catch (e) {
        console.log(e);
        response.status(500).json({ error: 'Error al borrar terminal por id' });
    }
})

app.post('/autobuses', async function (request, response) {
    try {
        //Integridad referencial
        const { terminal } = request.body;
        //const docTerminal = await TerminalesModel.findById(terminal).exec();
        const docTerminal = await TerminalesModel.findOne({ 'id_terminal': terminal }).exec();
        if (!docTerminal) {
            response.status(404).json({ error: "La terminal no existe" });
            return;
        }
        /////////////////
        const instancia = new AutobusesModel(request.body);
        const documento = await instancia.save();
        response.status(200).json(documento);
    } catch (e) {
        console.error(e);
        response.status(500).json({ error: "Error al crear autobus" });
    }
});

app.get('/autobuses/:id', async function (request, response) {
    try {
        const { id } = request.params;
        //const documento =  await AutobusesModel.findById(id).populate('terminal').exec();
        const documento = await AutobusesModel.findOne({ 'id_autobus': id }).exec();
        const docTerminal = await TerminalesModel.findOne({ 'id_terminal': documento.terminal }, { id_terminal: 1, estado: 1, direccion: 1 }).exec();
        documento.terminal = docTerminal;
        response.status(200).json(documento);
    } catch (e) {
        console.log(e);
        response.status(500).json({ error: 'Error al obtener autobus por id' });
    }
});


app.listen(8080, function () {
    console.log('Servidor en el puerto 8080');
});
