<template>
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
</template>

<script setup>
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

function selecionarServico (service) {
  console.log('Serviço selecionado:', service.title)
}
</script>

<style lang="scss">
.service-page {
  min-height: calc(100vh - 155px);
  display: flex;
  justify-content: center;
  padding: 65px 20px 70px;
  background: #f4f5f8;
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

@media (max-width: 900px) {
  .services-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .service-content {
    max-width: 650px;
  }
}

@media (max-width: 600px) {
  .service-page {
    padding-top: 55px;
  }

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