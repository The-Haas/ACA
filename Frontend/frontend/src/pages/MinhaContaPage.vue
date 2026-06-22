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
          <p class="conta-desc">Edite suas informações pessoais abaixo.</p>
        </div>
      </div>

      <!-- Carregando -->
      <div v-if="carregando" class="estado-container">
        <q-spinner-dots color="red-14" size="48px" />
      </div>

      <template v-else>

        <!-- Dados pessoais -->
        <q-card class="conta-card" flat>
          <q-card-section>
            <div class="secao-titulo">
              <q-icon name="badge" size="20px" color="red-14" />
              Dados Pessoais
            </div>

            <div class="campos-grid">
              <q-input
                v-model="form.nome"
                outlined
                label="Nome completo"
                bg-color="grey-1"
                :error="!!erros.nome"
                :error-message="erros.nome"
              />

              <q-input
                v-model="form.email"
                outlined
                label="E-mail"
                type="email"
                bg-color="grey-1"
                :error="!!erros.email"
                :error-message="erros.email"
              />

              <q-input
                v-model="form.telefone"
                outlined
                label="Telefone"
                bg-color="grey-1"
                mask="(##) #####-####"
                :error="!!erros.telefone"
                :error-message="erros.telefone"
              />
            </div>

            <q-btn
              unelevated
              no-caps
              color="red-14"
              label="Salvar dados"
              class="btn-salvar"
              :loading="salvandoDados"
              @click="salvarDados"
            />
          </q-card-section>
        </q-card>

        <!-- Alterar senha -->
        <q-card class="conta-card" flat>
          <q-card-section>
            <div class="secao-titulo">
              <q-icon name="lock" size="20px" color="red-14" />
              Alterar Senha
            </div>

            <div class="campos-grid">
              <q-input
                v-model="senha.nova"
                outlined
                label="Nova senha"
                :type="mostrarSenha ? 'text' : 'password'"
                bg-color="grey-1"
                :error="!!erros.senha"
                :error-message="erros.senha"
              >
                <template #append>
                  <q-icon
                    :name="mostrarSenha ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="mostrarSenha = !mostrarSenha"
                  />
                </template>
              </q-input>

              <q-input
                v-model="senha.confirmacao"
                outlined
                label="Confirmar nova senha"
                :type="mostrarSenha ? 'text' : 'password'"
                bg-color="grey-1"
                :error="!!erros.confirmacao"
                :error-message="erros.confirmacao"
              />
            </div>

            <div class="senha-dica">
              Mínimo 8 caracteres, 1 letra maiúscula, 1 número e 1 caractere especial.
            </div>

            <q-btn
              unelevated
              no-caps
              color="red-14"
              label="Alterar senha"
              class="btn-salvar"
              :loading="salvandoSenha"
              @click="salvarSenha"
            />
          </q-card-section>
        </q-card>

      </template>

    </section>

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

const form = reactive({ nome: '', email: '', telefone: '' })
const senha = reactive({ nova: '', confirmacao: '' })
const erros = reactive({ nome: '', email: '', telefone: '', senha: '', confirmacao: '' })

let idCliente = null

function decodeJWT (token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

onMounted(async () => {
  const token = localStorage.getItem('token')
  const payload = decodeJWT(token)
  idCliente = payload?.id

  if (!idCliente) {
    $q.notify({ type: 'negative', message: 'Sessão expirada. Faça login novamente.' })
    return
  }

  try {
    const response = await api.get(`/clientes/${idCliente}`)
    const c = response.data
    form.nome = c.nome || ''
    form.email = c.email || ''
    form.telefone = c.telefone || ''
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Erro ao carregar dados da conta.' })
  } finally {
    carregando.value = false
  }
})

function limparErros () {
  erros.nome = ''
  erros.email = ''
  erros.telefone = ''
  erros.senha = ''
  erros.confirmacao = ''
}

async function salvarDados () {
  limparErros()

  if (!form.nome.trim()) { erros.nome = 'Nome obrigatório.'; return }
  if (!form.email.trim()) { erros.email = 'E-mail obrigatório.'; return }
  if (!form.telefone.trim()) { erros.telefone = 'Telefone obrigatório.'; return }

  salvandoDados.value = true

  try {
    const response = await api.patch(`/clientes/${idCliente}`, {
      nome: form.nome.trim(),
      email: form.email.trim(),
      telefone: form.telefone.trim()
    })

    if (!response.data.success) {
      const msg = response.data.message || 'Erro ao salvar.'
      if (msg.toLowerCase().includes('nome')) erros.nome = msg
      else if (msg.toLowerCase().includes('email')) erros.email = msg
      else if (msg.toLowerCase().includes('telefone')) erros.telefone = msg
      else $q.notify({ type: 'negative', message: msg })
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
  limparErros()

  if (!senha.nova) { erros.senha = 'Informe a nova senha.'; return }
  if (senha.nova !== senha.confirmacao) { erros.confirmacao = 'As senhas não coincidem.'; return }

  salvandoSenha.value = true

  try {
    const response = await api.patch(`/clientes/${idCliente}`, {
      senha: senha.nova
    })

    if (!response.data.success) {
      const msg = response.data.message || 'Erro ao alterar senha.'
      erros.senha = msg
      return
    }

    $q.notify({ type: 'positive', message: 'Senha alterada com sucesso!' })
    senha.nova = ''
    senha.confirmacao = ''

  } catch (err) {
    const msg = err?.response?.data?.message || 'Erro de conexão com o servidor.'
    $q.notify({ type: 'negative', message: msg })
  } finally {
    salvandoSenha.value = false
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
