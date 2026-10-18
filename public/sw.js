
// sw.js - Service Worker con Cache API

// 1. Definimos el nombre y la versión de la caché estática
const CACHE_NAME = 'proyecto-v1';

// 2. Listamos todos los recursos estáticos esenciales que forman el App Shell
const STATIC_ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './manifest.json',
    './images/image1.png',
    './images/image2.png',
    
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// FASE DE INSTALACIÓN: Guardando recursos estáticos
self.addEventListener('install', event => {
    console.log('SW: Guardando recursos estáticos en la caché...');

    // Esperamos a que la promesa de guardado se complete antes de finalizar la instalación
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('SW: Caché abierta con éxito:', CACHE_NAME);

                // Agregamos todos los archivos estáticos a la memoria caché
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('SW: Todos los archivos del App Shell fueron almacenados.');

                // Forzamos al nuevo Service Worker a activarse de inmediato
                return self.skipWaiting();
            })
            .catch(err => {
                console.error('SW: Falló el almacenamiento en caché del App Shell:', err);
                throw err;
            })
    );
});

// FASE DE ACTIVACIÓN
self.addEventListener('activate', event => {
    console.log('SW: Activado y listo.');

    event.waitUntil(self.clients.claim());
});


 // FASE FETCH: Estrategia Cache First
self.addEventListener('fetch', event => {
    // Solo interceptamos peticiones GET
    if (event.request.method !== 'GET') {
        return;
    }

    // Solo atendemos recursos del mismo origen
    const url = new URL(event.request.url);

    if (url.origin !== self.location.origin) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(respuestaCache => {
            // Si el archivo existe en caché, lo devolvemos
            if (respuestaCache) {
                console.log(
                    'SW: Sirviendo desde Caché',
                    event.request.url
                );

                return respuestaCache;
            }

            // Si no está en caché, intentamos obtenerlo de la red
            console.log(
                'SW: No está en caché, buscando en red:',
                event.request.url
            );

            return fetch(event.request).then(respuestaRed => {
                if (!respuestaRed.ok) {
                    return respuestaRed;
                }

                // Guardamos una copia para futuras visitas
                const copiaRespuesta = respuestaRed.clone();

                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, copiaRespuesta);
                });

                return respuestaRed;
            });
        })
    );
});

