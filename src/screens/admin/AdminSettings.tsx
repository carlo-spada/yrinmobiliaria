import { Phone, Mail, MapPin, Clock, Building2, Facebook, Instagram, Loader2, RotateCcw } from 'lucide-react';
import { useState } from 'react';

// Improved validation patterns
const VALIDATION_PATTERNS = {
  // More comprehensive email regex that follows RFC 5322 loosely
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  // URL validation
  URL: /^https?:\/\/.+/,
  // WhatsApp: Mexican format (country code 52 + 10 digit number)
  WHATSAPP: /^52[1-9]\d{9}$/,
  // General phone: international format with optional + and 10-15 digits
  PHONE: /^\+?[1-9]\d{9,14}$/,
} as const;

import { AdminLayout } from '@/components/admin/AdminLayout';
import { PermissionsMatrix } from '@/components/admin/PermissionsMatrix';
import { RoleGuard } from '@/components/admin/RoleGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { SettingValue } from '@/hooks/useSiteSettings';

interface SettingEditorProps {
  settingKey: string;
  label: string;
  description: string;
  value: SettingValue;
  multiline?: boolean;
  icon?: React.ReactNode;
  onSave: (args: { key: string; value: SettingValue }) => void;
  isUpdating: boolean;
  defaultValue?: SettingValue;
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
  const [editValue, setEditValue] = useState<string>(String(value || ''));
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (newValue: string) => {
    setEditValue(newValue);
    setHasChanges(newValue !== String(value));
  };

  const handleSave = () => {
    // Validate based on setting type
    if (settingKey.includes('email') && editValue && !VALIDATION_PATTERNS.EMAIL.test(editValue)) {
      toast({
        title: 'Email inválido',
        description: 'Por favor ingresa un correo electrónico válido (ej: nombre@dominio.com)',
        variant: 'destructive',
      });
      return;
    }

    if (settingKey.includes('url') && editValue && !VALIDATION_PATTERNS.URL.test(editValue)) {
      toast({
        title: 'URL inválida',
        description: 'La URL debe comenzar con http:// o https://',
        variant: 'destructive',
      });
      return;
    }

    if (settingKey === 'whatsapp_number' && editValue && !VALIDATION_PATTERNS.WHATSAPP.test(editValue)) {
      toast({
        title: 'Número de WhatsApp inválido',
        description: 'Formato: 52 + 10 dígitos (ej: 5219511234567)',
        variant: 'destructive',
      });
      return;
    }

    if (settingKey === 'company_phone' && editValue && !VALIDATION_PATTERNS.PHONE.test(editValue.replace(/[\s()-]/g, ''))) {
      toast({
        title: 'Teléfono inválido',
        description: 'Ingresa un número válido de 10-15 dígitos',
        variant: 'destructive',
      });
      return;
    }

    onSave({ key: settingKey, value: editValue });
    setHasChanges(false);
  };

  const handleReset = () => {
    if (defaultValue !== undefined) {
      setEditValue(String(defaultValue));
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
      <RoleGuard allowedRoles={['admin', 'superadmin']}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Configuración del Sitio</h2>
          <p className="text-muted-foreground">
            Administra la información de contacto, horarios y redes sociales
          </p>
        </div>

        <Tabs defaultValue="contact" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="contact">Contacto</TabsTrigger>
            <TabsTrigger value="business">Negocio</TabsTrigger>
            <TabsTrigger value="social">Redes Sociales</TabsTrigger>
            <TabsTrigger value="permissions">Permisos</TabsTrigger>
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

          <TabsContent value="permissions" className="space-y-4">
            <PermissionsMatrix />
          </TabsContent>
        </Tabs>
      </div>
      </RoleGuard>
    </AdminLayout>
  );
}
