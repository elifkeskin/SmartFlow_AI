import React, { useState, useEffect, useRef } from 'react';
import './ChatPage.css';
import { sendChat, getMessages } from '../api/client.js';
import { useToast } from '../components/Layout.jsx';

const QUICK = [
  '142 numaralı siparişim nerede?',
  'Organik zeytinyağı stokta var mı?',
  'Bugünün özetini ver',
  'Kritik stokları listele',
  '128 numaralı sipariş ne zaman teslim?',
];

function TypingIndicator() {
  return (
    <div className="typing-row">
      <div className="msg-avatar ai">AI</div>
      <div className="typing-bubble">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [pending, setPending] = useState(false);
  const [input, setInput] = useState('');
  const [lastIntent, setLastIntent] = useState(null);
  const bottomRef = useRef(null);
  const showToast = useToast();

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pending]);

  async function loadHistory() {
    const data = await getMessages(20);
    if (!data || data.length === 0) return;
    const expanded = [];
    for (const m of [...data].reverse()) {
      expanded.push({ id: m.message_id + '_u', role: 'user', text: m.customer_message, ts: m.created_at });
      if (m.ai_response) {
        expanded.push({ id: m.message_id + '_a', role: 'ai', text: m.ai_response, intent: m.intent, tools: [], ts: m.created_at });
      }
    }
    setMessages(expanded);
  }

  async function send(text) {
    const msg = text || input.trim();
    if (!msg || pending) return;
    setInput('');

    setMessages(prev => [...prev, {
      id: Date.now() + '_u',
      role: 'user',
      text: msg,
      ts: new Date().toISOString(),
    }]);

    setPending(true);
    const res = await sendChat(msg);
    setPending(false);

    if (res) {
      setLastIntent(res.intent);
      setMessages(prev => [...prev, {
        id: Date.now() + '_a',
        role: 'ai',
        text: res.reply,
        intent: res.intent,
        tools: res.tool_calls || [],
        dashNote: res.dashboard_note,
        ts: new Date().toISOString(),
      }]);
      if (res.dashboard_note) {
        showToast(`🔔 ${res.dashboard_note}`, 'info');
      }
    } else {
      setMessages(prev => [...prev, {
        id: Date.now() + '_err',
        role: 'ai',
        text: 'Bağlantı hatası. Lütfen tekrar deneyin.',
        intent: 'ERROR',
        tools: [],
        ts: new Date().toISOString(),
      }]);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="chat-wrap page-content" style={{ gap: 0, padding: 0 }}>
      {/* Header */}
      <div className="chat-header">
        <div className="msg-avatar ai" style={{ width: 32, height: 32 }}>AI</div>
        <div className="chat-header-title">Müşteri Asistanı</div>
        <span className="chip chip-blue">Gemini</span>
        <span className="chip chip-purple">tool calling</span>
        {lastIntent && (
          <span className="intent-badge">{lastIntent}</span>
        )}
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && !pending && (
          <div style={{ textAlign: 'center', color: 'var(--muted)', marginTop: 40 }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>💬</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>SmartFlow AI Asistan</div>
            <div style={{ fontSize: 12 }}>Sipariş durumu, stok bilgisi veya günlük özet için soru sorabilirsiniz.</div>
          </div>
        )}

        {messages.map(m => (
          <div key={m.id} className={`msg-row ${m.role}`}>
            <div className={`msg-avatar ${m.role}`}>{m.role === 'ai' ? 'AI' : 'SİZ'}</div>
            <div>
              <div className={`msg-bubble ${m.role}`}>{m.text}</div>
              {m.role === 'ai' && (
                <div className="msg-meta">
                  {m.intent && <span className="intent-badge">{m.intent}</span>}
                  {m.tools && m.tools.map(t => (
                    <span key={t} className="chip chip-purple">{t}</span>
                  ))}
                  <span className="msg-time">
                    {m.ts ? new Date(m.ts).toLocaleTimeString('tr', { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                  {m.dashNote && <div className="dashboard-note-hint">🔔 {m.dashNote}</div>}
                </div>
              )}
              {m.role === 'user' && (
                <div className="msg-meta" style={{ justifyContent: 'flex-end' }}>
                  <span className="msg-time">
                    {m.ts ? new Date(m.ts).toLocaleTimeString('tr', { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {pending && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Quick buttons */}
      <div className="quick-btns">
        {QUICK.map(q => (
          <button key={q} className="quick-btn" onClick={() => send(q)} disabled={pending}>
            {q}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="chat-input-bar">
        <input
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Sipariş durumu, stok veya günlük özet sorabilirsiniz…"
          disabled={pending}
        />
        <button className="chat-send" onClick={() => send()} disabled={pending || !input.trim()}>
          {pending ? <span className="spinner" style={{ borderTopColor: '#fff' }} /> : '↑ Gönder'}
        </button>
      </div>
    </div>
  );
}
