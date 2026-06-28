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

// imageId va en la clave del objeto de Storage → solo caracteres seguros para
// evitar path traversal (../) o claves inesperadas.
const SAFE_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

// Verifica los magic bytes y devuelve el tipo REAL del archivo, ignorando el
// contentType que envía el cliente. Solo se aceptan los tipos del bucket
// (jpeg/png/webp); cualquier otro contenido (HTML/SVG/script disfrazado de
// imagen) se rechaza, evitando servir contenido ejecutable desde el bucket
// público.
function sniffImageType(bytes: Uint8Array): { ext: string; contentType: string } | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { ext: 'jpg', contentType: 'image/jpeg' };
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) {
    return { ext: 'png', contentType: 'image/png' };
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return { ext: 'webp', contentType: 'image/webp' };
  }
  return null;
}

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
    const { propertyId, fileBase64, imageId } = await req.json();
    if (!propertyId || !fileBase64) {
      return json({ error: 'Missing propertyId or file' }, 400);
    }
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (typeof propertyId !== 'string' || !UUID_RE.test(propertyId)) {
      return json({ error: 'Invalid propertyId' }, 400);
    }
    // Guard de tamaño ANTES de decodificar: el bucket ya limita a 10MB, pero el
    // atob/Uint8Array ocurre en memoria de la función antes de ese rechazo.
    // 14.000.000 chars base64 ≈ 10.5MB binarios.
    if (typeof fileBase64 !== 'string' || fileBase64.length > 14_000_000) {
      return json({ error: 'File too large' }, 413);
    }

    // 4) Decode base64, verify it is a REAL image (magic bytes), and upload
    const bytes = Uint8Array.from(atob(fileBase64), (c) => c.charCodeAt(0));
    const sniffed = sniffImageType(bytes);
    if (!sniffed) {
      return json({ error: 'File is not a valid JPEG, PNG, or WebP image' }, 400);
    }

    // Sanitize imageId (it becomes the storage object key) to block path traversal.
    let id: string;
    if (imageId !== undefined && imageId !== null && imageId !== '') {
      if (typeof imageId !== 'string' || !SAFE_ID_RE.test(imageId)) {
        return json({ error: 'Invalid imageId' }, 400);
      }
      id = imageId;
    } else {
      id = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    }

    const path = `${propertyId}/${id}.${sniffed.ext}`;
    const { error: upError } = await admin.storage
      .from('property-images')
      .upload(path, bytes, { contentType: sniffed.contentType, upsert: false });
    if (upError) return json({ error: upError.message }, 400);

    const { data: { publicUrl } } = admin.storage.from('property-images').getPublicUrl(path);
    return json({ url: publicUrl, path, imageId: id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return json({ error: message }, 500);
  }
});
