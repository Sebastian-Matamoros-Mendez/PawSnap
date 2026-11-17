/* ELEMENTOS Y ESTADO */
/* Qué se hace: obtiene por su id la lista de publicaciones y el buscador, y guarda el texto buscado */

const rutaImagenes = "imagenes/";
const listaPublicaciones = document.getElementById("posts_List");
const buscador = document.getElementById("search_Input");
let textoBusqueda = "";

/* FIN ELEMENTOS Y ESTADO */

/* MOSTRAR PUBLICACIONES RECIENTES */
/* Qué se hace: muestra las 3 publicaciones más recientes (y que coincidan con la búsqueda) */

function actualizarInicio() {
    const recientes = filtrarPublicaciones("Todos", textoBusqueda).slice(0, 3);
    mostrarPublicaciones(listaPublicaciones, recientes, rutaImagenes);
}

/* FIN MOSTRAR PUBLICACIONES RECIENTES */

/* INICIO Y EVENTOS */
/* Qué se hace: carga los datos, muestra las tarjetas y activa los eventos de la página */

cargarPublicaciones();
actualizarInicio();
activarEventosTarjetas(listaPublicaciones, actualizarInicio);

/* Evento input: filtra mientras se escribe en el buscador del encabezado */

buscador.addEventListener("input", function () {
    textoBusqueda = buscador.value;
    actualizarInicio();
});

/* FIN INICIO Y EVENTOS */