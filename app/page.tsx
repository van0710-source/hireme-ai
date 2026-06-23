'use client';

import { useState, useEffect, useCallback } from 'react';
import PdfUploader from '@/components/PdfUploader';

const translations = {
  en: {
    title: 'HireMe AI',
    heroTitle: 'Paste your resume. Get the interview that fits.',
    heroSubtitle: 'One resume. Any company. Tailored in seconds.',
    pasteHint: 'You can paste your text resume here',
    orUpload: 'Or upload PDF',
    uploadLimit: '5MB · 20 pages',
    dragHint: 'or drag & drop',
    parsing: 'Extracting PDF...',
    errorInvalidType: 'Please upload a PDF file.',
    errorTooLarge: 'File too large or too many pages (max 5MB / 20 pages).',
    errorNoText: 'No readable text found — this PDF may be scanned. Please paste your resume text instead.',
    errorParseFailed: 'Could not read this PDF. Please paste your resume text directly into the box.',
    targetLabel: 'Target company or industry (optional)',
    targetPlaceholder: 'e.g., Google, Fintech, SaaS Sales',
    button: 'Generate My Interview Pass',
    generating: 'Generating your pass...',
    resultTitle: 'Your Interview Pass is Ready',
    copy: 'Copy all',
    footer: 'HireMe AI — Walk into your interview with confidence',
    disclaimer: 'AI-generated suggestions, for reference only.',
    privacy: 'Privacy',
    terms: 'Terms',
    resources: 'Resources',
    contact: 'Contact',
    step1: 'Paste Resume',
    step2: 'AI Analysis',
    step3: 'Get Your Pass',
    atsNotice: '70% of resumes are rejected by ATS before a human sees them. We help you stand out.',
    aiNoticeShort: 'AI-assisted. Adjust with your personal experience.',
    resultNotice: 'AI-generated suggestions, for reference only. Not a guarantee of interviews or job offers.',
    quotaFree: (n: number) => `Free uses left: ${n} / 3`,
    quotaCredits: (n: number) => `Credits: ${n}`,
    quotaPaid: (n: number) => `Single-use passes: ${n}`,
    limitReached: 'Free limit reached. Purchase credits to continue.',
    payTitle: 'Continue with a paid pass',
    paySingleTitle: '$1 — 1 generation',
    paySingleDesc: 'Instant access for one tailored result.',
    payCreditsTitle: '$20 — 200 credits',
    payCreditsDesc: '15 credits per use (~13 generations).',
    payButton: 'Buy now',
    payLoading: 'Redirecting to checkout...',
  },
  zh: {
    title: 'HireMe AI',
    heroTitle: '粘贴简历，获得更匹配的面试机会。',
    heroSubtitle: '一份简历，任意公司，数秒定制。',
    pasteHint: '可直接粘贴文字版简历',
    orUpload: '或上传 PDF',
    uploadLimit: '5MB · 20页',
    dragHint: '或拖拽到此处',
    parsing: '正在解析 PDF...',
    errorInvalidType: '请上传 PDF 文件。',
    errorTooLarge: '文件过大或页数过多（最大 5MB / 20 页）。',
    errorNoText: '未检测到可读文本，可能是扫描件。请直接粘贴简历文字。',
    errorParseFailed: '无法读取此 PDF，请直接将简历文字粘贴到左侧文本框。',
    targetLabel: '目标公司或行业（可选）',
    targetPlaceholder: '例如：Google、金融科技、SaaS 销售',
    button: '生成我的面试通行证',
    generating: '生成中...',
    resultTitle: '你的面试通行证已就绪',
    copy: '复制全部',
    footer: 'HireMe AI — 自信走进每一场面试',
    disclaimer: 'AI 生成建议，仅供参考。',
    privacy: '隐私政策',
    terms: '服务条款',
    resources: '资源',
    contact: '联系我们',
    step1: '粘贴简历',
    step2: 'AI 分析',
    step3: '获取通行证',
    atsNotice: '70% 的简历在到达 HR 之前就被 ATS 筛掉。我们帮你脱颖而出。',
    aiNoticeShort: 'AI 辅助生成，建议结合个人经历微调。',
    resultNotice: 'AI 生成建议，仅供参考。不承诺获得面试或录用。',
    quotaFree: (n: number) => `免费次数剩余: ${n} / 3`,
    quotaCredits: (n: number) => `积分: ${n}`,
    quotaPaid: (n: number) => `单次额度: ${n}`,
    limitReached: '免费次数已用完，请购买额度继续使用。',
    payTitle: '购买额度继续生成',
    paySingleTitle: '$1 — 1 次生成',
    paySingleDesc: '即时获得一次定制结果。',
    payCreditsTitle: '$20 — 200 积分',
    payCreditsDesc: '每次使用扣除 15 积分（约 13 次）。',
    payButton: '立即购买',
    payLoading: '正在跳转支付...',
  },
  es: {
    title: 'HireMe AI',
    heroTitle: 'Pega tu currículum. Consigue la entrevista que encaja.',
    heroSubtitle: 'Un currículum. Cualquier empresa. Personalizado en segundos.',
    pasteHint: 'Pega aquí tu currículum en texto',
    orUpload: 'O sube PDF',
    uploadLimit: '5MB · 20 páginas',
    dragHint: 'o arrastra aquí',
    parsing: 'Extrayendo PDF...',
    errorInvalidType: 'Por favor sube un archivo PDF.',
    errorTooLarge: 'Archivo demasiado grande o demasiadas páginas (máx. 5MB / 20).',
    errorNoText: 'No se encontró texto legible — puede ser un PDF escaneado. Pega el texto manualmente.',
    errorParseFailed: 'No se pudo leer el PDF. Pega tu currículum directamente en el cuadro de texto.',
    targetLabel: 'Empresa o industria objetivo (opcional)',
    targetPlaceholder: 'ej., Google, Fintech, Ventas SaaS',
    button: 'Generar Mi Pase de Entrevista',
    generating: 'Generando tu pase...',
    resultTitle: 'Tu Pase de Entrevista está Listo',
    copy: 'Copiar todo',
    footer: 'HireMe AI — Entra a tu entrevista con confianza',
    disclaimer: 'Sugerencias generadas por IA, solo como referencia.',
    privacy: 'Privacidad',
    terms: 'Términos',
    resources: 'Recursos',
    contact: 'Contacto',
    step1: 'Pegar Currículum',
    step2: 'Análisis IA',
    step3: 'Obtener Pase',
    atsNotice: 'El 70% de los currículums son rechazados por ATS antes de que un humano los vea.',
    aiNoticeShort: 'Asistido por IA. Ajusta con tu experiencia personal.',
    resultNotice: 'Sugerencias generadas por IA, solo como referencia. Sin garantía de entrevistas u ofertas.',
    quotaFree: (n: number) => `Usos gratis restantes: ${n} / 3`,
    quotaCredits: (n: number) => `Créditos: ${n}`,
    quotaPaid: (n: number) => `Pases individuales: ${n}`,
    limitReached: 'Límite gratuito alcanzado. Compra créditos para continuar.',
    payTitle: 'Continúa con un pase de pago',
    paySingleTitle: '$1 — 1 generación',
    paySingleDesc: 'Acceso instantáneo para un resultado personalizado.',
    payCreditsTitle: '$20 — 200 créditos',
    payCreditsDesc: '15 créditos por uso (~13 generaciones).',
    payButton: 'Comprar ahora',
    payLoading: 'Redirigiendo al pago...',
  },
  ja: {
    title: 'HireMe AI',
    heroTitle: '履歴書を貼り付けて、ぴったりの面接準備を。',
    heroSubtitle: '1つの履歴書。どんな企業にも。数秒でカスタマイズ。',
    pasteHint: 'テキスト版の履歴書を貼り付けできます',
    orUpload: 'PDFをアップロード',
    uploadLimit: '5MB · 20ページ',
    dragHint: 'またはドラッグ',
    parsing: 'PDFを解析中...',
    errorInvalidType: 'PDFファイルをアップロードしてください。',
    errorTooLarge: 'ファイルが大きすぎるか、ページ数が多すぎます（最大5MB/20ページ）。',
    errorNoText: '読み取れるテキストがありません。スキャンPDFの可能性があります。テキストを直接貼り付けてください。',
    errorParseFailed: 'PDFを読み取れませんでした。左のテキスト欄に直接貼り付けてください。',
    targetLabel: 'ターゲット企業・業界（任意）',
    targetPlaceholder: '例：Google、フィンテック、SaaS営業',
    button: '面接パスポートを生成',
    generating: '生成中...',
    resultTitle: '面接パスポートの準備ができました',
    copy: 'すべてコピー',
    footer: 'HireMe AI — 自信を持って面接に臨みましょう',
    disclaimer: 'AI生成の提案です。参考情報としてご利用ください。',
    privacy: 'プライバシー',
    terms: '利用規約',
    resources: 'リソース',
    contact: 'お問い合わせ',
    step1: '履歴書を貼付',
    step2: 'AI分析',
    step3: 'パスポート取得',
    atsNotice: '履歴書の70%は、人間が見る前にATSで却下されます。',
    aiNoticeShort: 'AIアシスト。自分の経験に合わせて調整してください。',
    resultNotice: 'AI生成の提案です。参考情報としてご利用ください。面接や内定を保証するものではありません。',
    quotaFree: (n: number) => `無料残り: ${n} / 3`,
    quotaCredits: (n: number) => `クレジット: ${n}`,
    quotaPaid: (n: number) => `単発パス: ${n}`,
    limitReached: '無料上限に達しました。クレジットを購入して続けてください。',
    payTitle: '有料パスで続ける',
    paySingleTitle: '$1 — 1回生成',
    paySingleDesc: '1回分のカスタム結果に即アクセス。',
    payCreditsTitle: '$20 — 200クレジット',
    payCreditsDesc: '1回15クレジット（約13回分）。',
    payButton: '購入する',
    payLoading: '決済ページへ移動中...',
  },
  de: {
    title: 'HireMe AI',
    heroTitle: 'Lebenslauf einfügen. Das passende Interview bekommen.',
    heroSubtitle: 'Ein Lebenslauf. Jedes Unternehmen. In Sekunden angepasst.',
    pasteHint: 'Füge hier deinen Lebenslauf als Text ein',
    orUpload: 'Oder PDF hochladen',
    uploadLimit: '5MB · 20 Seiten',
    dragHint: 'oder hierher ziehen',
    parsing: 'PDF wird extrahiert...',
    errorInvalidType: 'Bitte lade eine PDF-Datei hoch.',
    errorTooLarge: 'Datei zu groß oder zu viele Seiten (max. 5MB / 20).',
    errorNoText: 'Kein lesbarer Text gefunden — evtl. gescanntes PDF. Bitte Text einfügen.',
    errorParseFailed: 'PDF konnte nicht gelesen werden. Füge den Text direkt ein.',
    targetLabel: 'Zielunternehmen oder Branche (optional)',
    targetPlaceholder: 'z.B. Google, Fintech, SaaS-Vertrieb',
    button: 'Interview-Pass generieren',
    generating: 'Generiere deinen Pass...',
    resultTitle: 'Dein Interview-Pass ist bereit',
    copy: 'Alles kopieren',
    footer: 'HireMe AI — Selbstbewusst ins Vorstellungsgespräch',
    disclaimer: 'KI-generierte Vorschläge, nur zur Referenz.',
    privacy: 'Datenschutz',
    terms: 'AGB',
    resources: 'Ressourcen',
    contact: 'Kontakt',
    step1: 'Lebenslauf einfügen',
    step2: 'KI-Analyse',
    step3: 'Pass erhalten',
    atsNotice: '70% der Lebensläufe werden von ATS abgelehnt, bevor ein Mensch sie sieht.',
    aiNoticeShort: 'KI-unterstützt. Mit persönlicher Erfahrung anpassen.',
    resultNotice: 'KI-generierte Vorschläge, nur zur Referenz. Keine Garantie für Interviews oder Angebote.',
    quotaFree: (n: number) => `Kostenlos übrig: ${n} / 3`,
    quotaCredits: (n: number) => `Credits: ${n}`,
    quotaPaid: (n: number) => `Einmal-Pässe: ${n}`,
    limitReached: 'Kostenloses Limit erreicht. Credits kaufen, um fortzufahren.',
    payTitle: 'Mit bezahltem Pass fortfahren',
    paySingleTitle: '$1 — 1 Generierung',
    paySingleDesc: 'Sofortiger Zugang für ein maßgeschneidertes Ergebnis.',
    payCreditsTitle: '$20 — 200 Credits',
    payCreditsDesc: '15 Credits pro Nutzung (~13 Generierungen).',
    payButton: 'Jetzt kaufen',
    payLoading: 'Weiterleitung zur Kasse...',
  },
  fr: {
    title: 'HireMe AI',
    heroTitle: 'Collez votre CV. Obtenez l\'entretien qui vous correspond.',
    heroSubtitle: 'Un CV. N\'importe quelle entreprise. Personnalisé en quelques secondes.',
    pasteHint: 'Collez ici votre CV en texte',
    orUpload: 'Ou télécharger PDF',
    uploadLimit: '5Mo · 20 pages',
    dragHint: 'ou glisser-déposer',
    parsing: 'Extraction du PDF...',
    errorInvalidType: 'Veuillez télécharger un fichier PDF.',
    errorTooLarge: 'Fichier trop volumineux ou trop de pages (max 5Mo / 20).',
    errorNoText: 'Aucun texte lisible — PDF scanné possible. Collez le texte manuellement.',
    errorParseFailed: 'Impossible de lire le PDF. Collez votre CV directement dans la zone de texte.',
    targetLabel: 'Entreprise ou secteur cible (optionnel)',
    targetPlaceholder: 'ex. Google, Fintech, Vente SaaS',
    button: 'Générer Mon Passeport d\'Entretien',
    generating: 'Génération en cours...',
    resultTitle: 'Votre Passeport d\'Entretien est Prêt',
    copy: 'Tout copier',
    footer: 'HireMe AI — Entrez en entretien avec confiance',
    disclaimer: 'Suggestions générées par IA, à titre indicatif uniquement.',
    privacy: 'Confidentialité',
    terms: 'Conditions',
    resources: 'Ressources',
    contact: 'Contact',
    step1: 'Coller le CV',
    step2: 'Analyse IA',
    step3: 'Obtenir le Passeport',
    atsNotice: '70% des CV sont rejetés par l\'ATS avant qu\'un humain ne les voie.',
    aiNoticeShort: 'Assisté par IA. Ajustez avec votre expérience.',
    resultNotice: 'Suggestions générées par IA, à titre indicatif. Aucune garantie d\'entretien ou d\'embauche.',
    quotaFree: (n: number) => `Gratuit restant: ${n} / 3`,
    quotaCredits: (n: number) => `Crédits: ${n}`,
    quotaPaid: (n: number) => `Passess uniques: ${n}`,
    limitReached: 'Limite gratuite atteinte. Achetez des crédits pour continuer.',
    payTitle: 'Continuer avec un pass payant',
    paySingleTitle: '$1 — 1 génération',
    paySingleDesc: 'Accès instantané pour un résultat personnalisé.',
    payCreditsTitle: '$20 — 200 crédits',
    payCreditsDesc: '15 crédits par utilisation (~13 générations).',
    payButton: 'Acheter',
    payLoading: 'Redirection vers le paiement...',
  },
  pt: {
    title: 'HireMe AI',
    heroTitle: 'Cole seu currículo. Conquiste a entrevista certa.',
    heroSubtitle: 'Um currículo. Qualquer empresa. Personalizado em segundos.',
    pasteHint: 'Cole aqui seu currículo em texto',
    orUpload: 'Ou enviar PDF',
    uploadLimit: '5MB · 20 páginas',
    dragHint: 'ou arraste aqui',
    parsing: 'Extraindo PDF...',
    errorInvalidType: 'Por favor envie um arquivo PDF.',
    errorTooLarge: 'Arquivo grande demais ou muitas páginas (máx. 5MB / 20).',
    errorNoText: 'Nenhum texto legível — PDF escaneado? Cole o texto manualmente.',
    errorParseFailed: 'Não foi possível ler o PDF. Cole o currículo diretamente na caixa de texto.',
    targetLabel: 'Empresa ou setor alvo (opcional)',
    targetPlaceholder: 'ex.: Google, Fintech, Vendas SaaS',
    button: 'Gerar Meu Passaporte para Entrevista',
    generating: 'Gerando seu passaporte...',
    resultTitle: 'Seu Passaporte para Entrevista está Pronto',
    copy: 'Copiar tudo',
    footer: 'HireMe AI — Entre na entrevista com confiança',
    disclaimer: 'Sugestões geradas por IA, apenas para referência.',
    privacy: 'Privacidade',
    terms: 'Termos',
    resources: 'Recursos',
    contact: 'Contato',
    step1: 'Colar Currículo',
    step2: 'Análise IA',
    step3: 'Obter Passaporte',
    atsNotice: '70% dos currículos são rejeitados pelo ATS antes de um humano vê-los.',
    aiNoticeShort: 'Assistido por IA. Ajuste com sua experiência pessoal.',
    resultNotice: 'Sugestões geradas por IA, apenas para referência. Sem garantia de entrevistas ou ofertas.',
    quotaFree: (n: number) => `Grátis restantes: ${n} / 3`,
    quotaCredits: (n: number) => `Créditos: ${n}`,
    quotaPaid: (n: number) => `Passes avulsos: ${n}`,
    limitReached: 'Limite gratuito atingido. Compre créditos para continuar.',
    payTitle: 'Continuar com passe pago',
    paySingleTitle: '$1 — 1 geração',
    paySingleDesc: 'Acesso instantâneo para um resultado personalizado.',
    payCreditsTitle: '$20 — 200 créditos',
    payCreditsDesc: '15 créditos por uso (~13 gerações).',
    payButton: 'Comprar agora',
    payLoading: 'Redirecionando para pagamento...',
  },
  ko: {
    title: 'HireMe AI',
    heroTitle: '이력서를 붙여넣고, 맞춤형 면접 준비를 받으세요.',
    heroSubtitle: '하나의 이력서. 어떤 회사든. 몇 초 만에 맞춤화.',
    pasteHint: '텍스트 이력서를 여기에 붙여넣으세요',
    orUpload: '또는 PDF 업로드',
    uploadLimit: '5MB · 20페이지',
    dragHint: '또는 드래그',
    parsing: 'PDF 추출 중...',
    errorInvalidType: 'PDF 파일을 업로드해 주세요.',
    errorTooLarge: '파일이 너무 크거나 페이지가 너무 많습니다 (최대 5MB / 20페이지).',
    errorNoText: '읽을 수 있는 텍스트가 없습니다. 스캔 PDF일 수 있습니다. 텍스트를 직접 붙여넣어 주세요.',
    errorParseFailed: 'PDF를 읽을 수 없습니다. 텍스트 상자에 직접 붙여넣어 주세요.',
    targetLabel: '목표 회사 또는 업종 (선택)',
    targetPlaceholder: '예: Google, 핀테크, SaaS 영업',
    button: '면접 패스포트 생성',
    generating: '패스포트 생성 중...',
    resultTitle: '면접 패스포트가 준비되었습니다',
    copy: '전체 복사',
    footer: 'HireMe AI — 자신감 있게 면접에 임하세요',
    disclaimer: 'AI 생성 제안, 참고용입니다.',
    privacy: '개인정보',
    terms: '약관',
    resources: '리소스',
    contact: '문의',
    step1: '이력서 붙여넣기',
    step2: 'AI 분석',
    step3: '패스포트 받기',
    atsNotice: '이력서의 70%는 사람이 보기 전에 ATS에서 거부됩니다.',
    aiNoticeShort: 'AI 보조. 개인 경험에 맞게 조정하세요.',
    resultNotice: 'AI 생성 제안, 참고용입니다. 면접이나 채용을 보장하지 않습니다.',
    quotaFree: (n: number) => `무료 남은 횟수: ${n} / 3`,
    quotaCredits: (n: number) => `크레딧: ${n}`,
    quotaPaid: (n: number) => `단건 이용권: ${n}`,
    limitReached: '무료 한도에 도달했습니다. 크레딧을 구매하여 계속하세요.',
    payTitle: '유료 이용권으로 계속하기',
    paySingleTitle: '$1 — 1회 생성',
    paySingleDesc: '맞춤 결과 1회 즉시 이용.',
    payCreditsTitle: '$20 — 200 크레딧',
    payCreditsDesc: '1회 15 크레딧 (약 13회).',
    payButton: '구매하기',
    payLoading: '결제 페이지로 이동 중...',
  },
} as const;

type Locale = keyof typeof translations;

const languageOptions: { code: Locale; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
];

interface QuotaInfo {
  freeRemaining: number;
  credits: number;
  paidUses: number;
  canGenerate: boolean;
}

function getDeviceId(): string {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
}

export default function Home() {
  const [resumeText, setResumeText] = useState('');
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [result, setResult] = useState('');
  const [locale, setLocale] = useState<Locale>('en');
  const [loadingStep, setLoadingStep] = useState('');
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [deviceId, setDeviceId] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const t = translations[locale];

  const fetchQuota = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/remaining?deviceId=${id}`);
      const data = await res.json();
      setQuota({
        freeRemaining: data.freeRemaining ?? data.remaining ?? 0,
        credits: data.credits ?? 0,
        paidUses: data.paidUses ?? 0,
        canGenerate: data.canGenerate ?? false,
      });
    } catch (error) {
      console.error('Failed to fetch quota:', error);
    }
  }, []);

  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);
    void fetchQuota(id);

    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      void fetchQuota(id);
      window.history.replaceState({}, '', '/');
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible') void fetchQuota(id);
    };
    const onFocus = () => void fetchQuota(id);

    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onFocus);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchQuota]);

  const handleCheckout = async (productType: 'single' | 'credits_pack') => {
    if (!deviceId) return;
    setCheckoutLoading(productType);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, productType, locale }),
      });
      const data = await res.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        alert(data.error ?? 'Checkout failed');
      }
    } catch {
      alert('Checkout failed');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleSubmit = async () => {
    if (!resumeText.trim()) {
      alert(t.pasteHint);
      return;
    }

    if (quota && !quota.canGenerate) {
      alert(t.limitReached);
      return;
    }

    setLoading(true);
    setResult('');

    const steps = [t.step1, t.step2, t.step3];
    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setLoadingStep(steps[stepIndex]);
        stepIndex++;
      }
    }, 2000);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          deviceId,
          targetCompanyOrIndustry: target || undefined,
        }),
      });

      const data = await response.json();

      if (response.status === 402) {
        alert(data.error || t.limitReached);
        void fetchQuota(deviceId);
        return;
      }

      if (response.status === 429) {
        alert(data.error || t.limitReached);
        void fetchQuota(deviceId);
        return;
      }

      if (data.error) {
        setResult(`Error: ${data.error}`);
      } else {
        setResult(data.result);
        if (data.quota) {
          setQuota({
            freeRemaining: data.quota.freeRemaining,
            credits: data.quota.credits,
            paidUses: data.quota.paidUses,
            canGenerate: data.quota.canGenerate,
          });
        } else {
          void fetchQuota(deviceId);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setResult(`Error: ${message}`);
    } finally {
      clearInterval(interval);
      setLoading(false);
      setLoadingStep('');
    }
  };

  const renderResult = () => {
    if (!result) return null;

    let optimized = '';
    let questions = '';
    let intro = '';

    const optIdx = result.search(/(优化版简历|优化简历|第一部分|📄 Your ATS-Ready Resume|Optimized Resume|### 1\. Optimized Resume|1\. Optimized Resume)/i);
    const qIdx = result.search(/(面试问题|第二部分|🎯 10 Questions You'?re Likely to Be Asked|Interview Questions|### 2\. 10 Interview Questions|2\. 10 Interview Questions)/i);
    const introIdx = result.search(/(自我介绍|第三部分|🎤 Your 30-Second Pitch|Self-introduction|### 3\. 30-Second Self-Introduction|3\. 30-Second Self-Introduction)/i);

    if (optIdx !== -1 && qIdx !== -1 && introIdx !== -1) {
      optimized = result.substring(optIdx, qIdx);
      questions = result.substring(qIdx, introIdx);
      intro = result.substring(introIdx);
    } else {
      const parts = result.split(/(?=面试问题|Interview Questions|自我介绍|Self-introduction|### 2\.|2\. 10)/i);
      if (parts.length >= 2) {
        optimized = parts[0];
        questions = parts[1];
        intro = parts[2] || '';
      } else {
        return (
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
            {result}
          </div>
        );
      }
    }

    const clean = (text: string) =>
      text
        .replace(/^.*优化版简历.*\n/i, '')
        .replace(/^.*第一部分.*\n/i, '')
        .replace(/^.*面试问题.*\n/i, '')
        .replace(/^.*第二部分.*\n/i, '')
        .replace(/^.*自我介绍.*\n/i, '')
        .replace(/^.*第三部分.*\n/i, '')
        .replace(/^.*📄 Your ATS-Ready Resume.*\n/i, '')
        .replace(/^.*Optimized Resume.*\n/i, '')
        .replace(/^.*### 1\. Optimized Resume.*\n/i, '')
        .replace(/^.*1\. Optimized Resume.*\n/i, '')
        .replace(/^.*🎯 10 Questions.*\n/i, '')
        .replace(/^.*Interview Questions.*\n/i, '')
        .replace(/^.*### 2\. 10 Interview Questions.*\n/i, '')
        .replace(/^.*2\. 10 Interview Questions.*\n/i, '')
        .replace(/^.*🎤 Your 30-Second Pitch.*\n/i, '')
        .replace(/^.*Self-introduction.*\n/i, '')
        .replace(/^.*### 3\. 30-Second Self-Introduction.*\n/i, '')
        .replace(/^.*3\. 30-Second Self-Introduction.*\n/i, '')
        .replace(/^---\s*$/gm, '')
        .replace(/^##+\s*.*$/gm, '')
        .trim();

    const getSectionTitle = (section: 'resume' | 'questions' | 'intro') => {
      const titles = {
        resume: {
          en: '📄 Your ATS-Ready Resume',
          zh: '📄 你的 ATS 优化简历',
          es: '📄 Tu Currículum Optimizado para ATS',
          ja: '📄 ATS対応履歴書',
          de: '📄 Ihr ATS-optimierter Lebenslauf',
          fr: '📄 Votre CV Optimisé pour ATS',
          pt: '📄 Seu Currículo Otimizado para ATS',
          ko: '📄 ATS 최적화 이력서',
        },
        questions: {
          en: "🎯 10 Questions You're Likely to Be Asked",
          zh: '🎯 你很可能被问到的 10 个问题',
          es: '🎯 10 Preguntas que es Probable que te Hagan',
          ja: '🎯 聞かれる可能性が高い10の質問',
          de: '🎯 10 Fragen, die Ihnen wahrscheinlich gestellt werden',
          fr: '🎯 10 Questions qu\'on est Susceptible de vous Poser',
          pt: '🎯 10 Perguntas que Você Provavelmente Receberá',
          ko: '🎯 받을 가능성이 높은 10가지 면접 질문',
        },
        intro: {
          en: '🎤 Your 30-Second Pitch',
          zh: '🎤 你的 30 秒自我介绍',
          es: '🎤 Tu Presentación de 30 Segundos',
          ja: '🎤 30秒自己紹介',
          de: '🎤 Ihre 30-Sekunden-Vorstellung',
          fr: '🎤 Votre Présentation de 30 Secondes',
          pt: '🎤 Sua Apresentação de 30 Segundos',
          ko: '🎤 30초 자기소개',
        },
      };
      return titles[section][locale] || titles[section].en;
    };

    const sectionClass =
      'group relative overflow-hidden rounded-xl border border-stone-100 bg-stone-50/50 p-5';

    return (
      <div className="space-y-4">
        {optimized && (
          <div className={sectionClass}>
            <div className="absolute left-0 top-0 h-full w-1 bg-stone-300" />
            <h3 className="mb-1 text-sm font-medium text-stone-800">{getSectionTitle('resume')}</h3>
            <p className="mb-3 text-xs text-gray-500">{t.disclaimer}</p>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{clean(optimized)}</div>
          </div>
        )}
        {questions && (
          <div className={sectionClass}>
            <div className="absolute left-0 top-0 h-full w-1 bg-stone-300" />
            <h3 className="mb-1 text-sm font-medium text-stone-800">{getSectionTitle('questions')}</h3>
            <p className="mb-3 text-xs text-gray-500">{t.disclaimer}</p>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{clean(questions)}</div>
          </div>
        )}
        {intro && (
          <div className={sectionClass}>
            <div className="absolute left-0 top-0 h-full w-1 bg-stone-300" />
            <h3 className="mb-1 text-sm font-medium text-stone-800">{getSectionTitle('intro')}</h3>
            <p className="mb-3 text-xs text-gray-500">{t.disclaimer}</p>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{clean(intro)}</div>
          </div>
        )}
      </div>
    );
  };

  const showPayment = quota !== null && !quota.canGenerate;

  return (
    <main className="min-h-screen bg-[#faf9f7]">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 right-0 h-[28rem] w-[28rem] rounded-full bg-orange-200/20 blur-3xl" />
        <div className="absolute bottom-0 -left-32 h-[24rem] w-[24rem] rounded-full bg-amber-100/30 blur-3xl" />
      </div>

      <header className="sticky top-0 z-20 border-b border-stone-200/60 bg-[#faf9f7]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-900 text-sm font-bold text-white">
              H
            </div>
            <span className="text-lg font-semibold tracking-tight text-stone-900">{t.title}</span>
          </div>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-600 focus:outline-none focus:ring-2 focus:ring-orange-200"
          >
            {languageOptions.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 pb-16 pt-10">
        <section className="mb-12 text-center">
          <p className="mb-4 inline-block rounded-full bg-orange-100/80 px-3 py-1 text-xs font-medium tracking-wide text-orange-700">
            AI Interview Prep
          </p>
          <h2 className="mb-4 text-[2rem] font-semibold leading-[1.15] tracking-tight text-stone-900 sm:text-[2.75rem]">
            {t.heroTitle}
          </h2>
          <p className="mx-auto max-w-lg text-base leading-relaxed text-stone-500 sm:text-lg">
            {t.heroSubtitle}
          </p>
        </section>

        <div className="mb-8 flex items-center justify-center gap-6 text-xs text-stone-400">
          <span className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-900 text-[10px] font-medium text-white">1</span>
            {t.step1}
          </span>
          <span className="hidden h-px w-8 bg-stone-200 sm:block" />
          <span className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-200 text-[10px] font-medium text-stone-600">2</span>
            {t.step2}
          </span>
          <span className="hidden h-px w-8 bg-stone-200 sm:block" />
          <span className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-200 text-[10px] font-medium text-stone-600">3</span>
            {t.step3}
          </span>
        </div>

        {quota !== null && (
          <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
            {quota.freeRemaining > 0 && (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
                {t.quotaFree(quota.freeRemaining)}
              </span>
            )}
            {quota.paidUses > 0 && (
              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-100">
                {t.quotaPaid(quota.paidUses)}
              </span>
            )}
            {quota.credits > 0 && (
              <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 ring-1 ring-violet-100">
                {t.quotaCredits(quota.credits)}
              </span>
            )}
            {showPayment && (
              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600 ring-1 ring-red-100">
                {t.limitReached}
              </span>
            )}
          </div>
        )}

        {showPayment && (
          <div className="mb-8 rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-center text-sm font-medium text-stone-800">{t.payTitle}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => void handleCheckout('single')}
                disabled={checkoutLoading !== null}
                className="rounded-xl border border-stone-200 p-4 text-left transition hover:border-stone-300 hover:shadow-md disabled:opacity-50"
              >
                <p className="font-semibold text-stone-900">{t.paySingleTitle}</p>
                <p className="mt-1 text-xs text-stone-500">{t.paySingleDesc}</p>
                <p className="mt-3 text-xs font-medium text-orange-600">
                  {checkoutLoading === 'single' ? t.payLoading : t.payButton}
                </p>
              </button>
              <button
                type="button"
                onClick={() => void handleCheckout('credits_pack')}
                disabled={checkoutLoading !== null}
                className="rounded-xl border border-stone-200 p-4 text-left transition hover:border-stone-300 hover:shadow-md disabled:opacity-50"
              >
                <p className="font-semibold text-stone-900">{t.payCreditsTitle}</p>
                <p className="mt-1 text-xs text-stone-500">{t.payCreditsDesc}</p>
                <p className="mt-3 text-xs font-medium text-orange-600">
                  {checkoutLoading === 'credits_pack' ? t.payLoading : t.payButton}
                </p>
              </button>
            </div>
          </div>
        )}

        <div
          className={`mb-8 overflow-hidden rounded-2xl border bg-white shadow-sm transition-colors ${
            isDragOver ? 'border-orange-300 ring-2 ring-orange-100' : 'border-stone-200/80'
          }`}
        >
          <div className="flex flex-col gap-0 sm:flex-row">
            <textarea
              className="min-h-[220px] flex-1 resize-none border-0 bg-transparent px-5 py-5 text-[15px] leading-relaxed text-stone-800 placeholder:text-stone-400 focus:ring-0 sm:min-h-[260px]"
              placeholder={t.pasteHint}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
            <div className="flex items-center justify-center border-t border-stone-100 p-4 sm:border-l sm:border-t-0 sm:p-5">
              <PdfUploader
                orUploadLabel={t.orUpload}
                uploadLimitLabel={t.uploadLimit}
                dragHint={t.dragHint}
                parsing={t.parsing}
                errorInvalidType={t.errorInvalidType}
                errorTooLarge={t.errorTooLarge}
                errorNoText={t.errorNoText}
                errorParseFailed={t.errorParseFailed}
                onTextExtracted={setResumeText}
                onDragActiveChange={setIsDragOver}
              />
            </div>
          </div>
          <div className="border-t border-stone-100 px-5 py-4">
            <label className="mb-1.5 block text-xs font-medium text-stone-500">{t.targetLabel}</label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value.slice(0, 200))}
              placeholder={t.targetPlaceholder}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 focus:border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <div className="border-t border-stone-100 p-4">
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={loading || !resumeText.trim() || (quota !== null && !quota.canGenerate)}
              className="w-full rounded-full bg-stone-900 py-3.5 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {loadingStep || t.generating}
                </span>
              ) : (
                t.button
              )}
            </button>
            <p className="mt-2 text-center text-[11px] text-stone-400">{t.disclaimer}</p>
          </div>
        </div>

        {result && (
          <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
              <h2 className="text-sm font-medium text-stone-800">{t.resultTitle}</h2>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(result)}
                className="rounded-full px-3 py-1 text-xs text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
              >
                {t.copy}
              </button>
            </div>
            <div className="mx-5 mt-4 mb-2 rounded-xl bg-stone-50 px-3 py-2 text-center text-xs text-stone-500">
              {t.resultNotice}
            </div>
            <div className="max-h-[600px] overflow-y-auto p-5">{renderResult()}</div>
          </div>
        )}
      </div>

      <footer className="border-t border-stone-200/60 py-8 text-center text-xs text-stone-400">
        <p className="text-stone-500">{t.footer}</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <a href="/" className="transition hover:text-stone-700">Home</a>
          <a href="/resources" className="transition hover:text-stone-700">{t.resources}</a>
          <a href="/privacy" className="transition hover:text-stone-700">{t.privacy}</a>
          <a href="/terms" className="transition hover:text-stone-700">{t.terms}</a>
          <a href="mailto:contact@hireme-ai.com" className="transition hover:text-stone-700">{t.contact}</a>
        </div>
      </footer>
    </main>
  );
}
