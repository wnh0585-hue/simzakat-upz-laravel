import React, { useState } from 'react';
import { formatRp } from '../lib/api';
import { Calculator, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function KalkulatorZakat() {
  const [activeTab, setActiveTab] = useState<'gaji' | 'tpg' | 'fitrah' | 'emas'>('gaji');

  // Gaji ASN
  const [gajiPokok, setGajiPokok] = useState('');
  const [tunjangan, setTunjangan] = useState('');
  const [potonganHutang, setPotonganHutang] = useState('');

  // TPG / Tukin
  const [nominalTukin, setNominalTukin] = useState('');

  // Fitrah
  const [jumlahJiwa, setJumlahJiwa] = useState('1');
  const [hargaBerasKg, setHargaBerasKg] = useState('16000'); // 2.5 kg x 16.000 = 40.000/jiwa

  // Emas / Tabungan
  const [totalEmasGram, setTotalEmasGram] = useState('');
  const [hargaEmasGram, setHargaEmasGram] = useState('1500000');
  const [totalTabungan, setTotalTabungan] = useState('');

  // Perhitungan
  const nisabBulanan = (85 * Number(hargaEmasGram || 1500000)) / 12;

  const hitungGaji = () => {
    const totalBruto = (Number(gajiPokok) || 0) + (Number(tunjangan) || 0);
    const netto = Math.max(0, totalBruto - (Number(potonganHutang) || 0));
    const wajib = netto >= nisabBulanan;
    const zakat = wajib ? netto * 0.025 : 0;
    return { totalBruto, netto, wajib, zakat };
  };

  const hitungTpg = () => {
    const bruto = Number(nominalTukin) || 0;
    const wajib = bruto > 0;
    const zakat = wajib ? bruto * 0.025 : 0;
    return { bruto, wajib, zakat };
  };

  const hitungFitrah = () => {
    const jiwa = Number(jumlahJiwa) || 1;
    const perJiwa = 2.5 * (Number(hargaBerasKg) || 16000);
    const total = jiwa * perJiwa;
    const berasKg = jiwa * 2.5;
    return { jiwa, perJiwa, total, berasKg };
  };

  const hitungEmas = () => {
    const emas = Number(totalEmasGram) || 0;
    const hrg = Number(hargaEmasGram) || 1500000;
    const tab = Number(totalTabungan) || 0;
    const totalAset = (emas * hrg) + tab;
    const nisabTahunan = 85 * hrg;
    const wajib = totalAset >= nisabTahunan;
    const zakat = wajib ? totalAset * 0.025 : 0;
    return { totalAset, nisabTahunan, wajib, zakat };
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h3>Kalkulator Zakat PSAK 109</h3>
          <p>Perhitungan nisab dan kewajiban zakat sesuai fatwa MUI dan regulasi BAZNAS</p>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {[
            { key: 'gaji', label: 'Zakat Penghasilan / Gaji ASN' },
            { key: 'tpg', label: 'Zakat TPG & Tukin PNS' },
            { key: 'fitrah', label: 'Zakat Fitrah Ramadhan' },
            { key: 'emas', label: 'Zakat Emas & Tabungan' },
          ].map(t => (
            <button
              key={t.key}
              className={`btn ${activeTab === t.key ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab(t.key as any)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Gaji */}
        {activeTab === 'gaji' && (() => {
          const res = hitungGaji();
          return (
            <div className="card">
              <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Simulasi Zakat Penghasilan (Bulan Berjalan)</h4>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Gaji Pokok (Rp)</label>
                  <input type="number" className="form-input" placeholder="Contoh: 4500000" value={gajiPokok} onChange={e => setGajiPokok(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tunjangan Lainnya (Rp)</label>
                  <input type="number" className="form-input" placeholder="Contoh: 2000000" value={tunjangan} onChange={e => setTunjangan(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Pengurang / Kebutuhan Pokok Mendesak (Rp)</label>
                <input type="number" className="form-input" placeholder="Contoh: 0" value={potonganHutang} onChange={e => setPotonganHutang(e.target.value)} />
              </div>

              <div style={{ background: 'rgba(0,196,140,0.08)', border: '1px solid rgba(0,196,140,0.2)', borderRadius: 'var(--radius-sm)', padding: '16px', marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Nisab Emas 85gr / Bulan:</span>
                  <strong>{formatRp(nisabBulanan)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Penghasilan Bersih:</span>
                  <strong>{formatRp(res.netto)}</strong>
                </div>
                <div className="divider" style={{ margin: '10px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>Kewajiban Zakat (2.5%):</div>
                    <span className={`badge ${res.wajib ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: '10px', marginTop: '4px' }}>
                      {res.wajib ? '✓ Wajib Zakat (Mencapai Nisab)' : 'Belum Mencapai Nisab (Disunnahkan Infak)'}
                    </span>
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-green)' }}>
                    {formatRp(res.zakat)}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Tab TPG / Tukin */}
        {activeTab === 'tpg' && (() => {
          const res = hitungTpg();
          return (
            <div className="card">
              <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Zakat Tunjangan Profesi Guru & Tukin</h4>
              <div className="form-group">
                <label className="form-label">Nominal TPG / Tukin Diterima (Rp)</label>
                <input type="number" className="form-input" placeholder="Contoh: 12000000" value={nominalTukin} onChange={e => setNominalTukin(e.target.value)} />
              </div>

              <div style={{ background: 'rgba(78,135,255,0.08)', border: '1px solid rgba(78,135,255,0.2)', borderRadius: 'var(--radius-sm)', padding: '16px', marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>Potongan Zakat Langsung (2.5%):</div>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Dihimpun UPZ Kemenag untuk disalurkan ke asnaf</p>
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-blue)' }}>
                    {formatRp(res.zakat)}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Tab Fitrah */}
        {activeTab === 'fitrah' && (() => {
          const res = hitungFitrah();
          return (
            <div className="card">
              <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Zakat Fitrah (Ramadhan)</h4>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Jumlah Jiwa / Tanggungan</label>
                  <input type="number" className="form-input" min="1" value={jumlahJiwa} onChange={e => setJumlahJiwa(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Standar Harga Beras per Kg (Rp)</label>
                  <input type="number" className="form-input" value={hargaBerasKg} onChange={e => setHargaBerasKg(e.target.value)} />
                </div>
              </div>

              <div style={{ background: 'rgba(0,196,140,0.08)', border: '1px solid rgba(0,196,140,0.2)', borderRadius: 'var(--radius-sm)', padding: '16px', marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Beras (2.5 Kg / Jiwa):</span>
                  <strong>{res.berasKg} Kg Beras</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Nominal per Jiwa:</span>
                  <strong>{formatRp(res.perJiwa)}</strong>
                </div>
                <div className="divider" style={{ margin: '10px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>Total Konversi Uang ({res.jiwa} Jiwa):</div>
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-green)' }}>
                    {formatRp(res.total)}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Tab Emas */}
        {activeTab === 'emas' && (() => {
          const res = hitungEmas();
          return (
            <div className="card">
              <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Zakat Emas & Tabungan (Haul 1 Tahun)</h4>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Total Emas Simpanan (Gram)</label>
                  <input type="number" className="form-input" placeholder="Contoh: 100" value={totalEmasGram} onChange={e => setTotalEmasGram(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Harga Emas Saat Ini / Gram (Rp)</label>
                  <input type="number" className="form-input" value={hargaEmasGram} onChange={e => setHargaEmasGram(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Total Uang Tabungan / Deposito Mengendap (Rp)</label>
                <input type="number" className="form-input" placeholder="Contoh: 50000000" value={totalTabungan} onChange={e => setTotalTabungan(e.target.value)} />
              </div>

              <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-sm)', padding: '16px', marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Nisab Emas 85 Gram (Tahunan):</span>
                  <strong>{formatRp(res.nisabTahunan)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Total Nilai Harta:</span>
                  <strong>{formatRp(res.totalAset)}</strong>
                </div>
                <div className="divider" style={{ margin: '10px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>Kewajiban Zakat Mal (2.5%):</div>
                    <span className={`badge ${res.wajib ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: '10px', marginTop: '4px' }}>
                      {res.wajib ? '✓ Wajib Zakat Mal' : 'Belum Mencapai Nisab'}
                    </span>
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-orange)' }}>
                    {formatRp(res.zakat)}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
