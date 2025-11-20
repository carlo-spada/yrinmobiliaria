import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  invitation_id: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invitation_id }: InvitationRequest = await req.json();

    if (!invitation_id) {
      throw new Error("invitation_id is required");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch invitation details
    const { data: invitation, error: inviteError } = await supabase
      .from("agent_invitations")
      .select(`
        *,
        organization:organizations(*),
        inviter:profiles!agent_invitations_invited_by_fkey(display_name)
      `)
      .eq("id", invitation_id)
      .single();

    if (inviteError || !invitation) {
      console.error("Error fetching invitation:", inviteError);
      throw new Error("Invitation not found");
    }

    // Generate magic link
    const origin = req.headers.get("origin") || "https://yrinmobiliaria.com";
    const magicLink = `${origin}/auth/accept-invitation?token=${invitation.token}`;

    // Prepare email HTML
    const year = new Date().getFullYear();
    const inviterName = invitation.inviter?.display_name || "el equipo";
    const orgName = invitation.organization?.name || "YR Inmobiliaria";

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invitación a ${orgName}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">${orgName}</h1>
      <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">Te invitamos a unirte a nuestro equipo</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      <h2 style="color: #212529; font-size: 22px; margin: 0 0 20px 0;">¡Hola!</h2>

      <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
        Has sido invitado/a por <strong>${inviterName}</strong> para unirte al equipo de <strong>${orgName}</strong> como agente inmobiliario.
      </p>

      <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
        Haz clic en el botón de abajo para aceptar la invitación y configurar tu perfil:
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="${magicLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);">
          Aceptar Invitación
        </a>
      </div>

      <p style="color: #6c757d; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
        Este enlace expira en 7 días. Si no aceptas la invitación, simplemente ignora este correo.
      </p>

      <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e9ecef;">
        <p style="color: #6c757d; font-size: 13px; margin: 0 0 10px 0;">
          Si tienes problemas con el botón, copia y pega este enlace en tu navegador:
        </p>
        <p style="color: #667eea; font-size: 13px; word-break: break-all; margin: 0;">
          ${magicLink}
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
      <p style="margin: 0; color: #667eea; font-weight: 600; font-size: 14px;">${orgName}</p>
      <p style="margin: 10px 0 0 0; color: #adb5bd; font-size: 12px;">
        © ${year} ${orgName}. Todos los derechos reservados.
      </p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email via Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${orgName} <invitaciones@yrinmobiliaria.com>`,
        to: [invitation.email],
        subject: `Invitación para unirte a ${orgName}`,
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error("Resend API error:", errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const resendData = await resendResponse.json();
    console.log("Email sent successfully:", resendData);

    return new Response(
      JSON.stringify({ success: true, message: "Invitation email sent" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in send-agent-invitation:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
