import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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

// Uploads a property image using service_role. Workaround for this project's
// storage-api not validating user JWTs (auth.uid() comes back null there, so the
// is_staff() storage RLS rejects authenticated uploads). We validate the user via
// GoTrue (auth.getUser, which works) and then upload with service_role.
// verify_jwt is false at the platform level because we validate the token here.
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

    // 1) Authenticate the user (GoTrue validates the JWT)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Authentication required' }, 401);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await admin.auth.getUser(token);
    if (authError || !user) return json({ error: 'Invalid authentication' }, 401);

    // 2) Authorize: must be staff (agent / admin / superadmin)
    const { data: roleRows, error: roleError } = await admin
      .from('role_assignments')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['agent', 'admin', 'superadmin']);
    if (roleError || !roleRows || roleRows.length === 0) {
      return json({ error: 'Admin or agent access required' }, 403);
    }

    // 3) Validate payload
    const { propertyId, fileBase64, contentType, imageId } = await req.json();
    if (!propertyId || !fileBase64) {
      return json({ error: 'Missing propertyId or file' }, 400);
    }

    // 4) Decode base64 and upload under {propertyId}/ with service_role
    const bytes = Uint8Array.from(atob(fileBase64), (c) => c.charCodeAt(0));
    const id = imageId || `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const path = `${propertyId}/${id}.webp`;
    const { error: upError } = await admin.storage
      .from('property-images')
      .upload(path, bytes, { contentType: contentType || 'image/webp', upsert: false });
    if (upError) return json({ error: upError.message }, 400);

    const { data: { publicUrl } } = admin.storage.from('property-images').getPublicUrl(path);
    return json({ url: publicUrl, path, imageId: id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return json({ error: message }, 500);
  }
});
