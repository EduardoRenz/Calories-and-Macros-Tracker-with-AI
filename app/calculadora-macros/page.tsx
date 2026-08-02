import type { Metadata } from 'next';
import { buildSeoMetadata } from '@/utils/seo/metadata';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import CalculatorHeader from './CalculatorHeader';
import CalculatorForm from './CalculatorForm';

export const metadata: Metadata = buildSeoMetadata({
  title: 'Calculadora de Macros Grátis — LeveMente AI',
  description:
    'Calcule seus macros diários (proteína, carboidratos e gorduras) com base no seu peso, altura, idade e nível de atividade. Ferramenta gratuita baseada na equação Mifflin-St Jeor.',
  path: '/calculadora-macros',
  ogImage: '/og/calculadora-macros.png',
});

export default function CalculadoraMacrosPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-4 flex justify-center">
          <div className="w-full max-w-xs">
            <LanguageSwitcher showBorder={false} />
          </div>
        </div>
        <CalculatorHeader />
        <CalculatorForm />
      </div>
    </div>
  );
}
