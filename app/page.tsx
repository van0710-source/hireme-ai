'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// 初始化 Supabase 客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 8种语言的界面文字翻译
const translations = {
  en: {
    title: 'HireMe AI',
    subtitle: 'Your Interview Pass',
    placeholder: 'Paste your resume here...',
    button: '✨ Generate My Interview Pass',
    generating: 'Generating your pass...',
    resultTitle: '🎉 Your Interview Pass is Ready',
    copy: 'Copy all',
    footer: 'HireMe AI — Walk into your interview with confidence',
    disclaimer: '⚡ AI-generated. Practice out loud. You\'ve got this.',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    contact: 'Contact',
    readyTitle: 'Your interview pass starts here',
    readyDesc: 'One paste. Three outcomes. ATS-optimized resume + predicted questions + 30-second pitch.',
    step1: '1. Paste Resume',
    step2: '2. AI Analysis',
    step3: '3. Get Your Pass',
    atsNotice: '⚠️ 70% of resumes are rejected by ATS before a human sees them. We fix that.',
    aiNoticeShort: '💡 AI-assisted. Adjust with your personal experience.',
    resultNotice: '💡 This content is AI-generated based on your resume. We recommend adjusting it with your personal experience. HR values authentic and warm expression.',
    remaining: (count: number) => `Remaining today: ${count} / 3`,
    limitReached: 'Daily limit reached. Come back tomorrow!',
  },
  zh: {
    title: 'HireMe AI',
    subtitle: '你的面试通行证',
    placeholder: '粘贴你的简历...',
    button: '✨ 生成我的面试通行证',
    generating: '生成中...',
    resultTitle: '🎉 你的面试通行证已就绪',
    copy: '复制全部',
    footer: 'HireMe AI — 自信走进每一场面试',
    disclaimer: '⚡ 结果由 AI 生成，建议结合个人情况调整后使用',
    privacy: '隐私政策',
    terms: '服务条款',
    contact: '联系我们',
    readyTitle: '从这里开始获取你的面试通行证',
    readyDesc: '一次粘贴，三项产出：ATS优化简历 + 预测面试问题 + 30秒自我介绍',
    step1: '1. 粘贴简历',
    step2: '2. AI 分析',
    step3: '3. 获取通行证',
    atsNotice: '⚠️ 70% 的简历在到达 HR 之前就被 ATS 筛掉了。我们来解决这个问题。',
    aiNoticeShort: '💡 AI辅助生成，建议结合个人经历微调',
    resultNotice: '💡 这份内容是 AI 根据你的简历生成的优化建议。建议你结合个人真实经历调整，让它更贴合你的实际情况。HR 更欣赏有温度的真实表达。',
    remaining: (count: number) => `今日剩余次数: ${count} / 3`,
    limitReached: '今日免费次数已用完，请明天继续使用',
  },
  es: {
    title: 'HireMe AI',
    subtitle: 'Tu Pase de Entrevista',
    placeholder: 'Pega tu currículum aquí...',
    button: '✨ Generar Mi Pase de Entrevista',
    generating: 'Generando tu pase...',
    resultTitle: '🎉 Tu Pase de Entrevista está Listo',
    copy: 'Copiar todo',
    footer: 'HireMe AI — Entra a tu entrevista con confianza',
    disclaimer: '⚡ Generado por IA. Practica en voz alta. Tú puedes.',
    privacy: 'Política de Privacidad',
    terms: 'Términos de Servicio',
    contact: 'Contacto',
    readyTitle: 'Tu pase de entrevista comienza aquí',
    readyDesc: 'Un pegado. Tres resultados. Currículum optimizado para ATS + preguntas predecidas + presentación de 30 segundos.',
    step1: '1. Pegar Currículum',
    step2: '2. Análisis IA',
    step3: '3. Obtener Tu Pase',
    atsNotice: '⚠️ El 70% de los currículums son rechazados por ATS antes de que un humano los vea. Nosotros lo solucionamos.',
    aiNoticeShort: '💡 Asistido por IA. Ajusta con tu experiencia personal.',
    resultNotice: '💡 Este contenido es generado por IA basado en tu currículum. Recomendamos ajustarlo con tu experiencia personal. RR.HH. valora la expresión auténtica y cálida.',
    remaining: (count: number) => `Restantes hoy: ${count} / 3`,
    limitReached: 'Límite diario alcanzado. ¡Vuelve mañana!',
  },
  ja: {
    title: 'HireMe AI',
    subtitle: 'あなたの面接パスポート',
    placeholder: '履歴書を貼り付けてください...',
    button: '✨ 面接パスポートを生成',
    generating: '生成中...',
    resultTitle: '🎉 面接パスポートの準備ができました',
    copy: 'すべてコピー',
    footer: 'HireMe AI — 自信を持って面接に臨みましょう',
    disclaimer: '⚡ AI生成。声に出して練習してください。',
    privacy: 'プライバシーポリシー',
    terms: '利用規約',
    contact: 'お問い合わせ',
    readyTitle: '面接パスポートはここから始まります',
    readyDesc: '貼り付けるだけ。ATS最適化された履歴書 + 予測質問 + 30秒自己紹介。',
    step1: '1. 履歴書を貼付',
    step2: '2. AI分析',
    step3: '3. パスポートを取得',
    atsNotice: '⚠️ 履歴書の70%は、人間が見る前にATSによって却下されます。私たちが解決します。',
    aiNoticeShort: '💡 AIアシスト。自分の経験に合わせて調整してください。',
    resultNotice: '💡 この内容はあなたの履歴書に基づいてAIが生成しました。実際の経験に合わせて調整し、より本物らしくしてください。人事担当者は温かみのある本物の表現を高く評価します。',
    remaining: (count: number) => `今日の残り: ${count} / 3`,
    limitReached: '本日の利用上限に達しました。明日またお越しください。',
  },
  de: {
    title: 'HireMe AI',
    subtitle: 'Dein Interview-Pass',
    placeholder: 'Füge deinen Lebenslauf ein...',
    button: '✨ Meinen Interview-Pass generieren',
    generating: 'Generiere deinen Pass...',
    resultTitle: '🎉 Dein Interview-Pass ist bereit',
    copy: 'Alles kopieren',
    footer: 'HireMe AI — Gehe selbstbewusst in dein Vorstellungsgespräch',
    disclaimer: '⚡ KI-generiert. Übe laut. Du schaffst das.',
    privacy: 'Datenschutzrichtlinie',
    terms: 'Nutzungsbedingungen',
    contact: 'Kontakt',
    readyTitle: 'Dein Interview-Pass beginnt hier',
    readyDesc: 'Ein Einfügen. Drei Ergebnisse. ATS-optimierter Lebenslauf + vorhergesagte Fragen + 30-Sekunden-Vorstellung.',
    step1: '1. Lebenslauf einfügen',
    step2: '2. KI-Analyse',
    step3: '3. Pass erhalten',
    atsNotice: '⚠️ 70% der Lebensläufe werden von ATS abgelehnt, bevor sie ein Mensch sieht. Wir lösen das.',
    aiNoticeShort: '💡 KI-unterstützt. Passe es mit deiner persönlichen Erfahrung an.',
    resultNotice: '💡 Dieser Inhalt wurde basierend auf Ihrem Lebenslauf von KI generiert. Wir empfehlen, ihn mit Ihrer persönlichen Erfahrung anzupassen. Personaler schätzen authentische und herzliche Ausdrucksweise.',
    remaining: (count: number) => `Heute verbleibend: ${count} / 3`,
    limitReached: 'Tägliches Limit erreicht. Kommen Sie morgen wieder!',
  },
  fr: {
    title: 'HireMe AI',
    subtitle: 'Ton Passeport d\'Entretien',
    placeholder: 'Colle ton CV ici...',
    button: '✨ Générer Mon Passeport d\'Entretien',
    generating: 'Génération de ton passeport...',
    resultTitle: '🎉 Ton Passeport d\'Entretien est Prêt',
    copy: 'Tout copier',
    footer: 'HireMe AI — Entre en entretien avec confiance',
    disclaimer: '⚡ Généré par IA. Entraîne-toi à voix haute. Tu vas y arriver.',
    privacy: 'Politique de Confidentialité',
    terms: 'Conditions d\'Utilisation',
    contact: 'Contact',
    readyTitle: 'Ton passeport d\'entretien commence ici',
    readyDesc: 'Un collage. Trois résultats. CV optimisé ATS + questions prédites + présentation de 30 secondes.',
    step1: '1. Coller le CV',
    step2: '2. Analyse IA',
    step3: '3. Obtenir ton Passeport',
    atsNotice: '⚠️ 70% des CV sont rejetés par l\'ATS avant qu\'un humain ne les voie. Nous réglons ça.',
    aiNoticeShort: '💡 Assisté par IA. Ajustez avec votre expérience personnelle.',
    resultNotice: '💡 Ce contenu est généré par IA à partir de votre CV. Nous vous recommandons de l\'ajuster avec votre expérience personnelle. Les RH apprécient une expression authentique et chaleureuse.',
    remaining: (count: number) => `Restant aujourd'hui: ${count} / 3`,
    limitReached: 'Limite quotidienne atteinte. Revenez demain!',
  },
  pt: {
    title: 'HireMe AI',
    subtitle: 'Seu Passaporte para Entrevista',
    placeholder: 'Cole seu currículo aqui...',
    button: '✨ Gerar Meu Passaporte para Entrevista',
    generating: 'Gerando seu passaporte...',
    resultTitle: '🎉 Seu Passaporte para Entrevista está Pronto',
    copy: 'Copiar tudo',
    footer: 'HireMe AI — Entre na entrevista com confiança',
    disclaimer: '⚡ Gerado por IA. Pratique em voz alta. Você consegue.',
    privacy: 'Política de Privacidade',
    terms: 'Termos de Serviço',
    contact: 'Contato',
    readyTitle: 'Seu passaporte para entrevista começa aqui',
    readyDesc: 'Um cole. Três resultados. Currículo otimizado para ATS + perguntas previstas + apresentação de 30 segundos.',
    step1: '1. Colar Currículo',
    step2: '2. Análise IA',
    step3: '3. Obter seu Passaporte',
    atsNotice: '⚠️ 70% dos currículos são rejeitados pelo ATS antes de um humano vê-los. Nós resolvemos isso.',
    aiNoticeShort: '💡 Assistido por IA. Ajuste com sua experiência pessoal.',
    resultNotice: '💡 Este conteúdo é gerado por IA com base no seu currículo. Recomendamos ajustá-lo com sua experiência pessoal. O RH valoriza uma expressão autêntica e calorosa.',
    remaining: (count: number) => `Restantes hoje: ${count} / 3`,
    limitReached: 'Limite diário atingido. Volte amanhã!',
  },
  ko: {
    title: 'HireMe AI',
    subtitle: '나의 면접 패스포트',
    placeholder: '이력서를 붙여넣으세요...',
    button: '✨ 면접 패스포트 생성하기',
    generating: '패스포트 생성 중...',
    resultTitle: '🎉 면접 패스포트가 준비되었습니다',
    copy: '전체 복사',
    footer: 'HireMe AI — 자신감 있게 면접에 임하세요',
    disclaimer: '⚡ AI 생성. 소리 내어 연습하세요. 할 수 있습니다.',
    privacy: '개인정보처리방침',
    terms: '이용약관',
    contact: '문의하기',
    readyTitle: '면접 패스포트는 여기서 시작됩니다',
    readyDesc: '한 번 붙여넣기. 세 가지 결과. ATS 최적화 이력서 + 예측 면접 질문 + 30초 자기소개.',
    step1: '1. 이력서 붙여넣기',
    step2: '2. AI 분석',
    step3: '3. 패스포트 받기',
    atsNotice: '⚠️ 이력서의 70%는 사람이 보기 전에 ATS에서 거부됩니다. 우리가 해결합니다.',
    aiNoticeShort: '💡 AI 보조. 개인 경험에 맞게 조정하세요.',
    resultNotice: '💡 이 내용은 귀하의 이력서를 기반으로 AI가 생성했습니다. 개인적인 경험으로 조정하는 것을 권장합니다. 인사 담당자는 진실되고 따뜻한 표현을 더 높이 평가합니다.',
    remaining: (count: number) => `오늘 남은 횟수: ${count} / 3`,
    limitReached: '오늘의 무료 이용 횟수를 모두 사용했습니다. 내일 다시 이용해주세요.',
  },
};

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

// 获取或创建设备 ID
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
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [locale, setLocale] = useState<Locale>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [loadingStep, setLoadingStep] = useState('');
  const [remainingCalls, setRemainingCalls] = useState<number | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setTheme(e.matches ? 'dark' : 'light');
    };
    handleChange(mediaQuery);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);
    fetchRemainingCalls(id);
  }, []);

  const fetchRemainingCalls = async (id: string) => {
    try {
      const res = await fetch(`/api/remaining?deviceId=${id}`);
      const data = await res.json();
      setRemainingCalls(data.remaining);
    } catch (error) {
      console.error('获取剩余次数失败:', error);
    }
  };

  const t = translations[locale];

  const handleSubmit = async () => {
    if (!resumeText.trim()) {
      alert(t.placeholder);
      return;
    }

    if (remainingCalls !== null && remainingCalls <= 0) {
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
        body: JSON.stringify({ resumeText, deviceId }),
      });

      const data = await response.json();
      
      if (response.status === 429) {
        alert(data.error || t.limitReached);
        setRemainingCalls(0);
        return;
      }
      
      if (data.error) {
        setResult('错误：' + data.error);
      } else {
        setResult(data.result);
        fetchRemainingCalls(deviceId);
      }
    } catch (error: any) {
      setResult('错误：' + error.message);
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

    // 支持多种格式的关键词匹配
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
        return <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{result}</div>;
      }
    }

    const clean = (text: string) => {
      return text
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
        .replace(/^\s*$/gm, '')
        .trim();
    };

    const getSectionTitle = (section: 'resume' | 'questions' | 'intro') => {
      const titles = {
        resume: { en: '📄 Your ATS-Ready Resume', zh: '📄 你的 ATS 优化简历', es: '📄 Tu Currículum Optimizado para ATS', ja: '📄 ATS対応履歴書', de: '📄 Ihr ATS-optimierter Lebenslauf', fr: '📄 Votre CV Optimisé pour ATS', pt: '📄 Seu Currículo Otimizado para ATS', ko: '📄 ATS 최적화 이력서' },
        questions: { en: '🎯 10 Questions You\'re Likely to Be Asked', zh: '🎯 你很可能被问到的 10 个问题', es: '🎯 10 Preguntas que es Probable que te Hagan', ja: '🎯 聞かれる可能性が高い10の質問', de: '🎯 10 Fragen, die Ihnen wahrscheinlich gestellt werden', fr: '🎯 10 Questions qu\'on est Susceptible de vous Poser', pt: '🎯 10 Perguntas que Você Provavelmente Receberá', ko: '🎯 받을 가능성이 높은 10가지 면접 질문' },
        intro: { en: '🎤 Your 30-Second Pitch', zh: '🎤 你的 30 秒自我介绍', es: '🎤 Tu Presentación de 30 Segundos', ja: '🎤 30秒自己紹介', de: '🎤 Ihre 30-Sekunden-Vorstellung', fr: '🎤 Votre Présentation de 30 Secondes', pt: '🎤 Sua Apresentação de 30 Segundos', ko: '🎤 30초 자기소개' },
      };
      return titles[section][locale] || titles[section]['en'];
    };

    return (
      <div className="space-y-4">
        {optimized && (
          <div className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30 p-5 transition-all hover:shadow-md">
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-indigo-500" />
            <h3 className="mb-3 text-sm font-semibold text-blue-700 dark:text-blue-400">
              {getSectionTitle('resume')}
            </h3>
            <div className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {clean(optimized)}
            </div>
          </div>
        )}
        {questions && (
          <div className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/30 dark:to-emerald-950/30 p-5 transition-all hover:shadow-md">
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-green-500 to-emerald-500" />
            <h3 className="mb-3 text-sm font-semibold text-green-700 dark:text-green-400">
              {getSectionTitle('questions')}
            </h3>
            <div className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {clean(questions)}
            </div>
          </div>
        )}
        {intro && (
          <div className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/30 dark:to-pink-950/30 p-5 transition-all hover:shadow-md">
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-purple-500 to-pink-500" />
            <h3 className="mb-3 text-sm font-semibold text-purple-700 dark:text-purple-400">
              {getSectionTitle('intro')}
            </h3>
            <div className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {clean(intro)}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-400/20 blur-3xl" />
        </div>

        <header className="sticky top-0 z-20 border-b border-gray-200/50 bg-white/70 backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/70">
          <div className="mx-auto max-w-5xl px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-teal-500">
                  <span className="text-sm font-bold text-white">H</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                    {t.title}
                  </h1>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">{t.subtitle}</p>
                </div>
              </div>
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as Locale)}
                className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 px-3 py-1.5 text-sm backdrop-blur-sm focus:ring-2 focus:ring-blue-500"
              >
                {languageOptions.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="mb-8 flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-[10px] font-bold text-blue-600 dark:text-blue-400">1</div>
              <span>{t.step1}</span>
            </div>
            <span>→</span>
            <div className="flex items-center gap-1.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-[10px] font-bold text-blue-600 dark:text-blue-400">2</div>
              <span>{t.step2}</span>
            </div>
            <span>→</span>
            <div className="flex items-center gap-1.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-[10px] font-bold text-blue-600 dark:text-blue-400">3</div>
              <span>{t.step3}</span>
            </div>
          </div>

          <div className="mb-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 px-4 py-2 text-center text-xs text-amber-700 dark:text-amber-400">
            {t.atsNotice}
          </div>

          {remainingCalls !== null && (
            <div className="mb-3 text-center text-sm">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                remainingCalls > 0 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {t.remaining(remainingCalls)}
              </span>
            </div>
          )}

          <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm shadow-xl shadow-blue-500/5">
            <textarea
              className="min-h-[200px] w-full resize-none border-0 bg-transparent p-5 text-base focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              placeholder={`${t.placeholder}\n\n💡 ${t.aiNoticeShort}`}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
            <div className="border-t border-gray-100 dark:border-slate-700/50 p-4">
              <button
                onClick={handleSubmit}
                disabled={loading || !resumeText.trim() || (remainingCalls !== null && remainingCalls <= 0)}
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {loadingStep || t.generating}
                    </>
                  ) : (
                    t.button
                  )}
                </span>
              </button>
            </div>
          </div>

          {result && (
            <div className="overflow-hidden rounded-2xl border border-gray-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700/50 p-4">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t.resultTitle}</h2>
                <button
                  onClick={() => navigator.clipboard.writeText(result)}
                  className="rounded-lg px-3 py-1 text-xs text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
                >
                  {t.copy}
                </button>
              </div>
              <div className="mx-4 mt-3 mb-1 rounded-lg bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 text-center text-xs text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700">
                {t.resultNotice}
              </div>
              <div className="max-h-[600px] overflow-y-auto p-5">
                {renderResult()}
              </div>
              <div className="border-t border-gray-100 dark:border-slate-700/50 p-4 text-center text-xs text-gray-500 dark:text-gray-400">
                💡 Save this page. Practice out loud. Walk into your interview with confidence.
              </div>
            </div>
          )}

          {!result && !loading && (
            <div className="rounded-2xl border border-gray-200/50 dark:border-slate-700/50 bg-white/30 dark:bg-slate-800/30 p-12 text-center backdrop-blur-sm">
              <div className="mb-4 text-5xl">🎯</div>
              <h3 className="mb-2 font-medium text-gray-700 dark:text-gray-300">{t.readyTitle}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t.readyDesc}</p>
            </div>
          )}
        </div>

        <footer className="border-t border-gray-200/50 dark:border-slate-800/50 py-6 text-center text-xs text-gray-400 dark:text-gray-500">
          <p>{t.footer}</p>
          <p className="mt-1">{t.disclaimer}</p>
          <div className="mt-3 space-x-4">
            <a href="/privacy" className="transition-colors hover:text-gray-600 dark:hover:text-gray-300">{t.privacy}</a>
            <a href="/terms" className="transition-colors hover:text-gray-600 dark:hover:text-gray-300">{t.terms}</a>
            <a href="mailto:contact@hireme-ai.com" className="transition-colors hover:text-gray-600 dark:hover:text-gray-300">{t.contact}</a>
          </div>
        </footer>
      </main>
    </div>
  );
}