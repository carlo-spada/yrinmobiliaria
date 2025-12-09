import { PageLayout } from '@/components/layout';
import { useLanguage } from '@/utils/LanguageContext';
import { Card } from '@/components/ui/card';
import { FileText, Scale, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Language } from '@/types';
import type { Database } from '@/integrations/supabase/types';

type CmsJsonContent = Database['public']['Tables']['cms_pages']['Row']['content'];

interface CmsSectionItem {
  subtitle: string;
  text: string;
}

interface CmsSection {
  title: string;
  content: CmsSectionItem[];
}

interface CmsAdditionalSection {
  title: string;
  text: string;
}

type TermsCmsContent = Record<
  Language,
  {
    title: string;
    lastUpdated: string;
    intro: string;
    sections?: CmsSection[];
    additionalSections?: CmsAdditionalSection[];
  }
> | null;

export default function TermsOfService() {
  const { language } = useLanguage();
  const { getSetting } = useSiteSettings();

  const companyName = getSetting('company_name', 'YR Inmobiliaria');
  const companyEmail = getSetting('company_email', 'contacto@yrinmobiliaria.com');

  const { data: cmsContent, isLoading } = useQuery({
    queryKey: ['cms-terms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_pages')
        .select('content')
        .eq('slug', 'terms')
        .maybeSingle<{ content: CmsJsonContent | null }>();

      if (error) throw error;
      return data?.content as TermsCmsContent;
    }
  });

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  // Fallback content if CMS is empty
  const fallbackContent: Record<Language, {
    title: string;
    lastUpdated: string;
    intro: string;
    sections: CmsSection[];
    additionalSections: CmsAdditionalSection[];
  }> = {
    es: {
      title: 'Términos y Condiciones de Servicio',
      lastUpdated: 'Última actualización: Noviembre 2025',
      intro: `Bienvenido a ${companyName}. Estos Términos y Condiciones rigen el uso de nuestro sitio web y servicios. Al acceder o utilizar nuestros servicios, usted acepta estar sujeto a estos términos.`,
      sections: [
        {
          icon: FileText,
          title: '1. Servicios Ofrecidos',
          content: [
            {
              subtitle: '1.1 Descripción de Servicios',
              text: `${companyName} ofrece servicios de intermediación inmobiliaria que incluyen: listado y promoción de propiedades para venta y renta, coordinación de visitas a propiedades, asesoría en transacciones inmobiliarias, servicios de valoración de propiedades, y asistencia en procesos de compra-venta y arrendamiento.`
            }
          ]
        }
      ],
      additionalSections: []
    },
    en: {
      title: 'Terms and Conditions of Service',
      lastUpdated: 'Last updated: November 2025',
      intro: `Welcome to ${companyName}. These Terms and Conditions govern the use of our website and services. By accessing or using our services, you agree to be bound by these terms.`,
      sections: [],
      additionalSections: []
    }
  };

  const currentContent = cmsContent?.[language] || fallbackContent[language];

  return (
    <PageLayout>
      <div className="container mx-auto px-4 max-w-4xl py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            {currentContent.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {currentContent.lastUpdated}
          </p>
        </div>

        {/* Introduction */}
        <Card className="p-8 mb-8 bg-card">
          <p className="text-foreground leading-relaxed">
            {currentContent.intro}
          </p>
        </Card>

        {/* Main Sections - If structured data exists */}
        {currentContent.sections && (
          <div className="space-y-8">
            {currentContent.sections.map((section, index) => (
              <Card key={index} className="p-8 bg-card">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground flex-1">
                    {section.title}
                  </h2>
                </div>

                <div className="space-y-6 ml-16">
                  {section.content.map((item, idx) => (
                    <div key={idx}>
                      <h3 className="text-lg font-semibold mb-2 text-foreground">
                        {item.subtitle}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            ))}

            {/* Additional Sections */}
            {currentContent.additionalSections?.map((section, index) => (
              <Card key={`additional-${index}`} className="p-8 bg-card">
                <h2 className="text-2xl font-bold mb-4 text-foreground">
                  {section.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {section.text}
                </p>
              </Card>
            ))}
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-12 p-6 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            {language === 'es'
              ? 'Al utilizar nuestros servicios, usted acepta estos Términos y Condiciones. Si no está de acuerdo, por favor absténgase de usar nuestros servicios.'
              : 'By using our services, you accept these Terms and Conditions. If you do not agree, please refrain from using our services.'}
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
