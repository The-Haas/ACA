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

      <!-- Carregando -->
      <div v-if="carregando" class="carregando-container">
        <q-spinner-dots color="red-14" size="50px" />
        <div class="carregando-texto">Buscando prestadores disponíveis...</div>
      </div>

      <!-- Nenhum prestador -->
      <div v-else-if="orcamentos.length === 0" class="vazio-container">
        <q-icon name="search_off" size="60px" color="grey-4" />
        <div class="vazio-texto">Nenhum prestador disponível para este serviço no momento.</div>
      </div>

      <!-- Lista -->
      <section v-else class="lista-orcamentos">
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

              <div class="detalhe-item">
                <q-icon name="phone" size="16px" color="red-14" />
                <strong>{{ orcamento.telefone }}</strong>
              </div>
            </div>

            <div class="categorias">
              <q-chip
                v-for="cat in orcamento.categorias"
                :key="cat"
                dense
                color="grey-2"
                text-color="grey-8"
                size="sm"
              >
                {{ cat }}
              </q-chip>
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
            :disable="salvando"
          />

          <q-btn
            unelevated
            label="Confirmar"
            color="red-14"
            :loading="salvando"
            @click="confirmarContratacao"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

const router = useRouter()
const $q = useQuasar()

const filtro = ref('')
const modalConfirmacao = ref(false)
const prestadorSelecionado = ref({})
const salvando = ref(false)
const carregando = ref(false)
const orcamentos = ref([])

onMounted(() => {
  carregarPrestadores()
})

async function carregarPrestadores () {
  carregando.value = true

  try {
    const servico = JSON.parse(localStorage.getItem('servico_selecionado') || '{}')

    if (!servico.id) {
      $q.notify({ type: 'negative', message: 'Serviço não selecionado. Volte ao início.' })
      router.push('/home')
      return
    }

    const response = await api.get(`/prestadores/categoria/${servico.id}`)

    if (!response.data.success) {
      $q.notify({ type: 'negative', message: response.data.message || 'Erro ao buscar prestadores.' })
      return
    }

    const lista = response.data.data

    // Marca o mais barato e o recomendado (melhor avaliado)
    // Como não temos preço real no cadastro do prestador, usamos valor simulado por posição
    // TODO: substituir por preço real quando o backend tiver esse campo
    const precos = [2000, 1500, 1000, 500, 800, 1200, 1800, 600]

    orcamentos.value = lista.map((p, index) => ({
      id: p.id,
      nome: p.nome_fantasia || p.razao_social,
      nota: '4.5',
      estrelas: 4,
      tempo: 10 + index * 10,
      distancia: (1.5 + index * 2).toFixed(1),
      preco: precos[index % precos.length],
      telefone: p.telefone,
      categorias: p.categorias_servico || [],
      recomendado: index === 0,
      maisBarato: false
    }))

    // Marca o mais barato
    if (orcamentos.value.length > 0) {
      const menorPreco = Math.min(...orcamentos.value.map(o => o.preco))
      orcamentos.value = orcamentos.value.map(o => ({
        ...o,
        maisBarato: o.preco === menorPreco && !o.recomendado
      }))
    }

  } catch (err) {
    console.error('Erro ao carregar prestadores:', err)
    $q.notify({ type: 'negative', message: 'Erro de conexão ao buscar prestadores.' })
  } finally {
    carregando.value = false
  }
}

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

function decodeJWT (token) {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

async function confirmarContratacao () {
  salvando.value = true

  try {
    const servico = JSON.parse(localStorage.getItem('servico_selecionado') || '{}')
    const tipoLocalizacao = JSON.parse(localStorage.getItem('tipo_localizacao') || '{}')
    const localizacaoSalva = JSON.parse(localStorage.getItem('localizacao_atendimento') || '{}')
    const descricaoProblema = localStorage.getItem('descricao_problema') || ''
    const veiculoSelecionado = JSON.parse(localStorage.getItem('veiculo_selecionado') || '{}')
    const token = localStorage.getItem('token')

    const tokenDecodificado = decodeJWT(token)
    const id_usuario = tokenDecodificado?.id

    if (!id_usuario) {
      $q.notify({ type: 'negative', message: 'Sessão expirada. Faça login novamente.' })
      router.push('/login')
      return
    }

    if (!servico.id) {
      $q.notify({ type: 'negative', message: 'Serviço não selecionado. Volte ao início.' })
      return
    }

    if (!tipoLocalizacao.id) {
      $q.notify({ type: 'negative', message: 'Tipo de localização não informado.' })
      return
    }

    if (!localizacaoSalva.latitude || !localizacaoSalva.longitude) {
      $q.notify({ type: 'negative', message: 'Localização não informada.' })
      return
    }

    if (!veiculoSelecionado.id_veiculo) {
      $q.notify({ type: 'negative', message: 'Veículo não selecionado. Volte à descrição do problema.' })
      return
    }

    const payload = {
      id_usuario,
      id_veiculo: veiculoSelecionado.id_veiculo,
      id_tipo_localizacao: tipoLocalizacao.id,
      localizacao: `${localizacaoSalva.latitude},${localizacaoSalva.longitude}`,
      local_entrega: null,
      observacao_cliente: descricaoProblema || null,
      itens: [servico.id]
    }

    const response = await api.post('/ordemServico', payload)

    if (!response.data.success) {
      $q.notify({ type: 'negative', message: response.data.message || 'Erro ao criar chamado.' })
      return
    }

    localStorage.setItem('os_criada', JSON.stringify(response.data.data))
    localStorage.setItem('orcamento_contratado', JSON.stringify(prestadorSelecionado.value))

    modalConfirmacao.value = false

    $q.notify({ type: 'positive', message: 'Chamado criado com sucesso!' })

    router.push('/home/acompanhamento')

  } catch (err) {
    console.error('Erro ao criar OS:', err)
    $q.notify({ type: 'negative', message: 'Erro de conexão com o servidor.' })
  } finally {
    salvando.value = false
  }
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

.carregando-container {
  text-align: center;
  padding: 60px 20px;
}

.carregando-texto {
  color: #6b7280;
  margin-top: 16px;
  font-size: 15px;
}

.vazio-container {
  text-align: center;
  padding: 60px 20px;
}

.vazio-texto {
  color: #6b7280;
  margin-top: 14px;
  font-size: 15px;
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
  gap: 24px;
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

.categorias {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
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