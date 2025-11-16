import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useLanguage } from '@/utils/LanguageContext';
import { Phone, Mail, MapPin, Clock, Building2, Facebook, Instagram, Loader2, RotateCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SettingEditorProps {
  settingKey: string;
  label: string;
  description: string;
  value: any;
  multiline?: boolean;
  icon?: React.ReactNode;
  onSave: (args: { key: string; value: any }) => void;
  isUpdating: boolean;
  defaultValue?: any;
}

const SettingEditor = ({ 
  settingKey, 
  label, 
  description, 
  value, 
  multiline, 
  icon, 
  onSave, 
  isUpdating,
  defaultValue 
}: SettingEditorProps) => {
  const [editValue, setEditValue] = useState(value || '');
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (newValue: string) => {
    setEditValue(newValue);
    setHasChanges(newValue !== value);
  };

  const handleSave = () => {
    // Validate based on setting type
    if (settingKey.includes('email') && !editValue.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast({
        title: 'Email inválido',
        description: 'Por favor ingresa un correo electrónico válido',
        variant: 'destructive',
      });
      return;
    }

    if (settingKey.includes('url') && !editValue.match(/^https?:\/\/.+/)) {
      toast({
        title: 'URL inválida',
        description: 'La URL debe comenzar con http:// o https://',
        variant: 'destructive',
      });
      return;
    }

    if (settingKey === 'whatsapp_number' && !editValue.match(/^\d{10,15}$/)) {
      toast({
        title: 'Número inválido',
        description: 'Ingresa el número sin espacios ni símbolos (solo dígitos)',
        variant: 'destructive',
      });
      return;
    }

    onSave({ key: settingKey, value: editValue });
    setHasChanges(false);
  };

  const handleReset = () => {
    if (defaultValue !== undefined) {
      setEditValue(defaultValue);
      setHasChanges(true);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {label}
        </CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {multiline ? (
          <Textarea
            value={editValue}
            onChange={(e) => handleChange(e.target.value)}
            rows={4}
            className="resize-none"
          />
        ) : (
          <Input
            value={editValue}
            onChange={(e) => handleChange(e.target.value)}
          />
        )}
        <div className="flex gap-2">
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || isUpdating}
            size="sm"
          >
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar
          </Button>
          {defaultValue !== undefined && (
            <Button 
              onClick={handleReset} 
              variant="outline" 
              size="sm"
              disabled={isUpdating}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Restablecer
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const defaultSettings = {
  company_phone: '(951) 123-4567',
  company_email: 'contacto@yrinmobiliaria.com',
  whatsapp_number: '5219511234567',
  company_address: 'Calle Independencia 123, Centro Histórico, Oaxaca de Juárez, Oaxaca, México',
  business_hours: 'Lunes a Viernes: 9:00 AM - 6:00 PM\nSábados: 10:00 AM - 2:00 PM',
  company_name: 'YR Inmobiliaria',
  facebook_url: 'https://facebook.com',
  instagram_url: 'https://instagram.com',
};

export default function AdminSettings() {
  const { t } = useLanguage();
  const { getSettingsByCategory, updateSetting, isUpdating, isLoading } = useSiteSettings();

  const contactSettings = getSettingsByCategory('contact');
  const businessSettings = getSettingsByCategory('business');
  const socialSettings = getSettingsByCategory('social');

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Configuración del Sitio</h2>
          <p className="text-muted-foreground">
            Administra la información de contacto, horarios y redes sociales
          </p>
        </div>

        <Tabs defaultValue="contact" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="contact">Contacto</TabsTrigger>
            <TabsTrigger value="business">Negocio</TabsTrigger>
            <TabsTrigger value="social">Redes Sociales</TabsTrigger>
          </TabsList>

          <TabsContent value="contact" className="space-y-4">
            {contactSettings.map((setting) => (
              <SettingEditor
                key={setting.id}
                settingKey={setting.setting_key}
                label={
                  setting.setting_key === 'company_phone' ? 'Teléfono' :
                  setting.setting_key === 'company_email' ? 'Correo Electrónico' :
                  setting.setting_key === 'whatsapp_number' ? 'WhatsApp' :
                  setting.setting_key === 'company_address' ? 'Dirección' : 
                  setting.setting_key
                }
                description={setting.description}
                value={setting.setting_value}
                multiline={setting.setting_key === 'company_address'}
                icon={
                  setting.setting_key === 'company_phone' ? <Phone className="h-4 w-4" /> :
                  setting.setting_key === 'company_email' ? <Mail className="h-4 w-4" /> :
                  setting.setting_key === 'whatsapp_number' ? <Phone className="h-4 w-4" /> :
                  setting.setting_key === 'company_address' ? <MapPin className="h-4 w-4" /> :
                  null
                }
                onSave={updateSetting}
                isUpdating={isUpdating}
                defaultValue={defaultSettings[setting.setting_key as keyof typeof defaultSettings]}
              />
            ))}
          </TabsContent>

          <TabsContent value="business" className="space-y-4">
            {businessSettings.map((setting) => (
              <SettingEditor
                key={setting.id}
                settingKey={setting.setting_key}
                label={
                  setting.setting_key === 'company_name' ? 'Nombre de la Empresa' :
                  setting.setting_key === 'business_hours' ? 'Horario de Atención' :
                  setting.setting_key
                }
                description={setting.description}
                value={setting.setting_value}
                multiline={setting.setting_key === 'business_hours'}
                icon={
                  setting.setting_key === 'company_name' ? <Building2 className="h-4 w-4" /> :
                  setting.setting_key === 'business_hours' ? <Clock className="h-4 w-4" /> :
                  null
                }
                onSave={updateSetting}
                isUpdating={isUpdating}
                defaultValue={defaultSettings[setting.setting_key as keyof typeof defaultSettings]}
              />
            ))}
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            {socialSettings.map((setting) => (
              <SettingEditor
                key={setting.id}
                settingKey={setting.setting_key}
                label={
                  setting.setting_key === 'facebook_url' ? 'Facebook' :
                  setting.setting_key === 'instagram_url' ? 'Instagram' :
                  setting.setting_key
                }
                description={setting.description}
                value={setting.setting_value}
                icon={
                  setting.setting_key === 'facebook_url' ? <Facebook className="h-4 w-4" /> :
                  setting.setting_key === 'instagram_url' ? <Instagram className="h-4 w-4" /> :
                  null
                }
                onSave={updateSetting}
                isUpdating={isUpdating}
                defaultValue={defaultSettings[setting.setting_key as keyof typeof defaultSettings]}
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
