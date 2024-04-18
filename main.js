/* --------------------------------------------------- */
/*                 VARIABLE GLOBALES                   */
/* --------------------------------------------------- */

let listaProductos = [/* 
    { id: 1, nombre: 'Carne', cantidad: 2, precio: 12.34 },
    { id: 2, nombre: 'Pan', cantidad: 3, precio: 34.56 },
    { id: 3, nombre: 'Fideos', cantidad: 4, precio: 45.78 },
    { id: 4, nombre: 'Leche', cantidad: 5, precio: 78.23 }, */
]

let crearLista = true
let ul

/* --------------------------------------------------- */
/*                FUNCIONES GLOBALES                   */
/* --------------------------------------------------- */

async function borrarProd(id) {
    try {
      // console.log('borrarProd', id);
      await apiProd.del(id);
      renderLista();
    } catch (error) {
      console.log('[borrarProd]', error);
    }
  }

function renderLista() {
    // console.log('Render lista')

    /* ----------- petición plantilla con fetch ------------ */

    let data = fetch('plantilla-lista.hbs')

    data
        .then(respuesta => {
            // console.log(respuesta)
            return respuesta.text()
        })
        .then(async plantilla => {
            //console.log(plantilla) // el string del contenido del archivo.

            /* ------------------- compilar la plantilla -------------- */
            let template = Handlebars.compile(plantilla)

            /* ------------------------- Obtengo la lista de productos del servidor remoto ------------------- */
            listaProductos = await apiProd.get()
            // console.warn({listaProductos})

            /* -------------------- Ejecuto el template --------------- */
            let html = template({listaProductos}) /* Le paso la data */
            //console.log(html) /* Tengo un string con la plantilla compilada. O sea la plantilla tiene la data */
            
            document.getElementById('lista').innerHTML = html

            /* Me refrescaba la librería material lite */
            let ul = document.querySelector('#contenedor-lista')
            componentHandler.upgradeElements(ul)
        })
        .catch( (error) => {
            console.error('Error', error)
        }) 
}

/* ------------------------------------------------------- */
/* Listeners                                               */
/* ------------------------------------------------------- */

function configurarListeners() {
    // ! Ingreso del producto nuevo 
    const entradaProducto = document.getElementById("btn-entrada-producto")
    // console.log(entradaProducto)

    entradaProducto.addEventListener('click', async () => {
        console.log('btn-entrada-producto')

        let input = document.getElementById('ingreso-producto')
        // console.dir(input)
        let producto = input.value /* value => lo que escribió el usuario */

        if ( producto ) {
            const objProd = { 
                nombre: producto, 
                cantidad: 1, 
                precio: 0
            }
            await apiProd.post(objProd)
            //listaProductos.push(objProd)
            renderLista()
            input.value = null
        }
    })

    // ! Borrado total de productos 

    const btnBorrarProductos = document.getElementById('btn-borrar-productos')
    /* console.log(btnBorrarProductos) */

    btnBorrarProductos.addEventListener('click', () => {
        console.log('btn-borrar-productos')

        /* if ( confirm('¿Desea borrar todos los productos?') ) { // confirm => true o false
            // listaProductos = []
            apiProd.deleteAll(listaProductos)
            renderLista()
        } */

        if (listaProductos.length) {
          const dialog = $('dialog')[0]
          dialog.showModal()
        }

    })

    // ! Borrado de un producto
  const lista = document.querySelector('#lista')
  //console.log(lista)

  lista.addEventListener('click', e => { // e, evt, evento, event
    //console.log(e.target) // <- a que elemento le hice click
    if (e.target.classList.contains('btn-delete')) {
      //console.log('BTN')
      borrarProd(e.target.dataset.id)
    }

    if (e.target.classList.contains('material-icons')) {
      //console.log('Icono')
      borrarProd(e.target.parentElement.dataset.id)
    }
  })

  // ! Cambiar Valor
  lista.addEventListener('change', async e => {
    // console.log('change')
    const elemento = e.target
    // console.log(elemento)

    if ( elemento.classList.contains('cambiar-cantidad') || elemento.classList.contains('cambiar-precio')) {
      const id = elemento.dataset.id
      const valor = elemento.dataset.valor
      // console.log(valor) // 'cantidad' o 'precio'
      // console.log(elemento.value)
      let dato = valor === 'cantidad' ? parseInt(elemento.value) : Number(elemento.value)
      // console.log(dato)
      const index = listaProductos.findIndex(prod => prod.id == id)

      listaProductos[index][valor] = dato 

      let productoEditado = listaProductos[index]
      // console.log(productoEditado)

      await apiProd.put(productoEditado, id)
    }

  })  

    

}

/* --------------------------------------------------------- */
/* Registro Service Worker                                   */
/* --------------------------------------------------------- */

function registrarServiceWorker() {
    if ( 'serviceWorker' in navigator ) { // si no está el sw me daría false
        this.navigator.serviceWorker.register('sw.js') /* /sw.js */
            .then( reg => {
                console.log('El service worker se registró correctamente', reg)
            })
            .catch( err => {
                console.error('Error al registrar el service worker', err)
            })
    } else {
        console.error('serviceWorker no está disponible en el navegador')
    }
}

/* --------------------------------------------------------- */
/* TEST CACHE                                                */
/* --------------------------------------------------------- */

/* ----------------------------------------------------------- */
/* TEST CACHE (Service Worker)                                 */
/* ----------------------------------------------------------- */
// https://developer.mozilla.org/en-US/docs/Web/API/Cache

function testCache() {
    console.warn('Test CACHE');
  
    if ( window.caches ) {
      console.log('El navegador actual soporta CACHES')
  
      // ! Creo un espacio de cache open()
      caches.open('prueba-1')
      caches.open('prueba-2')
      caches.open('prueba-3')
      caches.open('prueba-4')
  
      // ! Comprobamos si un espacio de cache existe -> has() | Devuelve una promesa 
  
      console.log(caches.has('prueba-2')) // devuelve una promesa
  
      caches.has('prueba-2').then(resultado => console.log('prueba-2:', resultado)) // si existe -> true de lo contrario false
      caches.has('prueba-5').then(resultado => console.log('prueba-5:', resultado)) // si existe -> true de lo contrario false
      
      // ! Borrado de un espacio de cache 
      caches.delete('prueba-2')
      caches.has('prueba-2').then(resultado => console.log('prueba-2:', resultado)) // si existe -> true de lo contrario false
  
      // ! Listo todos los espacios de caches -> keys()
  
      // caches.keys().then(espacios => console.log(espacios)).catch(error => console.error(error))
      caches.keys().then(console.log).catch(console.error)

      /* --------------------------------------------------- */
      /* Abro un espacio de cache y trabajo con él           */
      /* --------------------------------------------------- */

      caches.open('cache-v1.1').then( cache => {
        console.log(cache) // Cache
        console.log(caches) // CacheStorage

        /* Agrego un recurso a la cache -> add() */

        cache.add('./index.html')

        /* Agrego varios recursos a la cache -> cache-v1.1 -> addAll() */
        /* Recibe un array como argumento */

        cache.addAll([
          './css/main.css',
          './images/icons/icon-72x72.png'
        ]).then( ( ) => {
          console.log('Recursos agregados!')

          /* Borrar un recurso de la cache -> delete() */

          // cache.delete('./css/main.css').then(console.log) // true -> lo borró | false -> no lo borró

          cache.match('./css/main.css').then( resultado => {
            if ( resultado ) {
              console.log('Recurso encontrado')
            } else {
              console.error('Recurso inexistente')
            }
          })

          /* Creo o modifico el contenido de un recurso -> put() */

          cache.put('./index.html', new Response('Hola mundo!'))

          /* Listar todos los recursos que contiene esta cache -> keys() */

          // cache.keys().then(recursos => console.log('Recursos de cache: ', recursos))

          cache.keys().then( recursos => {
            recursos.forEach( recurso => {
              console.log(recurso.url)
            })
          })

        }).catch( () => {
          console.error('Recursos no agregado')
        })


      })

    }
}

/* ------------------------------------ */
/* MODAL                                */
/* ------------------------------------ */

function initDialog() {

  const dialog = $('dialog')[0]
  // console.log(dialog)

  // Registro el modal
  if (!dialog.showModal) {
    dialogPolyfill.registerDialog(dialog)
  }

  $('dialog .aceptar').click( async () => {
    // try and catch
    await apiProd.deleteAll(listaProductos)
    renderLista()
    dialog.close()
  })

  $('dialog .cancelar').click( () => {
    dialog.close()
  })

}

function start() {
    
    registrarServiceWorker()
    configurarListeners()
    initDialog()
    // testCache()

    renderLista()
}

// start()
// window.onload = start
$(document).ready(start)
