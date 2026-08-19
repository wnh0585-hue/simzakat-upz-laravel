<template>
  <div>
    <div class="section-header">
      <div>
        <h3>Data Mustahik (Penerima Manfaat)</h3>
        <p>Daftar individu atau lembaga penerima manfaat 8 Asnaf ZIS</p>
      </div>
      <button class="btn btn-primary" @click="openModal()">
        <Plus :size="14" /> + Tambah Mustahik
      </button>
    </div>

    <!-- Filter -->
    <div class="card card-sm" style="margin-bottom: 20px;">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; align-items: end;">
        <div>
          <label class="form-label" style="font-size: 11px;">Pencarian Mustahik</label>
          <div class="search-input-wrap">
            <Search :size="15" />
            <input
              type="text"
              class="form-input search-input"
              placeholder="Cari nama, NIK, alamat..."
              v-model="search"
              @input="fetchData"
            />
          </div>
        </div>
        <div>
          <label class="form-label" style="font-size: 11px;">Golongan 8 Asnaf</label>
          <select class="form-select" v-model="asnafFilter" @change="fetchData">
            <option value="">Semua Asnaf</option>
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
        <div>
          <label class="form-label" style="font-size: 11px;">Tipe Penerima</label>
          <select class="form-select" v-model="typeFilter" @change="fetchData">
            <option value="">Semua Tipe</option>
            <option value="individu">Individu</option>
            <option value="lembaga">Lembaga / Yayasan</option>
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
              <th>NAMA MUSTAHIK</th>
              <th>GOLONGAN ASNAF</th>
              <th>TIPE</th>
              <th>IDENTITAS (NIK)</th>
              <th>KONTAK</th>
              <th>ALAMAT</th>
              <th class="text-center">AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading && !data.length">
              <td colspan="7" class="text-center" style="padding: 30px;">
                <span class="loading-spinner" style="width: 18px; height: 18px; margin-right: 8px;"></span>
                Memuat data mustahik...
              </td>
            </tr>
            <tr v-else-if="!data.length">
              <td colspan="7" class="text-center" style="padding: 40px; color: #64748b;">
                Belum ada data Mustahik.
              </td>
            </tr>
            <tr v-for="item in data" :key="item.id">
              <td>
                <div style="font-weight: 700; font-size: 13px;">{{ item.name }}</div>
              </td>
              <td>
                <span :class="['badge', asnafColors[item.asnaf] || 'badge-gray']">
                  {{ ASNAF_LABELS[item.asnaf] || item.asnaf }}
                </span>
              </td>
              <td>
                <span class="badge badge-gray" style="text-transform: capitalize;">{{ item.type }}</span>
              </td>
              <td>{{ item.nik || '-' }}</td>
              <td>{{ item.phone || '-' }}</td>
              <td style="max-width: 200px; font-size: 12px;">
                <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ item.address || '-' }}</div>
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
          <h3>{{ editItem ? 'Edit Data Mustahik' : '+ Tambah Data Mustahik Baru' }}</h3>
          <button class="btn-close" @click="isModalOpen = false">
            <X :size="16" />
          </button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Nama Lengkap / Lembaga<span class="required">*</span></label>
                <input type="text" class="form-input" v-model="form.name" required />
              </div>
              <div class="form-group">
                <label class="form-label">Golongan 8 Asnaf<span class="required">*</span></label>
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
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Tipe Penerima</label>
                <select class="form-select" v-model="form.type">
                  <option value="individu">Individu</option>
                  <option value="lembaga">Lembaga / Yayasan</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Nomor Induk Kependudukan (NIK)</label>
                <input type="text" class="form-input" v-model="form.nik" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Nomor Kontak / WhatsApp</label>
              <input type="text" class="form-input" v-model="form.phone" />
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
import api, { cachedGet, ASNAF_LABELS } from '../lib/api';
import { Plus, Search, Pencil, Trash2, X, Save } from '@lucide/vue';

const data = ref<any[]>([]);
const loading = ref(false);
const isModalOpen = ref(false);
const editItem = ref<any | null>(null);

const search = ref('');
const asnafFilter = ref('');
const typeFilter = ref('');

const form = ref({
  nik: '',
  name: '',
  phone: '',
  address: '',
  asnaf: 'fakir',
  type: 'individu',
});

const asnafColors: Record<string, string> = {
  fakir: 'badge-red',
  miskin: 'badge-orange',
  amil: 'badge-purple',
  muallaf: 'badge-blue',
  riqab: 'badge-gray',
  gharim: 'badge-orange',
  fisabilillah: 'badge-green',
  ibnu_sabil: 'badge-blue',
};

const fetchData = async () => {
  if (!data.value.length) loading.value = true;
  try {
    const params = new URLSearchParams();
    if (search.value) params.append('search', search.value);
    if (asnafFilter.value) params.append('asnaf', asnafFilter.value);
    if (typeFilter.value) params.append('type', typeFilter.value);

    const res = await cachedGet(`/mustahik?${params.toString()}`);
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
      address: '',
      asnaf: 'fakir',
      type: 'individu',
    };
  }
  isModalOpen.value = true;
};

const handleSubmit = async () => {
  try {
    if (editItem.value) {
      await api.put(`/mustahik/${editItem.value.id}`, form.value);
    } else {
      await api.post('/mustahik', form.value);
    }
    isModalOpen.value = false;
    fetchData();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menyimpan data.');
  }
};

const handleDelete = async (id: number, name: string) => {
  if (!confirm(`Hapus data Mustahik "${name}"?`)) return;
  try {
    await api.delete(`/mustahik/${id}`);
    fetchData();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menghapus data.');
  }
};

onMounted(() => {
  fetchData();
});
</script>
