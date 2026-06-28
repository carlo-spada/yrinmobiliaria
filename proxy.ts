import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

// Rutas privadas: si no hay sesión, redirige a /auth (server-side, sin parpadeo).
// El control fino por rol lo siguen haciendo los guards de la isla legacy
// (RequireRole) una vez montada en cliente.
const PRIVATE_PREFIXES = ['/admin', '/agent', '/onboarding', '/cuenta'];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresca la sesión (rota tokens si hace falta) y obtiene el usuario.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPrivate = PRIVATE_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));

  if (isPrivate && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth';
    url.searchParams.set('redirect', path);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Todo excepto estáticos de Next, el favicon y archivos con extensión.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.[^/]+$).*)',
  ],
};
