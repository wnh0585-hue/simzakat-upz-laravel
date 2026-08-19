import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, UserCheck, Target, Folder, ClipboardCheck,
  ArrowDownLeft, ArrowUpRight, TrendingDown,
  BookOpen, RefreshCw, Scale, FileText,
  BarChart3, TrendingUp, Activity,
  Building, Archive,
  Calculator, Database, History,
  LogOut, Menu, X, ChevronRight, UserCog, Settings as SettingsIcon,
} from 'lucide-react';

interface NavItem { key: string; label: string; icon: React.ReactNode; }
interface NavGroup { label: string; items: NavItem[]; }

const NAV_GROUPS: NavGroup[] = [
  { label: 'MENU UTAMA', items: [
    { key: 'dashboard', label: 'Ikhtisar Dashboard', icon: <LayoutDashboard size={16} /> },
  ]},
  { label: 'DATA MASTER', items: [
    { key: 'muzakki', label: 'Muzakki', icon: <Users size={16} /> },
    { key: 'mustahik', label: 'Mustahik', icon: <UserCheck size={16} /> },
  ]},
  { label: 'PERENCANAAN', items: [
    { key: 'collection-plans', label: 'Rencana Penghimpunan', icon: <Target size={16} /> },
    { key: 'programs', label: 'Program Penyaluran', icon: <Folder size={16} /> },
    { key: 'program-control', label: 'Kontrol Program', icon: <ClipboardCheck size={16} /> },
  ]},
  { label: 'TRANSAKSI', items: [
    { key: 'penerimaan', label: 'Penerimaan Dana', icon: <ArrowDownLeft size={16} /> },
    { key: 'penyaluran', label: 'Penyaluran Dana', icon: <ArrowUpRight size={16} /> },
    { key: 'operasional', label: 'Pengeluaran Operasional', icon: <TrendingDown size={16} /> },
  ]},
  { label: 'PEMBUKUAN', items: [
    { key: 'chart-of-accounts', label: 'Chart of Accounts', icon: <BookOpen size={16} /> },
    { key: 'buku-kas', label: 'Buku Kas Umum', icon: <FileText size={16} /> },
    { key: 'mutasi-kas-bank', label: 'Mutasi Kas & Bank', icon: <RefreshCw size={16} /> },
    { key: 'jurnal-umum', label: 'Jurnal Umum', icon: <Scale size={16} /> },
    { key: 'buku-besar', label: 'Buku Besar', icon: <BarChart3 size={16} /> },
    { key: 'neraca-saldo', label: 'Neraca Saldo', icon: <Activity size={16} /> },
  ]},
  { label: 'LAPORAN PSAK 109', items: [
    { key: 'posisi-keuangan', label: 'Posisi Keuangan', icon: <TrendingUp size={16} /> },
    { key: 'perubahan-dana', label: 'Perubahan Dana', icon: <BarChart3 size={16} /> },
    { key: 'arus-kas', label: 'Arus Kas', icon: <Activity size={16} /> },
  ]},
  { label: 'REGULATOR & ARSIP', items: [
    { key: 'baznas', label: 'BAZNAS Kebumen', icon: <Building size={16} /> },
    { key: 'arsip-digital', label: 'Arsip Digital', icon: <Archive size={16} /> },
  ]},
  { label: 'SISTEM & ALAT', items: [
    { key: 'kalkulator-zakat', label: 'Kalkulator Zakat', icon: <Calculator size={16} /> },
    { key: 'backup-restore', label: 'Backup & Restore', icon: <Database size={16} /> },
    { key: 'audit-log', label: 'Log Aktivitas User', icon: <History size={16} /> },
    { key: 'users', label: 'Manajemen Pengguna', icon: <UserCog size={16} /> },
    { key: 'settings', label: 'Pengaturan Sistem', icon: <SettingsIcon size={16} /> },
  ]},
];

interface LayoutProps { activePage: string; onNavigate: (page: string) => void; children: React.ReactNode; pageTitle?: string; }

export default function Layout({ activePage, onNavigate, children, pageTitle }: LayoutProps) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const ROLE_COLOR: Record<string, string> = {
    Admin: 'badge-red', Operator: 'badge-blue', Pimpinan: 'badge-orange', Auditor: 'badge-purple',
  };

  const activeItem = NAV_GROUPS.flatMap(g => g.items).find(i => i.key === activePage);
  const breadcrumb = `SIMZAKAT » ${activeItem?.label || 'Dashboard'}`;

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99 }} />}

      {/* SIDEBAR */}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">Z</div>
            <div className="sidebar-logo-text">
              <h2>SIMZAKAT</h2>
              <p>UPZ KEMENAG KEBUMEN</p>
            </div>
          </div>
          <div className="sidebar-user">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div className="user-name">{user?.name || 'User'}</div>
                <div className="user-email">{user?.email}</div>
              </div>
              <span className={`badge ${ROLE_COLOR[user?.role || ''] || 'badge-gray'}`} style={{ fontSize: '10px' }}>{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="nav-section-label">{group.label}</div>
              {group.items.map((item) => (
                <div
                  key={item.key}
                  className={`nav-item ${activePage === item.key ? 'active' : ''}`}
                  onClick={() => { onNavigate(item.key); setMobileOpen(false); }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {activePage === item.key && <ChevronRight size={12} style={{ marginLeft: 'auto', opacity: 0.6 }} />}
                </div>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button className="btn-logout" onClick={logout}>
            <LogOut size={14} />
            Keluar (Logout)
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={() => setMobileOpen(!mobileOpen)} className="btn btn-ghost btn-sm" style={{ display: 'none' }}>
                {mobileOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
              <div>
                <div className="topbar-title">{pageTitle || activeItem?.label || 'Dashboard'}</div>
                <div className="topbar-breadcrumb">{breadcrumb}</div>
              </div>
            </div>
          </div>
          <div className="topbar-badges">
            <span className={`badge ${ROLE_COLOR[user?.role || ''] || 'badge-gray'}`}>Hak Akses: {user?.role}</span>
            <span className="badge badge-green">● Sistem Aktif</span>
          </div>
        </header>

        {/* Content */}
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
