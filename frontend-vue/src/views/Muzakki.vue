<template>
  <div>
    <div class="section-header">
      <div>
        <h3>Data Muzakki & Munfiq</h3>
        <p>Database donatur zakat, infak, dan sedekah UPZ Kemenag</p>
      </div>
      <div style="display: flex; gap: 8px;">
        <input
          type="file"
          ref="fileInputRef"
          @change="handleImportExcel"
          accept=".xlsx,.xls,.csv"
          style="display: none;"
        />
        <button class="btn btn-secondary" @click="fileInputRef?.click()">
          <Upload :size="14" /> Import Excel
        </button>
        <button class="btn btn-primary" @click="openModal()">
          <Plus :size="14" /> + Tambah Muzakki
        </button>
      </div>
    </div>

    <!-- Filter -->
    <div class="card card-sm" style="margin-bottom: 20px;">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; align-items: end;">
        <div>
          <label class="form-label" style="font-size: 11px;">Pencarian Donatur</label>
          <div class="search-input-wrap">
            <Search :size="15" />
            <input
              type="text"
              class="form-input search-input"
              placeholder="Cari nama, NIK, NIP, satker..."
              v-model="search"
              @input="fetchData"
            />
          </div>
        </div>
        <div>
          <label class="form-label" style="font-size: 11px;">Tipe Donatur</label>
          <select class="form-select" v-model="filterType" @change="fetchData">
            <option value="">Semua Tipe</option>
            <option value="individu">Individu / Pegawai</option>
            <option value="badan_usaha">Badan Usaha / Lembaga</option>
          </select>
        </div>
        <div>
          <label class="form-label" style="font-size: 11px;">Klasifikasi Status</label>
          <select class="form-select" v-model="filterStatus" @change="fetchData">
            <option value="">Semua Status</option>
            <option value="Muzakki">Muzakki (Wajib Zakat)</option>
            <option value="Munfiq">Munfiq (Infak/Sedekah)</option>
            <option value="Keduanya">Keduanya</option>
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
              <th>NAMA DONATUR</th>
              <th>IDENTITAS (NIK / NIP)</th>
              <th>UNIT KERJA / SATKER</th>
              <th>GOLONGAN</th>
              <th>STATUS</th>
              <th>KONTAK</th>
              <th class="text-center">AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading && !data.length">
              <td colspan="7" class="text-center" style="padding: 30px;">
                <span class="loading-spinner" style="width: 18px; height: 18px; margin-right: 8px;"></span>
                Memuat data donatur...
              </td>
            </tr>
            <tr v-else-if="!data.length">
              <td colspan="7" class="text-center" style="padding: 40px; color: #64748b;">
                Belum ada data Muzakki.
              </td>
            </tr>
            <tr v-for="item in data" :key="item.id">
              <td>
                <div style="font-weight: 700; font-size: 13px;">{{ item.name }}</div>
                <span class="badge badge-gray" style="font-size: 9px; text-transform: capitalize;">{{ item.type }}</span>
              </td>
              <td>
                <div style="font-size: 12px;">{{ item.nik || '-' }}</div>
                <div v-if="item.nip" style="font-size: 10px; color: #64748b;">NIP: {{ item.nip }}</div>
              </td>
              <td>{{ item.unit_kerja || '-' }}</td>
              <td>
                <span v-if="item.golongan" class="badge badge-blue">{{ item.golongan }}</span>
                <span v-else>-</span>
              </td>
              <td>
                <span :class="['badge', item.status === 'Muzakki' ? 'badge-green' : item.status === 'Munfiq' ? 'badge-blue' : 'badge-purple']">
                  {{ item.status }}
                </span>
              </td>
              <td>
                <div style="font-size: 12px;">{{ item.phone || '-' }}</div>
                <div style="font-size: 10px; color: #64748b;">{{ item.email || '-' }}</div>
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
          <h3>{{ editItem ? 'Edit Data Muzakki' : '+ Tambah Data Muzakki Baru' }}</h3>
          <button class="btn-close" @click="isModalOpen = false">
            <X :size="16" />
          </button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Nama Lengkap / Instansi<span class="required">*</span></label>
                <input type="text" class="form-input" v-model="form.name" required />
              </div>
              <div class="form-group">
                <label class="form-label">Tipe Donatur</label>
                <select class="form-select" v-model="form.type">
                  <option value="individu">Individu / Pegawai</option>
                  <option value="badan_usaha">Badan Usaha / Lembaga</option>
                </select>
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">NIK (Nomor Kependudukan)</label>
                <input type="text" class="form-input" v-model="form.nik" />
              </div>
              <div class="form-group">
                <label class="form-label">NIP (Pegawai Kemenag)</label>
                <input type="text" class="form-input" v-model="form.nip" />
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Satuan Kerja / Unit Kerja</label>
                <input type="text" class="form-input" placeholder="Contoh: Kankemenag Kebumen" v-model="form.unit_kerja" />
              </div>
              <div class="form-group">
                <label class="form-label">Golongan Pangkat</label>
                <input type="text" class="form-input" placeholder="Contoh: IV/a" v-model="form.golongan" />
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Status Donatur</label>
                <select class="form-select" v-model="form.status">
                  <option value="Muzakki">Muzakki (Wajib Zakat)</option>
                  <option value="Munfiq">Munfiq (Infak/Sedekah)</option>
                  <option value="Keduanya">Keduanya</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Nomor Telepon / WhatsApp</label>
                <input type="text" class="form-input" placeholder="08xxxxxxxxxx" v-model="form.phone" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Alamat Lengkap</label>
              <textarea class="form-textarea" rows="2" v-model="form.address"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="isModalOpen = false">Batal</button>
            <button type="submit" class="btn btn-primary">
              <Save :size="14" /> Simpan Data
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api, { cachedGet } from '../lib/api';
import { Plus, Upload, Search, Pencil, Trash2, X, Save } from '@lucide/vue';

const data = ref<any[]>([]);
const loading = ref(false);
const isModalOpen = ref(false);
const editItem = ref<any | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

const search = ref('');
const filterType = ref('');
const filterStatus = ref('');

const form = ref({
  nik: '',
  name: '',
  phone: '',
  email: '',
  address: '',
  type: 'individu',
  nip: '',
  unit_kerja: '',
  golongan: '',
  status: 'Muzakki',
});

const fetchData = async () => {
  if (!data.value.length) loading.value = true;
  try {
    const params = new URLSearchParams();
    if (search.value) params.append('search', search.value);
    if (filterType.value) params.append('type', filterType.value);
    if (filterStatus.value) params.append('status', filterStatus.value);

    const res = await cachedGet(`/muzakki?${params.toString()}`);
    data.value = res.data?.data || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const openModal = (item?: any) => {
  if (item) {
    editItem.value = item;
    form.value = { ...item };
  } else {
    editItem.value = null;
    form.value = {
      nik: '',
      name: '',
      phone: '',
      email: '',
      address: '',
      type: 'individu',
      nip: '',
      unit_kerja: '',
      golongan: '',
      status: 'Muzakki',
    };
  }
  isModalOpen.value = true;
};

const handleSubmit = async () => {
  try {
    if (editItem.value) {
      await api.put(`/muzakki/${editItem.value.id}`, form.value);
    } else {
      await api.post('/muzakki', form.value);
    }
    isModalOpen.value = false;
    fetchData();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menyimpan data.');
  }
};

const handleDelete = async (id: number, name: string) => {
  if (!confirm(`Hapus data Muzakki "${name}"?`)) return;
  try {
    await api.delete(`/muzakki/${id}`);
    fetchData();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menghapus data.');
  }
};

const handleImportExcel = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const fd = new FormData();
  fd.append('file', file);
  try {
    await api.post('/muzakki/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    alert('Import data Muzakki berhasil!');
    fetchData();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal import Excel.');
  } finally {
    if (fileInputRef.value) fileInputRef.value.value = '';
  }
};

onMounted(() => {
  fetchData();
});
</script>
