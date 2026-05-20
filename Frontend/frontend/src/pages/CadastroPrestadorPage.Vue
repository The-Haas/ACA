<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="cadastro-page flex flex-center q-pa-md">
        <q-card class="cadastro-card">
          <q-card-section class="text-center">
            <q-icon name="construction" size="48px" color="red-14" />

            <div class="text-h4 text-bold text-grey-9 q-mt-md">
              Cadastro de Prestador
            </div>

            <div class="text-grey-7 q-mt-sm">
              Preencha os dados da empresa prestadora de serviço.
            </div>
          </q-card-section>

          <q-card-section>
            <q-form class="q-gutter-md" @submit.prevent="cadastrarPrestador">
              <q-input
                outlined
                dense
                label="CNPJ"
                v-model="form.cnpj"
                mask="##.###.###/####-##"
                unmasked-value
              />

              <q-input
                outlined
                dense
                label="Razão social"
                v-model="form.razao_social"
              />

              <q-input
                outlined
                dense
                label="Nome fantasia"
                v-model="form.nome_fantasia"
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

              <div>
                <div class="text-bold text-grey-8 q-mb-sm">
                  Categorias de serviço
                </div>

                <div v-if="categorias.length > 0" class="q-gutter-sm">
                  <q-checkbox
                    v-for="categoria in categorias"
                    :key="categoria.id"
                    v-model="form.categorias_servico"
                    :val="categoria.id"
                    :label="categoria.nome"
                    color="red-14"
                  />
                </div>

                <q-input
                  v-else
                  outlined
                  dense
                  label="IDs das categorias de serviço"
                  hint="Exemplo: 1, 3"
                  v-model="categoriasDigitadas"
                />
              </div>

              <div v-if="mensagem" :class="tipoMensagem">
                {{ mensagem }}
              </div>

              <q-btn
                label="Cadastrar Prestador"
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
import { computed, onMounted, ref } from 'vue'
import { api } from 'boot/axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const carregando = ref(false)
const mostrarSenha = ref(false)
const mensagem = ref('')
const erro = ref(false)
const categorias = ref([])
const categoriasDigitadas = ref('')

const form = ref({
  cnpj: '',
  razao_social: '',
  nome_fantasia: '',
  email: '',
  senha: '',
  telefone: '',
  categorias_servico: []
})

const tipoMensagem = computed(() => {
  return erro.value
    ? 'mensagem mensagem-erro'
    : 'mensagem mensagem-sucesso'
})

onMounted(() => {
  buscarCategorias()
})

async function buscarCategorias () {
  try {
    const response = await api.get('/categoriaservico')
    categorias.value = response.data || []
  } catch (error) {
    categorias.value = []
    console.error('Erro ao buscar categorias:', error)
  }
}

function obterCategoriasSelecionadas () {
  if (categorias.value.length > 0) {
    return form.value.categorias_servico
  }

  return categoriasDigitadas.value
    .split(',')
    .map(item => Number(item.trim()))
    .filter(item => !Number.isNaN(item))
}

async function cadastrarPrestador () {
  mensagem.value = ''
  erro.value = false

  const categoriasSelecionadas = obterCategoriasSelecionadas()

  if (
    !form.value.cnpj ||
    !form.value.razao_social ||
    !form.value.nome_fantasia ||
    !form.value.email ||
    !form.value.telefone ||
    !form.value.senha
  ) {
    erro.value = true
    mensagem.value = 'Preencha todos os campos.'
    return
  }

  if (categoriasSelecionadas.length === 0) {
    erro.value = true
    mensagem.value = 'Selecione pelo menos uma categoria de serviço.'
    return
  }

  carregando.value = true

  try {
    const response = await api.post('/prestadores', {
      cnpj: form.value.cnpj,
      razao_social: form.value.razao_social,
      nome_fantasia: form.value.nome_fantasia,
      email: form.value.email,
      senha: form.value.senha,
      telefone: form.value.telefone,
      categorias_servico: categoriasSelecionadas
    })

    if (response.data.success) {
      erro.value = false
      mensagem.value = response.data.message || 'Prestador cadastrado com sucesso!'

      setTimeout(() => {
        router.push('/login')
      }, 1000)
    } else {
      erro.value = true
      mensagem.value = response.data.message || 'Erro ao cadastrar prestador.'
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
  max-width: 520px;
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