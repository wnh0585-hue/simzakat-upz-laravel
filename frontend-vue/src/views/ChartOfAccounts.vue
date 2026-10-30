<template>
  <div>
    <div class="section-header">
      <div>
        <h3>Bagan Akun Standar (Chart of Accounts) PSAK 109</h3>
        <p>Struktur kode akun akuntansi syariah terintegrasi Kas Tunai & Rekening Bank UPZ</p>
      </div>
      <div style="display: flex; gap: 8px;">
        <span class="badge badge-green" style="font-size: 11px;">
          ✓ Terhubung dengan Master Rekening Bank
        </span>
      </div>
    </div>

    <!-- Info Card -->
    <div class="card card-sm" style="margin-bottom: 20px; background: #f0fdf4; border-color: #bbf7d0;">
      <div style="display: flex; gap: 12px; align-items: flex-start;">
        <span style="font-size: 20px;">ℹ️</span>
        <div style="font-size: 13px; color: #166534; line-height: 1.5;">
          <strong>Standar Akuntansi Syariah PSAK 109 & BAZNAS:</strong>
          Akun Kas & Setara Kas (Kepala 1) dirinci menjadi <strong>Kas Tunai (111x)</strong> di tangan bendahara dan <strong>Kas Bank (112x)</strong> untuk masing-masing rekening bank operasional UPZ. Rekening bank di bawah ini otomatis tersinkronisasi dari menu Master Rekening Bank.
        </div>
      </div>
    </div>

    <div class="card">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th style="width: 110px;">KODE AKUN</th>
              <th>NAMA AKUN & REKENING</th>
              <th style="width: 140px;">KLASIFIKASI</th>
              <th style="width: 180px;">KELOMPOK DANA</th>
              <th>DESKRIPSI & PERUNTUKAN SYAR'I</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in fullCoaData" :key="item.code" :style="item.isHeader ? 'background: #f8fafc;' : ''">
              <td>
                <span
                  :style="{
                    fontFamily: 'monospace',
                    fontWeight: item.isHeader ? '800' : '700',
                    color: item.isHeader ? '#0f172a' : '#2563eb',
                    fontSize: '13px'
                  }"
                >
                  {{ item.code }}
                </span>
              </td>
              <td>
                <div :style="{ fontWeight: item.isHeader ? '800' : '600', paddingLeft: item.indent ? '16px' : '0' }">
                  <span v-if="item.indent" style="color: #94a3b8; margin-right: 6px;">↳</span>
                  {{ item.name }}
                </div>
              </td>
              <td>
                <span
                  :class="[
                    'badge',
                    item.type === 'Aset' ? 'badge-blue' :
                    item.type === 'Saldo Dana' ? 'badge-teal' :
                    item.type === 'Pendapatan' ? 'badge-green' :
                    item.type === 'Beban Amil' ? 'badge-orange' : 'badge-purple'
                  ]"
                >
                  {{ item.type }}
                </span>
              </td>
              <td>
                <span style="font-size: 12px; font-weight: 600;">
                  {{ item.fund }}
                </span>
              </td>
              <td style="font-size: 12px; color: #475569;">{{ item.desc }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../lib/api';

const bankAccounts = ref<any[]>([]);

const fetchBankAccounts = async () => {
  try {
    const res = await api.get('/bank-accounts');
    bankAccounts.value = res.data || [];
  } catch (err) {
    console.error('Failed to load bank accounts for COA:', err);
  }
};

onMounted(() => {
  fetchBankAccounts();
});

const fullCoaData = computed(() => {
  const list: any[] = [
    // 1. KAS DAN SETARA KAS (ASET LANCAR)
    { code: '1100', name: 'KAS DAN SETARA KAS', type: 'Aset', fund: 'Semua Dana', desc: 'Induk Kas Tunai & Rekening Bank UPZ', isHeader: true },
    { code: '1110', name: 'Kas Tunai di Bendahara', type: 'Aset', fund: 'Kas Tunai', desc: 'Kas fisik / uang tunai di brankas bendahara UPZ', indent: true },

    // DYNAMIC BANK ACCOUNTS
    { code: '1120', name: 'Kas di Bank (Rekening UPZ)', type: 'Aset', fund: 'Kas Bank', desc: 'Seluruh rekening giro/tabungan bank resmi UPZ', isHeader: true },
  ];

  if (bankAccounts.value.length === 0) {
    list.push({
      code: '1121',
      name: 'Bank BSI - Rekening Operasional UPZ',
      type: 'Aset',
      fund: 'Dana ZIS',
      desc: 'Rekening penerimaan dan penyaluran utama UPZ',
      indent: true,
    });
  } else {
    bankAccounts.value.forEach((b, idx) => {
      const codeNum = `112${idx + 1}`;
      const fundLabel = b.fund_type
        ? `Pos ${b.fund_type.replace(/_/g, ' ').toUpperCase()}`
        : 'Semua Pos Dana';
      list.push({
        code: codeNum,
        name: `Bank ${b.bank_name} - ${b.account_number} (${b.account_holder})`,
        type: 'Aset',
        fund: fundLabel,
        desc: b.description || `Rekening perbankan aktif untuk peruntukan ${fundLabel}`,
        indent: true,
      });
    });
  }

  // LIABILITAS & EKUITAS SALDO DANA
  list.push(
    { code: '2100', name: 'KEWAJIBAN / LIABILITAS', type: 'Liabilitas', fund: 'Liabilitas', desc: 'Titipan dana atau kewajiban penyaluran jangka pendek', isHeader: true },
    { code: '2101', name: 'Titipan Penyaluran Dana ZIS', type: 'Liabilitas', fund: 'Dana ZIS', desc: 'Dana terhimpun yang telah terikat rencana penyaluran segera', indent: true },

    { code: '3000', name: 'SALDO DANA (EKUITAS DANA PSAK 109)', type: 'Saldo Dana', fund: 'Saldo Dana', desc: 'Akumulasi saldo bersih per kantong dana', isHeader: true },
    { code: '3101', name: 'Saldo Dana Zakat', type: 'Saldo Dana', fund: 'Dana Zakat', desc: 'Akumulasi saldo zakat yang wajib disalurkan ke 8 Asnaf', indent: true },
    { code: '3201', name: 'Saldo Dana Infak Terikat', type: 'Saldo Dana', fund: 'Dana Infak', desc: 'Akumulasi saldo infak yang terikat akad program khusus', indent: true },
    { code: '3202', name: 'Saldo Dana Infak Tidak Terikat', type: 'Saldo Dana', fund: 'Dana Infak', desc: 'Akumulasi saldo sedekah dan infak umum tidak terikat', indent: true },
    { code: '3301', name: 'Saldo Dana Amil', type: 'Saldo Dana', fund: 'Dana Amil', desc: 'Akumulasi hak amil dan operasional pengelolaan UPZ', indent: true },
    { code: '3401', name: 'Saldo Dana Non-Halal', type: 'Saldo Dana', fund: 'Dana Non-Halal', desc: 'Akumulasi dana non-halal untuk fasilitas umum', indent: true },

    // PENDAPATAN / PENERIMAAN
    { code: '4000', name: 'PENERIMAAN DANA (PENDAPATAN)', type: 'Pendapatan', fund: 'Penerimaan', desc: 'Penerimaan ZIS dari ASN dan masyarakat', isHeader: true },
    { code: '4101', name: 'Penerimaan Zakat Fitrah', type: 'Pendapatan', fund: 'Dana Zakat', desc: 'Penerimaan zakat fitrah jiwa pada bulan Ramadhan', indent: true },
    { code: '4102', name: 'Penerimaan Zakat Penghasilan / Profesi', type: 'Pendapatan', fund: 'Dana Zakat', desc: 'Potongan rutin zakat gaji & TPG ASN Kemenag', indent: true },
    { code: '4103', name: 'Penerimaan Zakat Mal Lainnya', type: 'Pendapatan', fund: 'Dana Zakat', desc: 'Zakat perniagaan, emas, simpanan, dan pertanian', indent: true },
    { code: '4201', name: 'Penerimaan Infak / Sedekah Terikat', type: 'Pendapatan', fund: 'Dana Infak', desc: 'Penerimaan infak untuk program spesifik tertentu', indent: true },
    { code: '4202', name: 'Penerimaan Infak / Sedekah Tidak Terikat', type: 'Pendapatan', fund: 'Dana Infak', desc: 'Penerimaan infak sukarela dan kotak amal UPZ', indent: true },
    { code: '4301', name: 'Penerimaan Hak Amil Bagian Zakat', type: 'Pendapatan', fund: 'Dana Amil', desc: 'Alokasi hak amil (maksimal 12.5% dari zakat terhimpun)', indent: true },
    { code: '4401', name: 'Penerimaan Dana Non-Halal', type: 'Pendapatan', fund: 'Dana Non-Halal', desc: 'Jasa giro / bunga bank konvensional', indent: true },

    // PENYALURAN & BEBAN
    { code: '5000', name: 'PENYALURAN & PENGELUARAN', type: 'Penyaluran', fund: 'Penyaluran', desc: 'Distribusi dan pendayagunaan dana ZIS', isHeader: true },
    { code: '5101', name: 'Penyaluran Zakat - Asnaf Fakir', type: 'Penyaluran', fund: 'Dana Zakat', desc: 'Bantuan santunan kebutuhan pangan & darurat fakir', indent: true },
    { code: '5102', name: 'Penyaluran Zakat - Asnaf Miskin', type: 'Penyaluran', fund: 'Dana Zakat', desc: 'Bantuan sembako, biaya hidup, dan modal usaha dhuafa', indent: true },
    { code: '5103', name: 'Penyaluran Zakat - Asnaf Amil', type: 'Penyaluran', fund: 'Dana Zakat', desc: 'Penyaluran bagian amil pengumpul dan penyalur zakat', indent: true },
    { code: '5104', name: 'Penyaluran Zakat - Asnaf Muallaf', type: 'Penyaluran', fund: 'Dana Zakat', desc: 'Santunan dan pembinaan keagamaan muallaf', indent: true },
    { code: '5105', name: 'Penyaluran Zakat - Asnaf Riqab', type: 'Penyaluran', fund: 'Dana Zakat', desc: 'Bantuan pembebasan / advokasi kemanusiaan', indent: true },
    { code: '5106', name: 'Penyaluran Zakat - Asnaf Gharim', type: 'Penyaluran', fund: 'Dana Zakat', desc: 'Bantuan pelunasan hutang mendesak demi bertahan hidup', indent: true },
    { code: '5107', name: 'Penyaluran Zakat - Asnaf Fisabilillah', type: 'Penyaluran', fund: 'Dana Zakat', desc: 'Beasiswa santri, bantuan guru ngaji, dakwah Islam', indent: true },
    { code: '5108', name: 'Penyaluran Zakat - Asnaf Ibnu Sabil', type: 'Penyaluran', fund: 'Dana Zakat', desc: 'Bantuan musafir kehabisan bekal dalam kebaikan', indent: true },
    { code: '5201', name: 'Penyaluran Infak Terikat Program', type: 'Penyaluran', fund: 'Dana Infak', desc: 'Realisasi program penyaluran infak sesuai akad donatur', indent: true },
    { code: '5202', name: 'Penyaluran Infak Tidak Terikat', type: 'Penyaluran', fund: 'Dana Infak', desc: 'Penyaluran kemaslahatan umum umat dan sosial keagamaan', indent: true },
    { code: '5301', name: 'Beban Operasional Amil - Honorarium', type: 'Beban Amil', fund: 'Dana Amil', desc: 'Honor dan uang lelah pengurus & petugas UPZ', indent: true },
    { code: '5302', name: 'Beban Operasional Amil - ATK & Transport', type: 'Beban Amil', fund: 'Dana Amil', desc: 'Pengadaan formulir, kuitansi, sosialisasi, dan monitoring', indent: true },
    { code: '5401', name: 'Penyaluran Dana Non-Halal', type: 'Penyaluran', fund: 'Dana Non-Halal', desc: 'Penyaluran untuk sarana umum (MCK, jalan, fasilitas publik)', indent: true }
  );

  return list;
});
</script>
