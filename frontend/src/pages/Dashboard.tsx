import React, { useEffect, useState } from 'react';
import api, { formatRp, formatDate } from '../lib/api';
import {
  ArrowDownLeft, ArrowUpRight, TrendingDown, Users, UserCheck,
  Folder, TrendingUp, Clock, CheckCircle, AlertTriangle, Eye
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const FUND_COLORS: Record<string, string> = {
  zakat: '#00c48c', infaq_terikat: '#4e87ff',
  infaq_tidak_terikat: '#8b5cf6', amil: '#f59e0b', non_halal: '#6b7280',
};

const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];

interface DashData {
  fund_balances: Record<string, number>;
  total_penerimaan: number; total_penyaluran: number; saldo_bersih: number;
  monthly_income: Array<{month:number;fund_type:string;total:number}>;
  monthly_distribution: Array<{month:number;total:number}>;
  asnaf_distribution: Array<{asnaf:string;total:number}>;
  pending_count: number; muzakki_count: number; mustahik_count: number; program_count: number;
  recent_transactions: any[];
}

const ASNAF_LABELS: Record<string,string> = {
  fakir:'Fakir', miskin:'Miskin', amil:'Amil', muallaf:'Muallaf',
  riqab:'Riqab', gharim:'Gharim', fisabilillah:'Fisabilillah', ibnu_sabil:'Ibnu Sabil',
};

export default function Dashboard({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-overlay">
      <span className="loading-spinner" style={{ width: 32, height: 32 }} />
      <span>Memuat data dashboard...</span>
    </div>
  );

  if (!data) return <div className="empty-state"><p>Gagal memuat data.</p></div>;

  // Build monthly chart data
  const monthlyChartData = MONTHS.map((m, i) => {
    const month = i + 1;
    const incItems = data.monthly_income.filter(x => x.month === month);
    const totalIn = incItems.reduce((s, x) => s + Number(x.total), 0);
    const distItem = data.monthly_distribution.find(x => x.month === month);
    return { name: m, penerimaan: totalIn, penyaluran: Number(distItem?.total || 0) };
  });

  const asnafChartData = data.asnaf_distribution.map(x => ({
    name: ASNAF_LABELS[x.asnaf] || x.asnaf,
    value: Number(x.total),
  }));

  const ASNAF_COLORS = ['#ef4444','#f97316','#f59e0b','#84cc16','#14b8a6','#4e87ff','#8b5cf6','#ec4899'];

  const fundCards = [
    { key: 'zakat', label: 'Dana Zakat', num: '1101', sub1: 'Zakat Bersih', sub2: '87.5% Alokasi', color: '#00c48c', cls: 'fund-card-zakat', tag: null },
    { key: 'infaq_terikat', label: 'Dana Infak / Sedekah', num: '2101', sub1: 'Bebas & Terikat', sub2: 'Tersalurkan', color: '#4e87ff', cls: 'fund-card-infaq', tag: null },
    { key: 'amil', label: 'Dana Amil (Operasional)', num: '3301', sub1: 'Biaya Amil', sub2: 'Maks 12.5% Zakat', color: '#f59e0b', cls: 'fund-card-amil', tag: 'AMIL' },
    { key: 'non_halal', label: 'Dana Non-Halal', num: '3401', sub1: 'Masalah Umum', sub2: 'Bunga Giro, dll', color: '#6b7280', cls: 'fund-card-nonhalal', tag: null },
  ];

  return (
    <div>
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-badges">
          <span className="badge badge-green">✓ Akuntansi Syariah PSAK 109</span>
          <span className="badge badge-blue">UPZ Kemenag Kebumen</span>
        </div>
        <h1 className="hero-title">SIMZAKAT UPZ Kemenag Kebumen</h1>
        <p className="hero-subtitle">
          Sistem akuntansi terintegrasi pengumpulan, pendistribusian 8 asnaf, pengelolaan hak amil 12.5%, program
          penyaluran, dan verifikasi berjenjang <span style={{ color: 'var(--accent-green)' }}>secara real-time</span>.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => onNavigate('penerimaan')}>
            <ArrowDownLeft size={14} /> + Entri Penerimaan ZIS
          </button>
          <button className="btn btn-secondary" onClick={() => onNavigate('penyaluran')}>
            <ArrowUpRight size={14} /> + Entri Penyaluran Dana
          </button>
          <button className="btn btn-ghost" onClick={() => onNavigate('jurnal-umum')}>
            <Eye size={14} /> Laporan Jurnal Umum
          </button>
        </div>
      </div>

      {/* Fund Cards */}
      <div className="fund-cards-grid">
        {fundCards.map(fc => (
          <div key={fc.key} className={`fund-card ${fc.cls}`}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="fund-label">{fc.label}</span>
              <span style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)', fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px' }}>{fc.num}</span>
            </div>
            <div className="fund-amount" style={{ color: fc.color }}>{formatRp(data.fund_balances[fc.key])}</div>
            <div className="fund-sub">{fc.sub1} <span className="fund-tag" style={{ background: `${fc.color}20`, color: fc.color }}>{fc.sub2}</span></div>
          </div>
        ))}
      </div>

      {/* Stat Cards */}
      <div className="stat-cards" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {[
          { label: 'MUZAKKI', value: `${data.muzakki_count} Donatur`, icon: <Users size={18} />, color: '#4e87ff', bg: 'rgba(78,135,255,0.15)', onClick: () => onNavigate('muzakki') },
          { label: 'MUSTAHIK', value: `${data.mustahik_count} Penerima`, icon: <UserCheck size={18} />, color: '#ec4899', bg: 'rgba(236,72,153,0.15)', onClick: () => onNavigate('mustahik') },
          { label: 'TOTAL KAS MASUK', value: formatRp(data.total_penerimaan), icon: <TrendingUp size={18} />, color: '#00c48c', bg: 'rgba(0,196,140,0.15)', onClick: () => onNavigate('penerimaan') },
          { label: 'TOTAL PENGELUARAN', value: formatRp(data.total_penyaluran), icon: <TrendingDown size={18} />, color: '#ef4444', bg: 'rgba(239,68,68,0.15)', onClick: () => onNavigate('penyaluran') },
          { label: 'TOTAL SALDO NET UPZ', value: formatRp(data.saldo_bersih), icon: <CheckCircle size={18} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', onClick: () => onNavigate('posisi-keuangan') },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ cursor: 'pointer' }} onClick={s.onClick}>
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ fontSize: '13px', color: s.color }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="page-grid-2" style={{ marginBottom: '20px' }}>
        {/* Monthly Chart */}
        <div className="card">
          <div className="section-header">
            <div><h3>Grafik Penerimaan & Penyaluran</h3><p>Perbandingan bulanan tahun berjalan</p></div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyChartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="gPenerimaan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00c48c" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00c48c" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gPenyaluran" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4e87ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4e87ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000000 ? `${(v/1000000).toFixed(0)}jt` : v.toString()} />
              <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12, color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} formatter={(v: any) => [formatRp(Number(v || 0)), '']} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#475569', fontWeight: 600 }} />
              <Area type="monotone" dataKey="penerimaan" name="Penerimaan" stroke="#059669" strokeWidth={2} fill="url(#gPenerimaan)" />
              <Area type="monotone" dataKey="penyaluran" name="Penyaluran" stroke="#2563eb" strokeWidth={2} fill="url(#gPenyaluran)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Asnaf Distribution */}
        <div className="card">
          <div className="section-header">
            <div><h3>Visualisasi Alokasi Kas PSAK 109</h3><p>Proporsi saldo dana yang terverifikasi</p></div>
          </div>
          {asnafChartData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={asnafChartData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {asnafChartData.map((_, i) => <Cell key={i} fill={ASNAF_COLORS[i % ASNAF_COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {fundCards.map((fc, i) => (
                  <div key={fc.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: fc.color, display: 'inline-block' }} />
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{fc.label}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: fc.color }}>{formatRp(data.fund_balances[fc.key])}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              Belum ada data penyaluran
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="section-header">
          <div><h3>Kuitansi / Transaksi Terbaru</h3><p>Menampilkan 10 entri kuitansi keuangan terbaru</p></div>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('penerimaan')}>Lihat Laporan Jurnal Lengkap →</button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>TANGGAL & REF</th><th>JENIS TRANSAKSI</th><th>MUZAKKI / MUSTAHIK</th>
                <th>KELOMPOK DANA</th><th>KETERANGAN</th><th>STATUS</th><th className="text-right">NOMINAL</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_transactions.length === 0 ? (
                <tr><td colSpan={7} className="text-center" style={{ padding: '40px', color: 'var(--text-muted)' }}>Belum ada transaksi</td></tr>
              ) : data.recent_transactions.map((tx: any) => (
                <tr key={tx.id}>
                  <td>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{formatDate(tx.date)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tx.reference_number}</div>
                  </td>
                  <td>
                    <span className={`tx-badge ${tx.type === 'penerimaan' ? 'tx-penerimaan' : tx.type === 'penyaluran' ? 'tx-penyaluran' : 'tx-amil'}`}>
                      {tx.type === 'penerimaan' ? 'PENERIMAAN' : tx.type === 'penyaluran' ? 'PENYALURAN' : 'BEBAN AMIL'}
                    </span>
                  </td>
                  <td style={{ fontSize: 13 }}>{tx.party_name}</td>
                  <td>
                    <span className="badge" style={{ background: `${FUND_COLORS[tx.fund_type]}20`, color: FUND_COLORS[tx.fund_type], border: `1px solid ${FUND_COLORS[tx.fund_type]}40`, fontSize: 10 }}>
                      {tx.fund_type?.replace(/_/g,' ').toUpperCase()}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 200 }}><div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.description}</div></td>
                  <td>
                    <span className={`status-badge status-${tx.status?.toLowerCase()}`}>{tx.status}</span>
                  </td>
                  <td className="text-right">
                    <span className={tx.type === 'penerimaan' ? 'amount-positive' : 'amount-negative'}>
                      {tx.type === 'penerimaan' ? '+' : '-'}{formatRp(tx.amount)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Alert */}
      {data.pending_count > 0 && (
        <div style={{ marginTop: 16, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={16} color="var(--accent-orange)" />
          <span style={{ fontSize: 13, color: 'var(--accent-orange)' }}>
            Ada <strong>{data.pending_count} transaksi</strong> menunggu persetujuan.
          </span>
          <button className="btn btn-orange btn-sm" style={{ marginLeft: 'auto' }} onClick={() => onNavigate('penerimaan')}>Proses Sekarang</button>
        </div>
      )}
    </div>
  );
}
