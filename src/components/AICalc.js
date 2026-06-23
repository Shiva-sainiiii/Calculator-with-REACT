import React, { useState, useRef, useEffect } from 'react';
import './AICalc.css';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'nvidia/nemotron-3-ultra-550b-a55b:free';

const SYSTEM_PROMPT = `You are an advanced AI math assistant embedded in a calculator app. 
You can:
- Solve any math problem step by step
- Handle arithmetic, algebra, calculus, statistics, geometry, trigonometry
- Convert units, currencies (approximate), percentages
- Explain mathematical concepts clearly
- Plot simple data when asked

Always:
1. Give the final numerical answer first (bold it with **)
2. Show key steps concisely
3. Be friendly but precise
4. If asked something non-math, gently redirect to math topics

Format: Start with **Answer: [result]** then brief explanation.`;

const SUGGESTIONS = [
  'Solve x² + 5x + 6 = 0',
  'What is 15% of 3400?',
  'Derivative of x³ + 2x',
  'Convert 100°F to Celsius',
  'Area of a circle with r=7',
  'sin(45°) + cos(30°)',
];

export default function AICalc({ addToHistory }) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('openrouter_key') || '');
  const [keyInput, setKeyInput] = useState('');
  const [keySet, setKeySet] = useState(() => !!localStorage.getItem('openrouter_key'));
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '👋 Hey! I\'m your AI math assistant. Ask me anything — equations, calculus, percentages, word problems, unit conversions... I\'ve got you!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const saveKey = () => {
    if (!keyInput.trim()) return;
    localStorage.setItem('openrouter_key', keyInput.trim());
    setApiKey(keyInput.trim());
    setKeySet(true);
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    const userMsg = { role: 'user', content: msg };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setLoading(true);

    try {
      const res = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'GodLevel Calculator',
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...newMsgs.slice(-12).map(m => ({ role: m.role, content: m.content }))
          ],
          max_tokens: 600,
          temperature: 0.3,
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || 'No response.';
      const asstMsg = { role: 'assistant', content: reply };
      setMessages(prev => [...prev, asstMsg]);
      addToHistory({ type: 'ai', expr: msg, result: reply.substring(0, 80) + '...', time: new Date().toLocaleTimeString() });
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ Error: ${err.message}\n\nCheck your API key or try again.` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // Format message content - bold **text**
  const formatContent = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) =>
      p.startsWith('**') && p.endsWith('**')
        ? <strong key={i} style={{ color: 'var(--purple-light)' }}>{p.slice(2, -2)}</strong>
        : p
    );
  };

  if (!keySet) {
    return (
      <div className="ai-setup">
        <div className="ai-setup-icon">🔑</div>
        <h3 className="ai-setup-title">Connect AI</h3>
        <p className="ai-setup-desc">
          Add your <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" style={{ color: 'var(--purple-light)' }}>OpenRouter API key</a> to unlock AI math solving. Free models available!
        </p>
        <div className="ai-key-input-row">
          <input
            className="ai-key-input"
            type="password"
            placeholder="sk-or-v1-..."
            value={keyInput}
            onChange={e => setKeyInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && saveKey()}
          />
          <button className="ai-key-btn" onClick={saveKey}>Connect</button>
        </div>
        <p className="ai-setup-note">Free tier: mistral-7b-instruct · Key stored in browser only</p>
      </div>
    );
  }

  return (
    <div className="ai-calc">
      {/* Chat */}
      <div className="ai-messages">
        {messages.map((m, i) => (
          <div key={i} className={`ai-msg ai-msg--${m.role}`}>
            {m.role === 'assistant' && <div className="ai-avatar">✦</div>}
            <div className="ai-bubble">
              <div className="ai-bubble-text">{formatContent(m.content)}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="ai-msg ai-msg--assistant">
            <div className="ai-avatar">✦</div>
            <div className="ai-bubble">
              <div className="ai-typing">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="ai-suggestions">
          {SUGGESTIONS.map((s, i) => (
            <button key={i} className="ai-suggestion" onClick={() => sendMessage(s)}>{s}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="ai-input-area">
        <textarea
          ref={inputRef}
          className="ai-input"
          rows={1}
          placeholder="Ask any math problem..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
        />
        <div className="ai-input-actions">
          <button
            className="ai-clear-btn"
            onClick={() => { setMessages([{ role:'assistant', content:"Chat cleared! What do you want to calculate?" }]); }}
            title="Clear chat"
          >↺</button>
          <button
            className="ai-send-btn"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            {loading ? '...' : '↑'}
          </button>
        </div>
      </div>

      <div className="ai-footer">
        <span>Model: mistral-7b-instruct · </span>
        <button className="ai-change-key" onClick={() => { setKeySet(false); setKeyInput(''); }}>Change Key</button>
      </div>
    </div>
  );
}
