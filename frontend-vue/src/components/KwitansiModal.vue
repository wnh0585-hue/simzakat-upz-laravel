<template>
  <div v-if="isOpen" class="receipt-modal-overlay" @click.self="close">
    <div class="receipt-modal">
      <!-- Toolbar (Hidden on Print) -->
      <div class="receipt-toolbar no-print">
        <div style="display: flex; align-items: center; gap: 8px;">
          <Printer :size="18" color="#059669" />
          <h3 style="font-size: 15px; font-weight: 700; margin: 0;">
            Kwitansi Resmi {{ isPenyaluran ? 'Bukti Kas Keluar (BKK)' : 'Bukti Kas Masuk (BKM)' }}
          </h3>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-primary btn-sm" @click="handlePrint">
            <Printer :size="14" /> Cetak / Unduh PDF (Ukuran 1/2 A4)
          </button>
          <button class="btn btn-secondary btn-sm" @click="close">
            <X :size="14" /> Tutup
          </button>
        </div>
      </div>

      <!-- Receipt Content (Printable A5 Landscape / Setengah A4) -->
      <div class="receipt-paper" id="printable-receipt">
        <!-- KOP SURAT RESMI -->
        <div class="receipt-kop">
          <div class="receipt-kop-logo">
            <AppLogo :size="48" />
          </div>
          <div class="receipt-kop-text">
            <div class="kop-instansi">UNIT PENGUMPUL ZAKAT (UPZ)</div>
            <div class="kop-kemenag">KANTOR KEMENTERIAN AGAMA KABUPATEN KEBUMEN</div>
            <div class="kop-baznas">MITRA RESMI BAZNAS KABUPATEN KEBUMEN • PSAK 109</div>
            <div class="kop-alamat">Jl. Pahlawan No. 123, Kebumen, Jawa Tengah 54311 • Telp: (0287) 381101</div>
          </div>
        </div>

        <div class="receipt-kop-line"></div>

        <!-- JUDUL & NO REF -->
        <div class="receipt-title-box">
          <div class="receipt-title">
            {{ isPenyaluran ? 'KUITANSI PENYALURAN DANA ZIS (BUKTI KAS KELUAR)' : 'KUITANSI PENERIMAAN DANA ZIS (BUKTI KAS MASUK)' }}
          </div>
          <div class="receipt-ref">
            NOMOR: <strong>{{ transaction?.reference_number || '-' }}</strong>
          </div>
        </div>

        <!-- FORM DATA TRANSAKSI -->
        <div class="receipt-body">
          <table class="receipt-table">
            <tbody>
              <tr>
                <td class="lbl-col">{{ isPenyaluran ? 'Disalurkan Kepada' : 'Telah Diterima Dari' }}</td>
                <td class="dot-col">:</td>
                <td class="val-col">
                  <strong>{{ transaction?.party_name || '-' }}</strong>
                  <span v-if="transaction?.asnaf" class="receipt-asnaf-badge">
                    (Asnaf: {{ ASNAF_LABELS[transaction?.asnaf] || transaction?.asnaf }})
                  </span>
                  <span v-if="transaction?.program_name" style="margin-left: 6px; font-size: 11px; color: #475569;">
                    • Program: {{ transaction?.program_name }}
                  </span>
                </td>
              </tr>
              <tr>
                <td class="lbl-col">Jumlah Nominal</td>
                <td class="dot-col">:</td>
                <td class="val-col">
                  <span class="nominal-badge">{{ formatRp(transaction?.amount) }}</span>
                </td>
              </tr>
              <tr>
                <td class="lbl-col">Terbilang</td>
                <td class="dot-col">:</td>
                <td class="val-col terbilang-text">
                  <em># {{ terbilang(transaction?.amount) }} #</em>
                </td>
              </tr>
              <tr>
                <td class="lbl-col">Kelompok Pos Dana</td>
                <td class="dot-col">:</td>
                <td class="val-col">
                  {{ FUND_LABELS[transaction?.fund_type] || transaction?.fund_type?.toUpperCase() }}
                  <span v-if="transaction?.payment_method" style="margin-left: 8px; font-size: 11px; color: #64748b;">
                    • Metode: {{ transaction?.payment_method === 'bank' ? `Transfer Bank (${transaction?.bank_name || 'Bank'})` : 'Kas Tunai' }}
                  </span>
                </td>
              </tr>
              <tr>
                <td class="lbl-col">Untuk Keperluan</td>
                <td class="dot-col">:</td>
                <td class="val-col" style="line-height: 1.4;">
                  {{ transaction?.description || '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- TANDA TANGAN 3 PIHAK -->
        <div class="receipt-signatures">
          <div class="sig-box">
            <div class="sig-date">&nbsp;</div>
            <div class="sig-role">{{ isPenyaluran ? 'Yang Menerima / Mustahik,' : 'Penyetor / Muzakki,' }}</div>
            <div class="sig-line"></div>
            <div class="sig-name">{{ transaction?.party_name || '( .................................... )' }}</div>
          </div>

          <div class="sig-box">
            <div class="sig-date">&nbsp;</div>
            <div class="sig-role">Petugas Amil / Penyalur,</div>
            <div class="sig-line"></div>
            <div class="sig-name">{{ transaction?.creator?.name || user?.name || 'Petugas Amil' }}</div>
          </div>

          <div class="sig-box">
            <div class="sig-date">Kebumen, {{ formatDate(transaction?.date || new Date().toISOString()) }}</div>
            <div class="sig-role">Mengetahui,<br /><strong>Ketua UPZ Kemenag Kebumen</strong></div>
            <div class="sig-line"></div>
            <div class="sig-name">H. Suparmo, S.Ag., M.Pd.I</div>
          </div>
        </div>

        <!-- FOOTER KECIL -->
        <div class="receipt-footer-note">
          <span>* Lembar 1: Arsip UPZ • Lembar 2: Penerima/Mustahik • Sistem Akuntansi SIMZAKAT PSAK 109</span>
          <span style="font-family: monospace;">Dicetak: {{ new Date().toLocaleString('id-ID') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import AppLogo from './AppLogo.vue';
import { formatRp, formatDate, terbilang, ASNAF_LABELS, FUND_LABELS } from '../lib/api';
import { Printer, X } from '@lucide/vue';

const props = defineProps<{
  isOpen: boolean;
  transaction: any;
  user: any;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const isPenyaluran = computed(() => {
  return props.transaction?.type === 'penyaluran' || props.transaction?.type === 'amil_operasional';
});

const close = () => {
  emit('close');
};

const handlePrint = () => {
  const receiptEl = document.getElementById('printable-receipt');
  if (!receiptEl) {
    window.print();
    return;
  }

  const printWin = window.open('', '_blank', 'width=850,height=600');
  if (!printWin) {
    window.print();
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Kwitansi ${props.transaction?.reference_number || 'ZIS'} - UPZ Kemenag Kebumen</title>
        <style>
          @page {
            size: A5 landscape;
            margin: 6mm 8mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Arial, sans-serif;
          }
          body {
            background: #ffffff;
            color: #0f172a;
            padding: 10px;
          }
          .receipt-kop {
            display: flex;
            align-items: center;
            gap: 14px;
            margin-bottom: 6px;
          }
          .receipt-kop-logo {
            flex-shrink: 0;
          }
          .receipt-kop-text {
            flex: 1;
            text-align: center;
          }
          .kop-instansi {
            font-size: 13px;
            font-weight: 800;
            color: #059669;
          }
          .kop-kemenag {
            font-size: 14px;
            font-weight: 900;
            color: #0f172a;
          }
          .kop-baznas {
            font-size: 9.5px;
            font-weight: 700;
            color: #475569;
          }
          .kop-alamat {
            font-size: 9px;
            color: #64748b;
            margin-top: 1px;
          }
          .receipt-kop-line {
            border-top: 2.5px double #0f172a;
            margin-bottom: 10px;
          }
          .receipt-title-box {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            padding: 4px 10px;
            margin-bottom: 10px;
          }
          .receipt-title {
            font-size: 11px;
            font-weight: 800;
            color: #0f172a;
          }
          .receipt-ref {
            font-size: 10.5px;
            color: #0f172a;
            font-family: monospace;
          }
          .receipt-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
          }
          .receipt-table td {
            padding: 4px 3px;
            vertical-align: top;
            font-size: 11px;
          }
          .lbl-col {
            width: 140px;
            font-weight: 600;
            color: #334155;
          }
          .dot-col {
            width: 10px;
            text-align: center;
            font-weight: bold;
          }
          .val-col {
            color: #0f172a;
          }
          .nominal-badge {
            font-size: 13px;
            font-weight: 900;
            color: #047857;
            background: #ecfdf5;
            border: 1px solid #a7f3d0;
            padding: 1px 6px;
            border-radius: 4px;
            display: inline-block;
          }
          .terbilang-text {
            font-weight: 700;
            color: #1e3a8a;
            background: #eff6ff;
            padding: 3px 6px !important;
            border-radius: 4px;
            border: 1px dashed #bfdbfe;
          }
          .receipt-asnaf-badge {
            background: #f3e8ff;
            color: #7e22ce;
            font-size: 9.5px;
            font-weight: 700;
            padding: 1px 5px;
            border-radius: 3px;
            margin-left: 4px;
          }
          .receipt-signatures {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 8px;
            margin-top: 14px;
            text-align: center;
          }
          .sig-box {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .sig-date {
            font-size: 9.5px;
            color: #475569;
            min-height: 13px;
          }
          .sig-role {
            font-size: 10px;
            color: #334155;
            min-height: 24px;
          }
          .sig-line {
            width: 120px;
            border-bottom: 1px solid #0f172a;
            margin-top: 42px;
            margin-bottom: 3px;
          }
          .sig-name {
            font-size: 10px;
            font-weight: 700;
            color: #0f172a;
          }
          .receipt-footer-note {
            display: flex;
            justify-content: space-between;
            font-size: 8px;
            color: #94a3b8;
            border-top: 1px dotted #cbd5e1;
            padding-top: 4px;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        ${receiptEl.innerHTML}
      </body>
    </html>
  `;

  printWin.document.open();
  printWin.document.write(htmlContent);
  printWin.document.close();
  printWin.focus();

  setTimeout(() => {
    printWin.print();
    printWin.close();
  }, 350);
};

defineExpose({
  handlePrint,
});
</script>

<style scoped>
.receipt-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  overflow-y: auto;
}

.receipt-modal {
  background: #ffffff;
  border-radius: 12px;
  max-width: 820px;
  width: 100%;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.receipt-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

/* KERTAS KWITANSI (Ukuran A5 Landscape / Setengah A4) */
.receipt-paper {
  background: #ffffff;
  padding: 24px 30px;
  color: #0f172a;
  font-family: 'Segoe UI', Arial, sans-serif;
  font-size: 12px;
  box-sizing: border-box;
}

.receipt-kop {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.receipt-kop-text {
  flex: 1;
  text-align: center;
}

.kop-instansi {
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: #059669;
}

.kop-kemenag {
  font-size: 15px;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.3px;
}

.kop-baznas {
  font-size: 10px;
  font-weight: 700;
  color: #475569;
}

.kop-alamat {
  font-size: 9.5px;
  color: #64748b;
  margin-top: 2px;
}

.receipt-kop-line {
  border-top: 3px double #0f172a;
  margin-bottom: 12px;
}

.receipt-title-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 6px 12px;
  margin-bottom: 14px;
}

.receipt-title {
  font-size: 11.5px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: 0.2px;
}

.receipt-ref {
  font-size: 11px;
  color: #0f172a;
  font-family: monospace;
}

.receipt-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 14px;
}

.receipt-table td {
  padding: 5px 4px;
  vertical-align: top;
  font-size: 11.5px;
}

.lbl-col {
  width: 150px;
  font-weight: 600;
  color: #334155;
}

.dot-col {
  width: 12px;
  text-align: center;
  font-weight: bold;
}

.val-col {
  color: #0f172a;
}

.nominal-badge {
  font-size: 14px;
  font-weight: 900;
  color: #047857;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  padding: 2px 8px;
  border-radius: 4px;
}

.terbilang-text {
  font-weight: 700;
  color: #1e3a8a;
  background: #eff6ff;
  padding: 4px 8px !important;
  border-radius: 4px;
  border: 1px dashed #bfdbfe;
}

.receipt-asnaf-badge {
  background: #f3e8ff;
  color: #7e22ce;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 6px;
}

.receipt-signatures {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  margin-top: 18px;
  text-align: center;
}

.sig-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sig-date {
  font-size: 10px;
  color: #475569;
  min-height: 14px;
  margin-bottom: 4px;
}

.sig-role {
  font-size: 10.5px;
  color: #334155;
  min-height: 28px;
}

.sig-line {
  width: 140px;
  border-bottom: 1px solid #0f172a;
  margin-top: 48px;
  margin-bottom: 4px;
}

.sig-name {
  font-size: 10.5px;
  font-weight: 700;
  color: #0f172a;
}

.receipt-footer-note {
  display: flex;
  justify-content: space-between;
  font-size: 8.5px;
  color: #94a3b8;
  border-top: 1px dotted #cbd5e1;
  padding-top: 6px;
  margin-top: 14px;
}

/* PRINT CSS (Ukuran Kertas A4 Dibagi 2 / A5 Landscape) */
@media print {
  @page {
    size: A5 landscape;
    margin: 6mm;
  }

  body * {
    visibility: hidden;
  }

  .no-print {
    display: none !important;
  }

  .receipt-modal-overlay {
    position: absolute;
    inset: 0;
    background: transparent;
    padding: 0;
    margin: 0;
    display: block;
  }

  .receipt-modal {
    box-shadow: none;
    border-radius: 0;
    max-width: 100%;
    width: 100%;
  }

  .receipt-paper,
  .receipt-paper * {
    visibility: visible;
  }

  .receipt-paper {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    padding: 0;
  }
}
</style>
