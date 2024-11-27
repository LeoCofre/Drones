document.addEventListener('DOMContentLoaded', function () {
    const map = L.map('map').setView([-36.6067, -72.1033], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    let markerCliente, markerRestaurante;
    let latLngCliente, latLngRestaurante;

    // Función para geocodificar dirección
    function geocodificarDireccion(direccion) {
        return new Promise((resolve, reject) => {
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion + ', Chillán, Chile')}`)
                .then(response => response.json())
                .then(data => {
                    if (data.length > 0) {
                        const resultado = data[0];
                        resolve({
                            lat: parseFloat(resultado.lat),
                            lng: parseFloat(resultado.lon),
                            nombreCompleto: resultado.display_name
                        });
                    } else {
                        reject(new Error('Dirección no encontrada'));
                    }
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    // Función para obtener dirección legible
    function obtenerDireccionLegible(lat, lng) {
        return new Promise((resolve, reject) => {
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                .then(response => response.json())
                .then(data => {
                    resolve(data.display_name || `${lat}, ${lng}`);
                })
                .catch(error => {
                    console.error("Error al obtener la dirección:", error);
                    resolve(`${lat}, ${lng}`);
                });
        });
    }

    // Botón para buscar dirección del cliente
    const btnBuscarDireccionCliente = document.createElement('button');
    btnBuscarDireccionCliente.textContent = 'Buscar Dirección';
    btnBuscarDireccionCliente.type = 'button';
    btnBuscarDireccionCliente.classList.add('btn', 'btn-primary', 'mt-2');
    
    const divDireccionCliente = document.querySelector('label[for="direccionCliente"]').parentElement;
    divDireccionCliente.appendChild(btnBuscarDireccionCliente);

    // Evento para buscar dirección del cliente
    btnBuscarDireccionCliente.addEventListener('click', async function() {
        const direccionInput = document.getElementById('direccionCliente');
        const direccion = direccionInput.value.trim();

        if (direccion) {
            try {
                // Geocodificar la dirección
                const resultado = await geocodificarDireccion(direccion);

                // Eliminar marcador anterior si existe
                if (markerCliente) {
                    map.removeLayer(markerCliente);
                }

                // Crear nuevo marcador
                markerCliente = L.marker([resultado.lat, resultado.lng]).addTo(map);
                latLngCliente = { lat: resultado.lat, lng: resultado.lng };

                // Actualizar input con dirección completa
                direccionInput.value = resultado.nombreCompleto;

                // Centrar mapa
                map.setView([resultado.lat, resultado.lng], 16);

            } catch (error) {
                alert('No se pudo encontrar la dirección. Verifique e intente nuevamente.');
                console.error(error);
            }
        } else {
            alert('Por favor, ingrese una dirección');
        }
    });

    // Lista de restaurantes con sus coordenadas y direcciones
    const restaurantes = [

        {
            nombre: "Fuego Divino",
            lat: -36.604126,
            lng: -72.095131,
            direccion: "Gamero 980, Chillán"
        },
        {
            nombre: "Fuente Alemana",
            lat: -36.608185,
            lng: -72.102943,
            direccion: "Arauco 641, Chillán"
        },
        {
            nombre: "Ficus Restaurante",
            lat: -36.602985,
            lng: -72.109505,
            direccion: "Rosas 392, Chillán"
        },
        {
            nombre: "Onde'l Pala",
            lat: -36.600513,
            lng: -72.095345,
            direccion: "Alcalde Flores Millan 31,, Chillán"
        },
        {
            nombre: "Zasha Restaurant",
            lat: -36.607272,
            lng: -72.099253,
            direccion: "Av. Libertad 820, Chillán"
        },
        {
            nombre: "Aay Chabela Restaurant",
            lat: -36.6080416,
            lng: -72.1033277,
            direccion: "Arauco 660, Chillán"
        },
        {
            nombre: "La Ramona Lounge & Beergarden",
            lat: -36.6009443,
            lng: -72.1052555,
            direccion: "Claudio Arrau 177, Chillán"
        },
        {
            nombre: "Tempura Sushi",
            lat: -36.609352,
            lng: -72.10069,
            direccion: "Avenida O'Higgins 1001, Chillán"
        },
        {
            nombre: "Akami Sushi Bar",
            lat: -36.6172970,
            lng: -72.1179152,
            direccion: "Av. Bernardo O'Higgins 1650, Chillán"
        },
        {
            nombre: "Restaurante 80's y Más",
            lat: -36.6227863,
            lng: -72.1326853,
            direccion: "Veinte de Agosto 446, Chillán"
        }

        // Agrega más restaurantes
    ];

    // Función para obtener dirección legible usando Nominatim
    function obtenerDireccionLegible(lat, lng) {
        return new Promise((resolve, reject) => {
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                .then(response => response.json())
                .then(data => {
                    if (data.display_name) {
                        resolve(data.display_name);
                    } else {
                        resolve(`${lat}, ${lng}`);
                    }
                })
                .catch(error => {
                    console.error("Error al obtener la dirección:", error);
                    resolve(`${lat}, ${lng}`);
                });
        });
    }

    // Añadir selector de restaurantes
    const selectRestaurantes = document.getElementById('selectRestaurantes');
    restaurantes.forEach(function (restaurante) {
        const option = document.createElement('option');
        option.value = `${restaurante.lat},${restaurante.lng}`;
        option.textContent = restaurante.nombre;
        selectRestaurantes.appendChild(option);
    });

    // Evento para selección rápida de restaurante
    selectRestaurantes.addEventListener('change', async function () {
        if (this.value) {
            const [lat, lng] = this.value.split(',').map(parseFloat);

            // Encontrar el restaurante seleccionado
            const restauranteSeleccionado = restaurantes.find(r => r.lat === lat && r.lng === lng);

            // Eliminar marcador de restaurante anterior si existe
            if (markerRestaurante) {
                map.removeLayer(markerRestaurante);
            }

            // Obtener dirección legible
            const direccionLegible = await obtenerDireccionLegible(lat, lng);

            markerRestaurante = L.marker([lat, lng]).addTo(map);
            latLngRestaurante = { lat, lng };

            // Usar la dirección del restaurante o la dirección legible
            document.getElementById('direccionRestaurante').value =
                restauranteSeleccionado.direccion || direccionLegible;

            // Centrar mapa en el restaurante seleccionado
            map.setView([lat, lng], 14);
        }
    });

    // Evento de clic en el mapa para obtener dirección del cliente
    map.on('click', async function (e) {
        if (!markerCliente) {
            // Obtener dirección legible
            const direccionLegible = await obtenerDireccionLegible(e.latlng.lat, e.latlng.lng);

            markerCliente = L.marker(e.latlng).addTo(map);
            latLngCliente = e.latlng;
            document.getElementById('direccionCliente').value = direccionLegible;
        } else if (!markerRestaurante) {
            // Obtener dirección legible
            const direccionLegible = await obtenerDireccionLegible(e.latlng.lat, e.latlng.lng);

            markerRestaurante = L.marker(e.latlng).addTo(map);
            latLngRestaurante = e.latlng;
            document.getElementById('direccionRestaurante').value = direccionLegible;
        }
    });
        
    document.getElementById('envioForm').addEventListener('submit', function (event) {
        event.preventDefault();
        

        // Parametros para el calculo
        // costo energia, costo drone, costo mantenimiento, 
        const costoEnergia = parseFloat(document.getElementById('costoEnergia').value);
        
        



        // Validación adicional antes de calcular
        if (isNaN(costoEnergia) || costoEnergia <= 0) {
            document.getElementById('resultado').innerText = 'Por favor, ingrese un costo de energía válido.';
            return;
        }

        if (latLngCliente && latLngRestaurante) {
            const distancia = map.distance(latLngCliente, latLngRestaurante) / 1000; // Convertir a kilómetros

            // Función polinómica para calcular el costo
            
            const costoEnvio = (costoEnergia * Math.pow(distancia , 2));
            

            document.getElementById('resultado').innerText = `El costo estimado del envío es: $${costoEnvio.toFixed()} CLP`;
        } else {
            document.getElementById('resultado').innerText = 'Por favor, selecciona ambas ubicaciones en el mapa.';
        }
    });

function reiniciarFormulario() {
    // Limpiar inputs
    document.getElementById('direccionCliente').value = '';
    document.getElementById('direccionRestaurante').value = '';
    document.getElementById('costoEnergia').value = '';
    document.getElementById('resultado').innerText = '';
    document.getElementById('selectRestaurantes').selectedIndex = 0;

    // Eliminar marcadores
    if (markerCliente) {
        map.removeLayer(markerCliente);
        markerCliente = null;
        latLngCliente = null;
    }

    if (markerRestaurante) {
        map.removeLayer(markerRestaurante);
        markerRestaurante = null;
        latLngRestaurante = null;
    }

    // Resetear vista del mapa
    map.setView([-36.6067, -72.1033], 12);
}

// Añadir evento al botón de reinicio
document.getElementById('btnReiniciar').addEventListener('click', reiniciarFormulario); 
});