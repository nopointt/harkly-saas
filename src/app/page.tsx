'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

// ─── Shared ──────────────────────────────────────────────────────────────────

const urbanist = { fontFamily: 'var(--font-urbanist, var(--font-inter, sans-serif))' }

function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto max-w-7xl px-6 md:px-12', className)}>
      {children}
    </div>
  )
}

function PrimaryBtn({
  children,
  className,
  onClick,
  type = 'button',
  disabled,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative flex h-11 w-full items-center justify-center px-6',
        'before:absolute before:inset-0 before:rounded-full before:bg-indigo-600',
        'before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95',
        'disabled:pointer-events-none disabled:opacity-60 sm:w-max',
        className,
      )}
    >
      <span className="relative text-base font-semibold text-white">{children}</span>
    </button>
  )
}

function OutlineBtn({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex h-11 w-full items-center justify-center px-6',
        'before:absolute before:inset-0 before:rounded-full before:border before:border-gray-300',
        'before:bg-gray-50 before:transition before:duration-300 hover:before:scale-105 active:before:scale-95',
        'sm:w-max',
        className,
      )}
    >
      <span className="relative text-base font-semibold text-gray-700">{children}</span>
    </button>
  )
}

function GradientBlobs() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-40 pointer-events-none"
    >
      <div className="blur-[106px] h-56 bg-gradient-to-br from-primary to-purple-400 dark:from-blue-700" />
      <div className="blur-[106px] h-32 bg-gradient-to-r from-cyan-400 to-sky-300 dark:to-indigo-600" />
    </div>
  )
}

// ─── Nav ─────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <header>
      <nav className="absolute z-10 w-full border-b border-black/5">
        <Container>
          <div className="flex items-center justify-between py-4">
            <a href="/" className="flex items-center space-x-2">
              <div aria-hidden="true" className="flex space-x-1">
                <div className="size-4 rounded-full bg-gray-900" />
                <div className="h-6 w-2 bg-indigo-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900" style={urbanist}>Harkly</span>
            </a>
            <PrimaryBtn
              className="h-9 px-4"
              onClick={() => document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span className="text-sm">Ранний доступ</span>
            </PrimaryBtn>
          </div>
        </Container>
      </nav>
    </header>
  )
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <div className="relative" id="home">
      <GradientBlobs />
      <Container>
        <div className="relative pt-36 pb-16">
          <div className="mx-auto max-w-3xl text-center">
            <h1
              className="text-balance font-bold text-5xl text-gray-900 md:text-6xl xl:text-7xl"
              style={urbanist}
            >
              Рынок исследований меняется —{' '}
              <span className="text-indigo-600">мы помогаем успеть.</span>
            </h1>
            <p className="mt-8 text-gray-700 text-lg leading-relaxed">
              Harkly — AI-платформа для кабинетных исследований.
            </p>
            <div className="mt-12 flex flex-wrap justify-center gap-y-4 gap-x-6">
              <PrimaryBtn
                onClick={() => document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Получить ранний доступ
              </PrimaryBtn>
              <OutlineBtn
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Как это работает
              </OutlineBtn>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

// ─── Social Proof ─────────────────────────────────────────────────────────────

const quotes = [
  {
    text: 'Команды тратят недели на методологию после того, как продуктовое решение уже принято. К моменту когда исследование готово — оно правильное, но уже бесполезное.',
    author: 'Senior UX Researcher',
    role: 'LinkedIn · 182 реакции',
  },
  {
    text: 'Почему все наши инструменты отстой: крик души. Каждый раз одно и то же — копируешь из ChatGPT, вставляешь в Notion, не можешь ни на что сослаться.',
    author: 'UX Researcher',
    role: 'r/UXResearch · 73 голоса',
  },
  {
    text: 'Я чувствую давление: использовать AI, иначе отстанешь. Работать быстрее — да. Но ценой качества и собственного рассудка.',
    author: 'UX Researcher',
    role: 'State of User Research 2025',
  },
  {
    text: 'Исследование — это не работа, это деятельность. PM-ы и дизайнеры уже делают своё. Нам нужны инструменты, которые держат планку методологии автоматически.',
    author: 'Kate Towsey',
    role: 'ResearchOps Lead · LinkedIn · 173 реакции',
  },
  {
    text: 'В B2B enterprise обычно нельзя: опросить стейкхолдеров, провести конкурентный анализ, достать данные, запустить юзабилити, нанять участников. Кабинетное исследование — единственный выход.',
    author: 'Vitaly Friedman',
    role: 'LinkedIn · 221 реакция',
  },
  {
    text: 'Только 21% исследователей довольны тем, как они отслеживают и демонстрируют влияние своей работы. Исследование есть. Доверия к нему — нет.',
    author: 'State of User Research 2025',
    role: 'Annual Report',
  },
]

function SocialProof() {
  return (
    <div className="text-gray-600" id="reviews">
      <Container>
        <div className="mb-16 text-center">
          <h2 className="text-2xl font-bold text-gray-800 md:text-4xl" style={urbanist}>
            Проблема
          </h2>
          <p className="mt-3 text-gray-500">На основе исследования 200+ источников</p>
        </div>
        <div className="md:columns-2 lg:columns-3 gap-8 space-y-8">
          {quotes.map((q, i) => (
            <div
              key={i}
              className="aspect-auto p-8 border border-gray-100 rounded-3xl bg-white shadow-2xl shadow-gray-600/10"
            >
              <div className="flex gap-4 items-start">
                <div className="size-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <span className="text-indigo-600 text-xs font-bold">{q.author[0]}</span>
                </div>
                <div>
                  <h6 className="text-base font-medium text-gray-700">{q.author}</h6>
                  <p className="text-sm text-gray-400">{q.role}</p>
                </div>
              </div>
              <p className="mt-6 text-gray-600 leading-relaxed">«{q.text}»</p>
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}

// ─── Problem ─────────────────────────────────────────────────────────────────

function Problem() {
  return (
    <div id="problem">
      <Container>
        <div className="md:w-2/3 lg:w-1/2 mb-12">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-indigo-600">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
          </svg>
          <h2 className="my-6 text-2xl font-bold text-gray-700 md:text-4xl" style={urbanist}>
            У кабинетного исследования нет дома.
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Раньше все решения принимались вчера, но в 2026 это уже позавчера. Как только вы задумались над методологией — ваши данные уже нерелевантны.
          </p>
        </div>

        <div className="mt-4 grid divide-x divide-y divide-gray-100 overflow-hidden rounded-3xl border border-gray-100 text-gray-600 sm:grid-cols-3">
          {[
            {
              title: 'Инструмента не существует',
              text: 'Google → Notion → ChatGPT → PowerPoint. Это стек desk research в большинстве команд. Каждый шаг — отдельный инструмент. Ни один не отслеживает источники.',
              stat: '400+ research-инструментов — ни один не создан специально для desk research.',
            },
            {
              title: 'AI ломает доверие',
              text: '80% исследователей используют AI. 91% беспокоятся о точности. Всё равно приходится проверять каждый вывод вручную — смысл автоматизации теряется.',
              stat: '«Команды всё равно проверяют каждое утверждение вручную — что обесценивает автоматизацию.» — Great Question',
            },
            {
              title: 'Исследование опаздывает',
              text: 'Стейкхолдеры не ждут вашего синтеза. К моменту доставки роадмап уже зафиксирован. Традиционный цикл — 6–8 недель.',
              stat: 'Только 21% исследователей довольны тем, как демонстрируют влияние своей работы.',
            },
          ].map((item, i) => (
            <div key={i} className="group relative bg-white transition hover:z-[1] hover:shadow-2xl hover:shadow-gray-600/10">
              <div className="relative space-y-6 py-10 p-8">
                <div className="w-12 h-12 flex rounded-full bg-indigo-50 items-center justify-center">
                  <span className="text-indigo-600 font-bold text-sm">0{i + 1}</span>
                </div>
                <div className="space-y-2">
                  <h5 className="text-xl font-semibold text-gray-700 transition group-hover:text-indigo-600">
                    {item.title}
                  </h5>
                  <p className="text-gray-600">{item.text}</p>
                </div>
                <p className="text-xs text-gray-400 border-t border-gray-100 pt-4 leading-relaxed transition group-hover:text-indigo-500 group-hover:border-indigo-100">
                  {item.stat}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}

// ─── Solution ─────────────────────────────────────────────────────────────────

function Solution() {
  return (
    <div id="features">
      <Container>
        <div className="md:w-2/3 lg:w-1/2 mb-12">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-indigo-600">
            <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5z" clipRule="evenodd" />
          </svg>
          <h2 className="my-6 text-2xl font-bold text-gray-700 md:text-4xl" style={urbanist}>
            Один процесс. От вопроса до артефакта.
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Harkly — первая платформа, созданная специально для кабинетного исследования. Для случаев, когда нет пользователей для интервью, дедлайн уже сдвинулся, а стейкхолдер ждёт доказательства, а не слайды.
          </p>
        </div>

        <div className="mt-4 grid divide-x divide-y divide-gray-100 overflow-hidden rounded-3xl border border-gray-100 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: 'Правильный фрейминг с первого раза',
              text: 'Один вопрос → PICO, дерево гипотез, HCD, McKinsey — одновременно. Правильная форма вопроса находит правильные источники.',
              outcome: 'Нет пустого экрана. Нет неправильного фрейминга.',
            },
            {
              title: 'Синтез 1000 документов',
              text: 'Harkly загружает корпус и ранжирует по семантической близости к гипотезе и выбранным критериям. Автоматически или по вашей настройке извлекает факты, метрики, цитаты.',
              outcome: 'От корпуса к инсайтам — за часы.',
            },
            {
              title: 'Каждый вывод с источником',
              text: 'Никаких галлюцинаций. Каждый инсайт можно проследить до оригинальной страницы — стейкхолдер проверяет одним кликом.',
              outcome: 'Трассируемый синтез. Аудируемое исследование.',
            },
            {
              title: 'Автоматические артефакты',
              text: 'Карта доказательств, карта эмпатии, фактпак, PRISMA-флоу или гибридные фреймворки — в зависимости от вопроса. Каждый вывод с источником.',
              outcome: 'Готово к отправке сразу.',
            },
            {
              title: 'Глубокая кастомизация и полный контроль',
              text: 'Harkly не космический корабль: если вам нужна точная настройка — вы её получите. Если нет — AI сам определит оптимальные параметры. Работает для обоих.',
              outcome: 'Столько контроля, сколько нужно вам.',
            },
            {
              title: 'Для B2B без доступа к пользователям',
              text: 'NDA, ограничения безопасности, нет рекрутинга — не проблема. Desk research — единственный масштабируемый вариант в enterprise.',
              outcome: 'Работает там, где первичное исследование невозможно.',
            },
          ].map((f, i) => (
            <div key={i} className={cn(
              'group relative transition hover:z-[1] hover:shadow-2xl hover:shadow-gray-600/10',
              i === 3 ? 'bg-gray-50 transition duration-300 group-hover:bg-white' : 'bg-white',
            )}>
              <div className="relative space-y-6 py-10 p-8">
                <div className="space-y-2">
                  <h5 className="text-xl font-semibold text-gray-700 transition group-hover:text-indigo-600">
                    {f.title}
                  </h5>
                  <p className="text-gray-600">{f.text}</p>
                </div>
                <div className="flex items-center justify-between text-indigo-600 group-hover:text-indigo-500">
                  <span className="text-sm font-medium">{f.outcome}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 -translate-x-4 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                    <path fillRule="evenodd" d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H3a.75.75 0 010-1.5h16.19l-6.22-6.22a.75.75 0 010-1.06z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}

// ─── How It Works (Spine) ─────────────────────────────────────────────────────

const spine = [
  {
    step: '01',
    label: 'Framing',
    title: 'Постановка и структурирование вопроса',
    desc: 'Черновой вопрос → Harkly разворачивает его по PICO, issue tree, HCD, McKinsey одновременно.',
  },
  {
    step: '02',
    label: 'Planning',
    title: 'Планирование источников',
    desc: 'Автоматически подбирает релевантные базы данных, типы отчётов и OSINT-источники под вашу гипотезу.',
  },
  {
    step: '03',
    label: 'Ingestion',
    title: 'Загрузка и тriage корпуса',
    desc: 'PDF, ссылки, базы знаний — Harkly ранжирует по семантической близости и удаляет дубли.',
  },
  {
    step: '04',
    label: 'Extraction',
    title: 'Извлечение данных',
    desc: 'Факты, метрики, цитаты, сигналы — автоматически или по вашим критериям из любого формата.',
  },
  {
    step: '05',
    label: 'Synthesis',
    title: 'Синтез с источниками',
    desc: 'Каждый инсайт трассируем до оригинального источника. Никаких галлюцинаций.',
  },
  {
    step: '06',
    label: 'Notebook',
    title: 'Генерация артефакта',
    desc: 'Evidence map, empathy map, fact pack, PRISMA-флоу или гибридный фреймворк — готов к отправке.',
  },
]

function HowItWorks() {
  return (
    <div id="how">
      <Container>
        <div className="space-y-6 md:flex flex-row-reverse md:gap-12 md:space-y-0 lg:gap-20 lg:items-start">
          {/* Spine visual */}
          <div className="md:w-5/12 lg:w-1/2">
            <div className="rounded-3xl border border-gray-100 bg-white shadow-2xl shadow-gray-600/10 p-8 space-y-1">
              {spine.map((s, i) => (
                <div key={i} className="flex gap-4 items-start group cursor-default py-3 border-b border-gray-50 last:border-0">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition">
                    <span className="text-indigo-600 text-xs font-bold">{s.step}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">{s.label}</span>
                    </div>
                    <h6 className="font-semibold text-gray-700 group-hover:text-indigo-600 transition">{s.title}</h6>
                    <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Text */}
          <div className="md:w-7/12 lg:w-1/2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-sky-500">
              <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3z" clipRule="evenodd" />
            </svg>
            <h2 className="my-6 text-3xl font-bold text-gray-900 md:text-4xl" style={urbanist}>
              Шесть этапов. Один пайплайн.
            </h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              Harkly spine — это полный цикл кабинетного исследования в одном месте. От черновой формулировки вопроса до готового артефакта, где каждый вывод трассируется до источника.
            </p>
            <div className="divide-y space-y-4 divide-gray-100">
              {[
                { label: 'Работает без первичных данных', desc: 'Для B2B, regulated industries, ограниченных бюджетов.' },
                { label: 'Артефакты вместо слайдов', desc: 'Evidence map, empathy map, fact pack — готовы за одну сессию.' },
                { label: 'Исследование приходит до совещания', desc: 'Не после. Данные влияют на решение, а не подтверждают его.' },
              ].map((item, i) => (
                <div key={i} className={cn('flex gap-4 md:items-center', i > 0 && 'pt-4')}>
                  <div className="w-12 h-12 flex rounded-full bg-indigo-50 items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-indigo-600">
                      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-700">{item.label}</h3>
                    <p className="text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

// ─── Stats ────────────────────────────────────────────────────────────────────

const stats = [
  { value: '80%', label: 'используют AI, но 91% беспокоятся о точности' },
  { value: '6–8 нед.', label: 'средний цикл при традиционном подходе' },
  { value: '400+', label: 'инструментов — ни один не для desk research' },
  { value: '21%', label: 'довольны тем, как показывают влияние своей работы' },
]

function Stats() {
  return (
    <div className="border-y border-gray-100 py-16 bg-gray-50">
      <Container>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <h3 className="text-4xl font-bold text-gray-900" style={urbanist}>{s.value}</h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">{s.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

function CtaSection() {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setEmail('')
        setRole('')
      } else if (res.status === 409) {
        setStatus('error')
        setErrorMsg('Этот email уже в списке ожидания.')
      } else {
        setStatus('error')
        setErrorMsg(data.error || 'Что-то пошло не так. Попробуйте ещё раз.')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Ошибка сети. Попробуйте ещё раз.')
    }
  }

  return (
    <div className="relative py-16" id="cta">
      <GradientBlobs />
      <Container>
        <div className="relative mx-auto space-y-6 md:w-8/12 lg:w-7/12 text-center">
          <h1 className="text-4xl font-bold text-gray-800 md:text-5xl" style={urbanist}>
            Исследуйте, творите, меняйте.
            <br />
            <span className="text-gray-500">Всё остальное мы возьмём на себя.</span>
          </h1>
          <p className="text-xl text-gray-600">
            Harkly в закрытой бете. Пробуйте — и присоединяйтесь к закрытому сообществу. Давайте строить вместе.
          </p>

          {status === 'success' ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-green-500">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
              <p className="text-lg font-semibold text-gray-800">Вы в списке!</p>
              <p className="text-gray-500">Напишем, когда откроем доступ.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-wrap justify-center gap-4 mt-4">
              <input
                type="email"
                placeholder="Рабочий email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={status === 'loading'}
                className={cn(
                  'h-11 rounded-full border border-gray-200 bg-white px-5',
                  'text-gray-700 placeholder:text-gray-400 outline-none shadow-sm',
                  'focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20',
                  'transition w-full sm:w-72',
                )}
              />
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                disabled={status === 'loading'}
                className={cn(
                  'h-11 rounded-full border border-gray-200 bg-white px-5 shadow-sm',
                  'outline-none focus:border-indigo-400 transition w-full sm:w-auto',
                  role ? 'text-gray-700' : 'text-gray-400',
                )}
              >
                <option value="" disabled>Роль</option>
                <option value="ux-researcher">UX Researcher</option>
                <option value="cx-researcher">CX Researcher</option>
                <option value="pm">Product Manager</option>
                <option value="other">Другое</option>
              </select>
              <PrimaryBtn type="submit" disabled={status === 'loading'} className="h-11">
                {status === 'loading' ? 'Отправка...' : 'Получить доступ →'}
              </PrimaryBtn>
              {status === 'error' && errorMsg && (
                <p className="w-full text-sm text-red-500 text-center">{errorMsg}</p>
              )}
            </form>
          )}

          <p className="text-sm text-gray-400">
            Без карты. Без спама. Бета-пользователи получают 3 месяца бесплатно при запуске.
          </p>
        </div>
      </Container>
    </div>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="py-16 border-t border-gray-100">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <a href="/" className="flex items-center space-x-2">
            <div aria-hidden="true" className="flex space-x-1">
              <div className="size-4 rounded-full bg-gray-900" />
              <div className="h-6 w-2 bg-indigo-600" />
            </div>
            <span className="text-xl font-bold text-gray-900" style={urbanist}>Harkly</span>
          </a>
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} Harkly. Все права защищены.</p>
          <a href="/auth/login" className="text-sm text-gray-300 hover:text-gray-500 transition">Dev →</a>
        </div>
      </Container>
    </footer>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="bg-white text-gray-900" style={urbanist}>
      <Nav />
      <main className="space-y-40 pb-40 pt-0">
        <Hero />
        <SocialProof />
        <Problem />
        <Solution />
        <HowItWorks />
        <Stats />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
