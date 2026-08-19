import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

export const formatRp = (amount: number | null | undefined): string => {
  if (!amount && amount !== 0) return 'Rp 0';
  return 'Rp ' + Math.abs(amount).toLocaleString('id-ID');
};

export const formatDate = (date: string | null | undefined, withTime = false): string => {
  if (!date) return '-';
  const d = new Date(date);
  if (withTime) {
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const ASNAF_LABELS: Record<string, string> = {
  fakir: 'Fakir', miskin: 'Miskin', amil: 'Amil', muallaf: 'Muallaf',
  riqab: 'Riqab', gharim: 'Gharim', fisabilillah: 'Fisabilillah', ibnu_sabil: 'Ibnu Sabil',
};

export const FUND_LABELS: Record<string, string> = {
  zakat: 'Zakat', infaq_terikat: 'Infak Terikat',
  infaq_tidak_terikat: 'Infak Tidak Terikat', amil: 'Amil', non_halal: 'Non Halal',
};

export const STATUS_LABELS: Record<string, string> = {
  Draft: 'Draft', Diajukan: 'Diajukan', Terverifikasi: 'Terverifikasi',
  Disetujui: 'Disetujui', Ditolak: 'Ditolak', Tersalurkan: 'Tersalurkan',
};
