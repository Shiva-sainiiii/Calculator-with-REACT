# 🧮 CalcPro AI — God Level Calculator

A next-gen React calculator with 3 modes and AI math solving.

## Features

### 📐 Standard Mode
- Full arithmetic with keyboard support
- Live expression preview
- History tracking

### 🔬 Scientific Mode  
- sin, cos, tan, asin, acos, atan
- log, ln, sqrt, cbrt, abs
- π, e constants
- Power (x², xⁿ)
- Parentheses & complex expressions
- Live result preview

### 🤖 AI Mode (OpenRouter)
- Natural language math solving
- Step-by-step explanations
- Algebra, calculus, geometry, statistics
- Unit conversions
- Powered by Mistral-7B (FREE)

### ⏱ History Panel
- Tracks all calculations
- Color-coded by mode
- Timestamps

---

## Setup

```bash
npm install
npm start
```

## AI Setup
1. Go to https://openrouter.ai/keys
2. Create a free account & API key
3. In the app → AI Mode tab → paste your key
4. Done! Uses `mistralai/mistral-7b-instruct:free` (no cost)

## Vercel Deploy
```bash
npm run build
# Deploy the /build folder to Vercel
```

Or connect your GitHub repo to Vercel for auto-deploy.
