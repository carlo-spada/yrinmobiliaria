import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InviteAgentDialog } from "@/components/admin/InviteAgentDialog";
import { useLanguage } from "@/utils/LanguageContext";
import { UserPlus, Search, Star, MapPin, Home, MessageSquare, Calendar, Mail, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminAgents() {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const { data: agents, isLoading } = useQuery({
    queryKey: ['agents', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          properties:properties(count),
          inquiries:contact_inquiries(count),
          visits:scheduled_visits(count)
        `)
        .eq('organization_id', profile?.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  const filteredAgents = agents?.filter(agent =>
    agent.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLevelBadgeColor = (level: string | null) => {
    switch (level) {
      case 'partner': return 'bg-purple-500';
      case 'senior': return 'bg-blue-500';
      case 'associate': return 'bg-green-500';
      case 'junior': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Agentes</h1>
            <p className="text-muted-foreground">
              Gestiona tu equipo de agentes inmobiliarios
            </p>
          </div>
          <Button onClick={() => setInviteDialogOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Invitar Agente
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o correo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Agents Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredAgents && filteredAgents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <Card key={agent.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={agent.photo_url || undefined} />
                    <AvatarFallback>{agent.display_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{agent.display_name}</h3>
                      {agent.is_featured && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    {agent.agent_level && (
                      <Badge className={`${getLevelBadgeColor(agent.agent_level)} text-white text-xs mb-2`}>
                        {agent.agent_level}
                      </Badge>
                    )}
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{agent.email}</span>
                      </div>
                      {agent.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{agent.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                      <Home className="h-3 w-3" />
                    </div>
                    <p className="text-lg font-semibold">{agent.properties?.[0]?.count || 0}</p>
                    <p className="text-xs text-muted-foreground">Propiedades</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                      <MessageSquare className="h-3 w-3" />
                    </div>
                    <p className="text-lg font-semibold">{agent.inquiries?.[0]?.count || 0}</p>
                    <p className="text-xs text-muted-foreground">Consultas</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                      <Calendar className="h-3 w-3" />
                    </div>
                    <p className="text-lg font-semibold">{agent.visits?.[0]?.count || 0}</p>
                    <p className="text-xs text-muted-foreground">Visitas</p>
                  </div>
                </div>

                {/* Status */}
                {!agent.is_active && (
                  <Badge variant="outline" className="mt-4 w-full justify-center">
                    Inactivo
                  </Badge>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <UserPlus className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">
                  No hay agentes todavía
                </h3>
                <p className="text-muted-foreground">
                  Invita a tu primer agente para comenzar
                </p>
              </div>
              <Button onClick={() => setInviteDialogOpen(true)} className="gap-2">
                <UserPlus className="h-4 w-4" />
                Invitar Agente
              </Button>
            </div>
          </Card>
        )}
      </div>

      <InviteAgentDialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen} />
    </AdminLayout>
  );
}
