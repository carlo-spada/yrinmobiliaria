import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

// Public endpoint (verify_jwt = false): the invited person has no session yet.
// Two modes:
//   { token }            -> validate + return safe preview (email, display_name)
//   { token, password }  -> create the user, profile, agent role, mark accepted
// Single-tenant: no organization_id. The 'agent' role lives in role_assignments,
// which only admins can write via RLS — hence this SECURITY DEFINER service-role
// function instead of a direct client insert.
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { token, password } = await req.json();

    if (!token || typeof token !== 'string') {
      return json({ error: 'Token requerido' }, 400);
    }

    const { data: invitation, error: invErr } = await admin
      .from('agent_invitations')
      .select('*')
      .eq('token', token)
      .single();

    if (invErr || !invitation) {
      return json({ error: 'Invitación no encontrada' }, 404);
    }
    if (new Date(invitation.expires_at) < new Date()) {
      return json({ error: 'Esta invitación ha expirado' }, 410);
    }
    if (invitation.accepted_at) {
      return json({ error: 'Esta invitación ya ha sido aceptada' }, 409);
    }

    // Preview mode: no password supplied.
    if (password === undefined || password === null) {
      return json({ email: invitation.email, display_name: invitation.display_name });
    }

    // Accept mode.
    if (typeof password !== 'string' || password.length < 12) {
      return json({ error: 'La contraseña debe tener al menos 12 caracteres' }, 400);
    }

    // Claim ATÓMICO de la invitación ANTES de crear nada: el UPDATE condicional
    // (accepted_at IS NULL) garantiza que solo una petición concurrente gane y
    // evita la doble-aceptación / estados parciales (M6). Si un paso posterior
    // falla, se revierte (un-claim) para que la invitación siga utilizable.
    const { data: claimed, error: claimErr } = await admin
      .from('agent_invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invitation.id)
      .is('accepted_at', null)
      .select('id')
      .maybeSingle();

    if (claimErr) {
      return json({ error: claimErr.message }, 500);
    }
    if (!claimed) {
      return json({ error: 'Esta invitación ya ha sido aceptada' }, 409);
    }

    const unclaim = () =>
      admin.from('agent_invitations').update({ accepted_at: null }).eq('id', invitation.id);

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: invitation.email,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: invitation.display_name || invitation.email.split('@')[0],
      },
    });

    if (createErr || !created.user) {
      await unclaim();
      return json({ error: createErr?.message || 'No se pudo crear la cuenta' }, 400);
    }

    const userId = created.user.id;

    const { error: profileErr } = await admin.from('profiles').insert({
      user_id: userId,
      display_name: invitation.display_name || invitation.email.split('@')[0],
      email: invitation.email,
      phone: invitation.phone,
      service_zones: invitation.service_zones,
      is_complete: false,
      invited_by: invitation.invited_by,
      invited_at: invitation.invited_at,
    });

    if (profileErr) {
      // El borrado del usuario cascada-elimina el profile recién creado; además
      // revertimos el claim para no dejar la invitación bloqueada.
      await admin.auth.admin.deleteUser(userId);
      await unclaim();
      return json({ error: profileErr.message }, 400);
    }

    const { error: roleErr } = await admin
      .from('role_assignments')
      .insert({ user_id: userId, role: 'agent' });

    if (roleErr) {
      await admin.auth.admin.deleteUser(userId);
      await unclaim();
      return json({ error: roleErr.message }, 400);
    }

    // Finaliza: registra quién aceptó (accepted_at ya fue fijado por el claim).
    await admin
      .from('agent_invitations')
      .update({ accepted_by: userId })
      .eq('id', invitation.id);

    return json({ success: true, email: invitation.email });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return json({ error: message }, 500);
  }
});
