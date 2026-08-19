import React, { useState, useEffect } from 'react';
import api, { formatDate } from '../lib/api';
import { History, Search, Trash2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuditLog() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionFilter, setActionFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (actionFilter) params.append('action', actionFilter);
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);

      const res = await api.get(`/audit-logs?${params.toString()}`);
      setLogs(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, dateFrom, dateTo]);

  const handleClearLogs = async () => {
    if (!confirm('Peringatan: Bersihkan seluruh catatan log aktivitas user? Tindakan ini tidak dapat dibatalkan.')) return;
    try {
      await api.delete('/audit-logs');
      fetchLogs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal membersihkan log.');
    }
  };

  const ACTION_BADGE: Record<string, string> = {
    CREATE: 'badge-green',
    UPDATE: 'badge-blue',
    DELETE: 'badge-red',
    STATUS_CHANGE: 'badge-orange',
    LOGIN: 'badge-purple',
    LOGOUT: 'badge-gray',
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h3>Log Aktivitas User (Audit Trail)</h3>
          <p>Rekam jejak seluruh aktivitas perubahan data, login, dan persetujuan transaksi</p>
        </div>
        {user?.role === 'Admin' && (
          <button className="btn btn-red btn-sm" onClick={handleClearLogs}>
            <Trash2 size={13} /> Bersihkan Log
          </button>
        )}
      </div>

      <div className="card card-sm" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'end' }}>
          <div>
            <label className="form-label" style={{ fontSize: '11px' }}>Filter Jenis Aksi</label>
            <select className="form-select" value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
              <option value="">Semua Aksi</option>
              <option value="CREATE">CREATE (Tambah Data)</option>
              <option value="UPDATE">UPDATE (Ubah Data)</option>
              <option value="DELETE">DELETE (Hapus Data)</option>
              <option value="STATUS_CHANGE">STATUS_CHANGE (Persetujuan)</option>
              <option value="LOGIN">LOGIN (Masuk Sistem)</option>
            </select>
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '11px' }}>Dari Tanggal</label>
            <input type="date" className="form-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '11px' }}>Sampai Tanggal</label>
            <input type="date" className="form-input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
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
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center" style={{ padding: '30px' }}>
                    <span className="loading-spinner" style={{ width: 18, height: 18, marginRight: 8 }} />
                    Memuat audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center" style={{ padding: '40px', color: 'var(--text-muted)' }}>
                    Belum ada log aktivitas yang tercatat.
                  </td>
                </tr>
              ) : (
                logs.map(item => (
                  <tr key={item.id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {formatDate(item.created_at, true)}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '12px' }}>{item.user?.name || item.user_email || 'System'}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{item.user_email}</div>
                    </td>
                    <td>
                      <span className="badge badge-gray" style={{ fontSize: '10px' }}>
                        {item.user_role || 'User'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${ACTION_BADGE[item.action] || 'badge-blue'}`} style={{ fontSize: '10px' }}>
                        {item.action}
                      </span>
                    </td>
                    <td><strong style={{ fontSize: '12px' }}>{item.entity}</strong></td>
                    <td style={{ fontSize: '12px', maxWidth: '300px' }}>{item.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
