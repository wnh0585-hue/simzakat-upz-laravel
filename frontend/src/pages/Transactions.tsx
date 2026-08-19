import React, { useState, useEffect } from 'react';
import api, { formatRp, formatDate, FUND_LABELS, ASNAF_LABELS } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import {
  PlusCircle, Filter, Search, CheckCircle, XCircle, Clock,
  ArrowDownLeft, ArrowUpRight, TrendingDown, Eye, Check, X, FileText
} from 'lucide-react';

interface TransactionsProps {
  transactionType: 'penerimaan' | 'penyaluran' | 'amil_operasional';
}

export default function Transactions({ transactionType }: TransactionsProps) {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [fundType, setFundType] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [detailItem, setDetailItem] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: transactionType,
    fund_type: 'zakat',
    amount: '',
    payment_method: 'bank',
    bank_name: 'BSI - Rekening UPZ',
    party_name: '',
    asnaf: 'fakir',
    zakat_type: 'mal_penghasilan',
    description: '',
    notes: '',
  });

  const titleMap = {
    penerimaan: 'Penerimaan Dana ZIS',
    penyaluran: 'Penyaluran Dana ZIS (8 Asnaf)',
    amil_operasional: 'Pengeluaran Operasional Amil',
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('type', transactionType);
      if (search) params.append('search', search);
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);
      if (fundType) params.append('fund_type', fundType);
      if (statusFilter) params.append('status', statusFilter);

      const res = await api.get(`/transactions?${params.toString()}`);
      setData(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    setFormData(prev => ({ ...prev, type: transactionType }));
  }, [transactionType, dateFrom, dateTo, fundType, statusFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/transactions', {
        ...formData,
        amount: Number(formData.amount),
        type: transactionType,
      });
      setIsModalOpen(false);
      setFormData({
        date: new Date().toISOString().slice(0, 10),
        type: transactionType,
        fund_type: 'zakat',
        amount: '',
        payment_method: 'bank',
        bank_name: 'BSI - Rekening UPZ',
        party_name: '',
        asnaf: 'fakir',
        zakat_type: 'mal_penghasilan',
        description: '',
        notes: '',
      });
      fetchTransactions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan transaksi');
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    const notes = prompt(`Konfirmasi ubah status ke "${newStatus}". Masukkan catatan (opsional):`) ?? '';
    try {
      await api.patch(`/transactions/${id}/status`, { status: newStatus, notes });
      fetchTransactions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengubah status.');
    }
  };

  const FUND_COLOR: Record<string, string> = {
    zakat: '#00c48c',
    infaq_terikat: '#4e87ff',
    infaq_tidak_terikat: '#8b5cf6',
    amil: '#f59e0b',
    non_halal: '#6b7280',
  };

  return (
    <div>
      {/* Header */}
      <div className="section-header">
        <div>
          <h3>{titleMap[transactionType]}</h3>
          <p>Kelola dan pantau seluruh transaksi {transactionType.replace('_', ' ')} UPZ</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <PlusCircle size={15} /> + Tambah Transaksi
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card card-sm" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'end' }}>
          <div>
            <label className="form-label" style={{ fontSize: '11px' }}>Pencarian</label>
            <div className="search-input-wrap">
              <Search size={14} />
              <input
                type="text"
                className="form-input search-input"
                placeholder="No Ref / Nama / Ket..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchTransactions()}
              />
            </div>
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '11px' }}>Dari Tanggal</label>
            <input type="date" className="form-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '11px' }}>Sampai Tanggal</label>
            <input type="date" className="form-input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '11px' }}>Kelompok Dana</label>
            <select className="form-select" value={fundType} onChange={e => setFundType(e.target.value)}>
              <option value="">Semua Dana</option>
              <option value="zakat">Dana Zakat (1101)</option>
              <option value="infaq_terikat">Dana Infak Terikat (2101)</option>
              <option value="infaq_tidak_terikat">Dana Infak Tidak Terikat (2102)</option>
              <option value="amil">Dana Amil (3301)</option>
              <option value="non_halal">Dana Non-Halal (3401)</option>
            </select>
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '11px' }}>Status Approval</label>
            <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">Semua Status</option>
              <option value="Draft">Draft</option>
              <option value="Diajukan">Diajukan</option>
              <option value="Terverifikasi">Terverifikasi</option>
              <option value="Disetujui">Disetujui</option>
              <option value="Tersalurkan">Tersalurkan</option>
              <option value="Ditolak">Ditolak</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table Card */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>TANGGAL & REF</th>
                <th>PIHAK TERKAIT</th>
                <th>KELOMPOK DANA</th>
                <th>KETERANGAN</th>
                <th>STATUS</th>
                <th className="text-right">NOMINAL</th>
                <th className="text-center">AKSI / APPROVAL</th>
              </tr>
            </thead>
            <tbody>
              {loading && data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center" style={{ padding: '30px' }}>
                    <span className="loading-spinner" style={{ width: 20, height: 20, marginRight: 8 }} />
                    Memuat data transaksi...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center" style={{ padding: '40px', color: 'var(--text-muted)' }}>
                    Tidak ada data transaksi yang sesuai filter.
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{formatDate(item.date)}</div>
                      <div style={{ fontSize: '11px', color: 'var(--accent-blue)', fontFamily: 'monospace' }}>
                        {item.reference_number}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{item.party_name}</div>
                      {item.asnaf && (
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                          Asnaf: {ASNAF_LABELS[item.asnaf] || item.asnaf}
                        </span>
                      )}
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: `${FUND_COLOR[item.fund_type] || '#4e87ff'}20`,
                          color: FUND_COLOR[item.fund_type] || '#4e87ff',
                          border: `1px solid ${FUND_COLOR[item.fund_type] || '#4e87ff'}40`,
                          fontSize: '10px',
                        }}
                      >
                        {FUND_LABELS[item.fund_type] || item.fund_type}
                      </span>
                    </td>
                    <td style={{ maxWidth: '220px' }}>
                      <div style={{ fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.description}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        Metode: {item.payment_method === 'bank' ? `Bank (${item.bank_name || 'BSI'})` : 'Kas Tunai'}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status-${item.status?.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <span className={item.type === 'penerimaan' ? 'amount-positive' : 'amount-negative'} style={{ fontSize: '14px' }}>
                        {item.type === 'penerimaan' ? '+' : '-'}{formatRp(item.amount)}
                      </span>
                    </td>
                    <td className="text-center">
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-ghost btn-xs"
                          title="Lihat Detail"
                          onClick={() => setDetailItem(item)}
                        >
                          <Eye size={12} />
                        </button>

                        {/* Approval Flow Buttons based on Role and Status */}
                        {item.status === 'Draft' && user?.role === 'Operator' && (
                          <button
                            className="btn btn-orange btn-xs"
                            onClick={() => handleUpdateStatus(item.id, 'Diajukan')}
                          >
                            Ajukan
                          </button>
                        )}

                        {item.status === 'Diajukan' && user?.role === 'Admin' && (
                          <button
                            className="btn btn-blue btn-xs"
                            onClick={() => handleUpdateStatus(item.id, 'Terverifikasi')}
                          >
                            Verifikasi
                          </button>
                        )}

                        {item.status === 'Terverifikasi' && (user?.role === 'Pimpinan' || user?.role === 'Admin') && (
                          <button
                            className="btn btn-primary btn-xs"
                            onClick={() => handleUpdateStatus(item.id, 'Disetujui')}
                          >
                            Setujui
                          </button>
                        )}

                        {item.status === 'Disetujui' && item.type === 'penyaluran' && (
                          <button
                            className="btn btn-primary btn-xs"
                            onClick={() => handleUpdateStatus(item.id, 'Tersalurkan')}
                          >
                            Salurkan
                          </button>
                        )}

                        {['Diajukan', 'Terverifikasi'].includes(item.status) && (user?.role === 'Admin' || user?.role === 'Pimpinan') && (
                          <button
                            className="btn btn-red btn-xs"
                            onClick={() => handleUpdateStatus(item.id, 'Ditolak')}
                          >
                            Tolak
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>+ Tambah {titleMap[transactionType]}</h3>
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
                    <label className="form-label">Nominal (Rp)<span className="required">*</span></label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Contoh: 5000000"
                      value={formData.amount}
                      onChange={e => setFormData({ ...formData, amount: e.target.value })}
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Kelompok Dana PSAK 109<span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={formData.fund_type}
                      onChange={e => setFormData({ ...formData, fund_type: e.target.value })}
                    >
                      <option value="zakat">Dana Zakat (1101)</option>
                      <option value="infaq_terikat">Dana Infak Terikat (2101)</option>
                      <option value="infaq_tidak_terikat">Dana Infak Tidak Terikat (2102)</option>
                      <option value="amil">Dana Amil (3301)</option>
                      <option value="non_halal">Dana Non-Halal (3401)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      {transactionType === 'penerimaan' ? 'Nama Muzakki / Donatur' : 'Nama Mustahik / Penerima'}
                      <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={transactionType === 'penerimaan' ? 'Contoh: ASN Kankemenag' : 'Contoh: Fakir Miskin Desa Kutowinangun'}
                      value={formData.party_name}
                      onChange={e => setFormData({ ...formData, party_name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {transactionType === 'penyaluran' && (
                  <div className="form-group">
                    <label className="form-label">Golongan Asnaf (8 Asnaf)</label>
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
                )}

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Metode Pembayaran</label>
                    <select
                      className="form-select"
                      value={formData.payment_method}
                      onChange={e => setFormData({ ...formData, payment_method: e.target.value })}
                    >
                      <option value="bank">Rekening Bank (Kas Bank)</option>
                      <option value="tunai">Tunai Langsung (Kas Tunai)</option>
                    </select>
                  </div>
                  {formData.payment_method === 'bank' && (
                    <div className="form-group">
                      <label className="form-label">Nama Bank Rekening</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.bank_name}
                        onChange={e => setFormData({ ...formData, bank_name: e.target.value })}
                        placeholder="Contoh: BSI - Rekening UPZ"
                      />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Keterangan / Uraian Transaksi<span className="required">*</span></label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Tuliskan uraian jelas transaksi..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
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

      {/* Detail Modal */}
      {detailItem && (
        <div className="modal-overlay" onClick={() => setDetailItem(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Rincian Kuitansi {detailItem.reference_number}</h3>
              <button className="btn-close" onClick={() => setDetailItem(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Nomor Referensi:</span><br /><strong>{detailItem.reference_number}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Tanggal:</span><br /><strong>{formatDate(detailItem.date)}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Jenis Transaksi:</span><br /><strong>{detailItem.type?.toUpperCase()}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Kelompok Dana:</span><br /><strong>{FUND_LABELS[detailItem.fund_type] || detailItem.fund_type}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Pihak Terkait:</span><br /><strong>{detailItem.party_name}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Nominal:</span><br /><strong style={{ fontSize: '16px', color: 'var(--accent-green)' }}>{formatRp(detailItem.amount)}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Metode Kas:</span><br /><strong>{detailItem.payment_method?.toUpperCase()} ({detailItem.bank_name || '-'})</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Status Persetujuan:</span><br /><span className={`status-badge status-${detailItem.status?.toLowerCase()}`}>{detailItem.status}</span></div>
              </div>
              <div className="divider" />
              <div style={{ fontSize: '13px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Uraian:</span>
                <p style={{ marginTop: '4px', lineHeight: '1.6' }}>{detailItem.description}</p>
              </div>
              {detailItem.notes && (
                <div style={{ marginTop: '12px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Catatan Approval:</span>
                  <p>{detailItem.notes}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDetailItem(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
