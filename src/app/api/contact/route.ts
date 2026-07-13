import { NextResponse } from 'next/server';
import { isDbConfigured, db } from '@/db';
import { leads } from '@/db/schema';
import { verifyTurnstile } from '@/lib/security/turnstile';

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Honeypot: real users never fill this hidden field. If present, silently
        // accept (so the bot thinks it succeeded) but drop the submission.
        if (typeof data.contact_hp === 'string' && data.contact_hp.trim() !== '') {
            return NextResponse.json({ success: true });
        }

        // Validate required fields
        if (!data.name || !data.email || !data.message) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Bot protection: verify the Cloudflare Turnstile token (no-op unless
        // TURNSTILE_SECRET is configured).
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
        const humanVerified = await verifyTurnstile(
            typeof data.turnstileToken === 'string' ? data.turnstileToken : null,
            ip
        );
        if (!humanVerified) {
            return NextResponse.json(
                { error: 'Verification failed. Please try again.' },
                { status: 400 }
            );
        }

        // Persist the inquiry so it appears in the admin panel. When a database
        // is configured this is authoritative: if the insert fails we surface an
        // error instead of returning a phantom success, so the visitor retries
        // and the lead is never silently lost.
        if (isDbConfigured && db) {
            try {
                await db.insert(leads).values({
                    name: String(data.name),
                    email: String(data.email),
                    company: data.company ? String(data.company) : null,
                    phone: data.phone ? String(data.phone) : null,
                    country: data.country ? String(data.country) : null,
                    vatId: data.vatId ? String(data.vatId) : null,
                    product: data.product ? String(data.product) : null,
                    quantity: data.quantity ? String(data.quantity) : null,
                    message: String(data.message),
                    locale: data.locale ? String(data.locale) : null,
                    source: 'website_form',
                    meta: { huelseType: data.huelseType ?? null },
                });
            } catch (dbError) {
                console.error('Failed to store lead:', dbError);
                return NextResponse.json(
                    { error: 'Could not save your message. Please try again.' },
                    { status: 500 }
                );
            }
        }

        // SendGrid Integration (uncomment when ready)
        /*
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const msg = {
            to: process.env.CONTACT_EMAIL,
            // {{TODO: Domain-Absenderadresse bestätigen (info@/noreply@papermarketworld.com)}}
            from: 'noreply@papermarketworld.com',
            subject: `New Contact Form: ${data.name} - ${data.company}`,
            text: `
                Name: ${data.name}
                Company: ${data.company}
                VAT ID: ${data.vatId || 'N/A'}
                Email: ${data.email}
                Phone: ${data.phone || 'N/A'}
                Product: ${data.product || 'N/A'}
                Hülsentyp: ${data.huelseType || 'N/A'}
                Quantity: ${data.quantity || 'N/A'}

                Message:
                ${data.message}
            `,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${data.name}</p>
                <p><strong>Company:</strong> ${data.company}</p>
                <p><strong>VAT ID:</strong> ${data.vatId || 'N/A'}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Phone:</strong> ${data.phone || 'N/A'}</p>
                <p><strong>Product:</strong> ${data.product || 'N/A'}</p>
                <p><strong>Hülsentyp:</strong> ${data.huelseType || 'N/A'}</p>
                <p><strong>Quantity:</strong> ${data.quantity || 'N/A'}</p>
                <p><strong>Message:</strong></p>
                <p>${data.message}</p>
            `,
        };

        await sgMail.send(msg);
        */

        // For now, log the data
        console.log('Contact Form Submission:', data);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Contact API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}