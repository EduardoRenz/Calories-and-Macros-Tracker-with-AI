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
            <section className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">4. Alterações nesta Política</h2>
                <p>
                    Podemos atualizar nossa Política de Privacidade de tempos em tempos.
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
