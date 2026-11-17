/* ELEMENTOS Y ESTADO */
/* Qué se hace: obtiene los elementos de la página y guarda la categoría y el texto de búsqueda actuales */

const rutaImagenes = "../imagenes/";
const listaPublicaciones = document.getElementById("posts_List");
const buscador = document.getElementById("search_Input");
const botonesFiltro = document.querySelectorAll(".filters_Button");
let categoriaActual = "Todos";
let textoBusqueda = "";

/* FIN ELEMENTOS Y ESTADO */

/* MOSTRAR PUBLICACIONES */
/* Qué se hace: muestra las publicaciones que coinciden con la categoría y la búsqueda */

function actualizarPublicaciones() {
    const lista = filtrarPublicaciones(categoriaActual, textoBusqueda);
    mostrarPublicaciones(listaPublicaciones, lista, rutaImagenes);
}

/* FIN MOSTRAR PUBLICACIONES */

/* FILTRO POR CATEGORÍA */
/* Qué se hace: al hacer clic en un botón, cambia la categoría y marca ese botón como activo */

function seleccionarCategoria(botonSeleccionado) {
    categoriaActual = botonSeleccionado.dataset.categoria;
    botonesFiltro.forEach(function (boton) {
        boton.classList.remove("filters_ButtonActive");
    });
    botonSeleccionado.classList.add("filters_ButtonActive");
    actualizarPublicaciones();
}

/* FIN FILTRO POR CATEGORÍA */

/* INICIO Y EVENTOS */
/* Qué se hace: carga los datos, muestra las tarjetas y activa los eventos de la página */

cargarPublicaciones();
actualizarPublicaciones();
activarEventosTarjetas(listaPublicaciones, actualizarPublicaciones);

/* Evento click en cada botón de categoría */

botonesFiltro.forEach(function (boton) {
    boton.addEventListener("click", function () {
        seleccionarCategoria(boton);
    });
});

/* Evento input: filtra mientras se escribe en el buscador del encabezado */

buscador.addEventListener("input", function () {
    textoBusqueda = buscador.value;
    actualizarPublicaciones();
});

/* FIN INICIO Y EVENTOS */