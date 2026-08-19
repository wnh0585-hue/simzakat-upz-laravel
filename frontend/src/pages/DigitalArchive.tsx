import React, { useState, useEffect, useRef } from 'react';
import api, { formatDate } from '../lib/api';
import { Archive, Upload, FileText, Download, Search, X } from 'lucide-react';

export default function DigitalArchive() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedTxId, setSelectedTxId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchArchives = async () => {
    setLoading(true);
    try {
      const res = await api.get('/digital-archive');
      setData(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/transactions?per_page=100');
      setTransactions(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchArchives();
    fetchTransactions();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file || !selectedTxId) {
      alert('Pilih transaksi dan file bukti.');
      return;
    }
    const form = new FormData();
    form.append('transaction_id', selectedTxId);
    form.append('file', file);
    try {
      await api.post('/digital-archive/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('File bukti berhasil diunggah!');
      setIsUploadOpen(false);
      fetchArchives();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengunggah file.');
    }
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h3>Arsip Digital & Bukti Transaksi</h3>
          <p>Repositori dokumen bukti transfer, nota, kuitansi BKM/BKK yang terdigitalisasi</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsUploadOpen(true)}>
          <Upload size={14} /> + Unggah Bukti Transaksi
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>TANGGAL</th>
                <th>NO. REFERENSI</th>
                <th>PIHAK TERKAIT</th>
                <th>NAMA FILE BUKTI</th>
                <th>PENGUNGGAH</th>
                <th className="text-center">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {loading && data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center" style={{ padding: '30px' }}>
                    <span className="loading-spinner" style={{ width: 18, height: 18, marginRight: 8 }} />
                    Memuat arsip...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center" style={{ padding: '40px', color: 'var(--text-muted)' }}>
                    Belum ada dokumen bukti yang diunggah.
                  </td>
                </tr>
              ) : (
                data.map(item => (
                  <tr key={item.id}>
                    <td>{formatDate(item.date)}</td>
                    <td><span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>{item.reference_number}</span></td>
                    <td>{item.party_name}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileText size={14} color="var(--accent-green)" />
                        <span>{item.proof_file_name || 'Dokumen Bukti'}</span>
                      </div>
                    </td>
                    <td>{item.creator?.name || 'Operator'}</td>
                    <td className="text-center">
                      {item.proof_file_path && (
                        <a
                          href={`http://127.0.0.1:8000/storage/${item.proof_file_path}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-xs"
                        >
                          <Download size={12} /> Buka / Unduh
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isUploadOpen && (
        <div className="modal-overlay" onClick={() => setIsUploadOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>+ Unggah Dokumen Bukti Transaksi</h3>
              <button className="btn-close" onClick={() => setIsUploadOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleUploadSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Pilih Transaksi Terkait<span className="required">*</span></label>
                  <select
                    className="form-select"
                    value={selectedTxId}
                    onChange={e => setSelectedTxId(e.target.value)}
                    required
                  >
                    <option value="">-- Pilih Transaksi --</option>
                    {transactions.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.reference_number} - {t.party_name} ({formatDate(t.date)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Pilih File Bukti (PDF, JPG, PNG, Excel)<span className="required">*</span></label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="form-input"
                    accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls"
                    required
                  />
                  <div className="form-hint">Ukuran maksimal file: 10 MB</div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsUploadOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Unggah Sekarang</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
