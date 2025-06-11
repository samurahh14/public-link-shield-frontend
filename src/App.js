import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

function getRiskLevel(status) {
  switch (status?.toLowerCase()) {
    case 'safe': return { percent: 0, color: 'bg-green-500' };
    case 'warning': return { percent: 50, color: 'bg-yellow-500' };
    case 'malicious':
    case 'danger':
    case 'phishing': return { percent: 100, color: 'bg-red-600' };
    default: return { percent: 0, color: 'bg-gray-400' };
  }
}

function getChartData(status) {
  const risk = getRiskLevel(status).percent;
  return [
    { name: 'Risk', value: risk },
    { name: 'Safe', value: 100 - risk },
  ];
}

export default function App() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('scanHistory')) || []);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('url');
    if (param) {
      setUrl(param);
      handleScan(param);
    }
  }, []);

  const handleScan = async (customUrl) => {
    const scanUrl = customUrl || url;
    if (!scanUrl) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post('https://public-link-shield-api.onrender.com/api/scan', { url: scanUrl });
      const finalResult = { ...res.data, checkedBy: 'Nasrev' };
      setResult(finalResult);
      const entry = { url: scanUrl, status: finalResult.status, time: new Date().toLocaleString() };
      const updated = [entry, ...history.slice(0, 4)];
      setHistory(updated);
      localStorage.setItem('scanHistory', JSON.stringify(updated));
    } catch {
      setResult({ error: 'Scan failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#EF4444', '#10B981']; // red (risk), green (safe)

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 px-4 py-6 text-gray-800 dark:text-white transition-all">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-400">🔐 Public Link Shield</h1>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="px-3 py-1 text-sm bg-slate-200 dark:bg-slate-700 rounded shadow">
            {theme === 'dark' ? '🌞 Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a URL to scan"
            className="flex-1 px-4 py-3 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800" />
          <button onClick={() => handleScan()} disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Scanning...' : 'Scan'}
          </button>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="bg-blue-50 dark:bg-slate-800 border border-blue-300 dark:border-slate-700 rounded-xl p-6 shadow space-y-4">
              {result.error ? (
                <p className="text-red-600">❌ {result.error}</p>
              ) : (
                <>
                  <div className="space-y-2 text-sm">
                    <p>✅ <strong>Status:</strong> {result.status}</p>
                    <p>🧾 <strong>Message:</strong> {result.message}</p>
                    <p>🧠 <strong>Checked By:</strong> Nasrev</p>
                    <p>🕓 <strong>Checked At:</strong> {new Date(result.checkedAt).toLocaleString()}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">📊 Risk Meter</p>
                    <div className="risk-bar w-full">
                      <div
                        className={`risk-bar-fill ${getRiskLevel(result.status).color}`}
                        style={{ width: getRiskLevel(result.status).percent + '%' }}
                      ></div>
                    </div>
                  </div>
                  <div className="pt-4">
                    <PieChart width={280} height={200}>
                      <Pie data={getChartData(result.status)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
                        {getChartData(result.status).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {history.length > 0 && (
          <div>
            <h2 className="text-md font-semibold mb-2">📜 Recent Scans</h2>
            <ul className="space-y-1 text-sm">
              {history.map((h, i) => (
                <li key={i} className="flex justify-between items-center bg-gray-100 dark:bg-slate-800 px-4 py-2 rounded">
                  <span>{h.url}</span>
                  <span className="text-xs text-gray-500">{h.time}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
