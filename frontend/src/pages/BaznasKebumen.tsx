import React, { useState, useEffect } from 'react';
import api, { formatRp, formatDate } from '../lib/api';
import { Building, PlusCircle, CheckCircle, X, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function BaznasKebumen() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: 'setor',
    category: 'Zakat Mal ASN',
    amount: '',
    source_payment_method: 'bank',
    bank_account: 'Bank Jateng Syariah - 5027127127 (BAZNAS Kebumen)',
    description: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/baznas-transactions');
      setData(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/baznas-transactions', {
        ...formData,
        amount: Number(formData.amount),
      });
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan data.');
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm('Setujui transaksi setoran/pengembalian BAZNAS ini?')) return;
    try {
      await api.patch(`/baznas-transactions/${id}/approve`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyetujui.');
    }
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h3>Setoran & Pengembalian BAZNAS Kebumen</h3>
          <p>Pencatatan arus dana setoran ZIS ke BAZNAS Kab. Kebumen dan pengembalian hak amil/mustahik</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <PlusCircle size={14} /> + Catat Transaksi BAZNAS
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>TANGGAL</th>
                <th>JENIS ARUS</th>
                <th>KATEGORI DANA</th>
                <th>REKENING BAZNAS / UPZ</th>
                <th>KETERANGAN</th>
                <th className="text-right">NOMINAL</th>
                <th>STATUS</th>
                <th className="text-center">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {loading && data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center" style={{ padding: '30px' }}>
                    <span className="loading-spinner" style={{ width: 18, height: 18, marginRight: 8 }} />
                    Memuat data...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center" style={{ padding: '40px', color: 'var(--text-muted)' }}>
                    Belum ada riwayat transaksi dengan BAZNAS Kebumen.
                  </td>
                </tr>
              ) : (
                data.map(item => (
                  <tr key={item.id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>{formatDate(item.date)}</td>
                    <td>
                      <span className={`badge ${item.type === 'setor' ? 'badge-orange' : 'badge-green'}`}>
                        {item.type === 'setor' ? '↑ Setoran ke BAZNAS' : '↓ Pengembalian BAZNAS'}
                      </span>
                    </td>
                    <td>{item.category || '-'}</td>
                    <td style={{ fontSize: '12px' }}>{item.bank_account}</td>
                    <td style={{ maxWidth: '200px', fontSize: '12px' }}>{item.description}</td>
                    <td className="text-right font-bold" style={{ color: item.type === 'setor' ? 'var(--accent-orange)' : 'var(--accent-green)' }}>
                      {formatRp(item.amount)}
                    </td>
                    <td>
                      <span className={`status-badge status-${item.status?.toLowerCase() || 'draft'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="text-center">
                      {item.status === 'Draft' && (
                        <button className="btn btn-primary btn-xs" onClick={() => handleApprove(item.id)}>
                          Setujui
                        </button>
                      )}
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
              <h3>+ Catat Transaksi BAZNAS Kebumen</h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Tanggal Transaksi<span className="required">*</span></label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.date}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Jenis Arus Transaksi<span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="setor">Setoran ZIS UPZ ke BAZNAS Kebumen</option>
                      <option value="pengembalian">Pengembalian Hak Amil / Penyaluran dari BAZNAS</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Kategori Dana</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Contoh: Zakat Mal ASN / Infak"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nominal (Rp)<span className="required">*</span></label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.amount}
                      onChange={e => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="Contoh: 25000000"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Rekening Bank Tujuan / Sumber</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.bank_account}
                    onChange={e => setFormData({ ...formData, bank_account: e.target.value })}
                    placeholder="Contoh: Bank Jateng Syariah 5027127127"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Keterangan / Uraian<span className="required">*</span></label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tuliskan keterangan..."
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan Transaksi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
