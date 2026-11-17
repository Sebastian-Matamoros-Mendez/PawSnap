/* ELEMENTOS Y DATOS */
/* Qué se hace: obtiene por su id los campos del formulario y los textos de la placa */

const CLAVE_COLLAR = "pawsnapCollar";
const formularioCollar = document.getElementById("collar_Form");
const campoNombre = document.getElementById("pet_Name");
const campoLugar = document.getElementById("pet_Address");
const campoTelefono = document.getElementById("owner_Phone");
const botonGuardar = document.getElementById("save_Button");
const placaNombre = document.getElementById("collar_Name");
const placaLugar = document.getElementById("collar_Location");
const placaTelefono = document.getElementById("collar_Phone");

/* Párrafo donde se muestran los errores y el mensaje de éxito (se crea con el DOM) */

const mensajeCollar = document.createElement("p");
mensajeCollar.id = "collar_Message";
mensajeCollar.className = "form_Message";
mensajeCollar.setAttribute("role", "alert");
formularioCollar.insertBefore(mensajeCollar, botonGuardar);

/* La validación la hace este código, no el navegador */

formularioCollar.noValidate = true;

/* FIN ELEMENTOS Y DATOS */

/* VISTA PREVIA */
/* Qué se hace: copia lo escrito en el formulario a la placa; si un campo está vacío deja un texto de ejemplo */

function actualizarPlaca() {
    placaNombre.textContent = campoNombre.value.trim() || "Tu mascota";
    placaLugar.textContent = campoLugar.value.trim() || "Lugar donde vive";
    placaTelefono.textContent = campoTelefono.value.trim() || "Número del dueño";
}

/* FIN VISTA PREVIA */

/* GUARDAR Y CARGAR */
/* Qué se hace: guarda los datos del collar en localStorage y los recupera al abrir la página */

function guardarCollar(nombre, lugar, telefono) {
    try {
        localStorage.setItem(CLAVE_COLLAR, JSON.stringify({ nombre: nombre, lugar: lugar, telefono: telefono }));
    } catch (error) {
        /* Si no se puede guardar, la placa sigue visible en pantalla */
    }
}

function cargarCollar() {
    try {
        const guardado = JSON.parse(localStorage.getItem(CLAVE_COLLAR));
        if (guardado) {
            campoNombre.value = guardado.nombre;
            campoLugar.value = guardado.lugar;
            campoTelefono.value = guardado.telefono;
        }
    } catch (error) {
        /* Si no hay datos guardados se dejan los valores del HTML */
    }
}

/* FIN GUARDAR Y CARGAR */

/* VALIDACIÓN */
/* Qué se hace: revisa los datos; devuelve el primer error encontrado o null si todo está bien */

function validarCollar(nombre, lugar, telefono) {
    const cantidadNumeros = telefono.replace(/\D/g, "").length;
    if (nombre.length < 2) {
        return { campo: campoNombre, texto: "El nombre de la mascota debe tener al menos 2 caracteres." };
    }
    if (lugar.length < 3) {
        return { campo: campoLugar, texto: "Escribe el lugar donde vive (al menos 3 caracteres)." };
    }
    if (!/^[+\d\s()-]+$/.test(telefono) || cantidadNumeros < 8 || cantidadNumeros > 15) {
        return { campo: campoTelefono, texto: "El teléfono debe tener entre 8 y 15 números." };
    }
    return null;
}

function limpiarErroresCollar() {
    mensajeCollar.textContent = "";
    mensajeCollar.className = "form_Message";
    [campoNombre, campoLugar, campoTelefono].forEach(function (campo) {
        campo.classList.remove("field_Invalid");
    });
}

/* FIN VALIDACIÓN */

/* INICIO Y EVENTOS */
/* Qué se hace: carga los datos guardados, muestra la placa y activa los eventos del formulario */

cargarCollar();
actualizarPlaca();

/* Evento input: la placa cambia en vivo mientras se escribe */

formularioCollar.addEventListener("input", function () {
    limpiarErroresCollar();
    actualizarPlaca();
});

/* Evento submit: valida y guarda el collar */

formularioCollar.addEventListener("submit", function (evento) {
    evento.preventDefault();
    limpiarErroresCollar();

    const nombre = campoNombre.value.trim();
    const lugar = campoLugar.value.trim();
    const telefono = campoTelefono.value.trim();

    const error = validarCollar(nombre, lugar, telefono);
    if (error) {
        error.campo.classList.add("field_Invalid");
        error.campo.focus();
        mensajeCollar.textContent = error.texto;
        mensajeCollar.className = "form_Message message_Error";
        return;
    }

    guardarCollar(nombre, lugar, telefono);
    mensajeCollar.textContent = "¡Collar guardado!";
    mensajeCollar.className = "form_Message message_Success";
});

/* FIN INICIO Y EVENTOS */