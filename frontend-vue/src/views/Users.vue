<template>
  <div>
    <div class="section-header">
      <div>
        <h3>Manajemen Pengguna & Hak Akses</h3>
        <p>Kelola akun pengguna, peran otorisasi, dan status keaktifan akun SIMZAKAT</p>
      </div>
      <button class="btn btn-primary" @click="openModal()">
        <UserPlus :size="14" /> + Tambah Pengguna Baru
      </button>
    </div>

    <div class="card">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>NAMA LENGKAP</th>
              <th>EMAIL</th>
              <th>HAK AKSES (ROLE)</th>
              <th>SATUAN KERJA / NIP</th>
              <th>STATUS</th>
              <th class="text-center">AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading && !data.length">
              <td colspan="6" class="text-center" style="padding: 30px;">
                <span class="loading-spinner" style="width: 18px; height: 18px; margin-right: 8px;"></span>
                Memuat pengguna...
              </td>
            </tr>
            <tr v-for="item in data" :key="item.id">
              <td><strong>{{ item.name }}</strong></td>
              <td style="color: #475569;">{{ item.email }}</td>
              <td>
                <span :class="['badge', roleColors[item.role] || 'badge-gray']">
                  {{ item.role }}
                </span>
              </td>
              <td>
                <div style="font-size: 12px;">{{ item.unit_kerja || '-' }}</div>
                <div v-if="item.nip" style="font-size: 10px; color: #64748b;">NIP: {{ item.nip }}</div>
              </td>
              <td>
                <span :class="['badge', item.active ? 'badge-green' : 'badge-red']">
                  {{ item.active ? 'Aktif' : 'Non-Aktif' }}
                </span>
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
          <h3>{{ editItem ? 'Edit Pengguna' : '+ Tambah Pengguna Baru' }}</h3>
          <button class="btn-close" @click="isModalOpen = false">
            <X :size="16" />
          </button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Nama Lengkap<span class="required">*</span></label>
                <input type="text" class="form-input" v-model="form.name" required />
              </div>
              <div class="form-group">
                <label class="form-label">Email Pengguna<span class="required">*</span></label>
                <input type="email" class="form-input" v-model="form.email" required />
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">
                  {{ editItem ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password Awal' }}
                  <span class="required">*</span>
                </label>
                <input
                  type="password"
                  class="form-input"
                  placeholder="••••••••"
                  v-model="form.password"
                  :required="!editItem"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Peran / Hak Akses (Role)<span class="required">*</span></label>
                <select class="form-select" v-model="form.role">
                  <option value="Operator">Operator (Entri Transaksi)</option>
                  <option value="Admin">Admin (Verifikasi & Kelola Data)</option>
                  <option value="Pimpinan">Pimpinan / Kepala (Approval)</option>
                  <option value="Auditor">Auditor (Melihat Laporan & Audit)</option>
                </select>
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Unit Kerja / Satuan Kerja</label>
                <input type="text" class="form-input" v-model="form.unit_kerja" />
              </div>
              <div class="form-group">
                <label class="form-label">NIP</label>
                <input type="text" class="form-input" v-model="form.nip" />
              </div>
            </div>

            <div class="form-group" style="display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" id="userActive" v-model="form.active" />
              <label for="userActive" style="font-size: 13px; cursor: pointer;">
                Akun Aktif (Dapat Login ke Sistem)
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="isModalOpen = false">Batal</button>
            <button type="submit" class="btn btn-primary">
              <Save :size="14" /> Simpan User
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
import { UserPlus, Pencil, Trash2, X, Save } from '@lucide/vue';

const data = ref<any[]>([]);
const loading = ref(false);
const isModalOpen = ref(false);
const editItem = ref<any | null>(null);

const form = ref({
  name: '',
  email: '',
  password: '',
  role: 'Operator',
  nip: '',
  unit_kerja: '',
  active: true,
});

const roleColors: Record<string, string> = {
  Admin: 'badge-red',
  Operator: 'badge-blue',
  Pimpinan: 'badge-orange',
  Auditor: 'badge-purple',
};

const fetchUsers = async () => {
  loading.value = true;
  try {
    const res = await api.get('/users');
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
    form.value = { ...item, password: '' };
  } else {
    editItem.value = null;
    form.value = {
      name: '',
      email: '',
      password: '',
      role: 'Operator',
      nip: '',
      unit_kerja: '',
      active: true,
    };
  }
  isModalOpen.value = true;
};

const handleSubmit = async () => {
  try {
    if (editItem.value) {
      await api.put(`/users/${editItem.value.id}`, form.value);
    } else {
      await api.post('/users', form.value);
    }
    isModalOpen.value = false;
    fetchUsers();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menyimpan user.');
  }
};

const handleDelete = async (id: number, name: string) => {
  if (!confirm(`Hapus pengguna "${name}"?`)) return;
  try {
    await api.delete(`/users/${id}`);
    fetchUsers();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menghapus user.');
  }
};

onMounted(() => {
  fetchUsers();
});
</script>
