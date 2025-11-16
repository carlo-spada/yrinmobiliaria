import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/utils/LanguageContext';
import { Card } from '@/components/ui/card';
import { Shield, Lock, FileText, AlertCircle } from 'lucide-react';

export default function PrivacyPolicy() {
  const { language } = useLanguage();

  const content = {
    es: {
      title: 'Política de Privacidad',
      lastUpdated: 'Última actualización: Noviembre 2025',
      intro: 'En Y&R Inmobiliaria, nos comprometemos a proteger su privacidad y garantizar la seguridad de su información personal. Esta Política de Privacidad describe cómo recopilamos, usamos, divulgamos y protegemos su información cuando utiliza nuestros servicios.',
      sections: [
        {
          icon: FileText,
          title: '1. Información que Recopilamos',
          content: [
            {
              subtitle: '1.1 Información Personal',
              text: 'Recopilamos información personal que usted nos proporciona directamente, incluyendo: nombre completo, dirección de correo electrónico, número de teléfono, dirección postal, información sobre preferencias de propiedades, historial de búsquedas y consultas.'
            },
            {
              subtitle: '1.2 Información Automática',
              text: 'Recopilamos automáticamente cierta información cuando visita nuestro sitio web: dirección IP, tipo de navegador, sistema operativo, páginas visitadas, tiempo de permanencia, y cookies de navegación.'
            },
            {
              subtitle: '1.3 Información de Terceros',
              text: 'Podemos recibir información adicional de fuentes públicas, socios comerciales, o proveedores de servicios de marketing para mejorar nuestros servicios.'
            }
          ]
        },
        {
          icon: Lock,
          title: '2. Uso de la Información',
          content: [
            {
              subtitle: '2.1 Prestación de Servicios',
              text: 'Utilizamos su información para: procesar solicitudes de información sobre propiedades, agendar visitas y citas, enviar comunicaciones relevantes sobre propiedades, personalizar su experiencia de usuario, y mejorar nuestros servicios.'
            },
            {
              subtitle: '2.2 Marketing y Comunicaciones',
              text: 'Podemos usar su información para enviarle boletines informativos, ofertas especiales, y actualizaciones del mercado inmobiliario. Puede optar por no recibir estas comunicaciones en cualquier momento.'
            },
            {
              subtitle: '2.3 Cumplimiento Legal',
              text: 'Usamos su información cuando sea necesario para cumplir con obligaciones legales, resolver disputas, o hacer cumplir nuestros acuerdos.'
            }
          ]
        },
        {
          icon: Shield,
          title: '3. Protección de Datos',
          content: [
            {
              subtitle: '3.1 Medidas de Seguridad',
              text: 'Implementamos medidas técnicas y organizativas apropiadas para proteger su información personal contra acceso no autorizado, alteración, divulgación o destrucción. Esto incluye: cifrado SSL/TLS para transmisión de datos, controles de acceso estrictos, auditorías de seguridad regulares, y capacitación del personal en protección de datos.'
            },
            {
              subtitle: '3.2 Retención de Datos',
              text: 'Conservamos su información personal solo durante el tiempo necesario para cumplir con los fines descritos en esta política, o según lo requiera la ley mexicana.'
            }
          ]
        },
        {
          icon: AlertCircle,
          title: '4. Sus Derechos',
          content: [
            {
              subtitle: '4.1 Derechos ARCO',
              text: 'Conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), usted tiene derecho a: acceder a sus datos personales, rectificar datos inexactos o incompletos, cancelar el uso de sus datos, y oponerse al tratamiento de sus datos para fines específicos.'
            },
            {
              subtitle: '4.2 Ejercicio de Derechos',
              text: 'Para ejercer estos derechos, puede contactarnos en: contacto@yrinmobiliaria.com. Responderemos a su solicitud dentro de los 20 días hábiles establecidos por la ley.'
            }
          ]
        }
      ],
      additionalSections: [
        {
          title: '5. Compartir Información',
          text: 'No vendemos su información personal. Podemos compartir información con: proveedores de servicios que nos ayudan a operar nuestro negocio, profesionales legales cuando sea necesario, autoridades gubernamentales cuando lo requiera la ley, y compradores potenciales en caso de venta o fusión de la empresa.'
        },
        {
          title: '6. Cookies y Tecnologías Similares',
          text: 'Utilizamos cookies y tecnologías similares para mejorar su experiencia. Puede controlar las cookies a través de la configuración de su navegador. Algunas funcionalidades pueden no estar disponibles si desactiva las cookies.'
        },
        {
          title: '7. Enlaces a Terceros',
          text: 'Nuestro sitio web puede contener enlaces a sitios de terceros. No somos responsables de las prácticas de privacidad de estos sitios. Le recomendamos revisar sus políticas de privacidad.'
        },
        {
          title: '8. Menores de Edad',
          text: 'Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos intencionalmente información personal de menores sin el consentimiento de los padres o tutores.'
        },
        {
          title: '9. Cambios a esta Política',
          text: 'Podemos actualizar esta Política de Privacidad periódicamente. Le notificaremos sobre cambios significativos publicando la nueva política en nuestro sitio web y actualizando la fecha de "Última actualización".'
        },
        {
          title: '10. Contacto',
          text: 'Si tiene preguntas sobre esta Política de Privacidad o sobre cómo manejamos su información personal, contáctenos en: Email: contacto@yrinmobiliaria.com | Teléfono: +52 (951) 123-4567 | Dirección: Calle Independencia 123, Centro Histórico, Oaxaca de Juárez, Oaxaca, México'
        }
      ]
    },
    en: {
      title: 'Privacy Policy',
      lastUpdated: 'Last updated: November 2025',
      intro: 'At Y&R Real Estate, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy describes how we collect, use, disclose, and protect your information when you use our services.',
      sections: [
        {
          icon: FileText,
          title: '1. Information We Collect',
          content: [
            {
              subtitle: '1.1 Personal Information',
              text: 'We collect personal information that you provide directly to us, including: full name, email address, phone number, postal address, property preference information, search history, and inquiries.'
            },
            {
              subtitle: '1.2 Automatic Information',
              text: 'We automatically collect certain information when you visit our website: IP address, browser type, operating system, pages visited, time spent, and browsing cookies.'
            },
            {
              subtitle: '1.3 Third-Party Information',
              text: 'We may receive additional information from public sources, business partners, or marketing service providers to improve our services.'
            }
          ]
        },
        {
          icon: Lock,
          title: '2. Use of Information',
          content: [
            {
              subtitle: '2.1 Service Provision',
              text: 'We use your information to: process property information requests, schedule visits and appointments, send relevant property communications, personalize your user experience, and improve our services.'
            },
            {
              subtitle: '2.2 Marketing and Communications',
              text: 'We may use your information to send you newsletters, special offers, and real estate market updates. You can opt out of receiving these communications at any time.'
            },
            {
              subtitle: '2.3 Legal Compliance',
              text: 'We use your information when necessary to comply with legal obligations, resolve disputes, or enforce our agreements.'
            }
          ]
        },
        {
          icon: Shield,
          title: '3. Data Protection',
          content: [
            {
              subtitle: '3.1 Security Measures',
              text: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes: SSL/TLS encryption for data transmission, strict access controls, regular security audits, and staff training in data protection.'
            },
            {
              subtitle: '3.2 Data Retention',
              text: 'We retain your personal information only for as long as necessary to fulfill the purposes described in this policy, or as required by Mexican law.'
            }
          ]
        },
        {
          icon: AlertCircle,
          title: '4. Your Rights',
          content: [
            {
              subtitle: '4.1 ARCO Rights',
              text: 'In accordance with the Federal Law on Protection of Personal Data Held by Private Parties (LFPDPPP), you have the right to: access your personal data, rectify inaccurate or incomplete data, cancel the use of your data, and oppose the processing of your data for specific purposes.'
            },
            {
              subtitle: '4.2 Exercising Rights',
              text: 'To exercise these rights, you can contact us at: contacto@yrinmobiliaria.com. We will respond to your request within the 20 business days established by law.'
            }
          ]
        }
      ],
      additionalSections: [
        {
          title: '5. Information Sharing',
          text: 'We do not sell your personal information. We may share information with: service providers who help us operate our business, legal professionals when necessary, government authorities when required by law, and potential buyers in the event of a sale or merger of the company.'
        },
        {
          title: '6. Cookies and Similar Technologies',
          text: 'We use cookies and similar technologies to enhance your experience. You can control cookies through your browser settings. Some functionalities may not be available if you disable cookies.'
        },
        {
          title: '7. Third-Party Links',
          text: 'Our website may contain links to third-party sites. We are not responsible for the privacy practices of these sites. We recommend reviewing their privacy policies.'
        },
        {
          title: '8. Minors',
          text: 'Our services are not directed to individuals under 18 years of age. We do not intentionally collect personal information from minors without parental or guardian consent.'
        },
        {
          title: '9. Changes to This Policy',
          text: 'We may update this Privacy Policy periodically. We will notify you of significant changes by posting the new policy on our website and updating the "Last updated" date.'
        },
        {
          title: '10. Contact',
          text: 'If you have questions about this Privacy Policy or how we handle your personal information, contact us at: Email: contacto@yrinmobiliaria.com | Phone: +52 (951) 123-4567 | Address: Calle Independencia 123, Centro Histórico, Oaxaca de Juárez, Oaxaca, México'
        }
      ]
    }
  };

  const currentContent = content[language];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
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
          <div className="space-y-8">
            {currentContent.sections.map((section, index) => (
              <Card key={index} className="p-8 bg-card">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <section.icon className="h-6 w-6 text-primary" />
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
            {currentContent.additionalSections.map((section, index) => (
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

          {/* Footer Note */}
          <div className="mt-12 p-6 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              {language === 'es' 
                ? 'Al utilizar nuestros servicios, usted acepta esta Política de Privacidad. Si no está de acuerdo, por favor absténgase de usar nuestros servicios.'
                : 'By using our services, you accept this Privacy Policy. If you do not agree, please refrain from using our services.'}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
