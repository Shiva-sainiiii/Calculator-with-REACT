import React from 'react';
import './History.css';

const TYPE_COLORS = {
  standard: 'var(--purple-light)',
  scientific: 'var(--cyan)',
  ai: 'var(--pink)',
};

const TYPE_ICONS = {
  standard: '⌗',
  scientific: '∑',
  ai: '✦',
};

export default function History({ history, onClear }) {
  if (history.length === 0) {
    return (
      <div className="history-empty">
        <div className="history-empty-icon">⏱</div>
        <p>No calculations yet.<br />Start computing!</p>
      </div>
    );
  }

  return (
    <div className="history-wrap">
      <div className="history-header">
        <span className="history-title">History</span>
        <button className="history-clear" onClick={onClear}>Clear</button>
      </div>
      <div className="history-list">
        {history.map((item, i) => (
          <div key={i} className="history-item">
            <div className="history-item-meta">
              <span className="history-type-icon" style={{ color: TYPE_COLORS[item.type] }}>
                {TYPE_ICONS[item.type]}
              </span>
              <span className="history-time">{item.time}</span>
            </div>
            <div className="history-expr">{item.expr}</div>
            {item.type !== 'ai' && (
              <div className="history-result" style={{ color: TYPE_COLORS[item.type] }}>
                = {item.result}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
