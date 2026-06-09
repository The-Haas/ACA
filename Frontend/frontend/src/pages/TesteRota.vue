
<template>
  <q-page>
    <div ref="map" class="map-container"></div>
  </q-page>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import { Loading, Notify } from 'quasar'

export default {
  name: 'TesteRota',
  data() {
    return {
      map: null,
      routingControl: null,
      apiKey: 'dce8c549-78b0-41ec-9123-f68f939c2cda'
    }
  },

  mounted() {
    this.fixIcons()
    this.initMap()
  },

  methods: {
    fixIcons() {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    },

    initMap() {
      this.map = L.map(this.$refs.map).setView([0, 0], 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(this.map);

      this.getUserLocation();
    },

    getUserLocation() {
      Loading.show({ message: 'Obtendo GPS...' })
      if (!navigator.geolocation) {
        Loading.hide()
        return this.notifyError('GPS não disponível')
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.map.setView([latitude, longitude], 15);
          this.startRouting(latitude, longitude);
        },
        () => {
          Loading.hide()
          this.notifyError('Permissão de GPS negada')
        },
        { enableHighAccuracy: true }
      );
    },

    startRouting(lat, lng) {
      Loading.show({ message: 'Calculando rota...' })

      if (this.routingControl) {
        this.map.removeControl(this.routingControl);
      }

      const self = this;

      const CustomGraphHopperRouter = L.Class.extend({
        route: function (waypoints, callback, context) {
          const wpsQuery = waypoints.map(wp => `point=${wp.latLng.lat},${wp.latLng.lng}`).join('&');
          const url = `https://graphhopper.com/api/1/route?${wpsQuery}&vehicle=car&locale=pt&key=${self.apiKey}&type=json&points_encoded=false`;

          fetch(url)
            .then(res => res.json())
            .then(data => {
              if (data.message) throw new Error(data.message);

              const path = data.paths[0];
              const coordinates = path.points.coordinates.map(c => L.latLng(c[1], c[0]));

              const routes = [{
                name: 'Rota GraphHopper',
                summary: {
                  totalDistance: path.distance,
                  totalTime: path.time / 1000
                },
                coordinates: coordinates,
                waypoints: waypoints,
                actualWaypoints: waypoints,
                inputWaypoints: waypoints,
                instructions: path.instructions.map(inst => ({
                  distance: inst.distance,
                  time: inst.time / 1000,
                  text: inst.text,
                  type: 'Straight'
                }))
              }];

              callback.call(context, null, routes);
            })
            .catch(err => {
              console.error(err);
              callback.call(context, err);
            });
        }
      });

      this.routingControl = L.Routing.control({
        waypoints: [
          L.latLng(lat),, lng
          L.latLng(lat - 0.005, lng - 0.005)
        ],
        router: new CustomGraphHopperRouter(),
        lineOptions: {
          styles: [{ color: '#1976D2', weight: 6, opacity: 0.8 }]
        },
        // --- CONFIGURAÇÕES DE INTERAÇÃO ---
        addWaypoints: true,
        draggableWaypoints: true,
        routeWhileDragging: true,
        // ----------------------------------
        show: true,
        language: 'pt-BR'
      }).addTo(this.map);

      this.routingControl.on('routesfound', () => Loading.hide());
      this.routingControl.on('routingerror', (e) => {
        Loading.hide();
        console.error('Erro de Roteamento:', e);
        this.notifyError('Falha ao processar rota');
      });
    },

    notifyError(msg) {
      Notify.create({ type: 'negative', message: msg, position: 'top' })
    }
  },

  beforeUnmount() {
    if (this.map) this.map.remove();
  }
}
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100vh;
}

:deep(.leaflet-routing-container) {
  background: white;
  padding: 10px;
  max-height: 250px;
  overflow-y: auto;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}
</style>
