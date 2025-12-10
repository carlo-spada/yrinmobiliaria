import { useQuery } from "@tanstack/react-query";
import { Home, MessageSquare, Calendar, Edit } from "lucide-react";
import { Link } from "react-router-dom";

import { ProfileCompletionGuard } from "@/components/auth/ProfileCompletionGuard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

function AgentDashboardContent() {
  const { profile } = useAuth();
  const { language } = useLanguage();

  const { data: stats } = useQuery({
    queryKey: ['agent-stats', profile?.id],
    queryFn: async () => {
      const [properties, inquiries, visits] = await Promise.all([
        supabase
          .from('properties')
          .select('id', { count: 'exact', head: true })
          .eq('agent_id', profile?.id),
        supabase
          .from('contact_inquiries')
          .select('id', { count: 'exact', head: true })
          .eq('assigned_to_agent', profile?.id),
        supabase
          .from('scheduled_visits')
          .select('id', { count: 'exact', head: true })
          .eq('agent_id', profile?.id),
      ]);

      return {
        properties: properties.count || 0,
        inquiries: inquiries.count || 0,
        visits: visits.count || 0,
      };
    },
    enabled: !!profile?.id,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Bienvenido, {profile?.display_name}
            </h1>
            <p className="text-muted-foreground">
              Panel de control de agente
            </p>
          </div>
          <Button asChild>
            <Link to="/agent/profile/edit" className="gap-2">
              <Edit className="h-4 w-4" />
              Editar Perfil
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Home className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats?.properties || 0}</p>
                <p className="text-sm text-muted-foreground">
                  Propiedades
                </p>
              </div>
            </div>
            <Button asChild variant="link" className="mt-4 w-full">
              <Link to="/admin/properties?agent=me">
                Ver mis propiedades
              </Link>
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-full">
                <MessageSquare className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats?.inquiries || 0}</p>
                <p className="text-sm text-muted-foreground">
                  Consultas
                </p>
              </div>
            </div>
            <Button asChild variant="link" className="mt-4 w-full">
              <Link to="/admin/inquiries?agent=me">
                Ver consultas
              </Link>
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-full">
                <Calendar className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats?.visits || 0}</p>
                <p className="text-sm text-muted-foreground">
                  Visitas programadas
                </p>
              </div>
            </div>
            <Button asChild variant="link" className="mt-4 w-full">
              <Link to="/admin/visits?agent=me">
                Ver visitas
              </Link>
            </Button>
          </Card>
        </div>

        {/* Profile Preview */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Mi perfil
          </h2>
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile?.photo_url || undefined} />
              <AvatarFallback>{profile?.display_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-semibold">{profile?.display_name}</h3>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              {profile?.phone && (
                <p className="text-sm text-muted-foreground">
                  Teléfono: {profile.phone}
                </p>
              )}
              {profile && (language === 'es' ? profile.bio_es : profile.bio_en) && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {language === 'es' ? profile.bio_es : profile.bio_en}
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function AgentDashboard() {
  return (
    <ProfileCompletionGuard>
      <AgentDashboardContent />
    </ProfileCompletionGuard>
  );
}
