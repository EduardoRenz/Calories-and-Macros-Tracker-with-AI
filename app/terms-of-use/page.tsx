import Link from 'next/link';
import { HealthPalLogo } from '@/components/icons';

const TermsOfUsePage = () => {
    return (
        <div className="bg-healthpal-dark min-h-screen text-healthpal-text-primary py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-healthpal-panel p-8 rounded-2xl border border-healthpal-border shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                    <HealthPalLogo className="h-10 w-10 text-healthpal-green" />
                    <h1 className="text-3xl font-bold">Termos de Uso</h1>
                </div>

                <div className="prose prose-invert max-w-none text-healthpal-text-secondary space-y-4">
                    <p>Última atualização: 29 de Dezembro de 2025</p>

                    <h2 className="text-xl font-semibold text-healthpal-text-primary pt-4">1. Aceitação dos Termos</h2>
                    <p>Ao acessar e usar o CalorieApp, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concorda com estes termos, não use nossos serviços.</p>

                    <h2 className="text-xl font-semibold text-healthpal-text-primary pt-4">2. Descrição do Serviço</h2>
                    <p>O CalorieApp é uma ferramenta para auxiliar no acompanhamento de dietas, cálculo de calorias e macronutrientes. O conteúdo e as análises são gerados por Inteligência Artificial (IA).</p>

                    <h2 className="text-xl font-semibold text-healthpal-text-primary pt-4">3. Aviso Legal sobre Conteúdo Gerado por IA</h2>
                    <p className="font-bold text-healthpal-green">Todo o conteúdo, incluindo cálculos de calorias, análise de macronutrientes e recomendações, é gerado e analisado por Inteligência Artificial. A IA pode cometer erros e as informações fornecidas não substituem o aconselhamento de um profissional de saúde ou nutricionista qualificado.</p>
                    <p className="font-bold text-healthpal-green">Você deve sempre buscar a ajuda de um profissional para questões de saúde e nutrição. Não nos responsabilizamos por quaisquer decisões tomadas com base nas informações fornecidas por esta ferramenta.</p>

                    <h2 className="text-xl font-semibold text-healthpal-text-primary pt-4">4. Uso do Serviço</h2>
                    <p>Você concorda em usar o CalorieApp apenas para fins legais e de acordo com estes Termos. Você é responsável por todas as informações que insere no aplicativo.</p>

                    <h2 className="text-xl font-semibold text-healthpal-text-primary pt-4">5. Limitação de Responsabilidade</h2>
                    <p>O CalorieApp é fornecido "como está", sem garantias de qualquer tipo. Em nenhuma circunstância seremos responsáveis por quaisquer danos diretos, indiretos, incidentais, especiais ou consequentes decorrentes do uso ou da incapacidade de usar nosso serviço.</p>

                    <h2 className="text-xl font-semibold text-healthpal-text-primary pt-4">6. Alterações nos Termos</h2>
                    <p>Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. Notificaremos sobre quaisquer alterações, publicando os novos termos nesta página. É sua responsabilidade revisar estes Termos periodicamente.</p>

                    <h2 className="text-xl font-semibold text-healthpal-text-primary pt-4">7. Contato</h2>
                    <p>Se você tiver alguma dúvida sobre estes Termos de Uso, entre em contato conosco.</p>
                </div>

                <div className="mt-8 text-center">
                    <Link href="/login">
                        <p className="text-healthpal-green hover:underline cursor-pointer">Voltar para o Login</p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default TermsOfUsePage;
