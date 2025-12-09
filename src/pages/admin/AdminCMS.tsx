import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgenticContentWizard, type CmsPageType, type WizardResult } from '@/components/admin/cms/AgenticContentWizard';
import { FileText, Wand2, Eye, Save } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { RoleGuard } from '@/components/admin/RoleGuard';

export default function AdminCMS() {
    const [activeTab, setActiveTab] = useState<CmsPageType>('about');
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [content, setContent] = useState<Record<string, string>>({
        about: '',
        terms: '',
        privacy: ''
    });

    const handleWizardComplete = (result: WizardResult) => {
        setContent(prev => ({
            ...prev,
            [activeTab]: result.content
        }));
        setIsWizardOpen(false);
        toast.success('Contenido generado exitosamente');
    };

    const handleSave = () => {
        // Here we would save to Supabase
        toast.success('Cambios guardados correctamente');
    };

    return (
        <AdminLayout>
            <RoleGuard allowedRoles={['admin', 'superadmin']}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Gestor de Contenido (CMS)</h2>
                        <p className="text-muted-foreground">Administra el contenido de tus páginas legales e informativas</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => window.open('/nosotros', '_blank')}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Página
                        </Button>
                        <Button onClick={handleSave}>
                            <Save className="mr-2 h-4 w-4" />
                            Guardar Cambios
                        </Button>
                    </div>
                </div>

                        {isWizardOpen ? (
                    <div className="animate-in fade-in zoom-in-95 duration-300">
                        <AgenticContentWizard
                            pageType={activeTab}
                            onComplete={handleWizardComplete}
                            onCancel={() => setIsWizardOpen(false)}
                        />
                    </div>
                ) : (
                    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CmsPageType)} className="space-y-4">
                        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                            <TabsTrigger value="about">Sobre Nosotros</TabsTrigger>
                            <TabsTrigger value="terms">Términos</TabsTrigger>
                            <TabsTrigger value="privacy">Privacidad</TabsTrigger>
                        </TabsList>

                        <TabsContent value={activeTab}>
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <FileText className="h-5 w-5" />
                                                Contenido de la Página
                                            </CardTitle>
                                            <CardDescription>
                                                Edita el contenido manualmente o usa nuestra IA para generarlo.
                                            </CardDescription>
                                        </div>
                                        <Button
                                            variant="secondary"
                                            className="bg-primary/10 text-primary hover:bg-primary/20"
                                            onClick={() => setIsWizardOpen(true)}
                                        >
                                            <Wand2 className="mr-2 h-4 w-4" />
                                            Asistente IA
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Textarea
                                        className="min-h-[400px] font-mono text-sm"
                                        placeholder="# Escribe tu contenido en Markdown aquí..."
                                        value={content[activeTab]}
                                        onChange={(e) => setContent(prev => ({ ...prev, [activeTab]: e.target.value }))}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                )}
            </div>
            </RoleGuard>
        </AdminLayout>
    );
}
