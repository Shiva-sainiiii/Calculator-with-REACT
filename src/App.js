import React, { useState } from 'react';
import './App.css';
import StandardCalc from './components/StandardCalc';
import ScientificCalc from './components/ScientificCalc';
import AICalc from './components/AICalc';
import History from './components/History';

const TABS = [
  { id: 'standard', label: 'Standard', icon: '⌗' },
  { id: 'scientific', label: 'Scientific', icon: '∑' },
  { id: 'ai', label: 'AI Mode', icon: '✦' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('standard');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const addToHistory = (entry) => {
    setHistory(prev => [entry, ...prev].slice(0, 50));
  };

  return (
    <>
      <div className="animated-bg"><div className="bg-orb" /></div>
      <div className="grid-bg" />
      <div className="app-shell">
        <div className={`calculator-card ${showHistory ? 'with-history' : ''}`}>
          {/* Header */}
          <header className="app-header">
            <div className="brand">
              <span className="brand-icon">✦</span>
              <span className="brand-name">CalcPro<span className="brand-ai">AI</span></span>
            </div>
            <button
              className={`history-toggle ${showHistory ? 'active' : ''}`}
              onClick={() => setShowHistory(p => !p)}
              title="Toggle History"
            >
              <span>⏱</span>
            </button>
          </header>

          {/* Tabs */}
          <div className="tabs">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`tab ${activeTab === tab.id ? 'tab--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
                {tab.id === 'ai' && <span className="tab-badge">AI</span>}
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="calc-body">
            <div className="calc-panel">
              {activeTab === 'standard' && <StandardCalc addToHistory={addToHistory} />}
              {activeTab === 'scientific' && <ScientificCalc addToHistory={addToHistory} />}
              {activeTab === 'ai' && <AICalc addToHistory={addToHistory} />}
            </div>
            {showHistory && (
              <div className="history-panel">
                <History history={history} onClear={() => setHistory([])} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
