<template>
  <div>
    <div class="section-header">
      <div>
        <h3>Kontrol & Monitor Program Penyaluran</h3>
        <p>Pemantauan serapan anggaran ZIS real-time terhadap target tahun buku</p>
      </div>
    </div>

    <!-- KPI Summary -->
    <div class="stat-cards" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 24px;">
      <div class="stat-card">
        <div class="stat-icon" style="background: #eff6ff; color: #2563eb;">
          <Target :size="20" />
        </div>
        <div>
          <div class="stat-label">TOTAL ANGGARAN TARGET</div>
          <div class="stat-value" style="color: #2563eb;">{{ formatRp(totalTarget) }}</div>
          <div class="stat-sub">{{ programs.length }} Program Kerja</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #ecfdf5; color: #059669;">
          <TrendingUp :size="20" />
        </div>
        <div>
          <div class="stat-label">TOTAL TERSALURKAN</div>
          <div class="stat-value" style="color: #059669;">{{ formatRp(totalRealisasi) }}</div>
          <div class="stat-sub">Realisasi Berjalan</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #fffbeb; color: #d97706;">
          <Clock :size="20" />
        </div>
        <div>
          <div class="stat-label">RATA-RATA SERAPAN</div>
          <div class="stat-value" style="color: #d97706;">{{ overallPct }}%</div>
          <div class="stat-sub">Sisa: {{ formatRp(Math.max(0, totalTarget - totalRealisasi)) }}</div>
        </div>
      </div>
    </div>

    <!-- Cards Grid -->
    <div class="page-grid-2">
      <div v-if="loading && !programs.length" class="card" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
        <span class="loading-spinner" style="width: 24px; height: 24px; margin-bottom: 8px;"></span>
        <p>Memuat kontrol program...</p>
      </div>
      <div v-else-if="!programs.length" class="card" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #64748b;">
        Belum ada program kerja untuk dimonitor.
      </div>
      <div v-for="p in programs" :key="p.id" class="card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <div>
            <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 4px;">{{ p.name }}</h4>
            <span class="badge badge-purple" style="font-size: 10px;">{{ p.bidang || 'Penyaluran' }}</span>
            <span class="badge badge-green" style="font-size: 10px; margin-left: 6px;">{{ FUND_LABELS[p.fund_type] || p.fund_type }}</span>
          </div>
          <span :class="['badge', getPct(p) >= 100 ? 'badge-green' : getPct(p) > 50 ? 'badge-blue' : 'badge-orange']" style="font-size: 12px; font-weight: 800;">
            {{ getPct(p) }}%
          </span>
        </div>

        <div class="progress-bar" style="height: 8px; margin-bottom: 14px;">
          <div
            :class="['progress-fill', getPct(p) >= 100 ? 'progress-green' : getPct(p) > 50 ? 'progress-blue' : 'progress-orange']"
            :style="{ width: `${getPct(p)}%` }"
          ></div>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px;">
          <div>
            <div style="color: #64748b;">Target Anggaran:</div>
            <div style="font-weight: 700;">{{ formatRp(p.target_amount) }}</div>
          </div>
          <div style="text-align: right;">
            <div style="color: #64748b;">Tersalurkan:</div>
            <div style="font-weight: 800; color: #059669;">{{ formatRp(p.realisasi || 0) }}</div>
          </div>
        </div>

        <div v-if="p.pic" style="font-size: 11px; color: #64748b; border-top: 1px solid var(--border); padding-top: 8px; margin-top: 8px;">
          PIC: <strong style="color: #334155;">{{ p.pic }}</strong> • Periode: {{ p.waktu_kegiatan || 'Tahunan' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api, { formatRp, FUND_LABELS } from '../lib/api';
import { Target, TrendingUp, Clock } from '@lucide/vue';

const programs = ref<any[]>([]);
const loading = ref(false);

const getPct = (p: any) => {
  const t = Number(p.target_amount) || 0;
  const r = Number(p.realisasi) || 0;
  return t > 0 ? Math.min(100, Math.round((r / t) * 100)) : 0;
};

const totalTarget = computed(() => programs.value.reduce((sum, p) => sum + (Number(p.target_amount) || 0), 0));
const totalRealisasi = computed(() => programs.value.reduce((sum, p) => sum + (Number(p.realisasi) || 0), 0));
const overallPct = computed(() => totalTarget.value > 0 ? Math.min(100, Math.round((totalRealisasi.value / totalTarget.value) * 100)) : 0);

onMounted(async () => {
  loading.value = true;
  try {
    const res = await api.get('/programs');
    programs.value = res.data || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
});
</script>
