<template>
  <div>
    <div class="section-header">
      <div>
        <h3>Rencana Penghimpunan ZIS</h3>
        <p>Target dan estimasi penerimaan zakat/infak per periode anggaran</p>
      </div>
      <button class="btn btn-primary" @click="openModal()">
        <Plus :size="14" /> + Tambah Target Rencana
      </button>
    </div>

    <div class="card">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>NAMA RENCANA PENGHIMPUNAN</th>
              <th>KATEGORI</th>
              <th>PERIODE</th>
              <th>SETOR BAZNAS</th>
              <th class="text-right">TARGET ANGGARAN</th>
              <th class="text-right">TERHIMPUN</th>
              <th class="text-center">AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading && !data.length">
              <td colspan="7" class="text-center" style="padding: 30px;">
                <span class="loading-spinner" style="width: 18px; height: 18px; margin-right: 8px;"></span>
                Memuat data rencana...
              </td>
            </tr>
            <tr v-else-if="!data.length">
              <td colspan="7" class="text-center" style="padding: 40px; color: #64748b;">
                Belum ada rencana penghimpunan.
              </td>
            </tr>
            <tr v-for="item in data" :key="item.id">
              <td>
                <div style="font-weight: 700; font-size: 13px;">{{ item.name }}</div>
                <div style="font-size: 11px; color: #64748b;">{{ item.description }}</div>
              </td>
              <td><span class="badge badge-blue">{{ catLabels[item.category] || item.category }}</span></td>
              <td>{{ item.period || '-' }}</td>
              <td>
                <span v-if="item.setor_baznas" class="badge badge-green">
                  Setor (Ret: {{ item.baznas_return_percentage || 12.5 }}%)
                </span>
                <span v-else class="badge badge-gray">Internal UPZ</span>
              </td>
              <td class="text-right font-bold">{{ formatRp(item.target_amount) }}</td>
              <td class="text-right">
                <div style="color: #059669; font-weight: 700;">{{ formatRp(item.realisasi || 0) }}</div>
                <div style="font-size: 10px; color: #64748b;">
                  {{ item.target_amount > 0 ? Math.min(100, Math.round(((item.realisasi || 0) / item.target_amount) * 100)) : 0 }}% tercapai
                </div>
              </td>
              <td class="text-center">
                <div style="display: flex; gap: 4px; justify-content: center;">
                  <button class="btn btn-secondary btn-xs" @click="openModal(item)" title="Edit">
                    <Pencil :size="12" />
                  </button>
                  <button class="btn btn-red btn-xs" @click="handleDelete(item.id, item.name)" title="Hapus">
                    <Trash2 :size="12" />
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
          <h3>{{ editItem ? 'Edit Target' : '+ Tambah Target Penghimpunan' }}</h3>
          <button class="btn-close" @click="isModalOpen = false">
            <X :size="16" />
          </button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Nama Rencana Target<span class="required">*</span></label>
              <input type="text" class="form-input" placeholder="Contoh: Zakat Gaji ASN 2026" v-model="form.name" required />
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Kategori ZIS<span class="required">*</span></label>
                <select class="form-select" v-model="form.category">
                  <option value="zakat_mal">Zakat Mal / Profesi ASN</option>
                  <option value="zakat_fitrah">Zakat Fitrah Ramadhan</option>
                  <option value="infaq_umum">Infak / Sedekah Umum</option>
                  <option value="infaq_terikat">Infak Terikat Program</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Target Nominal (Rp)<span class="required">*</span></label>
                <input type="number" class="form-input" placeholder="Contoh: 100000000" v-model="form.target_amount" required />
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Periode Tahun Buku</label>
                <input type="text" class="form-input" v-model="form.period" />
              </div>
              <div class="form-group">
                <label class="form-label">Bagian Hak Amil (%)</label>
                <input type="number" step="0.1" class="form-input" v-model="form.baznas_return_percentage" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Uraian Sasaran</label>
              <textarea class="form-textarea" rows="2" v-model="form.description"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="isModalOpen = false">Batal</button>
            <button type="submit" class="btn btn-primary">
              <Save :size="14" /> Simpan Target
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api, { formatRp } from '../lib/api';
import { Plus, Pencil, Trash2, X, Save } from '@lucide/vue';

const data = ref<any[]>([]);
const loading = ref(false);
const isModalOpen = ref(false);
const editItem = ref<any | null>(null);

const form = ref({
  name: '',
  category: 'zakat_mal',
  target_amount: '',
  period: 'Tahun Buku 2026',
  description: '',
  setor_baznas: true,
  baznas_return_percentage: '12.5',
});

const catLabels: Record<string, string> = {
  zakat_mal: 'Zakat Mal / Profesi',
  zakat_fitrah: 'Zakat Fitrah',
  infaq_umum: 'Infak Umum',
  infaq_terikat: 'Infak Terikat',
};

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await api.get('/collection-plans');
    data.value = res.data || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const openModal = (item?: any) => {
  if (item) {
    editItem.value = item;
    form.value = { ...item, target_amount: item.target_amount?.toString() };
  } else {
    editItem.value = null;
    form.value = {
      name: '',
      category: 'zakat_mal',
      target_amount: '',
      period: 'Tahun Buku 2026',
      description: '',
      setor_baznas: true,
      baznas_return_percentage: '12.5',
    };
  }
  isModalOpen.value = true;
};

const handleSubmit = async () => {
  try {
    const payload = {
      ...form.value,
      target_amount: Number(form.value.target_amount),
      baznas_return_percentage: Number(form.value.baznas_return_percentage || 12.5),
    };
    if (editItem.value) {
      await api.put(`/collection-plans/${editItem.value.id}`, payload);
    } else {
      await api.post('/collection-plans', payload);
    }
    isModalOpen.value = false;
    fetchData();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menyimpan.');
  }
};

const handleDelete = async (id: number, name: string) => {
  if (!confirm(`Hapus rencana "${name}"?`)) return;
  try {
    await api.delete(`/collection-plans/${id}`);
    fetchData();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menghapus.');
  }
};

onMounted(() => {
  fetchData();
});
</script>
