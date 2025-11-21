import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AgentCard } from '@/components/AgentCard';
import { usePublicAgents } from '@/hooks/usePublicAgents';
import { useServiceZones } from '@/hooks/useServiceZones';
import { useLanguage } from '@/utils/LanguageContext';
import { useProperties } from '@/hooks/useProperties';
import { Search, X } from 'lucide-react';
import { MetaTags } from '@/components/seo/MetaTags';
import { StructuredData, getOrganizationSchema } from '@/components/seo/StructuredData';
import { Skeleton } from '@/components/ui/skeleton';

type SortOption = 'name' | 'properties' | 'experience';

export default function AgentDirectory() {
  const { language, t } = useLanguage();
  const { data: agents = [], isLoading: agentsLoading } = usePublicAgents();
  const { data: allProperties = [] } = useProperties();
  const { zones } = useServiceZones();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');

  // Get agent property counts
  const agentPropertyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allProperties.forEach((property) => {
      if (property.agent_id && property.status === 'disponible') {
        counts[property.agent_id] = (counts[property.agent_id] || 0) + 1;
      }
    });
    return counts;
  }, [allProperties]);

  // Filter agents
  const filteredAgents = useMemo(() => {
    let filtered = agents;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((agent) =>
        agent.display_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Zone filter
    if (selectedZone !== 'all') {
      filtered = filtered.filter(
        (agent) => agent.service_zones?.includes(selectedZone)
      );
    }

    // Language filter
    if (selectedLanguage.length > 0) {
      filtered = filtered.filter((agent) =>
        selectedLanguage.every((lang) => agent.languages?.includes(lang))
      );
    }

    // Specialty filter
    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter((agent) =>
        agent.agent_specialty?.includes(selectedSpecialty)
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'name') {
        return a.display_name.localeCompare(b.display_name);
      } else if (sortBy === 'properties') {
        return (agentPropertyCounts[b.id] || 0) - (agentPropertyCounts[a.id] || 0);
      } else if (sortBy === 'experience') {
        return (b.agent_years_experience || 0) - (a.agent_years_experience || 0);
      }
      return 0;
    });

    return filtered;
  }, [agents, searchQuery, selectedZone, selectedLanguage, selectedSpecialty, sortBy, agentPropertyCounts]);

  const featuredAgents = useMemo(() => {
    return agents.filter((agent) => agent.is_featured).slice(0, 3);
  }, [agents]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedZone('all');
    setSelectedLanguage([]);
    setSelectedSpecialty('all');
  };

  const hasFilters = searchQuery || selectedZone !== 'all' || selectedLanguage.length > 0 || selectedSpecialty !== 'all';

  return (
    <div className="min-h-screen bg-background">
      <MetaTags
        title={language === 'es' ? 'Nuestro Equipo de Agentes | YR Inmobiliaria' : 'Our Team of Agents | YR Inmobiliaria'}
        description={language === 'es' ? 'Conoce a nuestro equipo de agentes inmobiliarios expertos en Oaxaca. Encuentra el agente perfecto para ayudarte con tus necesidades inmobiliarias.' : 'Meet our team of expert real estate agents in Oaxaca. Find the perfect agent to help you with your real estate needs.'}
      />
      <StructuredData type="Organization" data={getOrganizationSchema(language)} />

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {language === 'es' ? 'Nuestro Equipo de Agentes' : 'Our Team of Agents'}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {language === 'es'
              ? 'Expertos locales en bienes raíces en Oaxaca'
              : 'Local real estate experts in Oaxaca'}
          </p>
        </div>

        {/* Featured Agents */}
        {featuredAgents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">
              {language === 'es' ? 'Agentes Destacados' : 'Featured Agents'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  propertiesCount={agentPropertyCounts[agent.id] || 0}
                />
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-card p-6 rounded-lg shadow-sm mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={language === 'es' ? 'Buscar por nombre...' : 'Search by name...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Zone Filter */}
            <Select value={selectedZone} onValueChange={setSelectedZone}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder={language === 'es' ? 'Zona' : 'Zone'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'es' ? 'Todas las zonas' : 'All zones'}</SelectItem>
                {zones.map((zone) => (
                  <SelectItem key={zone.id} value={zone.name_es}>
                    {language === 'es' ? zone.name_es : zone.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder={language === 'es' ? 'Ordenar' : 'Sort'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">{language === 'es' ? 'Nombre A-Z' : 'Name A-Z'}</SelectItem>
                <SelectItem value="properties">{language === 'es' ? 'Propiedades' : 'Properties'}</SelectItem>
                <SelectItem value="experience">{language === 'es' ? 'Experiencia' : 'Experience'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              {language === 'es' ? 'Limpiar filtros' : 'Clear filters'}
            </Button>
          )}
        </div>

        {/* Agents Grid */}
        {agentsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-lg" />
            ))}
          </div>
        ) : filteredAgents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                propertiesCount={agentPropertyCounts[agent.id] || 0}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              {language === 'es'
                ? 'No hay agentes disponibles con los filtros seleccionados'
                : 'No agents available with the selected filters'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
