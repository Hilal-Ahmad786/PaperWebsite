import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Validate required fields
        if (!data.name || !data.email || !data.message) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // SendGrid Integration (uncomment when ready)
        /*
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const msg = {
            to: process.env.CONTACT_EMAIL,
            from: 'noreply@papermarketworld.com',
            subject: `New Contact Form: ${data.name} - ${data.company}`,
            text: `
                Name: ${data.name}
                Company: ${data.company}
                Email: ${data.email}
                Phone: ${data.phone || 'N/A'}
                Product: ${data.product || 'N/A'}
                Quantity: ${data.quantity || 'N/A'}
                
                Message:
                ${data.message}
            `,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${data.name}</p>
                <p><strong>Company:</strong> ${data.company}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Phone:</strong> ${data.phone || 'N/A'}</p>
                <p><strong>Product:</strong> ${data.product || 'N/A'}</p>
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