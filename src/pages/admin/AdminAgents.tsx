import { useQuery } from "@tanstack/react-query";
import { UserPlus, Search, Star, Home, MessageSquare, Calendar, Mail, Phone } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { InviteAgentDialog } from "@/components/admin/InviteAgentDialog";
import { RoleGuard } from "@/components/admin/RoleGuard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function AdminAgents() {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const { data: agents, isLoading } = useQuery({
    queryKey: ['agents', profile?.organization_id],
    queryFn: async () => {
      // Get profiles for this organization
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          properties:properties(count),
          inquiries:contact_inquiries(count),
          visits:scheduled_visits(count)
        `)
        .eq('organization_id', profile?.organization_id ?? '')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;
      if (!profiles) return [];

      // Get roles from role_assignments table
      const userIds = profiles.map(p => p.user_id);
      const { data: roleAssignments } = await supabase
        .from('role_assignments')
        .select('user_id, role')
        .in('user_id', userIds);

      const roleMap = new Map<string, string>();
      roleAssignments?.forEach(ra => {
        const existing = roleMap.get(ra.user_id);
        if (!existing || ra.role === 'superadmin' || (ra.role === 'admin' && existing !== 'superadmin')) {
          roleMap.set(ra.user_id, ra.role);
        }
      });

      // Merge role data
      return profiles.map(profile => ({
        ...profile,
        role: roleMap.get(profile.user_id) || 'user'
      }));
    },
    enabled: !!profile?.organization_id,
  });

  const getRoleDisplay = (role: string) => {
    if (role === 'superadmin') return { label: 'Superadministrador', color: 'bg-red-500' };
    if (role === 'admin') return { label: 'Administrador', color: 'bg-purple-500' };
    return null;
  };

  // Debounce search using useDeferredValue for smooth UI
  const deferredSearch = useDeferredValue(searchQuery);

  const filteredAgents = useMemo(() => {
    if (!agents) return [];
    if (!deferredSearch) return agents;

    const query = deferredSearch.toLowerCase();
    return agents.filter(agent =>
      agent.display_name?.toLowerCase().includes(query) ||
      agent.email?.toLowerCase().includes(query)
    );
  }, [agents, deferredSearch]);


  return (
    <AdminLayout>
      <RoleGuard allowedRoles={['admin', 'superadmin']}>
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

        {/* Search with deferred filtering */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o correo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-10 ${searchQuery !== deferredSearch ? 'opacity-80' : ''}`}
            aria-label="Buscar agentes"
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
        ) : filteredAgents.length > 0 ? (
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
                    {getRoleDisplay(agent.role) && (
                      <Badge className={`${getRoleDisplay(agent.role)?.color} text-white text-xs mb-2`}>
                        {getRoleDisplay(agent.role)?.label}
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
      </RoleGuard>
    </AdminLayout>
  );
}
