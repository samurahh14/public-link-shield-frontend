import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('scanHistory')) || []);

  const scanURL = async () => {
    if (!url) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post('https://public-link-shield-api.onrender.com/api/scan', { url });
      setResult(res.data);
      const newEntry = { url, status: res.data.status, time: new Date().toLocaleString() };
      const updated = [newEntry, ...history.slice(0, 4)];
      setHistory(updated);
      localStorage.setItem('scanHistory', JSON.stringify(updated));
    } catch {
      setResult({ error: 'Scan failed. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-800 text-gray-900 dark:text-white p-6">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 shadow-2xl rounded-3xl p-10">
        <h1 className="text-4xl font-bold text-center text-blue-700 dark:text-blue-400 mb-4">🔐 Public Link Shield</h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">Scan URLs for phishing, malware, and more in real-time.</p>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input type="url" placeholder="Paste a URL to scan..." value={url} onChange={(e) => setUrl(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700" />
          <button onClick={scanURL} disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50">{loading ? 'Scanning...' : 'Scan'}</button>
        </div>
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="mt-6 p-4 bg-blue-50 dark:bg-slate-700 border border-blue-200 dark:border-slate-600 rounded-xl shadow">
              {result.error ? (
                <p className="text-red-600">❌ {result.error}</p>
              ) : (
                <>
                  <p className="text-lg font-semibold mb-2">✅ Scan Result</p>
                  {result.error ? (
  <p className="text-red-600">❌ {result.error}</p>
) : (
  <div className="space-y-2 text-sm text-gray-800 dark:text-gray-200">
    <p>✅ <strong>Status:</strong> {result.status}</p>
    <p>🧾 <strong>Message:</strong> {result.message}</p>
    <p>🧠 <strong>Checked By:</strong> Nasrev</p>
    <p>🕓 <strong>Checked At:</strong> {new Date(result.checkedAt).toLocaleString()}</p>
  </div>
)}

                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        {history.length > 0 && (
          <div className="mt-10">
            <p className="text-lg font-semibold mb-2">📜 Recent Scans</p>
            <ul className="text-sm space-y-1">
              {history.map((h, i) => (
                <li key={i} className="flex justify-between bg-gray-100 dark:bg-slate-700 px-4 py-2 rounded-md">
                  <span>{h.url}</span>
                  <span className="text-gray-500 text-xs">{h.time}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <footer className="mt-10 text-xs text-center text-gray-400 dark:text-gray-500">
          © 2025 Public Link Shield · Built by Nasrev
        </footer>
      </div>
    </div>
  );
}
