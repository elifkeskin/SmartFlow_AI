import React from 'react';

export function StockBar({ stock, threshold }) {
  const pct = Math.min(Math.round((stock / threshold) * 100), 100);
  const col = pct < 10 ? 'var(--red)' : pct < 20 ? 'var(--orange)' : pct < 50 ? 'var(--yellow)' : 'var(--green)';
  return (
    <div className="sbw">
      <div className="sb">
        <div className="sbf" style={{ width: `${pct}%`, background: col }} />
      </div>
      <span className="sbp">%{pct}</span>
    </div>
  );
}
