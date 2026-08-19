<template>
  <div>
    <!-- Hero Banner -->
    <div class="hero-banner">
      <div class="hero-badges">
        <span class="badge badge-green">
          <CheckCircle :size="12" style="margin-right: 4px;" /> Akuntansi Syariah PSAK 109
        </span>
        <span class="badge badge-blue">
          <Award :size="12" style="margin-right: 4px;" /> UPZ Kemenag Kebumen
        </span>
      </div>
      <h1 class="hero-title">SIMZAKAT UPZ Kemenag Kebumen</h1>
      <p class="hero-subtitle">
        Sistem akuntansi terintegrasi pengumpulan, pendistribusian 8 asnaf, pengelolaan hak amil 12.5%, program
        penyaluran, dan verifikasi berjenjang secara real-time.
      </p>
      <div class="hero-actions">
        <button class="btn btn-primary" @click="$emit('navigate', 'penerimaan')">
          <ArrowDownLeft :size="15" /> + Entri Penerimaan ZIS
        </button>
        <button class="btn btn-secondary" @click="$emit('navigate', 'penyaluran')">
          <ArrowUpRight :size="15" /> + Entri Penyaluran Dana
        </button>
        <button class="btn btn-ghost" @click="$emit('navigate', 'jurnal-umum')" style="background: rgba(255,255,255,0.15); color: white; border-color: rgba(255,255,255,0.3);">
          <Scale :size="15" /> Laporan Jurnal Umum
        </button>
      </div>
    </div>

    <!-- Fund Balances Grid -->
    <div class="fund-cards-grid">
      <div v-for="fc in fundCards" :key="fc.key" :class="['fund-card', fc.cls]">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span class="fund-label">{{ fc.label }}</span>
          <span class="badge badge-gray" style="font-size: 10px; font-weight: 800;">{{ fc.num }}</span>
        </div>
        <div class="fund-amount" :style="{ color: fc.color }">{{ formatRp(data?.fund_balances?.[fc.key] || 0) }}</div>
        <div class="fund-sub">
          {{ fc.sub1 }}
          <span class="fund-tag" :style="{ background: fc.bg, color: fc.color }">{{ fc.sub2 }}</span>
        </div>
      </div>
    </div>

    <!-- Stat KPI Cards -->
    <div class="stat-cards">
      <div class="stat-card" style="cursor: pointer;" @click="$emit('navigate', 'muzakki')">
        <div class="stat-icon" style="background: #eff6ff; color: #2563eb;">
          <Users :size="20" />
        </div>
        <div>
          <div class="stat-label">MUZAKKI</div>
          <div class="stat-value" style="color: #2563eb;">{{ data?.muzakki_count || 0 }} Donatur</div>
        </div>
      </div>

      <div class="stat-card" style="cursor: pointer;" @click="$emit('navigate', 'mustahik')">
        <div class="stat-icon" style="background: #fdf2f8; color: #db2777;">
          <HeartHandshake :size="20" />
        </div>
        <div>
          <div class="stat-label">MUSTAHIK</div>
          <div class="stat-value" style="color: #db2777;">{{ data?.mustahik_count || 0 }} Penerima</div>
        </div>
      </div>

      <div class="stat-card" style="cursor: pointer;" @click="$emit('navigate', 'penerimaan')">
        <div class="stat-icon" style="background: #ecfdf5; color: #059669;">
          <TrendingUp :size="20" />
        </div>
        <div>
          <div class="stat-label">TOTAL KAS MASUK</div>
          <div class="stat-value" style="color: #059669;">{{ formatRp(data?.total_penerimaan || 0) }}</div>
        </div>
      </div>

      <div class="stat-card" style="cursor: pointer;" @click="$emit('navigate', 'penyaluran')">
        <div class="stat-icon" style="background: #fef2f2; color: #dc2626;">
          <TrendingDown :size="20" />
        </div>
        <div>
          <div class="stat-label">TOTAL PENGELUARAN</div>
          <div class="stat-value" style="color: #dc2626;">{{ formatRp(data?.total_penyaluran || 0) }}</div>
        </div>
      </div>

      <div class="stat-card" style="cursor: pointer;" @click="$emit('navigate', 'posisi-keuangan')">
        <div class="stat-icon" style="background: #fffbeb; color: #d97706;">
          <Wallet :size="20" />
        </div>
        <div>
          <div class="stat-label">TOTAL SALDO NET</div>
          <div class="stat-value" style="color: #d97706;">{{ formatRp(data?.saldo_bersih || 0) }}</div>
        </div>
      </div>
    </div>

    <!-- Recent Transactions Table -->
    <div class="card">
      <div class="section-header">
        <div>
          <h3>Kuitansi & Transaksi Terkini</h3>
          <p>10 transaksi keuangan mutasi terakhir yang telah diproses</p>
        </div>
        <button class="btn btn-secondary btn-sm" @click="$emit('navigate', 'jurnal-umum')">
          Lihat Jurnal Lengkap →
        </button>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>TANGGAL & REF</th>
              <th>JENIS TRANSAKSI</th>
              <th>MUZAKKI / MUSTAHIK</th>
              <th>KELOMPOK DANA</th>
              <th>KETERANGAN</th>
              <th>STATUS</th>
              <th class="text-right">NOMINAL</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="text-center" style="padding: 30px;">
                <span class="loading-spinner" style="width: 20px; height: 20px; margin-right: 8px;"></span>
                Memuat data dashboard...
              </td>
            </tr>
            <tr v-else-if="!data?.recent_transactions?.length">
              <td colspan="7" class="text-center" style="padding: 40px; color: #64748b;">
                Belum ada data transaksi.
              </td>
            </tr>
            <tr v-for="tx in data?.recent_transactions" :key="tx.id">
              <td>
                <div style="font-weight: 700; font-size: 13px;">{{ formatDate(tx.date) }}</div>
                <div style="font-size: 11px; color: #2563eb; font-family: monospace;">{{ tx.reference_number }}</div>
              </td>
              <td>
                <span :class="['tx-badge', tx.type === 'penerimaan' ? 'tx-penerimaan' : tx.type === 'penyaluran' ? 'tx-penyaluran' : 'tx-amil']">
                  {{ tx.type === 'penerimaan' ? 'PENERIMAAN' : tx.type === 'penyaluran' ? 'PENYALURAN' : 'BEBAN AMIL' }}
                </span>
              </td>
              <td style="font-weight: 600;">{{ tx.party_name }}</td>
              <td>
                <span class="badge badge-gray" style="font-size: 10px;">
                  {{ tx.fund_type?.replace(/_/g, ' ').toUpperCase() }}
                </span>
              </td>
              <td style="max-width: 220px; font-size: 12px; color: #475569;">
                <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ tx.description }}</div>
              </td>
              <td>
                <span :class="['status-badge', `status-${tx.status?.toLowerCase()}`]">{{ tx.status }}</span>
              </td>
              <td class="text-right">
                <span :class="tx.type === 'penerimaan' ? 'amount-positive' : 'amount-negative'" style="font-size: 14px;">
                  {{ tx.type === 'penerimaan' ? '+' : '-' }}{{ formatRp(tx.amount) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { cachedGet, formatRp, formatDate } from '../lib/api';
import {
  Users,
  HeartHandshake,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Scale,
  Award,
  CheckCircle,
} from '@lucide/vue';

defineEmits<{
  (e: 'navigate', tab: string): void;
}>();

const data = ref<any>(null);
const loading = ref(false);

const fundCards = [
  { key: 'zakat', label: 'Dana Zakat', num: '1101', sub1: 'Zakat Bersih', sub2: '87.5% Alokasi', color: '#059669', bg: '#ecfdf5', cls: 'fund-card-zakat' },
  { key: 'infaq_terikat', label: 'Dana Infak / Sedekah', num: '2101', sub1: 'Bebas & Terikat', sub2: 'Tersalurkan', color: '#2563eb', bg: '#eff6ff', cls: 'fund-card-infaq' },
  { key: 'amil', label: 'Dana Amil (Operasional)', num: '3301', sub1: 'Biaya Amil', sub2: 'Maks 12.5%', color: '#d97706', bg: '#fffbeb', cls: 'fund-card-amil' },
  { key: 'non_halal', label: 'Dana Non-Halal', num: '3401', sub1: 'Maslahat Umum', sub2: 'Jasa Giro, dll', color: '#475569', bg: '#f1f5f9', cls: 'fund-card-nonhalal' },
];

onMounted(async () => {
  if (!data.value) loading.value = true;
  try {
    const res = await cachedGet('/dashboard');
    data.value = res.data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
});
</script>
