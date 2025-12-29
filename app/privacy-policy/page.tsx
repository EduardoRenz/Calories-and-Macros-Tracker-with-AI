import React from 'react';

const PrivacyPolicyPage = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">Política de Privacidade</h1>

            <section className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">1. Coleta de Informações</h2>
                <p>
                    Nós coletamos informações que você nos fornece diretamente, como quando você cria uma conta,
                    insere dados sobre suas refeições e atividades físicas. Também podemos coletar informações
                    automaticamente, como seu endereço IP e tipo de dispositivo.
                </p>
            </section>

            <section className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">2. Uso das Informações</h2>
                <p>
                    As informações que coletamos são usadas para fornecer, manter e melhorar nossos serviços,
                    para desenvolver novos recursos e para proteger a nós mesmos e nossos usuários. Não compartilhamos
                    suas informações pessoais com terceiros, exceto conforme descrito nesta política ou com o seu consentimento.
                </p>
            </section>

            <section className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">3. Seus Direitos</h2>
                <p>
                    Você tem o direito de acessar, corrigir ou excluir suas informações pessoais a qualquer momento.
                    Você pode fazer isso através das configurações da sua conta ou entrando em contato conosco.
                </p>
            </section>

            <section className="mb-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
                <h2 className="text-2xl font-semibold mb-2">Aviso Importante</h2>
                <p className="font-bold">
                    Todo o conteúdo e análises fornecidos por este aplicativo são gerados por Inteligência Artificial (IA).
                </p>
                <p>
                    As informações podem conter erros ou imprecisões. Este aplicativo não substitui o aconselhamento
                    de um profissional. Sempre consulte um médico, nutricionista ou outro profissional de saúde qualificado
                    antes de iniciar qualquer dieta ou programa de exercícios.
                </p>
            </section>

             <section className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">4. Alterações nesta Política</h2>
                <p>
                    Podemos atualizar nossa Política de Privacidade de tempos em tempos. Notificaremos você sobre
                    quaisquer alterações, publicando a nova Política de Privacidade nesta página.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-2">5. Contato</h2>
                <p>
                    Se você tiver alguma dúvida sobre esta Política de Privacidade, entre em contato conosco.
                </p>
            </section>
        </div>
    );
};

export default PrivacyPolicyPage;
