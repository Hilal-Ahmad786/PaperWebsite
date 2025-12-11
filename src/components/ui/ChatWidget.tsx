'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import {
    X,
    Minus,
    Send,
    User,
    MessageCircle
} from 'lucide-react';
import { FaWhatsapp, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'agent';
    timestamp: Date;
}

interface ChatWidgetProps {
    agentName?: string;
    agentAvatar?: string;
    isOnline?: boolean;
    onSendMessage?: (message: string) => void;
}

export function ChatWidget({
    agentName = 'Support Agent',
    agentAvatar,
    isOnline = true,
    onSendMessage
}: ChatWidgetProps) {
    const t = useTranslations();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    // Sound effect
    const playNotificationSound = () => {
        try {
            const audio = new Audio('data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
            audio.play().catch(() => { });
        } catch (e) {
            // Ignore audio errors
        }
    };

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleStartChat = (e: React.FormEvent) => {
        e.preventDefault();
        setHasStarted(true);
        if (formData.message) {
            addMessage(formData.message, 'user');
            simulateAgentResponse();
        }
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        addMessage(inputValue, 'user');
        onSendMessage?.(inputValue);
        setInputValue('');
        simulateAgentResponse();
    };

    const addMessage = (text: string, sender: 'user' | 'agent') => {
        const newMessage: Message = {
            id: Date.now().toString(),
            text,
            sender,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, newMessage]);

        if (sender === 'agent' && (isMinimized || !isOpen)) {
            setUnreadCount(prev => prev + 1);
            playNotificationSound();
        }
    };

    const simulateAgentResponse = () => {
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            addMessage(t('chat.agentResponse'), 'agent');
        }, 2000);
    };

    const toggleChat = () => {
        if (isMinimized) {
            setIsMinimized(false);
            setIsOpen(true);
        } else {
            setIsOpen(!isOpen);
        }
        if (!isOpen) setUnreadCount(0);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:bottom-6 md:right-6 md:w-auto md:left-auto">
            {/* Chat Window */}
            {(isOpen && !isMinimized) && (
                <div className="fixed inset-0 w-full h-full z-[60] md:absolute md:bottom-20 md:right-0 md:w-[380px] md:h-[600px] md:max-w-[calc(100vw-48px)] md:max-h-[calc(100vh-120px)] bg-background-secondary border border-border-primary md:rounded-2xl rounded-none shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-brand-primary to-brand-secondary p-4 flex items-center justify-between text-white shadow-md flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border border-white/30">
                                    {agentAvatar ? (
                                        <img src={agentAvatar} alt={agentName} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-6 h-6" />
                                    )}
                                </div>
                                {isOnline && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-brand-primary rounded-full shadow-sm" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-sm tracking-wide">{agentName}</h3>
                                <p className="text-xs text-white/90 font-light">
                                    {isOnline ? t('chat.online') : t('chat.offline')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setIsMinimized(true)}
                                className="p-1.5 hover:bg-white/20 rounded-full transition-colors md:block hidden"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    {!hasStarted ? (
                        // Pre-chat Form
                        <div className="flex-1 p-6 flex flex-col justify-center bg-background-primary overflow-y-auto">
                            <div className="text-center mb-8">
                                <h4 className="text-xl font-bold text-text-primary mb-2">
                                    {t('chat.welcomeTitle')}
                                </h4>
                                <p className="text-sm text-text-secondary leading-relaxed">
                                    {t('chat.welcomeSubtitle')}
                                </p>
                            </div>
                            <form onSubmit={handleStartChat} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-text-secondary uppercase tracking-wider pl-1">
                                        {t('contact.form.name')}
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-background-tertiary border border-border-primary rounded-lg px-4 py-2.5 text-sm text-text-primary focus:border-brand-primary outline-none transition-all shadow-sm focus:shadow-md"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-text-secondary uppercase tracking-wider pl-1">
                                        {t('contact.form.email')}
                                    </label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full bg-background-tertiary border border-border-primary rounded-lg px-4 py-2.5 text-sm text-text-primary focus:border-brand-primary outline-none transition-all shadow-sm focus:shadow-md"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-text-secondary uppercase tracking-wider pl-1">
                                        {t('contact.form.message')}
                                    </label>
                                    <textarea
                                        required
                                        rows={3}
                                        className="w-full bg-background-tertiary border border-border-primary rounded-lg px-4 py-2.5 text-sm text-text-primary focus:border-brand-primary outline-none resize-none transition-all shadow-sm focus:shadow-md"
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="How can we help you?"
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-brand-primary hover:bg-brand-secondary text-white shadow-lg transform active:scale-[0.98] transition-all py-6">
                                    {t('chat.startChat')}
                                </Button>
                            </form>
                        </div>
                    ) : (
                        // Message List
                        <>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background-tertiary/30 scrollbar-thin scrollbar-thumb-border-primary scrollbar-track-transparent">
                                <div className="space-y-4">
                                    {messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                "flex w-max max-w-[85%]",
                                                msg.sender === 'user' ? "ml-auto" : "mr-auto"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "px-4 py-3 rounded-2xl text-sm shadow-sm",
                                                    msg.sender === 'user'
                                                        ? "bg-brand-primary text-white rounded-br-none"
                                                        : "bg-white dark:bg-background-secondary border border-border-primary text-text-primary rounded-bl-none"
                                                )}
                                            >
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                    {isTyping && (
                                        <div className="flex mr-auto max-w-[85%]">
                                            <div className="bg-white dark:bg-background-secondary border border-border-primary px-4 py-3 rounded-2xl rounded-bl-none flex gap-1 shadow-sm">
                                                <span className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>

                            {/* Input Area */}
                            <form onSubmit={handleSendMessage} className="p-4 bg-background-primary border-t border-border-primary flex-shrink-0">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder={t('chat.placeholder')}
                                        className="flex-1 bg-background-tertiary border border-border-primary rounded-full px-5 py-2.5 text-sm text-text-primary focus:border-brand-primary outline-none shadow-inner"
                                        value={inputValue}
                                        onChange={e => setInputValue(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!inputValue.trim()}
                                        className="p-2.5 bg-brand-primary text-white rounded-full hover:bg-brand-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform active:scale-95"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </form>
                        </>
                    )}

                    {/* Footer */}
                    <div className="px-4 py-2 bg-background-tertiary border-t border-border-primary/50 text-center flex-shrink-0">
                        <span className="text-[10px] text-text-tertiary">
                            Powered by <span className="font-semibold text-brand-primary">PakSoft</span>
                        </span>
                    </div>
                </div>
            )}

            {/* Floating Action Buttons - Mobile: Bottom Bar, Desktop: Floating Stack */}
            <div className="flex flex-row md:flex-col items-center justify-around md:justify-end md:items-end gap-0 md:gap-2.5 bg-background-secondary/95 backdrop-blur-lg md:bg-transparent border-t border-border-primary md:border-0 p-2 md:p-0 shadow-[0_-4px_10px_rgba(0,0,0,0.1)] md:shadow-none w-full md:w-auto pb-safe">
                {/* WhatsApp */}
                <a
                    href="https://wa.me/436602492186"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col md:flex-row items-center justify-center md:justify-between md:w-44 p-1 md:py-2 md:pl-5 md:pr-1.5 md:bg-[#1E293B] md:border md:border-border-primary/50 rounded-lg md:rounded-full cursor-pointer transition-all duration-200 md:hover:bg-brand-primary/10 md:hover:border-brand-primary md:hover:-translate-x-2 md:shadow-lg"
                    aria-label="WhatsApp"
                >
                    <span className="text-[10px] md:text-sm font-medium text-text-primary order-2 md:order-1 mt-1 md:mt-0">WhatsApp</span>
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-transparent md:bg-brand-primary/15 flex items-center justify-center order-1 md:order-2">
                        <FaWhatsapp className="w-6 h-6 md:w-[18px] md:h-[18px] text-brand-primary" />
                    </div>
                </a>

                {/* Phone */}
                <a
                    href="tel:+436602492186"
                    className="group flex flex-col md:flex-row items-center justify-center md:justify-between md:w-44 p-1 md:py-2 md:pl-5 md:pr-1.5 md:bg-[#1E293B] md:border md:border-border-primary/50 rounded-lg md:rounded-full cursor-pointer transition-all duration-200 md:hover:bg-brand-primary/10 md:hover:border-brand-primary md:hover:-translate-x-2 md:shadow-lg"
                    aria-label="Call Us"
                >
                    <span className="text-[10px] md:text-sm font-medium text-text-primary order-2 md:order-1 mt-1 md:mt-0">{t('chat.callUs') || 'Call Us'}</span>
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-transparent md:bg-brand-primary/15 flex items-center justify-center order-1 md:order-2">
                        <FaPhoneAlt className="w-5 h-5 md:w-4 md:h-4 text-brand-primary" />
                    </div>
                </a>

                {/* Email */}
                <a
                    href="mailto:papermarketworld@gmail.com"
                    className="group flex flex-col md:flex-row items-center justify-center md:justify-between md:w-44 p-1 md:py-2 md:pl-5 md:pr-1.5 md:bg-[#1E293B] md:border md:border-border-primary/50 rounded-lg md:rounded-full cursor-pointer transition-all duration-200 md:hover:bg-brand-primary/10 md:hover:border-brand-primary md:hover:-translate-x-2 md:shadow-lg"
                    aria-label="Email Us"
                >
                    <span className="text-[10px] md:text-sm font-medium text-text-primary order-2 md:order-1 mt-1 md:mt-0">{t('chat.emailUs') || 'Email'}</span>
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-transparent md:bg-brand-primary/15 flex items-center justify-center order-1 md:order-2">
                        <FaEnvelope className="w-5 h-5 md:w-4 md:h-4 text-brand-primary" />
                    </div>
                </a>

                {/* Chat Toggle Button */}
                <button
                    onClick={toggleChat}
                    className={cn(
                        "relative group flex flex-col md:flex-row items-center justify-center md:justify-between md:w-44 p-1 md:py-2 md:pl-5 md:pr-1.5 rounded-lg md:rounded-full cursor-pointer transition-all duration-200 md:shadow-lg",
                        isOpen && !isMinimized
                            ? "md:bg-brand-primary md:border md:border-brand-primary md:hover:bg-brand-secondary text-brand-primary md:text-white"
                            : "md:bg-[#1E293B] md:border md:border-border-primary/50 md:hover:bg-brand-primary/10 md:hover:border-brand-primary md:hover:-translate-x-2"
                    )}
                    aria-label="Live Chat"
                >
                    <span className={cn(
                        "text-[10px] md:text-sm font-medium order-2 md:order-1 mt-1 md:mt-0",
                        isOpen && !isMinimized ? "text-brand-primary md:text-white" : "text-text-primary"
                    )}>
                        {isOpen && !isMinimized ? (t('chat.close') || 'Close') : (t('chat.liveChat') || 'Live Chat')}
                    </span>
                    <div className={cn(
                        "w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center transition-colors order-1 md:order-2",
                        isOpen && !isMinimized
                            ? "bg-transparent md:bg-white/20"
                            : "bg-transparent md:bg-brand-primary/15"
                    )}>
                        {isOpen && !isMinimized ? (
                            <X className={cn(
                                "w-6 h-6 md:w-[18px] md:h-[18px]",
                                isOpen && !isMinimized ? "text-brand-primary md:text-white" : "text-brand-primary"
                            )} />
                        ) : (
                            <MessageCircle className="w-6 h-6 md:w-[18px] md:h-[18px] text-brand-primary" />
                        )}
                    </div>


                    {/* Unread Badge */}
                    {unreadCount > 0 && !(isOpen && !isMinimized) && (
                        <div className="absolute top-0 right-2 md:-top-1 md:-right-1 w-4 h-4 md:w-5 md:h-5 bg-red-500 rounded-full border md:border-2 border-[#1E293B] flex items-center justify-center text-[10px] font-bold text-white animate-pulse">
                            {unreadCount}
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
}