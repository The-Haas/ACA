<template>
  <q-page class="home-page">

    <!-- Título da tela -->
    <section class="home-hero">
      <div class="service-badge">
        Escolha o serviço que precisa
      </div>

      <h1 class="home-title">
        Atendimento rápido para o seu veículo
      </h1>

      <p class="home-description">
        Selecione abaixo a opção que melhor descreve o seu problema.
        Assim podemos encaminhar o profissional mais adequado até você.
      </p>
    </section>

    <!-- Cards de serviços -->
    <section class="services-grid">
      <q-card
        v-for="servico in servicos"
        :key="servico.id"
        class="service-card cursor-pointer"
        flat
        @click="selecionarServico(servico)"
      >
        <q-card-section class="service-content">
          <div class="service-icon">
            <q-icon :name="servico.icon" size="42px" color="red-14" />
          </div>

          <div class="service-name">
            {{ servico.nome }}
          </div>

          <div class="service-text">
            {{ servico.descricao }}
          </div>
        </q-card-section>
      </q-card>
    </section>

    <!-- Informações extras -->
    <section class="help-section">
      <q-card class="help-card" flat>
        <q-icon name="schedule" size="34px" color="red-14" />

        <div>
          <div class="help-title">Atendimento 24 horas</div>
          <div class="help-text">Solicite ajuda quando precisar.</div>
        </div>
      </q-card>

      <q-card class="help-card" flat>
        <q-icon name="verified_user" size="34px" color="red-14" />

        <div>
          <div class="help-title">Serviço mais seguro</div>
          <div class="help-text">Profissionais cadastrados na plataforma.</div>
        </div>
      </q-card>

      <q-card class="help-card" flat>
        <q-icon name="place" size="34px" color="red-14" />

        <div>
          <div class="help-title">Localização facilitada</div>
          <div class="help-text">Informe onde está e receba atendimento.</div>
        </div>
      </q-card>
    </section>

    <!-- Modal de confirmação do serviço -->
    <q-dialog v-model="modalServico">
      <q-card class="dialog-card">
        <q-card-section class="text-center">
          <div class="dialog-icon">
            <q-icon :name="servicoSelecionado.icon" size="46px" color="red-14" />
          </div>

          <div class="text-h5 text-bold q-mt-md text-grey-9">
            {{ servicoSelecionado.nome }}
          </div>

          <div class="text-grey-7 q-mt-sm">
            {{ servicoSelecionado.descricao }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-banner rounded class="bg-red-1 text-red-10">
            Você selecionou este serviço. Na próxima etapa, será necessário
            compartilhar sua localização para encontrarmos um profissional próximo.
          </q-banner>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            label="Cancelar"
            color="grey-8"
            v-close-popup
          />

          <q-btn
            unelevated
            label="Continuar"
            color="red-14"
            @click="continuarServico"
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

const modalServico = ref(false)

const servicoSelecionado = ref({
  id: null,
  nome: '',
  descricao: '',
  icon: ''
})

const servicos = [
  {
    id: 1,
    nome: 'Guincho',
    descricao: 'Transporte ou remoção do veículo.',
    icon: 'local_shipping'
  },
  {
    id: 2,
    nome: 'Troca de Pneu',
    descricao: 'Ajuda rápida em caso de pneu furado.',
    icon: 'tire_repair'
  },
  {
    id: 3,
    nome: 'Chaveiro',
    descricao: 'Problemas com chave ou abertura do veículo.',
    icon: 'vpn_key'
  },
  {
    id: 4,
    nome: 'Pane Seca',
    descricao: 'Auxílio em caso de falta de combustível.',
    icon: 'local_gas_station'
  },
  {
    id: 5,
    nome: 'Mecânico',
    descricao: 'Suporte para falhas e problemas mecânicos.',
    icon: 'build'
  },
  {
    id: 6,
    nome: 'Recarga de Bateria',
    descricao: 'Ajuda para bateria fraca ou descarregada.',
    icon: 'battery_charging_full'
  }
]

function selecionarServico (servico) {
  servicoSelecionado.value = servico
  modalServico.value = true
}

function continuarServico () {
  localStorage.setItem('servico_selecionado', JSON.stringify(servicoSelecionado.value))

  modalServico.value = false

  router.push('/home/localizacao')
}
</script>

<style lang="scss">
.home-page {
  min-height: calc(100vh - 150px);
  background:
    radial-gradient(circle at top left, rgba(224, 0, 0, 0.08), transparent 300px),
    #f4f5f8;
  padding: 78px 24px 115px;
}

.home-hero {
  text-align: center;
  max-width: 760px;
  margin: 0 auto 44px;
}

.service-badge {
  display: inline-block;
  background: #df0000;
  color: #ffffff;
  padding: 15px 36px;
  border-radius: 999px;
  font-size: 20px;
  font-weight: 900;
  box-shadow: 0 10px 20px rgba(223, 0, 0, 0.25);
  transform: rotate(-1deg);
}

.home-title {
  margin: 28px 0 12px;
  font-size: 38px;
  font-weight: 900;
  color: #1f2937;
  line-height: 1.15;
}

.home-description {
  max-width: 660px;
  margin: 0 auto;
  color: #6b7280;
  font-size: 17px;
  line-height: 1.6;
}

.services-grid {
  max-width: 1050px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 26px;
}

.service-card {
  min-height: 210px;
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid #edf0f4;
  box-shadow: 0 9px 24px rgba(31, 41, 55, 0.08);
  overflow: hidden;
  position: relative;
  transition: all 0.25s ease;
}

.service-card::before {
  content: "";
  width: 0;
  height: 5px;
  background: #df0000;
  position: absolute;
  top: 0;
  left: 0;
  transition: width 0.25s ease;
}

.service-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 18px 38px rgba(31, 41, 55, 0.15);
}

.service-card:hover::before {
  width: 100%;
}

.service-content {
  min-height: 210px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  text-align: center;
}

.service-icon {
  width: 78px;
  height: 78px;
  border-radius: 50%;
  background: #ffe1e1;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 6px;
}

.service-name {
  font-size: 21px;
  font-weight: 900;
  color: #1f2937;
}

.service-text {
  font-size: 14px;
  color: #6b7280;
  max-width: 230px;
  line-height: 1.4;
}

.help-section {
  max-width: 1050px;
  margin: 42px auto 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.help-card {
  background: #ffffff;
  border-radius: 18px;
  padding: 18px;
  border: 1px solid #edf0f4;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 6px 18px rgba(31, 41, 55, 0.05);
}

.help-title {
  font-size: 15px;
  font-weight: 900;
  color: #1f2937;
}

.help-text {
  font-size: 13px;
  color: #6b7280;
}

.dialog-card {
  width: 100%;
  max-width: 430px;
  border-radius: 20px;
}

.dialog-icon {
  width: 86px;
  height: 86px;
  background: #ffe1e1;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
}

@media (max-width: 900px) {
  .services-grid,
  .help-section {
    grid-template-columns: repeat(2, 1fr);
  }

  .home-title {
    font-size: 31px;
  }
}

@media (max-width: 600px) {
  .home-page {
    padding: 105px 16px 110px;
  }

  .service-badge {
    font-size: 16px;
    padding: 12px 22px;
  }

  .home-title {
    font-size: 27px;
  }

  .home-description {
    font-size: 15px;
  }

  .services-grid,
  .help-section {
    grid-template-columns: 1fr;
  }

  .service-card {
    min-height: 180px;
  }

  .service-content {
    min-height: 180px;
  }
}
</style>