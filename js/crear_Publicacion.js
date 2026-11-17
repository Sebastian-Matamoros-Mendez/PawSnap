/* ELEMENTOS Y DATOS */
/* Qué se hace: obtiene por su id el formulario y sus campos, y define las categorías permitidas */

const formulario = document.getElementById("crear_Form");
const campoUsuario = document.getElementById("usuario");
const campoContenido = document.getElementById("contenido");
const campoCategoria = document.getElementById("categoria");
const campoEnlace = document.getElementById("enlace");
const contador = document.getElementById("char_Counter");
const botonPublicar = document.getElementById("publish_Button");
const categoriasPermitidas = ["Caninos", "Felinos", "Roedores", "Otro"];
const maximoCaracteres = 500;

/* Párrafo donde se muestran los errores y el mensaje de éxito (se crea con el DOM) */

const mensaje = document.createElement("p");
mensaje.id = "crear_Message";
mensaje.className = "form_Message";
mensaje.setAttribute("role", "alert");
formulario.insertBefore(mensaje, botonPublicar);

/* La validación la hace este código, no el navegador */

formulario.noValidate = true;
/* FIN ELEMENTOS Y DATOS */



/* MENSAJES Y ERRORES */
/* Qué se hace: muestra un mensaje y marca o desmarca los campos con error */

function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = "form_Message " + (tipo === "error" ? "message_Error" : "message_Success");
}

function limpiarErrores() {
    mensaje.textContent = "";
    mensaje.className = "form_Message";
    [campoUsuario, campoContenido, campoCategoria, campoEnlace].forEach(function (campo) {
        campo.classList.remove("field_Invalid");
    });
}

/* FIN MENSAJES Y ERRORES */


/* VALIDACIÓN */
/* Qué se hace: revisa los datos del formulario; devuelve el primer error encontrado o null si todo está bien */

function esUnaUrlValida(texto) {
    try {
        const url = new URL(texto);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch (error) {
        return false;
    }
}

/* Identifica qué es el enlace: imagen, video o video de YouTube.
Devuelve { tipo, direccion } o null si el enlace no es multimedia */

function detectarMultimedia(texto) {
    if (/\.(jpe?g|png|gif|webp|avif|svg)(\?.*)?$/i.test(texto)) {
        return { tipo: "imagen", direccion: texto };
    }
    if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(texto)) {
        return { tipo: "video", direccion: texto };
    }

    /* Enlaces de YouTube: se convierten a la dirección "embed" para poder mostrarlos */

    const url = new URL(texto);
    const servidor = url.hostname.replace(/^www\.|^m\./, "");
    let idVideo = "";
    if (servidor === "youtu.be") {
        idVideo = url.pathname.slice(1);
    } else if (servidor === "youtube.com") {
        idVideo = url.searchParams.get("v") || url.pathname.replace(/^\/(shorts|embed)\//, "");
    }
    if (/^[\w-]{11}$/.test(idVideo)) {
        return { tipo: "youtube", direccion: "https://www.youtube.com/embed/" + idVideo };
    }
    return null;
}

function validarFormulario(usuario, contenido, categoria, enlace) {
    if (usuario.length < 2 || usuario.length > 40) {
        return { campo: campoUsuario, texto: "El nombre de usuario debe tener entre 2 y 40 caracteres." };
    }
    if (contenido.length < 10) {
        return { campo: campoContenido, texto: "El contenido debe tener al menos 10 caracteres." };
    }
    if (contenido.length > maximoCaracteres) {
        return { campo: campoContenido, texto: "El contenido no puede superar los 500 caracteres." };
    }
    if (!categoriasPermitidas.includes(categoria)) {
        return { campo: campoCategoria, texto: "Elige una categoría de la lista." };
    }
    if (enlace !== "" && !esUnaUrlValida(enlace)) {
        return { campo: campoEnlace, texto: "El enlace debe empezar con http:// o https://." };
    }
    return null;
}

/* FIN VALIDACIÓN */


/* EVENTOS */
/* Qué se hace: actualiza el contador al escribir y crea la publicación al enviar el formulario */

/* Evento input: cuenta los caracteres escritos (ejemplo: 25/500) */

campoContenido.addEventListener("input", function () {
    contador.textContent = campoContenido.value.length + "/" + maximoCaracteres;
});

/* Al escribir en cualquier campo se quita el error anterior */

formulario.addEventListener("input", limpiarErrores);

/* Evento submit: valida, guarda la publicación y lleva a la página de Publicaciones */

formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    limpiarErrores();

    const usuario = campoUsuario.value.trim();
    const contenido = campoContenido.value.trim();
    const categoria = campoCategoria.value;
    const enlace = campoEnlace.value.trim();

    const error = validarFormulario(usuario, contenido, categoria, enlace);
    if (error) {
        error.campo.classList.add("field_Invalid");
        error.campo.focus();
        mostrarMensaje(error.texto, "error");
        return;
    }

    /* Si el enlace es una imagen o un video se muestra en la publicación; si no, se publica solo el texto */

    const multimedia = enlace === "" ? null : detectarMultimedia(enlace);
    const direccion = multimedia ? multimedia.direccion : "";
    const tipo = multimedia ? multimedia.tipo : "";

    cargarPublicaciones();
    agregarPublicacion(usuario, contenido, categoria, direccion, tipo);

    formulario.reset();
    contador.textContent = "0/" + maximoCaracteres;
    botonPublicar.disabled = true;
    mostrarMensaje("¡Publicación creada! Te llevamos a Publicaciones...", "exito");

    setTimeout(function () {
        window.location.href = "../publicaciones/publicaciones.html";
    }, 1200);
});

/* FIN EVENTOS */