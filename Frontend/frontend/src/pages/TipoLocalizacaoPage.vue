<template>
  <q-page class="tipo-local-page">

    <section class="tipo-local-hero">
      <h1 class="tipo-local-title">
        Como é o local da remoção?
      </h1>

      <p class="tipo-local-description">
        Para garantir que enviamos o equipamento correto, por favor nos informe
        onde seu veículo está localizado.
      </p>
    </section>

    <section class="tipo-local-grid">
      <q-card
        v-for="local in tiposLocalizacao"
        :key="local.id"
        class="tipo-local-card cursor-pointer"
        :class="{ 'tipo-local-card-active': tipoSelecionado?.id === local.id }"
        flat
        @click="selecionarTipo(local)"
      >
        <q-card-section class="tipo-local-content">
          <div class="tipo-local-icon">
            <q-icon :name="local.icon" size="34px" color="red-14" />
          </div>

          <div class="tipo-local-name">
            {{ local.nome }}
          </div>

          <div class="tipo-local-text">
            {{ local.descricao }}
          </div>
        </q-card-section>
      </q-card>
    </section>

    <section class="tipo-local-actions">
      <q-btn
        label="Cancelar"
        unelevated
        color="grey-3"
        text-color="grey-8"
        class="btn-cancelar"
        @click="cancelar"
      />

      <q-btn
        label="Continuar"
        unelevated
        color="red-14"
        class="btn-continuar"
        :disable="!tipoSelecionado"
        @click="continuar"
      />
    </section>

    <q-dialog v-model="mostrarAviso">
      <q-card class="aviso-card">
        <q-card-section class="text-center">
          <q-icon name="warning" size="46px" color="red-14" />

          <div class="text-h6 text-bold q-mt-md">
            Selecione uma opção
          </div>

          <div class="text-grey-7 q-mt-sm">
            Antes de continuar, escolha como é o local onde o veículo está.
          </div>
        </q-card-section>

        <q-card-actions align="center" class="q-pa-md">
          <q-btn
            label="Entendi"
            color="red-14"
            unelevated
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const tipoSelecionado = ref(null)
const mostrarAviso = ref(false)

const tiposLocalizacao = [
  {
    id: 1,
    nome: 'Via Pública',
    descricao: 'Estacionado na rua, acostamento ou vaga pública.',
    icon: 'traffic'
  },
  {
    id: 2,
    nome: 'Garagem Subsolo',
    descricao: 'Estacionamento coberto com acesso limitado por altura.',
    icon: 'garage'
  },
  {
    id: 3,
    nome: 'Garagem Nível da Rua',
    descricao: 'Garagem residencial ou comercial com acesso direto.',
    icon: 'home'
  },
  {
    id: 4,
    nome: 'Ribanceira / Fora da via',
    descricao: 'Veículo em local de difícil acesso ou fora da pista.',
    icon: 'terrain'
  }
]

function selecionarTipo (local) {
  tipoSelecionado.value = local
}

function cancelar () {
  router.push('/home/localizacao')
}

function continuar () {
  if (!tipoSelecionado.value) {
    mostrarAviso.value = true
    return
  }

  localStorage.setItem('tipo_localizacao', JSON.stringify(tipoSelecionado.value))

  console.log('Tipo de localização selecionado:', tipoSelecionado.value)

  router.push('/home/descricao-problema')
}
</script>

<style lang="scss">
.tipo-local-page {
  min-height: calc(100vh - 150px);
  background:
    radial-gradient(circle at top left, rgba(224, 0, 0, 0.08), transparent 300px),
    #f4f5f8;
  padding: 78px 24px 115px;
}

.tipo-local-hero {
  text-align: center;
  max-width: 720px;
  margin: 0 auto 36px;
}

.tipo-local-title {
  margin: 0 0 12px;
  color: #1f2937;
  font-size: 34px;
  font-weight: 900;
  line-height: 1.2;
}

.tipo-local-description {
  color: #6b7280;
  font-size: 15px;
  line-height: 1.6;
  max-width: 560px;
  margin: 0 auto;
}

.tipo-local-grid {
  max-width: 820px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.tipo-local-card {
  background: #ffffff;
  border-radius: 20px;
  border: 2px solid transparent;
  box-shadow: 0 10px 26px rgba(31, 41, 55, 0.09);
  transition: all 0.25s ease;
  min-height: 165px;
  position: relative;
  overflow: hidden;
}

.tipo-local-card::before {
  content: "";
  width: 0;
  height: 5px;
  background: #df0000;
  position: absolute;
  left: 0;
  top: 0;
  transition: width 0.25s ease;
}

.tipo-local-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 36px rgba(31, 41, 55, 0.16);
}

.tipo-local-card:hover::before {
  width: 100%;
}

.tipo-local-card-active {
  border-color: #df0000;
  box-shadow: 0 16px 36px rgba(223, 0, 0, 0.18);
}

.tipo-local-card-active::before {
  width: 100%;
}

.tipo-local-content {
  min-height: 165px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 9px;
  text-align: center;
  padding: 24px;
}

.tipo-local-icon {
  width: 62px;
  height: 62px;
  background: #ffe1e1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.tipo-local-name {
  color: #1f2937;
  font-size: 17px;
  font-weight: 900;
}

.tipo-local-text {
  color: #6b7280;
  font-size: 12px;
  line-height: 1.45;
  max-width: 260px;
}

.tipo-local-actions {
  max-width: 820px;
  margin: 42px auto 0;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.btn-cancelar,
.btn-continuar {
  width: 150px;
  border-radius: 9px;
  font-weight: 900;
  padding: 11px;
}

.btn-continuar {
  box-shadow: 0 8px 18px rgba(223, 0, 0, 0.24);
}

.aviso-card {
  width: 100%;
  max-width: 380px;
  border-radius: 18px;
}

@media (max-width: 700px) {
  .tipo-local-page {
    padding: 105px 16px 115px;
  }

  .tipo-local-title {
    font-size: 27px;
  }

  .tipo-local-description {
    font-size: 14px;
  }

  .tipo-local-grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .tipo-local-card,
  .tipo-local-content {
    min-height: 155px;
  }

  .tipo-local-actions {
    flex-direction: column;
    margin-top: 30px;
  }

  .btn-cancelar,
  .btn-continuar {
    width: 100%;
  }
}
</style>