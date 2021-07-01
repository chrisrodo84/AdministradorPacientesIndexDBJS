//Variables
const mascotaInput = document.querySelector('#mascota');
const propietarioInput = document.querySelector('#propietario');
const telefonoInput = document.querySelector('#telefono');
const fechaInput = document.querySelector('#fecha');
const horaInput = document.querySelector('#hora');
const sintomasInput = document.querySelector('#sintomas');
const formulario = document.querySelector('#nueva-cita');
const contenedorCitas = document.querySelector('#citas');

let editando;
let DB;

window.onload = () => {
    eventListeners();

    crearDB();
}

//Listener

function eventListeners() {
    mascotaInput.addEventListener('input', datosCita);
    propietarioInput.addEventListener('input', datosCita);
    fechaInput.addEventListener('input', datosCita);
    telefonoInput.addEventListener('input', datosCita);
    horaInput.addEventListener('input', datosCita);
    sintomasInput.addEventListener('input', datosCita);

    formulario.addEventListener('submit', nuevaCita);
}

//Clases
class Citas {
    constructor() {
        this.citas = [];
    }

    agregarCita(cita) {
        this.citas = [...this.citas, cita];
    }

    eliminarCita(id) {
        this.citas = this.citas.filter(cita => cita.id !== id);
    }

    editarCita(citaActualizada) {
        this.citas = this.citas.map(cita => cita.id === citaActualizada.id ? citaActualizada : cita);
    }
}

class UI {
    imprimirAlerta(mensaje, tipo) {
        //Se crea div para mostrar alerta
        const divMensaje = document.createElement('div');
        divMensaje.classList.add('text-center', 'alert', 'd-block', 'col-12');
        //Se clasifica el tipo de alerta
        if (tipo === 'error') {
            divMensaje.classList.add('alert-danger');
        } else {
            divMensaje.classList.add('alert-success');
        }
        //Se añade el mensaje para mostrar
        divMensaje.textContent = mensaje;
        //Se agrega el mensaje al HTML
        document.querySelector('#contenido').insertBefore(divMensaje, document.querySelector('.agregar-cita'));

        setTimeout(() => {
            divMensaje.remove();
        }, 3000);
    }

    imprimirCitas() {
        this.limpiarHTML();

        //Leer contenido de la BD
        const objectStore = DB.transaction('citas').objectStore('citas');

        objectStore.openCursor().onsuccess = function(e) {
            const cursor = e.target.result;

            if (cursor) {
                const {mascota, propietario, telefono, fecha, hora, sintomas, id} = cursor.value;
                const divCita = document.createElement('div');
                divCita.classList.add('cita', 'p-3');
                divCita.dataset.id = id;

                //Scripting de los elementos de la cita
                const mascotaParrafo = document.createElement('h2');
                mascotaParrafo.classList.add('card-title', 'font-weight-bolder');
                mascotaParrafo.textContent = mascota;

                const propietarioParrafo = document.createElement('p');
                propietarioParrafo.innerHTML = `<span class="font-weight-bolder">Propietario: </span> ${propietario}`;

                const telefonoParrafo = document.createElement('p');
                telefonoParrafo.innerHTML = `<span class="font-weight-bolder">Telefono: </span> ${telefono}`;

                const fechaParrafo = document.createElement('p');
                fechaParrafo.innerHTML = `<span class="font-weight-bolder">Fecha: </span> ${fecha}`;

                const horaParrafo = document.createElement('p');
                horaParrafo.innerHTML = `<span class="font-weight-bolder">Hora: </span> ${hora}`;

                const sintomasParrafo = document.createElement('p');
                sintomasParrafo.innerHTML = `<span class="font-weight-bolder">Síntomas: </span> ${sintomas}`;

                //Botón para eliminar cita
                const btnEliminar = document.createElement('button');
                btnEliminar.classList.add('btn', 'btn-danger', 'mr-2');
                btnEliminar.innerHTML = `Eliminar <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>`;
                btnEliminar.onclick = () => eliminarCita(id);

                //Botón para editar cita
                const btnEditar = document.createElement('button');
                btnEditar.classList.add('btn', 'btn-info', 'mr-2')
                btnEditar.innerHTML = `Editar <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>`;
                const cita = cursor.value;
                btnEditar.onclick = () => cargarEdicion(cita);

                //Agregar los parrafos al divCita
                divCita.appendChild(mascotaParrafo);
                divCita.appendChild(propietarioParrafo);
                divCita.appendChild(telefonoParrafo);
                divCita.appendChild(fechaParrafo);
                divCita.appendChild(horaParrafo);
                divCita.appendChild(sintomasParrafo);
                divCita.appendChild(btnEliminar);
                divCita.appendChild(btnEditar);

                //Agregar las citas al HTML
                contenedorCitas.appendChild(divCita);

                //Ir al siguiente elemento
                cursor.continue();
            }
        }
    }

    limpiarHTML() {
        while(contenedorCitas.firstChild) {
            contenedorCitas.removeChild(contenedorCitas.firstChild);
        }
    }
}

const ui = new UI();
const administrarCitas = new Citas();

//Objeto con información
const citaObj = {
    mascota: '',
    propietario: '',
    telefono: '',
    fecha: '',
    hora: '',
    sintomas: ''
}

//Agregar datos al objeto
function datosCita(e) {
    citaObj[e.target.name] = e.target.value;
}

function nuevaCita(e) {
    e.preventDefault();

    //Se extrae la información del objeto
    const {mascota, propietario, telefono, fecha, hora, sintomas} = citaObj;

    if (mascota === '' || propietario === '' || telefono === '' || fecha === '' || hora === '' || sintomas === '') {
        ui.imprimirAlerta('Todos los campos son obligatorios', 'error');
        return;
    }
    if (editando) {
        //Pasar el objeto de la cita a edición
        administrarCitas.editarCita({...citaObj});
        //Se edita el registroe n la BD
        const transaction = DB.transaction(['citas'], 'readwrite');
        const objectStore = transaction.objectStore('citas');
        objectStore.put(citaObj);
        transaction.oncomplete = () => {
            ui.imprimirAlerta('La cita se modificó correctamente', 'correcto');
            //Se regresa el texto del botón
            formulario.querySelector('button[type="submit"]').textContent = 'Crear cita';
            //Se quita el modo edición
            editando = false;
        }

        transaction.onerror = () => {
            console.log("Hubo un error");
        }
    } else {
        //Se le genera un id al objeto
        citaObj.id = Date.now();
        //Se crea la cita
        administrarCitas.agregarCita({...citaObj});
        //Insertar en la BD
        const transaction = DB.transaction(['citas'], 'readwrite');
        const objectStore = transaction.objectStore('citas');
        objectStore.add(citaObj);
        transaction.oncomplete = () => {
            //Mostrar mensaje de agregado
            ui.imprimirAlerta('La cita se agregó correctamente', 'correcto');
        }

    }
    
    //Se reinicia el formulario y el objeto
    reiniciarObjeto();
    formulario.reset();
    //Se muestra la cita en el HTML
    ui.imprimirCitas();
}

function reiniciarObjeto() {
    citaObj.mascota = '';
    citaObj.propietario = '';
    citaObj.telefono = '';
    citaObj.fecha = '';
    citaObj.hora = '';
    citaObj.sintomas = '';
}

function eliminarCita(id) {
    const transaction = DB.transaction(['citas'], 'readwrite');
    const objectStore = transaction.objectStore('citas');
    objectStore.delete(id);

    transaction.oncomplete = () => {
        ui.imprimirAlerta('La cita se eliminó correctamente', 'correcto');
        //Refrescar citas
        ui.imprimirCitas();
    }

    transaction.onerror = () => {
        ui.imprimirAlerta('Hubo un error al eliminar la cita', 'error');
    }   
}

function cargarEdicion(cita) {
    const {mascota, propietario, telefono, fecha, hora, sintomas, id} = cita;
    //Llenar los inputs con los datos
    mascotaInput.value = mascota;
    propietarioInput.value = propietario;
    telefonoInput.value =telefono;
    fechaInput.value = fecha;
    horaInput.value = hora;
    sintomasInput.value = sintomas;
    //Se llena el objeto
    citaObj.mascota = mascota;
    citaObj.propietario = propietario;
    citaObj.telefono = telefono;
    citaObj.fecha = fecha;
    citaObj.hora = hora;
    citaObj.sintomas = sintomas;
    citaObj.id = id;
    //Cambiar el texto del botón
    formulario.querySelector('button[type="submit"]').textContent = 'Guardar cambios';
    editando = true;
}

function crearDB() {
    //Crear BD
    const crearDB = window.indexedDB.open('citas', 1);

    //Error
    crearDB.onerror = function() {
        console.log("Hubo error");
    }

    //Todo ok
    crearDB.onsuccess = function() {
        DB = crearDB.result;
        //Mostrar citas al cargar
        ui.imprimirCitas();
    }

    //Definir schema
    crearDB.onupgradeneeded = function(e) {
        const db = e.target.result;
        const objectStore = db.createObjectStore('citas', {
            keyPath: 'id',
            autoIncrement: true
        });

        //Definir columnas
        objectStore.createIndex('mascota', 'mascota', {unique: false});
        objectStore.createIndex('propietario', 'propietario', {unique: false});
        objectStore.createIndex('telefono', 'telefono', {unique: false});
        objectStore.createIndex('fecha', 'fecha', {unique: false});
        objectStore.createIndex('hora', 'hora', {unique: false});
        objectStore.createIndex('sintomas', 'sintomas', {unique: false});
        objectStore.createIndex('id', 'id', {unique: true});
    }
}