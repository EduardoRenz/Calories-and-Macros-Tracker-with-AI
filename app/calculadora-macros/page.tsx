import type { Metadata } from 'next';
import { buildSeoMetadata } from '@/utils/seo/metadata';
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
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-on-surface">
            Calculadora de Macros Grátis
          </h1>
          <p className="mt-2 text-on-surface-variant">
            Descubra suas metas diárias de calorias e macronutrientes
          </p>
        </div>
        <CalculatorForm />
      </div>
    </div>
  );
}
