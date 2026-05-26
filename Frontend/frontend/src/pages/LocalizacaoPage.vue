<template>
  <q-page class="localizacao-page">

    <section class="localizacao-hero">
      <div class="localizacao-badge">
        Aqui você vai precisar compartilhar a sua localização
      </div>

      <p class="localizacao-description">
        Para que possamos enviar ajuda o mais rápido possível.
      </p>
    </section>

    <section class="map-wrapper">
      <q-card class="map-card" flat>
        <div class="map-header">
          <div>
            <div class="map-title">
              Sua localização atual
            </div>

            <div class="map-subtitle">
              O ponto no mapa será fixado automaticamente conforme sua localização.
            </div>
          </div>

          <q-btn
            round
            flat
            icon="my_location"
            color="red-14"
            :loading="carregando"
            @click="buscarLocalizacaoAtual"
          >
            <q-tooltip>Atualizar localização</q-tooltip>
          </q-btn>
        </div>

        <div id="map" class="map-container"></div>

        <div class="location-card">
          <div class="location-icon">
            <q-icon name="place" size="30px" color="white" />
          </div>

          <div class="location-info">
            <div class="location-title">
              Localização confirmada
            </div>

            <div class="location-text">
              Latitude: {{ latitudeFormatada }}
            </div>

            <div class="location-text">
              Longitude: {{ longitudeFormatada }}
            </div>
          </div>
        </div>
      </q-card>
    </section>

    <section class="actions-section">
      <q-btn
        label="Continuar"
        color="red-14"
        unelevated
        class="btn-continuar"
        :loading="carregando"
        @click="continuar"
      />

      <q-btn
        label="Voltar"
        flat
        no-caps
        color="grey-8"
        class="q-mt-sm"
        @click="voltar"
      />
    </section>

  </q-page>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const router = useRouter()

const carregando = ref(false)
const map = ref(null)
const marker = ref(null)

const latitude = ref(-26.8468)
const longitude = ref(-52.9913)

const latitudeFormatada = computed(() => {
  return latitude.value ? latitude.value.toFixed(6) : '-'
})

const longitudeFormatada = computed(() => {
  return longitude.value ? longitude.value.toFixed(6) : '-'
})

const marcadorUsuario = L.divIcon({
  className: 'custom-user-marker',
  html: `
    <div class="marker-pin">
      <div class="marker-dot"></div>
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 22]
})

onMounted(async () => {
  await nextTick()
  iniciarMapa()
  buscarLocalizacaoAtual()
})

onBeforeUnmount(() => {
  if (map.value) {
    map.value.remove()
    map.value = null
  }
})

function iniciarMapa () {
  map.value = L.map('map', {
    zoomControl: false
  }).setView([latitude.value, longitude.value], 15)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map.value)

  L.control.zoom({
    position: 'topright'
  }).addTo(map.value)

  marker.value = L.marker([latitude.value, longitude.value], {
    icon: marcadorUsuario,
    draggable: false
  }).addTo(map.value)

  setTimeout(() => {
    map.value.invalidateSize()
  }, 300)
}

function buscarLocalizacaoAtual () {
  carregando.value = true

  if (!navigator.geolocation) {
    carregando.value = false
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      latitude.value = position.coords.latitude
      longitude.value = position.coords.longitude

      atualizarMarcador()

      carregando.value = false
    },
    () => {
      carregando.value = false
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  )
}

function atualizarMarcador () {
  if (!map.value || !marker.value) {
    return
  }

  const novaPosicao = [latitude.value, longitude.value]

  marker.value.setLatLng(novaPosicao)

  map.value.setView(novaPosicao, 16, {
    animate: true
  })
}

function continuar () {
  localStorage.setItem('localizacao_atendimento', JSON.stringify({
    latitude: latitude.value,
    longitude: longitude.value
  }))

  console.log('Localização salva:', {
    latitude: latitude.value,
    longitude: longitude.value
  })

  router.push('/home/tipo-localizacao')
}

function voltar () {
  router.push('/home')
}
</script>

<style lang="scss">
.localizacao-page {
  min-height: calc(100vh - 150px);
  background:
    radial-gradient(circle at top left, rgba(224, 0, 0, 0.08), transparent 300px),
    #f4f5f8;
  padding: 70px 24px 115px;
}

.localizacao-hero {
  text-align: center;
  max-width: 850px;
  margin: 0 auto 28px;
}

.localizacao-badge {
  display: inline-block;
  background: #df0000;
  color: #ffffff;
  padding: 16px 38px;
  border-radius: 10px;
  font-size: 21px;
  font-weight: 900;
  box-shadow: 0 10px 22px rgba(223, 0, 0, 0.24);
}

.localizacao-description {
  margin: 10px auto 0;
  color: #6b7280;
  font-size: 15px;
}

.map-wrapper {
  max-width: 760px;
  margin: 0 auto;
}

.map-card {
  background: #ffffff;
  border-radius: 22px;
  padding: 18px;
  border: 1px solid #edf0f4;
  box-shadow: 0 12px 30px rgba(31, 41, 55, 0.12);
  position: relative;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.map-title {
  font-size: 18px;
  font-weight: 900;
  color: #1f2937;
}

.map-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin-top: 2px;
}

.map-container {
  width: 100%;
  height: 420px;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  z-index: 1;
}

.location-card {
  position: absolute;
  right: 34px;
  bottom: 34px;
  background: #ffffff;
  border-radius: 16px;
  padding: 14px 16px;
  box-shadow: 0 12px 30px rgba(31, 41, 55, 0.2);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 500;
  min-width: 270px;
}

.location-icon {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #df0000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.location-title {
  font-size: 14px;
  font-weight: 900;
  color: #1f2937;
}

.location-text {
  font-size: 12px;
  color: #6b7280;
}

.actions-section {
  max-width: 760px;
  margin: 24px auto 0;
  text-align: center;
}

.btn-continuar {
  width: 320px;
  max-width: 100%;
  border-radius: 8px;
  font-weight: 900;
  padding: 12px;
  box-shadow: 0 8px 18px rgba(223, 0, 0, 0.24);
}

.leaflet-container {
  font-family: inherit;
}

.leaflet-control-attribution {
  font-size: 10px;
}

.custom-user-marker {
  background: transparent;
  border: none;
}

.marker-pin {
  width: 44px;
  height: 44px;
  background: rgba(223, 0, 0, 0.18);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.marker-pin::before {
  content: "";
  width: 26px;
  height: 26px;
  background: #df0000;
  border: 4px solid #ffffff;
  border-radius: 50%;
  box-shadow: 0 6px 16px rgba(223, 0, 0, 0.35);
}

.marker-dot {
  width: 10px;
  height: 10px;
  background: #ffffff;
  border-radius: 50%;
  position: absolute;
}

@media (max-width: 700px) {
  .localizacao-page {
    padding: 105px 16px 110px;
  }

  .localizacao-badge {
    font-size: 17px;
    padding: 14px 22px;
  }

  .map-card {
    padding: 14px;
  }

  .map-container {
    height: 360px;
  }

  .location-card {
    position: static;
    margin-top: 14px;
    min-width: auto;
  }

  .map-header {
    align-items: flex-start;
    gap: 10px;
  }
}
</style>