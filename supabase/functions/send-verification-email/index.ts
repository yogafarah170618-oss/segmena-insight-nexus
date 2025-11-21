import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    });
  }

  try {
    const payload = await req.json();
    console.log('Received webhook payload');

    const {
      user,
      email_data: { token_hash, redirect_to, email_action_type },
    } = payload as {
      user: {
        email: string;
        user_metadata?: {
          full_name?: string;
        };
      };
      email_data: {
        token_hash: string;
        redirect_to: string;
        email_action_type: string;
      };
    };

    const userName = user.user_metadata?.full_name || user.email.split('@')[0];
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const verificationUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verifikasi Email - Segmena</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #f6f9fc;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                  <tr>
                    <td style="padding: 40px;">
                      <h1 style="color: #333; font-size: 28px; font-weight: bold; margin: 0 0 20px 0;">
                        Selamat Datang di Segmena! 🎉
                      </h1>
                      <p style="color: #333; font-size: 16px; line-height: 26px; margin: 16px 0;">
                        Halo <strong>${userName}</strong>,
                      </p>
                      <p style="color: #333; font-size: 16px; line-height: 26px; margin: 16px 0;">
                        Terima kasih telah mendaftar di Segmena - Platform Customer Intelligence.
                        Untuk melanjutkan, silakan verifikasi alamat email Anda dengan mengklik tombol di bawah ini:
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${verificationUrl}" 
                               style="display: inline-block; background-color: #5469d4; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 40px; border-radius: 8px;">
                              Verifikasi Email Saya
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="color: #333; font-size: 16px; line-height: 26px; margin: 16px 0;">
                        Atau salin dan tempel link berikut ke browser Anda:
                      </p>
                      <p style="color: #5469d4; font-size: 14px; word-break: break-all; margin: 16px 0;">
                        ${verificationUrl}
                      </p>
                      <p style="color: #8898aa; font-size: 14px; line-height: 22px; margin: 24px 0;">
                        Jika Anda tidak mendaftar untuk akun ini, Anda dapat mengabaikan email ini dengan aman.
                      </p>
                      <p style="color: #8898aa; font-size: 14px; line-height: 22px; margin: 24px 0;">
                        Salam hangat,<br/>
                        <strong>Tim Segmena</strong>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    console.log('Sending email via Resend...');
    const { data, error } = await resend.emails.send({
      from: 'Segmena <onboarding@resend.dev>',
      to: [user.email],
      subject: 'Verifikasi Email Anda - Segmena',
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    console.log('Email sent successfully:', data);

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('Error in send-verification-email function:', error);
    return new Response(
      JSON.stringify({
        error: {
          message: error?.message || 'An error occurred',
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
