<template>
  <div v-if="!currentUser">
    <Login @login-success="handleLoginSuccess" />
  </div>
  <div v-else>
    <Layout :active-tab="activeTab" :user="currentUser" @navigate="activeTab = $event" @logout="handleLogout">
      <!-- 1. Dashboard -->
      <Dashboard v-if="activeTab === 'dashboard'" @navigate="activeTab = $event" />

      <!-- 2. Master Data -->
      <Muzakki v-else-if="activeTab === 'muzakki'" />
      <Mustahik v-else-if="activeTab === 'mustahik'" />

      <!-- 3. Perencanaan -->
      <CollectionPlans v-else-if="activeTab === 'collection-plans'" />
      <Programs v-else-if="activeTab === 'programs'" />
      <ProgramControl v-else-if="activeTab === 'program-control'" />

      <!-- 4. Transaksi -->
      <Transactions
        v-else-if="['penerimaan', 'penyaluran', 'operasional'].includes(activeTab)"
        :transaction-type="activeTab === 'operasional' ? 'amil_operasional' : (activeTab as any)"
        :user="currentUser"
      />

      <!-- 5. Pembukuan & Laporan PSAK 109 -->
      <Reports
        v-else-if="[
          'posisi-keuangan', 'perubahan-dana', 'arus-kas',
          'buku-kas', 'buku-besar', 'neraca-saldo', 'mutasi-kas-bank', 'jurnal-umum'
        ].includes(activeTab)"
        :report-type="activeTab"
      />

      <!-- 6. Bagan Akun -->
      <ChartOfAccounts v-else-if="activeTab === 'chart-of-accounts'" />

      <!-- 7. Regulator & Arsip -->
      <BaznasKebumen v-else-if="activeTab === 'baznas'" />
      <DigitalArchive v-else-if="activeTab === 'arsip-digital'" />

      <!-- 8. Sistem & Alat -->
      <KalkulatorZakat v-else-if="activeTab === 'kalkulator-zakat'" />
      <BackupRestore v-else-if="activeTab === 'backup-restore'" />
      <AuditLog v-else-if="activeTab === 'audit-log'" :user="currentUser" />
      <Users v-else-if="activeTab === 'users'" />
      <Settings v-else-if="activeTab === 'settings'" />
    </Layout>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Layout from './components/Layout.vue';
import Login from './views/Login.vue';
import Dashboard from './views/Dashboard.vue';
import Muzakki from './views/Muzakki.vue';
import Mustahik from './views/Mustahik.vue';
import Transactions from './views/Transactions.vue';
import Programs from './views/Programs.vue';
import ProgramControl from './views/ProgramControl.vue';
import CollectionPlans from './views/CollectionPlans.vue';
import Reports from './views/Reports.vue';
import BaznasKebumen from './views/BaznasKebumen.vue';
import DigitalArchive from './views/DigitalArchive.vue';
import KalkulatorZakat from './views/KalkulatorZakat.vue';
import AuditLog from './views/AuditLog.vue';
import Users from './views/Users.vue';
import Settings from './views/Settings.vue';
import BackupRestore from './views/BackupRestore.vue';
import ChartOfAccounts from './views/ChartOfAccounts.vue';

const activeTab = ref('dashboard');
const currentUser = ref<any | null>(null);

onMounted(() => {
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  if (token && userJson) {
    try {
      currentUser.value = JSON.parse(userJson);
    } catch {
      currentUser.value = null;
    }
  }
});

const handleLoginSuccess = (user: any) => {
  currentUser.value = user;
  activeTab.value = 'dashboard';
};

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  currentUser.value = null;
};
</script>
