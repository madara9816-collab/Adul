import type { Route } from "@/router";

interface LegalPageProps {
  navigate: (route: Route) => void;
}

const SECTIONS = [
  {
    title: "Política de Privacidade",
    content: [
      "Esta plataforma respeita a privacidade dos usuários. A seguir, descrevemos como tratamos seus dados:",
      "Dados Armazenados Localmente: Suas buscas recentes e favoritos são salvos exclusivamente no armazenamento local do seu navegador (localStorage). Esses dados não são enviados para nossos servidores.",
      "Dados de Navegação: Não coletamos dados pessoais identificáveis para navegação no catálogo. Dados agregados e anônimos podem ser utilizados para melhoria do serviço.",
      "Cookies: O site pode utilizar cookies essenciais para funcionamento básico. Não utilizamos cookies de rastreamento de terceiros para publicidade sem consentimento.",
      "Conteúdo de Terceiros: Os vídeos exibidos são fornecidos por APIs externas (Eporner). Ao interagir com o conteúdo, você está sujeito às políticas de privacidade da fonte original.",
      "Verificação de Idade: A confirmação de idade é armazenada localmente no seu navegador. Não solicitamos documentos de identidade para acesso básico.",
      "Direitos do Usuário: Você pode limpar seus dados a qualquer momento apagando o histórico de busca e favoritos nas respectivas seções, ou limpando o cache do navegador.",
      "Contato: Para questões sobre privacidade, entre em contato através da página de contato.",
    ],
  },
];

export function PrivacyPage({}: LegalPageProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">{SECTIONS[0].title}</h1>
      <div className="space-y-4">
        {SECTIONS[0].content.map((paragraph, i) => (
          <p key={i} className="text-sm text-neutral-400 leading-relaxed">{paragraph}</p>
        ))}
      </div>
    </div>
  );
}

export function TermsPage({}: LegalPageProps) {
  const terms = [
    "Aceitação dos Termos: Ao acessar este site, você concorda com estes termos de uso. Se não concordar, não utilize a plataforma.",
    "Restrição de Idade: Este site é destinado exclusivamente a adultos com 18 anos ou mais (ou a idade legal em sua jurisdição). Menores de idade não devem acessar este conteúdo.",
    "Uso do Conteúdo: O conteúdo exibido é fornecido por fontes externas autorizadas. Não armazenamos vídeos em nossos servidores. Todo o conteúdo é incorporado ou linkado a partir da fonte original.",
    "Propriedade Intelectual: Os vídeos, thumbnails e metadados pertencem aos seus respectivos criadores e plataformas de origem. Não reivindicamos propriedade sobre qualquer conteúdo de terceiros.",
    "Uso Proibido: É proibido utilizar a plataforma para qualquer finalidade ilegal, incluindo mas não se limitando a: distribuição de conteúdo envolvendo menores de idade, conteúdo não consensual, violação de direitos autorais, ou qualquer atividade que viole leis aplicáveis.",
    "Limitação de Responsabilidade: A plataforma atua como agregador de conteúdo. Não nos responsabilizamos pelo conteúdo fornecido por fontes externas, sua disponibilidade, ou adequação.",
    "Modificações: Reservamo-nos o direito de modificar estes termos a qualquer momento. Mudanças entram em vigor imediatamente após publicação.",
    "Jurisdição: Estes termos são regidos pelas leis brasileiras aplicáveis.",
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Termos de Uso</h1>
      <div className="space-y-4">
        {terms.map((paragraph, i) => (
          <p key={i} className="text-sm text-neutral-400 leading-relaxed">{paragraph}</p>
        ))}
      </div>
    </div>
  );
}

export function DmcaPage({}: LegalPageProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">DMCA / Remoção de Conteúdo</h1>
      <div className="space-y-4">
        <p className="text-sm text-neutral-400 leading-relaxed">
          Respeitamos os direitos de propriedade intelectual e trabalhamos para garantir que apenas conteúdo legal e autorizado seja disponibilizado.
        </p>
        <p className="text-sm text-neutral-400 leading-relaxed">
          Se você acredita que conteúdo disponível através desta plataforma viola seus direitos autorais ou outros direitos, entre em contato através da página de contato com as seguintes informações:
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm text-neutral-400">
          <li>Identificação do material questionado (URL ou título)</li>
          <li>Prova de propriedade ou autorização</li>
          <li>Seus dados de contato</li>
          <li>Declaração de boa-fé de que a reclamação é verídica</li>
        </ul>
        <p className="text-sm text-neutral-400 leading-relaxed">
          Processaremos as reclamações em até 72 horas. Para conteúdo envolvendo menores de idade ou conteúdo não consensual, a remoção é imediata e permanente.
        </p>
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-sm text-red-300 font-medium">
            Conteúdo Ilegal: Qualquer conteúdo envolvendo menores de idade, exploração sexual, ou conteúdo íntimo sem consentimento será removido imediatamente e as autoridades competentes serão notificadas.
          </p>
        </div>
      </div>
    </div>
  );
}

export function ContactPage({}: LegalPageProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Fale Conosco</h1>
      <div className="space-y-4">
        <p className="text-sm text-neutral-400 leading-relaxed">
          Para questões sobre a plataforma, removação de conteúdo, parcerias ou denúncias, entre em contato através do formulário abaixo.
        </p>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Mensagem enviada! Em breve entraremos em contato."); }}>
          <div>
            <label className="text-sm text-neutral-300 block mb-1">Nome</label>
            <input
              type="text"
              required
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-red-500/60"
            />
          </div>
          <div>
            <label className="text-sm text-neutral-300 block mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-red-500/60"
            />
          </div>
          <div>
            <label className="text-sm text-neutral-300 block mb-1">Assunto</label>
            <select className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-red-500/60">
              <option>Remoção de conteúdo</option>
              <option>Denúncia</option>
              <option>Dúvida geral</option>
              <option>Parceria</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-neutral-300 block mb-1">Mensagem</label>
            <textarea
              required
              rows={5}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-red-500/60 resize-none"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Enviar mensagem
          </button>
        </form>
      </div>
    </div>
  );
}
