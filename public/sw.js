
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

// FASE FETCH (Escuchando peticiones)
self.addEventListener('fetch', event => {
    // Por ahora solo monitoreamos en consola
    console.log('SW pidiendo:', event.request.url);
});
