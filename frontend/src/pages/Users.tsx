import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Users as UsersIcon, PlusCircle, Edit2, Trash2, X, Shield, Key } from 'lucide-react';

export default function Users() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Operator',
    nip: '',
    unit_kerja: '',
    active: true,
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setData(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditItem(item);
      setFormData({
        name: item.name || '',
        email: item.email || '',
        password: '',
        role: item.role || 'Operator',
        nip: item.nip || '',
        unit_kerja: item.unit_kerja || '',
        active: item.active ?? true,
      });
    } else {
      setEditItem(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'Operator',
        nip: '',
        unit_kerja: '',
        active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api.put(`/users/${editItem.id}`, formData);
      } else {
        await api.post('/users', formData);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan user.');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Hapus pengguna "${name}"?`)) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus user.');
    }
  };

  const ROLE_COLORS: Record<string, string> = {
    Admin: 'badge-red',
    Operator: 'badge-blue',
    Pimpinan: 'badge-orange',
    Auditor: 'badge-purple',
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h3>Manajemen Pengguna & Hak Akses</h3>
          <p>Kelola akun pengguna, peran otorisasi, dan status keaktifan akun SIMZAKAT</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <PlusCircle size={14} /> + Tambah Pengguna Baru
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>NAMA LENGKAP</th>
                <th>EMAIL</th>
                <th>HAK AKSES (ROLE)</th>
                <th>SATUAN KERJA / NIP</th>
                <th>STATUS</th>
                <th className="text-center">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {loading && data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center" style={{ padding: '30px' }}>
                    <span className="loading-spinner" style={{ width: 18, height: 18, marginRight: 8 }} />
                    Memuat pengguna...
                  </td>
                </tr>
              ) : (
                data.map(item => (
                  <tr key={item.id}>
                    <td><strong>{item.name}</strong></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{item.email}</td>
                    <td>
                      <span className={`badge ${ROLE_COLORS[item.role] || 'badge-gray'}`}>
                        {item.role}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px' }}>{item.unit_kerja || '-'}</div>
                      {item.nip && <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>NIP: {item.nip}</div>}
                    </td>
                    <td>
                      <span className={`badge ${item.active ? 'badge-green' : 'badge-red'}`}>
                        {item.active ? 'Aktif' : 'Non-Aktif'}
                      </span>
                    </td>
                    <td className="text-center">
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                        <button className="btn btn-secondary btn-xs" onClick={() => handleOpenModal(item)}>
                          <Edit2 size={12} />
                        </button>
                        <button className="btn btn-red btn-xs" onClick={() => handleDelete(item.id, item.name)}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editItem ? 'Edit Pengguna' : '+ Tambah Pengguna Baru'}</h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Nama Lengkap<span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Pengguna<span className="required">*</span></label>
                    <input
                      type="email"
                      className="form-input"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">
                      {editItem ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password Awal'}<span className="required">*</span>
                    </label>
                    <input
                      type="password"
                      className="form-input"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      required={!editItem}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Peran / Hak Akses (Role)<span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="Operator">Operator (Entri Transaksi)</option>
                      <option value="Admin">Admin (Verifikasi & Kelola Data)</option>
                      <option value="Pimpinan">Pimpinan / Kepala (Approval)</option>
                      <option value="Auditor">Auditor (Melihat Laporan & Audit)</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Unit Kerja / Satuan Kerja</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.unit_kerja}
                      onChange={e => setFormData({ ...formData, unit_kerja: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">NIP</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.nip}
                      onChange={e => setFormData({ ...formData, nip: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="userActive"
                    checked={formData.active}
                    onChange={e => setFormData({ ...formData, active: e.target.checked })}
                  />
                  <label htmlFor="userActive" style={{ fontSize: '13px', cursor: 'pointer' }}>
                    Akun Aktif (Dapat Login ke Sistem)
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
