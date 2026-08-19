import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Settings as SettingsIcon, Save, Building, CreditCard, PlusCircle, Trash2 } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // New Bank Account Form State
  const [newBank, setNewBank] = useState({
    type: 'upz',
    bank_name: '',
    account_number: '',
    account_holder: '',
    description: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resSet, resBank] = await Promise.all([
        api.get('/settings'),
        api.get('/bank-accounts'),
      ]);
      const setMap: Record<string, string> = {};
      Object.keys(resSet.data || {}).forEach(k => {
        setMap[k] = resSet.data[k]?.value || '';
      });
      setSettings(setMap);
      setBankAccounts(resBank.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/settings', settings);
      alert('Pengaturan sistem berhasil disimpan!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan pengaturan.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBank.bank_name || !newBank.account_number || !newBank.account_holder) {
      alert('Lengkapi data rekening bank.');
      return;
    }
    try {
      await api.post('/bank-accounts', newBank);
      setNewBank({ type: 'upz', bank_name: '', account_number: '', account_holder: '', description: '' });
      const res = await api.get('/bank-accounts');
      setBankAccounts(res.data || []);
      alert('Rekening bank berhasil ditambahkan!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menambah rekening.');
    }
  };

  const handleDeleteBank = async (id: number) => {
    if (!confirm('Hapus rekening bank ini?')) return;
    try {
      await api.delete(`/bank-accounts/${id}`);
      setBankAccounts(prev => prev.filter(b => b.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus rekening.');
    }
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h3>Pengaturan Sistem & Parameter UPZ</h3>
          <p>Konfigurasi identitas organisasi, rekening kas/bank, dan parameter zakat</p>
        </div>
      </div>

      <div className="page-grid-2">
        {/* Identitas UPZ */}
        <div className="card">
          <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={16} color="var(--accent-green)" /> Identitas Instansi & Sistem
          </h4>
          <form onSubmit={handleSaveSettings}>
            <div className="form-group">
              <label className="form-label">Nama UPZ</label>
              <input
                type="text"
                className="form-input"
                value={settings.upz_name || ''}
                onChange={e => setSettings({ ...settings, upz_name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Alamat Kantor</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={settings.upz_address || ''}
                onChange={e => setSettings({ ...settings, upz_address: e.target.value })}
              />
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Nomor Telepon</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.upz_phone || ''}
                  onChange={e => setSettings({ ...settings, upz_phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Nama BAZNAS Induk</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.baznas_name || ''}
                  onChange={e => setSettings({ ...settings, baznas_name: e.target.value })}
                />
              </div>
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Tahun Buku Aktif</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.fiscal_year || '2026'}
                  onChange={e => setSettings({ ...settings, fiscal_year: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Batas Hak Amil Max (%)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={settings.amil_max_percentage || '12.5'}
                  onChange={e => setSettings({ ...settings, amil_max_percentage: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '12px' }} disabled={saving}>
              <Save size={14} /> {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </form>
        </div>

        {/* Rekening Bank */}
        <div className="card">
          <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={16} color="var(--accent-blue)" /> Daftar Rekening Bank Aktif
          </h4>

          {/* List Existing Bank Accounts */}
          <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {bankAccounts.map(b => (
              <div
                key={b.id}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>{b.bank_name} - {b.account_number}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    a.n. {b.account_holder} • <span style={{ textTransform: 'uppercase' }}>{b.type}</span>
                  </div>
                </div>
                <button className="btn btn-red btn-xs" onClick={() => handleDeleteBank(b.id)}>
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Add Bank Form */}
          <form onSubmit={handleAddBank} style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              + Tambah Rekening Bank
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nama Bank (cth: BSI / Bank Jateng)"
                  value={newBank.bank_name}
                  onChange={e => setNewBank({ ...newBank, bank_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nomor Rekening"
                  value={newBank.account_number}
                  onChange={e => setNewBank({ ...newBank, account_number: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nama Pemilik Rekening"
                  value={newBank.account_holder}
                  onChange={e => setNewBank({ ...newBank, account_holder: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <select
                  className="form-select"
                  value={newBank.type}
                  onChange={e => setNewBank({ ...newBank, type: e.target.value })}
                >
                  <option value="upz">Rekening UPZ Kemenag</option>
                  <option value="baznas">Rekening BAZNAS Kebumen</option>
                  <option value="upz_penghimpunan">Rekening Khusus Penghimpunan</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-secondary btn-sm">
              <PlusCircle size={13} /> Tambah Rekening
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
