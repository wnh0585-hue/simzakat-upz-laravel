import React, { useState, useEffect } from 'react';
import api, { formatRp } from '../lib/api';
import { PlusCircle, Target, Edit2, Trash2, X, Building, CheckCircle } from 'lucide-react';

export default function CollectionPlans() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'zakat_mal',
    target_amount: '',
    unit_amount: '',
    multiplier: '',
    multiplier_label: 'bulan',
    period: 'Tahun Buku 2026',
    description: '',
    setor_baznas: true,
    baznas_return_percentage: '12.5',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/collection-plans');
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
        category: item.category || 'zakat_mal',
        target_amount: item.target_amount?.toString() || '',
        unit_amount: item.unit_amount?.toString() || '',
        multiplier: item.multiplier?.toString() || '',
        multiplier_label: item.multiplier_label || 'bulan',
        period: item.period || 'Tahun Buku 2026',
        description: item.description || '',
        setor_baznas: item.setor_baznas ?? true,
        baznas_return_percentage: item.baznas_return_percentage?.toString() || '12.5',
      });
    } else {
      setEditItem(null);
      setFormData({
        name: '',
        category: 'zakat_mal',
        target_amount: '',
        unit_amount: '',
        multiplier: '',
        multiplier_label: 'bulan',
        period: 'Tahun Buku 2026',
        description: '',
        setor_baznas: true,
        baznas_return_percentage: '12.5',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        target_amount: Number(formData.target_amount),
        unit_amount: formData.unit_amount ? Number(formData.unit_amount) : null,
        multiplier: formData.multiplier ? Number(formData.multiplier) : null,
        baznas_return_percentage: formData.baznas_return_percentage ? Number(formData.baznas_return_percentage) : null,
      };
      if (editItem) {
        await api.put(`/collection-plans/${editItem.id}`, payload);
      } else {
        await api.post('/collection-plans', payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan rencana penghimpunan.');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Hapus rencana "${name}"?`)) return;
    try {
      await api.delete(`/collection-plans/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus.');
    }
  };

  const CAT_LABELS: Record<string, string> = {
    zakat_mal: 'Zakat Mal / Profesi',
    zakat_fitrah: 'Zakat Fitrah',
    infaq_umum: 'Infak Umum',
    infaq_terikat: 'Infak Terikat',
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h3>Rencana Penghimpunan ZIS</h3>
          <p>Target dan estimasi penerimaan zakat/infak per periode anggaran</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <PlusCircle size={14} /> + Tambah Rencana Target
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>NAMA RENCANA PENGHIMPUNAN</th>
                <th>KATEGORI</th>
                <th>PERIODE</th>
                <th>SETOR BAZNAS</th>
                <th className="text-right">TARGET ANGGARAN</th>
                <th className="text-right">TERHIMPUN</th>
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
                    Belum ada rencana penghimpunan.
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
                      <td><span className="badge badge-blue">{CAT_LABELS[item.category] || item.category}</span></td>
                      <td>{item.period || '-'}</td>
                      <td>
                        {item.setor_baznas ? (
                          <span className="badge badge-green">Setor (Ret: {item.baznas_return_percentage || 12.5}%)</span>
                        ) : (
                          <span className="badge badge-gray">Internal UPZ</span>
                        )}
                      </td>
                      <td className="text-right font-bold">{formatRp(target)}</td>
                      <td className="text-right">
                        <div style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{formatRp(real)}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{pct}% tercapai</div>
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
              <h3>{editItem ? 'Edit Rencana Target' : '+ Tambah Target Penghimpunan'}</h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nama Rencana Target<span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Zakat Gaji ASN Kemenag 2026"
                    required
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Kategori ZIS<span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="zakat_mal">Zakat Mal / Profesi (ASN)</option>
                      <option value="zakat_fitrah">Zakat Fitrah Ramadhan</option>
                      <option value="infaq_umum">Infak / Sedekah Umum</option>
                      <option value="infaq_terikat">Infak Terikat Program</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Target Nominal (Rp)<span className="required">*</span></label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.target_amount}
                      onChange={e => setFormData({ ...formData, target_amount: e.target.value })}
                      placeholder="Contoh: 100000000"
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Periode Tahun Buku</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.period}
                      onChange={e => setFormData({ ...formData, period: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hak Bagian Amil UPZ (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={formData.baznas_return_percentage}
                      onChange={e => setFormData({ ...formData, baznas_return_percentage: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Uraian Sasaran</label>
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
                <button type="submit" className="btn btn-primary">Simpan Target</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
