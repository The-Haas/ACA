<template>
  <q-page class="acompanhamento-page">

    <section class="status-grid">

      <q-card class="status-card status-card-red" flat>
        <div class="status-icon-white">
          <q-icon name="verified" size="26px" color="white" />
        </div>

        <div>
          <div class="status-title-white">
            Confirmação do Prestador
          </div>

          <div class="status-text-white">
            O serviço foi aceito e o prestador está a caminho.
          </div>
        </div>
      </q-card>

      <q-card class="status-card" flat>
        <div class="status-info">
          <div>
            <div class="status-label">
              Status Atual
            </div>

            <div class="status-current">
              <q-icon name="local_shipping" size="18px" color="red-14" />
              Prestador se dirigindo ao local
            </div>
          </div>

          <div class="time-box">
            <div class="time-label">
              Tempo estimado
            </div>

            <div class="time-value">
              {{ tempoEstimado }} min
            </div>
          </div>
        </div>
      </q-card>

    </section>

    <section class="map-section">
      <q-card class="map-card" flat>
        <div id="tracking-map" class="tracking-map"></div>

        <div class="map-controls">
          <q-btn
            round
            unelevated
            icon="my_location"
            color="white"
            text-color="grey-8"
            @click="centralizarMapa"
          >
            <q-tooltip>Centralizar mapa</q-tooltip>
          </q-btn>

          <q-btn
            round
            unelevated
            icon="layers"
            color="white"
            text-color="grey-8"
          >
            <q-tooltip>Camadas</q-tooltip>
          </q-btn>
        </div>

        <div class="address-card">
          <div class="address-icon">
            <q-icon name="place" size="24px" color="red-14" />
          </div>

          <div>
            <div class="address-title">
              Local do atendimento
            </div>

            <div class="address-text">
              Latitude: {{ latitudeFormatada }}
            </div>

            <div class="address-text">
              Longitude: {{ longitudeFormatada }}
            </div>

            <div class="address-link">
              Ver detalhes
              <q-icon name="open_in_new" size="13px" />
            </div>
          </div>
        </div>

        <div class="mechanic-card">
          <q-icon name="local_shipping" size="20px" color="red-14" />

          <div>
            <div class="mechanic-name">
              {{ orcamentoContratado.nome || 'Prestador selecionado' }}
            </div>

            <div class="mechanic-status">
              A caminho do local
            </div>
          </div>
        </div>
      </q-card>
    </section>

    <section class="summary-section">
      <q-card class="summary-card" flat>
        <div class="summary-title">
          Resumo do atendimento
        </div>

        <div class="summary-row">
          <span>Serviço solicitado</span>
          <strong>{{ servicoSelecionado.nome || 'Não informado' }}</strong>
        </div>

        <div class="summary-row">
          <span>Prestador contratado</span>
          <strong>{{ orcamentoContratado.nome || 'Não informado' }}</strong>
        </div>

        <div class="summary-row">
          <span>Valor contratado</span>
          <strong>{{ valorContratado }}</strong>
        </div>

        <div class="summary-row">
          <span>Tipo de local</span>
          <strong>{{ tipoLocalizacao.nome || 'Não informado' }}</strong>
        </div>

        <div class="summary-description">
          <div class="summary-description-title">
            Descrição do problema
          </div>

          <div class="summary-description-text">
            {{ descricaoProblema || 'Nenhuma descrição informada.' }}
          </div>
        </div>
      </q-card>
    </section>

    <section class="actions-section">
      <q-btn
        color="red-14"
        unelevated
        class="btn-avaliacao"
        @click="abrirAvaliacao"
      >
        <q-icon name="star" size="19px" class="q-mr-sm" />
        Avaliação / Finalizar
      </q-btn>
    </section>

    <q-dialog v-model="modalAvaliacao">
      <q-card class="avaliacao-card">
        <q-card-section class="text-center">
          <q-icon name="star" size="48px" color="amber-8" />

          <div class="text-h5 text-bold q-mt-md text-grey-9">
            Avaliar atendimento
          </div>

          <div class="text-grey-7 q-mt-sm">
            Como foi o atendimento recebido?
          </div>

          <q-rating
            v-model="avaliacao"
            size="36px"
            color="amber-8"
            icon="star_border"
            icon-selected="star"
            class="q-mt-md"
          />
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="comentario"
            outlined
            type="textarea"
            autogrow
            placeholder="Deixe um comentário sobre o atendimento..."
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            label="Cancelar"
            color="grey-8"
            v-close-popup
          />

          <q-btn
            unelevated
            label="Finalizar atendimento"
            color="red-14"
            @click="finalizarAtendimento"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const router = useRouter()

const map = ref(null)
const usuarioMarker = ref(null)
const mecanicoMarker = ref(null)
const linhaRota = ref(null)

const modalAvaliacao = ref(false)
const avaliacao = ref(0)
const comentario = ref('')
const tempoEstimado = ref(12)

const latitude = ref(-26.8468)
const longitude = ref(-52.9913)

const mecanicoLatitude = ref(-26.8428)
const mecanicoLongitude = ref(-52.9965)

const servicoSelecionado = ref({})
const tipoLocalizacao = ref({})
const descricaoProblema = ref('')
const orcamentoContratado = ref({})

const latitudeFormatada = computed(() => {
  return latitude.value ? Number(latitude.value).toFixed(6) : '-'
})

const longitudeFormatada = computed(() => {
  return longitude.value ? Number(longitude.value).toFixed(6) : '-'
})

const valorContratado = computed(() => {
  if (!orcamentoContratado.value.preco) {
    return 'Não informado'
  }

  return Number(orcamentoContratado.value.preco).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
})

const usuarioIcon = L.divIcon({
  className: 'custom-marker-user',
  html: `
    <div class="user-marker">
      <div class="user-marker-inner"></div>
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 22]
})

const mecanicoIcon = L.divIcon({
  className: 'custom-marker-mechanic',
  html: `
    <div class="mechanic-marker">
      <span class="material-icons">local_shipping</span>
    </div>
  `,
  iconSize: [46, 46],
  iconAnchor: [23, 23]
})

onMounted(async () => {
  carregarDadosSalvos()

  await nextTick()

  iniciarMapa()
})

onBeforeUnmount(() => {
  if (map.value) {
    map.value.remove()
    map.value = null
  }
})

function carregarDadosSalvos () {
  const localizacaoSalva = localStorage.getItem('localizacao_atendimento')
  const servicoSalvo = localStorage.getItem('servico_selecionado')
  const tipoSalvo = localStorage.getItem('tipo_localizacao')
  const descricaoSalva = localStorage.getItem('descricao_problema')
  const orcamentoSalvo = localStorage.getItem('orcamento_contratado')

  if (localizacaoSalva) {
    const localizacao = JSON.parse(localizacaoSalva)

    latitude.value = Number(localizacao.latitude)
    longitude.value = Number(localizacao.longitude)
  }

  if (servicoSalvo) {
    servicoSelecionado.value = JSON.parse(servicoSalvo)
  }

  if (tipoSalvo) {
    tipoLocalizacao.value = JSON.parse(tipoSalvo)
  }

  if (descricaoSalva) {
    descricaoProblema.value = descricaoSalva
  }

  if (orcamentoSalvo) {
    orcamentoContratado.value = JSON.parse(orcamentoSalvo)
    tempoEstimado.value = orcamentoContratado.value.tempo || 12
    definirLocalizacaoPrestador(orcamentoContratado.value)
  } else {
    orcamentoContratado.value = {
      id: 1,
      nome: 'Prestador selecionado',
      tempo: 12,
      preco: 0
    }

    definirLocalizacaoPrestador(orcamentoContratado.value)
  }
}

function definirLocalizacaoPrestador (orcamento) {
  const deslocamentos = {
    1: {
      lat: 0.006,
      lng: -0.006
    },
    2: {
      lat: -0.004,
      lng: 0.005
    },
    3: {
      lat: 0.003,
      lng: 0.004
    },
    4: {
      lat: -0.002,
      lng: -0.002
    }
  }

  const deslocamento = deslocamentos[orcamento.id] || deslocamentos[1]

  mecanicoLatitude.value = Number(latitude.value) + deslocamento.lat
  mecanicoLongitude.value = Number(longitude.value) + deslocamento.lng
}

function iniciarMapa () {
  map.value = L.map('tracking-map', {
    zoomControl: false
  }).setView([latitude.value, longitude.value], 15)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map.value)

  usuarioMarker.value = L.marker([latitude.value, longitude.value], {
    icon: usuarioIcon
  }).addTo(map.value)

  usuarioMarker.value.bindTooltip('Você está aqui', {
    permanent: true,
    direction: 'bottom',
    offset: [0, 20],
    className: 'custom-tooltip-user'
  })

  mecanicoMarker.value = L.marker([mecanicoLatitude.value, mecanicoLongitude.value], {
    icon: mecanicoIcon
  }).addTo(map.value)

  mecanicoMarker.value.bindTooltip(orcamentoContratado.value.nome || 'Prestador selecionado', {
    permanent: true,
    direction: 'bottom',
    offset: [0, 20],
    className: 'custom-tooltip-mechanic'
  })

  linhaRota.value = L.polyline([
    [latitude.value, longitude.value],
    [mecanicoLatitude.value, mecanicoLongitude.value]
  ], {
    color: '#df0000',
    weight: 4,
    opacity: 0.75,
    dashArray: '8, 8'
  }).addTo(map.value)

  centralizarMapa()

  setTimeout(() => {
    map.value.invalidateSize()
  }, 300)
}

function centralizarMapa () {
  if (!map.value) {
    return
  }

  const bounds = L.latLngBounds([
    [latitude.value, longitude.value],
    [mecanicoLatitude.value, mecanicoLongitude.value]
  ])

  map.value.fitBounds(bounds, {
    padding: [80, 80]
  })
}

function abrirAvaliacao () {
  modalAvaliacao.value = true
}

function finalizarAtendimento () {
  localStorage.setItem('avaliacao_atendimento', JSON.stringify({
    nota: avaliacao.value,
    comentario: comentario.value,
    prestador: orcamentoContratado.value
  }))

  localStorage.setItem('status_atendimento', 'finalizado')

  modalAvaliacao.value = false

  console.log('Atendimento finalizado:', {
    nota: avaliacao.value,
    comentario: comentario.value,
    prestador: orcamentoContratado.value
  })

  router.push('/home')
}
</script>

<style lang="scss">
.acompanhamento-page {
  min-height: calc(100vh - 150px);
  background:
    radial-gradient(circle at top left, rgba(224, 0, 0, 0.08), transparent 300px),
    #f4f5f8;
  padding: 28px 24px 115px;
}

.status-grid {
  max-width: 1120px;
  margin: 0 auto 22px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.status-card {
  background: #ffffff;
  border-radius: 16px;
  min-height: 88px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 8px 22px rgba(31, 41, 55, 0.08);
  border: 1px solid #edf0f4;
}

.status-card-red {
  background: #df0000;
}

.status-icon-white {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-title-white {
  color: #ffffff;
  font-size: 16px;
  font-weight: 900;
}

.status-text-white {
  color: rgba(255, 255, 255, 0.82);
  font-size: 13px;
  margin-top: 3px;
}

.status-info {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.status-label,
.time-label {
  color: #6b7280;
  font-size: 12px;
  font-weight: 700;
}

.status-current {
  color: #df0000;
  font-size: 15px;
  font-weight: 900;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.time-box {
  text-align: right;
}

.time-value {
  color: #1f2937;
  font-size: 22px;
  font-weight: 900;
  margin-top: 4px;
}

.map-section {
  max-width: 1120px;
  margin: 0 auto;
}

.map-card {
  position: relative;
  background: #ffffff;
  border-radius: 20px;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(31, 41, 55, 0.12);
  border: 1px solid #edf0f4;
}

.tracking-map {
  width: 100%;
  height: 430px;
  z-index: 1;
}

.map-controls {
  position: absolute;
  right: 18px;
  top: 18px;
  z-index: 500;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.address-card {
  position: absolute;
  left: 24px;
  bottom: 24px;
  z-index: 500;
  background: #ffffff;
  padding: 16px;
  border-radius: 15px;
  width: 315px;
  box-shadow: 0 12px 30px rgba(31, 41, 55, 0.22);
  display: flex;
  gap: 13px;
}

.address-icon {
  width: 54px;
  height: 54px;
  border-radius: 10px;
  background: #ffe1e1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.address-title {
  color: #1f2937;
  font-size: 15px;
  font-weight: 900;
}

.address-text {
  color: #6b7280;
  font-size: 12px;
  margin-top: 2px;
}

.address-link {
  color: #df0000;
  font-size: 12px;
  font-weight: 900;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 3px;
}

.mechanic-card {
  position: absolute;
  left: 50%;
  top: 35%;
  transform: translateX(-50%);
  z-index: 500;
  background: #ffffff;
  border-radius: 999px;
  padding: 8px 14px;
  box-shadow: 0 10px 24px rgba(31, 41, 55, 0.2);
  display: flex;
  align-items: center;
  gap: 8px;
}

.mechanic-name {
  color: #1f2937;
  font-size: 12px;
  font-weight: 900;
}

.mechanic-status {
  color: #6b7280;
  font-size: 10px;
}

.summary-section {
  max-width: 1120px;
  margin: 22px auto 0;
}

.summary-card {
  background: #ffffff;
  border-radius: 18px;
  padding: 20px;
  border: 1px solid #edf0f4;
  box-shadow: 0 8px 22px rgba(31, 41, 55, 0.07);
}

.summary-title {
  color: #1f2937;
  font-size: 18px;
  font-weight: 900;
  margin-bottom: 14px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid #edf0f4;
  padding: 10px 0;
  color: #6b7280;
}

.summary-row strong {
  color: #1f2937;
  text-align: right;
}

.summary-description {
  margin-top: 14px;
}

.summary-description-title {
  color: #1f2937;
  font-weight: 900;
  margin-bottom: 6px;
}

.summary-description-text {
  color: #6b7280;
  line-height: 1.5;
}

.actions-section {
  max-width: 1120px;
  margin: 28px auto 0;
  text-align: center;
}

.btn-avaliacao {
  width: 280px;
  max-width: 100%;
  border-radius: 9px;
  font-weight: 900;
  padding: 12px;
  box-shadow: 0 8px 18px rgba(223, 0, 0, 0.24);
}

.avaliacao-card {
  width: 100%;
  max-width: 430px;
  border-radius: 20px;
}

.custom-marker-user,
.custom-marker-mechanic {
  background: transparent;
  border: none;
}

.user-marker {
  width: 44px;
  height: 44px;
  background: rgba(25, 118, 210, 0.18);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse-user 1.6s infinite;
}

.user-marker-inner {
  width: 24px;
  height: 24px;
  background: #1976d2;
  border: 4px solid #ffffff;
  border-radius: 50%;
  box-shadow: 0 6px 16px rgba(25, 118, 210, 0.35);
}

.mechanic-marker {
  width: 46px;
  height: 46px;
  background: #df0000;
  border: 4px solid #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(223, 0, 0, 0.35);
}

.mechanic-marker .material-icons {
  font-size: 23px;
}

.custom-tooltip-user,
.custom-tooltip-mechanic {
  border: none;
  border-radius: 999px;
  padding: 5px 10px;
  font-weight: 800;
  font-size: 11px;
  box-shadow: 0 6px 16px rgba(31, 41, 55, 0.18);
}

.custom-tooltip-user {
  color: #1976d2;
}

.custom-tooltip-mechanic {
  color: #df0000;
}

@keyframes pulse-user {
  0% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.25);
  }

  70% {
    box-shadow: 0 0 0 12px rgba(25, 118, 210, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
  }
}

@media (max-width: 850px) {
  .status-grid {
    grid-template-columns: 1fr;
  }

  .tracking-map {
    height: 380px;
  }

  .address-card {
    position: static;
    width: auto;
    margin: 14px;
  }

  .mechanic-card {
    left: 50%;
    top: 28%;
  }
}

@media (max-width: 600px) {
  .acompanhamento-page {
    padding: 105px 16px 115px;
  }

  .status-card {
    padding: 16px;
  }

  .status-info {
    align-items: flex-start;
    gap: 14px;
  }

  .time-value {
    font-size: 18px;
  }

  .tracking-map {
    height: 340px;
  }

  .summary-row {
    flex-direction: column;
  }

  .summary-row strong {
    text-align: left;
  }
}
</style>