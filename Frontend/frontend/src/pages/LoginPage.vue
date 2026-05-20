<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="row window-height">

        <!-- Lado esquerdo -->
        <div class="col-12 col-md-6 flex flex-center side-gradient text-white q-pa-xl">
          <div class="text-center" style="max-width: 450px;">

            <div class="logo-box q-mb-xl">
              <div class="row justify-center items-center q-gutter-xs text-warning">
                <q-icon name="star" size="12px" />
                <span class="text-caption text-bold text-white">SINCE 2024</span>
                <q-icon name="star" size="12px" />
              </div>

              <div class="row justify-center items-center q-gutter-sm q-mt-xs">
                <q-icon name="local_shipping" size="45px" />
                <q-icon name="directions_car" size="30px" />
              </div>

              <div class="text-h4 text-bold letter-spacing-2">
                AUTO SOS
              </div>
            </div>

            <div class="text-h3 text-bold q-mb-sm">
              Assistência 24 Horas
            </div>

            <div class="text-h4 text-weight-medium q-mb-lg">
              Onde você estiver.
            </div>

            <p class="text-h6 text-weight-light opacity-80 q-mb-xl">
              Guincho, troca de pneu, chaveiro e muito mais.
              <br>
              Segurança e rapidez para o seu veículo.
            </p>

            <div class="row justify-center q-gutter-lg opacity-70 footer-icons">
              <div class="row items-center">
                <q-icon name="verified_user" class="q-mr-xs" />
                Seguro
              </div>

              <div class="row items-center">
                <q-icon name="bolt" class="q-mr-xs" />
                Rápido
              </div>

              <div class="row items-center">
                <q-icon name="schedule" class="q-mr-xs" />
                24/7
              </div>
            </div>

          </div>
        </div>

        <!-- Lado direito -->
        <div class="col-12 col-md-6 flex flex-center bg-white q-pa-xl">
          <div style="width: 100%; max-width: 420px;">

            <h1 class="text-h4 text-bold q-mb-none text-grey-9">
              Bem-vindo de volta!
            </h1>

            <p class="text-grey-7 q-mb-xl">
              Entre com suas credenciais para acessar sua conta.
            </p>

            <q-form class="q-gutter-y-lg" @submit.prevent="fazerLogin">

              <!-- Campo e-mail -->
              <div>
                <label class="text-bold block q-mb-xs text-grey-8">
                  E-mail
                </label>

                <q-input
                  outlined
                  dense
                  placeholder="Digite seu e-mail"
                  v-model="user"
                  bg-color="grey-1"
                  type="email"
                >
                  <template v-slot:prepend>
                    <q-icon name="person_outline" color="grey-6" />
                  </template>
                </q-input>
              </div>

              <!-- Campo senha -->
              <div>
                <label class="text-bold block q-mb-xs text-grey-8">
                  Senha
                </label>

                <q-input
                  outlined
                  dense
                  :type="mostrarSenha ? 'text' : 'password'"
                  placeholder="Digite sua senha"
                  v-model="password"
                  bg-color="grey-1"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock_outline" color="grey-6" />
                  </template>

                  <template v-slot:append>
                    <q-icon
                      :name="mostrarSenha ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      color="grey-6"
                      @click="mostrarSenha = !mostrarSenha"
                    />
                  </template>
                </q-input>

                <div class="text-right q-mt-xs">
                  <q-btn
                    flat
                    no-caps
                    label="Esqueceu sua senha?"
                    color="red-10"
                    size="sm"
                    dense
                  />
                </div>
              </div>

              <!-- Mensagem de retorno -->
              <div v-if="mensagem" :class="tipoMensagem">
                {{ mensagem }}
              </div>

              <!-- Botão login -->
              <q-btn
                label="ENTRAR"
                class="full-width q-py-md text-bold"
                color="red-14"
                unelevated
                type="submit"
                :loading="carregando"
              />

              <div class="relative-position q-my-xl">
                <q-separator color="grey-3" />

                <div class="absolute-center bg-white q-px-md text-grey-6 text-caption text-weight-medium">
                  Novo por aqui?
                </div>
              </div>

              <!-- Botões de cadastro -->
              <div class="q-gutter-y-md">
                <q-btn
                  outline
                  no-caps
                  label="Criar Conta Pessoal"
                  class="full-width q-py-sm text-grey-9"
                  color="grey-4"
                  @click="router.push('/cadastro-cliente')"
                >
                  <template v-slot:prepend>
                    <q-icon name="person_add_alt" size="20px" color="grey-7" />
                  </template>
                </q-btn>

                <q-btn
                  outline
                  no-caps
                  label="Criar Cadastro Prestador de Serviço"
                  class="full-width q-py-sm border-dashed text-grey-9"
                  color="grey-4"
                  @click="router.push('/cadastro-prestador')"
                >
                  <template v-slot:prepend>
                    <q-icon name="construction" size="20px" color="grey-7" />
                  </template>
                </q-btn>
              </div>

            </q-form>

          </div>
        </div>

      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed, ref } from 'vue'
import { api } from 'boot/axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const user = ref('')
const password = ref('')
const carregando = ref(false)
const mostrarSenha = ref(false)
const mensagem = ref('')
const erro = ref(false)

const tipoMensagem = computed(() => {
  return erro.value
    ? 'mensagem-login mensagem-erro'
    : 'mensagem-login mensagem-sucesso'
})

async function fazerLogin () {
  if (carregando.value) {
    return
  }

  mensagem.value = ''
  erro.value = false

  if (!user.value || !password.value) {
    erro.value = true
    mensagem.value = 'Informe o e-mail e a senha.'
    return
  }

  carregando.value = true

  try {
    const response = await api.post('/login', {
      email: user.value,
      senha: password.value
    })

    console.log('Resposta do login:', response.data)

    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token)

      erro.value = false
      mensagem.value = 'Login realizado com sucesso!'

      setTimeout(() => {
        router.push('/home')
      }, 700)
    } else {
      erro.value = true
      mensagem.value = response.data?.message || 'Login não retornou token.'
    }
  } catch (error) {
    console.error('Erro no login:', error)

    erro.value = true

    if (error.response) {
      mensagem.value = error.response.data?.message || 'E-mail ou senha inválidos.'
    } else if (error.request) {
      mensagem.value = 'Não foi possível conectar com o backend. Verifique se ele está rodando na porta 3000.'
    } else {
      mensagem.value = 'Erro ao tentar fazer login.'
    }
  } finally {
    carregando.value = false
  }
}
</script>

<style lang="scss">
.side-gradient {
  background: linear-gradient(145deg, #e60000 0%, #1c1c3c 100%) !important;
}

.logo-box {
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  padding: 24px;
  border-radius: 16px;
  display: inline-block;
  background: rgba(255, 255, 255, 0.03);
}

.letter-spacing-2 {
  letter-spacing: 2px;
}

.opacity-80 {
  opacity: 0.8;
}

.opacity-70 {
  opacity: 0.7;
}

.border-dashed {
  border-style: dashed !important;
  border-width: 1.5px;
}

.q-field--outlined .q-field__control {
  border-radius: 8px !important;
}

.q-btn--outline:before {
  border: 1px solid #e0e0e0 !important;
}

.mensagem-login {
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

@media (max-width: 1023px) {
  .side-gradient {
    min-height: 50vh;
  }
}
</style>