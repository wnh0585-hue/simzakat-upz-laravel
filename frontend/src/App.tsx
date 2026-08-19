import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Muzakki from './pages/Muzakki';
import Mustahik from './pages/Mustahik';
import Transactions from './pages/Transactions';
import Programs from './pages/Programs';
import CollectionPlans from './pages/CollectionPlans';
import ProgramControl from './pages/ProgramControl';
import BaznasKebumen from './pages/BaznasKebumen';
import DigitalArchive from './pages/DigitalArchive';
import KalkulatorZakat from './pages/KalkulatorZakat';
import AuditLog from './pages/AuditLog';
import Settings from './pages/Settings';
import Users from './pages/Users';
import BackupRestore from './pages/BackupRestore';
import LimitMonitor from './pages/LimitMonitor';
import ChartOfAccounts from './pages/ChartOfAccounts';
import {
  PosisiKeuangan, PerubahanDana, ArusKas,
  BukuKas, BukuBesar, NeracaSaldo, MutasiKasBank, JurnalUmum
} from './pages/Reports';

function AppContent() {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

  if (!user) return <Login />;

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':      return <Dashboard onNavigate={setActivePage} />;
      case 'muzakki':        return <Muzakki />;
      case 'mustahik':       return <Mustahik />;
      case 'penerimaan':     return <Transactions transactionType="penerimaan" />;
      case 'penyaluran':     return <Transactions transactionType="penyaluran" />;
      case 'operasional':    return <Transactions transactionType="amil_operasional" />;
      case 'programs':       return <Programs />;
      case 'collection-plans': return <CollectionPlans />;
      case 'program-control':  return <ProgramControl />;
      case 'baznas':         return <BaznasKebumen />;
      case 'arsip-digital':  return <DigitalArchive />;
      case 'kalkulator-zakat': return <KalkulatorZakat />;
      case 'audit-log':      return <AuditLog />;
      case 'settings':       return <Settings />;
      case 'users':          return <Users />;
      case 'backup-restore': return <BackupRestore />;
      case 'limit-monitor':  return <LimitMonitor />;
      case 'chart-of-accounts': return <ChartOfAccounts />;
      // Pembukuan
      case 'buku-kas':       return <BukuKas />;
      case 'buku-besar':     return <BukuBesar />;
      case 'neraca-saldo':   return <NeracaSaldo />;
      case 'mutasi-kas-bank':return <MutasiKasBank />;
      case 'jurnal-umum':    return <JurnalUmum />;
      // Laporan PSAK 109
      case 'posisi-keuangan':  return <PosisiKeuangan />;
      case 'perubahan-dana':   return <PerubahanDana />;
      case 'arus-kas':         return <ArusKas />;
      default: return <Dashboard onNavigate={setActivePage} />;
    }
  };

  const PAGE_TITLES: Record<string, string> = {
    dashboard: 'Ikhtisar Dashboard Utama',
    muzakki: 'Data Muzakki / Donatur',
    mustahik: 'Data Mustahik (Penerima 8 Asnaf)',
    penerimaan: 'Penerimaan Dana ZIS',
    penyaluran: 'Penyaluran Dana ZIS',
    operasional: 'Pengeluaran Operasional Amil',
    programs: 'Program Penyaluran ZIS',
    'collection-plans': 'Rencana Penghimpunan ZIS',
    'program-control': 'Kontrol & Monitor Program',
    baznas: 'Setoran & Laporan BAZNAS Kebumen',
    'arsip-digital': 'Arsip Digital & Bukti Transaksi',
    'kalkulator-zakat': 'Kalkulator Zakat',
    'audit-log': 'Log Aktivitas User (Audit Trail)',
    settings: 'Pengaturan Sistem',
    users: 'Manajemen Pengguna',
    'backup-restore': 'Backup & Restore Data',
    'limit-monitor': 'Monitor Limit & Kuota Sistem',
    'chart-of-accounts': 'Bagan Akun (Chart of Accounts)',
    'buku-kas': 'Buku Kas Umum',
    'buku-besar': 'Buku Besar (General Ledger)',
    'neraca-saldo': 'Neraca Saldo (Trial Balance)',
    'mutasi-kas-bank': 'Mutasi Kas & Bank',
    'jurnal-umum': 'Jurnal Umum',
    'posisi-keuangan': 'Laporan Posisi Keuangan — PSAK 109',
    'perubahan-dana': 'Laporan Perubahan Dana — PSAK 109',
    'arus-kas': 'Laporan Arus Kas — PSAK 109',
  };

  return (
    <Layout activePage={activePage} onNavigate={setActivePage} pageTitle={PAGE_TITLES[activePage]}>
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
