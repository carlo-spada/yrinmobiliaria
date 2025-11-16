import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/utils/LanguageContext';
import { Card } from '@/components/ui/card';
import { FileText, Scale, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function TermsOfService() {
  const { language } = useLanguage();

  const content = {
    es: {
      title: 'Términos y Condiciones de Servicio',
      lastUpdated: 'Última actualización: Noviembre 2025',
      intro: 'Bienvenido a Y&R Inmobiliaria. Estos Términos y Condiciones rigen el uso de nuestro sitio web y servicios. Al acceder o utilizar nuestros servicios, usted acepta estar sujeto a estos términos.',
      sections: [
        {
          icon: FileText,
          title: '1. Servicios Ofrecidos',
          content: [
            {
              subtitle: '1.1 Descripción de Servicios',
              text: 'Y&R Inmobiliaria ofrece servicios de intermediación inmobiliaria que incluyen: listado y promoción de propiedades para venta y renta, coordinación de visitas a propiedades, asesoría en transacciones inmobiliarias, servicios de valoración de propiedades, y asistencia en procesos de compra-venta y arrendamiento.'
            },
            {
              subtitle: '1.2 Alcance del Servicio',
              text: 'Actuamos como intermediarios entre propietarios y potenciales compradores o arrendatarios. No somos propietarios de las propiedades listadas salvo que se indique expresamente lo contrario.'
            }
          ]
        },
        {
          icon: Scale,
          title: '2. Responsabilidades del Usuario',
          content: [
            {
              subtitle: '2.1 Información Proporcionada',
              text: 'Usted se compromete a proporcionar información veraz, precisa y actualizada. Es responsable de mantener la confidencialidad de sus credenciales de acceso y de todas las actividades realizadas bajo su cuenta.'
            },
            {
              subtitle: '2.2 Uso Apropiado',
              text: 'Se compromete a utilizar nuestros servicios únicamente para fines legales y de acuerdo con estos términos. Está prohibido: usar información obtenida para propósitos fraudulentos, interferir con el funcionamiento del sitio web, intentar acceder a áreas no autorizadas, y reproducir o distribuir contenido sin autorización.'
            },
            {
              subtitle: '2.3 Transacciones',
              text: 'Cualquier transacción inmobiliaria deberá realizarse conforme a las leyes mexicanas aplicables. Recomendamos encarecidamente la asesoría de profesionales legales independientes.'
            }
          ]
        },
        {
          icon: ShieldCheck,
          title: '3. Nuestras Responsabilidades',
          content: [
            {
              subtitle: '3.1 Exactitud de la Información',
              text: 'Nos esforzamos por mantener la información de las propiedades actualizada y precisa. Sin embargo, no garantizamos la exactitud, integridad o disponibilidad de toda la información presentada. Las características, precios y disponibilidad están sujetos a cambios sin previo aviso.'
            },
            {
              subtitle: '3.2 Servicios Profesionales',
              text: 'Brindamos servicios de intermediación inmobiliaria de manera profesional y diligente, cumpliendo con la legislación mexicana aplicable y los estándares de la industria.'
            },
            {
              subtitle: '3.3 Limitación de Responsabilidad',
              text: 'No seremos responsables por: pérdidas indirectas, consecuentes o incidentales; daños resultantes del uso o incapacidad de usar nuestros servicios; información proporcionada por terceros; o disputas entre usuarios y terceros.'
            }
          ]
        },
        {
          icon: AlertTriangle,
          title: '4. Propiedad Intelectual',
          content: [
            {
              subtitle: '4.1 Derechos de Autor',
              text: 'Todo el contenido de nuestro sitio web, incluyendo textos, gráficos, logotipos, imágenes, videos y software, está protegido por derechos de autor y otras leyes de propiedad intelectual. Son propiedad de Y&R Inmobiliaria o de sus licenciantes.'
            },
            {
              subtitle: '4.2 Uso Permitido',
              text: 'Se otorga una licencia limitada, no exclusiva e intransferible para acceder y usar el sitio web únicamente para fines personales y no comerciales. No puede copiar, modificar, distribuir, vender o explotar comercialmente ningún contenido sin autorización expresa.'
            },
            {
              subtitle: '4.3 Marcas Registradas',
              text: 'Las marcas, logotipos y nombres comerciales mostrados son propiedad de Y&R Inmobiliaria. Su uso no autorizado está estrictamente prohibido.'
            }
          ]
        }
      ],
      additionalSections: [
        {
          title: '5. Comisiones y Honorarios',
          text: 'Los honorarios por nuestros servicios se establecen mediante contrato específico con cada cliente. Las comisiones estándar aplican conforme a las prácticas del mercado inmobiliario en Oaxaca y son negociables. Todos los precios están sujetos a IVA cuando aplique según la legislación fiscal mexicana.'
        },
        {
          title: '6. Confidencialidad',
          text: 'Mantenemos la confidencialidad de la información proporcionada por nuestros clientes conforme a nuestra Política de Privacidad y las leyes aplicables. No compartiremos información personal sin consentimiento, excepto cuando sea requerido por ley.'
        },
        {
          title: '7. Cancelación y Modificación',
          text: 'Los servicios pueden ser cancelados por cualquiera de las partes mediante notificación escrita con al menos 30 días de anticipación, salvo que se establezca lo contrario en contratos específicos. Las citas y visitas programadas pueden ser reagendadas con al menos 24 horas de anticipación.'
        },
        {
          title: '8. Resolución de Disputas',
          text: 'Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier disputa será resuelta mediante: 1) Negociación directa de buena fe entre las partes, 2) Mediación ante una institución reconocida, y 3) Jurisdicción de los tribunales competentes en Oaxaca de Juárez, Oaxaca, México.'
        },
        {
          title: '9. Fuerza Mayor',
          text: 'No seremos responsables por el incumplimiento de obligaciones debido a circunstancias fuera de nuestro control razonable, incluyendo pero no limitado a: desastres naturales, actos de autoridad, conflictos laborales, interrupciones de servicios de terceros, o pandemias.'
        },
        {
          title: '10. Modificaciones a los Términos',
          text: 'Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios significativos serán notificados mediante correo electrónico o publicación en nuestro sitio web. El uso continuado de nuestros servicios después de las modificaciones constituye aceptación de los nuevos términos.'
        },
        {
          title: '11. Divisibilidad',
          text: 'Si alguna disposición de estos términos es declarada inválida o inaplicable, las disposiciones restantes permanecerán en pleno vigor y efecto. La disposición inválida será reemplazada por una válida que refleje mejor la intención original.'
        },
        {
          title: '12. Acuerdo Completo',
          text: 'Estos términos, junto con nuestra Política de Privacidad, constituyen el acuerdo completo entre usted y Y&R Inmobiliaria con respecto al uso de nuestros servicios, y reemplazan cualquier acuerdo o comunicación anterior.'
        },
        {
          title: '13. Contacto',
          text: 'Para preguntas sobre estos Términos y Condiciones, contáctenos en: Email: contacto@yrinmobiliaria.com | Teléfono: +52 (951) 123-4567 | Dirección: Calle Independencia 123, Centro Histórico, Oaxaca de Juárez, Oaxaca, México | Horario: Lunes a Viernes, 9:00 AM - 6:00 PM'
        }
      ]
    },
    en: {
      title: 'Terms and Conditions of Service',
      lastUpdated: 'Last updated: November 2025',
      intro: 'Welcome to Y&R Real Estate. These Terms and Conditions govern the use of our website and services. By accessing or using our services, you agree to be bound by these terms.',
      sections: [
        {
          icon: FileText,
          title: '1. Services Offered',
          content: [
            {
              subtitle: '1.1 Service Description',
              text: 'Y&R Real Estate offers real estate intermediary services that include: listing and promotion of properties for sale and rent, coordination of property visits, advisory services in real estate transactions, property valuation services, and assistance in purchase-sale and lease processes.'
            },
            {
              subtitle: '1.2 Service Scope',
              text: 'We act as intermediaries between property owners and potential buyers or tenants. We are not owners of the listed properties unless expressly stated otherwise.'
            }
          ]
        },
        {
          icon: Scale,
          title: '2. User Responsibilities',
          content: [
            {
              subtitle: '2.1 Information Provided',
              text: 'You commit to providing truthful, accurate, and updated information. You are responsible for maintaining the confidentiality of your access credentials and all activities performed under your account.'
            },
            {
              subtitle: '2.2 Appropriate Use',
              text: 'You commit to using our services only for legal purposes and in accordance with these terms. The following is prohibited: using information obtained for fraudulent purposes, interfering with the website operation, attempting to access unauthorized areas, and reproducing or distributing content without authorization.'
            },
            {
              subtitle: '2.3 Transactions',
              text: 'Any real estate transaction must be conducted in accordance with applicable Mexican laws. We strongly recommend the advice of independent legal professionals.'
            }
          ]
        },
        {
          icon: ShieldCheck,
          title: '3. Our Responsibilities',
          content: [
            {
              subtitle: '3.1 Information Accuracy',
              text: 'We strive to keep property information updated and accurate. However, we do not guarantee the accuracy, completeness, or availability of all information presented. Features, prices, and availability are subject to change without notice.'
            },
            {
              subtitle: '3.2 Professional Services',
              text: 'We provide real estate intermediary services in a professional and diligent manner, complying with applicable Mexican legislation and industry standards.'
            },
            {
              subtitle: '3.3 Limitation of Liability',
              text: 'We will not be responsible for: indirect, consequential, or incidental losses; damages resulting from use or inability to use our services; information provided by third parties; or disputes between users and third parties.'
            }
          ]
        },
        {
          icon: AlertTriangle,
          title: '4. Intellectual Property',
          content: [
            {
              subtitle: '4.1 Copyright',
              text: 'All content on our website, including texts, graphics, logos, images, videos, and software, is protected by copyright and other intellectual property laws. They are owned by Y&R Real Estate or its licensors.'
            },
            {
              subtitle: '4.2 Permitted Use',
              text: 'A limited, non-exclusive, and non-transferable license is granted to access and use the website only for personal and non-commercial purposes. You may not copy, modify, distribute, sell, or commercially exploit any content without express authorization.'
            },
            {
              subtitle: '4.3 Trademarks',
              text: 'The trademarks, logos, and trade names displayed are property of Y&R Real Estate. Their unauthorized use is strictly prohibited.'
            }
          ]
        }
      ],
      additionalSections: [
        {
          title: '5. Commissions and Fees',
          text: 'Fees for our services are established through specific contracts with each client. Standard commissions apply according to real estate market practices in Oaxaca and are negotiable. All prices are subject to VAT when applicable according to Mexican tax legislation.'
        },
        {
          title: '6. Confidentiality',
          text: 'We maintain the confidentiality of information provided by our clients in accordance with our Privacy Policy and applicable laws. We will not share personal information without consent, except when required by law.'
        },
        {
          title: '7. Cancellation and Modification',
          text: 'Services may be canceled by either party through written notification with at least 30 days notice, unless otherwise established in specific contracts. Scheduled appointments and visits can be rescheduled with at least 24 hours notice.'
        },
        {
          title: '8. Dispute Resolution',
          text: 'These terms are governed by the laws of the United Mexican States. Any dispute will be resolved through: 1) Direct good faith negotiation between parties, 2) Mediation before a recognized institution, and 3) Jurisdiction of competent courts in Oaxaca de Juárez, Oaxaca, Mexico.'
        },
        {
          title: '9. Force Majeure',
          text: 'We will not be responsible for failure to fulfill obligations due to circumstances beyond our reasonable control, including but not limited to: natural disasters, acts of authority, labor conflicts, third-party service interruptions, or pandemics.'
        },
        {
          title: '10. Modifications to Terms',
          text: 'We reserve the right to modify these terms at any time. Significant changes will be notified by email or publication on our website. Continued use of our services after modifications constitutes acceptance of the new terms.'
        },
        {
          title: '11. Severability',
          text: 'If any provision of these terms is declared invalid or unenforceable, the remaining provisions will remain in full force and effect. The invalid provision will be replaced by a valid one that best reflects the original intent.'
        },
        {
          title: '12. Entire Agreement',
          text: 'These terms, together with our Privacy Policy, constitute the complete agreement between you and Y&R Real Estate regarding the use of our services, and replace any prior agreements or communications.'
        },
        {
          title: '13. Contact',
          text: 'For questions about these Terms and Conditions, contact us at: Email: contacto@yrinmobiliaria.com | Phone: +52 (951) 123-4567 | Address: Calle Independencia 123, Centro Histórico, Oaxaca de Juárez, Oaxaca, Mexico | Hours: Monday to Friday, 9:00 AM - 6:00 PM'
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
                ? 'Al utilizar nuestros servicios, usted acepta estos Términos y Condiciones. Si no está de acuerdo, por favor absténgase de usar nuestros servicios.'
                : 'By using our services, you accept these Terms and Conditions. If you do not agree, please refrain from using our services.'}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
