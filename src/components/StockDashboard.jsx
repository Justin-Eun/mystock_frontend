import React, { useState } from 'react';
import { Search, TrendingUp, DollarSign, BrainCircuit, Activity, Star } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, Label } from 'recharts';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';
import DashboardLanding from './DashboardLanding'; // Import the new component
import ChatWidget from './ChatWidget'; // Import ChatWidget

const StockDashboard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [displayedCode, setDisplayedCode] = useState(''); // New: separates input from display
    const [stockName, setStockName] = useState('');
    const [stockData, setStockData] = useState(null);
    const [financials, setFinancials] = useState(null);
    const [analysis, setAnalysis] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Search Dropdown State
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    // Favorites State
    const [isFavorite, setIsFavorite] = useState(false);
    const [favorites, setFavorites] = useState([]);

    // Chart Controls State
    const [timeframe, setTimeframe] = useState('day');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // URL Location for state
    const location = useLocation();

    // Fetch favorites on mount to check status
    React.useEffect(() => {
        fetchFavorites();

        // Check if we navigated here with a stock to load
        if (location.state && location.state.loadStock) {
            const { code, name } = location.state.loadStock;
            console.log("Navigated with stock:", code);
            // Trigger load
            setSearchTerm(code);
            setDisplayedCode(code);
            setStockName(name);
            setStockData(null);
            setFinancials(null);
            setAnalysis('');
            fetchStockData(code);

            // Optional: clear state to prevent reload loop if we refreshed (though state usually persists)
            // But React Router state is per history entry, so it's fine.
            // Actually, best to clear the history state to prevent re-triggering on back/forward? 
            // For now, simple is fine.
        }

        // Listen for updates from Sidebar (Favorites toggle)
        const handleFavoritesUpdate = () => fetchFavorites();
        window.addEventListener('favoritesUpdated', handleFavoritesUpdate);

        // Listen for stock load request from Sidebar
        const handleLoadStock = (e) => {
            const { code, name } = e.detail;
            setSearchTerm(code);
            setDisplayedCode(code); // Update displayed code
            setStockName(name);

            // Reset state and fetch
            setStockData(null);
            setFinancials(null);
            setAnalysis('');
            fetchStockData(code);
        };
        window.addEventListener('loadStock', handleLoadStock);

        return () => {
            window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
            window.removeEventListener('loadStock', handleLoadStock);
        };
    }, []);

    // Check if current stock is favorite whenever favorites or displayedCode changes
    React.useEffect(() => {
        if (displayedCode && favorites.length > 0) {
            // Check by code
            const fav = favorites.find(f => f.stock_code === displayedCode);
            if (fav) {
                setIsFavorite(true);
                // If we don't have a name yet (manual search), grab it from favorites
                if (!stockName) setStockName(fav.stock_name);
            } else {
                setIsFavorite(false);
            }
        } else {
            setIsFavorite(false);
        }
    }, [displayedCode, favorites, stockName]);

    // Search Dropdown Ref
    const searchRef = React.useRef(null);

    // Click Outside Handler
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchFavorites = async () => {
        try {
            const [krRes, usRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/favorites/kr`),
                axios.get(`${API_BASE_URL}/api/favorites/us`)
            ]);
            setFavorites([...krRes.data, ...usRes.data]);
        } catch (err) {
            console.error(err);
        }
    };

    const toggleFavorite = async () => {
        if (!displayedCode) return;

        const isKR = /^\d+$/.test(displayedCode);
        const endpointBase = isKR ? `${API_BASE_URL}/api/favorites/kr` : `${API_BASE_URL}/api/favorites/us`;

        try {
            if (isFavorite) {
                // Remove
                await axios.delete(`${endpointBase}/${displayedCode}`);
                setIsFavorite(false);
            } else {
                // Add
                await axios.post(endpointBase, {
                    stock_code: displayedCode,
                    stock_name: stockName || displayedCode
                });
                setIsFavorite(true);
            }
            // Refresh local list and notify others
            await fetchFavorites();
            window.dispatchEvent(new Event('favoritesUpdated'));
        } catch (err) {
            console.error("Failed to toggle favorite", err);
            alert("Failed to update favorite status");
        }
    };

    const fetchStockData = async (code) => {
        console.log("Fetching stock data for:", code);
        setLoading(true);
        setError('');

        // Reset state
        if (!stockData) {
            setStockData(null);
            setAnalysis('');
            setFinancials(null);
        }

        try {
            console.log("Requesting Price Data...");
            // 1. Get Price Data (Critical)
            const priceRes = await axios.get(`${API_BASE_URL}/api/stock/${code}/price`, {
                params: { timeframe, start_date: startDate, end_date: endDate }
            });
            console.log("Price Data Received:", priceRes.data);

            if (priceRes.data.data && Array.isArray(priceRes.data.data)) {
                // New Format: { name: "...", data: [...] }
                setStockData(priceRes.data.data);
                setDisplayedCode(code); // Update displayed code on success
                if (priceRes.data.name) {
                    setStockName(priceRes.data.name);
                }
            } else {
                // Legacy Format: [...]
                setStockData(priceRes.data);
                setDisplayedCode(code);
            }

            // Critical data loaded, stop main loading spinner
            console.log("Setting loading to false");
            setLoading(false);

            // 2. Get Financials (Secondary)
            if (!financials) {
                console.log("Requesting Financials...");
                // Async fetch, don't block
                axios.get(`${API_BASE_URL}/api/stock/${code}/financials`)
                    .then(res => {
                        console.log("Financials Received:", res.data);
                        setFinancials(res.data);
                    })
                    .catch(err => console.error("Financials fetch failed", err));
            }

            // 3. Get AI Analysis (Slowest, Async)
            if (!analysis) {
                console.log("Requesting Analysis...");
                setAnalysis("Analyzing market data... (This may take a moment)");
                axios.post(`${API_BASE_URL}/api/analyze`, {
                    stock_code: code,
                    stock_name: stockName || code // Pass name to AI
                })
                    .then(res => {
                        console.log("Analysis Received:", res.data);
                        setAnalysis(res.data.analysis);
                    })
                    .catch(err => {
                        console.error("Analysis failed", err);
                        setAnalysis("AI Analysis unavailable at the moment.");
                    });
            }

        } catch (err) {
            console.error("Fetch Error:", err);
            const errMsg = err.response?.data?.detail || err.message || "Unknown error";
            setError(`Failed to load data: ${errMsg}`);
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        if (e.key === 'Enter' && searchTerm) {
            console.log("Starting Search:", searchTerm);
            setStockName('');
            setStockData(null);
            setFinancials(null);
            setAnalysis('');

            // Check if it looks like a code (6 digits)
            const isCode = /^\d{6}$/.test(searchTerm);
            let targetCode = searchTerm;
            let targetName = '';

            if (!isCode) {
                // Try to resolve name to code
                try {
                    setLoading(true);
                    const res = await axios.get(`${API_BASE_URL}/api/search`, { params: { q: searchTerm } });
                    const results = res.data;

                    if (results && results.length > 0) {
                        // Prefer Korean stocks (.KS or .KQ)
                        const koreanStock = results.find(r => r.symbol.endsWith('.KS') || r.symbol.endsWith('.KQ'));
                        const bestMatch = koreanStock || results[0];

                        targetCode = bestMatch.code;
                        targetName = bestMatch.name;
                        console.log(`Resolved "${searchTerm}" to ${targetCode} (${targetName})`);

                        // Update UI to show the resolved code/name
                        setSearchTerm(targetCode); // Keep input synced
                        setStockName(targetName);
                    } else {
                        setError("No stock found with that name.");
                        setLoading(false);
                        return;
                    }
                } catch (err) {
                    console.error("Search failed", err);
                    setError("Failed to search for stock.");
                    setLoading(false);
                    return;
                }
            }

            await fetchStockData(targetCode);
        }
    };

    // Auto-refresh when controls change if a stock is already selected (and we have data)
    React.useEffect(() => {
        if (stockData && displayedCode) {
            fetchStockData(displayedCode);
        }
    }, [timeframe, startDate, endDate]);

    // Feature: Date Sync
    // Determine date range based on timeframe
    React.useEffect(() => {
        const today = new Date();
        const past = new Date();
        const fmt = (d) => d.toISOString().split('T')[0];

        if (timeframe === 'day') {
            past.setDate(today.getDate() - 365); // 1 year approx for ~250 trading days
        } else if (timeframe === 'week') {
            past.setDate(today.getDate() - (365 * 3)); // 3 years
        } else if (timeframe === 'month') {
            past.setDate(today.getDate() - (365 * 5)); // 5 years
        } else if (timeframe === 'year') {
            past.setDate(today.getDate() - (365 * 10)); // 10 years
        }

        setEndDate(fmt(today));
        setStartDate(fmt(past));
    }, [timeframe]);

    // Feature: Search Debounce
    React.useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm && !/^\d{6}$/.test(searchTerm) && searchTerm.length > 1) {
                axios.get(`${API_BASE_URL}/api/search`, { params: { q: searchTerm } })
                    .then(res => {
                        // Only show if we get meaningful results (more than 0)
                        if (res.data && res.data.length > 0) {
                            setSearchResults(res.data);
                            setShowDropdown(true);
                        } else {
                            setSearchResults([]);
                            setShowDropdown(false);
                        }
                    })
                    .catch(e => {
                        console.error(e);
                        setShowDropdown(false);
                    });
            } else {
                setShowDropdown(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    console.log("Render State -> Loading:", loading, "Error:", error, "StockData:", stockData ? "Present" : "Null");

    return (
        <div>
            <div className="input-group" style={{ position: 'relative' }} ref={searchRef}>
                <div className="search-icon">
                    <Search size={20} />
                </div>
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search for a stock (e.g. Samsung, 005930)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleSearch}
                    onFocus={() => {
                        if (searchResults.length > 0) setShowDropdown(true);
                    }}
                />

                {/* Search Dropdown */}
                {showDropdown && searchResults.length > 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '0.5rem',
                        marginTop: '0.25rem',
                        zIndex: 50,
                        maxHeight: '300px',
                        overflowY: 'auto',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}>
                        {searchResults.map((item) => (
                            <div
                                key={item.code}
                                style={{
                                    padding: '0.75rem 1rem',
                                    borderBottom: '1px solid #334155',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#334155'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                onClick={() => {
                                    console.log("Selected:", item);
                                    setSearchTerm(item.code);
                                    setStockName(item.name);
                                    setStockData(null);
                                    setFinancials(null);
                                    setAnalysis('');
                                    setSearchResults([]);
                                    setShowDropdown(false);
                                    fetchStockData(item.code);
                                }}
                            >
                                <span style={{ fontWeight: 500, color: '#f8fafc' }}>{item.name}</span>
                                <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>{item.code}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {loading && (
                <div style={{ textAlign: 'center', margin: '2rem', color: '#94a3b8' }}>
                    <Activity className="animate-spin" size={32} style={{ marginBottom: '1rem' }} />
                    <p>Analyzing market data and generating insights...</p>
                </div>
            )}

            {error && (
                <div style={{ padding: '1rem', background: '#450a0a', border: '1px solid #ef4444', borderRadius: '0.5rem', color: '#fca5a5', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

            {!stockData && !loading && !error && (
                <DashboardLanding />
            )}

            {stockData && (
                <>
                    <div className="card">
                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <TrendingUp color="#3b82f6" />
                                <h2 className="card-title">
                                    {stockName ? `${stockName} (${displayedCode})` : `${displayedCode} Price Action`}
                                </h2>
                                <button
                                    onClick={toggleFavorite}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        marginLeft: '0.5rem',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                    title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                                >
                                    <Star
                                        size={24}
                                        color={isFavorite ? "#fbbf24" : "#94a3b8"}
                                        fill={isFavorite ? "#fbbf24" : "none"}
                                    />
                                </button>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <div style={{ display: 'flex', background: '#334155', borderRadius: '0.5rem', padding: '0.25rem' }}>
                                    {['day', 'week', 'month', 'year'].map(tf => (
                                        <button
                                            key={tf}
                                            onClick={() => setTimeframe(tf)}
                                            style={{
                                                background: timeframe === tf ? '#3b82f6' : 'transparent',
                                                color: timeframe === tf ? 'white' : '#94a3b8',
                                                border: 'none',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '0.25rem',
                                                cursor: 'pointer',
                                                textTransform: 'capitalize',
                                                fontSize: '0.875rem'
                                            }}
                                        >
                                            {tf}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    style={{ background: '#334155', border: 'none', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}
                                />
                                <span style={{ color: '#64748b' }}>-</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    style={{ background: '#334155', border: 'none', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}
                                />
                            </div>
                        </div>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stockData} margin={{ top: 20, right: 60, left: 20, bottom: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="date" stroke="#94a3b8" />
                                    <YAxis
                                        stroke="#94a3b8"
                                        domain={[
                                            (dataMin) => Math.floor(dataMin * 0.60),
                                            (dataMax) => Math.ceil(dataMax * 1.15)
                                        ]}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                                        itemStyle={{ color: '#f8fafc' }}
                                    />
                                    <Line type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={3} dot={false} />

                                    {/* High/Low Annotations */}
                                    {(() => {
                                        if (!stockData || stockData.length === 0) return null;

                                        let minPoint = stockData[0];
                                        let maxPoint = stockData[0];
                                        let minIdx = 0;
                                        let maxIdx = 0;

                                        stockData.forEach((p, i) => {
                                            if (p.close < minPoint.close) {
                                                minPoint = p;
                                                minIdx = i;
                                            }
                                            if (p.close > maxPoint.close) {
                                                maxPoint = p;
                                                maxIdx = i;
                                            }
                                        });

                                        const getAnchor = (idx) => {
                                            if (idx < stockData.length * 0.1) return 'start';
                                            if (idx > stockData.length * 0.9) return 'end';
                                            return 'middle';
                                        };

                                        return (
                                            <>
                                                <ReferenceDot x={minPoint.date} y={minPoint.close} r={6} fill="#f59e0b" stroke="#fff" strokeWidth={2}>
                                                    <Label
                                                        value={`Min: ${minPoint.close.toLocaleString()} (${minPoint.date})`}
                                                        position="bottom"
                                                        fill="#fbbf24"
                                                        fontSize={12}
                                                        offset={10}
                                                        textAnchor={getAnchor(minIdx)}
                                                    />
                                                </ReferenceDot>
                                                <ReferenceDot x={maxPoint.date} y={maxPoint.close} r={6} fill="#ef4444" stroke="#fff" strokeWidth={2}>
                                                    <Label
                                                        value={`Max: ${maxPoint.close.toLocaleString()} (${maxPoint.date})`}
                                                        position="top"
                                                        fill="#fca5a5"
                                                        fontSize={12}
                                                        offset={10}
                                                        textAnchor={getAnchor(maxIdx)}
                                                    />
                                                </ReferenceDot>
                                            </>
                                        );
                                    })()}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        {financials && (
                            <div className="card">
                                <div className="card-header">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <DollarSign color="#10b981" />
                                        <h2 className="card-title">Key Financials</h2>
                                    </div>
                                </div>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <tbody>
                                        {Object.entries(financials).map(([key, value]) => (
                                            <tr key={key} style={{ borderBottom: '1px solid #334155' }}>
                                                <td style={{ padding: '0.75rem 0', color: '#94a3b8', textTransform: 'capitalize' }}>{key.replace('_', ' ')}</td>
                                                <td style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: 600 }}>{value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {analysis && (
                            <div className="card" style={{ background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)', border: '1px solid #6366f1' }}>
                                <div className="card-header">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <BrainCircuit color="#818cf8" />
                                        <h2 className="card-title" style={{ color: '#818cf8' }}>AI Investment Insight</h2>
                                    </div>
                                </div>
                                <div style={{ lineHeight: '1.6', color: '#e2e8f0', whiteSpace: 'pre-line' }}>
                                    {analysis}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Chat Widget Integration */}
            <ChatWidget
                context={{
                    stockName: stockName,
                    stockCode: displayedCode,
                    stockData: stockData,
                    financials: financials,
                    analysis: analysis
                }}
            />
        </div>
    );
};

export default StockDashboard;
