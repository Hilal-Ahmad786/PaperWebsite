'use client';

import { useTranslations } from 'next-intl';
import { FaWhatsapp, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import { trackContactClick } from '@/lib/analytics';
import { beaconTrack } from '@/lib/tracking/beacon';

// {{TODO: Domain-E-Mail bestätigen (info@papermarketworld.com)}}
const CONTACT_EMAIL = 'info@papermarketworld.com';
const WHATSAPP_NUMBER = '436602492186';
const PHONE_NUMBER = '+436602492186';

/**
 * Floating contact buttons (WhatsApp / Call / Email). The live-chat panel was
 * removed — there is no staffed chat — leaving just the quick-contact actions.
 */
export function ChatWidget() {
    const t = useTranslations();

    const buttonClass =
        'group flex flex-col md:flex-row items-center justify-center md:justify-between md:w-44 p-1 md:py-2 md:pl-5 md:pr-1.5 md:bg-[#1E293B] md:border md:border-border-primary/50 rounded-lg md:rounded-full cursor-pointer transition-all duration-200 md:hover:bg-brand-primary/10 md:hover:border-brand-primary md:hover:-translate-x-2 md:shadow-lg';
    const iconWrapClass =
        'w-8 h-8 md:w-9 md:h-9 rounded-full bg-transparent md:bg-brand-primary/15 flex items-center justify-center order-1 md:order-2';
    const labelClass =
        'text-[10px] md:text-sm font-medium text-text-primary order-2 md:order-1 mt-1 md:mt-0';

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:bottom-6 md:right-6 md:w-auto md:left-auto">
            {/* Floating Action Buttons - Mobile: Bottom Bar, Desktop: Floating Stack */}
            <div className="flex flex-row md:flex-col items-center justify-around md:justify-end md:items-end gap-0 md:gap-2.5 bg-background-secondary/95 backdrop-blur-lg md:bg-transparent border-t border-border-primary md:border-0 p-2 md:p-0 shadow-[0_-4px_10px_rgba(0,0,0,0.1)] md:shadow-none w-full md:w-auto pb-safe">
                {/* WhatsApp */}
                <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                        trackContactClick({ contactMethod: 'whatsapp', clickLocation: 'floating_widget', sourceComponent: 'chat_widget' });
                        beaconTrack('whatsapp_click', { location: 'floating_widget' });
                    }}
                    className={buttonClass}
                    aria-label="WhatsApp"
                >
                    <span className={labelClass}>WhatsApp</span>
                    <div className={iconWrapClass}>
                        <FaWhatsapp className="w-6 h-6 md:w-[18px] md:h-[18px] text-brand-primary" />
                    </div>
                </a>

                {/* Phone */}
                <a
                    href={`tel:${PHONE_NUMBER}`}
                    onClick={() => {
                        trackContactClick({ contactMethod: 'phone', clickLocation: 'floating_widget', sourceComponent: 'chat_widget' });
                        beaconTrack('phone_click', { location: 'floating_widget' });
                    }}
                    className={buttonClass}
                    aria-label={t('chat.callUs')}
                >
                    <span className={labelClass}>{t('chat.callUs')}</span>
                    <div className={iconWrapClass}>
                        <FaPhoneAlt className="w-5 h-5 md:w-4 md:h-4 text-brand-primary" />
                    </div>
                </a>

                {/* Email */}
                <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    onClick={() => {
                        trackContactClick({ contactMethod: 'email', clickLocation: 'floating_widget', sourceComponent: 'chat_widget' });
                        beaconTrack('email_click', { location: 'floating_widget' });
                    }}
                    className={buttonClass}
                    aria-label={t('chat.emailUs')}
                >
                    <span className={labelClass}>{t('chat.emailUs')}</span>
                    <div className={iconWrapClass}>
                        <FaEnvelope className="w-5 h-5 md:w-4 md:h-4 text-brand-primary" />
                    </div>
                </a>
            </div>
        </div>
    );
}
