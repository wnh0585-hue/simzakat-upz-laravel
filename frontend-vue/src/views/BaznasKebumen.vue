<template>
  <div>
    <div class="section-header">
      <div>
        <h3>Setoran & Pengembalian BAZNAS Kebumen</h3>
        <p>Pencatatan arus dana setoran ZIS ke BAZNAS Kab. Kebumen dan pengembalian hak amil/mustahik</p>
      </div>
      <button class="btn btn-primary" @click="isModalOpen = true">
        <Plus :size="14" /> + Catat Transaksi BAZNAS
      </button>
    </div>

    <div class="card">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>TANGGAL</th>
              <th>JENIS ARUS</th>
              <th>KATEGORI DANA</th>
              <th>REKENING BAZNAS / UPZ</th>
              <th>KETERANGAN</th>
              <th class="text-right">NOMINAL</th>
              <th>STATUS</th>
              <th class="text-center">AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading && !data.length">
              <td colspan="8" class="text-center" style="padding: 30px;">
                <span class="loading-spinner" style="width: 18px; height: 18px; margin-right: 8px;"></span>
                Memuat data...
              </td>
            </tr>
            <tr v-else-if="!data.length">
              <td colspan="8" class="text-center" style="padding: 40px; color: #64748b;">
                Belum ada riwayat transaksi dengan BAZNAS Kebumen.
              </td>
            </tr>
            <tr v-for="item in data" :key="item.id">
              <td style="white-space: nowrap; font-size: 12px;">{{ formatDate(item.date) }}</td>
              <td>
                <span :class="['badge', item.type === 'setor' ? 'badge-orange' : 'badge-green']">
                  <ArrowUpRight v-if="item.type === 'setor'" :size="12" style="margin-right: 3px;" />
                  <ArrowDownLeft v-else :size="12" style="margin-right: 3px;" />
                  {{ item.type === 'setor' ? 'Setoran ke BAZNAS' : 'Pengembalian BAZNAS' }}
                </span>
              </td>
              <td>{{ item.category || '-' }}</td>
              <td style="font-size: 12px;">{{ item.bank_account }}</td>
              <td style="max-width: 200px; font-size: 12px;">{{ item.description }}</td>
              <td class="text-right font-bold" :style="{ color: item.type === 'setor' ? '#d97706' : '#059669' }">
                {{ formatRp(item.amount) }}
              </td>
              <td>
                <span :class="['status-badge', `status-${item.status?.toLowerCase() || 'draft'}`]">
                  {{ item.status }}
                </span>
              </td>
              <td class="text-center">
                <button v-if="item.status === 'Draft'" class="btn btn-primary btn-xs" @click="handleApprove(item.id)">
                  <Check :size="12" style="margin-right: 2px;" /> Setujui
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="isModalOpen" class="modal-overlay" @click="isModalOpen = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>+ Catat Transaksi BAZNAS Kebumen</h3>
          <button class="btn-close" @click="isModalOpen = false">
            <X :size="16" />
          </button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Tanggal Transaksi<span class="required">*</span></label>
                <input type="date" class="form-input" v-model="form.date" required />
              </div>
              <div class="form-group">
                <label class="form-label">Jenis Arus Transaksi<span class="required">*</span></label>
                <select class="form-select" v-model="form.type">
                  <option value="setor">Setoran ZIS UPZ ke BAZNAS Kebumen</option>
                  <option value="pengembalian">Pengembalian Hak Amil / Penyaluran dari BAZNAS</option>
                </select>
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Kategori Dana</label>
                <input type="text" class="form-input" placeholder="Contoh: Zakat Mal ASN" v-model="form.category" />
              </div>
              <div class="form-group">
                <label class="form-label">Nominal (Rp)<span class="required">*</span></label>
                <input type="number" class="form-input" placeholder="Contoh: 25000000" v-model="form.amount" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Rekening Bank Tujuan / Sumber</label>
              <select class="form-select" v-model="form.bank_account">
                <option value="Bank Jateng Syariah - 5027127127 (BAZNAS Kebumen)">
                  Bank Jateng Syariah - 5027127127 (BAZNAS Kebumen)
                </option>
                <option
                  v-for="b in bankAccounts"
                  :key="b.id"
                  :value="`${b.bank_name} - ${b.account_number} (${b.account_holder})`"
                >
                  {{ b.bank_name }} - {{ b.account_number }} ({{ b.account_holder }})
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Keterangan / Uraian<span class="required">*</span></label>
              <textarea class="form-textarea" rows="2" placeholder="Tuliskan keterangan..." v-model="form.description" required></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="isModalOpen = false">Batal</button>
            <button type="submit" class="btn btn-primary">
              <Save :size="14" /> Simpan Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api, { formatRp, formatDate } from '../lib/api';
import { Plus, ArrowUpRight, ArrowDownLeft, Check, X, Save } from '@lucide/vue';

const data = ref<any[]>([]);
const bankAccounts = ref<any[]>([]);
const loading = ref(false);
const isModalOpen = ref(false);

const form = ref({
  date: new Date().toISOString().slice(0, 10),
  type: 'setor',
  category: 'Zakat Mal ASN',
  amount: '',
  bank_account: 'Bank Jateng Syariah - 5027127127 (BAZNAS Kebumen)',
  description: '',
});

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await api.get('/baznas-transactions');
    data.value = res.data?.data || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  try {
    await api.post('/baznas-transactions', {
      ...form.value,
      amount: Number(form.value.amount),
    });
    isModalOpen.value = false;
    fetchData();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menyimpan.');
  }
};

const handleApprove = async (id: number) => {
  if (!confirm('Setujui transaksi setoran/pengembalian BAZNAS ini?')) return;
  try {
    await api.patch(`/baznas-transactions/${id}/approve`);
    fetchData();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menyetujui.');
  }
};

const fetchBankAccounts = async () => {
  try {
    const res = await api.get('/bank-accounts');
    bankAccounts.value = res.data || [];
  } catch (err) {
    console.error(err);
  }
};

onMounted(() => {
  fetchData();
  fetchBankAccounts();
});
</script>
