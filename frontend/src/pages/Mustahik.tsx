import React, { useState, useEffect } from 'react';
import api, { ASNAF_LABELS } from '../lib/api';
import { PlusCircle, Search, Edit2, Trash2, X, HeartHandshake } from 'lucide-react';

export default function Mustahik() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [asnafFilter, setAsnafFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    nik: '',
    name: '',
    phone: '',
    address: '',
    asnaf: 'fakir',
    type: 'individu',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (asnafFilter) params.append('asnaf', asnafFilter);
      if (typeFilter) params.append('type', typeFilter);

      const res = await api.get(`/mustahik?${params.toString()}`);
      setData(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, asnafFilter, typeFilter]);

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditItem(item);
      setFormData({
        nik: item.nik || '',
        name: item.name || '',
        phone: item.phone || '',
        address: item.address || '',
        asnaf: item.asnaf || 'fakir',
        type: item.type || 'individu',
      });
    } else {
      setEditItem(null);
      setFormData({
        nik: '',
        name: '',
        phone: '',
        address: '',
        asnaf: 'fakir',
        type: 'individu',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api.put(`/mustahik/${editItem.id}`, formData);
      } else {
        await api.post('/mustahik', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan data Mustahik.');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Hapus data Mustahik "${name}"?`)) return;
    try {
      await api.delete(`/mustahik/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus data.');
    }
  };

  const ASNAF_COLORS: Record<string, string> = {
    fakir: 'badge-red',
    miskin: 'badge-orange',
    amil: 'badge-purple',
    muallaf: 'badge-blue',
    riqab: 'badge-gray',
    gharim: 'badge-orange',
    fisabilillah: 'badge-green',
    ibnu_sabil: 'badge-blue',
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h3>Data Mustahik (Penerima Manfaat)</h3>
          <p>Daftar individu atau lembaga penerima manfaat 8 Asnaf ZIS</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <PlusCircle size={14} /> + Tambah Mustahik
        </button>
      </div>

      <div className="card card-sm" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', alignItems: 'end' }}>
          <div>
            <label className="form-label" style={{ fontSize: '11px' }}>Pencarian Mustahik</label>
            <div className="search-input-wrap">
              <Search size={14} />
              <input
                type="text"
                className="form-input search-input"
                placeholder="Cari nama, NIK, alamat..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '11px' }}>Golongan 8 Asnaf</label>
            <select className="form-select" value={asnafFilter} onChange={e => setAsnafFilter(e.target.value)}>
              <option value="">Semua Asnaf</option>
              <option value="fakir">Fakir</option>
              <option value="miskin">Miskin</option>
              <option value="amil">Amil</option>
              <option value="muallaf">Muallaf</option>
              <option value="riqab">Riqab</option>
              <option value="gharim">Gharim</option>
              <option value="fisabilillah">Fisabilillah</option>
              <option value="ibnu_sabil">Ibnu Sabil</option>
            </select>
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '11px' }}>Tipe Penerima</label>
            <select className="form-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="">Semua Tipe</option>
              <option value="individu">Individu</option>
              <option value="lembaga">Lembaga / Yayasan</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>NAMA MUSTAHIK</th>
                <th>GOLONGAN ASNAF</th>
                <th>TIPE</th>
                <th>IDENTITAS (NIK)</th>
                <th>KONTAK</th>
                <th>ALAMAT</th>
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
                    Belum ada data Mustahik.
                  </td>
                </tr>
              ) : (
                data.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{item.name}</div>
                    </td>
                    <td>
                      <span className={`badge ${ASNAF_COLORS[item.asnaf] || 'badge-gray'}`}>
                        {ASNAF_LABELS[item.asnaf] || item.asnaf}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>
                        {item.type}
                      </span>
                    </td>
                    <td>{item.nik || '-'}</td>
                    <td>{item.phone || '-'}</td>
                    <td style={{ maxWidth: '200px', fontSize: '12px' }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.address || '-'}
                      </div>
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
              <h3>{editItem ? 'Edit Data Mustahik' : '+ Tambah Data Mustahik Baru'}</h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Nama Lengkap / Lembaga<span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Golongan 8 Asnaf<span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={formData.asnaf}
                      onChange={e => setFormData({ ...formData, asnaf: e.target.value })}
                    >
                      <option value="fakir">Fakir</option>
                      <option value="miskin">Miskin</option>
                      <option value="amil">Amil</option>
                      <option value="muallaf">Muallaf</option>
                      <option value="riqab">Riqab</option>
                      <option value="gharim">Gharim</option>
                      <option value="fisabilillah">Fisabilillah</option>
                      <option value="ibnu_sabil">Ibnu Sabil</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Tipe Penerima</label>
                    <select
                      className="form-select"
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="individu">Individu</option>
                      <option value="lembaga">Lembaga / Yayasan / Pondok</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nomor Induk Kependudukan (NIK)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.nik}
                      onChange={e => setFormData({ ...formData, nik: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Nomor Kontak / WhatsApp</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
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
