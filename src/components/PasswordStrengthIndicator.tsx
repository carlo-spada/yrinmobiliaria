import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface StrengthResult {
  score: number; // 0-100
  label: string;
  color: string;
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

export const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const [strength, setStrength] = useState<StrengthResult>({
    score: 0,
    label: '',
    color: 'bg-muted',
    requirements: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false,
    },
  });

  useEffect(() => {
    if (!password) {
      setStrength({
        score: 0,
        label: '',
        color: 'bg-muted',
        requirements: {
          length: false,
          uppercase: false,
          lowercase: false,
          number: false,
          special: false,
        },
      });
      return;
    }

    const requirements = {
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };

    const metRequirements = Object.values(requirements).filter(Boolean).length;
    const score = (metRequirements / 5) * 100;

    let label = '';
    let color = 'bg-muted';

    if (score >= 100) {
      label = 'Muy fuerte';
      color = 'bg-green-500';
    } else if (score >= 80) {
      label = 'Fuerte';
      color = 'bg-blue-500';
    } else if (score >= 60) {
      label = 'Media';
      color = 'bg-yellow-500';
    } else if (score >= 40) {
      label = 'Débil';
      color = 'bg-orange-500';
    } else {
      label = 'Muy débil';
      color = 'bg-red-500';
    }

    setStrength({ score, label, color, requirements });
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Seguridad:</span>
        <span className={`text-sm font-medium ${
          strength.score >= 80 ? 'text-green-600' : 
          strength.score >= 60 ? 'text-yellow-600' : 
          'text-red-600'
        }`}>
          {strength.label}
        </span>
      </div>
      <Progress value={strength.score} className="h-2" />
      
      <div className="space-y-1 text-xs">
        <p className="font-medium text-muted-foreground">Requisitos:</p>
        <ul className="space-y-0.5">
          <li className={strength.requirements.length ? 'text-green-600' : 'text-muted-foreground'}>
            {strength.requirements.length ? '✓' : '○'} Mínimo 12 caracteres
          </li>
          <li className={strength.requirements.uppercase ? 'text-green-600' : 'text-muted-foreground'}>
            {strength.requirements.uppercase ? '✓' : '○'} Al menos una mayúscula
          </li>
          <li className={strength.requirements.lowercase ? 'text-green-600' : 'text-muted-foreground'}>
            {strength.requirements.lowercase ? '✓' : '○'} Al menos una minúscula
          </li>
          <li className={strength.requirements.number ? 'text-green-600' : 'text-muted-foreground'}>
            {strength.requirements.number ? '✓' : '○'} Al menos un número
          </li>
          <li className={strength.requirements.special ? 'text-green-600' : 'text-muted-foreground'}>
            {strength.requirements.special ? '✓' : '○'} Al menos un carácter especial
          </li>
        </ul>
      </div>
    </div>
  );
};
