
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

import { getAdmins } from '@/utils/admin';

export async function sendNewUserAlert(user) {
    const adminEmails = getAdmins();
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'; // Default Resend test email

    if (adminEmails.length === 0) {
        console.error('⚠️ NEXT_PUBLIC_ADMIN_EMAIL not set. Cannot send notification.');
        return { success: false, error: 'Admin email not configured' };
    }

    if (!process.env.RESEND_API_KEY) {
        console.log('⚠️ RESEND_API_KEY not found. Simulating email notification:');
        console.log(`To: ${adminEmails.join(', ')}`);
        console.log(`Subject: New User Signup - ${user.email}`);
        return { success: true, simulated: true };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: adminEmails,
            subject: `🚀 New User Signup: ${user.user_metadata?.first_name || 'User'} (${user.email})`,
            html: `
                <h1>New Client Alert!</h1>
                <p><strong>${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}</strong> just signed up.</p>
                <p>Email: ${user.email}</p>
                <p>User ID: ${user.id}</p>
                <br />
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ffs-hazel.vercel.app'}/admin" style="background-color: #ff8a00; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    Go to Admin Control Room
                </a>
            `
        });

        if (error) {
            console.error('Resend Error:', error);
            return { success: false, error };
        }

        console.log('✅ Notification sent:', data);
        return { success: true, data };
    } catch (err) {
        console.error('Notification Exception:', err);
        return { success: false, error: err.message };
    }
}
