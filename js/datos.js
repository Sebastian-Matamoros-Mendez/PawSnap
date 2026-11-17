/* DATOS DE LAS PUBLICACIONES */
/* Qué se hace: arreglo con las publicaciones iniciales y la clave donde se guardan en el navegador */

const CLAVE_PUBLICACIONES = "pawsnapPublicaciones";

/* Cada publicación guarda: usuario, contenido, categoría y cantidad de "Me gusta" */

const publicacionesIniciales = [
    {
        id: 1,
        usuario: "Sofía & Moka",
        contenido: "Primera tarde de Moka en el parque. Al principio no quería separarse de mí, pero terminó haciendo una nueva amiga.",
        categoria: "Caninos",
        meGusta: 128,
        meGustaDado: false,
        imagen: "Moka.jpg",
        descripcion: "Cachorros jugando en el parque."
    },
    {
        id: 2,
        usuario: "Milo",
        contenido: "Milo ha descubierto que la mejor vista de la casa está justo aquí. ¿Los gatos de ustedes también tienen un rincón favorito?",
        categoria: "Felinos",
        meGusta: 94,
        meGustaDado: false,
        imagen: "Milo.jpg",
        descripcion: "Gato gris de pelo largo mirando por una ventana."
    },
    {
        id: 3,
        usuario: "Nuez",
        contenido: "Nuez cumplió dos años hoy. Le preparamos semillas, fruta y su túnel favorito. Pequeño de tamaño, enorme de personalidad.",
        categoria: "Roedores",
        meGusta: 76,
        meGustaDado: false,
        imagen: "Nuez.jpg",
        descripcion: "Hámster color miel sentado sobre una superficie clara."
    },
    {
        id: 4,
        usuario: "La Bombis",
        contenido: "Tarde en casa con Bombis😎. ¡Su carita de felicidad lo es todo!🥰",
        categoria: "Caninos",
        meGusta: 128,
        meGustaDado: false,
        imagen: "Bombona2.jpeg",
        descripcion: "Perro Beagle sentado feliz sobre un sillón."
    },
    {
        id: 5,
        usuario: "Eka",
        contenido: "Modo descanso activado😴 entre las plantas🪴. ¿Sus gatos también se duermen en los lugares más inesperados de la casa?",
        categoria: "Felinos",
        meGusta: 94,
        meGustaDado: false,
        imagen: "Eka.jpeg",
        descripcion: "Gato negro acostado al lado de una maceta con suculentas."
    },
    {
        id: 6,
        usuario: "Carmen",
        contenido: "A Carmen le ¡ENCANTA! comer pepinos🤣. Se ve tan graciosa y tierna comiendo su comida favorita💕.",
        categoria: "Roedores",
        meGusta: 76,
        meGustaDado: false,
        imagen: "Carmen.jpeg",
        descripcion: "Cuy comiendo pepino."
    }
];

/* Arreglo con las publicaciones que se muestran; se llena con cargarPublicaciones() */

let publicaciones = [];

/* FIN DATOS DE LAS PUBLICACIONES */


/* GUARDAR Y CARGAR */
/* Qué se hace: lee y guarda el arreglo en localStorage para que se mantenga al cambiar de página */

function cargarPublicaciones() {
    try {
        const guardado = localStorage.getItem(CLAVE_PUBLICACIONES);
        if (guardado) {
            publicaciones = JSON.parse(guardado);
            restaurarPublicacionesIniciales();
            return;
        }
    } catch (error) {
        /* Si el navegador no permite localStorage, se usan los datos iniciales */
    }
    /* Copia de los datos iniciales para no modificar el arreglo original */
    publicaciones = JSON.parse(JSON.stringify(publicacionesIniciales));
}

/* Deja la lista en este orden: primero las publicaciones nuevas (la más reciente arriba) y después las iniciales en su orden original. Si falta alguna inicial (por ejemplo, una eliminada antes de bloquear su eliminación), se vuelve a agregar */

function restaurarPublicacionesIniciales() {
    const ordenAnterior = publicaciones.map(function (item) {
        return item.id;
    }).join(",");

    const nuevas = publicaciones.filter(function (item) {
        return !esPublicacionInicial(item.id);
    });
    const iniciales = publicacionesIniciales.map(function (inicial) {
        const guardada = publicaciones.find(function (item) {
            return item.id === inicial.id;
        });
        /* Se conserva la guardada (con sus "Me gusta"); si no existe, se usa una copia de la inicial */
        return guardada || JSON.parse(JSON.stringify(inicial));
    });

    publicaciones = nuevas.concat(iniciales);

    const ordenNuevo = publicaciones.map(function (item) {
        return item.id;
    }).join(",");
    if (ordenNuevo !== ordenAnterior) {
        guardarPublicaciones();
    }
}

function guardarPublicaciones() {
    try {
        localStorage.setItem(CLAVE_PUBLICACIONES, JSON.stringify(publicaciones));
    } catch (error) {
        /* Si no se puede guardar, la publicación sigue en pantalla mientras no se cambie de página */
    }
}

/* FIN GUARDAR Y CARGAR */


/* ACCIONES SOBRE LAS PUBLICACIONES */
/* Qué se hace: agregar, dar "Me gusta", eliminar y filtrar publicaciones del arreglo */

function agregarPublicacion(usuario, contenido, categoria, imagen, tipo) {
    const nueva = {
        id: Date.now(),
        usuario: usuario,
        contenido: contenido,
        categoria: categoria,
        meGusta: 0,
        meGustaDado: false,
        imagen: imagen,
        tipo: tipo,
        descripcion: "Contenido publicado por " + usuario
    };
    /* La más nueva va primero */
    publicaciones.unshift(nueva);
    guardarPublicaciones();
}

/* Si ya había dado "Me gusta" lo quita; si no, lo suma */

function alternarMeGusta(id) {
    const publicacion = publicaciones.find(function (item) {
        return item.id === id;
    });
    if (!publicacion) {
        return;
    }
    publicacion.meGustaDado = !publicacion.meGustaDado;
    publicacion.meGusta += publicacion.meGustaDado ? 1 : -1;
    guardarPublicaciones();
}

/* Las publicaciones iniciales (las escritas desde el comienzo) se reconocen por su id y no se pueden eliminar */

function esPublicacionInicial(id) {
    return publicacionesIniciales.some(function (item) {
        return item.id === id;
    });
}

function eliminarPublicacion(id) {
    if (esPublicacionInicial(id)) {
        return;
    }
    publicaciones = publicaciones.filter(function (item) {
        return item.id !== id;
    });
    guardarPublicaciones();
}

/* Quita tildes y mayúsculas para comparar textos (así "Sofia" encuentra "Sofía") */

function normalizarTexto(texto) {
    return texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/* Devuelve las publicaciones de una categoría ("Todos" no filtra) que contengan el texto buscado */

function filtrarPublicaciones(categoria, textoBusqueda) {
    const busqueda = normalizarTexto(textoBusqueda.trim());
    return publicaciones.filter(function (item) {
        const coincideCategoria = categoria === "Todos" || item.categoria === categoria;
        const coincideTexto = normalizarTexto(item.usuario + " " + item.contenido).includes(busqueda);
        return coincideCategoria && coincideTexto;
    });
}

/* FIN ACCIONES SOBRE LAS PUBLICACIONES */


/* MOSTRAR EN PANTALLA */
/* Qué se hace: crea las tarjetas con el DOM y las muestra dentro de un contenedor */

function crearElemento(etiqueta, clase, texto) {
    const elemento = document.createElement(etiqueta);
    if (clase) {
        elemento.className = clase;
    }
    if (texto) {
        elemento.textContent = texto;
    }
    return elemento;
}

/* Botón de la tarjeta; "accion" y "id" se leen después al hacer clic */

function crearBoton(texto, accion, id) {
    const boton = crearElemento("button", "card_Button", texto);
    boton.type = "button";
    if (accion) {
        boton.dataset.accion = accion;
        boton.dataset.id = id;
    }
    return boton;
}

/* Crea el elemento multimedia según el tipo: "imagen" (por defecto), "video" o "youtube". Si el enlace es completo (http) se usa tal cual; si no, se busca en la carpeta imagenes */

function crearMultimedia(publicacion, rutaImagenes) {
    const direccion = publicacion.imagen.startsWith("http") ? publicacion.imagen : rutaImagenes + publicacion.imagen;
    let multimedia;

    if (publicacion.tipo === "video") {
        multimedia = crearElemento("video", "card_Image");
        multimedia.src = direccion;
        multimedia.controls = true;
        multimedia.preload = "metadata";
        multimedia.setAttribute("aria-label", publicacion.descripcion);
    } else if (publicacion.tipo === "youtube") {
        multimedia = crearElemento("iframe", "card_Image");
        multimedia.src = direccion;
        multimedia.title = publicacion.descripcion;
        multimedia.allowFullscreen = true;
        multimedia.loading = "lazy";
    } else {
        multimedia = crearElemento("img", "card_Image");
        multimedia.src = direccion;
        multimedia.alt = publicacion.descripcion;
    }
    return multimedia;
}

/* Arma una tarjeta con la misma estructura que tenía el HTML */

function crearTarjeta(publicacion, rutaImagenes) {
    const tarjeta = crearElemento("article", "card");
    tarjeta.append(
        crearElemento("h3", "card_User", publicacion.usuario),
        crearElemento("p", "card_Text", publicacion.contenido)
    );

    /* El contenido multimedia es opcional: puede ser imagen, video o video de YouTube */

    if (publicacion.imagen) {
        const figura = crearElemento("figure", "card_Figure");
        figura.append(crearMultimedia(publicacion, rutaImagenes));
        tarjeta.append(figura);
    }

    tarjeta.append(crearElemento("span", "card_Category", publicacion.categoria));

    /* Botones de acción */

    const acciones = crearElemento("footer", "card_Actions");
    const botonMeGusta = crearBoton("Me gusta: ", "megusta", publicacion.id);
    botonMeGusta.append(crearElemento("span", "card_Likes", String(publicacion.meGusta)));
    if (publicacion.meGustaDado) {
        botonMeGusta.classList.add("card_ButtonActive");
    }
    acciones.append(
        botonMeGusta,
        crearBoton("Comentar"),
        crearBoton("Compartir"),
        crearBoton("Guardar")
    );
    /* "Eliminar" solo aparece en las publicaciones creadas por el usuario */

    if (!esPublicacionInicial(publicacion.id)) {
        acciones.append(crearBoton("Eliminar", "eliminar", publicacion.id));
    }
    tarjeta.append(acciones);
    return tarjeta;
}

/* Vacía el contenedor y muestra una tarjeta por cada elemento de la lista (o un aviso si está vacía) */

function mostrarPublicaciones(contenedor, lista, rutaImagenes) {
    contenedor.replaceChildren();
    if (lista.length === 0) {
        contenedor.append(crearElemento("p", "posts_Empty", "No hay publicaciones para mostrar."));
        return;
    }
    lista.forEach(function (publicacion) {
        contenedor.append(crearTarjeta(publicacion, rutaImagenes));
    });
}

/* Un solo evento click en el contenedor atiende los botones "Me gusta" y "Eliminar" de todas las tarjetas */

function activarEventosTarjetas(contenedor, actualizarPantalla) {
    contenedor.addEventListener("click", function (evento) {
        const boton = evento.target.closest("[data-accion]");
        if (!boton) {
            return;
        }
        const id = Number(boton.dataset.id);
        if (boton.dataset.accion === "megusta") {
            alternarMeGusta(id);
            actualizarPantalla();
        } else if (boton.dataset.accion === "eliminar") {
            if (confirm("¿Quieres eliminar esta publicación?")) {
                eliminarPublicacion(id);
                actualizarPantalla();
            }
        }
    });
}

/* FIN MOSTRAR EN PANTALLA */