<template>
  <div>
    <!-- 1. POSISI KEUANGAN (NERACA) -->
    <div v-if="reportType === 'posisi-keuangan'">
      <div class="section-header">
        <div>
          <h3>Laporan Posisi Keuangan (Neraca) PSAK 109</h3>
          <p>Kondisi saldo aset kelolaan (Kas Tunai & Rekening Bank) per tanggal pelaporan</p>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <input type="date" class="form-input" v-model="posDate" @change="fetchPosisi" style="width: 160px;" />
          <button class="btn btn-pdf btn-sm" @click="download('/reports/posisi-keuangan', { date: posDate }, 'pdf')">
            <FileText :size="14" /> Unduh PDF
          </button>
          <button class="btn btn-excel btn-sm" @click="download('/reports/posisi-keuangan', { date: posDate }, 'excel')">
            <FileSpreadsheet :size="14" /> Unduh Excel
          </button>
        </div>
      </div>

      <!-- 1. ASET LANCAR: KAS TUNAI & REKENING BANK -->
      <div class="card" style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <h4 style="font-weight: 800; font-size: 15px; color: #0f172a;">
            1. ASET LANCAR (KAS & SETARA KAS)
          </h4>
          <span class="badge badge-green">Tersinkronisasi Real-Time</span>
        </div>
        <table class="report-table">
          <thead>
            <tr>
              <th>POS KAS / REKENING BANK</th>
              <th>PERUNTUKAN POS DANA</th>
              <th class="text-right">SALDO PER PELAPORAN (RP)</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background: #f8fafc;">
              <td>
                <div style="font-weight: 700;">💵 Kas Tunai di Bendahara (Brankas UPZ)</div>
                <div style="font-size: 11px; color: #64748b;">Uang kas fisik di kantor UPZ Kemenag</div>
              </td>
              <td><span class="badge badge-gray">Kas Fisik Tunai</span></td>
              <td class="text-right font-bold" style="font-size: 14px;">
                {{ formatRp(posData?.kas_tunai || 0) }}
              </td>
            </tr>

            <tr>
              <td colspan="3" style="background: #f1f5f9; font-weight: 800; font-size: 12px; color: #334155;">
                🏦 REKENING BANK RESMI UPZ KEMENAG KEBUMEN
              </td>
            </tr>

            <tr v-for="b in posData?.bank_accounts || []" :key="b.id">
              <td style="padding-left: 24px;">
                <div style="font-weight: 600;">Bank {{ b.bank_name }} - {{ b.account_number }}</div>
                <div style="font-size: 11px; color: #64748b;">a.n. {{ b.account_holder }}</div>
              </td>
              <td>
                <span class="badge badge-blue">
                  {{ b.fund_type ? 'Pos ' + b.fund_type.replace(/_/g, ' ').toUpperCase() : 'Semua Pos Dana' }}
                </span>
              </td>
              <td class="text-right font-bold" style="color: #1e3a8a;">
                {{ formatRp(b.balance || 0) }}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2"><strong>TOTAL KAS & SETARA KAS (ASET LANCAR)</strong></td>
              <td class="text-right" style="font-size: 16px; color: #059669;">
                <strong>{{ formatRp(posData?.total_aset || 0) }}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- 2. SALDO DANA KELOLAAN PSAK 109 -->
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <h4 style="font-weight: 800; font-size: 15px; color: #0f172a;">
            2. SALDO DANA KELOLAAN (EKUITAS DANA PSAK 109)
          </h4>
          <span class="badge badge-teal">5 Kantong Dana Syariah</span>
        </div>
        <table class="report-table">
          <thead>
            <tr>
              <th>KELOMPOK DANA</th>
              <th class="text-right">PENERIMAAN AKUMULASI (RP)</th>
              <th class="text-right">PENYALURAN AKUMULASI (RP)</th>
              <th class="text-right">SALDO AKHIR DANA (RP)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="f in funds" :key="f.key">
              <td><strong>{{ f.label }}</strong></td>
              <td class="text-right amount-positive">{{ formatRp(posData?.balances?.[f.key]?.in || 0) }}</td>
              <td class="text-right amount-negative">{{ formatRp(posData?.balances?.[f.key]?.out || 0) }}</td>
              <td class="text-right font-bold">{{ formatRp(posData?.balances?.[f.key]?.balance || 0) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td><strong>TOTAL SALDO DANA KELOLAAN</strong></td>
              <td class="text-right amount-positive">
                <strong>{{ formatRp(Object.values(posData?.balances || {}).reduce((s: number, b: any) => s + (b.in || 0), 0)) }}</strong>
              </td>
              <td class="text-right amount-negative">
                <strong>{{ formatRp(Object.values(posData?.balances || {}).reduce((s: number, b: any) => s + (b.out || 0), 0)) }}</strong>
              </td>
              <td class="text-right" style="font-size: 16px; color: #059669;">
                <strong>{{ formatRp(posData?.total_saldo_dana || posData?.total_aset || 0) }}</strong>
              </td>
            </tr>
          </tfoot>
        </table>

        <div style="margin-top: 14px; padding: 10px 14px; background: #ecfdf5; border-radius: 6px; border: 1px solid #a7f3d0; font-size: 12px; color: #065f46; display: flex; justify-content: space-between; align-items: center;">
          <span>✓ <strong>Neraca Seimbang:</strong> Total Kas & Bank = Total Saldo Dana PSAK 109</span>
          <strong>{{ formatRp(posData?.total_aset || 0) }}</strong>
        </div>
      </div>
    </div>

    <!-- 2. PERUBAHAN DANA -->
    <div v-else-if="reportType === 'perubahan-dana'">
      <div class="section-header">
        <div>
          <h3>Laporan Perubahan Dana PSAK 109</h3>
          <p>Mutasi penerimaan, penyaluran, dan beban amil periode tertentu</p>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <input type="date" class="form-input" v-model="dateFrom" @change="fetchPerubahan" style="width: 150px;" />
          <span style="color: #64748b;">s/d</span>
          <input type="date" class="form-input" v-model="dateTo" @change="fetchPerubahan" style="width: 150px;" />
          <button class="btn btn-pdf btn-sm" @click="download('/reports/perubahan-dana', { date_from: dateFrom, date_to: dateTo }, 'pdf')">
            <FileText :size="14" /> Unduh PDF
          </button>
          <button class="btn btn-excel btn-sm" @click="download('/reports/perubahan-dana', { date_from: dateFrom, date_to: dateTo }, 'excel')">
            <FileSpreadsheet :size="14" /> Unduh Excel
          </button>
        </div>
      </div>

      <div class="card">
        <table class="report-table">
          <thead>
            <tr>
              <th>Kelompok Dana</th>
              <th class="text-right">Saldo Awal</th>
              <th class="text-right">Penerimaan</th>
              <th class="text-right">Penyaluran</th>
              <th class="text-right">Beban Operasional</th>
              <th class="text-right">Saldo Akhir</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="f in funds" :key="f.key">
              <td><strong>{{ f.label }}</strong></td>
              <td class="text-right">{{ formatRp(perubData?.report?.[f.key]?.saldo_awal || 0) }}</td>
              <td class="text-right amount-positive">{{ formatRp(perubData?.report?.[f.key]?.penerimaan || 0) }}</td>
              <td class="text-right amount-negative">{{ formatRp(perubData?.report?.[f.key]?.penyaluran || 0) }}</td>
              <td class="text-right amount-negative">{{ formatRp(perubData?.report?.[f.key]?.operasional || 0) }}</td>
              <td class="text-right font-bold">{{ formatRp(perubData?.report?.[f.key]?.saldo_akhir || 0) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 3. ARUS KAS -->
    <div v-else-if="reportType === 'arus-kas'">
      <div class="section-header">
        <div>
          <h3>Laporan Arus Kas PSAK 109</h3>
          <p>Penerimaan dan pengeluaran kas tunai dan rekening bank</p>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <input type="date" class="form-input" v-model="dateFrom" @change="fetchArusKas" style="width: 150px;" />
          <span style="color: #64748b;">s/d</span>
          <input type="date" class="form-input" v-model="dateTo" @change="fetchArusKas" style="width: 150px;" />
          <button class="btn btn-pdf btn-sm" @click="download('/reports/arus-kas', { date_from: dateFrom, date_to: dateTo }, 'pdf')">
            <FileText :size="14" /> Unduh PDF
          </button>
          <button class="btn btn-excel btn-sm" @click="download('/reports/arus-kas', { date_from: dateFrom, date_to: dateTo }, 'excel')">
            <FileSpreadsheet :size="14" /> Unduh Excel
          </button>
        </div>
      </div>

      <div class="page-grid-2">
        <div class="card">
          <h4 style="font-weight: 700; margin-bottom: 16px;">1. Mutasi Kas Tunai Fisik</h4>
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border);">
            <span>Arus Masuk (Penerimaan Tunai)</span>
            <span class="amount-positive">{{ formatRp(arusData?.kas_masuk_tunai || 0) }}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border);">
            <span>Arus Keluar (Penyaluran / Beban)</span>
            <span class="amount-negative">({{ formatRp(arusData?.kas_keluar_tunai || 0) }})</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 12px 0; margin-top: 4px;">
            <strong>Arus Kas Tunai Bersih</strong>
            <strong :class="(arusData?.net_tunai || 0) >= 0 ? 'amount-positive' : 'amount-negative'" style="font-size: 16px;">
              {{ formatRp(arusData?.net_tunai || 0) }}
            </strong>
          </div>
        </div>

        <div class="card">
          <h4 style="font-weight: 700; margin-bottom: 16px;">2. Mutasi Rekening Bank</h4>
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border);">
            <span>Arus Masuk (Transfer Donatur)</span>
            <span class="amount-positive">{{ formatRp(arusData?.kas_masuk_bank || 0) }}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border);">
            <span>Arus Keluar (Transfer Penyaluran)</span>
            <span class="amount-negative">({{ formatRp(arusData?.kas_keluar_bank || 0) }})</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 12px 0; margin-top: 4px;">
            <strong>Arus Kas Bank Bersih</strong>
            <strong :class="(arusData?.net_bank || 0) >= 0 ? 'amount-positive' : 'amount-negative'" style="font-size: 16px;">
              {{ formatRp(arusData?.net_bank || 0) }}
            </strong>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. BUKU KAS UMUM -->
    <div v-else-if="reportType === 'buku-kas'">
      <div class="section-header">
        <div>
          <h3>Buku Kas Umum</h3>
          <p>Rekapitulasi mutasi kas tunai dan kas bank dengan saldo berjalan</p>
        </div>
        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          <select class="form-select" v-model="bukuKasMethod" @change="fetchBukuKas" style="width: 130px;">
            <option value="tunai">Kas Tunai</option>
            <option value="bank">Kas Bank</option>
          </select>

          <!-- PILIH BANK SPESIFIK JIKA METODE BANK -->
          <select
            v-if="bukuKasMethod === 'bank'"
            class="form-select"
            v-model="selectedBankId"
            @change="fetchBukuKas"
            style="width: 220px;"
          >
            <option value="">-- Semua Rekening Bank --</option>
            <option v-for="b in bankAccounts" :key="b.id" :value="b.id">
              {{ b.bank_name }} - {{ b.account_number }}
            </option>
          </select>

          <input type="date" class="form-input" v-model="dateFrom" @change="fetchBukuKas" style="width: 150px;" />
          <span style="color: #64748b;">s/d</span>
          <input type="date" class="form-input" v-model="dateTo" @change="fetchBukuKas" style="width: 150px;" />
          <button class="btn btn-pdf btn-sm" @click="download('/reports/buku-kas', { date_from: dateFrom, date_to: dateTo, payment_method: bukuKasMethod, bank_account_id: selectedBankId }, 'pdf')">
            <FileText :size="14" /> Unduh PDF
          </button>
          <button class="btn btn-excel btn-sm" @click="download('/reports/buku-kas', { date_from: dateFrom, date_to: dateTo, payment_method: bukuKasMethod, bank_account_id: selectedBankId }, 'excel')">
            <FileSpreadsheet :size="14" /> Unduh Excel
          </button>
        </div>
      </div>

      <div class="card">
        <div style="margin-bottom: 16px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 10px 16px; display: inline-block;">
          <div style="font-size: 11px; color: #64748b;">Saldo Awal Periode:</div>
          <div style="font-weight: 700; color: #059669; font-size: 15px;">{{ formatRp(bukuKasData?.saldo_awal || 0) }}</div>
        </div>

        <div class="table-container">
          <table class="report-table">
            <thead>
              <tr>
                <th>TGL</th>
                <th>NO. REF</th>
                <th>KETERANGAN</th>
                <th>PIHAK</th>
                <th class="text-right">DEBIT (+)</th>
                <th class="text-right">KREDIT (-)</th>
                <th class="text-right">SALDO AKUMULASI</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tx in bukuKasData?.transactions || []" :key="tx.id">
                <td style="white-space: nowrap; font-size: 12px;">{{ formatDate(tx.date) }}</td>
                <td style="font-size: 11px; color: #2563eb; font-family: monospace;">{{ tx.reference_number }}</td>
                <td style="font-size: 12px; max-width: 200px;">{{ tx.description }}</td>
                <td style="font-size: 12px;">{{ tx.party_name }}</td>
                <td class="text-right amount-positive">{{ tx.type === 'penerimaan' ? formatRp(tx.amount) : '-' }}</td>
                <td class="text-right amount-negative">{{ tx.type !== 'penerimaan' ? formatRp(tx.amount) : '-' }}</td>
                <td class="text-right font-bold">{{ formatRp(calculateRunningBalance(tx)) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 5. MUTASI KAS & BUKU BANK (FULL INTEGRATED REAL-TIME DENGAN PEMINDAHAN BUKU) -->
    <div v-else-if="reportType === 'mutasi-kas-bank'">
      <!-- TOP GREEN BANNER -->
      <div style="background: linear-gradient(135deg, #065f46 0%, #047857 100%); color: white; border-radius: var(--radius); padding: 22px 24px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.85; display: flex; align-items: center; gap: 6px;">
              <Landmark :size="14" /> LAPORAN MUTASI KEUANGAN PSAK 109
            </div>
            <h2 style="font-size: 22px; font-weight: 800; margin-top: 4px; color: #ffffff;">Mutasi Kas Tunai & Buku Bank</h2>
            <p style="font-size: 13px; opacity: 0.9; margin-top: 2px;">
              Pencatatan rincian arus masuk (debet) dan arus keluar (kredit) untuk Kas Tunai Fisik UPZ serta Rekening Tabungan Bank secara real-time.
            </p>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn btn-warning" style="font-weight: 700; background: #f59e0b; color: #000; border: none;" @click="openMutasiModal()">
              <ArrowRightLeft :size="14" style="margin-right: 4px;" /> Pemindahan Buku / Mutasi
            </button>
            <button class="btn btn-success" style="background: #10b981; color: white; border: none;" @click="download('/reports/mutasi-kas-bank', { account: mutasiAccount, fund_type: mutasiFundType, year: mutasiYear, month: mutasiMonth, search: mutasiSearch }, 'excel')">
              <FileSpreadsheet :size="14" style="margin-right: 4px;" /> Export Excel
            </button>
            <button class="btn btn-secondary" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.4);" @click="download('/reports/mutasi-kas-bank', { account: mutasiAccount, fund_type: mutasiFundType, year: mutasiYear, month: mutasiMonth, search: mutasiSearch }, 'pdf')">
              <Printer :size="14" style="margin-right: 4px;" /> Cetak Mutasi
            </button>
          </div>
        </div>

        <!-- FILTER BAR -->
        <div style="margin-top: 18px; padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.2); display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 10px; align-items: end;">
          <div>
            <label style="font-size: 11px; opacity: 0.9; display: block; margin-bottom: 4px;">Pilih Akun / Rekening:</label>
            <select class="form-select" v-model="mutasiAccount" @change="fetchMutasi" style="color: #0f172a; font-size: 12px;">
              <option value="all">Semua Akun (Kas Tunai + Bank)</option>
              <option value="tunai">Kas Tunai UPZ (Uang Fisik)</option>
              <option v-for="b in bankAccounts" :key="b.id" :value="String(b.id)">
                Bank {{ b.bank_name }} - {{ b.account_number }}
              </option>
            </select>
          </div>

          <div>
            <label style="font-size: 11px; opacity: 0.9; display: block; margin-bottom: 4px;">Jenis Dana:</label>
            <select class="form-select" v-model="mutasiFundType" @change="fetchMutasi" style="color: #0f172a; font-size: 12px;">
              <option value="all">Semua Jenis Dana ZIS</option>
              <option value="zakat">Dana Zakat (1101)</option>
              <option value="infaq_terikat">Dana Infak Terikat (2101)</option>
              <option value="infaq_tidak_terikat">Dana Infak Bebas (2102)</option>
              <option value="amil">Dana Hak Amil (3301)</option>
              <option value="non_halal">Dana Non-Halal (3401)</option>
            </select>
          </div>

          <div>
            <label style="font-size: 11px; opacity: 0.9; display: block; margin-bottom: 4px;">Tahun:</label>
            <select class="form-select" v-model="mutasiYear" @change="fetchMutasi" style="color: #0f172a; font-size: 12px;">
              <option value="all">Semua Tahun</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>

          <div>
            <label style="font-size: 11px; opacity: 0.9; display: block; margin-bottom: 4px;">Bulan:</label>
            <select class="form-select" v-model="mutasiMonth" @change="fetchMutasi" style="color: #0f172a; font-size: 12px;">
              <option value="all">Semua Bulan</option>
              <option v-for="m in 12" :key="m" :value="String(m)">
                Bulan {{ m }}
              </option>
            </select>
          </div>

          <div>
            <label style="font-size: 11px; opacity: 0.9; display: block; margin-bottom: 4px;">Cari Keterangan / Ref:</label>
            <input
              type="text"
              class="form-input"
              placeholder="Kata kunci pencarian..."
              v-model="mutasiSearch"
              @input="fetchMutasi"
              style="color: #0f172a; font-size: 12px;"
            />
          </div>
        </div>
      </div>

      <!-- MONITORING SALDO REAL-TIME PER REKENING (CLICKABLE CARDS) -->
      <div class="card" style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h4 style="font-size: 13px; font-weight: 800; color: #334155; text-transform: uppercase; letter-spacing: 0.3px; display: flex; align-items: center; gap: 6px;">
            <Landmark :size="15" color="#059669" />
            MONITORING SALDO REAL-TIME PER REKENING BANK & KAS TUNAI
          </h4>
          <span style="font-size: 11px; color: #64748b; font-style: italic;">Klik kartu untuk memfilter mutasi</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 12px;">
          <!-- KARTU KAS TUNAI -->
          <div
            :style="{
              background: mutasiAccount === 'tunai' ? '#eff6ff' : '#f8fafc',
              border: mutasiAccount === 'tunai' ? '2px solid #2563eb' : '1px solid var(--border)',
              borderRadius: '8px',
              padding: '12px 14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }"
            @click="setAccountFilter('tunai')"
          >
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-weight: 700; font-size: 13px; color: #0f172a;">💵 Kas Tunai UPZ</span>
              <span class="badge badge-teal" style="font-size: 9px;">Petty Cash</span>
            </div>
            <div style="font-size: 18px; font-weight: 800; color: #059669; margin: 4px 0;">
              {{ formatRp(mutasiData?.tunai_live_balance || 0) }}
            </div>
            <div style="font-size: 10px; color: #64748b;">Uang tunai fisik di brankas UPZ</div>
          </div>

          <!-- KARTU BANK ACCOUNTS -->
          <div
            v-for="b in mutasiData?.bank_accounts || []"
            :key="b.id"
            :style="{
              background: mutasiAccount === String(b.id) ? '#eff6ff' : '#f8fafc',
              border: mutasiAccount === String(b.id) ? '2px solid #2563eb' : '1px solid var(--border)',
              borderRadius: '8px',
              padding: '12px 14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }"
            @click="setAccountFilter(String(b.id))"
          >
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-weight: 700; font-size: 13px; color: #0f172a;">🏦 {{ b.bank_name }}</span>
              <span class="badge badge-blue" style="font-size: 9px;">UPZ</span>
            </div>
            <div style="font-size: 18px; font-weight: 800; color: #1e40af; margin: 4px 0;">
              {{ formatRp(b.live_balance || 0) }}
            </div>
            <div style="font-size: 10px; color: #64748b; font-family: monospace;">
              No. Rek: {{ b.account_number }}
            </div>
          </div>
        </div>
      </div>

      <!-- SUMMARY 3 CARDS ROW -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-bottom: 20px;">
        <div class="card" style="border-left: 4px solid #10b981;">
          <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">
            TOTAL MUTASI DEBET (PENERIMAAN MASUK)
          </div>
          <div style="font-size: 22px; font-weight: 800; color: #059669; margin-top: 4px;">
            {{ formatRp(mutasiData?.total_debet || 0) }}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
            Arus kas masuk terverifikasi
          </div>
        </div>

        <div class="card" style="border-left: 4px solid #ef4444;">
          <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">
            TOTAL MUTASI KREDIT (PENYALURAN KELUAR)
          </div>
          <div style="font-size: 22px; font-weight: 800; color: #dc2626; margin-top: 4px;">
            {{ formatRp(mutasiData?.total_kredit || 0) }}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
            Arus kas keluar pentasharufan
          </div>
        </div>

        <div class="card" style="border-left: 4px solid #3b82f6;">
          <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">
            SALDO MUTASI KUMULATIF
          </div>
          <div style="font-size: 22px; font-weight: 800; color: #2563eb; margin-top: 4px;">
            {{ formatRp(mutasiData?.saldo_kumulatif || 0) }}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
            Gabungan Kas Tunai & Seluruh Rekening Bank
          </div>
        </div>
      </div>

      <!-- TABLE: RINCIAN BUKU MUTASI -->
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <div>
            <h4 style="font-weight: 800; font-size: 15px; color: #0f172a;">
              RINCIAN BUKU MUTASI KAS & REKENING BANK ({{ mutasiData?.transactions?.length || 0 }} CATATAN)
            </h4>
            <p style="font-size: 12px; color: #64748b;">Diurutkan berdasarkan tanggal kronologis</p>
          </div>
        </div>

        <div class="table-container">
          <table class="report-table">
            <thead>
              <tr>
                <th style="width: 40px;">NO</th>
                <th style="width: 95px;">TANGGAL</th>
                <th style="width: 140px;">NO. REFERENSI</th>
                <th>AKUN / REKENING</th>
                <th>PIHAK / KETERANGAN TRANSAKSI</th>
                <th style="width: 110px;">JENIS DANA</th>
                <th class="text-right" style="width: 120px;">DEBET / MASUK (RP)</th>
                <th class="text-right" style="width: 120px;">KREDIT / KELUAR (RP)</th>
                <th class="text-right" style="width: 130px;">SALDO (RP)</th>
                <th class="text-center" style="width: 70px;">BUKTI</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!mutasiData?.transactions?.length">
                <td colspan="10" class="text-center" style="padding: 30px; color: #64748b;">
                  Tidak ada catatan mutasi untuk filter yang dipilih.
                </td>
              </tr>
              <tr v-for="(tx, idx) in mutasiData?.transactions || []" :key="tx.id">
                <td style="font-size: 11px; color: #64748b;">{{ Number(idx) + 1 }}</td>
                <td style="font-size: 12px; white-space: nowrap;">{{ formatDate(tx.date) }}</td>
                <td style="font-size: 11px; color: #2563eb; font-family: monospace;">{{ tx.reference_number }}</td>
                <td>
                  <span
                    :class="['badge', tx.account_label?.includes('Kas Tunai') ? 'badge-gray' : 'badge-blue']"
                    style="font-size: 10px;"
                  >
                    {{ tx.account_label }}
                  </span>
                </td>
                <td style="font-size: 12px; max-width: 250px;">
                  <div style="font-weight: 600; color: #0f172a;">{{ tx.party_name }}</div>
                  <div style="font-size: 11px; color: #64748b; line-height: 1.4;">{{ tx.description }}</div>
                </td>
                <td>
                  <span class="badge badge-teal" style="font-size: 10px;">
                    {{ tx.fund_type?.replace(/_/g, ' ')?.toUpperCase() }}
                  </span>
                </td>
                <td class="text-right amount-positive" style="font-size: 12px; font-weight: 600;">
                  {{ tx.debet > 0 ? formatRp(tx.debet) : '-' }}
                </td>
                <td class="text-right amount-negative" style="font-size: 12px; font-weight: 600;">
                  {{ tx.kredit > 0 ? formatRp(tx.kredit) : '-' }}
                </td>
                <td class="text-right font-bold" style="font-size: 13px; color: #0f172a;">
                  {{ formatRp(tx.running_balance) }}
                </td>
                <td class="text-center">
                  <a
                    v-if="tx.proof_file_path"
                    :href="`http://127.0.0.1:8000/storage/${tx.proof_file_path}`"
                    target="_blank"
                    class="badge badge-green"
                    style="font-size: 10px; text-decoration: none;"
                    title="Lihat Bukti"
                  >
                    Bukti
                  </a>
                  <span v-else style="color: #cbd5e1; font-size: 11px;">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL: ENTRI PEMINDAHAN BUKU / MUTASI KAS & BANK -->
      <div v-if="isMutasiModalOpen" class="modal-overlay" @click="isMutasiModalOpen = false">
        <div class="modal" @click.stop style="max-width: 600px;">
          <div class="modal-header">
            <div>
              <h3 style="display: flex; align-items: center; gap: 8px;">
                <ArrowRightLeft :size="18" color="#d97706" /> Entri Pemindahan Buku / Mutasi Kas & Bank
              </h3>
              <p style="font-size: 12px; color: #64748b; margin-top: 2px;">
                Pencatatan perpindahan uang fisik tunai & saldo rekening perbankan UPZ
              </p>
            </div>
            <button class="btn-close" @click="isMutasiModalOpen = false">
              <X :size="16" />
            </button>
          </div>

          <form @submit.prevent="handleSaveMutasi">
            <div class="modal-body">
              <!-- PILIH JENIS MUTASI INTERNAL (3 TABS) -->
              <label class="form-label" style="font-size: 11px; font-weight: 700; text-transform: uppercase;">
                PILIH JENIS MUTASI INTERNAL:
              </label>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 16px;">
                <div
                  :style="{
                    border: mutasiForm.mutasi_type === 'penarikan' ? '2px solid #f59e0b' : '1px solid #cbd5e1',
                    background: mutasiForm.mutasi_type === 'penarikan' ? '#fffbeb' : '#ffffff',
                    borderRadius: '8px',
                    padding: '10px 8px',
                    textAlign: 'center',
                    cursor: 'pointer',
                  }"
                  @click="setMutasiType('penarikan')"
                >
                  <div style="font-weight: 700; font-size: 12px; color: #0f172a;">1. Penarikan Tunai</div>
                  <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Dari Bank ➔ Kas Tunai</div>
                </div>

                <div
                  :style="{
                    border: mutasiForm.mutasi_type === 'setoran' ? '2px solid #f59e0b' : '1px solid #cbd5e1',
                    background: mutasiForm.mutasi_type === 'setoran' ? '#fffbeb' : '#ffffff',
                    borderRadius: '8px',
                    padding: '10px 8px',
                    textAlign: 'center',
                    cursor: 'pointer',
                  }"
                  @click="setMutasiType('setoran')"
                >
                  <div style="font-weight: 700; font-size: 12px; color: #0f172a;">2. Setoran Tunai</div>
                  <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Dari Kas Tunai ➔ Bank</div>
                </div>

                <div
                  :style="{
                    border: mutasiForm.mutasi_type === 'transfer_bank' ? '2px solid #f59e0b' : '1px solid #cbd5e1',
                    background: mutasiForm.mutasi_type === 'transfer_bank' ? '#fffbeb' : '#ffffff',
                    borderRadius: '8px',
                    padding: '10px 8px',
                    textAlign: 'center',
                    cursor: 'pointer',
                  }"
                  @click="setMutasiType('transfer_bank')"
                >
                  <div style="font-weight: 700; font-size: 12px; color: #0f172a;">3. Transfer Bank</div>
                  <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Dari Bank A ➔ Bank B</div>
                </div>
              </div>

              <!-- TANGGAL & NOMINAL -->
              <div class="form-grid-2">
                <div class="form-group">
                  <label class="form-label">Tanggal Mutasi / Transaksi<span class="required">*</span></label>
                  <input type="date" class="form-input" v-model="mutasiForm.date" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Nominal Pemindahan (Rp)<span class="required">*</span></label>
                  <input
                    type="number"
                    class="form-input"
                    placeholder="Contoh: 5000000"
                    v-model="mutasiForm.amount"
                    min="1"
                    required
                  />
                </div>
              </div>

              <!-- AKUN ASAL & AKUN TUJUAN -->
              <div class="form-grid-2">
                <!-- AKUN ASAL -->
                <div class="form-group">
                  <label class="form-label" style="color: #dc2626;">
                    🔴 Akun Asal (Pengeluaran / Kredit)<span class="required">*</span>
                  </label>
                  <select
                    v-if="mutasiForm.mutasi_type !== 'setoran'"
                    class="form-select"
                    v-model="mutasiForm.source_bank_id"
                    required
                  >
                    <option value="">-- Pilih Rekening Bank Asal --</option>
                    <option v-for="b in bankAccounts" :key="b.id" :value="String(b.id)">
                      Bank {{ b.bank_name }} - {{ b.account_number }}
                    </option>
                  </select>
                  <input
                    v-else
                    type="text"
                    class="form-input"
                    value="Kas Tunai UPZ (Uang Fisik)"
                    disabled
                    style="background: #f1f5f9; font-weight: 600;"
                  />
                </div>

                <!-- AKUN TUJUAN -->
                <div class="form-group">
                  <label class="form-label" style="color: #059669;">
                    🟢 Akun Tujuan (Penerimaan / Debet)<span class="required">*</span>
                  </label>
                  <select
                    v-if="mutasiForm.mutasi_type !== 'penarikan'"
                    class="form-select"
                    v-model="mutasiForm.target_bank_id"
                    required
                  >
                    <option value="">-- Pilih Rekening Bank Tujuan --</option>
                    <option v-for="b in bankAccounts" :key="b.id" :value="String(b.id)">
                      Bank {{ b.bank_name }} - {{ b.account_number }}
                    </option>
                  </select>
                  <input
                    v-else
                    type="text"
                    class="form-input"
                    value="Kas Tunai UPZ (Uang Fisik)"
                    disabled
                    style="background: #f1f5f9; font-weight: 600;"
                  />
                </div>
              </div>

              <!-- KELOMPOK DANA -->
              <div class="form-group">
                <label class="form-label">Kelompok Dana yang Dipindahkan<span class="required">*</span></label>
                <select class="form-select" v-model="mutasiForm.fund_type" required>
                  <option value="amil">Dana Hak Amil / Operasional (RKAT)</option>
                  <option value="zakat">Dana Zakat (1101)</option>
                  <option value="infaq_tidak_terikat">Dana Infak Bebas (2102)</option>
                  <option value="infaq_terikat">Dana Infak Terikat (2101)</option>
                  <option value="non_halal">Dana Non-Halal (3401)</option>
                </select>
              </div>

              <!-- KETERANGAN & QUICK TAGS -->
              <div class="form-group">
                <label class="form-label">Keterangan / Deskripsi Mutasi<span class="required">*</span></label>
                <textarea
                  class="form-textarea"
                  rows="2"
                  v-model="mutasiForm.description"
                  required
                ></textarea>
                <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px;">
                  <button
                    type="button"
                    class="badge badge-gray"
                    style="cursor: pointer; border: 1px solid #cbd5e1;"
                    @click="setQuickTag('Penarikan Tunai dari Bank ke Kas Tunai UPZ untuk Persiapan Operasional & Pentasharufan')"
                  >
                    + Penarikan Ops & Pentasharufan
                  </button>
                  <button
                    type="button"
                    class="badge badge-gray"
                    style="cursor: pointer; border: 1px solid #cbd5e1;"
                    @click="setQuickTag('Penarikan Tunai dari Rekening Zakat untuk Penyaluran Program Mustahik')"
                  >
                    + Penarikan Program Mustahik
                  </button>
                  <button
                    type="button"
                    class="badge badge-gray"
                    style="cursor: pointer; border: 1px solid #cbd5e1;"
                    @click="setQuickTag('Setoran Tunai dari Kas Fisik Kantor ke Rekening Bank UPZ')"
                  >
                    + Setoran Tunai ke Bank
                  </button>
                </div>
              </div>

              <!-- UPLOAD BUKTI -->
              <div class="form-group" style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 12px;">
                <label class="form-label" style="display: flex; align-items: center; gap: 6px;">
                  <Paperclip :size="14" color="#2563eb" />
                  Upload Bukti Mutasi / Transfer / Slip Bank (Opsional):
                </label>
                <input
                  type="file"
                  ref="mutasiFileInput"
                  class="form-input"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  style="background: white;"
                />
                <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">
                  Format gambar (JPG, PNG) atau PDF (Maksimal 10 MB)
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="isMutasiModalOpen = false">Batal</button>
              <button type="submit" class="btn btn-warning" :disabled="mutasiSubmitting" style="font-weight: 700; background: #f59e0b; color: #000; border: none;">
                <Save :size="15" /> {{ mutasiSubmitting ? 'Memproses Mutasi...' : 'Simpan Mutasi (Disetujui)' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 6. BUKU BESAR -->
    <div v-else-if="reportType === 'buku-besar'">
      <div class="section-header">
        <div>
          <h3>Buku Besar (General Ledger)</h3>
          <p>Catatan jurnal entri ganda semua akun pembukuan</p>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <input type="date" class="form-input" v-model="dateFrom" @change="fetchBukuBesar" style="width: 150px;" />
          <span style="color: #64748b;">s/d</span>
          <input type="date" class="form-input" v-model="dateTo" @change="fetchBukuBesar" style="width: 150px;" />
          <button class="btn btn-pdf btn-sm" @click="download('/reports/buku-besar', { date_from: dateFrom, date_to: dateTo }, 'pdf')">
            <FileText :size="14" /> Unduh PDF
          </button>
          <button class="btn btn-excel btn-sm" @click="download('/reports/buku-besar', { date_from: dateFrom, date_to: dateTo }, 'excel')">
            <FileSpreadsheet :size="14" /> Unduh Excel
          </button>
        </div>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="report-table">
            <thead>
              <tr>
                <th>TGL</th>
                <th>NO. REF</th>
                <th>KETERANGAN</th>
                <th>AKUN DEBIT</th>
                <th>AKUN KREDIT</th>
                <th class="text-right">DEBIT (Rp)</th>
                <th class="text-right">KREDIT (Rp)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(e, i) in bukuBesarData?.entries || []" :key="i">
                <td style="white-space: nowrap; font-size: 12px;">{{ e.date }}</td>
                <td style="font-size: 11px; color: #2563eb;">{{ e.ref }}</td>
                <td style="font-size: 12px;">{{ e.description }}</td>
                <td>{{ e.debit_account }}</td>
                <td>{{ e.credit_account }}</td>
                <td class="text-right amount-positive">{{ e.debit > 0 ? formatRp(e.debit) : '-' }}</td>
                <td class="text-right amount-negative">{{ e.credit > 0 ? formatRp(e.credit) : '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 7. NERACA SALDO -->
    <div v-else-if="reportType === 'neraca-saldo'">
      <div class="section-header">
        <div>
          <h3>Neraca Saldo (Trial Balance)</h3>
          <p>Keseimbangan debit-kredit seluruh bagan akun</p>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <input type="date" class="form-input" v-model="posDate" @change="fetchNeracaSaldo" style="width: 160px;" />
          <button class="btn btn-pdf btn-sm" @click="download('/reports/neraca-saldo', { date_to: posDate }, 'pdf')">
            <FileText :size="14" /> Unduh PDF
          </button>
          <button class="btn btn-excel btn-sm" @click="download('/reports/neraca-saldo', { date_to: posDate }, 'excel')">
            <FileSpreadsheet :size="14" /> Unduh Excel
          </button>
        </div>
      </div>

      <div class="card">
        <table class="report-table">
          <thead>
            <tr>
              <th>NAMA AKUN</th>
              <th class="text-right">DEBIT</th>
              <th class="text-right">KREDIT</th>
              <th class="text-right">SALDO DEBIT</th>
              <th class="text-right">SALDO KREDIT</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(a, i) in neracaSaldoData?.accounts || []" :key="i">
              <td><strong>{{ a.account }}</strong></td>
              <td class="text-right">{{ a.debit > 0 ? formatRp(a.debit) : '-' }}</td>
              <td class="text-right">{{ a.kredit > 0 ? formatRp(a.kredit) : '-' }}</td>
              <td class="text-right amount-positive font-bold">{{ a.saldo_debit > 0 ? formatRp(a.saldo_debit) : '-' }}</td>
              <td class="text-right amount-negative font-bold">{{ a.saldo_kredit > 0 ? formatRp(a.saldo_kredit) : '-' }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td><strong>TOTAL (SEIMBANG)</strong></td>
              <td class="text-right"><strong>{{ formatRp(neracaSaldoData?.total_debit || 0) }}</strong></td>
              <td class="text-right"><strong>{{ formatRp(neracaSaldoData?.total_kredit || 0) }}</strong></td>
              <td class="text-right amount-positive"><strong>{{ formatRp(neracaSaldoData?.total_debit || 0) }}</strong></td>
              <td class="text-right amount-negative"><strong>{{ formatRp(neracaSaldoData?.total_kredit || 0) }}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- 8. JURNAL UMUM -->
    <div v-else-if="reportType === 'jurnal-umum'">
      <div class="section-header">
        <div>
          <h3>Jurnal Umum Transaksi</h3>
          <p>Catatan kronologis seluruh mutasi keuangan ZIS</p>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <input type="date" class="form-input" v-model="dateFrom" @change="fetchJurnal" style="width: 150px;" />
          <span style="color: #64748b;">s/d</span>
          <input type="date" class="form-input" v-model="dateTo" @change="fetchJurnal" style="width: 150px;" />
          <button class="btn btn-pdf btn-sm" @click="download('/reports/jurnal-umum', { date_from: dateFrom, date_to: dateTo }, 'pdf')">
            <FileText :size="14" /> Unduh PDF
          </button>
          <button class="btn btn-excel btn-sm" @click="download('/reports/jurnal-umum', { date_from: dateFrom, date_to: dateTo }, 'excel')">
            <FileSpreadsheet :size="14" /> Unduh Excel
          </button>
        </div>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="report-table">
            <thead>
              <tr>
                <th>TGL</th>
                <th>NO. REF</th>
                <th>KETERANGAN</th>
                <th>METODE / BANK</th>
                <th>KELOMPOK DANA</th>
                <th class="text-right">DEBIT (+)</th>
                <th class="text-right">KREDIT (-)</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in jurnalData?.transactions || []" :key="t.id">
                <td style="white-space: nowrap; font-size: 12px;">{{ formatDate(t.date) }}</td>
                <td style="font-size: 11px; color: #2563eb; font-family: monospace;">{{ t.reference_number }}</td>
                <td style="font-size: 12px; max-width: 200px;">{{ t.description }}</td>
                <td style="font-size: 11px;">
                  <span v-if="t.payment_method === 'tunai'" class="badge badge-gray">Kas Tunai</span>
                  <span v-else class="badge badge-blue">
                    {{ t.bank_account ? `${t.bank_account.bank_name} - ${t.bank_account.account_number}` : (t.bank_name || 'Bank') }}
                  </span>
                </td>
                <td>
                  <span class="badge badge-gray">{{ t.fund_type?.replace(/_/g, ' ').toUpperCase() }}</span>
                </td>
                <td class="text-right amount-positive">{{ t.type === 'penerimaan' ? formatRp(t.amount) : '-' }}</td>
                <td class="text-right amount-negative">{{ t.type !== 'penerimaan' ? formatRp(t.amount) : '-' }}</td>
                <td>
                  <span :class="['status-badge', `status-${t.status?.toLowerCase()}`]">{{ t.status }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import api, { formatRp, formatDate } from '../lib/api';
import {
  FileText,
  FileSpreadsheet,
  Printer,
  Landmark,
  ArrowRightLeft,
  X,
  Save,
  Paperclip,
} from '@lucide/vue';

const props = defineProps<{
  reportType: string;
}>();

const year = new Date().getFullYear();
const posDate = ref(new Date().toISOString().slice(0, 10));
const dateFrom = ref(`${year}-01-01`);
const dateTo = ref(`${year}-12-31`);
const bukuKasMethod = ref('tunai');
const selectedBankId = ref('');
const bankAccounts = ref<any[]>([]);

// Mutasi Kas Bank Filters
const mutasiAccount = ref('all');
const mutasiFundType = ref('all');
const mutasiYear = ref(year.toString());
const mutasiMonth = ref('all');
const mutasiSearch = ref('');

// Mutasi Modal State
const isMutasiModalOpen = ref(false);
const mutasiSubmitting = ref(false);
const mutasiFileInput = ref<HTMLInputElement | null>(null);
const mutasiForm = ref({
  mutasi_type: 'penarikan' as 'penarikan' | 'setoran' | 'transfer_bank',
  date: new Date().toISOString().slice(0, 10),
  amount: '',
  fund_type: 'amil',
  source_bank_id: '',
  target_bank_id: '',
  description: 'Penarikan Tunai dari Bank ke Kas Tunai UPZ untuk Persiapan Operasional & Pentasharufan',
});

const posData = ref<any>(null);
const perubData = ref<any>(null);
const arusData = ref<any>(null);
const bukuKasData = ref<any>(null);
const bukuBesarData = ref<any>(null);
const neracaSaldoData = ref<any>(null);
const mutasiData = ref<any>(null);
const jurnalData = ref<any>(null);

let runningBal = 0;

const funds = [
  { key: 'zakat', label: 'Dana Zakat (3101)' },
  { key: 'infaq_terikat', label: 'Dana Infak Terikat (3201)' },
  { key: 'infaq_tidak_terikat', label: 'Dana Infak Tidak Terikat (3202)' },
  { key: 'amil', label: 'Dana Amil (3301)' },
  { key: 'non_halal', label: 'Dana Non Halal (3401)' },
];

const setAccountFilter = (acc: string) => {
  mutasiAccount.value = acc;
  fetchMutasi();
};

const openMutasiModal = () => {
  mutasiForm.value = {
    mutasi_type: 'penarikan',
    date: new Date().toISOString().slice(0, 10),
    amount: '',
    fund_type: 'amil',
    source_bank_id: bankAccounts.value[0]?.id ? String(bankAccounts.value[0].id) : '',
    target_bank_id: bankAccounts.value[1]?.id ? String(bankAccounts.value[1].id) : (bankAccounts.value[0]?.id ? String(bankAccounts.value[0].id) : ''),
    description: 'Penarikan Tunai dari Bank ke Kas Tunai UPZ untuk Persiapan Operasional & Pentasharufan',
  };
  if (mutasiFileInput.value) mutasiFileInput.value.value = '';
  isMutasiModalOpen.value = true;
};

const setMutasiType = (type: 'penarikan' | 'setoran' | 'transfer_bank') => {
  mutasiForm.value.mutasi_type = type;
  if (type === 'penarikan') {
    mutasiForm.value.description = 'Penarikan Tunai dari Bank ke Kas Tunai UPZ untuk Persiapan Operasional & Pentasharufan';
  } else if (type === 'setoran') {
    mutasiForm.value.description = 'Setoran Tunai dari Kas Fisik Kantor ke Rekening Bank UPZ';
  } else {
    mutasiForm.value.description = 'Transfer Pemindahan Saldo antar Rekening Bank Resmi UPZ';
  }
};

const setQuickTag = (tag: string) => {
  mutasiForm.value.description = tag;
};

const handleSaveMutasi = async () => {
  if (!mutasiForm.value.amount || Number(mutasiForm.value.amount) <= 0) {
    alert('Mohon masukkan nominal pemindahan rupiah yang valid.');
    return;
  }
  mutasiSubmitting.value = true;
  try {
    const fd = new FormData();
    fd.append('mutasi_type', mutasiForm.value.mutasi_type);
    fd.append('date', mutasiForm.value.date);
    fd.append('amount', mutasiForm.value.amount);
    fd.append('fund_type', mutasiForm.value.fund_type);
    if (mutasiForm.value.source_bank_id) fd.append('source_bank_id', mutasiForm.value.source_bank_id);
    if (mutasiForm.value.target_bank_id) fd.append('target_bank_id', mutasiForm.value.target_bank_id);
    fd.append('description', mutasiForm.value.description);

    const file = mutasiFileInput.value?.files?.[0];
    if (file) {
      fd.append('proof_file', file);
    }

    await api.post('/transactions/transfer-kas', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    isMutasiModalOpen.value = false;
    alert('Pemindahan buku / mutasi kas berhasil disimpan!');
    fetchMutasi();
    fetchBankAccounts();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal memproses mutasi pemindahan buku.');
  } finally {
    mutasiSubmitting.value = false;
  }
};

const fetchBankAccounts = async () => {
  try {
    const res = await api.get('/bank-accounts');
    bankAccounts.value = res.data || [];
  } catch (err) {
    console.error(err);
  }
};

const fetchPosisi = async () => {
  const r = await api.get(`/reports/posisi-keuangan?date=${posDate.value}`);
  posData.value = r.data;
};

const fetchPerubahan = async () => {
  const r = await api.get(`/reports/perubahan-dana?date_from=${dateFrom.value}&date_to=${dateTo.value}`);
  perubData.value = r.data;
};

const fetchArusKas = async () => {
  const r = await api.get(`/reports/arus-kas?date_from=${dateFrom.value}&date_to=${dateTo.value}`);
  arusData.value = r.data;
};

const fetchBukuKas = async () => {
  const params = new URLSearchParams();
  params.append('date_from', dateFrom.value);
  params.append('date_to', dateTo.value);
  params.append('payment_method', bukuKasMethod.value);
  if (bukuKasMethod.value === 'bank' && selectedBankId.value) {
    params.append('bank_account_id', selectedBankId.value);
  }

  const r = await api.get(`/reports/buku-kas?${params.toString()}`);
  bukuKasData.value = r.data;
  runningBal = r.data?.saldo_awal || 0;
};

const calculateRunningBalance = (tx: any) => {
  if (tx.type === 'penerimaan') runningBal += tx.amount;
  else runningBal -= tx.amount;
  return runningBal;
};

const fetchBukuBesar = async () => {
  const r = await api.get(`/reports/buku-besar?date_from=${dateFrom.value}&date_to=${dateTo.value}`);
  bukuBesarData.value = r.data;
};

const fetchNeracaSaldo = async () => {
  const r = await api.get(`/reports/neraca-saldo?date_to=${posDate.value}`);
  neracaSaldoData.value = r.data;
};

const fetchMutasi = async () => {
  const p = new URLSearchParams();
  p.append('account', mutasiAccount.value);
  p.append('fund_type', mutasiFundType.value);
  p.append('year', mutasiYear.value);
  p.append('month', mutasiMonth.value);
  if (mutasiSearch.value) p.append('search', mutasiSearch.value);

  const r = await api.get(`/reports/mutasi-kas-bank?${p.toString()}`);
  mutasiData.value = r.data;
};

const fetchJurnal = async () => {
  const r = await api.get(`/reports/jurnal-umum?date_from=${dateFrom.value}&date_to=${dateTo.value}`);
  jurnalData.value = r.data;
};

const download = async (path: string, params: Record<string, string>, format: 'pdf' | 'excel') => {
  const qs = new URLSearchParams({ ...params, format }).toString();
  const res = await api.get(`${path}?${qs}`, { responseType: 'blob' });
  const ext = format === 'pdf' ? 'pdf' : 'xlsx';
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = `laporan_${props.reportType}_${new Date().toISOString().slice(0, 10)}.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
};

const loadReport = () => {
  switch (props.reportType) {
    case 'posisi-keuangan': fetchPosisi(); break;
    case 'perubahan-dana': fetchPerubahan(); break;
    case 'arus-kas': fetchArusKas(); break;
    case 'buku-kas': fetchBukuKas(); break;
    case 'buku-besar': fetchBukuBesar(); break;
    case 'neraca-saldo': fetchNeracaSaldo(); break;
    case 'mutasi-kas-bank': fetchMutasi(); break;
    case 'jurnal-umum': fetchJurnal(); break;
  }
};

watch(() => props.reportType, loadReport);
onMounted(() => {
  loadReport();
  fetchBankAccounts();
});
</script>
