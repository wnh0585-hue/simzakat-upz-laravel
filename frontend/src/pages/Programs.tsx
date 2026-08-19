import React, { useState, useEffect } from 'react';
import api, { formatRp, FUND_LABELS } from '../lib/api';
import { PlusCircle, Folder, Edit2, Trash2, X, Target, User, Calendar } from 'lucide-react';

export default function Programs() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    fund_type: 'zakat',
    target_amount: '',
    description: '',
    bidang: 'Pendidikan',
    pic: '',
    waktu_kegiatan: 'Tahunan',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/programs');
      setData(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditItem(item);
      setFormData({
        name: item.name || '',
        fund_type: item.fund_type || 'zakat',
        target_amount: item.target_amount?.toString() || '',
        description: item.description || '',
        bidang: item.bidang || 'Pendidikan',
        pic: item.pic || '',
        waktu_kegiatan: item.waktu_kegiatan || 'Tahunan',
      });
    } else {
      setEditItem(null);
      setFormData({
        name: '',
        fund_type: 'zakat',
        target_amount: '',
        description: '',
        bidang: 'Pendidikan',
        pic: '',
        waktu_kegiatan: 'Tahunan',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData, target_amount: Number(formData.target_amount) };
      if (editItem) {
        await api.put(`/programs/${editItem.id}`, payload);
      } else {
        await api.post('/programs', payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan program.');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Hapus program "${name}"?`)) return;
    try {
      await api.delete(`/programs/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus program.');
    }
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h3>Program Penyaluran ZIS</h3>
          <p>Daftar alokasi program kerja penyaluran UPZ Kemenag</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <PlusCircle size={14} /> + Tambah Program
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>NAMA PROGRAM</th>
                <th>BIDANG</th>
                <th>SUMBER DANA</th>
                <th>PIC / WAKTU</th>
                <th className="text-right">TARGET ANGGARAN</th>
                <th className="text-right">REALISASI</th>
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
                    Belum ada program penyaluran yang dibuat.
                  </td>
                </tr>
              ) : (
                data.map(item => {
                  const target = Number(item.target_amount) || 0;
                  const real = Number(item.realisasi) || 0;
                  const pct = target > 0 ? Math.min(100, Math.round((real / target) * 100)) : 0;
                  return (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{item.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.description}</div>
                      </td>
                      <td><span className="badge badge-purple">{item.bidang || '-'}</span></td>
                      <td><span className="badge badge-green">{FUND_LABELS[item.fund_type] || item.fund_type}</span></td>
                      <td>
                        <div style={{ fontSize: '12px' }}>{item.pic || '-'}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{item.waktu_kegiatan || '-'}</div>
                      </td>
                      <td className="text-right font-bold">{formatRp(target)}</td>
                      <td className="text-right">
                        <div style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{formatRp(real)}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{pct}% terserap</div>
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editItem ? 'Edit Program' : '+ Tambah Program Baru'}</h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nama Program Penyaluran<span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Beasiswa Santri & Yatim Dhuafa"
                    required
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Sumber Dana Utama<span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={formData.fund_type}
                      onChange={e => setFormData({ ...formData, fund_type: e.target.value })}
                    >
                      <option value="zakat">Dana Zakat (1101)</option>
                      <option value="infaq_terikat">Dana Infak Terikat (2101)</option>
                      <option value="infaq_tidak_terikat">Dana Infak Tidak Terikat (2102)</option>
                      <option value="amil">Dana Amil (3301)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Target Anggaran (Rp)<span className="required">*</span></label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.target_amount}
                      onChange={e => setFormData({ ...formData, target_amount: e.target.value })}
                      placeholder="Contoh: 50000000"
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-3">
                  <div className="form-group">
                    <label className="form-label">Bidang Program</label>
                    <select
                      className="form-select"
                      value={formData.bidang}
                      onChange={e => setFormData({ ...formData, bidang: e.target.value })}
                    >
                      <option value="Pendidikan">Pendidikan</option>
                      <option value="Kesehatan">Kesehatan</option>
                      <option value="Kemanusiaan">Kemanusiaan</option>
                      <option value="Ekonomi">Ekonomi</option>
                      <option value="Dakwah-Advokasi">Dakwah-Advokasi</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Penanggung Jawab (PIC)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.pic}
                      onChange={e => setFormData({ ...formData, pic: e.target.value })}
                      placeholder="Nama PIC"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Waktu Pelaksanaan</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.waktu_kegiatan}
                      onChange={e => setFormData({ ...formData, waktu_kegiatan: e.target.value })}
                      placeholder="Tahunan / Ramadhan"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Uraian / Sasaran Program</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan Program</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
