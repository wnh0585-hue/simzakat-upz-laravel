import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Gauge, Database, Server, HardDrive, CheckCircle2 } from 'lucide-react';

export default function LimitMonitor() {
  const [stats, setStats] = useState({
    muzakkiCount: 0,
    mustahikCount: 0,
    txCount: 0,
    programCount: 0,
    planCount: 0,
    auditCount: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/muzakki?per_page=1'),
      api.get('/mustahik?per_page=1'),
      api.get('/transactions?per_page=1'),
      api.get('/programs'),
      api.get('/collection-plans'),
      api.get('/audit-logs?per_page=1'),
    ]).then(([muz, mus, tx, prog, plan, aud]) => {
      setStats({
        muzakkiCount: muz.data?.total || 0,
        mustahikCount: mus.data?.total || 0,
        txCount: tx.data?.total || 0,
        programCount: (prog.data || []).length,
        planCount: (plan.data || []).length,
        auditCount: aud.data?.total || 0,
      });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="section-header">
        <div>
          <h3>Monitor Kapasitas & Integritas Sistem</h3>
          <p>Status performa server backend Laravel 13, database MySQL, dan integritas kuota</p>
        </div>
      </div>

      {/* KPI Status */}
      <div className="stat-cards" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(0,196,140,0.15)', color: '#00c48c' }}>
            <Server size={20} />
          </div>
          <div>
            <div className="stat-label">STATUS SERVER BACKEND</div>
            <div className="stat-value" style={{ color: '#00c48c' }}>Online (Laravel 13)</div>
            <div className="stat-sub">PHP 8.3.30 • Laragon</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(78,135,255,0.15)', color: '#4e87ff' }}>
            <Database size={20} />
          </div>
          <div>
            <div className="stat-label">DATABASE MYSQL</div>
            <div className="stat-value" style={{ color: '#4e87ff' }}>simzakat_upz</div>
            <div className="stat-sub">Port 3306 • UTF8MB4</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
            <HardDrive size={20} />
          </div>
          <div>
            <div className="stat-label">STORAGE BUKTI FISIK</div>
            <div className="stat-value" style={{ color: '#f59e0b' }}>storage/app/public</div>
            <div className="stat-sub">Symlink Aktif</div>
          </div>
        </div>
      </div>

      {/* Database Record Counts */}
      <div className="card">
        <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Jumlah Record Data Aktif</h4>
        <div className="page-grid-3">
          {[
            { label: 'Total Muzakki Terdaftar', count: stats.muzakkiCount, color: '#4e87ff' },
            { label: 'Total Mustahik (8 Asnaf)', count: stats.mustahikCount, color: '#ec4899' },
            { label: 'Total Transaksi Jurnal', count: stats.txCount, color: '#00c48c' },
            { label: 'Program Penyaluran', count: stats.programCount, color: '#8b5cf6' },
            { label: 'Rencana Target Penghimpunan', count: stats.planCount, color: '#f59e0b' },
            { label: 'Catatan Log Aktivitas User', count: stats.auditCount, color: '#64748b' },
          ].map(s => (
            <div
              key={s.label}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px',
              }}
            >
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{s.label}</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: s.color }}>
                {s.count} Record
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
