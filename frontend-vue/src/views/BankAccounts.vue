<template>
  <div>
    <!-- Section Header -->
    <div class="section-header">
      <div>
        <h3>Master Rekening Bank UPZ</h3>
        <p>Kelola rekening kas bank operasional, penampungan zakat, infak, dan amil</p>
      </div>
      <button class="btn btn-primary" @click="openModal()">
        <Plus :size="15" /> + Tambah Rekening Bank
      </button>
    </div>

    <!-- Info Box -->
    <div class="card card-sm" style="margin-bottom: 20px; background: #eff6ff; border-color: #bfdbfe;">
      <div style="display: flex; gap: 12px; align-items: flex-start;">
        <Landmark :size="20" color="#2563eb" style="flex-shrink: 0; margin-top: 2px;" />
        <div style="font-size: 13px; color: #1e40af; line-height: 1.5;">
          <strong>Pemisahan Rekening Sesuai PSAK 109:</strong>
          Setiap rekening bank dapat dikhususkan untuk pos dana tertentu (Zakat, Infak, atau Amil). Rekening yang didaftarkan di sini otomatis terhubung ke form transaksi, bagan akun (COA), buku kas umum, dan laporan posisi keuangan.
        </div>
      </div>
    </div>

    <!-- Bank Accounts Table -->
    <div class="card">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>NAMA BANK</th>
              <th>NOMOR REKENING</th>
              <th>ATAS NAMA (PEMEGANG)</th>
              <th>PERUNTUKAN POS DANA</th>
              <th>KETERANGAN / DESKRIPSI</th>
              <th class="text-center" style="width: 100px;">AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading && !accounts.length">
              <td colspan="6" class="text-center" style="padding: 30px;">
                <span class="loading-spinner" style="width: 18px; height: 18px; margin-right: 8px;"></span>
                Memuat data rekening...
              </td>
            </tr>
            <tr v-else-if="!accounts.length">
              <td colspan="6" class="text-center" style="padding: 40px; color: #64748b;">
                Belum ada rekening bank yang didaftarkan. Klik tombol <strong>+ Tambah Rekening Bank</strong> di atas.
              </td>
            </tr>
            <tr v-for="b in accounts" :key="b.id">
              <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="width: 32px; height: 32px; border-radius: 6px; background: #e0f2fe; color: #0369a1; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px;">
                    {{ b.bank_name?.substring(0, 3)?.toUpperCase() }}
                  </div>
                  <div>
                    <div style="font-weight: 700; font-size: 14px; color: #0f172a;">{{ b.bank_name }}</div>
                    <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">{{ b.type }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span style="font-family: monospace; font-size: 13px; font-weight: 700; color: #2563eb; background: #eff6ff; padding: 2px 8px; border-radius: 4px; border: 1px solid #dbeafe;">
                  {{ b.account_number }}
                </span>
              </td>
              <td>
                <div style="font-weight: 600;">{{ b.account_holder }}</div>
              </td>
              <td>
                <span
                  :class="[
                    'badge',
                    b.fund_type === 'zakat' ? 'badge-green' :
                    b.fund_type === 'infaq_terikat' ? 'badge-blue' :
                    b.fund_type === 'infaq_tidak_terikat' ? 'badge-teal' :
                    b.fund_type === 'amil' ? 'badge-orange' : 'badge-gray'
                  ]"
                >
                  {{ b.fund_type ? 'Pos ' + b.fund_type.replace(/_/g, ' ').toUpperCase() : 'Semua Pos Dana' }}
                </span>
              </td>
              <td style="font-size: 12px; color: #64748b; max-width: 250px;">
                {{ b.description || '-' }}
              </td>
              <td class="text-center">
                <div style="display: flex; gap: 6px; justify-content: center;">
                  <button class="btn btn-secondary btn-xs" @click="openModal(b)" title="Edit Rekening">
                    <Edit2 :size="12" />
                  </button>
                  <button class="btn btn-red btn-xs" @click="handleDelete(b.id)" title="Hapus Rekening">
                    <Trash2 :size="12" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form Tambah/Edit Rekening -->
    <div v-if="isModalOpen" class="modal-overlay" @click="isModalOpen = false">
      <div class="modal" @click.stop style="max-width: 520px;">
        <div class="modal-header">
          <h3>{{ editingId ? 'Edit Rekening Bank' : '+ Tambah Rekening Bank UPZ' }}</h3>
          <button class="btn-close" @click="isModalOpen = false">
            <X :size="16" />
          </button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Nama Bank<span class="required">*</span></label>
                <input
                  type="text"
                  class="form-input"
                  placeholder="Contoh: Bank Jateng, BSI, BRI"
                  v-model="form.bank_name"
                  required
                />
              </div>
              <div class="form-group">
                <label class="form-label">Nomor Rekening<span class="required">*</span></label>
                <input
                  type="text"
                  class="form-input"
                  placeholder="Contoh: 2008236570"
                  v-model="form.account_number"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Atas Nama (Pemilik Rekening)<span class="required">*</span></label>
              <input
                type="text"
                class="form-input"
                placeholder="Contoh: UPZ Kemenag (Zakat Madrasah)"
                v-model="form.account_holder"
                required
              />
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Khusus Pos Kelompok Dana</label>
                <select class="form-select" v-model="form.fund_type">
                  <option value="">-- Rekening Umum (Semua Dana) --</option>
                  <option value="zakat">Pos Dana Zakat (1101)</option>
                  <option value="infaq_terikat">Pos Dana Infak Terikat (2101)</option>
                  <option value="infaq_tidak_terikat">Pos Dana Infak Bebas (2102)</option>
                  <option value="amil">Pos Hak Amil (3301)</option>
                  <option value="non_halal">Pos Dana Non-Halal (3401)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Tipe Rekening</label>
                <select class="form-select" v-model="form.type">
                  <option value="upz">Rekening Resmi UPZ</option>
                  <option value="mitra">Rekening Mitra / Penampung</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Keterangan / Fungsi Rekening</label>
              <textarea
                class="form-textarea"
                rows="2"
                placeholder="Contoh: Rekening penampungan zakat profesi ASN se-Kabupaten Kebumen"
                v-model="form.description"
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="isModalOpen = false">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <Save :size="15" /> {{ saving ? 'Menyimpan...' : 'Simpan Rekening' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../lib/api';
import { Landmark, Plus, Edit2, Trash2, X, Save } from '@lucide/vue';

const accounts = ref<any[]>([]);
const loading = ref(false);
const saving = ref(false);
const isModalOpen = ref(false);
const editingId = ref<number | null>(null);

const form = ref({
  bank_name: '',
  account_number: '',
  account_holder: '',
  fund_type: '',
  type: 'upz',
  description: '',
});

const fetchAccounts = async () => {
  loading.value = true;
  try {
    const res = await api.get('/bank-accounts');
    accounts.value = res.data || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const openModal = (item?: any) => {
  if (item) {
    editingId.value = item.id;
    form.value = {
      bank_name: item.bank_name,
      account_number: item.account_number,
      account_holder: item.account_holder,
      fund_type: item.fund_type || '',
      type: item.type || 'upz',
      description: item.description || '',
    };
  } else {
    editingId.value = null;
    form.value = {
      bank_name: '',
      account_number: '',
      account_holder: '',
      fund_type: '',
      type: 'upz',
      description: '',
    };
  }
  isModalOpen.value = true;
};

const handleSubmit = async () => {
  saving.value = true;
  try {
    if (editingId.value) {
      await api.put(`/bank-accounts/${editingId.value}`, form.value);
    } else {
      await api.post('/bank-accounts', form.value);
    }
    isModalOpen.value = false;
    fetchAccounts();
    alert('Rekening bank berhasil disimpan!');
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menyimpan rekening bank.');
  } finally {
    saving.value = false;
  }
};

const handleDelete = async (id: number) => {
  if (!confirm('Apakah Anda yakin ingin menghapus rekening bank ini?')) return;
  try {
    await api.delete(`/bank-accounts/${id}`);
    fetchAccounts();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menghapus rekening.');
  }
};

onMounted(() => {
  fetchAccounts();
});
</script>
