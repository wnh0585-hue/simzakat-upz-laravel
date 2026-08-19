<template>
  <div class="app-layout">
    <!-- Mobile Overlay -->
    <div v-if="mobileOpen" class="fixed inset-0 bg-black/50 z-40" @click="mobileOpen = false"></div>

    <!-- SIDEBAR -->
    <aside :class="['sidebar', { open: mobileOpen }]">
      <!-- Header -->
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <AppLogo :size="42" />
          <div class="sidebar-logo-text">
            <h2>SIMZAKAT</h2>
            <p>UPZ KEMENAG KEBUMEN</p>
          </div>
        </div>

        <div class="sidebar-user">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div class="user-name">{{ user?.name || 'Administrator' }}</div>
              <div class="user-email">{{ user?.email || 'admin@kemenag.go.id' }}</div>
            </div>
            <span class="badge badge-green" style="font-size: 10px;">{{ user?.role || 'Admin' }}</span>
          </div>
        </div>
      </div>

      <!-- Nav Items -->
      <nav class="sidebar-nav">
        <div v-for="group in navGroups" :key="group.label">
          <div class="nav-section-label">{{ group.label }}</div>
          <div
            v-for="item in group.items"
            :key="item.key"
            :class="['nav-item', { active: activeTab === item.key }]"
            @click="navigate(item.key)"
          >
            <component :is="item.icon" :size="17" style="flex-shrink: 0;" />
            <span style="flex: 1;">{{ item.label }}</span>
            <ChevronRight v-if="activeTab === item.key" :size="14" style="opacity: 0.7;" />
          </div>
        </div>
      </nav>

      <!-- Footer -->
      <div class="sidebar-footer">
        <button class="btn-logout" @click="logout">
          <LogOut :size="16" /> Keluar (Logout)
        </button>
      </div>
    </aside>

    <!-- MAIN CONTENT -->
    <div class="main-content">
      <header class="topbar">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div>
            <div class="topbar-title">{{ pageTitle }}</div>
            <div class="topbar-breadcrumb">SIMZAKAT » {{ pageTitle }}</div>
          </div>
        </div>
        <div class="topbar-badges">
          <span class="badge badge-blue">
            <UserCheck :size="13" style="margin-right: 4px;" /> Hak Akses: {{ user?.role || 'Admin' }}
          </span>
          <span class="badge badge-green">
            <CheckCircle :size="13" style="margin-right: 4px;" /> Sistem Aktif (PSAK 109)
          </span>
        </div>
      </header>

      <main class="page-content">
        <slot></slot>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import AppLogo from './AppLogo.vue';
import {
  LayoutDashboard,
  Users,
  HeartHandshake,
  Target,
  FolderKanban,
  ClipboardCheck,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
  BookOpen,
  FileSpreadsheet,
  RefreshCw,
  Scale,
  BarChart3,
  TrendingUp,
  FileText,
  Landmark,
  Archive,
  Calculator,
  Database,
  History,
  ShieldCheck,
  Settings as SettingsIcon,
  LogOut,
  CheckCircle,
  ChevronRight,
  UserCheck,
} from '@lucide/vue';

const props = defineProps<{
  activeTab: string;
  user: any;
}>();

const emit = defineEmits<{
  (e: 'navigate', tab: string): void;
  (e: 'logout'): void;
}>();

const mobileOpen = ref(false);

const navGroups = [
  {
    label: 'MENU UTAMA',
    items: [
      { key: 'dashboard', label: 'Ikhtisar Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'DATA MASTER',
    items: [
      { key: 'muzakki', label: 'Data Muzakki', icon: Users },
      { key: 'mustahik', label: 'Data Mustahik', icon: HeartHandshake },
    ],
  },
  {
    label: 'PERENCANAAN',
    items: [
      { key: 'collection-plans', label: 'Rencana Penghimpunan', icon: Target },
      { key: 'programs', label: 'Program Penyaluran', icon: FolderKanban },
      { key: 'program-control', label: 'Kontrol Program', icon: ClipboardCheck },
    ],
  },
  {
    label: 'TRANSAKSI',
    items: [
      { key: 'penerimaan', label: 'Penerimaan Dana', icon: ArrowDownLeft },
      { key: 'penyaluran', label: 'Penyaluran Dana', icon: ArrowUpRight },
      { key: 'operasional', label: 'Pengeluaran Operasional', icon: TrendingDown },
    ],
  },
  {
    label: 'PEMBUKUAN',
    items: [
      { key: 'chart-of-accounts', label: 'Chart of Accounts', icon: BookOpen },
      { key: 'buku-kas', label: 'Buku Kas Umum', icon: FileSpreadsheet },
      { key: 'mutasi-kas-bank', label: 'Mutasi Kas & Bank', icon: RefreshCw },
      { key: 'jurnal-umum', label: 'Jurnal Umum', icon: Scale },
      { key: 'buku-besar', label: 'Buku Besar', icon: BarChart3 },
      { key: 'neraca-saldo', label: 'Neraca Saldo', icon: TrendingUp },
    ],
  },
  {
    label: 'LAPORAN PSAK 109',
    items: [
      { key: 'posisi-keuangan', label: 'Posisi Keuangan', icon: FileText },
      { key: 'perubahan-dana', label: 'Perubahan Dana', icon: FileText },
      { key: 'arus-kas', label: 'Arus Kas', icon: FileText },
    ],
  },
  {
    label: 'REGULATOR & ARSIP',
    items: [
      { key: 'baznas', label: 'BAZNAS Kebumen', icon: Landmark },
      { key: 'arsip-digital', label: 'Arsip Digital', icon: Archive },
    ],
  },
  {
    label: 'SISTEM & ALAT',
    items: [
      { key: 'kalkulator-zakat', label: 'Kalkulator Zakat', icon: Calculator },
      { key: 'backup-restore', label: 'Backup & Restore', icon: Database },
      { key: 'audit-log', label: 'Log Aktivitas User', icon: History },
      { key: 'users', label: 'Manajemen Pengguna', icon: ShieldCheck },
      { key: 'settings', label: 'Pengaturan Sistem', icon: SettingsIcon },
    ],
  },
];

const titleMap: Record<string, string> = {
  dashboard: 'Ikhtisar Dashboard Utama',
  muzakki: 'Data Muzakki / Donatur',
  mustahik: 'Data Mustahik (Penerima 8 Asnaf)',
  penerimaan: 'Penerimaan Dana ZIS',
  penyaluran: 'Penyaluran Dana ZIS',
  operasional: 'Pengeluaran Operasional Amil',
  programs: 'Program Penyaluran ZIS',
  'collection-plans': 'Rencana Penghimpunan ZIS',
  'program-control': 'Kontrol & Monitor Program',
  baznas: 'Setoran & Laporan BAZNAS Kebumen',
  'arsip-digital': 'Arsip Digital & Bukti Transaksi',
  'kalkulator-zakat': 'Kalkulator Zakat PSAK 109',
  'audit-log': 'Log Aktivitas User (Audit Trail)',
  users: 'Manajemen Pengguna',
  settings: 'Pengaturan Sistem',
  'backup-restore': 'Backup & Restore Data',
  'chart-of-accounts': 'Bagan Akun (Chart of Accounts)',
  'buku-kas': 'Buku Kas Umum',
  'buku-besar': 'Buku Besar (General Ledger)',
  'neraca-saldo': 'Neraca Saldo (Trial Balance)',
  'mutasi-kas-bank': 'Mutasi Kas & Bank',
  'jurnal-umum': 'Jurnal Umum',
  'posisi-keuangan': 'Laporan Posisi Keuangan — PSAK 109',
  'perubahan-dana': 'Laporan Perubahan Dana — PSAK 109',
  'arus-kas': 'Laporan Arus Kas — PSAK 109',
};

const pageTitle = computed(() => titleMap[props.activeTab] || 'Dashboard');

const navigate = (tab: string) => {
  emit('navigate', tab);
  mobileOpen.value = false;
};

const logout = () => {
  emit('logout');
};
</script>
