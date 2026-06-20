<template>
  <q-page class="descricao-page">

    <section class="descricao-hero">
      <div class="descricao-badge">
        Qual o problema do veículo?
      </div>

      <p class="descricao-description">
        Descreva com detalhes o que aconteceu para que o prestador consiga entender melhor a situação.
      </p>
    </section>

    <section class="descricao-wrapper">
      <q-card class="descricao-card" flat>
        <q-card-section class="text-center">
          <div class="descricao-icon">
            <q-icon name="edit_note" size="42px" color="red-14" />
          </div>

          <div class="descricao-title">
            Descreva com detalhes o problema do veículo
          </div>

          <div class="descricao-subtitle">
            Informe sintomas, barulhos, local do problema ou qualquer observação importante.
          </div>
        </q-card-section>

        <q-card-section>
          <div class="veiculo-label">
            Selecione o veículo
          </div>

          <q-select
            v-model="veiculoSelecionado"
            :options="veiculos"
            option-value="id_veiculo"
            option-label="label"
            outlined
            emit-value
            map-options
            placeholder="Selecione um veículo"
            class="veiculo-select q-mb-md"
            bg-color="grey-2"
            :loading="carregandoVeiculos"
            no-options-label="Nenhum veículo cadastrado"
          >
            <template #option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-icon name="directions_car" color="red-14" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.descricao }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.placa }} · {{ scope.opt.categoria }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-input
            v-model="descricao"
            type="textarea"
            outlined
            autogrow
            counter
            maxlength="500"
            placeholder="Exemplo: O carro parou na estrada, não liga mais e aparece uma luz no painel..."
            class="descricao-input"
            bg-color="grey-2"
          />
        </q-card-section>

        <q-card-section v-if="mensagem">
          <div class="mensagem-erro">
            {{ mensagem }}
          </div>
        </q-card-section>
      </q-card>
    </section>

    <section class="descricao-actions">
      <q-btn
        label="Cancelar"
        unelevated
        color="grey-3"
        text-color="grey-8"
        class="btn-cancelar"
        @click="cancelar"
      />

      <q-btn
        color="red-14"
        unelevated
        class="btn-continuar"
        @click="continuar"
      >
        Continuar
        <q-icon name="arrow_forward" size="18px" class="q-ml-xs" />
      </q-btn>
    </section>

  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'src/boot/axios'

const router = useRouter()

const descricao = ref('')
const mensagem = ref('')
const veiculos = ref([])
const veiculoSelecionado = ref(null)
const carregandoVeiculos = ref(false)

onMounted(() => {
  carregarVeiculos()
})

async function carregarVeiculos () {
  carregandoVeiculos.value = true

  try {
    const response = await api.get('/veiculos/meus')

    if (response.data.success) {
      veiculos.value = response.data.data.map(v => ({
        ...v,
        label: `${v.descricao} · ${v.placa}`
      }))
    }
  } catch (err) {
    console.error('Erro ao carregar veículos:', err)
  } finally {
    carregandoVeiculos.value = false
  }
}

function cancelar () {
  router.push('/home/tipo-localizacao')
}

function continuar () {
  mensagem.value = ''

  if (!veiculoSelecionado.value) {
    mensagem.value = 'Selecione um veículo para continuar.'
    return
  }

  if (!descricao.value || descricao.value.trim().length < 10) {
    mensagem.value = 'Descreva o problema com pelo menos 10 caracteres.'
    return
  }

  // Salva o veículo completo para uso nas próximas telas
  const veiculo = veiculos.value.find(v => v.id_veiculo === veiculoSelecionado.value)
  localStorage.setItem('veiculo_selecionado', JSON.stringify(veiculo))
  localStorage.setItem('descricao_problema', descricao.value.trim())

  router.push('/home/resumo-chamado')
}
</script>

<style lang="scss">
.descricao-page {
  min-height: calc(100vh - 150px);
  background:
    radial-gradient(circle at top left, rgba(224, 0, 0, 0.08), transparent 300px),
    #f4f5f8;
  padding: 78px 24px 115px;
}

.descricao-hero {
  text-align: center;
  max-width: 760px;
  margin: 0 auto 30px;
}

.descricao-badge {
  display: inline-block;
  background: #df0000;
  color: #ffffff;
  padding: 15px 36px;
  border-radius: 10px;
  font-size: 20px;
  font-weight: 900;
  box-shadow: 0 10px 22px rgba(223, 0, 0, 0.24);
}

.descricao-description {
  max-width: 560px;
  margin: 12px auto 0;
  color: #6b7280;
  font-size: 15px;
  line-height: 1.6;
}

.descricao-wrapper {
  max-width: 560px;
  margin: 0 auto;
}

.descricao-card {
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid #edf0f4;
  box-shadow: 0 12px 30px rgba(31, 41, 55, 0.12);
  overflow: hidden;
  position: relative;
}

.descricao-card::before {
  content: "";
  width: 100%;
  height: 7px;
  background: #df0000;
  position: absolute;
  top: 0;
  left: 0;
}

.descricao-icon {
  width: 78px;
  height: 78px;
  background: #ffe1e1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px auto 14px;
}

.descricao-title {
  color: #1f2937;
  font-size: 20px;
  font-weight: 900;
  line-height: 1.3;
}

.descricao-subtitle {
  color: #6b7280;
  font-size: 13px;
  line-height: 1.5;
  max-width: 390px;
  margin: 8px auto 0;
}

.veiculo-label {
  color: #1f2937;
  font-weight: 900;
  font-size: 14px;
  margin-bottom: 8px;
}

.veiculo-select {
  border-radius: 14px;
}

.descricao-input .q-field__control {
  min-height: 190px;
  border-radius: 14px !important;
}

.descricao-input textarea {
  min-height: 165px !important;
  resize: none;
  color: #1f2937;
  font-weight: 500;
}

.mensagem-erro {
  background: #ffe5e5;
  color: #b00020;
  border: 1px solid #ffb3b3;
  padding: 12px;
  border-radius: 10px;
  font-weight: 700;
  text-align: center;
}

.descricao-actions {
  max-width: 560px;
  margin: 26px auto 0;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.btn-cancelar,
.btn-continuar {
  width: 160px;
  border-radius: 9px;
  font-weight: 900;
  padding: 11px;
}

.btn-continuar {
  box-shadow: 0 8px 18px rgba(223, 0, 0, 0.24);
}

@media (max-width: 700px) {
  .descricao-page {
    padding: 105px 16px 115px;
  }

  .descricao-badge {
    font-size: 17px;
    padding: 13px 22px;
  }

  .descricao-description {
    font-size: 14px;
  }

  .descricao-title {
    font-size: 18px;
  }

  .descricao-actions {
    flex-direction: column;
  }

  .btn-cancelar,
  .btn-continuar {
    width: 100%;
  }
}
</style>