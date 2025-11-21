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
  const phoneRegex = /^[\d\s\-+()]+$/;
  return phoneRegex.test(phone) && phone.length >= 10 && phone.length <= 15;
};

const validateDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Start of today
  
  return !isNaN(date.getTime()) && date >= now;
};

const validateTimeSlot = (timeSlot: string): boolean => {
  const validSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
  return validSlots.includes(timeSlot);
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

    const { propertyId, name, email, phone, date, timeSlot, notes } = await req.json();

    // Server-side validation
    if (!propertyId || typeof propertyId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid property ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    if (!date || !validateDate(date)) {
      return new Response(
        JSON.stringify({ error: 'Invalid date (must be today or future)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!timeSlot || !validateTimeSlot(timeSlot)) {
      return new Response(
        JSON.stringify({ error: 'Invalid time slot' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (notes && (typeof notes !== 'string' || notes.length > 500)) {
      return new Response(
        JSON.stringify({ error: 'Notes too long (max 500 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      propertyId: sanitizeInput(propertyId, 100),
      name: sanitizeInput(name, 100),
      email: sanitizeInput(email, 255),
      phone: sanitizeInput(phone, 15),
      date: sanitizeInput(date, 20),
      timeSlot: sanitizeInput(timeSlot, 10),
      notes: notes ? sanitizeInput(notes, 500) : null,
    };

    // Create Supabase client with service role for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify property exists
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id')
      .eq('id', sanitizedData.propertyId)
      .single();

    if (propertyError || !property) {
      console.error('Property not found:', sanitizedData.propertyId);
      return new Response(
        JSON.stringify({ error: 'Property not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert into database
    const { error: dbError } = await supabase
      .from('scheduled_visits')
      .insert({
        property_id: sanitizedData.propertyId,
        name: sanitizedData.name,
        email: sanitizedData.email,
        phone: sanitizedData.phone,
        preferred_date: sanitizedData.date,
        preferred_time: sanitizedData.timeSlot,
        message: sanitizedData.notes,
        status: 'pending',
      });

    if (dbError) {
      console.error('Database error:', dbError.message);
      return new Response(
        JSON.stringify({ error: 'Failed to schedule visit' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Visit scheduled successfully');

    // Send email notification via Resend (non-blocking)
    try {
      const resendApiKey = Deno.env.get('RESEND_API_KEY');

      if (resendApiKey) {
        // Fetch property details and agent for email routing
        const { data: propertyData } = await supabase
          .from('properties')
          .select(`
            title_es,
            price,
            location,
            organization_id,
            agent_id,
            profiles!properties_agent_id_fkey(email, display_name)
          `)
          .eq('id', sanitizedData.propertyId)
          .single();

        // Determine recipient: agent if assigned, otherwise org email
        let recipientEmail = 'contacto@yrinmobiliaria.com';
        let recipientName = 'YR Inmobiliaria';
        
        const agentData = propertyData?.profiles as { email?: string; display_name?: string } | null;
        
        if (agentData?.email) {
          recipientEmail = agentData.email;
          recipientName = agentData.display_name || 'Agente';
          console.log(`Routing visit email to agent: ${recipientName} (${recipientEmail})`);
        } else {
          // Fallback to organization email
          const { data: orgData } = await supabase
            .from('organizations')
            .select('contact_email, name')
            .eq('id', propertyData?.organization_id)
            .single();
          
          if (orgData?.contact_email) {
            recipientEmail = orgData.contact_email;
            recipientName = orgData.name || 'YR Inmobiliaria';
            console.log(`Routing visit email to organization: ${recipientName} (${recipientEmail})`);
          } else {
            console.warn('No agent or organization email found, using fallback: contacto@yrinmobiliaria.com');
          }
        }

        const propertyTitle = propertyData?.title_es || 'Propiedad';
        const propertyPrice = propertyData?.price ? `$${propertyData.price.toLocaleString('es-MX')} MXN` : 'N/A';
        const propertyZone = propertyData?.location?.zone || 'Oaxaca';

        // Format date for display
        const visitDate = new Date(sanitizedData.date);
        const dateOptions: Intl.DateTimeFormatOptions = {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        };
        const formattedDate = visitDate.toLocaleDateString('es-MX', dateOptions);

        // Convert 24h time to 12h format
        const [hours, minutes] = sanitizedData.timeSlot.split(':');
        const hour24 = parseInt(hours);
        const period = hour24 >= 12 ? 'PM' : 'AM';
        const hour12 = hour24 > 12 ? hour24 - 12 : (hour24 === 0 ? 12 : hour24);
        const formattedTime = `${hour12}:${minutes} ${period}`;

        const emailHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva Visita Agendada - YR Inmobiliaria</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
      <div style="background-color: rgba(255, 255, 255, 0.2); width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </div>
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Visita Agendada</h1>
      <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">YR Inmobiliaria</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      <!-- Property Info -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 12px; margin-bottom: 30px; color: white;">
        <p style="margin: 0 0 5px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9;">Propiedad</p>
        <h2 style="margin: 0 0 10px 0; font-size: 22px; font-weight: 600;">${propertyTitle}</h2>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255, 255, 255, 0.2);">
          <span style="font-size: 14px; opacity: 0.9;">📍 ${propertyZone}</span>
          <span style="font-size: 18px; font-weight: 600;">${propertyPrice}</span>
        </div>
      </div>

      <!-- Visit Details Calendar Card -->
      <div style="background-color: #f8f9fa; border: 2px solid #10b981; border-radius: 12px; overflow: hidden; margin-bottom: 30px;">
        <div style="background-color: #10b981; padding: 15px; text-align: center;">
          <p style="margin: 0; color: white; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Fecha y Hora de Visita</p>
        </div>
        <div style="padding: 25px; text-align: center;">
          <p style="margin: 0 0 5px 0; color: #10b981; font-size: 48px; font-weight: 700; line-height: 1;">${visitDate.getDate()}</p>
          <p style="margin: 0 0 15px 0; color: #6c757d; font-size: 16px; text-transform: capitalize;">${formattedDate.split(',')[0]}</p>
          <div style="background-color: white; padding: 15px; border-radius: 8px; border: 1px solid #e9ecef;">
            <p style="margin: 0; color: #212529; font-size: 20px; font-weight: 600;">🕐 ${formattedTime}</p>
          </div>
        </div>
      </div>

      <!-- Client Information -->
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
              <a href="mailto:${sanitizedData.email}" style="color: #10b981; font-size: 15px; text-decoration: none;">${sanitizedData.email}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0;">
              <span style="color: #6c757d; font-size: 14px; font-weight: 500;">Teléfono:</span>
            </td>
            <td style="padding: 12px 0; text-align: right;">
              <a href="tel:${sanitizedData.phone}" style="color: #10b981; font-size: 15px; text-decoration: none;">${sanitizedData.phone}</a>
            </td>
          </tr>
        </table>
      </div>

      ${sanitizedData.notes ? `
      <div style="margin-bottom: 30px;">
        <h2 style="color: #212529; font-size: 20px; font-weight: 600; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #e9ecef;">Notas Adicionales</h2>
        <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 4px;">
          <p style="margin: 0; color: #92400e; font-size: 15px; white-space: pre-wrap;">${sanitizedData.notes}</p>
        </div>
      </div>
      ` : ''}

      <!-- CTA Buttons -->
      <div style="display: flex; gap: 15px; margin-top: 40px;">
        <a href="mailto:${sanitizedData.email}" style="flex: 1; display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 20px; border-radius: 6px; font-weight: 600; font-size: 15px; text-align: center; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.25);">
          ✉️ Confirmar por Email
        </a>
        <a href="tel:${sanitizedData.phone}" style="flex: 1; display: inline-block; background-color: #ffffff; color: #10b981; text-decoration: none; padding: 14px 20px; border-radius: 6px; font-weight: 600; font-size: 15px; text-align: center; border: 2px solid #10b981;">
          📞 Llamar Cliente
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
      <p style="margin: 0 0 5px 0; color: #6c757d; font-size: 13px;">Esta visita fue agendada desde</p>
      <p style="margin: 0; color: #10b981; font-weight: 600; font-size: 14px;">yrinmobiliaria.com</p>
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
            from: `${recipientName} <${recipientEmail}>`,
            to: [recipientEmail],
            subject: `[Visita Agendada] ${propertyTitle} - Para ${recipientName}`,
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
        message: 'Visit scheduled successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing visit scheduling:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
