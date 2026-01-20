import React, { useState, useEffect } from 'react';
import { Star, BarChart2, TrendingUp } from 'lucide-react';
import axios from 'axios';

const Sidebar = () => {
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        fetchFavorites();

        // Listen for updates from StockDashboard
        const handleFavoritesUpdate = () => fetchFavorites();
        window.addEventListener('favoritesUpdated', handleFavoritesUpdate);

        return () => window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
    }, []);

    const fetchFavorites = async () => {
        try {
            const response = await axios.get('http://localhost:8001/api/favorites');
            setFavorites(response.data);
        } catch (error) {
            console.error("Failed to fetch favorites", error);
        }
    };

    const handleRemoveFavorite = async (stockCode) => {
        try {
            await axios.delete(`http://localhost:8001/api/favorites/code/${stockCode}`);
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
                <div className="nav-item active">
                    <BarChart2 size={20} />
                    <span>Dashboard</span>
                </div>

                <div style={{ padding: '1rem 0', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    My Work
                </div>

                {favorites.length === 0 ? (
                    <div style={{ padding: '0 1rem', color: '#64748b', fontSize: '0.9rem' }}>
                        No favorites yet.
                    </div>
                ) : (
                    favorites.map((fav) => (
                        <div key={fav.id} className="nav-item" style={{ justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span
                                    style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveFavorite(fav.stock_code);
                                    }}
                                >
                                    <Star size={16} fill="#fbbf24" color="#fbbf24" />
                                </span>
                                <span
                                    style={{ cursor: 'pointer', flex: 1 }}
                                    onClick={() => {
                                        window.dispatchEvent(new CustomEvent('loadStock', {
                                            detail: { code: fav.stock_code, name: fav.stock_name }
                                        }));
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
