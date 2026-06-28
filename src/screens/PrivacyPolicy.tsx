import { useQuery } from '@tanstack/react-query';
import { Shield, Loader2, FileLock2 } from 'lucide-react';
import Link from 'next/link';

import { PageLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePublicSiteSettings } from '@/hooks/usePublicSiteSettings';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import type { Language } from '@/types';

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

type PrivacyCmsContent = Record<
  Language,
  {
    title: string;
    lastUpdated: string;
    intro: string;
    sections?: CmsSection[];
    additionalSections?: CmsAdditionalSection[];
  }
> | null;

export default function PrivacyPolicy() {
  const { language } = useLanguage();
  const { getSetting } = usePublicSiteSettings();

  const companyName = getSetting('company_name', 'YR Inmobiliaria');
  const companyEmail = getSetting('company_email', 'contacto@yrinmobiliaria.com');
  const companyAddress = getSetting(
    'company_address',
    'Oaxaca de Juárez, Oaxaca, México'
  );

  const { data: cmsContent, isLoading } = useQuery({
    queryKey: ['cms-privacy'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_pages')
        .select('content')
        .eq('slug', 'privacy')
        .maybeSingle<{ content: CmsJsonContent | null }>();

      if (error) throw error;
      // TanStack Query v5 prohíbe devolver undefined; sin fila CMS usamos null
      // y el componente cae al contenido base (fallbackContent).
      return (data?.content as PrivacyCmsContent) ?? null;
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

  // Aviso de Privacidad conforme a la LFPDPPP (reforma vigente desde marzo 2025).
  // Sirve como contenido base; un registro `privacy` en cms_pages lo puede sobrescribir.
  const fallbackContent: Record<Language, {
    title: string;
    lastUpdated: string;
    intro: string;
    sections: CmsSection[];
    additionalSections: CmsAdditionalSection[];
  }> = {
    es: {
      title: 'Aviso de Privacidad',
      lastUpdated: 'Última actualización: junio 2026',
      intro: `${companyName}, con domicilio en ${companyAddress} y correo de contacto ${companyEmail}, es responsable del tratamiento de sus datos personales conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), su Reglamento y la normativa aplicable. Este Aviso describe qué datos recabamos, para qué fines y cómo puede ejercer sus derechos.`,
      sections: [
        {
          title: 'Datos personales que recabamos',
          content: [
            {
              subtitle: 'Datos de identificación y contacto',
              text: 'Nombre, correo electrónico, número telefónico y, en su caso, los mensajes o preferencias que nos comparta al contactarnos, agendar una visita, registrarse o solicitar información sobre una propiedad.'
            },
            {
              subtitle: 'Datos de navegación',
              text: 'Información técnica generada al usar el sitio (por ejemplo, propiedades favoritas o búsquedas guardadas en su dispositivo). No recabamos más datos de los necesarios para los fines descritos.'
            },
            {
              subtitle: 'Datos sensibles',
              text: 'No recabamos datos personales sensibles. Le pedimos no incluir información sensible en los campos de mensaje o notas de nuestros formularios.'
            }
          ]
        },
        {
          title: 'Finalidades del tratamiento',
          content: [
            {
              subtitle: 'Finalidades primarias',
              text: 'Atender sus consultas, agendar y dar seguimiento a visitas, ponerle en contacto con un agente, gestionar su cuenta y favoritos, y prestar los servicios inmobiliarios solicitados. Estas finalidades son necesarias para la relación con usted.'
            },
            {
              subtitle: 'Finalidades secundarias',
              text: 'Enviarle información sobre nuevas propiedades, novedades y comunicaciones de marketing. Puede oponerse a estas finalidades en cualquier momento sin afectar las finalidades primarias, escribiendo a ' + companyEmail + '.'
            }
          ]
        },
        {
          title: 'Derechos ARCO y revocación del consentimiento',
          content: [
            {
              subtitle: 'Sus derechos',
              text: 'Usted puede Acceder a sus datos, Rectificarlos cuando sean inexactos, Cancelarlos cuando considere que no se requieren para los fines, u Oponerse a su tratamiento (Derechos ARCO). También puede revocar el consentimiento otorgado y limitar el uso o divulgación de sus datos.'
            },
            {
              subtitle: 'Cómo ejercerlos',
              text: 'Envíe su solicitud a través de nuestro formulario de Derechos ARCO o al correo ' + companyEmail + ', indicando su nombre, los datos involucrados y el derecho que desea ejercer. Responderemos en los plazos establecidos por la ley.'
            }
          ]
        }
      ],
      additionalSections: [
        {
          title: 'Transferencias de datos',
          text: 'No transferimos sus datos personales a terceros sin su consentimiento, salvo en los casos previstos por el artículo aplicable de la LFPDPPP (por ejemplo, requerimientos de autoridad competente). Los proveedores tecnológicos que nos prestan servicios (alojamiento y envío de correos) actúan como encargados y tratan los datos únicamente bajo nuestras instrucciones.'
        },
        {
          title: 'Medidas de seguridad',
          text: 'Aplicamos medidas administrativas, técnicas y físicas razonables para proteger sus datos contra daño, pérdida, alteración o acceso no autorizado, incluyendo control de acceso por roles y cifrado en tránsito. En caso de una vulneración que afecte significativamente sus derechos, se lo notificaremos conforme a la ley.'
        },
        {
          title: 'Cambios al Aviso de Privacidad',
          text: 'Este Aviso puede actualizarse para reflejar cambios legales o en nuestras prácticas. Publicaremos la versión vigente en esta página, indicando la fecha de última actualización.'
        },
        {
          title: 'Autoridad',
          text: 'Si considera que su derecho a la protección de datos ha sido vulnerado, puede acudir a la autoridad competente en materia de protección de datos personales.'
        }
      ]
    },
    en: {
      title: 'Privacy Notice',
      lastUpdated: 'Last updated: June 2026',
      intro: `${companyName}, located at ${companyAddress} and reachable at ${companyEmail}, is responsible for processing your personal data in accordance with Mexico's Federal Law on Protection of Personal Data Held by Private Parties (LFPDPPP), its Regulations, and applicable rules. This Notice describes what data we collect, for what purposes, and how you can exercise your rights.`,
      sections: [
        {
          title: 'Personal data we collect',
          content: [
            {
              subtitle: 'Identification and contact data',
              text: 'Name, email address, phone number and, where applicable, the messages or preferences you share when contacting us, scheduling a visit, registering, or requesting information about a property.'
            },
            {
              subtitle: 'Browsing data',
              text: 'Technical information generated when using the site (e.g., favorite properties or saved searches stored on your device). We do not collect more data than necessary for the stated purposes.'
            },
            {
              subtitle: 'Sensitive data',
              text: 'We do not collect sensitive personal data. Please do not include sensitive information in the message or notes fields of our forms.'
            }
          ]
        },
        {
          title: 'Purposes of processing',
          content: [
            {
              subtitle: 'Primary purposes',
              text: 'To handle your inquiries, schedule and follow up on visits, connect you with an agent, manage your account and favorites, and provide the requested real-estate services. These purposes are necessary for our relationship with you.'
            },
            {
              subtitle: 'Secondary purposes',
              text: 'To send you information about new properties, news, and marketing communications. You may opt out of these purposes at any time without affecting the primary purposes by writing to ' + companyEmail + '.'
            }
          ]
        },
        {
          title: 'ARCO rights and withdrawal of consent',
          content: [
            {
              subtitle: 'Your rights',
              text: 'You may Access your data, Rectify it when inaccurate, Cancel it when you believe it is no longer required for the purposes, or Oppose its processing (ARCO rights). You may also withdraw the consent granted and limit the use or disclosure of your data.'
            },
            {
              subtitle: 'How to exercise them',
              text: 'Submit your request through our ARCO Rights form or by email to ' + companyEmail + ', stating your name, the data involved, and the right you wish to exercise. We will respond within the timeframes set by law.'
            }
          ]
        }
      ],
      additionalSections: [
        {
          title: 'Data transfers',
          text: 'We do not transfer your personal data to third parties without your consent, except in the cases provided by the applicable LFPDPPP provisions (e.g., requests from a competent authority). Technology providers that serve us (hosting and email delivery) act as data processors and handle data solely under our instructions.'
        },
        {
          title: 'Security measures',
          text: 'We apply reasonable administrative, technical, and physical measures to protect your data against damage, loss, alteration, or unauthorized access, including role-based access control and encryption in transit. In the event of a breach that significantly affects your rights, we will notify you as required by law.'
        },
        {
          title: 'Changes to this Privacy Notice',
          text: 'This Notice may be updated to reflect legal changes or changes in our practices. We will publish the current version on this page, indicating the last update date.'
        },
        {
          title: 'Authority',
          text: 'If you believe your right to data protection has been violated, you may contact the competent authority for the protection of personal data.'
        }
      ]
    }
  };

  const currentContent = cmsContent?.[language] || fallbackContent[language];
  const arcoCta = language === 'es'
    ? {
        title: 'Ejerce tus Derechos ARCO',
        text: 'Solicita el acceso, rectificación, cancelación u oposición sobre tus datos personales.',
        button: 'Ir al formulario de Derechos ARCO'
      }
    : {
        title: 'Exercise your ARCO Rights',
        text: 'Request access, rectification, cancellation, or opposition regarding your personal data.',
        button: 'Go to the ARCO Rights form'
      };

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

        {/* Main Sections */}
        {currentContent.sections && (
          <div className="space-y-8">
            {currentContent.sections.map((section, index) => (
              <Card key={index} className="p-8 bg-card">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
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

        {/* ARCO call to action */}
        <Card className="p-8 mt-8 bg-primary/5 border-primary/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="p-3 rounded-lg bg-primary/10">
              <FileLock2 className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <h2 className="text-xl font-bold text-foreground">{arcoCta.title}</h2>
              <p className="text-muted-foreground">{arcoCta.text}</p>
            </div>
            <Button asChild>
              <Link href="/derechos-arco">{arcoCta.button}</Link>
            </Button>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
