<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="cadastro-page flex flex-center q-pa-md">
        <q-card class="cadastro-card">
          <q-card-section class="text-center">
            <q-icon name="person_add_alt" size="48px" color="red-14" />

            <div class="text-h4 text-bold text-grey-9 q-mt-md">
              Cadastro de Cliente
            </div>

            <div class="text-grey-7 q-mt-sm">
              Preencha seus dados para criar sua conta pessoal.
            </div>
          </q-card-section>

          <q-card-section>
            <q-form class="q-gutter-md" @submit.prevent="cadastrarCliente">
              <q-input
                outlined
                dense
                label="Nome completo"
                v-model="form.nome"
              />

              <q-input
                outlined
                dense
                label="CPF"
                v-model="form.cpf"
                mask="###.###.###-##"
                unmasked-value
              />

              <q-input
                outlined
                dense
                label="E-mail"
                type="email"
                v-model="form.email"
              />

              <q-input
                outlined
                dense
                label="Telefone"
                v-model="form.telefone"
                mask="(##) #####-####"
                unmasked-value
              />

              <q-input
                outlined
                dense
                label="Senha"
                :type="mostrarSenha ? 'text' : 'password'"
                v-model="form.senha"
              >
                <template v-slot:append>
                  <q-icon
                    :name="mostrarSenha ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="mostrarSenha = !mostrarSenha"
                  />
                </template>
              </q-input>

              <div v-if="mensagem" :class="tipoMensagem">
                {{ mensagem }}
              </div>

              <q-btn
                label="Cadastrar Cliente"
                color="red-14"
                unelevated
                class="full-width q-py-md text-bold"
                type="submit"
                :loading="carregando"
              />

              <q-btn
                label="Voltar para Login"
                flat
                no-caps
                color="grey-8"
                class="full-width"
                @click="router.push('/login')"
              />
            </q-form>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed, ref } from 'vue'
import { api } from 'boot/axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const carregando = ref(false)
const mostrarSenha = ref(false)
const mensagem = ref('')
const erro = ref(false)

const form = ref({
  nome: '',
  cpf: '',
  email: '',
  telefone: '',
  senha: ''
})

const tipoMensagem = computed(() => {
  return erro.value
    ? 'mensagem mensagem-erro'
    : 'mensagem mensagem-sucesso'
})

async function cadastrarCliente () {
  mensagem.value = ''
  erro.value = false

  if (!form.value.nome || !form.value.cpf || !form.value.email || !form.value.telefone || !form.value.senha) {
    erro.value = true
    mensagem.value = 'Preencha todos os campos.'
    return
  }

  carregando.value = true

  try {
    const response = await api.post('/clientes', {
      nome: form.value.nome,
      cpf: form.value.cpf,
      email: form.value.email,
      telefone: form.value.telefone,
      senha: form.value.senha
    })

    if (response.data.success) {
      erro.value = false
      mensagem.value = response.data.message || 'Cliente cadastrado com sucesso!'

      setTimeout(() => {
        router.push('/login')
      }, 1000)
    } else {
      erro.value = true
      mensagem.value = response.data.message || 'Erro ao cadastrar cliente.'
    }
  } catch (error) {
    erro.value = true
    mensagem.value = error.response?.data?.message || 'Erro ao conectar com o servidor.'
  } finally {
    carregando.value = false
  }
}
</script>

<style lang="scss">
.cadastro-page {
  min-height: 100vh;
  background: linear-gradient(145deg, #e60000 0%, #1c1c3c 100%);
}

.cadastro-card {
  width: 100%;
  max-width: 480px;
  border-radius: 18px;
  padding: 16px;
}

.mensagem {
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  text-align: center;
}

.mensagem-erro {
  background: #ffe5e5;
  color: #b00020;
  border: 1px solid #ffb3b3;
}

.mensagem-sucesso {
  background: #e8f5e9;
  color: #1b5e20;
  border: 1px solid #a5d6a7;
}
</style>