<template>
  <div>
    <div class="section-header">
      <div>
        <h3>Kalkulator Zakat PSAK 109</h3>
        <p>Perhitungan nisab dan kewajiban zakat sesuai fatwa MUI dan regulasi BAZNAS</p>
      </div>
    </div>

    <div style="max-width: 800px; margin: 0 auto;">
      <!-- Tab Buttons -->
      <div style="display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap;">
        <button
          v-for="t in tabs"
          :key="t.key"
          :class="['btn', activeTab === t.key ? 'btn-primary' : 'btn-ghost']"
          @click="activeTab = t.key"
        >
          {{ t.label }}
        </button>
      </div>

      <!-- Tab Gaji -->
      <div v-if="activeTab === 'gaji'" class="card">
        <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 16px;">Simulasi Zakat Penghasilan (Bulan Berjalan)</h4>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Gaji Pokok (Rp)</label>
            <input type="number" class="form-input" placeholder="Contoh: 4500000" v-model="gajiPokok" />
          </div>
          <div class="form-group">
            <label class="form-label">Tunjangan Lainnya (Rp)</label>
            <input type="number" class="form-input" placeholder="Contoh: 2000000" v-model="tunjangan" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Pengurang / Kebutuhan Pokok Mendesak (Rp)</label>
          <input type="number" class="form-input" placeholder="Contoh: 0" v-model="potonganHutang" />
        </div>

        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: var(--radius-sm); padding: 16px; margin-top: 16px;">
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px;">
            <span style="color: #64748b;">Nisab Emas 85gr / Bulan:</span>
            <strong>{{ formatRp(nisabBulanan) }}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px;">
            <span style="color: #64748b;">Penghasilan Bersih:</span>
            <strong>{{ formatRp(hasilGaji.netto) }}</strong>
          </div>
          <div class="divider" style="margin: 10px 0;"></div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 13px; font-weight: 700;">Kewajiban Zakat (2.5%):</div>
              <span :class="['badge', hasilGaji.wajib ? 'badge-green' : 'badge-gray']" style="font-size: 10px; margin-top: 4px;">
                {{ hasilGaji.wajib ? '✓ Wajib Zakat (Mencapai Nisab)' : 'Belum Mencapai Nisab (Disunnahkan Infak)' }}
              </span>
            </div>
            <div style="font-size: 22px; font-weight: 800; color: #059669;">
              {{ formatRp(hasilGaji.zakat) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Tab TPG -->
      <div v-else-if="activeTab === 'tpg'" class="card">
        <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 16px;">Zakat Tunjangan Profesi Guru & Tukin</h4>
        <div class="form-group">
          <label class="form-label">Nominal TPG / Tukin Diterima (Rp)</label>
          <input type="number" class="form-input" placeholder="Contoh: 12000000" v-model="nominalTukin" />
        </div>

        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: var(--radius-sm); padding: 16px; margin-top: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 13px; font-weight: 700;">Potongan Zakat Langsung (2.5%):</div>
              <p style="font-size: 11px; color: #64748b;">Dihimpun UPZ Kemenag untuk disalurkan ke 8 asnaf</p>
            </div>
            <div style="font-size: 22px; font-weight: 800; color: #2563eb;">
              {{ formatRp(hasilTpg.zakat) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Fitrah -->
      <div v-else-if="activeTab === 'fitrah'" class="card">
        <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 16px;">Zakat Fitrah (Ramadhan)</h4>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Jumlah Jiwa / Tanggungan</label>
            <input type="number" class="form-input" min="1" v-model="jumlahJiwa" />
          </div>
          <div class="form-group">
            <label class="form-label">Standar Harga Beras per Kg (Rp)</label>
            <input type="number" class="form-input" v-model="hargaBerasKg" />
          </div>
        </div>

        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: var(--radius-sm); padding: 16px; margin-top: 16px;">
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px;">
            <span style="color: #64748b;">Beras (2.5 Kg / Jiwa):</span>
            <strong>{{ hasilFitrah.berasKg }} Kg Beras</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px;">
            <span style="color: #64748b;">Nominal per Jiwa:</span>
            <strong>{{ formatRp(hasilFitrah.perJiwa) }}</strong>
          </div>
          <div class="divider" style="margin: 10px 0;"></div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 13px; font-weight: 700;">Total Konversi Uang ({{ hasilFitrah.jiwa }} Jiwa):</div>
            </div>
            <div style="font-size: 22px; font-weight: 800; color: #059669;">
              {{ formatRp(hasilFitrah.total) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Emas -->
      <div v-else-if="activeTab === 'emas'" class="card">
        <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 16px;">Zakat Emas & Tabungan (Haul 1 Tahun)</h4>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Total Emas Simpanan (Gram)</label>
            <input type="number" class="form-input" placeholder="Contoh: 100" v-model="totalEmasGram" />
          </div>
          <div class="form-group">
            <label class="form-label">Harga Emas Saat Ini / Gram (Rp)</label>
            <input type="number" class="form-input" v-model="hargaEmasGram" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Total Uang Tabungan / Deposito Mengendap (Rp)</label>
          <input type="number" class="form-input" placeholder="Contoh: 50000000" v-model="totalTabungan" />
        </div>

        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: var(--radius-sm); padding: 16px; margin-top: 16px;">
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px;">
            <span style="color: #64748b;">Nisab Emas 85 Gram (Tahunan):</span>
            <strong>{{ formatRp(hasilEmas.nisabTahunan) }}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px;">
            <span style="color: #64748b;">Total Nilai Harta:</span>
            <strong>{{ formatRp(hasilEmas.totalAset) }}</strong>
          </div>
          <div class="divider" style="margin: 10px 0;"></div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 13px; font-weight: 700;">Kewajiban Zakat Mal (2.5%):</div>
              <span :class="['badge', hasilEmas.wajib ? 'badge-green' : 'badge-gray']" style="font-size: 10px; margin-top: 4px;">
                {{ hasilEmas.wajib ? '✓ Wajib Zakat Mal' : 'Belum Mencapai Nisab' }}
              </span>
            </div>
            <div style="font-size: 22px; font-weight: 800; color: #d97706;">
              {{ formatRp(hasilEmas.zakat) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { formatRp } from '../lib/api';

const activeTab = ref('gaji');

const tabs = [
  { key: 'gaji', label: 'Zakat Penghasilan / Gaji ASN' },
  { key: 'tpg', label: 'Zakat TPG & Tukin PNS' },
  { key: 'fitrah', label: 'Zakat Fitrah Ramadhan' },
  { key: 'emas', label: 'Zakat Emas & Tabungan' },
];

const gajiPokok = ref('');
const tunjangan = ref('');
const potonganHutang = ref('');
const nominalTukin = ref('');
const jumlahJiwa = ref('1');
const hargaBerasKg = ref('16000');
const totalEmasGram = ref('');
const hargaEmasGram = ref('1500000');
const totalTabungan = ref('');

const nisabBulanan = computed(() => (85 * Number(hargaEmasGram.value || 1500000)) / 12);

const hasilGaji = computed(() => {
  const totalBruto = (Number(gajiPokok.value) || 0) + (Number(tunjangan.value) || 0);
  const netto = Math.max(0, totalBruto - (Number(potonganHutang.value) || 0));
  const wajib = netto >= nisabBulanan.value;
  const zakat = wajib ? netto * 0.025 : 0;
  return { totalBruto, netto, wajib, zakat };
});

const hasilTpg = computed(() => {
  const bruto = Number(nominalTukin.value) || 0;
  const wajib = bruto > 0;
  const zakat = wajib ? bruto * 0.025 : 0;
  return { bruto, wajib, zakat };
});

const hasilFitrah = computed(() => {
  const jiwa = Number(jumlahJiwa.value) || 1;
  const perJiwa = 2.5 * (Number(hargaBerasKg.value) || 16000);
  const total = jiwa * perJiwa;
  const berasKg = jiwa * 2.5;
  return { jiwa, perJiwa, total, berasKg };
});

const hasilEmas = computed(() => {
  const emas = Number(totalEmasGram.value) || 0;
  const hrg = Number(hargaEmasGram.value) || 1500000;
  const tab = Number(totalTabungan.value) || 0;
  const totalAset = (emas * hrg) + tab;
  const nisabTahunan = 85 * hrg;
  const wajib = totalAset >= nisabTahunan;
  const zakat = wajib ? totalAset * 0.025 : 0;
  return { totalAset, nisabTahunan, wajib, zakat };
});
</script>
