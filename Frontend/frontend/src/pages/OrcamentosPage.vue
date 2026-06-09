<template>
  <q-page class="orcamentos-page">

    <section class="orcamentos-container">

      <div class="orcamentos-header-card">
        <div>
          <h1 class="orcamentos-title">
            Orçamentos Disponíveis
          </h1>

          <p class="orcamentos-description">
            Selecione o melhor prestador para sua necessidade.
          </p>
        </div>

        <div class="filtros">
          <q-btn
            unelevated
            no-caps
            size="sm"
            label="Menor Preço"
            :color="filtro === 'preco' ? 'red-14' : 'grey-3'"
            :text-color="filtro === 'preco' ? 'white' : 'grey-8'"
            @click="ordenarPorPreco"
          />

          <q-btn
            unelevated
            no-caps
            size="sm"
            label="Mais Rápido"
            :color="filtro === 'tempo' ? 'red-14' : 'grey-3'"
            :text-color="filtro === 'tempo' ? 'white' : 'grey-8'"
            @click="ordenarPorTempo"
          />
        </div>
      </div>

      <section class="lista-orcamentos">
        <q-card
          v-for="orcamento in orcamentosOrdenados"
          :key="orcamento.id"
          class="orcamento-card"
          :class="{
            'orcamento-recomendado': orcamento.recomendado,
            'orcamento-barato': orcamento.maisBarato
          }"
          flat
        >
          <div class="orcamento-info">
            <div class="orcamento-topo">
              <div class="prestador-nome">
                {{ orcamento.nome }}
              </div>

              <q-badge
                v-if="orcamento.recomendado"
                color="green-2"
                text-color="green-9"
                label="Recomendado"
                class="badge-custom"
              />

              <q-badge
                v-if="orcamento.maisBarato"
                color="blue-2"
                text-color="blue-9"
                label="Mais barato"
                class="badge-custom"
              />
            </div>

            <div class="avaliacao">
              <q-rating
                :model-value="orcamento.estrelas"
                readonly
                size="17px"
                color="amber-7"
                icon="star_border"
                icon-selected="star"
              />

              <span class="avaliacao-texto">
                {{ orcamento.nota }} / 5
              </span>
            </div>

            <div class="detalhes">
              <div class="detalhe-item">
                <q-icon name="schedule" size="16px" color="red-14" />
                Chegada em: <strong>{{ orcamento.tempo }} min</strong>
              </div>

              <div class="detalhe-item">
                <q-icon name="near_me" size="16px" color="red-14" />
                Distância: <strong>{{ orcamento.distancia }} km</strong>
              </div>
            </div>
          </div>

          <q-separator vertical class="separator-desktop" />

          <div class="orcamento-preco">
            <div class="preco-label">
              Valor total
            </div>

            <div class="preco-valor" :class="{ 'preco-azul': orcamento.maisBarato }">
              {{ formatarPreco(orcamento.preco) }}
            </div>

            <q-btn
              unelevated
              color="red-14"
              label="Contratar"
              class="btn-contratar"
              @click="contratar(orcamento)"
            >
              <q-icon name="arrow_forward" size="16px" class="q-ml-xs" />
            </q-btn>
          </div>
        </q-card>
      </section>

    </section>

    <q-dialog v-model="modalConfirmacao">
      <q-card class="confirmacao-card">
        <q-card-section class="text-center">
          <div class="confirmacao-icon">
            <q-icon name="local_shipping" size="46px" color="red-14" />
          </div>

          <div class="text-h5 text-bold text-grey-9 q-mt-md">
            Confirmar contratação?
          </div>

          <div class="text-grey-7 q-mt-sm">
            Você está contratando:
          </div>

          <div class="prestador-confirmado">
            {{ prestadorSelecionado.nome }}
          </div>

          <div class="preco-confirmado">
            {{ formatarPreco(prestadorSelecionado.preco || 0) }}
          </div>
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
            label="Confirmar"
            color="red-14"
            @click="confirmarContratacao"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const filtro = ref('')
const modalConfirmacao = ref(false)
const prestadorSelecionado = ref({})

const orcamentos = ref([
  {
    id: 1,
    nome: 'Mecânica do Vesgo',
    nota: '4.8',
    estrelas: 5,
    tempo: 120,
    distancia: 15,
    preco: 2000,
    recomendado: true,
    maisBarato: false
  },
  {
    id: 2,
    nome: 'CRC Mecânica',
    nota: '4.0',
    estrelas: 4,
    tempo: 60,
    distancia: 8,
    preco: 1500,
    recomendado: false,
    maisBarato: false
  },
  {
    id: 3,
    nome: 'Mecânica do Clóvis',
    nota: '3.0',
    estrelas: 3,
    tempo: 30,
    distancia: 4,
    preco: 1000,
    recomendado: false,
    maisBarato: false
  },
  {
    id: 4,
    nome: 'Mecânica Simas Turbo',
    nota: '2.5',
    estrelas: 3,
    tempo: 10,
    distancia: 1.9,
    preco: 500,
    recomendado: false,
    maisBarato: true
  }
])

const orcamentosOrdenados = computed(() => {
  const lista = [...orcamentos.value]

  if (filtro.value === 'preco') {
    return lista.sort((a, b) => a.preco - b.preco)
  }

  if (filtro.value === 'tempo') {
    return lista.sort((a, b) => a.tempo - b.tempo)
  }

  return lista
})

function ordenarPorPreco () {
  filtro.value = 'preco'
}

function ordenarPorTempo () {
  filtro.value = 'tempo'
}

function formatarPreco (valor) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
}

function contratar (orcamento) {
  prestadorSelecionado.value = orcamento
  modalConfirmacao.value = true
}

function confirmarContratacao () {
  localStorage.setItem('orcamento_contratado', JSON.stringify(prestadorSelecionado.value))

  modalConfirmacao.value = false

  router.push('/home/acompanhamento')
}
</script>

<style lang="scss">
.orcamentos-page {
  min-height: calc(100vh - 150px);
  background:
    radial-gradient(circle at top left, rgba(224, 0, 0, 0.07), transparent 320px),
    #f4f5f8;
  padding: 42px 24px 115px;
}

.orcamentos-container {
  max-width: 950px;
  margin: 0 auto;
}

.orcamentos-header-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #edf0f4;
  box-shadow: 0 8px 22px rgba(31, 41, 55, 0.07);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: center;
  margin-bottom: 22px;
}

.orcamentos-title {
  margin: 0;
  color: #1f2937;
  font-size: 22px;
  font-weight: 900;
}

.orcamentos-description {
  color: #6b7280;
  font-size: 13px;
  margin: 4px 0 0;
}

.filtros {
  display: flex;
  gap: 10px;
}

.lista-orcamentos {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.orcamento-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #edf0f4;
  box-shadow: 0 10px 26px rgba(31, 41, 55, 0.09);
  display: grid;
  grid-template-columns: 1fr auto 190px;
  gap: 20px;
  padding: 22px;
  align-items: center;
  position: relative;
  overflow: hidden;
  transition: all 0.22s ease;
}

.orcamento-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 35px rgba(31, 41, 55, 0.14);
}

.orcamento-card::before {
  content: "";
  width: 5px;
  height: 100%;
  background: transparent;
  position: absolute;
  top: 0;
  left: 0;
}

.orcamento-recomendado::before {
  background: #df0000;
}

.orcamento-barato::before {
  background: #3b82f6;
}

.orcamento-topo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.prestador-nome {
  color: #1f2937;
  font-size: 20px;
  font-weight: 900;
}

.badge-custom {
  font-weight: 800;
  border-radius: 999px;
}

.avaliacao {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 10px;
}

.avaliacao-texto {
  color: #6b7280;
  font-size: 12px;
  font-weight: 700;
}

.detalhes {
  display: flex;
  gap: 42px;
  margin-top: 17px;
  flex-wrap: wrap;
}

.detalhe-item {
  color: #6b7280;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.detalhe-item strong {
  color: #1f2937;
}

.separator-desktop {
  height: 95px;
  background: #edf0f4;
}

.orcamento-preco {
  text-align: right;
}

.preco-label {
  color: #9ca3af;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 4px;
}

.preco-valor {
  color: #df0000;
  font-size: 26px;
  font-weight: 900;
  margin-bottom: 12px;
}

.preco-azul {
  color: #2563eb;
}

.btn-contratar {
  width: 145px;
  border-radius: 8px;
  font-weight: 900;
  padding: 9px 12px;
}

.confirmacao-card {
  width: 100%;
  max-width: 420px;
  border-radius: 20px;
}

.confirmacao-icon {
  width: 82px;
  height: 82px;
  background: #ffe1e1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.prestador-confirmado {
  color: #1f2937;
  font-size: 20px;
  font-weight: 900;
  margin-top: 10px;
}

.preco-confirmado {
  color: #df0000;
  font-size: 28px;
  font-weight: 900;
  margin-top: 4px;
}

@media (max-width: 800px) {
  .orcamento-card {
    grid-template-columns: 1fr;
  }

  .separator-desktop {
    display: none;
  }

  .orcamento-preco {
    text-align: left;
    border-top: 1px solid #edf0f4;
    padding-top: 16px;
  }

  .orcamentos-header-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .filtros {
    width: 100%;
  }

  .filtros .q-btn {
    flex: 1;
  }
}

@media (max-width: 600px) {
  .orcamentos-page {
    padding: 105px 16px 115px;
  }

  .prestador-nome {
    font-size: 18px;
  }

  .detalhes {
    gap: 12px;
    flex-direction: column;
  }

  .preco-valor {
    font-size: 24px;
  }

  .btn-contratar {
    width: 100%;
  }
}
</style>