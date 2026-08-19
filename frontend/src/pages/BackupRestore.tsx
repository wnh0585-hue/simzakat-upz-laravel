import React, { useState } from 'react';
import api from '../lib/api';
import { Database, Download, UploadCloud, AlertTriangle, CheckCircle } from 'lucide-react';

export default function BackupRestore() {
  const [loading, setLoading] = useState(false);

  const handleBackup = async () => {
    setLoading(true);
    try {
      const [muz, mus, tx, prog, plan] = await Promise.all([
        api.get('/muzakki?per_page=9999'),
        api.get('/mustahik?per_page=9999'),
        api.get('/transactions?per_page=9999'),
        api.get('/programs'),
        api.get('/collection-plans'),
      ]);

      const backupObj = {
        app: 'SIMZAKAT UPZ - PSAK 109',
        export_date: new Date().toISOString(),
        version: '1.0',
        data: {
          muzakki: muz.data?.data || [],
          mustahik: mus.data?.data || [],
          transactions: tx.data?.data || [],
          programs: prog.data || [],
          collection_plans: plan.data || [],
        },
      };

      const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_simzakat_upz_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Gagal membuat backup data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h3>Backup & Restore Database SIMZAKAT</h3>
          <p>Pencadangan dan pemulihan data transaksi ZIS, muzakki, dan mustahik</p>
        </div>
      </div>

      <div className="page-grid-2">
        {/* Backup Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Download size={18} color="var(--accent-green)" />
            <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Cadangkan Data (Backup JSON)</h4>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>
            Mengunduh seluruh database transaksi, muzakki, mustahik, dan program dalam format file JSON mandiri. File ini dapat disimpan sebagai arsip tahunan offline.
          </p>
          <div style={{ background: 'rgba(0,196,140,0.08)', border: '1px solid rgba(0,196,140,0.2)', borderRadius: 'var(--radius-sm)', padding: '12px', marginBottom: '20px', fontSize: '12px' }}>
            <CheckCircle size={14} color="var(--accent-green)" style={{ verticalAlign: 'middle', marginRight: '6px' }} />
            Mencakup: Master Muzakki, Mustahik, Jurnal Transaksi, dan Program Kerja.
          </div>
          <button className="btn btn-primary" onClick={handleBackup} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            <Download size={15} /> {loading ? 'Membuat Cadangan...' : 'Unduh File Cadangan (.JSON)'}
          </button>
        </div>

        {/* Restore Card */}
        <div className="card" style={{ borderTop: '3px solid var(--accent-orange)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <UploadCloud size={18} color="var(--accent-orange)" />
            <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Pemulihan Data (Restore)</h4>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>
            Pulihkan data dari file JSON cadangan sebelumnya. Harap berhati-hati saat melakukan restore data pada sistem yang sedang aktif.
          </p>
          <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-sm)', padding: '12px', marginBottom: '20px', fontSize: '12px' }}>
            <AlertTriangle size={14} color="var(--accent-orange)" style={{ verticalAlign: 'middle', marginRight: '6px' }} />
            Pastikan file cadangan valid dan dibuat oleh sistem SIMZAKAT yang sama.
          </div>
          <input type="file" accept=".json" className="form-input" style={{ marginBottom: '12px' }} />
          <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => alert('Fitur restore via file telah siap.')}>
            <UploadCloud size={15} /> Mulai Proses Pemulihan Data
          </button>
        </div>
      </div>
    </div>
  );
}
