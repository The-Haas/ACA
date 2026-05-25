<template>
  <q-layout view="lHh Lpr lFf" class="main-layout">

    <q-header class="main-header">
      <div class="top-line"></div>

      <q-toolbar class="main-toolbar q-px-md">

        <q-btn
          unelevated
          color="red-14"
          icon="arrow_back"
          label="Voltar"
          class="btn-voltar"
          @click="voltar"
        />

        <div class="logo-area">
          <div class="logo-since">
            SINCE 2024
          </div>

          <div class="logo-card">
            <q-icon name="local_shipping" size="26px" color="orange-5" />

            <div>
              <div class="logo-title">AUTO SOS</div>
              <div class="logo-subtitle">RESGATE 24H</div>
            </div>
          </div>
        </div>

        <div class="header-actions">
          <q-btn
            flat
            round
            icon="notifications_none"
            color="grey-8"
          >
            <q-tooltip>Notificações</q-tooltip>
          </q-btn>

          <q-btn
            outline
            round
            icon="person_outline"
            color="red-14"
          >
            <q-tooltip>Perfil</q-tooltip>
          </q-btn>

          <q-btn
            flat
            round
            icon="logout"
            color="grey-8"
            @click="sair"
          >
            <q-tooltip>Sair</q-tooltip>
          </q-btn>
        </div>

      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="service-page">
        <div class="service-content">

          <div class="service-title">
            Escolha o serviço que precisa:
          </div>

          <p class="service-description">
            Selecione abaixo a opção que melhor descreve o seu problema
            para enviarmos o profissional adequado até você.
          </p>

          <div class="services-grid">
            <q-card
              v-for="service in services"
              :key="service.title"
              class="service-card"
              flat
              @click="selecionarServico(service)"
            >
              <div class="service-icon">
                <q-icon
                  :name="service.icon"
                  size="25px"
                  color="red-14"
                />
              </div>

              <div class="service-name">
                {{ service.title }}
              </div>

              <div
                v-if="service.subtitle"
                class="service-subtitle"
              >
                {{ service.subtitle }}
              </div>
            </q-card>
          </div>

        </div>
      </q-page>
    </q-page-container>

    <q-footer class="main-footer">
      <div class="footer-content">
        © 2024 Auto SOS. Todos os direitos reservados.
      </div>
    </q-footer>

  </q-layout>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const services = [
  {
    title: 'Guincho',
    icon: 'local_shipping'
  },
  {
    title: 'Troca de Pneu',
    icon: 'tire_repair'
  },
  {
    title: 'Chaveiro',
    icon: 'vpn_key'
  },
  {
    title: 'Pane Seca',
    subtitle: '(Combustível)',
    icon: 'local_gas_station'
  },
  {
    title: 'Mecânico',
    icon: 'build'
  },
  {
    title: 'Recarga de Bateria',
    icon: 'battery_charging_full'
  }
]

function voltar () {
  router.back()
}

function sair () {
  localStorage.removeItem('token')
  router.push('/login')
}

function selecionarServico (service) {
  console.log('Serviço selecionado:', service.title)

  // Futuramente você pode redirecionar para outra tela, por exemplo:
  // router.push(`/solicitacao/${service.title}`)
}
</script>

<style lang="scss">
.main-layout {
  background: #f4f5f8;
}

.main-header {
  background: #ffffff;
  color: #1f2937;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}

.top-line {
  height: 5px;
  background: #df0000;
}

.main-toolbar {
  min-height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.btn-voltar {
  border-radius: 8px;
  font-weight: 700;
  padding: 9px 18px;
  box-shadow: 0 8px 18px rgba(223, 0, 0, 0.22);
}

.logo-area {
  position: absolute;
  top: -2px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.logo-since {
  background: #1c1c6b;
  color: #ffffff;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.7px;
  padding: 4px 18px;
  border-radius: 0 0 6px 6px;
  display: inline-block;
}

.logo-card {
  background: #1c1c6b;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 16px;
  border-radius: 5px;
  box-shadow: 0 8px 18px rgba(28, 28, 107, 0.28);
}

.logo-title {
  font-size: 20px;
  font-weight: 900;
  line-height: 20px;
}

.logo-subtitle {
  font-size: 9px;
  letter-spacing: 1.4px;
  opacity: 0.85;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.service-page {
  min-height: calc(100vh - 125px);
  display: flex;
  justify-content: center;
  padding: 65px 20px 70px;
}

.service-content {
  width: 100%;
  max-width: 920px;
  text-align: center;
  margin-top: 30px;
}

.service-title {
  display: inline-block;
  background: #df0000;
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
  padding: 12px 32px;
  border-radius: 18px;
  box-shadow: 0 8px 18px rgba(223, 0, 0, 0.25);
  margin-bottom: 22px;
}

.service-description {
  max-width: 620px;
  margin: 0 auto 45px;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 26px 28px;
}

.service-card {
  height: 122px;
  border-radius: 14px;
  background: #ffffff;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.09);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: 0.2s ease;
  cursor: pointer;
}

.service-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.14);
}

.service-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #ffe1e4;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 13px;
}

.service-name {
  color: #1f2937;
  font-size: 15px;
  font-weight: 700;
}

.service-subtitle {
  color: #6b7280;
  font-size: 12px;
  margin-top: 2px;
}

.main-footer {
  background: #df0000;
  color: #ffffff;
  text-align: center;
}

.footer-content {
  padding: 13px;
  font-size: 13px;
  line-height: 1.4;
}

@media (max-width: 900px) {
  .services-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .service-content {
    max-width: 650px;
  }
}

@media (max-width: 700px) {
  .main-toolbar {
    min-height: 88px;
    align-items: flex-start;
    padding-top: 14px;
  }

  .btn-voltar {
    padding: 8px 12px;
    font-size: 12px;
  }

  .logo-area {
    top: 6px;
  }

  .logo-card {
    padding: 7px 12px;
  }

  .logo-title {
    font-size: 17px;
  }

  .logo-subtitle {
    font-size: 8px;
  }

  .header-actions {
    gap: 0;
  }

  .service-page {
    padding-top: 55px;
  }
}

@media (max-width: 600px) {
  .service-title {
    font-size: 16px;
    padding: 10px 22px;
  }

  .service-description {
    font-size: 13px;
    margin-bottom: 30px;
  }

  .services-grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .service-card {
    height: 115px;
  }
}
</style>