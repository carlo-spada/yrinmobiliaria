import { AlertCircle, ExternalLink } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { validateSupabaseEnv } from '@/lib/supabase-validation';

// Re-export for backwards compatibility
// eslint-disable-next-line react-refresh/only-export-components
export { validateSupabaseEnv };

/**
 * Error UI component shown when Supabase configuration is invalid
 */
export function SupabaseConfigError({ error }: { error: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 rounded-lg bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Supabase Configuration Error
            </h1>
            <p className="text-muted-foreground">
              The application cannot start because Supabase is not properly configured.
            </p>
          </div>
        </div>

        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Missing Configuration</AlertTitle>
          <AlertDescription className="font-mono text-sm mt-2">
            {error}
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3 text-foreground">
              Setup Instructions
            </h2>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  For Lovable Cloud Projects:
                </h3>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>This project uses Lovable Cloud backend</li>
                  <li>Environment variables are automatically configured</li>
                  <li>If you're seeing this error, contact Lovable support</li>
                </ol>
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="font-semibold text-foreground mb-2">
                  For Local Development:
                </h3>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>Create a <code className="bg-muted px-2 py-1 rounded">.env</code> file in the project root</li>
                  <li>Copy the contents from <code className="bg-muted px-2 py-1 rounded">.env.example</code></li>
                  <li>Add your Supabase project credentials:
                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li><code className="bg-muted px-2 py-1 rounded">VITE_SUPABASE_URL</code> - Your Supabase project URL</li>
                      <li><code className="bg-muted px-2 py-1 rounded">VITE_SUPABASE_PUBLISHABLE_KEY</code> - Your anon/public key</li>
                      <li><code className="bg-muted px-2 py-1 rounded">VITE_SUPABASE_PROJECT_ID</code> - Your project ID</li>
                    </ul>
                  </li>
                  <li>Restart the development server</li>
                </ol>
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="font-semibold text-foreground mb-2">
                  Where to find your Supabase credentials:
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Log in to your Supabase dashboard</li>
                  <li>Select your project</li>
                  <li>Go to Settings → API</li>
                  <li>Copy the Project URL and anon public key</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <a
              href="https://docs.lovable.dev/features/cloud"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              Lovable Cloud Docs
            </a>
            <a
              href="https://supabase.com/docs/guides/getting-started"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors text-sm font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              Supabase Setup Guide
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}
