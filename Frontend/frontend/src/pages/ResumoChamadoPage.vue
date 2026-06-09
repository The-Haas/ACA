<template>
  <q-page class="resumo-page">

    <section class="resumo-container">

      <div class="resumo-header">
        <h1 class="resumo-title">
          Resumo do Chamado
        </h1>

        <p class="resumo-description">
          Verifique os detalhes da sua solicitação antes de prosseguir para os orçamentos.
        </p>
      </div>

      <div class="resumo-content">

        <aside class="steps-area">
          <q-card class="steps-card" flat>
            <div class="steps-title">
              Etapas
            </div>

            <div class="step-item step-done">
              <div class="step-circle">
                <q-icon name="check" size="15px" />
              </div>
              <span>Serviço</span>
            </div>

            <div class="step-item step-done">
              <div class="step-circle">
                <q-icon name="check" size="15px" />
              </div>
              <span>Localização</span>
            </div>

            <div class="step-item step-done">
              <div class="step-circle">
                <q-icon name="check" size="15px" />
              </div>
              <span>Local da remoção</span>
            </div>

            <div class="step-item step-active">
              <div class="step-circle">
                4
              </div>
              <span>Resumo</span>
            </div>

            <div class="step-item">
              <div class="step-circle">
                5
              </div>
              <span>Orçamentos</span>
            </div>

            <div class="step-item">
              <div class="step-circle">
                6
              </div>
              <span>Confirmação</span>
            </div>
          </q-card>

          <q-card class="help-card" flat>
            <q-icon name="support_agent" size="26px" color="blue-7" />

            <div>
              <div class="help-title">
                Precisa de ajuda?
              </div>

              <div class="help-text">
                Ligue para nossa central 0800 123 4567 ou fale pelo WhatsApp.
              </div>
            </div>
          </q-card>
        </aside>

        <main class="cards-area">

          <q-card class="info-card" flat>
            <div class="info-icon red-soft">
              <q-icon name="build" size="25px" color="red-14" />
            </div>

            <div class="info-main">
              <div class="info-label">
                Serviço solicitado
              </div>

              <div class="info-title">
                {{ servico.nome || 'Não informado' }}
              </div>

              <div class="info-subtitle">
                {{ servico.descricao || 'Serviço selecionado pelo cliente.' }}
              </div>
            </div>

            <q-btn
              round
              flat
              icon="edit"
              color="grey-6"
              @click="router.push('/home')"
            >
              <q-tooltip>Alterar serviço</q-tooltip>
            </q-btn>
          </q-card>

          <q-card class="info-card" flat>
            <div class="info-icon orange-soft">
              <q-icon name="place" size="25px" color="orange-8" />
            </div>

            <div class="info-main">
              <div class="info-label">
                Local de atendimento
              </div>

              <div class="info-title">
                Localização atual informada
              </div>

              <div class="info-subtitle">
                Latitude: {{ latitudeFormatada }} | Longitude: {{ longitudeFormatada }}
              </div>
            </div>

            <q-btn
              round
              flat
              icon="edit"
              color="grey-6"
              @click="router.push('/home/localizacao')"
            >
              <q-tooltip>Alterar localização</q-tooltip>
            </q-btn>
          </q-card>

          <q-card class="info-card" flat>
            <div class="info-icon warning-soft">
              <q-icon name="report_problem" size="25px" color="orange-8" />
            </div>

            <div class="info-main">
              <div class="info-label">
                Local da remoção
              </div>

              <div class="info-title">
                {{ tipoLocalizacao.nome || 'Não informado' }}
              </div>

              <div class="info-subtitle">
                {{ tipoLocalizacao.descricao || 'Tipo de local ainda não informado.' }}
              </div>
            </div>

            <q-btn
              round
              flat
              icon="edit"
              color="grey-6"
              @click="router.push('/home/tipo-localizacao')"
            >
              <q-tooltip>Alterar local da remoção</q-tooltip>
            </q-btn>
          </q-card>

          <q-card class="info-card" flat>
            <div class="info-icon blue-soft">
              <q-icon name="description" size="25px" color="blue-7" />
            </div>

            <div class="info-main">
              <div class="info-label">
                Descrição do problema
              </div>

              <div class="info-title">
                Observações do cliente
              </div>

              <div class="info-subtitle descricao-texto">
                {{ descricaoProblema || 'Nenhuma descrição informada.' }}
              </div>
            </div>

            <q-btn
              round
              flat
              icon="edit"
              color="grey-6"
              @click="router.push('/home/descricao-problema')"
            >
              <q-tooltip>Alterar descrição</q-tooltip>
            </q-btn>
          </q-card>

          <q-btn
            color="red-14"
            unelevated
            class="btn-precos"
            @click="verPrecos"
          >
            Ver Preços Disponíveis
            <q-icon name="arrow_forward" size="18px" class="q-ml-sm" />
          </q-btn>

          <div class="precos-info">
            Ao clicar, você verá as opções de serviço disponíveis para sua região.
          </div>

        </main>

      </div>

    </section>

  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const servico = ref({})
const tipoLocalizacao = ref({})
const descricaoProblema = ref('')
const latitude = ref(null)
const longitude = ref(null)

const latitudeFormatada = computed(() => {
  return latitude.value ? Number(latitude.value).toFixed(6) : '-'
})

const longitudeFormatada = computed(() => {
  return longitude.value ? Number(longitude.value).toFixed(6) : '-'
})

onMounted(() => {
  carregarDados()
})

function carregarDados () {
  const servicoSalvo = localStorage.getItem('servico_selecionado')
  const tipoSalvo = localStorage.getItem('tipo_localizacao')
  const descricaoSalva = localStorage.getItem('descricao_problema')
  const localizacaoSalva = localStorage.getItem('localizacao_atendimento')

  if (servicoSalvo) {
    servico.value = JSON.parse(servicoSalvo)
  }

  if (tipoSalvo) {
    tipoLocalizacao.value = JSON.parse(tipoSalvo)
  }

  if (descricaoSalva) {
    descricaoProblema.value = descricaoSalva
  }

  if (localizacaoSalva) {
    const localizacao = JSON.parse(localizacaoSalva)
    latitude.value = localizacao.latitude
    longitude.value = localizacao.longitude
  }
}

function verPrecos () {
  router.push('/home/orcamentos')
}
</script>

<style lang="scss">
.resumo-page {
  min-height: calc(100vh - 150px);
  background:
    radial-gradient(circle at top left, rgba(224, 0, 0, 0.07), transparent 320px),
    #f4f5f8;
  padding: 58px 24px 115px;
}

.resumo-container {
  max-width: 980px;
  margin: 0 auto;
}

.resumo-header {
  margin-bottom: 26px;
}

.resumo-title {
  margin: 0;
  color: #1f2937;
  font-size: 32px;
  font-weight: 900;
}

.resumo-description {
  margin: 8px 0 0;
  color: #6b7280;
  font-size: 15px;
}

.resumo-content {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 24px;
  align-items: start;
}

.steps-card {
  background: #ffffff;
  border-radius: 18px;
  padding: 20px;
  border: 1px solid #edf0f4;
  box-shadow: 0 8px 22px rgba(31, 41, 55, 0.07);
}

.steps-title {
  color: #1f2937;
  font-weight: 900;
  font-size: 15px;
  margin-bottom: 18px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 11px;
  color: #9ca3af;
  font-weight: 700;
  font-size: 13px;
  margin-bottom: 16px;
}

.step-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #edf0f4;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
}

.step-done {
  color: #6b7280;
}

.step-done .step-circle {
  background: #dcfce7;
  color: #22c55e;
}

.step-active {
  color: #df0000;
}

.step-active .step-circle {
  background: #df0000;
  color: #ffffff;
}

.help-card {
  background: #eff6ff;
  border: 1px solid #dbeafe;
  border-radius: 16px;
  margin-top: 18px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 11px;
}

.help-title {
  color: #1d4ed8;
  font-size: 14px;
  font-weight: 900;
}

.help-text {
  color: #2563eb;
  font-size: 12px;
  line-height: 1.4;
  margin-top: 3px;
}

.cards-area {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  background: #ffffff;
  border-radius: 18px;
  padding: 18px;
  border: 1px solid #edf0f4;
  box-shadow: 0 8px 22px rgba(31, 41, 55, 0.07);
  display: grid;
  grid-template-columns: 54px 1fr 42px;
  align-items: center;
  gap: 14px;
  transition: all 0.2s ease;
}

.info-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 30px rgba(31, 41, 55, 0.12);
}

.info-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.red-soft {
  background: #ffe1e1;
}

.orange-soft {
  background: #ffedd5;
}

.warning-soft {
  background: #fef3c7;
}

.blue-soft {
  background: #dbeafe;
}

.info-label {
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-size: 11px;
  font-weight: 900;
  margin-bottom: 4px;
}

.info-title {
  color: #1f2937;
  font-size: 17px;
  font-weight: 900;
}

.info-subtitle {
  color: #6b7280;
  font-size: 13px;
  margin-top: 3px;
  line-height: 1.4;
}

.descricao-texto {
  max-width: 520px;
}

.btn-precos {
  margin: 12px auto 0;
  width: 100%;
  max-width: 520px;
  border-radius: 10px;
  padding: 13px;
  font-weight: 900;
  box-shadow: 0 8px 18px rgba(223, 0, 0, 0.24);
}

.precos-info {
  color: #9ca3af;
  text-align: center;
  font-size: 12px;
  margin-top: -5px;
}

@media (max-width: 850px) {
  .resumo-content {
    grid-template-columns: 1fr;
  }

  .steps-area {
    order: 2;
  }

  .cards-area {
    order: 1;
  }
}

@media (max-width: 600px) {
  .resumo-page {
    padding: 105px 16px 115px;
  }

  .resumo-title {
    font-size: 26px;
  }

  .resumo-description {
    font-size: 14px;
  }

  .info-card {
    grid-template-columns: 44px 1fr;
  }

  .info-card .q-btn {
    grid-column: 1 / -1;
    justify-self: flex-end;
  }

  .info-icon {
    width: 42px;
    height: 42px;
  }
}
</style>