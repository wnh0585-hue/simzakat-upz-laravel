<template>
  <div>
    <div class="section-header">
      <div>
        <h3>{{ titleMap[transactionType] }}</h3>
        <p>Kelola dan pantau seluruh transaksi {{ transactionType.replace('_', ' ') }} UPZ</p>
      </div>
      <button class="btn btn-primary" @click="isModalOpen = true">
        <Plus :size="15" /> + Tambah Transaksi
      </button>
    </div>

    <!-- Filter Bar -->
    <div class="card card-sm" style="margin-bottom: 20px;">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; align-items: end;">
        <div>
          <label class="form-label" style="font-size: 11px;">Pencarian</label>
          <div class="search-input-wrap">
            <Search :size="15" />
            <input
              type="text"
              class="form-input search-input"
              placeholder="No Ref / Nama / Ket..."
              v-model="search"
              @keydown.enter="fetchTransactions"
            />
          </div>
        </div>
        <div>
          <label class="form-label" style="font-size: 11px;">Dari Tanggal</label>
          <input type="date" class="form-input" v-model="dateFrom" @change="fetchTransactions" />
        </div>
        <div>
          <label class="form-label" style="font-size: 11px;">Sampai Tanggal</label>
          <input type="date" class="form-input" v-model="dateTo" @change="fetchTransactions" />
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
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>TANGGAL & REF</th>
              <th>PIHAK TERKAIT</th>
              <th>KELOMPOK DANA</th>
              <th>KETERANGAN</th>
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
                <div style="font-size: 10px; color: #64748b;">
                  {{ item.payment_method === 'bank' ? `Bank (${item.bank_name || 'BSI'})` : 'Kas Tunai' }}
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

    <!-- Modal Form -->
    <div v-if="isModalOpen" class="modal-overlay" @click="isModalOpen = false">
      <div class="modal" @click.stop>
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
                rows="3"
                placeholder="Tuliskan rincian transaksi..."
                v-model="form.description"
                required
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="isModalOpen = false">Batal</button>
            <button type="submit" class="btn btn-primary">
              <Save :size="15" /> Simpan Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="detailItem" class="modal-overlay" @click="detailItem = null">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Rincian Kuitansi {{ detailItem.reference_number }}</h3>
          <button class="btn-close" @click="detailItem = null">
            <X :size="16" />
          </button>
        </div>
        <div class="modal-body">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 13px;">
            <div><span style="color: #64748b;">No. Ref:</span><br /><strong>{{ detailItem.reference_number }}</strong></div>
            <div><span style="color: #64748b;">Tanggal:</span><br /><strong>{{ formatDate(detailItem.date) }}</strong></div>
            <div><span style="color: #64748b;">Jenis:</span><br /><strong>{{ detailItem.type?.toUpperCase() }}</strong></div>
            <div><span style="color: #64748b;">Kelompok Dana:</span><br /><strong>{{ detailItem.fund_type }}</strong></div>
            <div><span style="color: #64748b;">Pihak:</span><br /><strong>{{ detailItem.party_name }}</strong></div>
            <div><span style="color: #64748b;">Nominal:</span><br /><strong style="font-size: 16px; color: #059669;">{{ formatRp(detailItem.amount) }}</strong></div>
          </div>
          <div class="divider"></div>
          <div style="font-size: 13px;">
            <span style="color: #64748b;">Uraian:</span>
            <p style="margin-top: 4px; line-height: 1.6;">{{ detailItem.description }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="detailItem = null">Tutup</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import api, { cachedGet, formatRp, formatDate, ASNAF_LABELS } from '../lib/api';
import { Plus, Search, Eye, Send, CheckCircle2, X, Save } from '@lucide/vue';

const props = defineProps<{
  transactionType: 'penerimaan' | 'penyaluran' | 'amil_operasional';
  user: any;
}>();

const data = ref<any[]>([]);
const loading = ref(false);
const isModalOpen = ref(false);
const detailItem = ref<any | null>(null);

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
  try {
    await api.post('/transactions', {
      ...form.value,
      amount: Number(form.value.amount),
      type: props.transactionType,
    });
    isModalOpen.value = false;
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
    fetchTransactions();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menyimpan transaksi');
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
