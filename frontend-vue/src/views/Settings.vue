<template>
  <div>
    <div class="section-header">
      <div>
        <h3>Pengaturan Sistem & Parameter UPZ</h3>
        <p>Konfigurasi identitas organisasi, rekening kas/bank, dan parameter zakat</p>
      </div>
    </div>

    <div class="page-grid-2">
      <!-- Identitas UPZ -->
      <div class="card">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
          <Building2 :size="18" color="#059669" />
          <h4 style="font-size: 15px; font-weight: 700;">Identitas Instansi & Sistem</h4>
        </div>
        <form @submit.prevent="saveSettings">
          <div class="form-group">
            <label class="form-label">Nama UPZ</label>
            <input type="text" class="form-input" v-model="settings.upz_name" />
          </div>
          <div class="form-group">
            <label class="form-label">Alamat Kantor</label>
            <textarea class="form-textarea" rows="2" v-model="settings.upz_address"></textarea>
          </div>
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Nomor Telepon</label>
              <input type="text" class="form-input" v-model="settings.upz_phone" />
            </div>
            <div class="form-group">
              <label class="form-label">Nama BAZNAS Induk</label>
              <input type="text" class="form-input" v-model="settings.baznas_name" />
            </div>
          </div>
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Tahun Buku Aktif</label>
              <input type="text" class="form-input" v-model="settings.fiscal_year" />
            </div>
            <div class="form-group">
              <label class="form-label">Batas Hak Amil Max (%)</label>
              <input type="number" step="0.1" class="form-input" v-model="settings.amil_max_percentage" />
            </div>
          </div>

          <button type="submit" class="btn btn-primary" style="margin-top: 12px;" :disabled="saving">
            <Save :size="14" /> {{ saving ? 'Menyimpan...' : 'Simpan Pengaturan' }}
          </button>
        </form>
      </div>

      <!-- Rekening Bank -->
      <div class="card">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
          <CreditCard :size="18" color="#2563eb" />
          <h4 style="font-size: 15px; font-weight: 700;">Daftar Rekening Bank Aktif</h4>
        </div>

        <div style="margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px;">
          <div
            v-for="b in bankAccounts"
            :key="b.id"
            style="background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 14px; display: flex; align-items: center; justify-content: space-between;"
          >
            <div>
              <div style="font-weight: 700; font-size: 13px;">{{ b.bank_name }} - {{ b.account_number }}</div>
              <div style="font-size: 11px; color: #64748b;">
                a.n. {{ b.account_holder }} •
                <span class="badge badge-gray" style="font-size: 9px; margin-left: 4px; text-transform: uppercase;">{{ b.type }}</span>
                <span v-if="b.fund_type" class="badge badge-green" style="font-size: 9px; margin-left: 4px;">
                  Pos {{ b.fund_type?.replace(/_/g, ' ').toUpperCase() }}
                </span>
              </div>
            </div>
            <button class="btn btn-red btn-xs" @click="handleDeleteBank(b.id)" title="Hapus">
              <Trash2 :size="12" />
            </button>
          </div>
        </div>

        <form @submit.prevent="handleAddBank" style="border-top: 1px solid var(--border); padding-top: 16px;">
          <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 8px;">
            + Tambah Rekening Bank Pos
          </div>
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label" style="font-size: 11px;">Nama Bank</label>
              <input type="text" class="form-input" placeholder="Contoh: BSI / Bank Jateng" v-model="newBank.bank_name" required />
            </div>
            <div class="form-group">
              <label class="form-label" style="font-size: 11px;">Nomor Rekening</label>
              <input type="text" class="form-input" placeholder="Nomor Rekening" v-model="newBank.account_number" required />
            </div>
          </div>
          <div class="form-grid-3">
            <div class="form-group">
              <label class="form-label" style="font-size: 11px;">Nama Pemilik</label>
              <input type="text" class="form-input" placeholder="Nama Pemilik Rekening" v-model="newBank.account_holder" required />
            </div>
            <div class="form-group">
              <label class="form-label" style="font-size: 11px;">Tipe Rekening</label>
              <select class="form-select" v-model="newBank.type">
                <option value="upz">Rekening UPZ Kemenag</option>
                <option value="baznas">Rekening BAZNAS Kebumen</option>
                <option value="upz_penghimpunan">Rekening Penampungan ZIS</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" style="font-size: 11px;">Peruntukan Pos Dana</label>
              <select class="form-select" v-model="newBank.fund_type">
                <option value="">Umum / Bebas</option>
                <option value="zakat">Pos Dana Zakat (1101)</option>
                <option value="infaq_terikat">Pos Dana Infak Terikat (2101)</option>
                <option value="infaq_tidak_terikat">Pos Dana Infak Bebas (2102)</option>
                <option value="amil">Pos Hak Amil (3301)</option>
                <option value="non_halal">Pos Non Halal (3401)</option>
              </select>
            </div>
          </div>
          <button type="submit" class="btn btn-secondary btn-sm">
            <Plus :size="13" /> Tambah Rekening Pos
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../lib/api';
import { Building2, CreditCard, Save, Trash2, Plus } from '@lucide/vue';

const settings = ref<Record<string, any>>({
  upz_name: 'UPZ P Kankemenag Kab. Kebumen',
  upz_address: 'Jl. Pahlawan No. 123, Kebumen, Jawa Tengah',
  upz_phone: '(0287) 381101',
  baznas_name: 'BAZNAS Kabupaten Kebumen',
  fiscal_year: '2026',
  amil_max_percentage: '12.5',
});
const bankAccounts = ref<any[]>([]);
const saving = ref(false);

const newBank = ref({
  type: 'upz',
  fund_type: '',
  bank_name: '',
  account_number: '',
  account_holder: '',
  description: '',
});

const fetchData = async () => {
  try {
    const [resSet, resBank] = await Promise.all([
      api.get('/settings'),
      api.get('/bank-accounts'),
    ]);
    const setMap: Record<string, string> = {};
    Object.keys(resSet.data || {}).forEach(k => {
      setMap[k] = resSet.data[k]?.value || '';
    });
    settings.value = { ...settings.value, ...setMap };
    bankAccounts.value = resBank.data || [];
  } catch (err) {
    console.error(err);
  }
};

const saveSettings = async () => {
  saving.value = true;
  try {
    await api.post('/settings', settings.value);
    alert('Pengaturan sistem berhasil disimpan!');
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal.');
  } finally {
    saving.value = false;
  }
};

const handleAddBank = async () => {
  try {
    await api.post('/bank-accounts', newBank.value);
    newBank.value = { type: 'upz', fund_type: '', bank_name: '', account_number: '', account_holder: '', description: '' };
    const res = await api.get('/bank-accounts');
    bankAccounts.value = res.data || [];
    alert('Rekening bank pos berhasil ditambahkan!');
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal.');
  }
};

const handleDeleteBank = async (id: number) => {
  if (!confirm('Hapus rekening bank ini?')) return;
  try {
    await api.delete(`/bank-accounts/${id}`);
    bankAccounts.value = bankAccounts.value.filter(b => b.id !== id);
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal.');
  }
};

onMounted(() => {
  fetchData();
});
</script>
