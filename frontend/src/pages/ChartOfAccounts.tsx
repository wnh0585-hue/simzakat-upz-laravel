import React from 'react';
import { BookOpen } from 'lucide-react';

const COA_DATA = [
  { code: '1101', name: 'Kas & Setara Kas - Dana Zakat', type: 'Aset', fund: 'Dana Zakat', desc: 'Kas tunai dan rekening bank untuk penghimpunan dan penyaluran zakat' },
  { code: '2101', name: 'Kas & Setara Kas - Dana Infak Terikat', type: 'Aset', fund: 'Dana Infak', desc: 'Rekening penerimaan infak terikat program kerja tertentu' },
  { code: '2102', name: 'Kas & Setara Kas - Dana Infak Tidak Terikat', type: 'Aset', fund: 'Dana Infak', desc: 'Rekening penerimaan sedekah & infak umum' },
  { code: '3301', name: 'Kas & Setara Kas - Dana Amil', type: 'Aset', fund: 'Dana Amil', desc: 'Hak amil operasional (maksimal 12.5% dari zakat dan bagian infak)' },
  { code: '3401', name: 'Kas & Setara Kas - Dana Non-Halal', type: 'Aset', fund: 'Dana Non-Halal', desc: 'Bunga bank konvensional atau jasa giro untuk kemaslahatan umum' },
  { code: '4101', name: 'Penerimaan Zakat Fitrah', type: 'Pendapatan', fund: 'Dana Zakat', desc: 'Penerimaan zakat fitrah jiwa Ramadhan' },
  { code: '4102', name: 'Penerimaan Zakat Penghasilan / Profesi', type: 'Pendapatan', fund: 'Dana Zakat', desc: 'Pemotongan zakat gaji ASN Kemenag & TPG' },
  { code: '4103', name: 'Penerimaan Zakat Mal Lainnya', type: 'Pendapatan', fund: 'Dana Zakat', desc: 'Zakat perniagaan, emas, dan tabungan' },
  { code: '4201', name: 'Penerimaan Infak / Sedekah Terikat', type: 'Pendapatan', fund: 'Dana Infak', desc: 'Infak donatur untuk program spesifik' },
  { code: '4202', name: 'Penerimaan Infak / Sedekah Tidak Terikat', type: 'Pendapatan', fund: 'Dana Infak', desc: 'Infak kotak amal dan insidental' },
  { code: '5101', name: 'Penyaluran Zakat Asnaf Fakir', type: 'Penyaluran', fund: 'Dana Zakat', desc: 'Bantuan santunan fakir' },
  { code: '5102', name: 'Penyaluran Zakat Asnaf Miskin', type: 'Penyaluran', fund: 'Dana Zakat', desc: 'Bantuan sembako dan biaya hidup dhuafa' },
  { code: '5103', name: 'Penyaluran Zakat Asnaf Fisabilillah', type: 'Penyaluran', fund: 'Dana Zakat', desc: 'Beasiswa pendidikan santri, guru ngaji' },
  { code: '5104', name: 'Penyaluran Zakat Asnaf Muallaf & Lainnya', type: 'Penyaluran', fund: 'Dana Zakat', desc: 'Pemberdayaan dan pembinaan muallaf' },
  { code: '5201', name: 'Penyaluran Infak Terikat Program', type: 'Penyaluran', fund: 'Dana Infak', desc: 'Realisasi program infak' },
  { code: '5301', name: 'Beban Operasional & Administrasi Amil', type: 'Beban Amil', fund: 'Dana Amil', desc: 'Transport sosialisasi, ATK, operasional kantor' },
];

export default function ChartOfAccounts() {
  return (
    <div>
      <div className="section-header">
        <div>
          <h3>Bagan Akun Standar (Chart of Accounts) PSAK 109</h3>
          <p>Daftar kode akun akuntansi syariah standar pelaporan UPZ Kemenag</p>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>KODE AKUN</th>
                <th>NAMA AKUN</th>
                <th>KLASIFIKASI</th>
                <th>KELOMPOK DANA</th>
                <th>DESKRIPSI & PERUNTUKAN</th>
              </tr>
            </thead>
            <tbody>
              {COA_DATA.map(item => (
                <tr key={item.code}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-blue)', fontSize: '13px' }}>
                      {item.code}
                    </span>
                  </td>
                  <td><strong>{item.name}</strong></td>
                  <td>
                    <span className={`badge ${item.type === 'Aset' ? 'badge-blue' : item.type === 'Pendapatan' ? 'badge-green' : item.type === 'Beban Amil' ? 'badge-orange' : 'badge-purple'}`}>
                      {item.type}
                    </span>
                  </td>
                  <td>{item.fund}</td>
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
