import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { sendAlert } from '../api/client.js';

/* ── Toast context ── */
export const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

/* ── DashNotes context ── */
export const DashNoteContext = createContext(null);

export function useDashNote() {
  return useContext(DashNoteContext);
}

/* ── MailModal context ── */
export const MailModalContext = createContext(null);

export function useMailModal() {
  return useContext(MailModalContext);
}

/* ── NavBadge context ── */
export const NavBadgeContext = createContext({ late: 0, crit: 0, pend: 0 });

export function useNavBadge() {
  return useContext(NavBadgeContext);
}

function Clock() {
  const [t, setT] = useState(new Date().toLocaleTimeString('tr'));
  useEffect(() => {
    const id = setInterval(() => setT(new Date().toLocaleTimeString('tr')), 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="clock">{t}</span>;
}

function ToastHub({ toasts }) {
  return (
    <div className="toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

function MailModalEl({ state, onClose, onSend }) {
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('satin.alma@smartflow.com');
  const [subj, setSubj] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    if (!state) return;
    setTo(state.to || '');
    setSubj(state.subject || 'ACİL: Kritik Stok Uyarısı — Acil Temin Talebi');
    setBody(state.body || '');
  }, [state]);

  if (!state) return null;

  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="mhdr">
          <div className="mtitle">
            ✉️ Tedarikçi Mail Taslağı{' '}
            <span className="chip chip-purple" style={{ marginLeft: 6 }}>draft_supplier_email</span>
          </div>
          <button className="mclose" onClick={onClose}>×</button>
        </div>
        <div className="mbody">
          <div className="field">
            <label>Ürün / Konu</label>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)', marginBottom: 4 }}>
              {state.productName || '—'}
            </div>
          </div>
          <div className="field">
            <label>Alıcı</label>
            <input value={to} onChange={e => setTo(e.target.value)} type="email" />
          </div>
          <div className="field">
            <label>CC</label>
            <input value={cc} onChange={e => setCc(e.target.value)} type="email" />
          </div>
          <div className="field">
            <label>Konu</label>
            <input value={subj} onChange={e => setSubj(e.target.value)} />
          </div>
          <div className="field">
            <label>Mesaj</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} />
          </div>
        </div>
        <div className="mftr">
          <button className="btn btn-ghost" onClick={onClose}>İptal</button>
          <button className="btn btn-ghost" onClick={() => onSend(to, 'copy')}>📋 Kopyala</button>
          <button className="btn btn-primary" onClick={() => onSend(to, 'send')}>📤 Gönder</button>
        </div>
      </div>
    </div>
  );
}

export default function Layout() {
  const [toasts, setToasts] = useState([]);
  const [dashNotes, setDashNotes] = useState([]);
  const [mailState, setMailState] = useState(null);
  const [navBadge, setNavBadge] = useState({ late: 0, crit: 0, pend: 0 });
  const [summaryForAlert, setSummaryForAlert] = useState(null);
  const navigate = useNavigate();

  const showToast = useCallback((msg, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const pushDashNote = useCallback((msg) => {
    const id = Date.now() + Math.random();
    setDashNotes(prev => [{ id, msg }, ...prev]);
  }, []);

  const openMailModal = useCallback((productName, to, subject, body) => {
    setMailState({ productName, to, subject, body });
  }, []);

  const closeMailModal = useCallback(() => setMailState(null), []);

  const handleMailSend = useCallback((to, action) => {
    closeMailModal();
    if (action === 'copy') {
      showToast('📋 Taslak kopyalandı', 'info');
    } else {
      showToast(`📤 Mail gönderildi → ${to}`, 'success');
      pushDashNote(`✉️ Tedarikçi mail taslağı gönderildi → ${to}`);
    }
  }, [closeMailModal, showToast, pushDashNote]);

  const handleManagerAlert = useCallback(async () => {
    showToast('🔔 POST /api/alerts/send…', 'info');
    const payload = {
      subject: 'SmartFlow AI — Yönetici Uyarısı',
      body: `Acil durum bildirimi:\n- Gecikmiş sipariş: ${navBadge.late}\n- Kritik stok: ${navBadge.crit}\n- Onay bekleyen: ${navBadge.pend}`,
    };
    const res = await sendAlert(payload);
    showToast(res ? '✅ Uyarı gönderildi' : '✅ Uyarı gönderildi (Demo)', 'success');
    pushDashNote('📧 Yönetici uyarısı gönderildi — POST /api/alerts/send');
  }, [navBadge, showToast, pushDashNote]);

  return (
    <ToastContext.Provider value={showToast}>
      <DashNoteContext.Provider value={{ dashNotes, pushDashNote, removeDashNote: (id) => setDashNotes(p => p.filter(n => n.id !== id)) }}>
        <MailModalContext.Provider value={openMailModal}>
          <NavBadgeContext.Provider value={{ navBadge, setNavBadge }}>
            <div className="app">
              {/* Sidebar */}
              <aside className="sidebar">
                <div className="logo">
                  <div className="logo-mark">SmartFlow AI</div>
                  <div className="logo-name">Yönetici Paneli</div>
                  <div className="logo-sub">KOBİ Operasyon Asistanı</div>
                </div>

                <span className="nav-section">Genel</span>
                <NavLink to="/" end className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                  ⬛ Dashboard
                </NavLink>

                <span className="nav-section">Operasyon</span>
                <NavLink to="/orders" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                  📦 Siparişler <span className="nav-badge red">{navBadge.late || '—'}</span>
                </NavLink>
                <NavLink to="/shipments" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                  🚚 Kargolar
                </NavLink>
                <NavLink to="/products" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                  🗃️ Ürünler <span className="nav-badge orange">{navBadge.crit || '—'}</span>
                </NavLink>
                <NavLink to="/tasks" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                  📋 Görevler
                </NavLink>

                <span className="nav-section">Aksiyonlar</span>
                <NavLink to="/pending" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                  ⏳ Onay Bekleyenler <span className="nav-badge">{navBadge.pend || '—'}</span>
                </NavLink>
                <div className="nav-item" onClick={() => openMailModal('', '', 'ACİL: Kritik Stok Uyarısı — Acil Temin Talebi', '')}>
                  ✉️ Tedarikçi Mail
                </div>
                <NavLink to="/chat" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                  💬 Müşteri Chat
                </NavLink>

                <div className="sidebar-bottom">
                  <div className="user-chip">
                    <div className="avatar">AY</div>
                    <div>
                      <div className="user-name">Ahmet Yılmaz</div>
                      <div className="user-role">ADMIN</div>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Main */}
              <div className="main">
                <div className="topbar">
                  <div className="topbar-left">
                    <div className="live-pill">
                      <div className="live-dot" />
                      <span className="live-text">Canlı</span>
                    </div>
                  </div>
                  <div className="topbar-right">
                    <Clock />
                    <button className="btn btn-purple btn-sm" onClick={() => openMailModal('', '', 'ACİL: Kritik Stok Uyarısı', '')}>
                      ✉️ Tedarikçi Mail
                    </button>
                    <button className="btn btn-danger" onClick={handleManagerAlert}>
                      🔔 Yönetici Uyarısı Gönder
                    </button>
                  </div>
                </div>

                <Outlet />
              </div>
            </div>

            {/* Mail modal */}
            <MailModalEl state={mailState} onClose={closeMailModal} onSend={handleMailSend} />

            {/* Toast hub */}
            <ToastHub toasts={toasts} />
          </NavBadgeContext.Provider>
        </MailModalContext.Provider>
      </DashNoteContext.Provider>
    </ToastContext.Provider>
  );
}
