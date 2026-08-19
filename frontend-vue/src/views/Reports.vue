<template>
  <div>
    <!-- POSISI KEUANGAN -->
    <div v-if="reportType === 'posisi-keuangan'">
      <div class="section-header">
        <div>
          <h3>Laporan Posisi Keuangan (Neraca) PSAK 109</h3>
          <p>Kondisi saldo aset kelolaan per tanggal pelaporan</p>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <input type="date" class="form-input" v-model="posDate" @change="fetchPosisi" style="width: 160px;" />
          <button class="btn btn-pdf btn-sm" @click="download('/reports/posisi-keuangan', { date: posDate }, 'pdf')">
            <FileText :size="14" /> Unduh PDF
          </button>
          <button class="btn btn-excel btn-sm" @click="download('/reports/posisi-keuangan', { date: posDate }, 'excel')">
            <FileSpreadsheet :size="14" /> Unduh Excel
          </button>
        </div>
      </div>

      <div class="card">
        <table class="report-table">
          <thead>
            <tr>
              <th>Kelompok Dana</th>
              <th class="text-right">Penerimaan (Rp)</th>
              <th class="text-right">Penyaluran (Rp)</th>
              <th class="text-right">Saldo Bersih (Rp)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="f in funds" :key="f.key">
              <td><strong>{{ f.label }}</strong></td>
              <td class="text-right amount-positive">{{ formatRp(posData?.balances?.[f.key]?.in || 0) }}</td>
              <td class="text-right amount-negative">{{ formatRp(posData?.balances?.[f.key]?.out || 0) }}</td>
              <td class="text-right font-bold">{{ formatRp(posData?.balances?.[f.key]?.balance || 0) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td><strong>TOTAL ASET BERSIH KELOLAAN</strong></td>
              <td class="text-right amount-positive">
                <strong>{{ formatRp(Object.values(posData?.balances || {}).reduce((s: number, b: any) => s + (b.in || 0), 0)) }}</strong>
              </td>
              <td class="text-right amount-negative">
                <strong>{{ formatRp(Object.values(posData?.balances || {}).reduce((s: number, b: any) => s + (b.out || 0), 0)) }}</strong>
              </td>
              <td class="text-right" style="font-size: 16px; color: #059669;">
                <strong>{{ formatRp(posData?.total_aset || 0) }}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- PERUBAHAN DANA -->
    <div v-else-if="reportType === 'perubahan-dana'">
      <div class="section-header">
        <div>
          <h3>Laporan Perubahan Dana PSAK 109</h3>
          <p>Mutasi penerimaan, penyaluran, dan beban amil periode tertentu</p>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <input type="date" class="form-input" v-model="dateFrom" @change="fetchPerubahan" style="width: 150px;" />
          <span style="color: #64748b;">s/d</span>
          <input type="date" class="form-input" v-model="dateTo" @change="fetchPerubahan" style="width: 150px;" />
          <button class="btn btn-pdf btn-sm" @click="download('/reports/perubahan-dana', { date_from: dateFrom, date_to: dateTo }, 'pdf')">
            <FileText :size="14" /> Unduh PDF
          </button>
          <button class="btn btn-excel btn-sm" @click="download('/reports/perubahan-dana', { date_from: dateFrom, date_to: dateTo }, 'excel')">
            <FileSpreadsheet :size="14" /> Unduh Excel
          </button>
        </div>
      </div>

      <div class="card">
        <table class="report-table">
          <thead>
            <tr>
              <th>Kelompok Dana</th>
              <th class="text-right">Saldo Awal</th>
              <th class="text-right">Penerimaan</th>
              <th class="text-right">Penyaluran</th>
              <th class="text-right">Beban Operasional</th>
              <th class="text-right">Saldo Akhir</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="f in funds" :key="f.key">
              <td><strong>{{ f.label }}</strong></td>
              <td class="text-right">{{ formatRp(perubData?.report?.[f.key]?.saldo_awal || 0) }}</td>
              <td class="text-right amount-positive">{{ formatRp(perubData?.report?.[f.key]?.penerimaan || 0) }}</td>
              <td class="text-right amount-negative">{{ formatRp(perubData?.report?.[f.key]?.penyaluran || 0) }}</td>
              <td class="text-right amount-negative">{{ formatRp(perubData?.report?.[f.key]?.operasional || 0) }}</td>
              <td class="text-right font-bold">{{ formatRp(perubData?.report?.[f.key]?.saldo_akhir || 0) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ARUS KAS -->
    <div v-else-if="reportType === 'arus-kas'">
      <div class="section-header">
        <div>
          <h3>Laporan Arus Kas PSAK 109</h3>
          <p>Penerimaan dan pengeluaran kas tunai dan rekening bank</p>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <input type="date" class="form-input" v-model="dateFrom" @change="fetchArusKas" style="width: 150px;" />
          <span style="color: #64748b;">s/d</span>
          <input type="date" class="form-input" v-model="dateTo" @change="fetchArusKas" style="width: 150px;" />
          <button class="btn btn-pdf btn-sm" @click="download('/reports/arus-kas', { date_from: dateFrom, date_to: dateTo }, 'pdf')">
            <FileText :size="14" /> Unduh PDF
          </button>
          <button class="btn btn-excel btn-sm" @click="download('/reports/arus-kas', { date_from: dateFrom, date_to: dateTo }, 'excel')">
            <FileSpreadsheet :size="14" /> Unduh Excel
          </button>
        </div>
      </div>

      <div class="page-grid-2">
        <div class="card">
          <h4 style="font-weight: 700; margin-bottom: 16px;">1. Mutasi Kas Tunai Fisik</h4>
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border);">
            <span>Arus Masuk (Penerimaan Tunai)</span>
            <span class="amount-positive">{{ formatRp(arusData?.kas_masuk_tunai || 0) }}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border);">
            <span>Arus Keluar (Penyaluran / Beban)</span>
            <span class="amount-negative">({{ formatRp(arusData?.kas_keluar_tunai || 0) }})</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 12px 0; margin-top: 4px;">
            <strong>Arus Kas Tunai Bersih</strong>
            <strong :class="(arusData?.net_tunai || 0) >= 0 ? 'amount-positive' : 'amount-negative'" style="font-size: 16px;">
              {{ formatRp(arusData?.net_tunai || 0) }}
            </strong>
          </div>
        </div>

        <div class="card">
          <h4 style="font-weight: 700; margin-bottom: 16px;">2. Mutasi Rekening Bank</h4>
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border);">
            <span>Arus Masuk (Transfer Donatur)</span>
            <span class="amount-positive">{{ formatRp(arusData?.kas_masuk_bank || 0) }}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border);">
            <span>Arus Keluar (Transfer Penyaluran)</span>
            <span class="amount-negative">({{ formatRp(arusData?.kas_keluar_bank || 0) }})</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 12px 0; margin-top: 4px;">
            <strong>Arus Kas Bank Bersih</strong>
            <strong :class="(arusData?.net_bank || 0) >= 0 ? 'amount-positive' : 'amount-negative'" style="font-size: 16px;">
              {{ formatRp(arusData?.net_bank || 0) }}
            </strong>
          </div>
        </div>
      </div>
    </div>

    <!-- BUKU KAS UMUM -->
    <div v-else-if="reportType === 'buku-kas'">
      <div class="section-header">
        <div>
          <h3>Buku Kas Umum</h3>
          <p>Rekapitulasi mutasi kas tunai dan kas bank dengan saldo berjalan</p>
        </div>
        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          <select class="form-select" v-model="bukuKasMethod" @change="fetchBukuKas" style="width: 130px;">
            <option value="tunai">Kas Tunai</option>
            <option value="bank">Kas Bank</option>
          </select>
          <input type="date" class="form-input" v-model="dateFrom" @change="fetchBukuKas" style="width: 150px;" />
          <span style="color: #64748b;">s/d</span>
          <input type="date" class="form-input" v-model="dateTo" @change="fetchBukuKas" style="width: 150px;" />
          <button class="btn btn-pdf btn-sm" @click="download('/reports/buku-kas', { date_from: dateFrom, date_to: dateTo, payment_method: bukuKasMethod }, 'pdf')">
            <FileText :size="14" /> Unduh PDF
          </button>
          <button class="btn btn-excel btn-sm" @click="download('/reports/buku-kas', { date_from: dateFrom, date_to: dateTo, payment_method: bukuKasMethod }, 'excel')">
            <FileSpreadsheet :size="14" /> Unduh Excel
          </button>
        </div>
      </div>

      <div class="card">
        <div style="margin-bottom: 16px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 10px 16px; display: inline-block;">
          <div style="font-size: 11px; color: #64748b;">Saldo Awal Periode:</div>
          <div style="font-weight: 700; color: #059669; font-size: 15px;">{{ formatRp(bukuKasData?.saldo_awal || 0) }}</div>
        </div>

        <div class="table-container">
          <table class="report-table">
            <thead>
              <tr>
                <th>TGL</th>
                <th>NO. REF</th>
                <th>KETERANGAN</th>
                <th>PIHAK</th>
                <th class="text-right">DEBIT (+)</th>
                <th class="text-right">KREDIT (-)</th>
                <th class="text-right">SALDO AKUMULASI</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tx in bukuKasData?.transactions || []" :key="tx.id">
                <td style="white-space: nowrap; font-size: 12px;">{{ formatDate(tx.date) }}</td>
                <td style="font-size: 11px; color: #2563eb; font-family: monospace;">{{ tx.reference_number }}</td>
                <td style="font-size: 12px; max-width: 200px;">{{ tx.description }}</td>
                <td style="font-size: 12px;">{{ tx.party_name }}</td>
                <td class="text-right amount-positive">{{ tx.type === 'penerimaan' ? formatRp(tx.amount) : '-' }}</td>
                <td class="text-right amount-negative">{{ tx.type !== 'penerimaan' ? formatRp(tx.amount) : '-' }}</td>
                <td class="text-right font-bold">{{ formatRp(calculateRunningBalance(tx)) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- BUKU BESAR -->
    <div v-else-if="reportType === 'buku-besar'">
      <div class="section-header">
        <div>
          <h3>Buku Besar (General Ledger)</h3>
          <p>Catatan jurnal entri ganda semua akun pembukuan</p>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <input type="date" class="form-input" v-model="dateFrom" @change="fetchBukuBesar" style="width: 150px;" />
          <span style="color: #64748b;">s/d</span>
          <input type="date" class="form-input" v-model="dateTo" @change="fetchBukuBesar" style="width: 150px;" />
          <button class="btn btn-pdf btn-sm" @click="download('/reports/buku-besar', { date_from: dateFrom, date_to: dateTo }, 'pdf')">
            <FileText :size="14" /> Unduh PDF
          </button>
          <button class="btn btn-excel btn-sm" @click="download('/reports/buku-besar', { date_from: dateFrom, date_to: dateTo }, 'excel')">
            <FileSpreadsheet :size="14" /> Unduh Excel
          </button>
        </div>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="report-table">
            <thead>
              <tr>
                <th>TGL</th>
                <th>NO. REF</th>
                <th>KETERANGAN</th>
                <th>AKUN DEBIT</th>
                <th>AKUN KREDIT</th>
                <th class="text-right">DEBIT (Rp)</th>
                <th class="text-right">KREDIT (Rp)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(e, i) in bukuBesarData?.entries || []" :key="i">
                <td style="white-space: nowrap; font-size: 12px;">{{ e.date }}</td>
                <td style="font-size: 11px; color: #2563eb;">{{ e.ref }}</td>
                <td style="font-size: 12px;">{{ e.description }}</td>
                <td>{{ e.debit_account }}</td>
                <td>{{ e.credit_account }}</td>
                <td class="text-right amount-positive">{{ e.debit > 0 ? formatRp(e.debit) : '-' }}</td>
                <td class="text-right amount-negative">{{ e.credit > 0 ? formatRp(e.credit) : '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- NERACA SALDO -->
    <div v-else-if="reportType === 'neraca-saldo'">
      <div class="section-header">
        <div>
          <h3>Neraca Saldo (Trial Balance)</h3>
          <p>Keseimbangan debit-kredit seluruh bagan akun</p>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <input type="date" class="form-input" v-model="posDate" @change="fetchNeracaSaldo" style="width: 160px;" />
          <button class="btn btn-pdf btn-sm" @click="download('/reports/neraca-saldo', { date_to: posDate }, 'pdf')">
            <FileText :size="14" /> Unduh PDF
          </button>
          <button class="btn btn-excel btn-sm" @click="download('/reports/neraca-saldo', { date_to: posDate }, 'excel')">
            <FileSpreadsheet :size="14" /> Unduh Excel
          </button>
        </div>
      </div>

      <div class="card">
        <table class="report-table">
          <thead>
            <tr>
              <th>NAMA AKUN</th>
              <th class="text-right">DEBIT</th>
              <th class="text-right">KREDIT</th>
              <th class="text-right">SALDO DEBIT</th>
              <th class="text-right">SALDO KREDIT</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(a, i) in neracaSaldoData?.accounts || []" :key="i">
              <td><strong>{{ a.account }}</strong></td>
              <td class="text-right">{{ a.debit > 0 ? formatRp(a.debit) : '-' }}</td>
              <td class="text-right">{{ a.kredit > 0 ? formatRp(a.kredit) : '-' }}</td>
              <td class="text-right amount-positive font-bold">{{ a.saldo_debit > 0 ? formatRp(a.saldo_debit) : '-' }}</td>
              <td class="text-right amount-negative font-bold">{{ a.saldo_kredit > 0 ? formatRp(a.saldo_kredit) : '-' }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td><strong>TOTAL (SEIMBANG)</strong></td>
              <td class="text-right"><strong>{{ formatRp(neracaSaldoData?.total_debit || 0) }}</strong></td>
              <td class="text-right"><strong>{{ formatRp(neracaSaldoData?.total_kredit || 0) }}</strong></td>
              <td class="text-right amount-positive"><strong>{{ formatRp(neracaSaldoData?.total_debit || 0) }}</strong></td>
              <td class="text-right amount-negative"><strong>{{ formatRp(neracaSaldoData?.total_kredit || 0) }}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- MUTASI KAS BANK -->
    <div v-else-if="reportType === 'mutasi-kas-bank'">
      <div class="section-header">
        <div>
          <h3>Mutasi Kas & Bank</h3>
          <p>Rekonsiliasi pergerakan kas tunai dan rekening bank</p>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <input type="date" class="form-input" v-model="dateFrom" @change="fetchMutasi" style="width: 150px;" />
          <span style="color: #64748b;">s/d</span>
          <input type="date" class="form-input" v-model="dateTo" @change="fetchMutasi" style="width: 150px;" />
          <button class="btn btn-pdf btn-sm" @click="download('/reports/mutasi-kas-bank', { date_from: dateFrom, date_to: dateTo }, 'pdf')">
            <FileText :size="14" /> Unduh PDF
          </button>
          <button class="btn btn-excel btn-sm" @click="download('/reports/mutasi-kas-bank', { date_from: dateFrom, date_to: dateTo }, 'excel')">
            <FileSpreadsheet :size="14" /> Unduh Excel
          </button>
        </div>
      </div>

      <div class="page-grid-2">
        <div class="card">
          <h4 style="font-weight: 700; margin-bottom: 16px;">Rekonsiliasi Kas Tunai</h4>
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border);">
            <span>Saldo Awal</span>
            <strong>{{ formatRp(mutasiData?.tunai?.saldo_awal || 0) }}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border);">
            <span>Kas Masuk (+)</span>
            <span class="amount-positive">{{ formatRp(mutasiData?.tunai?.masuk || 0) }}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border);">
            <span>Kas Keluar (-)</span>
            <span class="amount-negative">({{ formatRp(mutasiData?.tunai?.keluar || 0) }})</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 14px 0 0; margin-top: 4px;">
            <strong>Saldo Akhir</strong>
            <strong style="font-size: 18px; color: #059669;">{{ formatRp(mutasiData?.tunai?.saldo_akhir || 0) }}</strong>
          </div>
        </div>

        <div class="card">
          <h4 style="font-weight: 700; margin-bottom: 16px;">Rekonsiliasi Rekening Bank</h4>
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border);">
            <span>Saldo Awal</span>
            <strong>{{ formatRp(mutasiData?.bank?.saldo_awal || 0) }}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border);">
            <span>Kas Masuk (+)</span>
            <span class="amount-positive">{{ formatRp(mutasiData?.bank?.masuk || 0) }}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border);">
            <span>Kas Keluar (-)</span>
            <span class="amount-negative">({{ formatRp(mutasiData?.bank?.keluar || 0) }})</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 14px 0 0; margin-top: 4px;">
            <strong>Saldo Akhir</strong>
            <strong style="font-size: 18px; color: #059669;">{{ formatRp(mutasiData?.bank?.saldo_akhir || 0) }}</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- JURNAL UMUM -->
    <div v-else-if="reportType === 'jurnal-umum'">
      <div class="section-header">
        <div>
          <h3>Jurnal Umum Transaksi</h3>
          <p>Catatan kronologis seluruh mutasi keuangan ZIS</p>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <input type="date" class="form-input" v-model="dateFrom" @change="fetchJurnal" style="width: 150px;" />
          <span style="color: #64748b;">s/d</span>
          <input type="date" class="form-input" v-model="dateTo" @change="fetchJurnal" style="width: 150px;" />
          <button class="btn btn-pdf btn-sm" @click="download('/reports/jurnal-umum', { date_from: dateFrom, date_to: dateTo }, 'pdf')">
            <FileText :size="14" /> Unduh PDF
          </button>
          <button class="btn btn-excel btn-sm" @click="download('/reports/jurnal-umum', { date_from: dateFrom, date_to: dateTo }, 'excel')">
            <FileSpreadsheet :size="14" /> Unduh Excel
          </button>
        </div>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="report-table">
            <thead>
              <tr>
                <th>TGL</th>
                <th>NO. REF</th>
                <th>KETERANGAN</th>
                <th>KELOMPOK DANA</th>
                <th>JENIS</th>
                <th class="text-right">DEBIT (+)</th>
                <th class="text-right">KREDIT (-)</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tx in jurnalData?.transactions || []" :key="tx.id">
                <td style="white-space: nowrap; font-size: 12px;">{{ formatDate(tx.date) }}</td>
                <td style="font-size: 11px; color: #2563eb; font-family: monospace;">{{ tx.reference_number }}</td>
                <td style="font-size: 12px; max-width: 200px;">{{ tx.description }}</td>
                <td><span class="badge badge-gray">{{ tx.fund_type }}</span></td>
                <td>
                  <span :class="['tx-badge', tx.type === 'penerimaan' ? 'tx-penerimaan' : 'tx-penyaluran']">
                    {{ tx.type }}
                  </span>
                </td>
                <td class="text-right amount-positive">{{ tx.type === 'penerimaan' ? formatRp(tx.amount) : '-' }}</td>
                <td class="text-right amount-negative">{{ tx.type !== 'penerimaan' ? formatRp(tx.amount) : '-' }}</td>
                <td><span :class="['status-badge', `status-${tx.status?.toLowerCase()}`]">{{ tx.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import api, { formatRp, formatDate } from '../lib/api';
import { FileText, FileSpreadsheet } from '@lucide/vue';

const props = defineProps<{
  reportType: string;
}>();

const year = new Date().getFullYear();
const posDate = ref(new Date().toISOString().slice(0, 10));
const dateFrom = ref(`${year}-01-01`);
const dateTo = ref(`${year}-12-31`);
const bukuKasMethod = ref('tunai');

const posData = ref<any>(null);
const perubData = ref<any>(null);
const arusData = ref<any>(null);
const bukuKasData = ref<any>(null);
const bukuBesarData = ref<any>(null);
const neracaSaldoData = ref<any>(null);
const mutasiData = ref<any>(null);
const jurnalData = ref<any>(null);

let runningBal = 0;

const funds = [
  { key: 'zakat', label: 'Dana Zakat (1101)' },
  { key: 'infaq_terikat', label: 'Dana Infak Terikat (2101)' },
  { key: 'infaq_tidak_terikat', label: 'Dana Infak Tidak Terikat (2102)' },
  { key: 'amil', label: 'Dana Amil (3301)' },
  { key: 'non_halal', label: 'Dana Non Halal (3401)' },
];

const fetchPosisi = async () => {
  const r = await api.get(`/reports/posisi-keuangan?date=${posDate.value}`);
  posData.value = r.data;
};

const fetchPerubahan = async () => {
  const r = await api.get(`/reports/perubahan-dana?date_from=${dateFrom.value}&date_to=${dateTo.value}`);
  perubData.value = r.data;
};

const fetchArusKas = async () => {
  const r = await api.get(`/reports/arus-kas?date_from=${dateFrom.value}&date_to=${dateTo.value}`);
  arusData.value = r.data;
};

const fetchBukuKas = async () => {
  const r = await api.get(`/reports/buku-kas?date_from=${dateFrom.value}&date_to=${dateTo.value}&payment_method=${bukuKasMethod.value}`);
  bukuKasData.value = r.data;
  runningBal = r.data?.saldo_awal || 0;
};

const calculateRunningBalance = (tx: any) => {
  if (tx.type === 'penerimaan') runningBal += tx.amount;
  else runningBal -= tx.amount;
  return runningBal;
};

const fetchBukuBesar = async () => {
  const r = await api.get(`/reports/buku-besar?date_from=${dateFrom.value}&date_to=${dateTo.value}`);
  bukuBesarData.value = r.data;
};

const fetchNeracaSaldo = async () => {
  const r = await api.get(`/reports/neraca-saldo?date_to=${posDate.value}`);
  neracaSaldoData.value = r.data;
};

const fetchMutasi = async () => {
  const r = await api.get(`/reports/mutasi-kas-bank?date_from=${dateFrom.value}&date_to=${dateTo.value}`);
  mutasiData.value = r.data;
};

const fetchJurnal = async () => {
  const r = await api.get(`/reports/jurnal-umum?date_from=${dateFrom.value}&date_to=${dateTo.value}`);
  jurnalData.value = r.data;
};

const download = async (path: string, params: Record<string, string>, format: 'pdf' | 'excel') => {
  const qs = new URLSearchParams({ ...params, format }).toString();
  const res = await api.get(`${path}?${qs}`, { responseType: 'blob' });
  const ext = format === 'pdf' ? 'pdf' : 'xlsx';
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = `laporan_${props.reportType}_${new Date().toISOString().slice(0, 10)}.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
};

const loadReport = () => {
  switch (props.reportType) {
    case 'posisi-keuangan': fetchPosisi(); break;
    case 'perubahan-dana': fetchPerubahan(); break;
    case 'arus-kas': fetchArusKas(); break;
    case 'buku-kas': fetchBukuKas(); break;
    case 'buku-besar': fetchBukuBesar(); break;
    case 'neraca-saldo': fetchNeracaSaldo(); break;
    case 'mutasi-kas-bank': fetchMutasi(); break;
    case 'jurnal-umum': fetchJurnal(); break;
  }
};

watch(() => props.reportType, loadReport);
onMounted(loadReport);
</script>
