import React, { useState, useEffect, useRef } from 'react';
import api, { formatDate } from '../lib/api';
import { PlusCircle, Upload, Search, Edit2, Trash2, X, Users, UserCheck } from 'lucide-react';

export default function Muzakki() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nik: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    type: 'individu',
    nip: '',
    unit_kerja: '',
    golongan: '',
    status: 'Muzakki',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterType) params.append('type', filterType);
      if (filterStatus) params.append('status', filterStatus);

      const res = await api.get(`/muzakki?${params.toString()}`);
      setData(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, filterType, filterStatus]);

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditItem(item);
      setFormData({
        nik: item.nik || '',
        name: item.name || '',
        phone: item.phone || '',
        email: item.email || '',
        address: item.address || '',
        type: item.type || 'individu',
        nip: item.nip || '',
        unit_kerja: item.unit_kerja || '',
        golongan: item.golongan || '',
        status: item.status || 'Muzakki',
      });
    } else {
      setEditItem(null);
      setFormData({
        nik: '',
        name: '',
        phone: '',
        email: '',
        address: '',
        type: 'individu',
        nip: '',
        unit_kerja: '',
        golongan: '',
        status: 'Muzakki',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api.put(`/muzakki/${editItem.id}`, formData);
      } else {
        await api.post('/muzakki', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan data Muzakki.');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Hapus data Muzakki "${name}"?`)) return;
    try {
      await api.delete(`/muzakki/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus data.');
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    try {
      await api.post('/muzakki/import', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Import data Muzakki berhasil!');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal import Excel.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h3>Data Muzakki & Munfiq</h3>
          <p>Database donatur zakat, infak, dan sedekah UPZ Kemenag</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportExcel}
            accept=".xlsx,.xls,.csv"
            style={{ display: 'none' }}
          />
          <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
            <Upload size={14} /> Import Excel
          </button>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <PlusCircle size={14} /> + Tambah Muzakki
          </button>
        </div>
      </div>

      <div className="card card-sm" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', alignItems: 'end' }}>
          <div>
            <label className="form-label" style={{ fontSize: '11px' }}>Pencarian Donatur</label>
            <div className="search-input-wrap">
              <Search size={14} />
              <input
                type="text"
                className="form-input search-input"
                placeholder="Cari nama, NIK, NIP, satker..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '11px' }}>Tipe Donatur</label>
            <select className="form-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="">Semua Tipe</option>
              <option value="individu">Individu / Pegawai</option>
              <option value="badan_usaha">Badan Usaha / Lembaga</option>
            </select>
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '11px' }}>Klasifikasi Status</label>
            <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">Semua Status</option>
              <option value="Muzakki">Muzakki (Wajib Zakat)</option>
              <option value="Munfiq">Munfiq (Infak/Sedekah)</option>
              <option value="Keduanya">Keduanya</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>NAMA DONATUR</th>
                <th>IDENTITAS (NIK / NIP)</th>
                <th>UNIT KERJA / SATKER</th>
                <th>GOLONGAN</th>
                <th>STATUS</th>
                <th>KONTAK</th>
                <th className="text-center">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {loading && data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center" style={{ padding: '30px' }}>
                    <span className="loading-spinner" style={{ width: 18, height: 18, marginRight: 8 }} />
                    Memuat data...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center" style={{ padding: '40px', color: 'var(--text-muted)' }}>
                    Belum ada data Muzakki yang tersimpan.
                  </td>
                </tr>
              ) : (
                data.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{item.name}</div>
                      <span className="badge badge-gray" style={{ fontSize: '9px' }}>{item.type}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px' }}>{item.nik || '-'}</div>
                      {item.nip && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>NIP: {item.nip}</div>}
                    </td>
                    <td>{item.unit_kerja || '-'}</td>
                    <td>{item.golongan ? <span className="badge badge-blue">{item.golongan}</span> : '-'}</td>
                    <td>
                      <span className={`badge ${item.status === 'Muzakki' ? 'badge-green' : item.status === 'Munfiq' ? 'badge-blue' : 'badge-purple'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px' }}>{item.phone || '-'}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{item.email || '-'}</div>
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
              <h3>{editItem ? 'Edit Data Muzakki' : '+ Tambah Data Muzakki Baru'}</h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Nama Lengkap / Instansi<span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tipe Donatur</label>
                    <select
                      className="form-select"
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="individu">Individu / Pegawai</option>
                      <option value="badan_usaha">Badan Usaha / Lembaga</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">NIK (Nomor Induk Kependudukan)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.nik}
                      onChange={e => setFormData({ ...formData, nik: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">NIP (Pegawai Kemenag)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.nip}
                      onChange={e => setFormData({ ...formData, nip: e.target.value })}
                    />
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
                      placeholder="Contoh: Kankemenag Kab. Kebumen"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Golongan Pangkat</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.golongan}
                      onChange={e => setFormData({ ...formData, golongan: e.target.value })}
                      placeholder="Contoh: IV/a"
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Status Donatur</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Muzakki">Muzakki (Wajib Zakat)</option>
                      <option value="Munfiq">Munfiq (Infak/Sedekah)</option>
                      <option value="Keduanya">Keduanya</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nomor Telepon / WhatsApp</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Alamat Lengkap</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                  />
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
