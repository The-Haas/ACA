<template>
  <q-page class="conta-page">
    <section class="conta-container">

      <!-- Header -->
      <div class="conta-header">
        <div class="conta-avatar">
          <q-icon name="person" size="38px" color="red-14" />
        </div>
        <div>
          <h1 class="conta-title">Minha Conta</h1>
          <p class="conta-desc">Gerencie seus dados pessoais e veículos.</p>
        </div>
      </div>

      <!-- Carregando -->
      <div v-if="carregando" class="estado-container">
        <q-spinner-dots color="red-14" size="48px" />
      </div>

      <template v-else>

        <!-- ── DADOS PESSOAIS ── -->
        <q-card class="conta-card" flat>
          <q-card-section>
            <div class="secao-titulo">
              <q-icon name="badge" size="20px" color="red-14" />
              Dados Pessoais
            </div>

            <div class="campos-grid">
              <q-input v-model="form.nome" outlined label="Nome completo" bg-color="grey-1"
                :error="!!erros.nome" :error-message="erros.nome" />
              <q-input v-model="form.email" outlined label="E-mail" type="email" bg-color="grey-1"
                :error="!!erros.email" :error-message="erros.email" />
              <q-input v-model="form.telefone" outlined label="Telefone" bg-color="grey-1"
                mask="(##) #####-####" :error="!!erros.telefone" :error-message="erros.telefone" />
            </div>

            <q-btn unelevated no-caps color="red-14" label="Salvar dados"
              class="btn-salvar" :loading="salvandoDados" @click="salvarDados" />
          </q-card-section>
        </q-card>

        <!-- ── ALTERAR SENHA ── -->
        <q-card class="conta-card" flat>
          <q-card-section>
            <div class="secao-titulo">
              <q-icon name="lock" size="20px" color="red-14" />
              Alterar Senha
            </div>

            <div class="campos-grid">
              <q-input v-model="senha.nova" outlined label="Nova senha"
                :type="mostrarSenha ? 'text' : 'password'" bg-color="grey-1"
                :error="!!erros.senha" :error-message="erros.senha">
                <template #append>
                  <q-icon :name="mostrarSenha ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer" @click="mostrarSenha = !mostrarSenha" />
                </template>
              </q-input>
              <q-input v-model="senha.confirmacao" outlined label="Confirmar nova senha"
                :type="mostrarSenha ? 'text' : 'password'" bg-color="grey-1"
                :error="!!erros.confirmacao" :error-message="erros.confirmacao" />
            </div>

            <div class="senha-dica">Mínimo 8 caracteres, 1 maiúscula, 1 número e 1 caractere especial.</div>

            <q-btn unelevated no-caps color="red-14" label="Alterar senha"
              class="btn-salvar" :loading="salvandoSenha" @click="salvarSenha" />
          </q-card-section>
        </q-card>

        <!-- ── MEUS VEÍCULOS ── -->
        <q-card class="conta-card" flat>
          <q-card-section>
            <div class="secao-titulo-row">
              <div class="secao-titulo">
                <q-icon name="directions_car" size="20px" color="red-14" />
                Meus Veículos
              </div>
              <q-btn unelevated no-caps color="red-14" icon="add" label="Novo veículo"
                size="sm" class="btn-novo-veiculo" @click="abrirModalVeiculo(null)" />
            </div>

            <!-- Lista vazia -->
            <div v-if="veiculos.length === 0" class="veiculos-vazio">
              <q-icon name="directions_car" size="40px" color="grey-4" />
              <div class="veiculos-vazio-texto">Nenhum veículo cadastrado.</div>
            </div>

            <!-- Lista de veículos -->
            <div v-else class="veiculos-lista">
              <div v-for="v in veiculos" :key="v.id_veiculo" class="veiculo-item">
                <div class="veiculo-icone">
                  <q-icon name="directions_car" size="24px" color="red-14" />
                </div>

                <div class="veiculo-info">
                  <div class="veiculo-nome">{{ v.descricao }}</div>
                  <div class="veiculo-detalhes">
                    <span>{{ v.placa }}</span>
                    <span class="sep">•</span>
                    <span>{{ v.cor }}</span>
                    <span class="sep">•</span>
                    <span>{{ v.categoria }}</span>
                  </div>
                </div>

                <div class="veiculo-acoes">
                  <q-btn flat round dense icon="edit" color="grey-7" @click="abrirModalVeiculo(v)">
                    <q-tooltip>Editar</q-tooltip>
                  </q-btn>
                  <q-btn flat round dense icon="delete" color="red-12" @click="confirmarExclusao(v)">
                    <q-tooltip>Excluir</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

      </template>
    </section>

    <!-- ── MODAL VEÍCULO (cadastro/edição) ── -->
    <q-dialog v-model="modalVeiculo" persistent>
      <q-card class="modal-veiculo-card">
        <q-card-section class="text-center q-pb-none">
          <div class="modal-veiculo-icon">
            <q-icon name="directions_car" size="32px" color="red-14" />
          </div>
          <div class="text-h6 text-bold text-grey-9 q-mt-sm">
            {{ editandoVeiculo ? 'Editar veículo' : 'Cadastrar veículo' }}
          </div>
        </q-card-section>

        <q-card-section class="q-gutter-sm">
          <q-input v-model="formVeiculo.descricao" outlined label="Descrição (ex: Gol 2018)"
            dense bg-color="grey-1" />
          <q-input v-model="formVeiculo.placa" outlined label="Placa" dense bg-color="grey-1"
            mask="AAA-#NNN" />
          <q-input v-model="formVeiculo.renavam" outlined label="RENAVAM" dense bg-color="grey-1"
            type="number" />
          <q-input v-model="formVeiculo.cor" outlined label="Cor" dense bg-color="grey-1" />
          <q-select v-model="formVeiculo.id_categoria" :options="categoriasVeiculo"
            option-value="id" option-label="nome" emit-value map-options
            outlined label="Categoria" dense bg-color="grey-1" :loading="carregandoCategorias" />
        </q-card-section>

        <q-card-section v-if="mensagemModal">
          <div :class="sucessoModal ? 'msg-sucesso' : 'msg-erro'">{{ mensagemModal }}</div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md q-pt-none">
          <q-btn flat label="Cancelar" color="grey-8" @click="fecharModal" :disable="salvandoVeiculo" />
          <q-btn unelevated :label="editandoVeiculo ? 'Salvar' : 'Cadastrar'" color="red-14"
            :loading="salvandoVeiculo" @click="salvarVeiculo" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ── MODAL CONFIRMAR EXCLUSÃO ── -->
    <q-dialog v-model="modalExclusao">
      <q-card class="modal-exclusao-card">
        <q-card-section class="text-center">
          <q-icon name="warning" size="44px" color="red-12" />
          <div class="text-h6 text-bold text-grey-9 q-mt-sm">Excluir veículo?</div>
          <div class="text-grey-7 q-mt-xs">
            <strong>{{ veiculoParaExcluir?.descricao }}</strong> será removido permanentemente.
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup :disable="excluindo" />
          <q-btn unelevated label="Excluir" color="red-12" :loading="excluindo" @click="excluirVeiculo" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

const $q = useQuasar()

const carregando = ref(true)
const salvandoDados = ref(false)
const salvandoSenha = ref(false)
const mostrarSenha = ref(false)

// dados pessoais
const form = reactive({ nome: '', email: '', telefone: '' })
const senha = reactive({ nova: '', confirmacao: '' })
const erros = reactive({ nome: '', email: '', telefone: '', senha: '', confirmacao: '' })

// veículos
const veiculos = ref([])
const categoriasVeiculo = ref([])
const carregandoCategorias = ref(false)
const modalVeiculo = ref(false)
const modalExclusao = ref(false)
const editandoVeiculo = ref(false)
const salvandoVeiculo = ref(false)
const excluindo = ref(false)
const mensagemModal = ref('')
const sucessoModal = ref(false)
const veiculoParaExcluir = ref(null)

const formVeiculo = reactive({
  id_veiculo: null,
  descricao: '',
  placa: '',
  renavam: '',
  cor: '',
  id_categoria: null
})

let idCliente = null

function decodeJWT (token) {
  try { return JSON.parse(atob(token.split('.')[1])) } catch { return null }
}

onMounted(async () => {
  const token = localStorage.getItem('token')
  const payload = decodeJWT(token)
  idCliente = payload?.id

  if (!idCliente) {
    $q.notify({ type: 'negative', message: 'Sessão expirada. Faça login novamente.' })
    return
  }

  await Promise.all([carregarDadosConta(), carregarVeiculos(), carregarCategorias()])
  carregando.value = false
})

// ── DADOS DA CONTA ──
async function carregarDadosConta () {
  try {
    const r = await api.get(`/clientes/${idCliente}`)
    const c = r.data
    form.nome = c.nome || ''
    form.email = c.email || ''
    form.telefone = c.telefone || ''
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao carregar dados da conta.' })
  }
}

function limparErros () {
  erros.nome = ''; erros.email = ''; erros.telefone = ''
  erros.senha = ''; erros.confirmacao = ''
}

async function salvarDados () {
  limparErros()
  if (!form.nome.trim()) { erros.nome = 'Nome obrigatório.'; return }
  if (!form.email.trim()) { erros.email = 'E-mail obrigatório.'; return }
  if (!form.telefone.trim()) { erros.telefone = 'Telefone obrigatório.'; return }

  salvandoDados.value = true
  try {
    const r = await api.patch(`/clientes/${idCliente}`, {
      nome: form.nome.trim(),
      email: form.email.trim(),
      telefone: form.telefone.trim()
    })

    if (!r.data.success) {
      const msg = r.data.message || 'Erro ao salvar.'
      if (msg.toLowerCase().includes('email')) erros.email = msg
      else if (msg.toLowerCase().includes('telefone')) erros.telefone = msg
      else if (msg.toLowerCase().includes('nome')) erros.nome = msg
      else $q.notify({ type: 'negative', message: msg })
      return
    }

    $q.notify({ type: 'positive', message: 'Dados atualizados com sucesso!' })
  } catch (err) {
    $q.notify({ type: 'negative', message: err?.response?.data?.message || 'Erro de conexão.' })
  } finally {
    salvandoDados.value = false
  }
}

async function salvarSenha () {
  limparErros()
  if (!senha.nova) { erros.senha = 'Informe a nova senha.'; return }
  if (senha.nova !== senha.confirmacao) { erros.confirmacao = 'As senhas não coincidem.'; return }

  salvandoSenha.value = true
  try {
    const r = await api.patch(`/clientes/${idCliente}`, { senha: senha.nova })
    if (!r.data.success) { erros.senha = r.data.message || 'Erro ao alterar senha.'; return }
    $q.notify({ type: 'positive', message: 'Senha alterada com sucesso!' })
    senha.nova = ''; senha.confirmacao = ''
  } catch (err) {
    $q.notify({ type: 'negative', message: err?.response?.data?.message || 'Erro de conexão.' })
  } finally {
    salvandoSenha.value = false
  }
}

// ── VEÍCULOS ──
async function carregarVeiculos () {
  try {
    const r = await api.get('/veiculos/meus')
    veiculos.value = r.data.data || []
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao carregar veículos.' })
  }
}

async function carregarCategorias () {
  carregandoCategorias.value = true
  try {
    const r = await api.get('/categoriaVeiculo')
    categoriasVeiculo.value = Array.isArray(r.data) ? r.data : (r.data.data || [])
  } catch {
    // silencioso — categorias já podem estar carregadas
  } finally {
    carregandoCategorias.value = false
  }
}

function abrirModalVeiculo (veiculo) {
  mensagemModal.value = ''
  sucessoModal.value = false

  if (veiculo) {
    editandoVeiculo.value = true
    formVeiculo.id_veiculo = veiculo.id_veiculo
    formVeiculo.descricao = veiculo.descricao || ''
    formVeiculo.placa = veiculo.placa || ''
    formVeiculo.renavam = veiculo.renavam || ''
    formVeiculo.cor = veiculo.cor || ''
    formVeiculo.id_categoria = veiculo.id_categoria || null
  } else {
    editandoVeiculo.value = false
    formVeiculo.id_veiculo = null
    formVeiculo.descricao = ''
    formVeiculo.placa = ''
    formVeiculo.renavam = ''
    formVeiculo.cor = ''
    formVeiculo.id_categoria = null
  }

  modalVeiculo.value = true
}

function fecharModal () {
  modalVeiculo.value = false
  mensagemModal.value = ''
}

async function salvarVeiculo () {
  const { descricao, placa, renavam, cor, id_categoria } = formVeiculo

  if (!descricao || !placa || !renavam || !cor || !id_categoria) {
    mensagemModal.value = 'Preencha todos os campos.'
    sucessoModal.value = false
    return
  }

  salvandoVeiculo.value = true
  mensagemModal.value = ''

  try {
    let r

    if (editandoVeiculo.value) {
      r = await api.put(`/veiculos/${formVeiculo.id_veiculo}`, {
        descricao, placa, renavam, cor, id_categoria
      })
    } else {
      r = await api.post('/veiculos', {
        descricao, placa, renavam: String(renavam), cor, id_categoria, id_cliente: idCliente
      })
    }

    if (!r.data.success) {
      mensagemModal.value = r.data.message || 'Erro ao salvar veículo.'
      sucessoModal.value = false
      return
    }

    sucessoModal.value = true
    mensagemModal.value = editandoVeiculo.value ? 'Veículo atualizado!' : 'Veículo cadastrado!'

    await carregarVeiculos()

    setTimeout(() => fecharModal(), 1200)

  } catch (err) {
    mensagemModal.value = err?.response?.data?.message || 'Erro de conexão com o servidor.'
    sucessoModal.value = false
  } finally {
    salvandoVeiculo.value = false
  }
}

function confirmarExclusao (veiculo) {
  veiculoParaExcluir.value = veiculo
  modalExclusao.value = true
}

async function excluirVeiculo () {
  excluindo.value = true
  try {
    const r = await api.delete(`/veiculos/${veiculoParaExcluir.value.id_veiculo}`)

    if (!r.data.success) {
      $q.notify({ type: 'negative', message: r.data.message || 'Erro ao excluir veículo.' })
      return
    }

    $q.notify({ type: 'positive', message: 'Veículo removido com sucesso.' })
    modalExclusao.value = false
    await carregarVeiculos()

  } catch (err) {
    $q.notify({ type: 'negative', message: err?.response?.data?.message || 'Erro de conexão.' })
  } finally {
    excluindo.value = false
  }
}
</script>

<style lang="scss">
.conta-page {
  min-height: calc(100vh - 150px);
  background:
    radial-gradient(circle at top left, rgba(224, 0, 0, 0.07), transparent 300px),
    #f4f5f8;
  padding: 42px 24px 115px;
}

.conta-container {
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.conta-header {
  display: flex;
  align-items: center;
  gap: 18px;
}

.conta-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #ffe1e1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.conta-title {
  margin: 0 0 4px;
  font-size: 26px;
  font-weight: 900;
  color: #1f2937;
}

.conta-desc {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.estado-container {
  text-align: center;
  padding: 60px 0;
}

.conta-card {
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #edf0f4;
  box-shadow: 0 8px 22px rgba(31, 41, 55, 0.07);
}

.secao-titulo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 900;
  color: #1f2937;
  margin-bottom: 20px;
}

.secao-titulo-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  .secao-titulo {
    margin-bottom: 0;
  }
}

.btn-novo-veiculo {
  border-radius: 8px;
  font-weight: 700;
}

.campos-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 20px;
}

.btn-salvar {
  border-radius: 10px;
  font-weight: 900;
  padding: 10px 28px;
  box-shadow: 0 6px 14px rgba(223, 0, 0, 0.2);
}

.senha-dica {
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 18px;
  margin-top: -6px;
}

// veículos
.veiculos-vazio {
  text-align: center;
  padding: 28px 0;
}

.veiculos-vazio-texto {
  color: #9ca3af;
  margin-top: 10px;
  font-size: 14px;
}

.veiculos-lista {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.veiculo-item {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #f9fafb;
  border: 1px solid #edf0f4;
  border-radius: 12px;
  padding: 14px 16px;
  transition: box-shadow 0.18s;
}

.veiculo-item:hover {
  box-shadow: 0 4px 14px rgba(31, 41, 55, 0.09);
}

.veiculo-icone {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: #ffe1e1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.veiculo-info {
  flex: 1;
}

.veiculo-nome {
  font-size: 15px;
  font-weight: 900;
  color: #1f2937;
}

.veiculo-detalhes {
  font-size: 13px;
  color: #6b7280;
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}

.sep {
  color: #d1d5db;
}

.veiculo-acoes {
  display: flex;
  gap: 4px;
}

// modais
.modal-veiculo-card,
.modal-exclusao-card {
  width: 100%;
  max-width: 440px;
  border-radius: 20px;
}

.modal-veiculo-icon {
  width: 68px;
  height: 68px;
  background: #ffe1e1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 16px auto 0;
}

.msg-erro {
  background: #ffe5e5;
  color: #b00020;
  border: 1px solid #ffb3b3;
  padding: 10px 12px;
  border-radius: 10px;
  font-weight: 700;
  text-align: center;
  font-size: 13px;
}

.msg-sucesso {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
  padding: 10px 12px;
  border-radius: 10px;
  font-weight: 700;
  text-align: center;
  font-size: 13px;
}

@media (max-width: 600px) {
  .conta-page {
    padding: 105px 16px 115px;
  }

  .conta-header {
    flex-direction: column;
    text-align: center;
  }
}
</style>
