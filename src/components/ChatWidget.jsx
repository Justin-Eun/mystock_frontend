import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Minimize2, Maximize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import axios from 'axios';
import API_BASE_URL from '../config';

const ChatWidget = ({ context }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: '안녕하세요! 금융 AI 비서입니다. 현재 보고 계신 주식이나 시장 상황에 대해 무엇이든 물어보세요.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Prepare history for API (exclude system messages if any, though frontend only has user/assistant)
            const history = messages.map(m => ({ role: m.role, content: m.content }));

            const response = await axios.post(`${API_BASE_URL}/api/chat`, {
                message: userMessage.content,
                history: history,
                context: context // context passed from parent
            });

            const assistantMessage = { role: 'assistant', content: response.data.response };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: '죄송합니다. 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 1000,
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Chat Button (when closed) */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '60px',
                        height: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)',
                        transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <MessageSquare size={28} />
                </button>
            )}

            {/* Chat Window (when open) */}
            {isOpen && (
                <div style={{
                    width: '380px',
                    height: '600px',
                    background: 'rgba(30, 41, 59, 0.95)', // Glass effect base
                    backdropFilter: 'blur(12px)',
                    borderRadius: '1.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    animation: 'slideUp 0.3s ease-out'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '1.25rem',
                        background: 'rgba(15, 23, 42, 0.6)',
                        borderBottom: '1px solid rgba(71, 85, 105, 0.5)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        color: 'white'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Bot size={18} color="white" />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>AI Financial Analyst</h3>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }}></span>
                                    Online
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div style={{
                        flex: 1,
                        padding: '1rem',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        scrollBehavior: 'smooth'
                    }}>
                        {messages.map((msg, index) => (
                            <div key={index} style={{
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '85%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
                            }}>
                                <div style={{
                                    padding: '0.75rem 1rem',
                                    borderRadius: msg.role === 'user' ? '1.25rem 1.25rem 0.25rem 1.25rem' : '1.25rem 1.25rem 1.25rem 0.25rem',
                                    background: msg.role === 'user'
                                        ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                                        : 'rgba(51, 65, 85, 0.8)',
                                    color: msg.role === 'user' ? 'white' : '#f1f5f9',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    fontSize: '0.925rem',
                                    lineHeight: '1.5'
                                }}>
                                    {msg.role === 'assistant' ? (
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                p: ({ node, ...props }) => <p style={{ margin: '0.5em 0' }} {...props} />,
                                                ul: ({ node, ...props }) => <ul style={{ paddingLeft: '1.5em', margin: '0.5em 0' }} {...props} />,
                                                ol: ({ node, ...props }) => <ol style={{ paddingLeft: '1.5em', margin: '0.5em 0' }} {...props} />,
                                                code: ({ node, inline, className, children, ...props }) => {
                                                    const match = /language-(\w+)/.exec(className || '')
                                                    return !inline && match ? (
                                                        <div style={{ background: '#0f172a', padding: '0.5em', borderRadius: '0.25rem', overflowX: 'auto', margin: '0.5em 0' }}>
                                                            <code className={className} {...props}>
                                                                {children}
                                                            </code>
                                                        </div>
                                                    ) : (
                                                        <code style={{ background: 'rgba(0,0,0,0.2)', padding: '0.1em 0.3em', borderRadius: '0.2em', fontFamily: 'monospace' }} {...props}>
                                                            {children}
                                                        </code>
                                                    )
                                                }
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    ) : (
                                        msg.content
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div style={{ alignSelf: 'flex-start', marginLeft: '1rem', color: '#94a3b8' }}>
                                <span className="typing-indicator" style={{ display: 'flex', gap: '4px' }}>
                                    <span className="dot" style={{ animationDelay: '0s' }}>•</span>
                                    <span className="dot" style={{ animationDelay: '0.2s' }}>•</span>
                                    <span className="dot" style={{ animationDelay: '0.4s' }}>•</span>
                                </span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div style={{
                        padding: '1rem',
                        borderTop: '1px solid rgba(71, 85, 105, 0.5)',
                        background: 'rgba(15, 23, 42, 0.4)'
                    }}>
                        <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            background: 'rgba(30, 41, 59, 1)',
                            borderRadius: '1.5rem',
                            padding: '0.5rem 0.5rem 0.5rem 1.25rem',
                            border: '1px solid rgba(71, 85, 105, 0.5)',
                            alignItems: 'center'
                        }}>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="무엇이든 물어보세요..."
                                disabled={isLoading}
                                style={{
                                    flex: 1,
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'white',
                                    outline: 'none',
                                    fontSize: '0.95rem'
                                }}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    background: (!input.trim() || isLoading) ? '#475569' : '#3b82f6',
                                    border: 'none',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: (!input.trim() || isLoading) ? 'not-allowed' : 'pointer',
                                    transition: 'background 0.2s'
                                }}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .dot { animation: pulse 1.4s infinite; font-size: 1.5rem; line-height: 1rem; }
                @keyframes pulse {
                    0%, 100% { opacity: 0.2; }
                    50% { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default ChatWidget;
