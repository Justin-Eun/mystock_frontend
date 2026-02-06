import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, TrendingDown, DollarSign, Globe, Anchor } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config';

const DashboardLanding = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/api/dashboard`);
            console.log("Dashboard Data:", res.data);
            setData(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load dashboard data", err);
            setError("Failed to load market briefing.");
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                <Activity className="animate-spin" size={32} style={{ marginBottom: '1rem' }} />
                <p>Gathering global market intelligence...</p>
            </div>
        );
    }

    if (error || !data || !data.briefing) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#fca5a5' }}>
                <p>{error || "Market data unavailable."}</p>
                <button
                    onClick={fetchDashboardData}
                    style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#334155', border: 'none', borderRadius: '0.25rem', color: 'white', cursor: 'pointer' }}
                >
                    Retry
                </button>
            </div>
        );
    }

    const { briefing, indices } = data;

    // Helper to get raw value if needed
    const getVal = (key) => indices[key]?.value;
    const getPrev = (key) => indices[key]?.prev;

    return (
        <div className="dashboard-landing" style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header / Summary Section */}
            <div className="summary-section" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Globe color="#3b82f6" />
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Global Economic Briefing</h1>
                    <span style={{ fontSize: '0.9rem', color: '#94a3b8', marginLeft: 'auto' }}>
                        {new Date().toLocaleDateString()}
                    </span>
                </div>

                <div className="brain-card" style={{
                    background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
                    border: '1px solid #3b82f6',
                    borderRadius: '0.75rem',
                    padding: '1.5rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>🧠</span>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#93c5fd' }}>
                            {briefing.summary_title || "Today's Market Insight"}
                        </h2>
                    </div>
                    <p style={{ lineHeight: '1.6', fontSize: '1.1rem', color: '#e2e8f0', whiteSpace: 'pre-line' }}>
                        {briefing.summary_content}
                    </p>
                </div>
            </div>

            {/* Grid of 10 Items */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem'
            }}>
                {briefing.items && briefing.items.map((item, idx) => {
                    const rawData = indices[item.id];
                    const isUp = rawData && rawData.change > 0;
                    const changeStr = rawData ? `${isUp ? '+' : ''}${rawData.change.toFixed(2)}` : '';

                    // Determine icon based on ID or index
                    const icons = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
                    const icon = icons[idx] || "#";

                    return (
                        <div key={item.id} style={{
                            background: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '0.5rem',
                            padding: '1.25rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1.2rem' }}>{icon}</span>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f1f5f9' }}>{item.title}</h3>
                                </div>
                                {rawData && (
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                                            {item.id === 'US_10Y' ? `${rawData.value}%` : rawData.value.toLocaleString()}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: isUp ? '#ef4444' : '#3b82f6' }}>
                                            {changeStr} ({rawData.pct_change.toFixed(2)}%)
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{
                                background: '#0f172a',
                                padding: '0.75rem',
                                borderRadius: '0.375rem',
                                fontSize: '0.9rem'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.25rem' }}>
                                    <span style={{ color: '#94a3b8' }}>Status</span>
                                    <span style={{ color: '#cbd5e1', fontWeight: 500 }}>{item.status}</span>
                                </div>
                                <div style={{ color: '#cbd5e1', lineHeight: '1.4' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>Interpretation</span>
                                    {item.interpretation}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DashboardLanding;
