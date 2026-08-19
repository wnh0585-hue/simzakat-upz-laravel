<template>
  <div>
    <div class="section-header">
      <div>
        <h3>Log Aktivitas User (Audit Trail)</h3>
        <p>Rekam jejak seluruh aktivitas perubahan data, login, dan persetujuan transaksi</p>
      </div>
      <button v-if="user?.role === 'Admin'" class="btn btn-red btn-sm" @click="handleClearLogs">
        <Trash2 :size="14" /> Bersihkan Log
      </button>
    </div>

    <!-- Filter -->
    <div class="card card-sm" style="margin-bottom: 20px;">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; align-items: end;">
        <div>
          <label class="form-label" style="font-size: 11px;">Filter Jenis Aksi</label>
          <select class="form-select" v-model="actionFilter" @change="fetchLogs">
            <option value="">Semua Aksi</option>
            <option value="CREATE">CREATE (Tambah Data)</option>
            <option value="UPDATE">UPDATE (Ubah Data)</option>
            <option value="DELETE">DELETE (Hapus Data)</option>
            <option value="STATUS_CHANGE">STATUS_CHANGE (Persetujuan)</option>
            <option value="LOGIN">LOGIN (Masuk Sistem)</option>
          </select>
        </div>
        <div>
          <label class="form-label" style="font-size: 11px;">Dari Tanggal</label>
          <input type="date" class="form-input" v-model="dateFrom" @change="fetchLogs" />
        </div>
        <div>
          <label class="form-label" style="font-size: 11px;">Sampai Tanggal</label>
          <input type="date" class="form-input" v-model="dateTo" @change="fetchLogs" />
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>WAKTU (TIMESTAMP)</th>
              <th>PENGGUNA / EMAIL</th>
              <th>ROLE</th>
              <th>AKSI</th>
              <th>ENTITAS</th>
              <th>RINCIAN PERUBAHAN</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading && !logs.length">
              <td colspan="6" class="text-center" style="padding: 30px;">
                <span class="loading-spinner" style="width: 18px; height: 18px; margin-right: 8px;"></span>
                Memuat audit trail...
              </td>
            </tr>
            <tr v-else-if="!logs.length">
              <td colspan="6" class="text-center" style="padding: 40px; color: #64748b;">
                Belum ada log aktivitas yang tercatat.
              </td>
            </tr>
            <tr v-for="item in logs" :key="item.id">
              <td style="white-space: nowrap; font-size: 12px; color: #64748b;">
                {{ formatDate(item.created_at, true) }}
              </td>
              <td>
                <div style="font-weight: 700; font-size: 12px;">{{ item.user?.name || item.user_email || 'System' }}</div>
                <div style="font-size: 10px; color: #64748b;">{{ item.user_email }}</div>
              </td>
              <td>
                <span class="badge badge-gray" style="font-size: 10px;">{{ item.user_role || 'User' }}</span>
              </td>
              <td>
                <span :class="['badge', actionBadges[item.action] || 'badge-blue']" style="font-size: 10px;">
                  {{ item.action }}
                </span>
              </td>
              <td><strong style="font-size: 12px;">{{ item.entity }}</strong></td>
              <td style="font-size: 12px; max-width: 300px;">{{ item.details }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api, { formatDate } from '../lib/api';
import { Trash2 } from '@lucide/vue';

defineProps<{
  user: any;
}>();

const logs = ref<any[]>([]);
const loading = ref(false);
const actionFilter = ref('');
const dateFrom = ref('');
const dateTo = ref('');

const actionBadges: Record<string, string> = {
  CREATE: 'badge-green',
  UPDATE: 'badge-blue',
  DELETE: 'badge-red',
  STATUS_CHANGE: 'badge-orange',
  LOGIN: 'badge-purple',
};

const fetchLogs = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    if (actionFilter.value) params.append('action', actionFilter.value);
    if (dateFrom.value) params.append('date_from', dateFrom.value);
    if (dateTo.value) params.append('date_to', dateTo.value);

    const res = await api.get(`/audit-logs?${params.toString()}`);
    logs.value = res.data?.data || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handleClearLogs = async () => {
  if (!confirm('Bersihkan seluruh log aktivitas?')) return;
  try {
    await api.delete('/audit-logs');
    fetchLogs();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal.');
  }
};

onMounted(() => {
  fetchLogs();
});
</script>
