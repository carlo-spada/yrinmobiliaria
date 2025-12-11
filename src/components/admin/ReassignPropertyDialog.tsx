import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAgents } from '@/hooks/useAgents';
import { supabase } from '@/integrations/supabase/client';
import { logAuditEvent } from '@/utils/auditLog';

interface ReassignPropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  propertyTitle: string;
  currentAgentId: string | null;
  currentAgentName: string | null;
  organizationId: string;
}

export function ReassignPropertyDialog({
  open,
  onOpenChange,
  propertyId,
  propertyTitle,
  currentAgentId,
  currentAgentName,
  organizationId,
}: ReassignPropertyDialogProps) {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: agents, isLoading: loadingAgents } = useAgents(organizationId);

  // Handle dialog open/close with state reset
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when dialog closes
      setSelectedAgentId('');
    }
    onOpenChange(newOpen);
  };

  const reassignMutation = useMutation({
    mutationFn: async (newAgentId: string) => {
      const { error } = await supabase
        .from('properties')
        .update({ agent_id: newAgentId })
        .eq('id', propertyId);

      if (error) throw error;

      // Log audit event
      const newAgent = agents?.find(a => a.id === newAgentId);
      await logAuditEvent({
        action: 'PROPERTY_REASSIGNED',
        table_name: 'properties',
        record_id: propertyId,
        changes: {
          property_title: propertyTitle,
          old_agent_id: currentAgentId,
          old_agent_name: currentAgentName,
          new_agent_id: newAgentId,
          new_agent_name: newAgent?.display_name,
        },
      });

      return newAgent;
    },
    onSuccess: (newAgent) => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      toast.success(`Propiedad reasignada a ${newAgent?.display_name}`);
      handleOpenChange(false);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error('Error al reasignar: ' + errorMessage);
    },
  });

  const handleSubmit = () => {
    if (!selectedAgentId) {
      toast.error('Selecciona un agente');
      return;
    }

    if (selectedAgentId === currentAgentId) {
      toast.error('Este agente ya está asignado a la propiedad');
      return;
    }

    reassignMutation.mutate(selectedAgentId);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reasignar Propiedad</DialogTitle>
          <DialogDescription>
            Reasignar "{propertyTitle}" a un nuevo agente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Agente Actual</Label>
            <div className="p-3 bg-muted rounded-md text-sm">
              {currentAgentName || 'Sin asignar'}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent">Nuevo Agente *</Label>
            <Select
              value={selectedAgentId}
              onValueChange={setSelectedAgentId}
              disabled={loadingAgents}
            >
              <SelectTrigger id="agent">
                <SelectValue placeholder="Selecciona un agente" />
              </SelectTrigger>
              <SelectContent>
                {agents?.map((agent) => (
                  <SelectItem 
                    key={agent.id} 
                    value={agent.id}
                    disabled={agent.id === currentAgentId}
                  >
                    {agent.display_name}
                    {agent.agent_level && ` (${agent.agent_level})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={reassignMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedAgentId || reassignMutation.isPending}
          >
            {reassignMutation.isPending ? 'Reasignando...' : 'Reasignar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
