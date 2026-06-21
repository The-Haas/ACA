<template>
  <q-layout view="lHh Lpr lFf" class="prestador-layout">

    <q-header class="prestador-header">
      <div class="top-line"></div>

      <q-toolbar class="prestador-toolbar q-px-md q-px-md-lg">
        <div class="logo-card">
          <q-icon name="local_shipping" size="28px" color="orange-5" />

          <div>
            <div class="logo-title">AUTO SOS</div>
            <div class="logo-subtitle">PAINEL DO PRESTADOR</div>
          </div>
        </div>

        <q-space />

        <q-btn
          flat
          round
          icon="logout"
          color="grey-8"
          @click="sair"
        >
          <q-tooltip>Sair</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="painel-page">

        <section class="painel-hero">
          <div class="service-badge">
            Chamados em aberto
          </div>

          <h1 class="painel-title">
            Atendimentos disponíveis para você
          </h1>

          <p class="painel-description">
            Estes são os chamados ainda sem prestador que correspondem aos
            serviços que você atende. Aceite um chamado para iniciar o atendimento.
          </p>

          <q-btn
            flat
            no-caps
            icon="refresh"
            label="Atualizar lista"
            color="red-14"
            :loading="carregando"
            @click="carregarChamados"
          />
        </section>

        <!-- Carregando -->
        <section v-if="carregando" class="estado-section">
          <q-spinner color="red-14" size="42px" />
          <div class="estado-text">Buscando chamados em aberto...</div>
        </section>

        <!-- Erro -->
        <section v-else-if="erro" class="estado-section">
          <q-icon name="error_outline" size="42px" color="red-14" />
          <div class="estado-text">{{ erro }}</div>
          <q-btn
            unelevated
            no-caps
            label="Tentar novamente"
            color="red-14"
            class="q-mt-sm"
            @click="carregarChamados"
          />
        </section>

        <!-- Vazio -->
        <section v-else-if="chamados.length === 0" class="estado-section">
          <q-icon name="task_alt" size="42px" color="grey-5" />
          <div class="estado-text">
            Nenhum chamado em aberto no momento para os serviços que você atende.
          </div>
          <div class="estado-subtext">
            Assim que um cliente solicitar um serviço compatível, ele aparecerá aqui.
          </div>
        </section>

        <!-- Lista de chamados -->
        <section v-else class="chamados-list">
          <q-card
            v-for="chamado in chamados"
            :key="chamado.id"
            class="chamado-card"
            flat
          >
            <q-card-section class="chamado-content">

              <div class="chamado-info">
                <div class="chamado-topo">
                  <span class="chamado-id">Chamado #{{ chamado.id }}</span>

                  <q-chip
                    v-for="servico in chamado.servicos"
                    :key="servico"
                    dense
                    square
                    color="red-1"
                    text-color="red-14"
                    class="text-bold"
                  >
                    {{ servico }}
                  </q-chip>
                </div>

                <div class="chamado-linha">
                  <q-icon name="directions_car" size="18px" color="grey-7" />
                  {{ chamado.veiculo || 'Veículo não informado' }}
                </div>

                <div class="chamado-linha">
                  <q-icon name="place" size="18px" color="grey-7" />
                  {{ chamado.tipo_localizacao || 'Localização não informada' }}
                </div>

                <div v-if="chamado.observacao_cliente" class="chamado-observacao">
                  "{{ chamado.observacao_cliente }}"
                </div>
              </div>

              <div class="chamado-acao">
                <q-btn
                  unelevated
                  no-caps
                  color="red-14"
                  label="Aceitar chamado"
                  class="btn-aceitar"
                  :loading="aceitandoId === chamado.id"
                  :disable="aceitandoId !== null && aceitandoId !== chamado.id"
                  @click="aceitarChamado(chamado)"
                />
              </div>

            </q-card-section>
          </q-card>
        </section>

      </q-page>
    </q-page-container>

  </q-layout>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const router = useRouter()
const $q = useQuasar()

const chamados = ref([])
const carregando = ref(true)
const erro = ref('')
const aceitandoId = ref(null)

function decodeJWT (token) {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

function sair () {
  localStorage.removeItem('token')
  router.push('/login')
}

async function carregarChamados () {
  carregando.value = true
  erro.value = ''

  try {
    const response = await api.get('/ordemServico/abertas')

    if (response.data && response.data.success) {
      chamados.value = response.data.data
    } else {
      erro.value = response.data?.message || 'Não foi possível carregar os chamados.'
    }
  } catch (err) {
    console.error('Erro ao carregar chamados em aberto:', err)

    if (err.response?.status === 401 || err.response?.status === 403) {
      erro.value = 'Sessão expirada. Faça login novamente.'
      setTimeout(() => router.push('/login'), 1200)
    } else if (err.request) {
      erro.value = 'Não foi possível conectar com o backend. Verifique se ele está rodando.'
    } else {
      erro.value = 'Erro ao carregar chamados em aberto.'
    }
  } finally {
    carregando.value = false
  }
}

async function aceitarChamado (chamado) {
  const token = localStorage.getItem('token')
  const tokenDecodificado = decodeJWT(token)
  const id_prestador = tokenDecodificado?.id

  if (!id_prestador) {
    $q.notify({ type: 'negative', message: 'Sessão expirada. Faça login novamente.' })
    router.push('/login')
    return
  }

  aceitandoId.value = chamado.id

  try {
    const response = await api.patch(`/ordemServico/${chamado.id}/aceitar`, {
      id_prestador
    })

    if (!response.data.success) {
      $q.notify({ type: 'negative', message: response.data.message || 'Não foi possível aceitar o chamado.' })
      return
    }

    chamados.value = chamados.value.filter(c => c.id !== chamado.id)

    $q.notify({ type: 'positive', message: `Chamado #${chamado.id} aceito com sucesso!` })
  } catch (err) {
    console.error('Erro ao aceitar chamado:', err)
    $q.notify({ type: 'negative', message: 'Erro de conexão com o servidor.' })
  } finally {
    aceitandoId.value = null
  }
}

onMounted(() => {
  carregarChamados()
})
</script>

<style lang="scss">
.prestador-layout {
  background: #f4f5f8;
}

.prestador-header {
  background: #ffffff;
  color: #1f2937;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}

.top-line {
  height: 7px;
  background: #df0000;
}

.prestador-toolbar {
  min-height: 76px;
  display: flex;
  align-items: center;
}

.logo-card {
  background: #1c1c6b;
  color: white;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 16px;
  border-radius: 5px;
  box-shadow: 0 8px 18px rgba(28, 28, 107, 0.28);
}

.logo-title {
  font-size: 18px;
  font-weight: 900;
  line-height: 18px;
}

.logo-subtitle {
  font-size: 9px;
  letter-spacing: 1.2px;
  opacity: 0.85;
}

.painel-page {
  min-height: calc(100vh - 83px);
  background:
    radial-gradient(circle at top left, rgba(224, 0, 0, 0.08), transparent 300px),
    #f4f5f8;
  padding: 48px 24px 90px;
}

.painel-hero {
  text-align: center;
  max-width: 720px;
  margin: 0 auto 40px;
}

.service-badge {
  display: inline-block;
  background: #df0000;
  color: #ffffff;
  padding: 12px 30px;
  border-radius: 999px;
  font-size: 16px;
  font-weight: 900;
  box-shadow: 0 10px 20px rgba(223, 0, 0, 0.25);
  transform: rotate(-1deg);
}

.painel-title {
  margin: 24px 0 10px;
  font-size: 30px;
  font-weight: 900;
  color: #1f2937;
  line-height: 1.2;
}

.painel-description {
  max-width: 600px;
  margin: 0 auto 18px;
  color: #6b7280;
  font-size: 15px;
  line-height: 1.6;
}

.estado-section {
  max-width: 480px;
  margin: 60px auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.estado-text {
  color: #374151;
  font-size: 15px;
  font-weight: 700;
}

.estado-subtext {
  color: #9ca3af;
  font-size: 13px;
}

.chamados-list {
  max-width: 860px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.chamado-card {
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #edf0f4;
  box-shadow: 0 9px 24px rgba(31, 41, 55, 0.08);
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}

.chamado-card:hover {
  box-shadow: 0 14px 32px rgba(31, 41, 55, 0.14);
}

.chamado-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.chamado-info {
  flex: 1;
  min-width: 260px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.chamado-topo {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 4px;
}

.chamado-id {
  font-weight: 900;
  color: #1f2937;
  font-size: 15px;
  margin-right: 4px;
}

.chamado-linha {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
  font-size: 13px;
}

.chamado-observacao {
  margin-top: 6px;
  color: #4b5563;
  font-size: 13px;
  font-style: italic;
}

.chamado-acao {
  flex-shrink: 0;
}

.btn-aceitar {
  border-radius: 9px;
  font-weight: 800;
  padding: 10px 22px;
  box-shadow: 0 8px 18px rgba(223, 0, 0, 0.24);
}

@media (max-width: 600px) {
  .painel-page {
    padding: 36px 16px 90px;
  }

  .painel-title {
    font-size: 24px;
  }

  .chamado-content {
    flex-direction: column;
    align-items: stretch;
  }

  .chamado-acao {
    width: 100%;
  }

  .btn-aceitar {
    width: 100%;
  }
}
</style>