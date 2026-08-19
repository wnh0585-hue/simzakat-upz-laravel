<template>
  <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f8fafc; padding: 20px;">
    <div style="width: 100%; max-width: 420px;">
      <!-- Logo -->
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: flex; justify-content: center; margin-bottom: 16px;">
          <AppLogo :size="64" />
        </div>
        <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 6px; letter-spacing: -0.5px;">SIMZAKAT UPZ</h1>
        <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
          Sistem Akuntansi Zakat PSAK 109<br />
          <strong style="color: #059669;">UPZ P Kankemenag Kab. Kebumen</strong>
        </p>
      </div>

      <!-- Card -->
      <div class="card" style="padding: 32px; box-shadow: var(--shadow-lg);">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 24px;">
          <Shield :size="18" color="#059669" />
          <h2 style="font-size: 16px; font-weight: 700;">Masuk ke Sistem</h2>
        </div>

        <div v-if="error" style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 10px 14px; color: #dc2626; font-size: 13px; margin-bottom: 16px;">
          {{ error }}
        </div>

        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label class="form-label">Email Pengguna<span class="required">*</span></label>
            <input class="form-input" type="email" v-model="email" placeholder="email@kemenag.go.id" required />
          </div>

          <div class="form-group">
            <label class="form-label">Password<span class="required">*</span></label>
            <div style="position: relative;">
              <input
                class="form-input"
                :type="showPw ? 'text' : 'password'"
                v-model="password"
                placeholder="••••••••"
                required
                style="padding-right: 40px;"
              />
              <button
                type="button"
                @click="showPw = !showPw"
                style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #64748b;"
              >
                <EyeOff v-if="showPw" :size="16" />
                <Eye v-else :size="16" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            class="btn btn-primary"
            style="width: 100%; justify-content: center; padding: 12px; margin-top: 8px;"
            :disabled="loading"
          >
            <span v-if="loading" class="loading-spinner" style="width: 16px; height: 16px;"></span>
            <span v-else style="display: flex; align-items: center; gap: 6px;">
              <LogIn :size="16" /> Masuk ke Aplikasi
            </span>
          </button>
        </form>

        <div style="margin-top: 24px; background: #f8fafc; border: 1px solid var(--border); border-radius: 8px; padding: 12px; font-size: 11px; color: #64748b;">
          <div style="margin-bottom: 6px; font-weight: 700; color: #334155;">Pilih Akun Cepat (Demo):</div>
          <div
            v-for="d in demoAccounts"
            :key="d.role"
            style="cursor: pointer; padding: 4px 0; display: flex; align-items: center; gap: 8px;"
            @click="setDemo(d.email, d.pass)"
          >
            <span class="badge badge-green" style="font-size: 9px;">{{ d.role }}</span>
            <span style="font-family: monospace;">{{ d.email }}</span>
          </div>
        </div>
      </div>

      <p style="text-align: center; font-size: 11px; color: #94a3b8; margin-top: 20px;">
        © 2026 UPZ P Kankemenag Kab. Kebumen • PSAK 109
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import api from '../lib/api';
import AppLogo from '../components/AppLogo.vue';
import { Shield, Eye, EyeOff, LogIn } from '@lucide/vue';

const emit = defineEmits<{
  (e: 'login-success', user: any): void;
}>();

const email = ref('admin@kemenag.go.id');
const password = ref('admin123');
const showPw = ref(false);
const error = ref('');
const loading = ref(false);

const demoAccounts = [
  { role: 'Admin', email: 'admin@kemenag.go.id', pass: 'admin123' },
  { role: 'Operator', email: 'operator@kemenag.go.id', pass: 'operator123' },
  { role: 'Pimpinan', email: 'pimpinan@kemenag.go.id', pass: 'pimpinan123' },
  { role: 'Auditor', email: 'auditor@kemenag.go.id', pass: 'auditor123' },
];

const setDemo = (e: string, p: string) => {
  email.value = e;
  password.value = p;
};

const handleLogin = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await api.post('/login', {
      email: email.value,
      password: password.value,
    });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    emit('login-success', res.data.user);
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Login gagal. Periksa email & password.';
  } finally {
    loading.value = false;
  }
};
</script>
