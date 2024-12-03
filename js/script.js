const app = Vue.createApp({
    data() {
      return {
        comics: [], // Todos los cómics recuperados desde la API
        personajes: [], // Lista de personajes disponibles en los primeros 20 cómics
        personajeSeleccionado: '', // El personaje seleccionado por el usuario
        apiKey: 'aac416b06fdae13bc9c9ea089e068462',
        privateKey: '43efe6b37bb09cf3d2dbb1d7e9b5b8a2f0449012',
        busqueda: '', // Aquí se guarda el texto de búsqueda
        porcentaje: 0, // Progreso de carga
        color: 'bg-success', // Color de la barra de progreso
      };
    },
    methods: {
      cargarComics() {
        const ts = new Date().getTime();
        const hash = CryptoJS.MD5(ts + this.privateKey + this.apiKey).toString();
        axios
          .get('https://gateway.marvel.com/v1/public/comics', {
            params: {
              ts: ts,
              apikey: this.apiKey,
              hash: hash,
              limit: 50, // Solo obtener los primeros 50 cómics
            },
          })
          .then(response => {
            this.comics = response.data.data.results.map(comic => ({
              id: comic.id,
              title: comic.title,
              description: comic.description || 'Sin descripción disponible',
              thumbnail: `${comic.thumbnail.path}.${comic.thumbnail.extension}`,
              price: comic.prices[0].price || 'Precio no disponible',
              characters: comic.characters.items.map(character => character.name),
              date: comic.dates[0].date.split('T')[0], // Fecha de publicación
            }));
  
            // Cargar personajes filtrados
            this.cargarPersonajes();
            this.actualizarBarraProgreso();  // Actualizamos la barra de progreso al cargar los cómics
          })
          .catch(error => {
            console.error('Error al cargar los cómics:', error);
          });
      },
  
      cargarPersonajes() {
        // Crear un conjunto único de personajes a partir de los cómics cargados
        let personajesSet = new Set();
        this.comics.forEach(comic => {
          comic.characters.forEach(character => {
            personajesSet.add(character);
          });
        });
  
        // Convertir el set en un array
        this.personajes = Array.from(personajesSet).map(personaje => ({
          name: personaje,
          id: personaje.toLowerCase().replace(/ /g, '-'),
        }));
      },
  
      // Método para filtrar por personaje
      filtrarPorPersonaje(personaje) {
        this.personajeSeleccionado = personaje;
        this.actualizarBarraProgreso();  // Actualizamos la barra de progreso cuando el personaje se filtra
      },
  
      // Actualizar la barra de progreso según los cómics mostrados
      actualizarBarraProgreso() {
        const totalComics = this.comics.length; // Total de cómics cargados
        if (totalComics === 0) return; // Si no hay cómics, no actualizar la barra de progreso
  
        const comicsFiltrados = this.buscarComic.length; // Cómiocs mostrados tras los filtros
  
        // Calcula el porcentaje de cómics mostrados
        this.porcentaje = (comicsFiltrados / totalComics) * 100;
  
        // Ajusta el color dependiendo del porcentaje
        if (this.porcentaje < 30) {
          this.color = 'bg-danger'; // Rojo si el porcentaje es menor al 30%
        } else if (this.porcentaje < 70) {
          this.color = 'bg-warning'; // Amarillo si está entre 30% y 70%
        } else {
          this.color = 'bg-success'; // Verde si está por encima del 70%
        }
      },
    },
    created() {
      this.cargarComics(); // Cargar cómics al iniciar
    },
    computed: {
      // Filtro de búsqueda por título de cómic
      buscarComic() {
        let comicsFiltrados = this.comics;
  
        // Filtro por personaje seleccionado
        if (this.personajeSeleccionado) {
          comicsFiltrados = comicsFiltrados.filter(comic =>
            comic.characters.includes(this.personajeSeleccionado)
          );
        }
  
        // Filtro de búsqueda por título
        if (this.busqueda) {
          comicsFiltrados = comicsFiltrados.filter(comic =>
            comic.title.toUpperCase().includes(this.busqueda.toUpperCase())
          );
        }
  
        // Actualizar la barra de progreso cada vez que cambian los cómics filtrados
        this.actualizarBarraProgreso();
  
        return comicsFiltrados;
      },
  
      // Número de cómics encontrados
      comicsEncontrados() {
        return this.buscarComic.length;
      },
  
      // Personajes filtrados (de los primeros 20 cómics)
      personajesFiltrados() {
        return this.personajes;
      },
    },
  });
  
  app.mount('#app');
  