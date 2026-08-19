import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Shield, LogIn } from 'lucide-react';

export default function Login() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('admin@kemenag.go.id');
  const [password, setPassword] = useState('admin123');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try { await login(email, password); }
    catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Login gagal. Periksa email & password.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg, #00c48c, #4e87ff)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '32px' }}>
            🕌
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px' }}>SIMZAKAT UPZ</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Sistem Akuntansi Zakat PSAK 109<br/>
            <strong style={{ color: 'var(--accent-green)' }}>UPZ P Kankemenag Kab. Kebumen</strong>
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <Shield size={18} color="var(--accent-green)" />
            <h2 style={{ fontSize: '16px', fontWeight: '700' }}>Masuk ke Sistem</h2>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 14px', color: 'var(--accent-red)', fontSize: '13px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email<span className="required">*</span></label>
              <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@kemenag.go.id" required />
            </div>
            <div className="form-group">
              <label className="form-label">Password<span className="required">*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input" type={showPw ? 'text' : 'password'}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  style={{ paddingRight: '40px' }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '8px' }} disabled={loading}>
              {loading ? <span className="loading-spinner" style={{ width: '16px', height: '16px' }} /> : <LogIn size={16} />}
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <div style={{ marginTop: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <div style={{ marginBottom: '6px', fontWeight: '600', color: 'var(--text-secondary)' }}>Akun Demo:</div>
            {[['Admin','admin@kemenag.go.id','admin123'],['Operator','operator@kemenag.go.id','operator123'],['Pimpinan','pimpinan@kemenag.go.id','pimpinan123']].map(([r,e,p]) => (
              <div key={r} style={{ cursor: 'pointer', padding: '3px 0', display: 'flex', gap: '8px' }} onClick={() => { setEmail(e); setPassword(p); }}>
                <span className="badge badge-green" style={{ fontSize: '9px' }}>{r}</span>
                <span>{e}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', marginTop: '20px' }}>
          © 2026 UPZ P Kankemenag Kab. Kebumen • PSAK 109
        </p>
      </div>
    </div>
  );
}
