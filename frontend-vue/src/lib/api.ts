import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    // If mutating request, clear GET cache
    if (['post', 'put', 'patch', 'delete'].includes(res.config.method?.toLowerCase() || '')) {
      clearApiCache();
    }
    return res;
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Memory Cache for 0ms Instant Navigation (Stale-While-Revalidate)
const memoryCache = new Map<string, { data: any; timestamp: number }>();

export const clearApiCache = (prefix?: string) => {
  if (prefix) {
    for (const key of memoryCache.keys()) {
      if (key.startsWith(prefix)) memoryCache.delete(key);
    }
  } else {
    memoryCache.clear();
  }
};

export const cachedGet = async (url: string, ttlMs = 30000) => {
  const cached = memoryCache.get(url);
  const now = Date.now();

  // If cache exists and valid
  if (cached && (now - cached.timestamp) < ttlMs) {
    return { data: cached.data, isCached: true };
  }

  // Otherwise fetch from network
  const res = await api.get(url);
  memoryCache.set(url, { data: res.data, timestamp: now });
  return { data: res.data, isCached: false };
};

export default api;

export const formatRp = (amount: number | null | undefined): string => {
  if (!amount && amount !== 0) return 'Rp 0';
  return 'Rp ' + Math.abs(Number(amount)).toLocaleString('id-ID');
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
  fakir: 'Fakir',
  miskin: 'Miskin',
  amil: 'Amil',
  muallaf: 'Muallaf',
  riqab: 'Riqab',
  gharim: 'Gharim',
  fisabilillah: 'Fisabilillah',
  ibnu_sabil: 'Ibnu Sabil',
};

export const FUND_LABELS: Record<string, string> = {
  zakat: 'Dana Zakat (1101)',
  infaq_terikat: 'Dana Infak Terikat (2101)',
  infaq_tidak_terikat: 'Dana Infak Tidak Terikat (2102)',
  amil: 'Dana Amil (3301)',
  non_halal: 'Dana Non-Halal (3401)',
};
