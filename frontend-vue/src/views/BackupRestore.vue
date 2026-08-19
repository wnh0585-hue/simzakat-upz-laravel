<template>
  <div>
    <div class="section-header">
      <div>
        <h3>Backup & Restore Database SIMZAKAT</h3>
        <p>Pencadangan dan pemulihan database (mendukung format JSON Firebase & Laravel)</p>
      </div>
    </div>

    <!-- Notification -->
    <div
      v-if="notification"
      :class="['card card-sm', notification.type === 'success' ? 'bg-green' : 'bg-red']"
      :style="{
        background: notification.type === 'success' ? '#ecfdf5' : '#fef2f2',
        borderColor: notification.type === 'success' ? '#a7f3d0' : '#fecaca',
        color: notification.type === 'success' ? '#047857' : '#dc2626',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }"
    >
      <CheckCircle2 v-if="notification.type === 'success'" :size="18" />
      <AlertTriangle v-else :size="18" />
      <span style="font-size: 13px; font-weight: 600;">{{ notification.message }}</span>
    </div>

    <div class="page-grid-2">
      <!-- 1. BACKUP -->
      <div class="card">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px;">
          <Download :size="18" color="#059669" />
          <h4 style="font-size: 15px; font-weight: 700;">1. Cadangkan Database (Backup JSON)</h4>
        </div>
        <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin-bottom: 20px;">
          Mengunduh seluruh rekaman data database (Muzakki, Mustahik, Program, Rencana, Transaksi ZIS, dan BAZNAS) ke file JSON terstruktur.
        </p>
        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: var(--radius-sm); padding: 12px; margin-bottom: 20px; font-size: 12px; display: flex; align-items: center; gap: 6px;">
          <CheckCircle2 :size="14" color="#059669" />
          <span>Format JSON lengkap kompatibel antar-sistem offline & cloud.</span>
        </div>
        <button class="btn btn-primary" @click="handleBackup" :disabled="loading" style="width: 100%; justify-content: center;">
          <Download :size="14" /> {{ loading ? 'Mengekspor Database...' : 'Unduh Backup Database (.JSON)' }}
        </button>
      </div>

      <!-- 2. RESTORE -->
      <div class="card" style="border-top: 3px solid #2563eb;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px;">
          <UploadCloud :size="18" color="#2563eb" />
          <h4 style="font-size: 15px; font-weight: 700;">2. Pulihkan Database (Restore JSON)</h4>
        </div>
        <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin-bottom: 16px;">
          Unggah file backup JSON dari proyek Firebase sebelumnya atau hasil backup sistem ini untuk memulihkan seluruh data.
        </p>

        <!-- Upload Trigger -->
        <div
          @click="fileInputRef?.click()"
          style="border: 2px dashed #cbd5e1; border-radius: var(--radius-sm); padding: 18px; text-align: center; cursor: pointer; background: #f8fafc; margin-bottom: 16px;"
        >
          <input
            type="file"
            ref="fileInputRef"
            @change="handleFileChange"
            accept=".json"
            style="display: none;"
          />
          <FileJson :size="28" color="#64748b" style="margin: 0 auto 6px;" />
          <p style="font-size: 13px; font-weight: 700; color: #334155;">
            {{ fileName ? fileName : 'Pilih / Seret File JSON Backup di Sini' }}
          </p>
          <p style="font-size: 11px; color: #94a3b8;">Mendukung format JSON Firebase & MySQL</p>
        </div>

        <!-- Preview Box -->
        <div v-if="previewBackup" style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: var(--radius-sm); padding: 14px; margin-bottom: 16px; font-size: 12px;">
          <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 8px;">Ringkasan Isi File Cadangan:</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; color: #1e40af;">
            <div>• Muzakki: {{ previewSummary.muzakki }}</div>
            <div>• Mustahik: {{ previewSummary.mustahik }}</div>
            <div>• Program: {{ previewSummary.programs }}</div>
            <div>• Transaksi: {{ previewSummary.transactions }}</div>
          </div>

          <div class="divider" style="margin: 10px 0;"></div>

          <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 6px;">Pilih Mode Pemulihan:</div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
              <input type="radio" value="merge" v-model="restoreMode" />
              <strong>Mode Gabung (Merge)</strong> — Menambah & memperbarui data tanpa menghapus data yang ada.
            </label>
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; color: #dc2626;">
              <input type="radio" value="overwrite" v-model="restoreMode" />
              <strong>Mode Menimpa (Overwrite)</strong> — Bersihkan data lama lalu masukkan seluruh data backup.
            </label>
          </div>
        </div>

        <button
          class="btn btn-blue"
          style="width: 100%; justify-content: center;"
          :disabled="!previewBackup || isRestoring"
          @click="handleExecuteRestore"
        >
          <UploadCloud :size="14" />
          {{ isRestoring ? 'Memproses Pemulihan Database...' : 'Proses Restore Database Sekarang' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import api from '../lib/api';
import { Download, UploadCloud, CheckCircle2, AlertTriangle, FileJson } from '@lucide/vue';

const loading = ref(false);
const isRestoring = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);
const fileName = ref('');
const previewBackup = ref<any | null>(null);
const restoreMode = ref<'merge' | 'overwrite'>('merge');
const notification = ref<{ type: 'success' | 'error'; message: string } | null>(null);

const previewSummary = computed(() => {
  if (!previewBackup.value) return { muzakki: 0, mustahik: 0, programs: 0, transactions: 0 };
  const d = previewBackup.value.data || previewBackup.value;
  return {
    muzakki: d.muzakki?.length || 0,
    mustahik: d.mustahik?.length || 0,
    programs: d.programs?.length || 0,
    transactions: d.transactions?.length || 0,
  };
});

const handleBackup = async () => {
  loading.value = true;
  notification.value = null;
  try {
    const res = await api.get('/backup');
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SIMZAKAT_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notification.value = { type: 'success', message: 'Backup database berhasil diunduh!' };
  } catch (err: any) {
    notification.value = { type: 'error', message: err.response?.data?.message || 'Gagal membuat backup.' };
  } finally {
    loading.value = false;
  }
};

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  fileName.value = file.name;
  notification.value = null;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const content = event.target?.result as string;
      const parsed = JSON.parse(content);

      if (!parsed) throw new Error('File JSON kosong');

      // Check if wrapped in data or directly array
      const rawData = parsed.data || parsed;
      previewBackup.value = { data: rawData };
    } catch (err: any) {
      previewBackup.value = null;
      notification.value = { type: 'error', message: `Gagal membaca file: ${err.message}` };
    }
  };
  reader.readAsText(file);
};

const handleExecuteRestore = async () => {
  if (!previewBackup.value) return;

  if (restoreMode.value === 'overwrite' && !confirm('PERINGATAN: Mode Overwrite akan membersihkan database saat ini dan menggantinya dengan isi file backup. Lanjutkan?')) {
    return;
  }

  isRestoring.value = true;
  notification.value = null;
  try {
    const res = await api.post('/restore', {
      data: previewBackup.value.data,
      mode: restoreMode.value,
    });

    notification.value = {
      type: 'success',
      message: res.data?.message || 'Restore database berhasil diselesaikan!',
    };

    previewBackup.value = null;
    fileName.value = '';
    if (fileInputRef.value) fileInputRef.value.value = '';
  } catch (err: any) {
    notification.value = {
      type: 'error',
      message: err.response?.data?.message || 'Gagal memulihkan database.',
    };
  } finally {
    isRestoring.value = false;
  }
};
</script>
