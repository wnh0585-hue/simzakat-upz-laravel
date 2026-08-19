import React, { useState, useEffect } from 'react';
import api, { formatRp, formatDate } from '../lib/api';
import { Download, FileText } from 'lucide-react';

function downloadReport(path: string, params: Record<string, string>, format: 'pdf' | 'excel') {
  const qs = new URLSearchParams({ ...params, format }).toString();
  import('../lib/api').then(m => {
    m.default.get(`${path}?${qs}`, { responseType: 'blob' }).then((res: any) => {
      const ext = format === 'pdf' ? 'pdf' : 'xlsx';
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url; a.download = `laporan.${ext}`; a.click();
      URL.revokeObjectURL(url);
    });
  });
}

// -------- Posisi Keuangan --------
export function PosisiKeuangan() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    api.get(`/reports/posisi-keuangan?date=${date}`).then(r => setData(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [date]);

  const FUNDS = [
    { key: 'zakat', label: 'Dana Zakat', color: '#00c48c' },
    { key: 'infaq_terikat', label: 'Dana Infak Terikat', color: '#4e87ff' },
    { key: 'infaq_tidak_terikat', label: 'Dana Infak Tidak Terikat', color: '#8b5cf6' },
    { key: 'amil', label: 'Dana Amil', color: '#f59e0b' },
    { key: 'non_halal', label: 'Dana Non Halal', color: '#6b7280' },
  ];

  return (
    <div>
      <div className="section-header">
        <div><h3>Laporan Posisi Keuangan (Neraca)</h3><p>PSAK 109 — Per tanggal tertentu</p></div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} style={{ width: 160 }} />
          <button className="btn btn-pdf btn-sm" onClick={() => downloadReport('/reports/posisi-keuangan', { date }, 'pdf')}><FileText size={13} /> PDF</button>
          <button className="btn btn-excel btn-sm" onClick={() => downloadReport('/reports/posisi-keuangan', { date }, 'excel')}><Download size={13} /> Excel</button>
        </div>
      </div>
      {loading ? <div className="loading-overlay"><span className="loading-spinner" /></div> : data && (
        <div>
          <div className="report-header" style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>UPZ P Kankemenag Kab. Kebumen</div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: '4px 0' }}>LAPORAN POSISI KEUANGAN</h2>
            <div style={{ fontSize: 13 }}>Per Tanggal {formatDate(date)}</div>
          </div>
          <div className="card">
            <table className="report-table">
              <thead><tr><th>Kelompok Dana</th><th className="text-right">Penerimaan</th><th className="text-right">Penyaluran</th><th className="text-right">Saldo</th></tr></thead>
              <tbody>
                {FUNDS.map(f => {
                  const b = data.balances?.[f.key] || { in: 0, out: 0, balance: 0 };
                  return (
                    <tr key={f.key}>
                      <td><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: f.color, marginRight: 8 }} />{f.label}</td>
                      <td className="text-right amount-positive">{formatRp(b.in)}</td>
                      <td className="text-right amount-negative">{formatRp(b.out)}</td>
                      <td className="text-right"><strong style={{ color: b.balance >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{formatRp(b.balance)}</strong></td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: 'rgba(0,196,140,0.05)' }}>
                  <td><strong>TOTAL ASET BERSIH</strong></td>
                  <td className="text-right"><strong className="amount-positive">{formatRp(Object.values(data.balances || {}).reduce((s: number, b: any) => s + b.in, 0) as number)}</strong></td>
                  <td className="text-right"><strong className="amount-negative">{formatRp(Object.values(data.balances || {}).reduce((s: number, b: any) => s + b.out, 0) as number)}</strong></td>
                  <td className="text-right"><strong style={{ color: 'var(--accent-green)', fontSize: 16 }}>{formatRp(data.total_aset)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// -------- Perubahan Dana --------
export function PerubahanDana() {
  const year = new Date().getFullYear();
  const [dateFrom, setDateFrom] = useState(`${year}-01-01`);
  const [dateTo, setDateTo] = useState(`${year}-12-31`);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    api.get(`/reports/perubahan-dana?date_from=${dateFrom}&date_to=${dateTo}`).then(r => setData(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [dateFrom, dateTo]);

  const FUNDS = [
    { key: 'zakat', label: 'Dana Zakat' }, { key: 'infaq_terikat', label: 'Dana Infak Terikat' },
    { key: 'infaq_tidak_terikat', label: 'Dana Infak Tidak Terikat' }, { key: 'amil', label: 'Dana Amil' }, { key: 'non_halal', label: 'Dana Non Halal' },
  ];

  return (
    <div>
      <div className="section-header">
        <div><h3>Laporan Perubahan Dana</h3><p>PSAK 109 — Periode tertentu</p></div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="date" className="form-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ width: 150 }} />
          <span style={{ color: 'var(--text-muted)' }}>s/d</span>
          <input type="date" className="form-input" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ width: 150 }} />
          <button className="btn btn-pdf btn-sm" onClick={() => downloadReport('/reports/perubahan-dana', { date_from: dateFrom, date_to: dateTo }, 'pdf')}><FileText size={13} /> PDF</button>
          <button className="btn btn-excel btn-sm" onClick={() => downloadReport('/reports/perubahan-dana', { date_from: dateFrom, date_to: dateTo }, 'excel')}><Download size={13} /> Excel</button>
        </div>
      </div>
      {loading ? <div className="loading-overlay"><span className="loading-spinner" /></div> : data && (
        <div className="card">
          <table className="report-table">
            <thead><tr><th>Kelompok Dana</th><th className="text-right">Saldo Awal</th><th className="text-right">Penerimaan</th><th className="text-right">Penyaluran</th><th className="text-right">Operasional</th><th className="text-right">Saldo Akhir</th></tr></thead>
            <tbody>
              {FUNDS.map(f => {
                const r = data.report?.[f.key] || {};
                return (
                  <tr key={f.key}>
                    <td>{f.label}</td>
                    <td className="text-right">{formatRp(r.saldo_awal)}</td>
                    <td className="text-right amount-positive">{formatRp(r.penerimaan)}</td>
                    <td className="text-right amount-negative">{formatRp(r.penyaluran)}</td>
                    <td className="text-right amount-negative">{formatRp(r.operasional)}</td>
                    <td className="text-right"><strong className={r.saldo_akhir >= 0 ? 'amount-positive' : 'amount-negative'}>{formatRp(r.saldo_akhir)}</strong></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// -------- Arus Kas --------
export function ArusKas() {
  const year = new Date().getFullYear();
  const [dateFrom, setDateFrom] = useState(`${year}-01-01`);
  const [dateTo, setDateTo] = useState(`${year}-12-31`);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/reports/arus-kas?date_from=${dateFrom}&date_to=${dateTo}`).then(r => setData(r.data)).finally(() => setLoading(false));
  }, [dateFrom, dateTo]);

  return (
    <div>
      <div className="section-header">
        <div><h3>Laporan Arus Kas</h3><p>Pergerakan kas tunai dan bank</p></div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="date" className="form-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ width: 150 }} />
          <span style={{ color: 'var(--text-muted)' }}>s/d</span>
          <input type="date" className="form-input" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ width: 150 }} />
          <button className="btn btn-pdf btn-sm" onClick={() => downloadReport('/reports/arus-kas', { date_from: dateFrom, date_to: dateTo }, 'pdf')}><FileText size={13} /> PDF</button>
          <button className="btn btn-excel btn-sm" onClick={() => downloadReport('/reports/arus-kas', { date_from: dateFrom, date_to: dateTo }, 'excel')}><Download size={13} /> Excel</button>
        </div>
      </div>
      {loading ? <div className="loading-overlay"><span className="loading-spinner" /></div> : data && (
        <div className="page-grid-2">
          {[{ label: 'Kas Tunai', masuk: data.kas_masuk_tunai, keluar: data.kas_keluar_tunai, net: data.net_tunai },
            { label: 'Kas Bank', masuk: data.kas_masuk_bank, keluar: data.kas_keluar_bank, net: data.net_bank }].map(k => (
            <div className="card" key={k.label}>
              <h4 style={{ marginBottom: 16, fontWeight: 700 }}>{k.label}</h4>
              {[['Arus Masuk (Penerimaan)', k.masuk, true], ['Arus Keluar (Penyaluran)', k.keluar, false]].map(([l, v, pos]) => (
                <div key={l as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13 }}>{l as string}</span>
                  <span className={pos ? 'amount-positive' : 'amount-negative'}>{formatRp(v as number)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', marginTop: 4 }}>
                <span style={{ fontWeight: 700 }}>Arus Kas Bersih</span>
                <span className={k.net >= 0 ? 'amount-positive' : 'amount-negative'} style={{ fontSize: 16, fontWeight: 800 }}>{formatRp(k.net)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// -------- Buku Kas --------
export function BukuKas() {
  const year = new Date().getFullYear();
  const [dateFrom, setDateFrom] = useState(`${year}-01-01`);
  const [dateTo, setDateTo] = useState(`${year}-12-31`);
  const [method, setMethod] = useState('tunai');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/reports/buku-kas?date_from=${dateFrom}&date_to=${dateTo}&payment_method=${method}`).then(r => setData(r.data)).finally(() => setLoading(false));
  }, [dateFrom, dateTo, method]);

  let runningBalance = data?.saldo_awal || 0;

  return (
    <div>
      <div className="section-header">
        <div><h3>Buku Kas Umum</h3><p>Rekap mutasi kas tunai dan bank</p></div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select className="form-select" value={method} onChange={e => setMethod(e.target.value)} style={{ width: 130 }}>
            <option value="tunai">Kas Tunai</option><option value="bank">Kas Bank</option>
          </select>
          <input type="date" className="form-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ width: 150 }} />
          <span style={{ color: 'var(--text-muted)' }}>s/d</span>
          <input type="date" className="form-input" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ width: 150 }} />
          <button className="btn btn-pdf btn-sm" onClick={() => downloadReport('/reports/buku-kas', { date_from: dateFrom, date_to: dateTo, payment_method: method }, 'pdf')}><FileText size={13} /> PDF</button>
          <button className="btn btn-excel btn-sm" onClick={() => downloadReport('/reports/buku-kas', { date_from: dateFrom, date_to: dateTo, payment_method: method }, 'excel')}><Download size={13} /> Excel</button>
        </div>
      </div>
      {loading ? <div className="loading-overlay"><span className="loading-spinner" /></div> : data && (
        <div className="card">
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div style={{ background: 'rgba(0,196,140,0.1)', border: '1px solid rgba(0,196,140,0.2)', borderRadius: 8, padding: '10px 16px' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Saldo Awal</div>
              <div style={{ fontWeight: 700, color: 'var(--accent-green)' }}>{formatRp(data.saldo_awal)}</div>
            </div>
          </div>
          <div className="table-container">
            <table className="report-table">
              <thead><tr><th>TGL</th><th>NO. REF</th><th>KETERANGAN</th><th>PIHAK</th><th className="text-right">DEBIT</th><th className="text-right">KREDIT</th><th className="text-right">SALDO</th></tr></thead>
              <tbody>
                {(data.transactions || []).map((tx: any) => {
                  const isIn = tx.type === 'penerimaan';
                  if (isIn) runningBalance += tx.amount; else runningBalance -= tx.amount;
                  return (
                    <tr key={tx.id}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{formatDate(tx.date)}</td>
                      <td style={{ fontSize: 11, color: 'var(--accent-blue)' }}>{tx.reference_number}</td>
                      <td style={{ fontSize: 12, maxWidth: 200 }}>{tx.description}</td>
                      <td style={{ fontSize: 12 }}>{tx.party_name}</td>
                      <td className="text-right amount-positive" style={{ fontSize: 13 }}>{isIn ? formatRp(tx.amount) : '-'}</td>
                      <td className="text-right amount-negative" style={{ fontSize: 13 }}>{!isIn ? formatRp(tx.amount) : '-'}</td>
                      <td className="text-right" style={{ fontWeight: 600, color: runningBalance >= 0 ? 'var(--text-primary)' : 'var(--accent-red)' }}>{formatRp(runningBalance)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// -------- Buku Besar --------
export function BukuBesar() {
  const year = new Date().getFullYear();
  const [dateFrom, setDateFrom] = useState(`${year}-01-01`);
  const [dateTo, setDateTo] = useState(`${year}-12-31`);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/reports/buku-besar?date_from=${dateFrom}&date_to=${dateTo}`).then(r => setData(r.data)).finally(() => setLoading(false));
  }, [dateFrom, dateTo]);

  return (
    <div>
      <div className="section-header">
        <div><h3>Buku Besar (General Ledger)</h3><p>Jurnal entri ganda semua akun</p></div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="date" className="form-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ width: 150 }} />
          <span style={{ color: 'var(--text-muted)' }}>s/d</span>
          <input type="date" className="form-input" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ width: 150 }} />
          <button className="btn btn-pdf btn-sm" onClick={() => downloadReport('/reports/buku-besar', { date_from: dateFrom, date_to: dateTo }, 'pdf')}><FileText size={13} /> PDF</button>
          <button className="btn btn-excel btn-sm" onClick={() => downloadReport('/reports/buku-besar', { date_from: dateFrom, date_to: dateTo }, 'excel')}><Download size={13} /> Excel</button>
        </div>
      </div>
      {loading ? <div className="loading-overlay"><span className="loading-spinner" /></div> : data && (
        <div className="card">
          <div className="table-container">
            <table className="report-table">
              <thead><tr><th>TGL</th><th>REF</th><th>KETERANGAN</th><th>AKUN DEBIT</th><th>AKUN KREDIT</th><th className="text-right">DEBIT</th><th className="text-right">KREDIT</th></tr></thead>
              <tbody>
                {(data.entries || []).map((e: any, i: number) => (
                  <tr key={i}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{e.date}</td>
                    <td style={{ fontSize: 11, color: 'var(--accent-blue)' }}>{e.ref}</td>
                    <td style={{ fontSize: 12 }}>{e.description}</td>
                    <td style={{ fontSize: 11 }}>{e.debit_account}</td>
                    <td style={{ fontSize: 11 }}>{e.credit_account}</td>
                    <td className="text-right amount-positive">{e.debit > 0 ? formatRp(e.debit) : '-'}</td>
                    <td className="text-right amount-negative">{e.credit > 0 ? formatRp(e.credit) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// -------- Neraca Saldo --------
export function NeracaSaldo() {
  const [dateTo, setDateTo] = useState(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/reports/neraca-saldo?date_to=${dateTo}`).then(r => setData(r.data)).finally(() => setLoading(false));
  }, [dateTo]);

  return (
    <div>
      <div className="section-header">
        <div><h3>Neraca Saldo (Trial Balance)</h3><p>Keseimbangan debit-kredit semua akun</p></div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="date" className="form-input" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ width: 160 }} />
          <button className="btn btn-pdf btn-sm" onClick={() => downloadReport('/reports/neraca-saldo', { date_to: dateTo }, 'pdf')}><FileText size={13} /> PDF</button>
          <button className="btn btn-excel btn-sm" onClick={() => downloadReport('/reports/neraca-saldo', { date_to: dateTo }, 'excel')}><Download size={13} /> Excel</button>
        </div>
      </div>
      {loading ? <div className="loading-overlay"><span className="loading-spinner" /></div> : data && (
        <div className="card">
          <table className="report-table">
            <thead><tr><th>NAMA AKUN</th><th className="text-right">DEBIT</th><th className="text-right">KREDIT</th><th className="text-right">SALDO DEBIT</th><th className="text-right">SALDO KREDIT</th></tr></thead>
            <tbody>
              {(data.accounts || []).map((a: any, i: number) => (
                <tr key={i}>
                  <td>{a.account}</td>
                  <td className="text-right">{a.debit > 0 ? formatRp(a.debit) : '-'}</td>
                  <td className="text-right">{a.kredit > 0 ? formatRp(a.kredit) : '-'}</td>
                  <td className="text-right amount-positive">{a.saldo_debit > 0 ? formatRp(a.saldo_debit) : '-'}</td>
                  <td className="text-right amount-negative">{a.saldo_kredit > 0 ? formatRp(a.saldo_kredit) : '-'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td><strong>TOTAL</strong></td>
                <td className="text-right"><strong>{formatRp(data.total_debit)}</strong></td>
                <td className="text-right"><strong>{formatRp(data.total_kredit)}</strong></td>
                <td className="text-right"><strong className="amount-positive">{formatRp(data.total_debit)}</strong></td>
                <td className="text-right"><strong className="amount-negative">{formatRp(data.total_kredit)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

// -------- Mutasi Kas & Bank --------
export function MutasiKasBank() {
  const year = new Date().getFullYear();
  const [dateFrom, setDateFrom] = useState(`${year}-01-01`);
  const [dateTo, setDateTo] = useState(`${year}-12-31`);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/reports/mutasi-kas-bank?date_from=${dateFrom}&date_to=${dateTo}`).then(r => setData(r.data)).finally(() => setLoading(false));
  }, [dateFrom, dateTo]);

  return (
    <div>
      <div className="section-header">
        <div><h3>Mutasi Kas & Bank</h3><p>Rekonsiliasi pergerakan kas tunai dan rekening bank</p></div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="date" className="form-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ width: 150 }} />
          <span style={{ color: 'var(--text-muted)' }}>s/d</span>
          <input type="date" className="form-input" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ width: 150 }} />
          <button className="btn btn-pdf btn-sm" onClick={() => downloadReport('/reports/mutasi-kas-bank', { date_from: dateFrom, date_to: dateTo }, 'pdf')}><FileText size={13} /> PDF</button>
          <button className="btn btn-excel btn-sm" onClick={() => downloadReport('/reports/mutasi-kas-bank', { date_from: dateFrom, date_to: dateTo }, 'excel')}><Download size={13} /> Excel</button>
        </div>
      </div>
      {loading ? <div className="loading-overlay"><span className="loading-spinner" /></div> : data && (
        <div className="page-grid-2">
          {[{ label: 'Kas Tunai', d: data.tunai }, { label: 'Kas Bank', d: data.bank }].map(({ label, d }) => (
            <div className="card" key={label}>
              <h4 style={{ fontWeight: 700, marginBottom: 20 }}>{label}</h4>
              {[['Saldo Awal', d?.saldo_awal, null], ['Kas Masuk (+)', d?.masuk, true], ['Kas Keluar (-)', d?.keluar, false]].map(([l, v, pos]) => (
                <div key={l as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13 }}>{l as string}</span>
                  <span className={pos === null ? '' : pos ? 'amount-positive' : 'amount-negative'}>{formatRp(v as number)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0 0', marginTop: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Saldo Akhir</span>
                <span style={{ fontWeight: 800, fontSize: 18, color: (d?.saldo_akhir || 0) >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{formatRp(d?.saldo_akhir)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// -------- Jurnal Umum --------
export function JurnalUmum() {
  const year = new Date().getFullYear();
  const [dateFrom, setDateFrom] = useState(`${year}-01-01`);
  const [dateTo, setDateTo] = useState(`${year}-12-31`);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/reports/jurnal-umum?date_from=${dateFrom}&date_to=${dateTo}`).then(r => setData(r.data)).finally(() => setLoading(false));
  }, [dateFrom, dateTo]);

  const FUND_LABELS: Record<string,string> = { zakat:'Zakat', infaq_terikat:'Infak Terikat', infaq_tidak_terikat:'Infak Tidak Terikat', amil:'Amil', non_halal:'Non Halal' };

  return (
    <div>
      <div className="section-header">
        <div><h3>Jurnal Umum</h3><p>Catatan seluruh transaksi berurutan</p></div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="date" className="form-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ width: 150 }} />
          <span style={{ color: 'var(--text-muted)' }}>s/d</span>
          <input type="date" className="form-input" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ width: 150 }} />
          <button className="btn btn-pdf btn-sm" onClick={() => downloadReport('/reports/jurnal-umum', { date_from: dateFrom, date_to: dateTo }, 'pdf')}><FileText size={13} /> PDF</button>
          <button className="btn btn-excel btn-sm" onClick={() => downloadReport('/reports/jurnal-umum', { date_from: dateFrom, date_to: dateTo }, 'excel')}><Download size={13} /> Excel</button>
        </div>
      </div>
      {loading ? <div className="loading-overlay"><span className="loading-spinner" /></div> : data && (
        <div className="card">
          <div className="table-container">
            <table className="report-table">
              <thead><tr><th>TGL</th><th>REF</th><th>KETERANGAN</th><th>DANA</th><th>JENIS</th><th className="text-right">DEBIT</th><th className="text-right">KREDIT</th><th>STATUS</th></tr></thead>
              <tbody>
                {(data.transactions || []).map((tx: any) => (
                  <tr key={tx.id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{formatDate(tx.date)}</td>
                    <td style={{ fontSize: 11, color: 'var(--accent-blue)' }}>{tx.reference_number}</td>
                    <td style={{ fontSize: 12, maxWidth: 180 }}>{tx.description}</td>
                    <td><span style={{ fontSize: 11 }}>{FUND_LABELS[tx.fund_type] || tx.fund_type}</span></td>
                    <td><span className={`tx-badge tx-${tx.type === 'penerimaan' ? 'penerimaan' : tx.type === 'penyaluran' ? 'penyaluran' : 'amil'}`} style={{ fontSize: 9 }}>{tx.type}</span></td>
                    <td className="text-right amount-positive">{tx.type === 'penerimaan' ? formatRp(tx.amount) : '-'}</td>
                    <td className="text-right amount-negative">{tx.type !== 'penerimaan' ? formatRp(tx.amount) : '-'}</td>
                    <td><span className={`status-badge status-${tx.status?.toLowerCase()}`}>{tx.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
