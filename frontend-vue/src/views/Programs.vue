<template>
  <div>
    <div class="section-header">
      <div>
        <h3>Program Penyaluran ZIS</h3>
        <p>Daftar alokasi program kerja penyaluran UPZ Kemenag</p>
      </div>
      <button class="btn btn-primary" @click="openModal()">
        <Plus :size="14" /> + Tambah Program
      </button>
    </div>

    <div class="card">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>NAMA PROGRAM</th>
              <th>BIDANG</th>
              <th>SUMBER DANA</th>
              <th>PIC / WAKTU</th>
              <th class="text-right">TARGET ANGGARAN</th>
              <th class="text-right">REALISASI</th>
              <th class="text-center">AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading && !data.length">
              <td colspan="7" class="text-center" style="padding: 30px;">
                <span class="loading-spinner" style="width: 18px; height: 18px; margin-right: 8px;"></span>
                Memuat program...
              </td>
            </tr>
            <tr v-else-if="!data.length">
              <td colspan="7" class="text-center" style="padding: 40px; color: #64748b;">
                Belum ada program penyaluran yang dibuat.
              </td>
            </tr>
            <tr v-for="item in data" :key="item.id">
              <td>
                <div style="font-weight: 700; font-size: 13px;">{{ item.name }}</div>
                <div style="font-size: 11px; color: #64748b;">{{ item.description }}</div>
              </td>
              <td><span class="badge badge-purple">{{ item.bidang || '-' }}</span></td>
              <td><span class="badge badge-green">{{ FUND_LABELS[item.fund_type] || item.fund_type }}</span></td>
              <td>
                <div style="font-size: 12px;">{{ item.pic || '-' }}</div>
                <div style="font-size: 10px; color: #64748b;">{{ item.waktu_kegiatan || '-' }}</div>
              </td>
              <td class="text-right font-bold">{{ formatRp(item.target_amount) }}</td>
              <td class="text-right">
                <div style="color: #059669; font-weight: 700;">{{ formatRp(item.realisasi || 0) }}</div>
                <div style="font-size: 10px; color: #64748b;">
                  {{ item.target_amount > 0 ? Math.min(100, Math.round(((item.realisasi || 0) / item.target_amount) * 100)) : 0 }}% terserap
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
          <h3>{{ editItem ? 'Edit Program' : '+ Tambah Program Baru' }}</h3>
          <button class="btn-close" @click="isModalOpen = false">
            <X :size="16" />
          </button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Nama Program Penyaluran<span class="required">*</span></label>
              <input type="text" class="form-input" placeholder="Contoh: Beasiswa Santri Yatim" v-model="form.name" required />
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Sumber Dana Utama<span class="required">*</span></label>
                <select class="form-select" v-model="form.fund_type">
                  <option value="zakat">Dana Zakat (1101)</option>
                  <option value="infaq_terikat">Dana Infak Terikat (2101)</option>
                  <option value="infaq_tidak_terikat">Dana Infak Tidak Terikat (2102)</option>
                  <option value="amil">Dana Amil (3301)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Target Anggaran (Rp)<span class="required">*</span></label>
                <input type="number" class="form-input" placeholder="Contoh: 50000000" v-model="form.target_amount" required />
              </div>
            </div>

            <div class="form-grid-3">
              <div class="form-group">
                <label class="form-label">Bidang Program</label>
                <select class="form-select" v-model="form.bidang">
                  <option value="Pendidikan">Pendidikan</option>
                  <option value="Kesehatan">Kesehatan</option>
                  <option value="Kemanusiaan">Kemanusiaan</option>
                  <option value="Ekonomi">Ekonomi</option>
                  <option value="Dakwah-Advokasi">Dakwah-Advokasi</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">PIC / Penanggung Jawab</label>
                <input type="text" class="form-input" v-model="form.pic" placeholder="Nama PIC" />
              </div>
              <div class="form-group">
                <label class="form-label">Waktu Pelaksanaan</label>
                <input type="text" class="form-input" v-model="form.waktu_kegiatan" placeholder="Tahunan / Ramadhan" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Uraian / Sasaran Program</label>
              <textarea class="form-textarea" rows="2" v-model="form.description"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="isModalOpen = false">Batal</button>
            <button type="submit" class="btn btn-primary">
              <Save :size="14" /> Simpan Program
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api, { formatRp, FUND_LABELS } from '../lib/api';
import { Plus, Pencil, Trash2, X, Save } from '@lucide/vue';

const data = ref<any[]>([]);
const loading = ref(false);
const isModalOpen = ref(false);
const editItem = ref<any | null>(null);

const form = ref({
  name: '',
  fund_type: 'zakat',
  target_amount: '',
  description: '',
  bidang: 'Pendidikan',
  pic: '',
  waktu_kegiatan: 'Tahunan',
});

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await api.get('/programs');
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
      fund_type: 'zakat',
      target_amount: '',
      description: '',
      bidang: 'Pendidikan',
      pic: '',
      waktu_kegiatan: 'Tahunan',
    };
  }
  isModalOpen.value = true;
};

const handleSubmit = async () => {
  try {
    const payload = { ...form.value, target_amount: Number(form.value.target_amount) };
    if (editItem.value) {
      await api.put(`/programs/${editItem.value.id}`, payload);
    } else {
      await api.post('/programs', payload);
    }
    isModalOpen.value = false;
    fetchData();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menyimpan program.');
  }
};

const handleDelete = async (id: number, name: string) => {
  if (!confirm(`Hapus program "${name}"?`)) return;
  try {
    await api.delete(`/programs/${id}`);
    fetchData();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menghapus.');
  }
};

onMounted(() => {
  fetchData();
});
</script>
