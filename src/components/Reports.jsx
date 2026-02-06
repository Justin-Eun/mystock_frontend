import React, { useState, useEffect } from 'react';
import { FileText, ExternalLink, Download, RefreshCw } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Source Selection State
    const [activeSource, setActiveSource] = useState('hankyung');

    // Date Range State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchReports = async (overrideStart, overrideEnd, overrideSource) => {
        setLoading(true);
        setError(null);
        try {
            const params = {};
            // Use override if provided, otherwise state, otherwise nothing
            const start = overrideStart !== undefined ? overrideStart : startDate;
            const end = overrideEnd !== undefined ? overrideEnd : endDate;
            const source = overrideSource !== undefined ? overrideSource : activeSource;

            params.source = source;
            if (start) params.start_date = start;
            if (end) params.end_date = end;

            const res = await axios.get(`${API_BASE_URL}/api/reports`, { params });
            setReports(res.data);
        } catch (err) {
            console.error("Failed to fetch reports", err);
            // Show more detailed error for debugging
            const detailedError = err.response
                ? `Server Error: ${err.response.status} ${err.response.statusText}`
                : err.message;
            setError(`Failed to load reports: ${detailedError}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Set default dates: 1 week ago (User Request)
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 7);

        const fmt = d => d.toISOString().split('T')[0];
        const startStr = fmt(start);
        const endStr = fmt(end);

        setStartDate(startStr);
        setEndDate(endStr);

        // Pass these directly to fetch so we don't wait for state update
        fetchReports(startStr, endStr, 'hankyung');
    }, []);

    const getSentimentColor = (sentiment) => {
        if (sentiment === 'Positive') return { bg: 'rgba(239, 68, 68, 0.2)', text: '#fca5a5', border: 'rgba(239, 68, 68, 0.5)' }; // Redish
        if (sentiment === 'Negative') return { bg: 'rgba(59, 130, 246, 0.2)', text: '#93c5fd', border: 'rgba(59, 130, 246, 0.5)' }; // Blueish
        return { bg: 'rgba(148, 163, 184, 0.2)', text: '#cbd5e1', border: 'rgba(148, 163, 184, 0.5)' }; // Grey
    };

    return (
        <div style={{ padding: '0 2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        padding: '0.75rem',
                        borderRadius: '1rem',
                        boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.4)'
                    }}>
                        <FileText size={24} color="white" />
                    </div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, background: 'linear-gradient(to right, #f8fafc, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                        Research Reports
                    </h1>
                    {/* Source Tabs */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                        <button
                            onClick={() => {
                                setActiveSource('hankyung');
                                fetchReports(undefined, undefined, 'hankyung');
                            }}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                background: activeSource === 'hankyung' ? '#ef4444' : 'rgba(148, 163, 184, 0.2)',
                                color: activeSource === 'hankyung' ? 'white' : '#94a3b8',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontSize: '0.875rem'
                            }}
                        >
                            한경컨센서스
                        </button>
                        <button
                            onClick={() => {
                                setActiveSource('naver');
                                fetchReports(undefined, undefined, 'naver');
                            }}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                background: activeSource === 'naver' ? '#10b981' : 'rgba(148, 163, 184, 0.2)',
                                color: activeSource === 'naver' ? 'white' : '#94a3b8',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontSize: '0.875rem'
                            }}
                        >
                            NAVER
                        </button>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        style={{ background: '#334155', border: '1px solid #475569', color: '#e2e8f0', padding: '0.5rem', borderRadius: '0.5rem' }}
                    />
                    <span style={{ color: '#94a3b8' }}>-</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        style={{ background: '#334155', border: '1px solid #475569', color: '#e2e8f0', padding: '0.5rem', borderRadius: '0.5rem' }}
                    />
                    <button
                        onClick={() => fetchReports()}
                        disabled={loading}
                        style={{
                            background: '#334155',
                            border: '1px solid #475569',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        Search
                    </button>
                </div>
            </div>

            {error && (
                <div style={{ padding: '1rem', background: '#450a0a', border: '1px solid #ef4444', borderRadius: '0.5rem', color: '#fca5a5', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

            {loading && !reports.length ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                    <RefreshCw size={32} className="animate-spin" style={{ marginBottom: '1rem' }} />
                    <p>Loading market research...</p>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#1e293b', borderBottom: '1px solid #334155' }}>
                                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Date</th>
                                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Stock</th>
                                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Title</th>
                                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Sentiment</th>
                                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Brokerage</th>
                                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600, textAlign: 'right' }}>File</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((item, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #334155', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#1e293b'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '1rem', color: '#cbd5e1', fontSize: '0.9rem' }}>{item.date}</td>
                                    <td style={{ padding: '1rem', fontWeight: 600, color: '#f8fafc' }}>{item.stock_name}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <a
                                            href={item.link}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{ color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                                        >
                                            {item.title}
                                            <ExternalLink size={14} />
                                        </a>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {item.sentiment && (
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                ...getSentimentColor(item.sentiment),
                                                border: `1px solid ${getSentimentColor(item.sentiment).border}`
                                            }}>
                                                {item.sentiment}
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem', color: '#94a3b8' }}>{item.brokerage}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        {item.pdf_link && (
                                            <a
                                                href={item.pdf_link}
                                                target="_blank"
                                                rel="noreferrer"
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '32px',
                                                    height: '32px',
                                                    background: '#334155',
                                                    borderRadius: '4px',
                                                    color: '#e2e8f0'
                                                }}
                                                title="Download PDF"
                                            >
                                                <Download size={18} />
                                            </a>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Reports;
