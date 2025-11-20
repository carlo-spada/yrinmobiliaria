import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting: Track submissions by IP
const submissionTracker = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_SUBMISSIONS_PER_HOUR = 5;

// Input validation and sanitization
const sanitizeInput = (input: string, maxLength: number): string => {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ''); // Remove potential HTML tags
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.length >= 10 && phone.length <= 15;
};

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const submissions = submissionTracker.get(ip) || [];
  
  // Remove old submissions outside the window
  const recentSubmissions = submissions.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentSubmissions.length >= MAX_SUBMISSIONS_PER_HOUR) {
    return false; // Rate limit exceeded
  }
  
  // Add current submission
  recentSubmissions.push(now);
  submissionTracker.set(ip, recentSubmissions);
  
  return true;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting (not logged for privacy)
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    // Check rate limit
    if (!checkRateLimit(clientIp)) {
      console.warn('Rate limit exceeded for request');
      return new Response(
        JSON.stringify({ 
          error: 'Too many submissions. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED'
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { name, email, phone, subject, message } = await req.json();

    // Server-side validation
    if (!name || typeof name !== 'string' || name.trim().length === 0 || name.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Invalid name' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!email || !validateEmail(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!phone || !validatePhone(phone)) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length === 0 || subject.length > 200) {
      return new Response(
        JSON.stringify({ error: 'Invalid subject' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10 || message.length > 1000) {
      return new Response(
        JSON.stringify({ error: 'Invalid message (must be 10-1000 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeInput(name, 100),
      email: sanitizeInput(email, 255),
      phone: sanitizeInput(phone, 15),
      message: sanitizeInput(`${subject}\n\n${message}`, 1200),
    };

    // Create Supabase client with service role for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert into database
    const { error: dbError } = await supabase
      .from('contact_inquiries')
      .insert({
        name: sanitizedData.name,
        email: sanitizedData.email,
        phone: sanitizedData.phone,
        message: sanitizedData.message,
        status: 'new',
      });

    if (dbError) {
      console.error('Database error:', dbError.message);
      return new Response(
        JSON.stringify({ error: 'Failed to save inquiry' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Contact inquiry saved successfully');

    // Send email notification via Resend (non-blocking)
    try {
      const resendApiKey = Deno.env.get('RESEND_API_KEY');

      if (resendApiKey) {
        // Fetch organization email dynamically
        const { data: orgData } = await supabase
          .from('organizations')
          .select('contact_email, name')
          .eq('slug', 'yr-inmobiliaria')
          .single();

        const organizationEmail = orgData?.contact_email || 'contacto@yrinmobiliaria.com';
        const organizationName = orgData?.name || 'YR Inmobiliaria';
        
        if (!orgData?.contact_email) {
          console.warn('Organization email not found, using fallback: contacto@yrinmobiliaria.com');
        }
        const emailHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nuevo Contacto - YR Inmobiliaria</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">YR Inmobiliaria</h1>
      <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">Nueva Consulta de Contacto</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
        <p style="margin: 0; color: #6c757d; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Asunto</p>
        <p style="margin: 8px 0 0 0; color: #212529; font-size: 18px; font-weight: 600;">${subject}</p>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="color: #212529; font-size: 20px; font-weight: 600; margin: 0 0 20px 0; padding-bottom: 10px; border-bottom: 2px solid #e9ecef;">Información del Cliente</h2>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">
              <span style="color: #6c757d; font-size: 14px; font-weight: 500;">Nombre:</span>
            </td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; text-align: right;">
              <span style="color: #212529; font-size: 15px; font-weight: 600;">${sanitizedData.name}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">
              <span style="color: #6c757d; font-size: 14px; font-weight: 500;">Email:</span>
            </td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; text-align: right;">
              <a href="mailto:${sanitizedData.email}" style="color: #667eea; font-size: 15px; text-decoration: none;">${sanitizedData.email}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0;">
              <span style="color: #6c757d; font-size: 14px; font-weight: 500;">Teléfono:</span>
            </td>
            <td style="padding: 12px 0; text-align: right;">
              <a href="tel:${sanitizedData.phone}" style="color: #667eea; font-size: 15px; text-decoration: none;">${sanitizedData.phone}</a>
            </td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="color: #212529; font-size: 20px; font-weight: 600; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #e9ecef;">Mensaje</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; line-height: 1.6;">
          <p style="margin: 0; color: #495057; font-size: 15px; white-space: pre-wrap;">${message}</p>
        </div>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin-top: 40px;">
        <a href="mailto:${sanitizedData.email}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);">
          Responder por Email
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
      <p style="margin: 0 0 5px 0; color: #6c757d; font-size: 13px;">Esta consulta fue enviada desde</p>
      <p style="margin: 0; color: #667eea; font-weight: 600; font-size: 14px;">yrinmobiliaria.com</p>
      <p style="margin: 15px 0 0 0; color: #adb5bd; font-size: 12px;">
        © ${new Date().getFullYear()} YR Inmobiliaria. Todos los derechos reservados.
      </p>
    </div>
  </div>
</body>
</html>`;

        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `${organizationName} <${organizationEmail}>`,
            to: [organizationEmail],
            subject: `[Contacto Web] ${subject} - ${sanitizedData.name}`,
            html: emailHtml,
            reply_to: sanitizedData.email,
          }),
        });

        if (response.ok) {
          console.log('Email notification sent successfully via Resend');
        } else {
          const error = await response.text();
          console.error('Resend API error:', error);
        }
      } else {
        console.warn('RESEND_API_KEY not configured - skipping email notification');
      }
    } catch (emailError) {
      // Don't fail the request if email fails
      console.error('Error sending email notification:', emailError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Contact inquiry submitted successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing contact submission:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
