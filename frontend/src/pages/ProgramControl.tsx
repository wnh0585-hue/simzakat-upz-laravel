import React, { useState, useEffect } from 'react';
import api, { formatRp, FUND_LABELS } from '../lib/api';
import { Target, CheckCircle2, AlertCircle, Clock, TrendingUp } from 'lucide-react';

export default function ProgramControl() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get('/programs')
      .then(res => setPrograms(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalTarget = programs.reduce((sum, p) => sum + (Number(p.target_amount) || 0), 0);
  const totalRealisasi = programs.reduce((sum, p) => sum + (Number(p.realisasi) || 0), 0);
  const overallPct = totalTarget > 0 ? Math.min(100, Math.round((totalRealisasi / totalTarget) * 100)) : 0;

  return (
    <div>
      <div className="section-header">
        <div>
          <h3>Kontrol & Monitor Program Penyaluran</h3>
          <p>Pemantauan serapan anggaran ZIS real-time terhadap target tahun buku</p>
        </div>
      </div>

      {/* Summary KPI */}
      <div className="stat-cards" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(78,135,255,0.15)', color: '#4e87ff' }}>
            <Target size={20} />
          </div>
          <div>
            <div className="stat-label">TOTAL ANGGARAN TARGET</div>
            <div className="stat-value" style={{ color: '#4e87ff' }}>{formatRp(totalTarget)}</div>
            <div className="stat-sub">{programs.length} Program Kerja</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(0,196,140,0.15)', color: '#00c48c' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <div className="stat-label">TOTAL TERSALURKAN</div>
            <div className="stat-value" style={{ color: '#00c48c' }}>{formatRp(totalRealisasi)}</div>
            <div className="stat-sub">Realisasi Berjalan</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
            <Clock size={20} />
          </div>
          <div>
            <div className="stat-label">RATA-RATA SERAPAN</div>
            <div className="stat-value" style={{ color: '#f59e0b' }}>{overallPct}%</div>
            <div className="stat-sub">Sisa Anggaran: {formatRp(Math.max(0, totalTarget - totalRealisasi))}</div>
          </div>
        </div>
      </div>

      {/* Progress Cards Grid */}
      <div className="page-grid-2">
        {loading && programs.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
            <span className="loading-spinner" style={{ width: 24, height: 24, marginBottom: 8 }} />
            <p>Memuat monitoring program...</p>
          </div>
        ) : programs.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Belum ada program untuk dimonitor.
          </div>
        ) : (
          programs.map(p => {
            const target = Number(p.target_amount) || 0;
            const real = Number(p.realisasi) || 0;
            const pct = target > 0 ? Math.min(100, Math.round((real / target) * 100)) : 0;
            const isDone = pct >= 100;
            return (
              <div key={p.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>{p.name}</h4>
                    <span className="badge badge-purple" style={{ fontSize: '10px' }}>{p.bidang || 'Penyaluran'}</span>
                    <span className="badge badge-green" style={{ fontSize: '10px', marginLeft: '6px' }}>{FUND_LABELS[p.fund_type] || p.fund_type}</span>
                  </div>
                  <span className={`badge ${isDone ? 'badge-green' : pct > 50 ? 'badge-blue' : 'badge-orange'}`} style={{ fontSize: '12px', fontWeight: 700 }}>
                    {pct}%
                  </span>
                </div>

                <div className="progress-bar" style={{ height: '8px', marginBottom: '14px' }}>
                  <div
                    className={`progress-fill ${isDone ? 'progress-green' : pct > 50 ? 'progress-blue' : 'progress-orange'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Target:</div>
                    <div style={{ fontWeight: 600 }}>{formatRp(target)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--text-muted)' }}>Tersalurkan:</div>
                    <div style={{ fontWeight: 700, color: 'var(--accent-green)' }}>{formatRp(real)}</div>
                  </div>
                </div>

                {p.pic && (
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '8px' }}>
                    PIC: <strong style={{ color: 'var(--text-secondary)' }}>{p.pic}</strong> • Periode: {p.waktu_kegiatan || 'Tahunan'}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
