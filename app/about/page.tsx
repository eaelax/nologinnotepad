'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Zap, HardDrive, WifiOff, Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { AppLogo } from '@/components/AppLogo';
import { LanguageCode } from '@/types/note';

const ABOUT_TRANSLATIONS: Record<LanguageCode, {
  title: string;
  desc: string;
  badge: string;
  openNotepad: string;
  missionTitle: string;
  missionP1: string;
  missionP2: string;
  pillar1Title: string;
  pillar1Desc: string;
  pillar2Title: string;
  pillar2Desc: string;
  pillar3Title: string;
  pillar3Desc: string;
  pillar4Title: string;
  pillar4Desc: string;
  commitTitle: string;
  commit1: string;
  commit2: string;
  commit3: string;
  ctaTitle: string;
  ctaSub: string;
  ctaBtn: string;
}> = {
  EN: {
    title: 'About NoLoginNotepad',
    desc: 'NoLoginNotepad removes every barrier. When you visit the site, the cursor is ready, the paper is clean, and your notes are saved instantly.',
    badge: 'Independent & Privacy-First',
    openNotepad: 'Open Notepad',
    missionTitle: 'Our Core Mission',
    missionP1: 'Most modern note-taking platforms have become cluttered with complex dashboards, paywalls, and aggressive telemetry tracking. Whenever you need to jot down a phone number, draft an email, paste a code snippet, or brainstorm in private, you are confronted with a login gate.',
    missionP2: 'NoLoginNotepad removes every barrier. When you visit the site, the cursor is ready, the paper is clean, and your keystrokes are saved immediately to your browser’s local storage.',
    pillar1Title: 'Local-First Storage (IndexedDB)',
    pillar1Desc: 'Your notes never leave your personal computer, tablet, or phone. All notes, drafting revisions, and display preferences are stored locally in client-side IndexedDB.',
    pillar2Title: 'Sub-Second Speed',
    pillar2Desc: 'Because there are no server roundtrips required for writing, typing latency is less than 16 milliseconds. Every keystroke is debounced and preserved smoothly.',
    pillar3Title: 'Full Offline & PWA Support',
    pillar3Desc: 'Equipped with a modern Progressive Web App Service Worker. You can use it in airplanes, underground subways, or during internet outages without missing a beat.',
    pillar4Title: 'Zero Server-Side Liability',
    pillar4Desc: 'We do not maintain databases of user credentials or confidential text. In an era of rampant database breaches, your words stay strictly on your own hardware.',
    commitTitle: 'Our Commitment to Open, Accessible Web Tools',
    commit1: 'No Forced Subscriptions: Free for students, writers, developers, and professionals.',
    commit2: 'Easy Data Portability: Export individual notes or full JSON backups anytime with zero lock-in.',
    commit3: 'Total Data Cleanout: A built-in one-click factory reset completely wipes all IndexedDB and LocalStorage data upon request.',
    ctaTitle: 'Have questions or suggestions?',
    ctaSub: 'We welcome feedback, bug reports, and stationery style requests.',
    ctaBtn: 'Contact Team',
  },
  AR: {
    title: 'حول مفكرة NoLoginNotepad',
    desc: 'تزيل NoLoginNotepad كل العوائق. عند زيارة الموقع، يكون المؤشر جاهزاً والورقة نظيفة وملاحظاتك محفوظة فوراً.',
    badge: 'مستقل وخاص أولاً',
    openNotepad: 'فتح المفكرة',
    missionTitle: 'مهمتنا الأساسية',
    missionP1: 'أصبحت معظم منصات تدوين الملاحظات الحديثة مليئة بلوحات التحكم المعقدة، وجدران الدفع، والتتبع المكثف. عندما تحتاج إلى كتابة رقم هاتف، أو مسودة بريد، أو لصق كود، تواجه بوابة تسجيل الدخول.',
    missionP2: 'تزيل NoLoginNotepad كل العوائق. بمجرد زيارة الموقع، يكون المؤشر جاهزاً والورق نظيفاً ويتم حفظ كتابتك تلقائياً في التخزين المحلي لمتصفحك.',
    pillar1Title: 'تخزين محلي أولاً (IndexedDB)',
    pillar1Desc: 'ملاحظاتك لا تغادر أبداً جهاز الكمبيوتر أو الجهاز اللوحي أو الهاتف. يتم تخزين جميع الملاحظات والمسودات وتفضيلات العرض محلياً.',
    pillar2Title: 'سرعة فائقة',
    pillar2Desc: 'نظراً لعدم وجود جولات اتصال بالخادم مطلوبة للكتابة، فإن زمن انتقال الكتابة أقل من 16 مللي ثانية.',
    pillar3Title: 'دعم كامل دون اتصال بالإنترنت وتطبيق PWA',
    pillar3Desc: 'مجهز ببرنامج Service Worker حديث لتطبيقات الويب التقدمية.',
    pillar4Title: 'صفر مسؤولية على جانب الخادم',
    pillar4Desc: 'نحن لا نحتفظ بقواعد بيانات لبيانات اعتماد المستخدم أو النصوص السرية.',
    commitTitle: 'التزامنا بأدوات الويب المفتوحة والمتاحة',
    commit1: 'لا اشتراكات إجبارية: مجاني للطلاب والكتاب والمطورين والمهنيين.',
    commit2: 'سهولة نقل البيانات: تصدير الملاحظات الفردية أو النسخ الاحتياطية الكاملة بصيغة JSON في أي وقت.',
    commit3: 'مسح كامل للبيانات: بنقرة واحدة مدمجة لاستعادة ضبط المصنع تمسح تماماً جميع بيانات IndexedDB والتخزين المحلي.',
    ctaTitle: 'هل لديك أسئلة أو اقتراحات؟',
    ctaSub: 'نرحب بالتعليقات وتقارير الأخطاء وطلبات أنماط أوراق الكتابة الجديدة.',
    ctaBtn: 'اتصل بالفريق',
  },
  FR: {
    title: 'À propos de NoLoginNotepad',
    desc: 'NoLoginNotepad supprime tous les obstacles. Lorsque vous visitez le site, le curseur est prêt, le papier est propre et vos notes sont enregistrées instantanément.',
    badge: 'Indépendant & Priorité à la vie privée',
    openNotepad: 'Ouvrir le Bloc-notes',
    missionTitle: 'Notre Mission Principale',
    missionP1: 'La plupart des plateformes de prise de notes modernes sont encombrées de tableaux de bord complexes et de suivi analytique.',
    missionP2: 'NoLoginNotepad élimine toutes ces barrières. Lorsque vous arrivez sur le site, le curseur est actif, la page est vierge et vos frappes sont instantanément sauvegardées.',
    pillar1Title: 'Stockage Local d’Abord (IndexedDB)',
    pillar1Desc: 'Vos notes ne quittent jamais votre ordinateur, tablette ou téléphone.',
    pillar2Title: 'Vitesse de l’Ordre de la Milliseconde',
    pillar2Desc: 'Comme aucun aller-retour serveur n’est requis, la latence de frappe est inférieure à 16 ms.',
    pillar3Title: 'Support Hors-ligne Complet & PWA',
    pillar3Desc: 'Équipé d’un Service Worker PWA moderne.',
    pillar4Title: 'Zéro Responsabilité Côté Serveur',
    pillar4Desc: 'Nous ne gérons aucune base de données d’identifiants ou de textes confidentiels.',
    commitTitle: 'Notre Engagement pour des Outils Web Ouverts',
    commit1: 'Aucun abonnement forcé : Gratuit pour les étudiants, écrivains, développeurs et professionnels.',
    commit2: 'Portabilité totale : Exportez vos notes individuelles ou des sauvegardes JSON complètes à tout moment.',
    commit3: 'Nettoyage complet : Un bouton de réinitialisation complet efface définitivement toutes vos données locales.',
    ctaTitle: 'Des questions ou des suggestions ?',
    ctaSub: 'Nous accueillons avec plaisir vos retours et demandes de nouveaux styles de papier.',
    ctaBtn: 'Contacter l’équipe',
  },
  ES: {
    title: 'Acerca de NoLoginNotepad',
    desc: 'NoLoginNotepad elimina todas las barreras. Al visitar el sitio, el cursor está listo, el papel está limpio y tus notas se guardan instantáneamente.',
    badge: 'Independiente y Privado',
    openNotepad: 'Abrir Bloc de Notas',
    missionTitle: 'Nuestra Misión Principal',
    missionP1: 'La mayoría de las plataformas de notas modernas están saturadas de paneles complejos y muros de pago.',
    missionP2: 'NoLoginNotepad elimina todas las barreras. Al visitar el sitio, el cursor está listo y tus pulsaciones se guardan inmediatamente.',
    pillar1Title: 'Almacenamiento Local Primero (IndexedDB)',
    pillar1Desc: 'Tus notas nunca salen de tu ordenador, tableta o teléfono.',
    pillar2Title: 'Velocidad de Respuesta Instantánea',
    pillar2Desc: 'Sin peticiones al servidor para guardar, la latencia de escritura es inferior a 16 milisegundos.',
    pillar3Title: 'Soporte Sin Conexión y PWA',
    pillar3Desc: 'Equipado con un moderno Service Worker de PWA.',
    pillar4Title: 'Cero Responsabilidad en Servidor',
    pillar4Desc: 'No mantenemos bases de datos de credenciales ni textos confidenciales.',
    commitTitle: 'Nuestro Compromiso con Herramientas Web Accesibles',
    commit1: 'Sin suscripciones obligatorias: Gratis para estudiantes, escritores, desarrolladores y profesionales.',
    commit2: 'Portabilidad de datos simple: Exporta notas individuales o copias de seguridad completas en JSON cuando quieras.',
    commit3: 'Limpieza total: Un botón de restauración completa borra permanentemente todos los datos locales.',
    ctaTitle: '¿Tienes preguntas o sugerencias?',
    ctaSub: 'Agradecemos tus comentarios y solicitudes de nuevos estilos de papel.',
    ctaBtn: 'Contactar al Equipo',
  },
  DE: {
    title: 'Über NoLoginNotepad',
    desc: 'NoLoginNotepad entfernt alle Barrieren. Wenn Sie die Website besuchen, ist der Cursor bereit, das Papier ist sauber und Ihre Notizen werden sofort gespeichert.',
    badge: 'Unabhängig & Datenschutz-First',
    openNotepad: 'Notizblock öffnen',
    missionTitle: 'Unsere Kernmission',
    missionP1: 'Die meisten modernen Plattformen für Notizen sind mit komplexen Dashboards und Paywalls überladen.',
    missionP2: 'NoLoginNotepad beseitigt jede Barriere. Ihre Tastaturanschläge werden sofort im lokalen Speicher Ihres Browsers gesichert.',
    pillar1Title: 'Lokaler Speicher (IndexedDB)',
    pillar1Desc: 'Ihre Notizen verlassen niemals Ihren Computer, Ihr Tablet oder Ihr Telefon.',
    pillar2Title: 'Ultra-schnelle Geschwindigkeit',
    pillar2Desc: 'Da für das Schreiben keine Server-Verbindungen erforderlich sind, liegt die Schreibverzögerung unter 16 Millisekunden.',
    pillar3Title: 'Vollständiger Offline- & PWA-Support',
    pillar3Desc: 'Ausgestattet mit einem modernen Progressive Web App Service Worker.',
    pillar4Title: 'Keine Server-Haftung',
    pillar4Desc: 'Wir betreiben keine Datenbanken für Benutzerdaten oder vertrauliche Texte.',
    commitTitle: 'Unser Versprechen für freie, zugängliche Web-Tools',
    commit1: 'Keine erzwungenen Abonnements: Kostenlos für Studenten, Autoren, Entwickler und Profis.',
    commit2: 'Einfache Datenportabilität: Exportieren Sie einzelne Notizen oder komplette JSON-Backups jederzeit.',
    commit3: 'Vollständige Datenlöschung: Ein integrierter Factory-Reset löscht alle lokalen Daten unwiderruflich.',
    ctaTitle: 'Haben Sie Fragen oder Vorschläge?',
    ctaSub: 'Wir freuen uns über Feedback, Fehlerberichte und Wünsche für neue Papierstile.',
    ctaBtn: 'Team kontaktieren',
  },
  RU: {
    title: 'О NoLoginNotepad',
    desc: 'NoLoginNotepad убирает любые барьеры. При входе на сайт курсор уже активен, лист чист, а ваши записи мгновенно сохраняются.',
    badge: 'Независимость и приватность',
    openNotepad: 'Открыть блокнот',
    missionTitle: 'Наша главная миссия',
    missionP1: 'Большинство современных платформ для заметок перегружены сложными панелями и платными подписками.',
    missionP2: 'NoLoginNotepad стирает эти преграды. Весь вводимый текст мгновенно сохраняется в локальное хранилище вашего браузера.',
    pillar1Title: 'Локальное хранение (IndexedDB)',
    pillar1Desc: 'Ваши заметки никогда не покидают компьютер, планшет или телефон.',
    pillar2Title: 'Мгновенный отклик',
    pillar2Desc: 'Задержка ввода составляет менее 16 миллисекунд.',
    pillar3Title: 'Автономный режим и PWA',
    pillar3Desc: 'Благодаря современной технологии Progressive Web App вы можете писать заметки без интернета.',
    pillar4Title: 'Нулевая ответственность на сервере',
    pillar4Desc: 'У нас нет баз данных учетных записей или конфиденциальных текстов.',
    commitTitle: 'Наше стремление к открытым веб-инструментам',
    commit1: 'Без обязательных подписок: Бесплатно для студентов, писателей, разработчиков и профессионалов.',
    commit2: 'Простой перенос данных: Экспортируйте отдельные заметки или полные резервные копии JSON в любое время.',
    commit3: 'Полная очистка данных: Встроенная функция сброса полностью стирает все локальные данные.',
    ctaTitle: 'Есть вопросы или предложения?',
    ctaSub: 'Мы рады вашим отзывам и пожеланиям по стилям бумаги.',
    ctaBtn: 'Связаться с командой',
  },
  PT: {
    title: 'Sobre o NoLoginNotepad',
    desc: 'O NoLoginNotepad remove todas as barreiras. Ao visitar o site, o cursor está pronto, o papel está limpo e suas notas são salvas instantaneamente.',
    badge: 'Independente & Privacidade em Primeiro Lugar',
    openNotepad: 'Abrir Bloco de Notas',
    missionTitle: 'Nossa Missão Principal',
    missionP1: 'A maioria das plataformas modernas de anotações tornou-se cheia de painéis complexos e cobranças.',
    missionP2: 'O NoLoginNotepad remove todas as barreiras. Suas digitações são salvas imediatamente no armazenamento local do seu navegador.',
    pillar1Title: 'Armazenamento Local (IndexedDB)',
    pillar1Desc: 'Suas notas nunca saem do seu computador, tablet ou telefone.',
    pillar2Title: 'Velocidade Instantânea',
    pillar2Desc: 'A latência de digitação é de menos de 16 milissegundos.',
    pillar3Title: 'Suporte Offline Completo & PWA',
    pillar3Desc: 'Equipado com um moderno Service Worker de PWA.',
    pillar4Title: 'Zero Responsabilidade em Servidor',
    pillar4Desc: 'Não mantemos bancos de dados de credenciais ou textos confidenciais.',
    commitTitle: 'Nosso Compromisso com Ferramentas Web Acessíveis',
    commit1: 'Sem assinaturas forçadas: Grátis para estudantes, escritores, desenvolvedores e profissionais.',
    commit2: 'Portabilidade fácil: Exporte notas individuais ou backups completos em JSON quando desejar.',
    commit3: 'Limpeza de dados total: Um botão de limpeza completa remove permanentemente todos os dados locais.',
    ctaTitle: 'Tem dúvidas ou sugestões?',
    ctaSub: 'Agradecemos feedbacks e sugestões de novos estilos de papel.',
    ctaBtn: 'Contatar a Equipe',
  },
  CH: {
    title: '关于 NoLoginNotepad',
    desc: 'NoLoginNotepad 消除了所有使用门槛。打开网站即可提笔记录，页面极简纯净，笔记即时保存在本地。',
    badge: '独立构建 · 隐私至上',
    openNotepad: '打开记事本',
    missionTitle: '核心使命',
    missionP1: '现代大多数笔记工具充斥着复杂的仪表板、付费墙和频繁的数据追踪。在需要快速记录临时灵感或代码时，往往需要繁琐的注册登录。',
    missionP2: 'NoLoginNotepad 消除了所有使用门槛。光标即刻就绪，所有输入内容立即存储在您浏览器的本地空间中。',
    pillar1Title: '本地优先存储 (IndexedDB)',
    pillar1Desc: '您的笔记绝不离开您的个人电脑、平板或手机。数据仅保存在客户端 IndexedDB 中。',
    pillar2Title: '亚秒级极速响应',
    pillar2Desc: '无需向服务器传输数据，打字延迟低于 16 毫秒。按键即时防抖平滑保存。',
    pillar3Title: '全面离线与 PWA 支持',
    pillar3Desc: '配备现代化渐进式 Web 应用 (PWA) Service Worker，即使在无网或断网环境下依然畅快书写。',
    pillar4Title: '零服务端数据风险',
    pillar4Desc: '我们不维护任何用户账户数据库，从根源上杜绝云端数据泄露风险。',
    commitTitle: '我们对开放与轻量工具的承诺',
    commit1: '无强制订阅：完全免费提供给学生、作家、开发者与各类职场人士。',
    commit2: '便捷数据迁移：随时单篇导出或全量 JSON 备份，绝无平台锁定。',
    commit3: '彻底数据清除：内置一键重置功能，可立即抹除全部本地存储数据。',
    ctaTitle: '有问题或建议？',
    ctaSub: '欢迎随时向我们反馈问题或提出新的信纸样式需求。',
    ctaBtn: '联系团队',
  },
};

export default function AboutPage() {
  const [lang] = useState<LanguageCode>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('notepad_preferences');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.language) return parsed.language;
        }
      } catch {}
    }
    return 'EN';
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('notepad_preferences');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.theme) {
          const isDark = parsed.theme === 'dark';
          document.documentElement.classList.toggle('dark', isDark);
          document.documentElement.setAttribute('data-theme', parsed.theme);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const t = ABOUT_TRANSLATIONS[lang] || ABOUT_TRANSLATIONS.EN;
  const isRtl = lang === 'AR';

  return (
    <div className="min-h-screen bg-[#F6F7F9] text-slate-900 dark:bg-[#090B10] dark:text-slate-100 flex flex-col" dir={isRtl ? 'rtl' : 'ltr'}>
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-[#11141C]/85 backdrop-blur-md sticky top-0 z-20 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <AppLogo size={28} />
          <Link href="/" className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100 hover:opacity-80 transition">
            NoLoginNotepad
          </Link>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
        >
          <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
          <span>{t.openNotepad}</span>
        </Link>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <Shield className="w-3.5 h-3.5" />
            <span>{t.badge}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{t.title}</h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">{t.desc}</p>
        </section>

        <section className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#11141C] border border-slate-200/80 dark:border-slate-800/80 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t.missionTitle}</h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">{t.missionP1}</p>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">{t.missionP2}</p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#11141C] border border-slate-200/80 dark:border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold">{t.pillar1Title}</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{t.pillar1Desc}</p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#11141C] border border-slate-200/80 dark:border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold">{t.pillar2Title}</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{t.pillar2Desc}</p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#11141C] border border-slate-200/80 dark:border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <WifiOff className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold">{t.pillar3Title}</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{t.pillar3Desc}</p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#11141C] border border-slate-200/80 dark:border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold">{t.pillar4Title}</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{t.pillar4Desc}</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t.commitTitle}</h2>
          <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{t.commit1}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{t.commit2}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{t.commit3}</span>
            </li>
          </ul>
        </section>

        <section className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold">{t.ctaTitle}</h3>
            <p className="text-xs text-slate-500">{t.ctaSub}</p>
          </div>
          <Link
            href="/contact"
            className="text-xs font-semibold px-4 py-2 rounded-lg bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300/80 dark:hover:bg-slate-700 transition"
          >
            {t.ctaBtn}
          </Link>
        </section>
      </main>

      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-6 px-4 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} NoLoginNotepad. 100% Private, Free Online Notepad.</p>
      </footer>
    </div>
  );
}
