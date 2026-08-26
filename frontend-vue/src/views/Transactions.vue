<template>
  <div>
    <!-- Section Header -->
    <div class="section-header">
      <div>
        <h3>{{ titleMap[transactionType] }}</h3>
        <p>Pencatatan mutasi keuangan ZIS dan operasional terintegrasi PSAK 109</p>
      </div>
      <button class="btn btn-primary" @click="isModalOpen = true">
        <Plus :size="15" /> + Tambah Transaksi
      </button>
    </div>

    <!-- Filter Bar -->
    <div class="card card-sm" style="margin-bottom: 20px;">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; align-items: end;">
        <div>
          <label class="form-label" style="font-size: 11px;">Pencarian</label>
          <div style="position: relative;">
            <input
              type="text"
              class="form-input"
              placeholder="Cari pihak / no. ref..."
              v-model="search"
              @input="fetchTransactions"
            />
            <Search :size="14" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: #94a3b8;" />
          </div>
        </div>

        <div>
          <label class="form-label" style="font-size: 11px;">Kelompok Dana</label>
          <select class="form-select" v-model="fundType" @change="fetchTransactions">
            <option value="">Semua Dana</option>
            <option value="zakat">Dana Zakat (1101)</option>
            <option value="infaq_terikat">Dana Infak Terikat (2101)</option>
            <option value="infaq_tidak_terikat">Dana Infak Tidak Terikat (2102)</option>
            <option value="amil">Dana Amil (3301)</option>
            <option value="non_halal">Dana Non-Halal (3401)</option>
          </select>
        </div>

        <div>
          <label class="form-label" style="font-size: 11px;">Status Approval</label>
          <select class="form-select" v-model="statusFilter" @change="fetchTransactions">
            <option value="">Semua Status</option>
            <option value="Draft">Draft</option>
            <option value="Diajukan">Diajukan</option>
            <option value="Terverifikasi">Terverifikasi</option>
            <option value="Disetujui">Disetujui</option>
            <option value="Tersalurkan">Tersalurkan</option>
            <option value="Ditolak">Ditolak</option>
          </select>
        </div>

        <div>
          <label class="form-label" style="font-size: 11px;">Dari Tanggal</label>
          <input type="date" class="form-input" v-model="dateFrom" @change="fetchTransactions" />
        </div>

        <div>
          <label class="form-label" style="font-size: 11px;">Sampai Tanggal</label>
          <input type="date" class="form-input" v-model="dateTo" @change="fetchTransactions" />
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="card">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>TANGGAL & NO. REF</th>
              <th>PIHAK TERKAIT</th>
              <th>KELOMPOK DANA</th>
              <th>BUKTI / KETERANGAN</th>
              <th>STATUS</th>
              <th class="text-right">NOMINAL</th>
              <th class="text-center">AKSI / APPROVAL</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading && !data.length">
              <td colspan="7" class="text-center" style="padding: 30px;">
                <span class="loading-spinner" style="width: 18px; height: 18px; margin-right: 8px;"></span>
                Memuat data transaksi...
              </td>
            </tr>
            <tr v-else-if="!data.length">
              <td colspan="7" class="text-center" style="padding: 40px; color: #64748b;">
                Tidak ada data transaksi yang sesuai filter.
              </td>
            </tr>
            <tr v-for="item in data" :key="item.id">
              <td>
                <div style="font-weight: 700; font-size: 13px;">{{ formatDate(item.date) }}</div>
                <div style="font-size: 11px; color: #2563eb; font-family: monospace;">{{ item.reference_number }}</div>
              </td>
              <td>
                <div style="font-weight: 600;">{{ item.party_name }}</div>
                <div v-if="item.asnaf" style="font-size: 10px; color: #64748b;">
                  Asnaf: {{ ASNAF_LABELS[item.asnaf] || item.asnaf }}
                </div>
              </td>
              <td>
                <span class="badge badge-gray" style="font-size: 10px;">
                  {{ item.fund_type?.replace(/_/g, ' ').toUpperCase() }}
                </span>
              </td>
              <td style="max-width: 220px;">
                <div style="font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ item.description }}</div>
                <div style="display: flex; align-items: center; gap: 8px; margin-top: 2px;">
                  <span style="font-size: 10px; color: #64748b;">
                    {{ item.payment_method === 'bank' ? `Bank (${item.bank_name || 'BSI'})` : 'Kas Tunai' }}
                  </span>
                  <a
                    v-if="item.proof_file_path"
                    :href="`http://127.0.0.1:8000/storage/${item.proof_file_path}`"
                    target="_blank"
                    rel="noreferrer"
                    class="badge badge-green"
                    style="font-size: 9px; text-decoration: none; display: inline-flex; align-items: center; gap: 2px;"
                    title="Lihat Bukti Dokumen"
                  >
                    <FileCheck :size="11" /> Bukti Ada
                  </a>
                </div>
              </td>
              <td>
                <span :class="['status-badge', `status-${item.status?.toLowerCase()}`]">{{ item.status }}</span>
              </td>
              <td class="text-right">
                <span :class="item.type === 'penerimaan' ? 'amount-positive' : 'amount-negative'" style="font-size: 14px;">
                  {{ item.type === 'penerimaan' ? '+' : '-' }}{{ formatRp(item.amount) }}
                </span>
              </td>
              <td class="text-center">
                <div style="display: flex; gap: 4px; justify-content: center; flex-wrap: wrap;">
                  <!-- Print Kwitansi -->
                  <button class="btn btn-blue btn-xs" title="Cetak Kwitansi Resmi" @click="openReceipt(item)">
                    <Printer :size="13" />
                  </button>

                  <button class="btn btn-secondary btn-xs" title="Lihat Detail" @click="detailItem = item">
                    <Eye :size="13" />
                  </button>

                  <button
                    v-if="['Draft', 'Diajukan', 'Terverifikasi'].includes(item.status) && user?.role === 'Admin'"
                    class="btn btn-primary btn-xs"
                    @click="handleUpdateStatus(item.id, 'Disetujui')"
                    title="Setujui Langsung oleh Admin"
                  >
                    <CheckCircle2 :size="12" style="margin-right: 2px;" /> Setujui
                  </button>

                  <button
                    v-else-if="item.status === 'Draft' && user?.role === 'Operator'"
                    class="btn btn-orange btn-xs"
                    @click="handleUpdateStatus(item.id, 'Diajukan')"
                  >
                    <Send :size="12" style="margin-right: 2px;" /> Ajukan
                  </button>

                  <button
                    v-else-if="item.status === 'Terverifikasi' && user?.role === 'Pimpinan'"
                    class="btn btn-primary btn-xs"
                    @click="handleUpdateStatus(item.id, 'Disetujui')"
                  >
                    <CheckCircle2 :size="12" style="margin-right: 2px;" /> Setujui
                  </button>

                  <button
                    v-if="item.status === 'Disetujui' && item.type === 'penyaluran'"
                    class="btn btn-primary btn-xs"
                    @click="handleUpdateStatus(item.id, 'Tersalurkan')"
                  >
                    <Send :size="12" style="margin-right: 2px;" /> Salurkan
                  </button>

                  <button
                    v-if="['Draft', 'Diajukan', 'Terverifikasi'].includes(item.status) && (user?.role === 'Admin' || user?.role === 'Pimpinan')"
                    class="btn btn-red btn-xs"
                    @click="handleUpdateStatus(item.id, 'Ditolak')"
                  >
                    <X :size="12" style="margin-right: 2px;" /> Tolak
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form Tambah Transaksi -->
    <div v-if="isModalOpen" class="modal-overlay" @click="isModalOpen = false">
      <div class="modal" @click.stop style="max-width: 600px;">
        <div class="modal-header">
          <h3>+ Tambah {{ titleMap[transactionType] }}</h3>
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
                <label class="form-label">Nominal (Rp)<span class="required">*</span></label>
                <input type="number" class="form-input" placeholder="Contoh: 5000000" v-model="form.amount" required min="1" />
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Kelompok Dana PSAK 109<span class="required">*</span></label>
                <select class="form-select" v-model="form.fund_type">
                  <option value="zakat">Dana Zakat (1101)</option>
                  <option value="infaq_terikat">Dana Infak Terikat (2101)</option>
                  <option value="infaq_tidak_terikat">Dana Infak Tidak Terikat (2102)</option>
                  <option value="amil">Dana Amil (3301)</option>
                  <option value="non_halal">Dana Non-Halal (3401)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">
                  {{ transactionType === 'penerimaan' ? 'Nama Muzakki / Donatur' : 'Nama Mustahik / Penerima' }}
                  <span class="required">*</span>
                </label>
                <input
                  type="text"
                  class="form-input"
                  :placeholder="transactionType === 'penerimaan' ? 'Contoh: ASN Kankemenag' : 'Contoh: Fakir Miskin'"
                  v-model="form.party_name"
                  required
                />
              </div>
            </div>

            <div v-if="transactionType === 'penyaluran'" class="form-group">
              <label class="form-label">Golongan Asnaf (8 Asnaf)</label>
              <select class="form-select" v-model="form.asnaf">
                <option value="fakir">Fakir</option>
                <option value="miskin">Miskin</option>
                <option value="amil">Amil</option>
                <option value="muallaf">Muallaf</option>
                <option value="riqab">Riqab</option>
                <option value="gharim">Gharim</option>
                <option value="fisabilillah">Fisabilillah</option>
                <option value="ibnu_sabil">Ibnu Sabil</option>
              </select>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Metode Pembayaran</label>
                <select class="form-select" v-model="form.payment_method">
                  <option value="bank">Rekening Bank (Kas Bank)</option>
                  <option value="tunai">Tunai Langsung (Kas Tunai)</option>
                </select>
              </div>
              <div v-if="form.payment_method === 'bank'" class="form-group">
                <label class="form-label">Pilih Pos Rekening Bank UPZ</label>
                <select
                  class="form-select"
                  v-model="form.bank_account_id"
                  @change="handleSelectBank"
                >
                  <option value="">-- Pilih Rekening Bank Pos --</option>
                  <option
                    v-for="b in bankAccounts"
                    :key="b.id"
                    :value="b.id"
                  >
                    {{ b.bank_name }} - {{ b.account_number }} ({{ b.fund_type ? 'Pos ' + b.fund_type.toUpperCase() : b.account_holder }})
                  </option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Keterangan / Uraian Transaksi<span class="required">*</span></label>
              <textarea
                class="form-textarea"
                rows="2"
                placeholder="Tuliskan rincian transaksi..."
                v-model="form.description"
                required
              ></textarea>
            </div>

            <!-- Upload Bukti Dokumen (Gambar / Dokumen) -->
            <div class="form-group" style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: var(--radius-sm); padding: 12px;">
              <label class="form-label" style="margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                <Paperclip :size="14" color="#059669" />
                <span>Upload Bukti Dokumen (Foto / Kuitansi / Berita Acara / PDF)</span>
              </label>
              <input
                type="file"
                ref="fileInputRef"
                class="form-input"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xlsx,.xls"
                style="background: #ffffff;"
              />
              <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">
                Format yang didukung: JPG, PNG, PDF, Excel (Maks. 10 MB).
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="isModalOpen = false">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              <span v-if="submitting" class="loading-spinner" style="width: 14px; height: 14px; margin-right: 6px;"></span>
              <Save v-else :size="15" />
              {{ submitting ? 'Menyimpan & Menyiapkan Kwitansi...' : 'Simpan & Cetak Kwitansi' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="detailItem" class="modal-overlay" @click="detailItem = null">
      <div class="modal" @click.stop style="max-width: 550px;">
        <div class="modal-header">
          <h3>Rincian Kuitansi {{ detailItem.reference_number }}</h3>
          <button class="btn-close" @click="detailItem = null">
            <X :size="16" />
          </button>
        </div>
        <div class="modal-body">
          <div class="grid-2" style="font-size: 13px; gap: 12px; margin-bottom: 12px;">
            <div><span style="color: #64748b;">Tanggal:</span><br /><strong>{{ formatDate(detailItem.date) }}</strong></div>
            <div><span style="color: #64748b;">Status:</span><br /><span :class="['status-badge', `status-${detailItem.status?.toLowerCase()}`]">{{ detailItem.status }}</span></div>
            <div><span style="color: #64748b;">Pihak Terkait:</span><br /><strong>{{ detailItem.party_name }}</strong></div>
            <div><span style="color: #64748b;">Kelompok Dana:</span><br /><strong>{{ detailItem.fund_type?.toUpperCase() }}</strong></div>
            <div><span style="color: #64748b;">Metode Bayar:</span><br /><strong>{{ detailItem.payment_method === 'bank' ? detailItem.bank_name : 'Kas Tunai' }}</strong></div>
            <div><span style="color: #64748b;">Nominal:</span><br /><strong style="font-size: 16px; color: #059669;">{{ formatRp(detailItem.amount) }}</strong></div>
          </div>
          <div class="divider"></div>
          <div style="font-size: 13px; margin-bottom: 12px;">
            <span style="color: #64748b;">Uraian:</span>
            <p style="margin-top: 4px; line-height: 1.6;">{{ detailItem.description }}</p>
          </div>

          <!-- Dokumen Lampiran -->
          <div v-if="detailItem.proof_file_path" style="background: #f1f5f9; border-radius: var(--radius-sm); padding: 10px; font-size: 12px;">
            <span style="color: #64748b; font-weight: 600;">Lampiran Dokumen Bukti:</span>
            <div style="margin-top: 6px; display: flex; align-items: center; justify-content: space-between;">
              <span style="font-weight: 700; color: #334155;">{{ detailItem.proof_file_name || 'Dokumen Bukti Penyaluran' }}</span>
              <a
                :href="`http://127.0.0.1:8000/storage/${detailItem.proof_file_path}`"
                target="_blank"
                rel="noreferrer"
                class="btn btn-secondary btn-xs"
              >
                <ExternalLink :size="12" style="margin-right: 3px;" /> Buka Lampiran
              </a>
            </div>
          </div>
        </div>
        <div class="modal-footer" style="justify-content: space-between;">
          <button class="btn btn-blue btn-sm" @click="openReceipt(detailItem)">
            <Printer :size="14" /> Cetak Kwitansi (1/2 A4)
          </button>
          <button class="btn btn-secondary" @click="detailItem = null">Tutup</button>
        </div>
      </div>
    </div>

    <!-- Kwitansi Cetak Modal (Ukuran A4 Dibagi 2 / A5 Landscape) -->
    <KwitansiModal
      :isOpen="isReceiptOpen"
      :transaction="receiptTransaction"
      :user="user"
      @close="isReceiptOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import api, { cachedGet, formatRp, formatDate, ASNAF_LABELS } from '../lib/api';
import KwitansiModal from '../components/KwitansiModal.vue';
import {
  Plus,
  Search,
  Eye,
  Send,
  CheckCircle2,
  X,
  Save,
  Printer,
  Paperclip,
  FileCheck,
  ExternalLink,
} from '@lucide/vue';

const props = defineProps<{
  transactionType: 'penerimaan' | 'penyaluran' | 'amil_operasional';
  user: any;
}>();

const data = ref<any[]>([]);
const loading = ref(false);
const submitting = ref(false);
const isModalOpen = ref(false);
const detailItem = ref<any | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

// Kwitansi Print State
const isReceiptOpen = ref(false);
const receiptTransaction = ref<any | null>(null);

const search = ref('');
const dateFrom = ref('');
const dateTo = ref('');
const fundType = ref('');
const statusFilter = ref('');

const bankAccounts = ref<any[]>([]);

const form = ref({
  date: new Date().toISOString().slice(0, 10),
  fund_type: 'zakat',
  amount: '',
  payment_method: 'bank',
  bank_account_id: '',
  bank_name: 'BSI - Rekening UPZ',
  party_name: '',
  asnaf: 'fakir',
  description: '',
});

const titleMap: Record<string, string> = {
  penerimaan: 'Penerimaan Dana ZIS',
  penyaluran: 'Penyaluran Dana ZIS (8 Asnaf)',
  amil_operasional: 'Pengeluaran Operasional Amil',
};

const openReceipt = (item: any) => {
  receiptTransaction.value = item;
  isReceiptOpen.value = true;
};

const handleSelectBank = () => {
  const selected = bankAccounts.value.find(b => b.id === Number(form.value.bank_account_id));
  if (selected) {
    form.value.bank_name = `${selected.bank_name} - ${selected.account_number}`;
    if (selected.fund_type && ['zakat', 'infaq_terikat', 'infaq_tidak_terikat', 'amil', 'non_halal'].includes(selected.fund_type)) {
      form.value.fund_type = selected.fund_type;
    }
  }
};

const fetchBankAccounts = async () => {
  try {
    const res = await api.get('/bank-accounts');
    bankAccounts.value = res.data || [];
    if (bankAccounts.value.length && !form.value.bank_account_id) {
      form.value.bank_account_id = bankAccounts.value[0].id;
      form.value.bank_name = `${bankAccounts.value[0].bank_name} - ${bankAccounts.value[0].account_number}`;
    }
  } catch (err) {
    console.error(err);
  }
};

const fetchTransactions = async () => {
  if (!data.value.length) loading.value = true;
  try {
    const params = new URLSearchParams();
    params.append('type', props.transactionType);
    if (search.value) params.append('search', search.value);
    if (dateFrom.value) params.append('date_from', dateFrom.value);
    if (dateTo.value) params.append('date_to', dateTo.value);
    if (fundType.value) params.append('fund_type', fundType.value);
    if (statusFilter.value) params.append('status', statusFilter.value);

    const res = await cachedGet(`/transactions?${params.toString()}`);
    data.value = res.data?.data || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    const fd = new FormData();
    fd.append('type', props.transactionType);
    fd.append('date', form.value.date);
    fd.append('fund_type', form.value.fund_type);
    fd.append('amount', form.value.amount);
    fd.append('payment_method', form.value.payment_method);
    if (form.value.bank_account_id) fd.append('bank_account_id', String(form.value.bank_account_id));
    if (form.value.bank_name) fd.append('bank_name', form.value.bank_name);
    fd.append('party_name', form.value.party_name);
    if (props.transactionType === 'penyaluran' && form.value.asnaf) {
      fd.append('asnaf', form.value.asnaf);
    }
    fd.append('description', form.value.description);

    // Lampiran Dokumen
    const file = fileInputRef.value?.files?.[0];
    if (file) {
      fd.append('proof_file', file);
    }

    const res = await api.post('/transactions', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    isModalOpen.value = false;
    const createdTx = res.data;

    // Reset Form
    form.value = {
      date: new Date().toISOString().slice(0, 10),
      fund_type: 'zakat',
      amount: '',
      payment_method: 'bank',
      bank_account_id: bankAccounts.value[0]?.id || '',
      bank_name: bankAccounts.value[0] ? `${bankAccounts.value[0].bank_name} - ${bankAccounts.value[0].account_number}` : 'BSI - Rekening UPZ',
      party_name: '',
      asnaf: 'fakir',
      description: '',
    };
    if (fileInputRef.value) fileInputRef.value.value = '';

    fetchTransactions();

    // Otomatis Buka Kwitansi Cetak (A5 / 1/2 A4) & Trigger Print Dialog
    receiptTransaction.value = createdTx;
    isReceiptOpen.value = true;
    setTimeout(() => {
      window.print();
    }, 400);
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menyimpan transaksi.');
  } finally {
    submitting.value = false;
  }
};

const handleUpdateStatus = async (id: number, newStatus: string) => {
  const notes = prompt(`Konfirmasi ubah status ke "${newStatus}". Catatan (opsional):`) ?? '';
  try {
    await api.patch(`/transactions/${id}/status`, { status: newStatus, notes });
    fetchTransactions();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal mengubah status.');
  }
};

watch(() => props.transactionType, () => {
  fetchTransactions();
});

onMounted(() => {
  fetchTransactions();
  fetchBankAccounts();
});
</script>
