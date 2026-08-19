<template>
  <div>
    <div class="section-header">
      <div>
        <h3>Arsip Digital & Bukti Transaksi</h3>
        <p>Repositori dokumen bukti transfer, nota, kuitansi BKM/BKK yang terdigitalisasi</p>
      </div>
      <button class="btn btn-primary" @click="isUploadOpen = true">
        <Upload :size="14" /> + Unggah Bukti Transaksi
      </button>
    </div>

    <div class="card">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>TANGGAL</th>
              <th>NO. REFERENSI</th>
              <th>PIHAK TERKAIT</th>
              <th>NAMA FILE BUKTI</th>
              <th>PENGUNGGAH</th>
              <th class="text-center">AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading && !data.length">
              <td colspan="6" class="text-center" style="padding: 30px;">
                <span class="loading-spinner" style="width: 18px; height: 18px; margin-right: 8px;"></span>
                Memuat arsip...
              </td>
            </tr>
            <tr v-else-if="!data.length">
              <td colspan="6" class="text-center" style="padding: 40px; color: #64748b;">
                Belum ada dokumen bukti yang diunggah.
              </td>
            </tr>
            <tr v-for="item in data" :key="item.id">
              <td>{{ formatDate(item.date) }}</td>
              <td><span style="color: #2563eb; font-weight: 700;">{{ item.reference_number }}</span></td>
              <td>{{ item.party_name }}</td>
              <td>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <FileText :size="15" color="#059669" />
                  <span>{{ item.proof_file_name || 'Dokumen Bukti' }}</span>
                </div>
              </td>
              <td>{{ item.creator?.name || 'Operator' }}</td>
              <td class="text-center">
                <a
                  v-if="item.proof_file_path"
                  :href="`http://127.0.0.1:8000/storage/${item.proof_file_path}`"
                  target="_blank"
                  rel="noreferrer"
                  class="btn btn-secondary btn-xs"
                >
                  <ExternalLink :size="12" style="margin-right: 3px;" /> Buka / Unduh
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Upload Modal -->
    <div v-if="isUploadOpen" class="modal-overlay" @click="isUploadOpen = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>+ Unggah Dokumen Bukti Transaksi</h3>
          <button class="btn-close" @click="isUploadOpen = false">
            <X :size="16" />
          </button>
        </div>
        <form @submit.prevent="handleUpload">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Pilih Transaksi Terkait<span class="required">*</span></label>
              <select class="form-select" v-model="selectedTxId" required>
                <option value="">-- Pilih Transaksi --</option>
                <option v-for="t in transactions" :key="t.id" :value="t.id">
                  {{ t.reference_number }} - {{ t.party_name }} ({{ formatDate(t.date) }})
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Pilih File Bukti (PDF, JPG, PNG, Excel)<span class="required">*</span></label>
              <input type="file" ref="fileInput" class="form-input" accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls" required />
              <div class="form-hint">Ukuran maksimal file: 10 MB</div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="isUploadOpen = false">Batal</button>
            <button type="submit" class="btn btn-primary">
              <Upload :size="14" /> Unggah Sekarang
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api, { formatDate } from '../lib/api';
import { Upload, FileText, ExternalLink, X } from '@lucide/vue';

const data = ref<any[]>([]);
const transactions = ref<any[]>([]);
const loading = ref(false);
const isUploadOpen = ref(false);
const selectedTxId = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

const fetchArchives = async () => {
  loading.value = true;
  try {
    const res = await api.get('/digital-archive');
    data.value = res.data?.data || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const fetchTransactions = async () => {
  try {
    const res = await api.get('/transactions?per_page=100');
    transactions.value = res.data?.data || [];
  } catch (err) {
    console.error(err);
  }
};

const handleUpload = async () => {
  const file = fileInput.value?.files?.[0];
  if (!file || !selectedTxId.value) {
    alert('Pilih transaksi dan file bukti.');
    return;
  }
  const fd = new FormData();
  fd.append('transaction_id', selectedTxId.value);
  fd.append('file', file);
  try {
    await api.post('/digital-archive/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    alert('File bukti berhasil diunggah!');
    isUploadOpen.value = false;
    fetchArchives();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal mengunggah.');
  }
};

onMounted(() => {
  fetchArchives();
  fetchTransactions();
});
</script>
