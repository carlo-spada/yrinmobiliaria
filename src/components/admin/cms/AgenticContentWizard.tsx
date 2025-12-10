import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bot, Sparkles, CheckCircle2, RefreshCw, ChevronRight, ChevronLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WizardStep {
  id: string;
  question: string;
  placeholder: string;
  type: 'text' | 'textarea';
}

export type CmsPageType = 'about' | 'terms' | 'privacy';

export interface WizardResult {
  content: string;
  raw_answers: Record<string, string>;
}

interface AgenticContentWizardProps {
  pageType: CmsPageType;
  onComplete: (content: WizardResult) => void;
  onCancel: () => void;
}

const STEPS: Record<CmsPageType, WizardStep[]> = {
  about: [
    { id: 'mission', question: '¿Cuál es la misión principal de su inmobiliaria?', placeholder: 'Ej: Ayudar a familias a encontrar su hogar ideal...', type: 'textarea' },
    { id: 'experience', question: '¿Cuántos años de experiencia tienen y en qué zonas se especializan?', placeholder: 'Ej: Más de 10 años en la zona centro...', type: 'text' },
    { id: 'values', question: '¿Qué valores definen a su equipo?', placeholder: 'Ej: Honestidad, transparencia, rapidez...', type: 'text' },
    { id: 'team', question: 'Cuéntame brevemente sobre el equipo fundador.', placeholder: 'Ej: Fundada por arquitectos expertos...', type: 'textarea' },
  ],
  terms: [
    { id: 'company_name', question: 'Nombre legal de la empresa', placeholder: 'YR Inmobiliaria S.A. de C.V.', type: 'text' },
    { id: 'jurisdiction', question: '¿Bajo qué leyes/estado se rigen?', placeholder: 'Oaxaca, México', type: 'text' },
    { id: 'contact_email', question: 'Email para notificaciones legales', placeholder: 'legal@yrinmobiliaria.com', type: 'text' },
  ],
  privacy: [
    { id: 'data_collection', question: '¿Qué datos recolectan de los usuarios?', placeholder: 'Nombre, email, teléfono...', type: 'textarea' },
    { id: 'data_usage', question: '¿Para qué utilizan estos datos?', placeholder: 'Contactar para citas, marketing...', type: 'textarea' },
  ]
};

export function AgenticContentWizard({ pageType, onComplete, onCancel }: AgenticContentWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);

  const steps = STEPS[pageType] || STEPS['about'];
  const currentStep = steps[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      generateContent();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const generateContent = async () => {
    setIsGenerating(true);
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock generation logic based on answers
    let content = '';
    if (pageType === 'about') {
      content = `
# Sobre Nosotros

## Nuestra Misión
${answers['mission'] || 'Nuestra misión es brindar el mejor servicio.'}

## Experiencia y Cobertura
Con ${answers['experience'] || 'amplia experiencia'}, nos hemos posicionado como líderes en el mercado.

## Nuestros Valores
Nos regimos por: ${answers['values'] || 'Integridad y compromiso'}.

## Nuestro Equipo
${answers['team'] || 'Contamos con un equipo multidisciplinario listo para atenderte.'}
      `;
    } else {
      content = `Contenido generado para ${pageType} basado en: ${JSON.stringify(answers)}`;
    }

    setGeneratedContent(content);
    setIsGenerating(false);
  };

  if (generatedContent) {
    return (
      <Card className="w-full max-w-3xl mx-auto border-primary/20 shadow-lg">
        <CardHeader className="bg-primary/5 border-b">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Contenido Generado</CardTitle>
          </div>
          <CardDescription>Revisa el contenido generado por nuestra IA.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ScrollArea className="h-[400px] w-full rounded-md border p-4 bg-muted/30">
            <pre className="whitespace-pre-wrap font-sans text-sm">{generatedContent}</pre>
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6 bg-gray-50/50">
          <Button variant="outline" onClick={() => setGeneratedContent(null)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Intentar de nuevo
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
            <Button onClick={() => onComplete({ content: generatedContent, raw_answers: answers })}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Aprobar y Guardar
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto border-primary/20 shadow-lg transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Asistente de Contenido</CardTitle>
              <CardDescription>
                Paso {currentStepIndex + 1} de {steps.length}
              </CardDescription>
            </div>
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            {Math.round(((currentStepIndex) / steps.length) * 100)}% Completado
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 w-full bg-primary/10 mt-4 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${((currentStepIndex) / steps.length) * 100}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="p-8 min-h-[300px] flex flex-col justify-center">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-10">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary animate-pulse" />
            </div>
            <p className="text-lg font-medium text-primary animate-pulse">Generando contenido mágico...</p>
            <p className="text-sm text-muted-foreground">Analizando tus respuestas para crear el mejor texto.</p>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <Label htmlFor="answer" className="text-xl font-medium leading-relaxed">
                {currentStep.question}
              </Label>
              <p className="text-sm text-muted-foreground">
                Sé tan detallado como quieras, la IA pulirá el texto final.
              </p>
            </div>
            
            {currentStep.type === 'textarea' ? (
              <Textarea
                id="answer"
                placeholder={currentStep.placeholder}
                className="min-h-[150px] text-lg p-4 resize-none focus-visible:ring-primary"
                value={answers[currentStep.id] || ''}
                onChange={(e) => setAnswers(prev => ({ ...prev, [currentStep.id]: e.target.value }))}
                autoFocus
              />
            ) : (
              <Input
                id="answer"
                placeholder={currentStep.placeholder}
                className="text-lg p-6 focus-visible:ring-primary"
                value={answers[currentStep.id] || ''}
                onChange={(e) => setAnswers(prev => ({ ...prev, [currentStep.id]: e.target.value }))}
                autoFocus
              />
            )}
          </div>
        )}
      </CardContent>

      {!isGenerating && (
        <CardFooter className="flex justify-between border-t p-6 bg-gray-50/50">
          <Button 
            variant="ghost" 
            onClick={currentStepIndex === 0 ? onCancel : handleBack}
            className="text-muted-foreground hover:text-foreground"
          >
            {currentStepIndex === 0 ? 'Cancelar' : (
              <>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Anterior
              </>
            )}
          </Button>
          
          <Button 
            onClick={handleNext} 
            disabled={!answers[currentStep.id]}
            className="min-w-[120px]"
          >
            {currentStepIndex === steps.length - 1 ? (
              <>
                Generar
                <Sparkles className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Siguiente
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
