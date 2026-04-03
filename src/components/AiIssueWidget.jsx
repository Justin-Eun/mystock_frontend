import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import API_BASE_URL from '../config';

const AiIssueWidget = () => {
    const [country, setCountry] = useState('KR');
    const [screenshotUrl, setScreenshotUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [imgLoading, setImgLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [error, setError] = useState(null);

    const fetchIssues = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/issue/ai`);
            const data = await response.json();

            if (data.bubbleCharts) {
                const market = country === 'KR' ? 'kr' : 'us';
                const chartUrl = data.bubbleCharts[market];
                if (chartUrl) {
                    // Add cache-busting param
                    setScreenshotUrl(`${chartUrl}?t=${Date.now()}`);
                    setImgLoading(true);
                }
            }

            if (data.error) {
                console.error("API Error:", data.error);
                setError(data.error);
            }

            setLastUpdated(new Date().toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit'
            }));
        } catch (err) {
            console.error("Failed to fetch AI issues:", err);
            setError("데이터를 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    }, [country]);

    useEffect(() => {
        fetchIssues();
    }, [fetchIssues]);

    const handleCountryChange = (newCountry) => {
        if (newCountry !== country) {
            setCountry(newCountry);
            setImgLoading(true);
        }
    };

    return (
        <div style={{
            background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
            border: '1px solid #334155',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h2 style={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: '#f1f5f9',
                        margin: 0,
                        whiteSpace: 'nowrap'
                    }}>
                        AI 이슈 포착
                    </h2>

                    {/* Country Tabs */}
                    <div style={{
                        display: 'flex',
                        background: '#0f172a',
                        borderRadius: '9999px',
                        padding: '3px',
                        border: '1px solid #334155'
                    }}>
                        {['KR', 'US'].map((c) => (
                            <button
                                key={c}
                                onClick={() => handleCountryChange(c)}
                                style={{
                                    padding: '0.3rem 0.75rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    minWidth: '50px',
                                    background: country === c ? '#3b82f6' : 'transparent',
                                    color: country === c ? '#fff' : '#9ca3af'
                                }}
                            >
                                {c === 'KR' ? '한국' : '미국'}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {lastUpdated && (
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                            {lastUpdated} 기준
                        </span>
                    )}
                    <button
                        onClick={fetchIssues}
                        disabled={loading}
                        style={{
                            padding: '0.25rem',
                            background: 'none',
                            border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                        title="새로고침"
                    >
                        <RefreshCw
                            size={14}
                            color="#94a3b8"
                            style={{
                                animation: loading ? 'spin 1s linear infinite' : 'none'
                            }}
                        />
                    </button>
                </div>
            </div>

            {/* Screenshot Content - Single Card */}
            <div style={{
                background: '#fff',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                position: 'relative',
                minHeight: '300px'
            }}>
                {/* Loading Spinner Overlay */}
                {(loading || imgLoading) && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255, 255, 255, 0.9)',
                        zIndex: 10
                    }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            border: '3px solid #e2e8f0',
                            borderTop: '3px solid #3b82f6',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite'
                        }} />
                        <p style={{
                            marginTop: '0.75rem',
                            color: '#64748b',
                            fontSize: '0.85rem'
                        }}>
                            ThinkPool 데이터 로딩 중...
                        </p>
                    </div>
                )}

                {/* Error State */}
                {error && !screenshotUrl && !loading && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '3rem',
                        color: '#ef4444'
                    }}>
                        <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</p>
                        <button
                            onClick={fetchIssues}
                            style={{
                                padding: '0.5rem 1rem',
                                background: '#334155',
                                border: 'none',
                                borderRadius: '0.25rem',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                            }}
                        >
                            다시 시도
                        </button>
                    </div>
                )}

                {/* ThinkPool Screenshot Image */}
                {screenshotUrl && (
                    <a
                        href="https://www.thinkpool.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <img
                            src={screenshotUrl}
                            alt={`ThinkPool AI 이슈 포착 - ${country === 'KR' ? '한국' : '미국'}`}
                            onLoad={() => setImgLoading(false)}
                            onError={() => {
                                setImgLoading(false);
                                setError("이미지를 불러올 수 없습니다.");
                            }}
                            style={{
                                width: '100%',
                                height: 'auto',
                                display: imgLoading ? 'none' : 'block',
                                objectFit: 'contain',
                                cursor: 'pointer'
                            }}
                        />
                    </a>
                )}
            </div>

            {/* CSS Animation */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default AiIssueWidget;
