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

        <div class="header-actions">
          <q-btn flat round icon="notifications_none" color="grey-8">
            <q-tooltip>Notificações</q-tooltip>
          </q-btn>

          <q-btn outline round icon="person_outline" color="red-14">
            <q-tooltip>Perfil</q-tooltip>
            <q-menu anchor="bottom right" self="top right" transition-show="jump-down" transition-hide="jump-up">
              <q-list class="profile-menu">

                <q-item clickable v-close-popup @click="paginaAtiva = 'chamados'">
                  <q-item-section avatar>
                    <q-icon name="support_agent" color="red-14" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Chamados</q-item-label>
                    <q-item-label caption>Ver atendimentos disponíveis</q-item-label>
                  </q-item-section>
                </q-item>

                <q-separator />

                <q-item clickable v-close-popup @click="abrirMinhaConta">
                  <q-item-section avatar>
                    <q-icon name="manage_accounts" color="red-14" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Minha conta</q-item-label>
                    <q-item-label caption>Alterar dados do perfil</q-item-label>
                  </q-item-section>
                </q-item>

              </q-list>
            </q-menu>
          </q-btn>

          <q-btn flat round icon="logout" color="grey-8" @click="sair">
            <q-tooltip>Sair</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="painel-page">

        <!-- ===================== CHAMADOS ===================== -->
        <template v-if="paginaAtiva === 'chamados'">
          <section class="painel-hero">
            <div class="service-badge">Chamados em aberto</div>
            <h1 class="painel-title">Atendimentos disponíveis para você</h1>
            <p class="painel-description">
              Estes são os chamados ainda sem prestador que correspondem aos
              serviços que você atende. Aceite um chamado para iniciar o atendimento.
            </p>
            <q-btn flat no-caps icon="refresh" label="Atualizar lista" color="red-14"
              :loading="carregando" @click="carregarChamados" />
          </section>

          <section v-if="carregando" class="estado-section">
            <q-spinner color="red-14" size="42px" />
            <div class="estado-text">Buscando chamados em aberto...</div>
          </section>

          <section v-else-if="erro" class="estado-section">
            <q-icon name="error_outline" size="42px" color="red-14" />
            <div class="estado-text">{{ erro }}</div>
            <q-btn unelevated no-caps label="Tentar novamente" color="red-14"
              class="q-mt-sm" @click="carregarChamados" />
          </section>

          <section v-else-if="chamados.length === 0" class="estado-section">
            <q-icon name="task_alt" size="42px" color="grey-5" />
            <div class="estado-text">
              Nenhum chamado em aberto no momento para os serviços que você atende.
            </div>
            <div class="estado-subtext">
              Assim que um cliente solicitar um serviço compatível, ele aparecerá aqui.
            </div>
          </section>

          <section v-else class="chamados-list">
            <q-card v-for="chamado in chamados" :key="chamado.id" class="chamado-card" flat>
              <q-card-section class="chamado-content">
                <div class="chamado-info">
                  <div class="chamado-topo">
                    <span class="chamado-id">Chamado #{{ chamado.id }}</span>
                    <q-chip v-for="servico in chamado.servicos" :key="servico"
                      dense square color="red-1" text-color="red-14" class="text-bold">
                      {{ servico }}
                    </q-chip>
                  </div>
                  <div class="chamado-linha">
                    <q-icon name="person" size="18px" color="grey-7" />
                    {{ chamado.cliente || 'Cliente não informado' }}
                    <span v-if="chamado.cliente_telefone" class="chamado-tel">
                      · {{ chamado.cliente_telefone }}
                    </span>
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
                  <q-btn unelevated no-caps color="red-14" label="Aceitar chamado"
                    class="btn-aceitar"
                    :loading="aceitandoId === chamado.id"
                    :disable="aceitandoId !== null && aceitandoId !== chamado.id"
                    @click="aceitarChamado(chamado)" />
                </div>
              </q-card-section>
            </q-card>
          </section>
        </template>

        <!-- ===================== MINHA CONTA ===================== -->
        <template v-else-if="paginaAtiva === 'minha-conta'">
          <div class="conta-wrapper">

            <!-- Header da seção -->
            <div class="conta-header">
              <q-btn flat round icon="arrow_back" color="grey-7" @click="paginaAtiva = 'chamados'" />
              <div>
                <div class="conta-titulo">Minha Conta</div>
                <div class="conta-subtitulo">Gerencie seus dados pessoais</div>
              </div>
            </div>

            <!-- Dados Pessoais -->
            <q-card class="conta-card" flat>
              <q-card-section>
                <div class="secao-titulo">
                  <q-icon name="manage_accounts" color="red-14" size="22px" />
                  Dados Pessoais
                </div>
              </q-card-section>

              <q-card-section class="q-gutter-sm q-pt-none">
                <q-input v-model="conta.nome_fantasia" outlined label="Nome fantasia"
                  dense bg-color="grey-1" />
                <q-input v-model="conta.razao_social" outlined label="Razão social"
                  dense bg-color="grey-1" />
                <q-input v-model="conta.email" outlined label="E-mail"
                  dense bg-color="grey-1" type="email" />
                <q-input v-model="conta.telefone" outlined label="Telefone"
                  dense bg-color="grey-1" mask="(##) #####-####" />
              </q-card-section>

              <q-card-actions align="right" class="q-pa-md q-pt-none">
                <q-btn unelevated no-caps label="Salvar dados" color="red-14"
                  :loading="salvandoDados" @click="salvarDados" />
              </q-card-actions>
            </q-card>

            <!-- Alterar Senha -->
            <q-card class="conta-card" flat>
              <q-card-section>
                <div class="secao-titulo">
                  <q-icon name="lock_outline" color="red-14" size="22px" />
                  Alterar Senha
                </div>
              </q-card-section>

              <q-card-section class="q-gutter-sm q-pt-none">
                <q-input v-model="novaSenha" outlined label="Nova senha"
                  dense bg-color="grey-1"
                  :type="mostrarSenha ? 'text' : 'password'">
                  <template #append>
                    <q-icon :name="mostrarSenha ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer" @click="mostrarSenha = !mostrarSenha" />
                  </template>
                </q-input>
                <q-input v-model="confirmarSenha" outlined label="Confirmar nova senha"
                  dense bg-color="grey-1"
                  :type="mostrarSenha ? 'text' : 'password'" />
                <div class="senha-hint">
                  Mínimo 8 caracteres, 1 maiúscula, 1 número e 1 caractere especial.
                </div>
              </q-card-section>

              <q-card-actions align="right" class="q-pa-md q-pt-none">
                <q-btn unelevated no-caps label="Alterar senha" color="red-14"
                  :loading="salvandoSenha" @click="salvarSenha" />
              </q-card-actions>
            </q-card>

            <!-- Serviços atendidos (editável) -->
            <q-card class="conta-card" flat>
              <q-card-section>
                <div class="secao-titulo">
                  <q-icon name="build_circle" color="red-14" size="22px" />
                  Serviços que você atende
                </div>
              </q-card-section>
              <q-card-section class="q-pt-none">
                <div v-if="carregandoCategorias" class="text-center q-py-md">
                  <q-spinner color="red-14" size="28px" />
                </div>
                <div v-else class="servicos-grid">
                  <q-checkbox
                    v-for="cat in todasCategorias"
                    :key="cat.id"
                    v-model="categoriasSelIds"
                    :val="cat.id"
                    :label="cat.nome"
                    color="red-14"
                    dense
                  />
                </div>
                <div v-if="!carregandoCategorias && todasCategorias.length === 0" class="estado-subtext">
                  Nenhuma categoria disponível.
                </div>
              </q-card-section>
              <q-card-actions align="right" class="q-pa-md q-pt-none">
                <q-btn unelevated no-caps label="Salvar serviços" color="red-14"
                  :loading="salvandoServicos" @click="salvarServicos" />
              </q-card-actions>
            </q-card>

          </div>
        </template>

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

// ---- navegação ----
const paginaAtiva = ref('chamados')

// ---- chamados ----
const chamados = ref([])
const carregando = ref(true)
const erro = ref('')
const aceitandoId = ref(null)

// ---- conta ----
const idPrestador = ref(null)
const conta = ref({
  nome_fantasia: '',
  razao_social: '',
  email: '',
  telefone: '',
  categorias_servico: []
})
const novaSenha = ref('')
const confirmarSenha = ref('')
const mostrarSenha = ref(false)
const salvandoDados = ref(false)
const salvandoSenha = ref(false)
const salvandoServicos = ref(false)
const todasCategorias = ref([])
const categoriasSelIds = ref([])
const carregandoCategorias = ref(false)
const nomesAtuaisPrestador = ref([])

function decodeJWT (token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

function sair () {
  localStorage.removeItem('token')
  router.push('/login')
}

// ---- chamados ----
async function carregarChamados () {
  carregando.value = true
  erro.value = ''
  try {
    const response = await api.get('/ordemServico/abertas')
    if (response.data?.success) {
      chamados.value = response.data.data
    } else {
      erro.value = response.data?.message || 'Não foi possível carregar os chamados.'
    }
  } catch (err) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      erro.value = 'Sessão expirada. Faça login novamente.'
      setTimeout(() => router.push('/login'), 1200)
    } else if (err.request) {
      erro.value = 'Não foi possível conectar com o backend.'
    } else {
      erro.value = 'Erro ao carregar chamados.'
    }
  } finally {
    carregando.value = false
  }
}

async function aceitarChamado (chamado) {
  const token = localStorage.getItem('token')
  const decoded = decodeJWT(token)
  const id_prestador = decoded?.id
  if (!id_prestador) {
    $q.notify({ type: 'negative', message: 'Sessão expirada. Faça login novamente.' })
    router.push('/login')
    return
  }
  aceitandoId.value = chamado.id
  try {
    const response = await api.patch(`/ordemServico/${chamado.id}/aceitar`, { id_prestador })
    if (!response.data.success) {
      $q.notify({ type: 'negative', message: response.data.message || 'Não foi possível aceitar o chamado.' })
      return
    }
    chamados.value = chamados.value.filter(c => c.id !== chamado.id)
    $q.notify({ type: 'positive', message: `Chamado #${chamado.id} aceito com sucesso!` })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro de conexão com o servidor.' })
  } finally {
    aceitandoId.value = null
  }
}

// ---- minha conta ----
async function abrirMinhaConta () {
  paginaAtiva.value = 'minha-conta'
  await Promise.all([carregarDadosConta(), carregarTodasCategorias()])
}

async function carregarDadosConta () {
  if (!idPrestador.value) return
  try {
    const r = await api.get(`/prestadores/${idPrestador.value}`)
    if (r.data?.success) {
      const p = r.data.prestador
      conta.value = {
        nome_fantasia: p.nome_fantasia || '',
        razao_social: p.razao_social || '',
        email: p.email || '',
        telefone: p.telefone || ''
      }
      // nomes das categorias atuais — vamos cruzar com os IDs após carregar todas
      nomesAtuaisPrestador.value = p.categorias_servico || []
    }
  } catch (err) {
    console.error('Erro ao carregar conta:', err)
  }
}

async function carregarTodasCategorias () {
  carregandoCategorias.value = true
  try {
    const r = await api.get('/categoriaservico')
    const lista = Array.isArray(r.data) ? r.data : (r.data?.data || [])
    todasCategorias.value = lista

    // pré-seleciona as que o prestador já tem (cruzamento por nome)
    const nomesAtuais = nomesAtuaisPrestador.value
    categoriasSelIds.value = lista
      .filter(c => nomesAtuais.includes(c.nome))
      .map(c => c.id)
  } catch (err) {
    console.error('Erro ao carregar categorias:', err)
  } finally {
    carregandoCategorias.value = false
  }
}

async function salvarServicos () {
  if (categoriasSelIds.value.length === 0) {
    $q.notify({ type: 'warning', message: 'Selecione ao menos um serviço.' })
    return
  }
  salvandoServicos.value = true
  try {
    const r = await api.patch(`/prestadores/${idPrestador.value}`, {
      categorias_servico: categoriasSelIds.value
    })
    if (!r.data.success) {
      $q.notify({ type: 'negative', message: r.data.message || 'Erro ao salvar.' })
      return
    }
    $q.notify({ type: 'positive', message: 'Serviços atualizados com sucesso!' })
  } catch (err) {
    const msg = err?.response?.data?.message || 'Erro de conexão com o servidor.'
    $q.notify({ type: 'negative', message: msg })
  } finally {
    salvandoServicos.value = false
  }
}

async function salvarDados () {
  salvandoDados.value = true
  try {
    const r = await api.patch(`/prestadores/${idPrestador.value}`, {
      nome_fantasia: conta.value.nome_fantasia,
      razao_social: conta.value.razao_social,
      email: conta.value.email,
      telefone: conta.value.telefone
    })
    if (!r.data.success) {
      $q.notify({ type: 'negative', message: r.data.message || 'Erro ao salvar.' })
      return
    }
    $q.notify({ type: 'positive', message: 'Dados atualizados com sucesso!' })
  } catch (err) {
    const msg = err?.response?.data?.message || 'Erro de conexão com o servidor.'
    $q.notify({ type: 'negative', message: msg })
  } finally {
    salvandoDados.value = false
  }
}

async function salvarSenha () {
  if (!novaSenha.value) {
    $q.notify({ type: 'warning', message: 'Informe a nova senha.' })
    return
  }
  if (novaSenha.value !== confirmarSenha.value) {
    $q.notify({ type: 'warning', message: 'As senhas não coincidem.' })
    return
  }
  salvandoSenha.value = true
  try {
    const r = await api.patch(`/prestadores/${idPrestador.value}`, { senha: novaSenha.value })
    if (!r.data.success) {
      $q.notify({ type: 'negative', message: r.data.message || 'Erro ao alterar senha.' })
      return
    }
    $q.notify({ type: 'positive', message: 'Senha alterada com sucesso!' })
    novaSenha.value = ''
    confirmarSenha.value = ''
  } catch (err) {
    const msg = err?.response?.data?.message || 'Erro de conexão com o servidor.'
    $q.notify({ type: 'negative', message: msg })
  } finally {
    salvandoSenha.value = false
  }
}

onMounted(() => {
  const token = localStorage.getItem('token')
  const decoded = decodeJWT(token)
  idPrestador.value = decoded?.id || null
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-menu {
  min-width: 255px;
  padding: 6px 0;
  border-radius: 10px;
}

.profile-menu .q-item {
  padding: 12px 15px;
}

.profile-menu .q-item__label {
  font-weight: 700;
  color: #1f2937;
}

.profile-menu .q-item__label--caption {
  font-size: 12px;
  font-weight: 400;
  color: #6b7280;
}

/* ---- Página geral ---- */
.painel-page {
  min-height: calc(100vh - 83px);
  background:
    radial-gradient(circle at top left, rgba(224, 0, 0, 0.08), transparent 300px),
    #f4f5f8;
  padding: 48px 24px 90px;
}

/* ---- Chamados ---- */
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

.chamado-tel {
  color: #9ca3af;
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

/* ---- Minha Conta ---- */
.conta-wrapper {
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.conta-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.conta-titulo {
  font-size: 22px;
  font-weight: 900;
  color: #1f2937;
}

.conta-subtitulo {
  font-size: 13px;
  color: #6b7280;
}

.conta-card {
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #edf0f4;
  box-shadow: 0 9px 24px rgba(31, 41, 55, 0.07);
}

.secao-titulo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 800;
  color: #1f2937;
}

.senha-hint {
  font-size: 12px;
  color: #9ca3af;
}

.servicos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
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
