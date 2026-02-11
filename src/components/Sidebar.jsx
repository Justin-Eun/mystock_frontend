import React, { useState, useEffect } from 'react';
import { Star, BarChart2, TrendingUp, FileText } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [favoritesKR, setFavoritesKR] = useState([]);
    const [favoritesUS, setFavoritesUS] = useState([]);

    const goHome = () => navigate('/');
    const goReports = () => navigate('/reports');

    useEffect(() => {
        fetchFavorites();

        // Listen for updates from StockDashboard
        const handleFavoritesUpdate = () => fetchFavorites();
        window.addEventListener('favoritesUpdated', handleFavoritesUpdate);

        return () => window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
    }, []);

    const fetchFavorites = async () => {
        try {
            const [krRes, usRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/favorites/kr`),
                axios.get(`${API_BASE_URL}/api/favorites/us`)
            ]);
            setFavoritesKR(krRes.data);
            setFavoritesUS(usRes.data);
        } catch (error) {
            console.error("Failed to fetch favorites", error);
            // Fallback for demo if DB is down
            setFavoritesKR([
                { id: 'mock1', stock_code: '005930', stock_name: '삼성전자 (DB연결안됨)' },
                { id: 'mock2', stock_code: '000660', stock_name: 'SK하이닉스 (예시)' }
            ]);
        }
    };

    const handleRemoveFavorite = async (stockCode, type) => {
        try {
            const endpoint = type === 'KR'
                ? `${API_BASE_URL}/api/favorites/kr/${stockCode}`
                : `${API_BASE_URL}/api/favorites/us/${stockCode}`;
            await axios.delete(endpoint);
            await fetchFavorites();
            // Notify other components (StockDashboard)
            window.dispatchEvent(new Event('favoritesUpdated'));
        } catch (error) {
            console.error("Failed to remove favorite", error);
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <TrendingUp color="#3b82f6" />
                <span>StockAI</span>
            </div>

            <div className="sidebar-nav">
                <div
                    className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
                    onClick={goHome}
                >
                    <BarChart2 size={20} />
                    <span>Dashboard</span>
                </div>

                <div
                    className={`nav-item ${location.pathname === '/reports' ? 'active' : ''}`}
                    onClick={goReports}
                >
                    <FileText size={20} />
                    <span>Reports</span>
                </div>

                <div style={{ padding: '1rem 0', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Korean Stocks
                </div>
                {favoritesKR.length === 0 ? (
                    <div style={{ padding: '0 1rem', color: '#64748b', fontSize: '0.9rem' }}>
                        No Korean stocks.
                    </div>
                ) : (
                    favoritesKR.map((fav) => (
                        <div key={fav.id} className="nav-item" style={{ justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span
                                    style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveFavorite(fav.stock_code, 'KR');
                                    }}
                                >
                                    <Star size={16} fill="#fbbf24" color="#fbbf24" />
                                </span>
                                <span
                                    style={{ cursor: 'pointer', flex: 1 }}
                                    onClick={() => {
                                        if (location.pathname !== '/') {
                                            navigate('/', {
                                                state: {
                                                    loadStock: { code: fav.stock_code, name: fav.stock_name }
                                                }
                                            });
                                        } else {
                                            window.dispatchEvent(new CustomEvent('loadStock', {
                                                detail: { code: fav.stock_code, name: fav.stock_name }
                                            }));
                                        }
                                    }}
                                >
                                    {fav.stock_name} ({fav.stock_code})
                                </span>
                            </div>
                        </div>
                    ))
                )}

                <div style={{ padding: '1rem 0', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    US Stocks
                </div>
                {favoritesUS.length === 0 ? (
                    <div style={{ padding: '0 1rem', color: '#64748b', fontSize: '0.9rem' }}>
                        No US stocks.
                    </div>
                ) : (
                    favoritesUS.map((fav) => (
                        <div key={fav.id} className="nav-item" style={{ justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span
                                    style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveFavorite(fav.stock_code, 'US');
                                    }}
                                >
                                    <Star size={16} fill="#fbbf24" color="#fbbf24" />
                                </span>
                                <span
                                    style={{ cursor: 'pointer', flex: 1 }}
                                    onClick={() => {
                                        if (location.pathname !== '/') {
                                            navigate('/', {
                                                state: {
                                                    loadStock: { code: fav.stock_code, name: fav.stock_name }
                                                }
                                            });
                                        } else {
                                            window.dispatchEvent(new CustomEvent('loadStock', {
                                                detail: { code: fav.stock_code, name: fav.stock_name }
                                            }));
                                        }
                                    }}
                                >
                                    {fav.stock_name} ({fav.stock_code})
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
