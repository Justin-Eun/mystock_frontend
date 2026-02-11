
import React, { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import API_BASE_URL from '../config';

// Fallback chart data for when API doesn't provide chart images
const KR_MOCK_CHART_DATA = [
    { name: '01/12', value: 10 }, { name: '01/16', value: 45 }, { name: '01/22', value: 20 },
    { name: '01/28', value: 30 }, { name: '02/03', value: 25 }, { name: '02/09', value: 60 }
];

const AiIssueWidget = () => {
    const [country, setCountry] = useState('KR');
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchIssues = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/issue/ai`);
            const data = await response.json();

            if (data.issues && data.issues.length > 0) {
                setIssues(data.issues);
                setSelectedIssue(data.issues[0]);
                setLastUpdated(new Date().toLocaleTimeString(country === 'KR' ? 'ko-KR' : 'en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                }));
            } else if (data.error) {
                console.error("API Error:", data.error);
            }
        } catch (error) {
            console.error("Failed to fetch AI issues:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIssues();
    }, [country]);

    // Flower Layout for 50% width
    const getBubbleLayout = (index) => {
        // Center
        if (index === 0) return { x: 0, y: 0, size: 120, z: 20 };

        // Inner Ring
        const innerRadius = 90;
        if (index >= 1 && index <= 6) {
            const i = index - 1;
            const angleDeg = (i * 60) - 90;
            const angleRad = angleDeg * (Math.PI / 180);
            return {
                x: Math.cos(angleRad) * innerRadius,
                y: Math.sin(angleRad) * innerRadius,
                size: 75,
                z: 10
            };
        }

        // Outer Ring
        const outerRadius = 155;
        if (index >= 7 && index <= 12) {
            const i = index - 7;
            const angleDeg = (i * 60) - 60;
            const angleRad = angleDeg * (Math.PI / 180);
            return {
                x: Math.cos(angleRad) * outerRadius,
                y: Math.sin(angleRad) * outerRadius,
                size: 60,
                z: 5
            };
        }

        return { display: 'none' };
    };

    const getBubbleStyle = (index) => {
        const layout = getBubbleLayout(index);
        if (layout.display === 'none') return layout;

        const isSelected = selectedIssue?.id === issues[index]?.id;

        // Colors
        let bgColor = '#ef4444';
        if (index === 0) bgColor = '#ef4444';
        else if (index % 2 !== 0) bgColor = '#3b82f6';
        else bgColor = '#ec4899';

        return {
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(calc(-50% + ${layout.x}px), calc(-50% + ${layout.y}px)) ${isSelected ? 'scale(1.15)' : 'scale(1)'}`,
            width: `${layout.size}px`,
            height: `${layout.size}px`,
            backgroundColor: bgColor,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: index === 0 ? '1.2rem' : '0.8rem',
            boxShadow: isSelected ? '0 0 15px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            border: isSelected ? '3px solid white' : 'none',
            zIndex: isSelected ? 50 : layout.z,
            transition: 'transform 0.3s ease',
            whiteSpace: 'pre-wrap',
            padding: '2px',
            lineHeight: '1.2'
        };
    };

    return (
        <div className="mb-32">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <h2 className="text-2xl font-bold whitespace-nowrap text-white">AI 이슈 포착</h2>
                    <div className="flex bg-[#0f172a] rounded-full p-1 border border-[#334155]">
                        <button
                            onClick={() => setCountry('KR')}
                            style={{ minWidth: '60px' }}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${country === 'KR' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            한국
                        </button>
                        <button
                            onClick={() => setCountry('US')}
                            style={{ minWidth: '60px' }}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${country === 'US' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            미국
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400">
                    {lastUpdated && <span>{lastUpdated} 기준</span>}
                    <button onClick={fetchIssues} className="p-1 hover:bg-[#334155] rounded-full">
                        <RefreshCw className={`w-4 h-4 text-white ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* TWO SEPARATE CARDS LAYOUT - DARK THEME APPLIED */}
            <div className="flex flex-row gap-8 w-full">

                {/* LEFT CARD: BUBBLE CHART */}
                <div className="w-1/2 bg-slate-800 rounded-3xl relative overflow-hidden shadow-xl border border-slate-700 hover:border-blue-500 transition-colors" style={{ height: '580px' }}>
                    {selectedIssue && selectedIssue.bubble_chart_image ? (
                        <div className="absolute inset-0 flex items-center justify-center p-4">
                            <img
                                src={selectedIssue.bubble_chart_image}
                                alt="키워드 버블 차트"
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative w-full h-full">
                                {/* Center Point for Bubbles */}
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    {loading ? (
                                        <div className="text-gray-400 text-center">Loading...</div>
                                    ) : (
                                        issues.slice(0, 13).map((issue, idx) => (
                                            <div
                                                key={issue.id}
                                                style={getBubbleStyle(idx)}
                                                onClick={() => setSelectedIssue(issue)}
                                            >
                                                {issue.keyword}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT CARD: KEYWORD ANALYSIS */}
                <div className="w-1/2 bg-slate-800 rounded-3xl p-8 flex flex-col shadow-xl border border-slate-700 hover:border-blue-500 transition-colors" style={{ height: '580px' }}>
                    {selectedIssue ? (
                        selectedIssue.detail_image ? (
                            // Show full detail screenshot if available
                            <div className="flex-1 flex items-center justify-center">
                                <img
                                    src={selectedIssue.detail_image}
                                    alt={`${selectedIssue.keyword} 상세 정보`}
                                    className="max-w-full max-h-full object-contain rounded-lg"
                                />
                            </div>
                        ) : (
                            // Show original layout with mock/real data
                            <>
                                <div className="mb-4 border-b border-slate-700 pb-4">
                                    <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block mb-1">KEYWORD ANALYSIS</span>
                                    <div className="flex items-end justify-between">
                                        <h3 className="text-3xl font-extrabold text-white leading-tight">{selectedIssue.keyword}</h3>
                                        <span className="text-2xl font-mono text-yellow-500 font-bold">#{selectedIssue.rank}</span>
                                    </div>
                                    <p className="text-sm text-slate-400 mt-1">검색빈도 및 종목 누적 등락률</p>
                                </div>

                                {/* Chart Area */}
                                <div className="w-full relative mb-4" style={{ height: '200px' }}>
                                    {selectedIssue.chart_image ? (
                                        <img
                                            src={selectedIssue.chart_image}
                                            alt={`${selectedIssue.keyword} 차트`}
                                            className="w-full h-full object-contain rounded-lg"
                                        />
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={KR_MOCK_CHART_DATA}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} stroke="#94a3b8" dy={10} />
                                                <YAxis axisLine={false} tickLine={false} fontSize={11} stroke="#94a3b8" />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #475569', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)' }}
                                                    itemStyle={{ color: '#f8fafc' }}
                                                />
                                                <Line type="monotone" dataKey="value" stroke="#f87171" strokeWidth={3} dot={{ r: 4, fill: '#f87171' }} activeDot={{ r: 6 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>

                                {/* Info Rows */}
                                <div className="mt-auto flex flex-col gap-3">
                                    <div className="flex items-center justify-between text-sm bg-slate-700/50 p-4 rounded-xl border border-slate-600">
                                        <span className="text-slate-300 font-bold">주요 관련주</span>
                                        <div className="flex gap-2">
                                            <span className="text-white font-bold">삼성전자</span>
                                            <span className="text-red-400 font-bold">+18%</span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-700/50 p-5 rounded-xl border border-slate-600 flex-1">
                                        <span className="text-slate-400 text-xs font-bold block mb-2">AI NEWS SUMMARY</span>
                                        <p className="text-sm text-slate-200 leading-relaxed font-medium">
                                            {selectedIssue.summary || selectedIssue.headline ||
                                                `"${selectedIssue.keyword}" 관련 기술주들의 상승세가 지속되며, 기관 투자자들의 매수세가 집중되고 있습니다.`}
                                        </p>
                                    </div>
                                </div>
                            </>
                        )
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <TrendingUp className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-lg font-medium text-gray-500">좌측에서 키워드를 선택해주세요.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default AiIssueWidget;
