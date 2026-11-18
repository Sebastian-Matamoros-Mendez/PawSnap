/* ELEMENTOS Y DATOS */
/* Qué se hace: obtiene por su id el formulario y sus campos, y define las categorías permitidas */

const formulario = document.getElementById("crear_Form");
const campoUsuario = document.getElementById("usuario");
const campoContenido = document.getElementById("contenido");
const campoCategoria = document.getElementById("categoria");
const campoEnlace = document.getElementById("enlace");
const campoArchivo = document.getElementById("archivo");
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
    [campoUsuario, campoContenido, campoCategoria, campoEnlace, campoArchivo].forEach(function (campo) {
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

/* Prueba si una dirección se puede mostrar como imagen; espera máximo 6 segundos */

function probarImagen(direccion) {
    return new Promise(function (resolver) {
        const imagen = new Image();
        const limite = setTimeout(function () {
            resolver(false);
        }, 6000);
        imagen.onload = function () {
            clearTimeout(limite);
            resolver(true);
        };
        imagen.onerror = function () {
            clearTimeout(limite);
            resolver(false);
        };
        imagen.src = direccion;
    });
}

/* Prueba si una dirección se puede reproducir como video; espera máximo 6 segundos */

function probarVideo(direccion) {
    return new Promise(function (resolver) {
        const video = document.createElement("video");
        const limite = setTimeout(function () {
            resolver(false);
        }, 6000);
        video.onloadedmetadata = function () {
            clearTimeout(limite);
            resolver(true);
        };
        video.onerror = function () {
            clearTimeout(limite);
            resolver(false);
        };
        video.preload = "metadata";
        video.src = direccion;
    });
}

/* Identifica qué es el enlace: YouTube, Vimeo, imagen, video o, si no se puede mostrar, un simple enlace.
Devuelve una promesa con { tipo, direccion } */

async function detectarMultimedia(texto) {
    const url = new URL(texto);
    const servidor = url.hostname.replace(/^www\.|^m\./, "");

    /* YouTube: se convierte a la dirección "embed" para poder mostrarlo */

    let idVideo = "";
    if (servidor === "youtu.be") {
        idVideo = url.pathname.slice(1);
    } else if (servidor === "youtube.com") {
        idVideo = url.searchParams.get("v") || url.pathname.replace(/^\/(shorts|embed)\//, "");
    }
    if (/^[\w-]{11}$/.test(idVideo)) {
        return { tipo: "youtube", direccion: "https://www.youtube.com/embed/" + idVideo };
    }

    /* Vimeo: se usa el reproductor incrustado */

    if (servidor === "vimeo.com" || servidor === "player.vimeo.com") {
        const idVimeo = url.pathname.match(/(\d{6,})/);
        if (idVimeo) {
            return { tipo: "vimeo", direccion: "https://player.vimeo.com/video/" + idVimeo[1] };
        }
    }

    /* Por la terminación del archivo */

    if (/\.(jpe?g|png|gif|webp|avif|svg|bmp)$/i.test(url.pathname)) {
        return { tipo: "imagen", direccion: texto };
    }
    if (/\.(mp4|webm|ogg|ogv|mov|m4v)$/i.test(url.pathname)) {
        return { tipo: "video", direccion: texto };
    }

    /* Si no tiene terminación conocida, se prueba si carga como imagen y luego como video */

    if (await probarImagen(texto)) {
        return { tipo: "imagen", direccion: texto };
    }
    if (await probarVideo(texto)) {
        return { tipo: "video", direccion: texto };
    }
    return { tipo: "enlace", direccion: texto };
}

/* Lee una imagen del computador y la reduce (máximo 1000 px) para que quepa en el navegador.
Devuelve una promesa con la imagen como texto (data URL) */

function leerImagenArchivo(archivo) {
    return new Promise(function (resolver, rechazar) {
        const lector = new FileReader();
        lector.onerror = rechazar;
        lector.onload = function () {
            const imagen = new Image();
            imagen.onerror = rechazar;
            imagen.onload = function () {
                const escala = Math.min(1, 1000 / Math.max(imagen.width, imagen.height));
                const lienzo = document.createElement("canvas");
                lienzo.width = Math.round(imagen.width * escala);
                lienzo.height = Math.round(imagen.height * escala);
                lienzo.getContext("2d").drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
                resolver(lienzo.toDataURL("image/jpeg", 0.8));
            };
            imagen.src = lector.result;
        };
        lector.readAsDataURL(archivo);
    });
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
    if (campoArchivo && campoArchivo.files.length > 0 && !campoArchivo.files[0].type.startsWith("image/")) {
        return { campo: campoArchivo, texto: "El archivo debe ser una imagen (JPG, PNG, GIF o WEBP)." };
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

formulario.addEventListener("submit", async function (evento) {
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

    /* Se obtiene el contenido multimedia (opcional): una imagen del computador o el enlace escrito.
    Mientras se revisa, el botón se bloquea para evitar publicaciones repetidas */

    botonPublicar.disabled = true;
    mostrarMensaje("Publicando...", "exito");

    let direccion = "";
    let tipo = "";
    try {
        if (campoArchivo && campoArchivo.files.length > 0) {
            direccion = await leerImagenArchivo(campoArchivo.files[0]);
            tipo = "imagen";
        } else if (enlace !== "") {
            const multimedia = await detectarMultimedia(enlace);
            direccion = multimedia.direccion;
            tipo = multimedia.tipo;
        }
    } catch (errorLectura) {
        botonPublicar.disabled = false;
        mostrarMensaje("No se pudo leer la imagen. Prueba con otra.", "error");
        return;
    }

    cargarPublicaciones();
    const seGuardo = agregarPublicacion(usuario, contenido, categoria, direccion, tipo);
    if (!seGuardo) {
        botonPublicar.disabled = false;
        mostrarMensaje("No hay espacio para guardar la publicación. Prueba con una imagen más pequeña o un enlace.", "error");
        return;
    }

    formulario.reset();
    contador.textContent = "0/" + maximoCaracteres;
    botonPublicar.disabled = true;
    mostrarMensaje("¡Publicación creada! Te llevamos a Publicaciones...", "exito");

    setTimeout(function () {
        window.location.href = "../publicaciones/publicaciones.html";
    }, 1200);
});

/* FIN EVENTOS */