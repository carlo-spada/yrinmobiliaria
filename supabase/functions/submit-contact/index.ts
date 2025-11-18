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
    // Get client IP for rate limiting
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    console.log(`Contact form submission from IP: ${clientIp}`);
    
    // Check rate limit
    if (!checkRateLimit(clientIp)) {
      console.warn(`Rate limit exceeded for IP: ${clientIp}`);
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
