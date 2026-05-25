<template>
  <q-layout view="lHh Lpr lFf" class="main-layout">

    <q-header class="main-header">
      <div class="top-line"></div>

      <q-toolbar class="main-toolbar q-px-md q-px-md-lg">

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
            <q-icon name="local_shipping" size="30px" color="orange-5" />

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

            <q-menu
              anchor="bottom right"
              self="top right"
              transition-show="jump-down"
              transition-hide="jump-up"
            >
              <q-list class="profile-menu">

                <q-item
                  clickable
                  v-close-popup
                >
                  <q-item-section avatar>
                    <q-icon name="support_agent" color="red-14" />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label>Chamados</q-item-label>
                    <q-item-label caption>
                      Acompanhe ou gerencie atendimentos
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-separator />

                <q-item
                  clickable
                  v-close-popup
                >
                  <q-item-section avatar>
                    <q-icon name="manage_accounts" color="red-14" />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label>Minha conta</q-item-label>
                    <q-item-label caption>
                      Alterar dados do perfil
                    </q-item-label>
                  </q-item-section>
                </q-item>

              </q-list>
            </q-menu>
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
      <router-view />
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

function voltar () {
  router.back()
}

function sair () {
  localStorage.removeItem('token')
  router.push('/login')
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
  height: 7px;
  background: #df0000;
}

.main-toolbar {
  min-height: 88px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.btn-voltar {
  border-radius: 10px;
  font-weight: 700;
  padding: 10px 18px;
  box-shadow: 0 8px 18px rgba(223, 0, 0, 0.22);
}

.logo-area {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.logo-since {
  background: #1c1c6b;
  color: white;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.8px;
  padding: 4px 18px;
  border-radius: 0 0 6px 6px;
  display: inline-block;
}

.logo-card {
  background: #1c1c6b;
  color: white;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px 17px;
  border-radius: 5px;
  box-shadow: 0 8px 18px rgba(28, 28, 107, 0.28);
}

.logo-title {
  font-size: 21px;
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

.profile-menu {
  min-width: 255px;
  padding: 6px 0;
  border-radius: 10px;
}

.profile-menu .q-item {
  padding: 12px 15px;
}

.profile-menu .q-item__label {
  font-weight: 700;
  color: #1f2937;
}

.profile-menu .q-item__label--caption {
  font-size: 12px;
  font-weight: 400;
  color: #6b7280;
}

.main-footer {
  background: #df0000;
  color: #ffffff;
  text-align: center;
}

.footer-content {
  padding: 15px;
  font-size: 14px;
  line-height: 1.4;
}

@media (max-width: 700px) {
  .main-toolbar {
    min-height: 120px;
    align-items: flex-start;
    padding-top: 16px;
  }

  .btn-voltar {
    padding: 8px 12px;
    font-size: 12px;
  }

  .logo-area {
    top: 58px;
  }

  .logo-card {
    padding: 8px 13px;
  }

  .logo-title {
    font-size: 18px;
  }

  .header-actions {
    gap: 0;
  }
}
</style>