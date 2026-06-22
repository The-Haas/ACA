<template>
  <q-page class="home-page">

    <section class="home-hero">
      <div class="service-badge">
        Escolha o serviço que precisa
      </div>

      <h1 class="home-title">
        Atendimento rápido para o seu veículo
      </h1>

      <p class="home-description">
        Selecione abaixo a opção que melhor descreve o seu problema.
        Assim podemos encaminhar o profissional mais adequado até você.
      </p>
    </section>

    <!-- Carregando -->
    <div v-if="carregando" class="carregando-container">
      <q-spinner-dots color="red-14" size="50px" />
      <div class="carregando-texto">Carregando serviços...</div>
    </div>

    <!-- Cards de serviços -->
    <section v-else class="services-grid">
      <q-card
        v-for="servico in servicos"
        :key="servico.id"
        class="service-card cursor-pointer"
        flat
        @click="selecionarServico(servico)"
      >
        <q-card-section class="service-content">
          <div class="service-icon">
            <q-icon :name="iconeServico(servico.nome)" size="42px" color="red-14" />
          </div>

          <div class="service-name">
            {{ servico.nome }}
          </div>

          <div class="service-text">
            {{ servico.descricao || descricaoServico(servico.nome) }}
          </div>
        </q-card-section>
      </q-card>
    </section>

    <!-- Aviso de fallback -->
    <div v-if="!carregando && usandoFallback" class="fallback-aviso">
      <q-icon name="wifi_off" size="18px" />
      Servidor indisponível — exibindo serviços padrão.
    </div>

    <section class="help-section">
      <q-card class="help-card" flat>
        <q-icon name="schedule" size="34px" color="red-14" />
        <div>
          <div class="help-title">Atendimento 24 horas</div>
          <div class="help-text">Solicite ajuda quando precisar.</div>
        </div>
      </q-card>

      <q-card class="help-card" flat>
        <q-icon name="verified_user" size="34px" color="red-14" />
        <div>
          <div class="help-title">Serviço mais seguro</div>
          <div class="help-text">Profissionais cadastrados na plataforma.</div>
        </div>
      </q-card>

      <q-card class="help-card" flat>
        <q-icon name="place" size="34px" color="red-14" />
        <div>
          <div class="help-title">Localização facilitada</div>
          <div class="help-text">Informe onde está e receba atendimento.</div>
        </div>
      </q-card>
    </section>

    <q-dialog v-model="modalServico">
      <q-card class="dialog-card">
        <q-card-section class="text-center">
          <div class="dialog-icon">
            <q-icon :name="iconeServico(servicoSelecionado.nome)" size="46px" color="red-14" />
          </div>

          <div class="text-h5 text-bold q-mt-md text-grey-9">
            {{ servicoSelecionado.nome }}
          </div>

          <div class="text-grey-7 q-mt-sm">
            {{ servicoSelecionado.descricao || descricaoServico(servicoSelecionado.nome) }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-banner rounded class="bg-red-1 text-red-10">
            Você selecionou este serviço. Na próxima etapa, será necessário
            compartilhar sua localização para encontrarmos um profissional próximo.
          </q-banner>
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
            label="Continuar"
            color="red-14"
            @click="continuarServico"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'src/boot/axios'

const router = useRouter()

const modalServico = ref(false)
const carregando = ref(false)
const usandoFallback = ref(false)
const servicos = ref([])

const servicosFallback = [
  { id: 1, nome: 'Guincho' },
  { id: 2, nome: 'Troca de Pneu' },
  { id: 3, nome: 'Chaveiro' },
  { id: 4, nome: 'Pane Seca' },
  { id: 5, nome: 'Mecânico' },
  { id: 6, nome: 'Recarga de Bateria' }
]

const servicoSelecionado = ref({
  id: null,
  nome: '',
  descricao: ''
})

// Mapa de ícones por nome do serviço (busca parcial, case-insensitive)
const mapaIcones = [
  { palavras: ['guincho', 'reboque', 'remoção'], icone: 'local_shipping' },
  { palavras: ['pneu', 'borracha', 'troca'], icone: 'tire_repair' },
  { palavras: ['chaveiro', 'chave', 'abertura'], icone: 'vpn_key' },
  { palavras: ['combustível', 'pane seca', 'gasolina', 'abastec'], icone: 'local_gas_station' },
  { palavras: ['mecâni', 'mecani', 'motor', 'falha'], icone: 'build' },
  { palavras: ['bateria', 'recarga', 'elétri'], icone: 'battery_charging_full' },
  { palavras: ['vidro', 'parabrisa'], icone: 'window' },
  { palavras: ['teste'], icone: 'settings' }
]

function iconeServico (nome) {
  if (!nome) return 'car_repair'
  const nomeLower = nome.toLowerCase()
  for (const item of mapaIcones) {
    if (item.palavras.some(p => nomeLower.includes(p))) {
      return item.icone
    }
  }
  return 'car_repair'
}

function descricaoServico (nome) {
  if (!nome) return ''
  const nomeLower = nome.toLowerCase()
  if (nomeLower.includes('guincho')) return 'Transporte ou remoção do veículo.'
  if (nomeLower.includes('pneu')) return 'Ajuda rápida em caso de pneu furado.'
  if (nomeLower.includes('chaveiro')) return 'Problemas com chave ou abertura do veículo.'
  if (nomeLower.includes('pane') || nomeLower.includes('combustível')) return 'Auxílio em caso de falta de combustível.'
  if (nomeLower.includes('mecâni') || nomeLower.includes('mecani')) return 'Suporte para falhas e problemas mecânicos.'
  if (nomeLower.includes('bateria')) return 'Ajuda para bateria fraca ou descarregada.'
  if (nomeLower.includes('elétri')) return 'Suporte para problemas elétricos.'
  if (nomeLower.includes('borracha')) return 'Serviços de borracharia.'
  return 'Serviço especializado para o seu veículo.'
}

onMounted(() => {
  carregarServicos()
})

async function carregarServicos () {
  carregando.value = true

  try {
    const response = await api.get('/categoriaservico')

    // o controller retorna o array direto
    if (Array.isArray(response.data)) {
      servicos.value = response.data
    } else if (response.data.categorias) {
      servicos.value = response.data.categorias
    }
  } catch (err) {
    console.error('Erro ao carregar serviços:', err)
    servicos.value = servicosFallback
    usandoFallback.value = true
  } finally {
    carregando.value = false
  }
}

function selecionarServico (servico) {
  servicoSelecionado.value = servico
  modalServico.value = true
}

function continuarServico () {
  localStorage.setItem('servico_selecionado', JSON.stringify(servicoSelecionado.value))
  modalServico.value = false
  router.push('/home/localizacao')
}
</script>

<style lang="scss">
.home-page {
  min-height: calc(100vh - 150px);
  background:
    radial-gradient(circle at top left, rgba(224, 0, 0, 0.08), transparent 300px),
    #f4f5f8;
  padding: 78px 24px 115px;
}

.home-hero {
  text-align: center;
  max-width: 760px;
  margin: 0 auto 44px;
}

.service-badge {
  display: inline-block;
  background: #df0000;
  color: #ffffff;
  padding: 15px 36px;
  border-radius: 999px;
  font-size: 20px;
  font-weight: 900;
  box-shadow: 0 10px 20px rgba(223, 0, 0, 0.25);
  transform: rotate(-1deg);
}

.home-title {
  margin: 28px 0 12px;
  font-size: 38px;
  font-weight: 900;
  color: #1f2937;
  line-height: 1.15;
}

.home-description {
  max-width: 660px;
  margin: 0 auto;
  color: #6b7280;
  font-size: 17px;
  line-height: 1.6;
}

.carregando-container {
  text-align: center;
  padding: 60px 20px;
}

.carregando-texto {
  color: #6b7280;
  margin-top: 16px;
  font-size: 15px;
}

.services-grid {
  max-width: 1050px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 26px;
}

.service-card {
  min-height: 210px;
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid #edf0f4;
  box-shadow: 0 9px 24px rgba(31, 41, 55, 0.08);
  overflow: hidden;
  position: relative;
  transition: all 0.25s ease;
}

.service-card::before {
  content: "";
  width: 0;
  height: 5px;
  background: #df0000;
  position: absolute;
  top: 0;
  left: 0;
  transition: width 0.25s ease;
}

.service-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 18px 38px rgba(31, 41, 55, 0.15);
}

.service-card:hover::before {
  width: 100%;
}

.service-content {
  min-height: 210px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  text-align: center;
}

.service-icon {
  width: 78px;
  height: 78px;
  border-radius: 50%;
  background: #ffe1e1;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 6px;
}

.service-name {
  font-size: 21px;
  font-weight: 900;
  color: #1f2937;
}

.service-text {
  font-size: 14px;
  color: #6b7280;
  max-width: 230px;
  line-height: 1.4;
}

.help-section {
  max-width: 1050px;
  margin: 42px auto 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.help-card {
  background: #ffffff;
  border-radius: 18px;
  padding: 18px;
  border: 1px solid #edf0f4;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 6px 18px rgba(31, 41, 55, 0.05);
}

.help-title {
  font-size: 15px;
  font-weight: 900;
  color: #1f2937;
}

.help-text {
  font-size: 13px;
  color: #6b7280;
}

.fallback-aviso {
  max-width: 1050px;
  margin: 16px auto 0;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff8e1;
  border: 1px solid #ffe082;
  color: #7a5c00;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 600;
}

.dialog-card {
  width: 100%;
  max-width: 430px;
  border-radius: 20px;
}

.dialog-icon {
  width: 86px;
  height: 86px;
  background: #ffe1e1;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
}

@media (max-width: 900px) {
  .services-grid,
  .help-section {
    grid-template-columns: repeat(2, 1fr);
  }

  .home-title {
    font-size: 31px;
  }
}

@media (max-width: 600px) {
  .home-page {
    padding: 105px 16px 110px;
  }

  .service-badge {
    font-size: 16px;
    padding: 12px 22px;
  }

  .home-title {
    font-size: 27px;
  }

  .home-description {
    font-size: 15px;
  }

  .services-grid,
  .help-section {
    grid-template-columns: 1fr;
  }

  .service-card {
    min-height: 180px;
  }

  .service-content {
    min-height: 180px;
  }
}
</style>