'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
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
        'before:absolute before:inset-0 before:rounded-full before:bg-indigo-500',
        'before:transition before:duration-300 hover:before:scale-105 hover:before:bg-indigo-400 active:duration-75 active:before:scale-95',
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
        'before:absolute before:inset-0 before:rounded-full before:border before:border-white/20',
        'before:bg-white/5 before:transition before:duration-300 hover:before:scale-105 hover:before:bg-white/10 active:before:scale-95',
        'sm:w-max',
        className,
      )}
    >
      <span className="relative text-base font-semibold text-white/80">{children}</span>
    </button>
  )
}

function AccentBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '48px', padding: '0 40px', borderRadius: '999px',
        background: 'rgba(215,186,125,0.18)',
        backdropFilter: 'blur(16px) saturate(160%)',
        WebkitBackdropFilter: 'blur(16px) saturate(160%)',
        border: '1px solid rgba(215,186,125,0.55)',
        color: '#D7BA7D', fontWeight: 600, fontSize: '15px',
        cursor: 'pointer', transition: 'transform 0.2s, opacity 0.2s',
        ...urbanist,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.04)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
    >
      {children}
    </button>
  )
}

function GradientBlobs() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-25 pointer-events-none"
    >
      <div className="blur-[106px] h-56 bg-gradient-to-br from-indigo-400 to-violet-500" />
      <div className="blur-[106px] h-32 bg-gradient-to-r from-blue-400 to-indigo-300" />
    </div>
  )
}

// ─── Hero Cube ───────────────────────────────────────────────────────────────

function HeroCube() {
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const adjust = () => {
      if (!wrapRef.current) return
      const scale = Math.max(window.innerWidth / 1000, window.innerHeight / 562)
      wrapRef.current.style.transform = `scale(${scale})`
      wrapRef.current.style.transformOrigin = 'center center'
    }
    adjust()
    window.addEventListener('resize', adjust)
    return () => window.removeEventListener('resize', adjust)
  }, [])

  const phrase = 'Рынок исследований меняется — мы помогаем успеть · '
  const text = Array(25).fill(phrase).join('')

  const cubeInner = (reflect?: boolean) => (
    <div className={reflect ? 'hc-reflect' : 'hc-cube-box'}>
      <div className="hc-cube">
        <div className="hc-face hc-top" />
        <div className="hc-face hc-bottom" />
        <div className="hc-face hc-left"><p className="hc-text">{text}</p></div>
        <div className="hc-face hc-right"><p className="hc-text">{text}</p></div>
        <div className="hc-face hc-front" />
        <div className="hc-face hc-back"><p className="hc-text">{text}</p></div>
      </div>
    </div>
  )

  return (
    <div className="hc-outer">
      <div ref={wrapRef} className="hc-wrap">
        <div className="hc-inner">
          {cubeInner()}
          {cubeInner(true)}
        </div>
      </div>
    </div>
  )
}

// ─── Nav ─────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <header>
      <nav className="relative w-full" style={{ zIndex: 100, background: 'transparent' }}>
        <Container>
          <div className="flex items-center justify-center py-4">
            <a href="/">
              <span className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-inter, sans-serif)', letterSpacing: '-0.04em' }}>HARKLY</span>
            </a>
          </div>
        </Container>
      </nav>
    </header>
  )
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <>
      {/* Fixed background: room + hue + cube — parallax 20% speed */}
      <div id="hero-bg" style={{ position: 'fixed', inset: 0, zIndex: 1, overflow: 'clip' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <img src="/empty-room.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        </div>
        <div className="hc-hue" style={{ zIndex: 1 }} />
        <div className="absolute inset-0" style={{ zIndex: 2 }}>
          <HeroCube />
        </div>
      </div>

      {/* Fixed overlay: heading + CTA + bottom fade — parallax 20% speed */}
      <div id="hero-overlay" style={{ position: 'fixed', inset: 0, zIndex: 15, pointerEvents: 'none' }}>
        <div className="absolute inset-x-0 top-36 text-center px-4" style={{ pointerEvents: 'auto' }}>
          <h1
            style={{ color: '#FFF8E7', fontSize: 'clamp(28px, 3.6vw, 52px)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em', ...urbanist }}
          >
            Автоматизация<br />кабинетных исследований
          </h1>
        </div>
        <div className="absolute inset-x-0 bottom-28 flex justify-center" style={{ pointerEvents: 'auto' }}>
          <AccentBtn onClick={() => document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' })}>
            Получить ранний доступ
          </AccentBtn>
        </div>
      </div>
    </>
  )
}

// ─── Social Proof (Liquid Glass Problem Cards) ────────────────────────────────

const quotes = [
  {
    title: 'Инструменты вместо инсайтов',
    text: 'Researchers spend more time managing tools than generating insights.',
    author: 'DataDiggers Blog',
    role: 'Too Many Tools, Too Little Time',
  },
  {
    title: 'Инсайты теряются',
    text: "It's common for research insights to get lost in hard-to-find reports. When this happens, research efforts are sometimes duplicated.",
    author: 'Nielsen Norman Group',
    role: 'Research Repositories · NN/G',
  },
  {
    title: 'Влияние невидимо',
    text: 'Only 21% of researchers are satisfied with their impact-tracking methods. Research exists. Trust in it does not.',
    author: 'State of User Research 2025',
    role: 'User Interviews · n=485',
  },
  {
    title: 'AI не помогает со структурой',
    text: 'I largely rely on AI to help me synthesize data. While AI can summarize responses, it fails at helping me structure and present it to stakeholders in a way that is easy for them to follow.',
    author: 'UX Researcher',
    role: 'Lyssna Synthesis Report 2025',
  },
  {
    title: 'Данные везде, но не вместе',
    text: 'Your data is scattered all over the place. Recordings in a drive, transcripts in another tool, notes in docs, FigJam for analysis, PPTs for presentations. Finding any historical data will start getting difficult very quickly.',
    author: 'Looppanel',
    role: 'Best UX Research Tools',
  },
  {
    title: 'Нет доступа к участникам',
    text: "You can't find anyone to talk to. Recruitment is such a hurdle that you can't even make it into the research process.",
    author: 'Great Question',
    role: 'ResearchOps 101 · 2025',
  },
  {
    title: 'Усилия не оправданы',
    text: "Your research hasn't felt worth the effort. You get insights but spend so much time setting up, organizing, and managing that the time cost outweighs the benefits.",
    author: 'Great Question',
    role: 'ResearchOps 101 · 2025',
  },
  {
    title: 'Инсайты не добываются до конца',
    text: 'The full extent of insights are not mined and translated.',
    author: '76.9% исследователей',
    role: 'Dscout · Left Behind · n=300',
  },
  {
    title: 'Роль превращается в закупки',
    text: 'My role has become more and more focused on which tools we use and enable.',
    author: 'ReOps Professional',
    role: 'User Interviews · Building a ReOps Stack',
  },
  {
    title: 'Данные есть — инсайтов нет',
    text: 'Teams are stuck being data-rich and insight-poor.',
    author: 'Great Question',
    role: 'AI Analysis & Synthesis · 2026',
  },
  {
    title: 'Недели на кодирование',
    text: 'Days (sometimes weeks 😅) manually coding transcripts, building affinity maps, hunting for patterns.',
    author: 'Great Question',
    role: 'AI Analysis & Synthesis · 2026',
  },
  {
    title: 'Исследование всегда опаздывает',
    text: 'Teams spend weeks working on methodologies after the product decision is already made. By the time the research lands, it is correct but no longer helpful.',
    author: 'Senior UX Researcher',
    role: 'LinkedIn · 182 реакции',
  },
  {
    title: 'Скорость — главный блокер',
    text: 'Speed is the biggest bottleneck — traditional tools take 6-8 weeks per research cycle.',
    author: 'Maze',
    role: 'Future of User Research 2025',
  },
  {
    title: 'Постоянно оправдывай себя',
    text: 'One of the most frustrating things about being a UX researcher is you often need to justify your role. And yet it can be really difficult to do this, especially working in a large team or low-maturity organisation.',
    author: 'Alice Gorrod',
    role: 'LinkedIn · 130 реакций',
  },
  {
    title: 'AI давит, не помогает',
    text: 'I feel pressured to use it or else I\'ll be left behind. It speeds up my work but at the cost of my retention and sanity and quality of output.',
    author: 'UX Researcher',
    role: 'State of User Research 2025',
  },
  {
    title: 'Исследование — не работа',
    text: 'Research IS a sinking ship. Dedicated research jobs are getting cut left and right. Research is an activity, not a job. PMs and UXDs are already doing their own research.',
    author: 'Vitaly Zelmanow',
    role: 'LinkedIn · 172 реакции',
  },
  {
    title: 'Стейкхолдеры не верят данным',
    text: 'Even though the data showed a clear path of success, stakeholders were stuck on their own ideas. I thought that I was not being effective in communicating the findings. Can be frustrating.',
    author: 'UX Researcher',
    role: 'Lyssna Synthesis Report 2025',
  },
  {
    title: '400+ инструментов — тот же результат',
    text: 'Recruiting, scheduling, incentive delivery, and niche methodologies remain heavily manual, time-consuming processes lacking AI support.',
    author: 'Great Question',
    role: "What's Happening to UX Research · 2024",
  },
]

const GLASS: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.04)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '20px',
}

const HEADER_GLASS: React.CSSProperties = {
  background: 'rgba(215, 186, 125, 0.40)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255, 255, 255, 0.10)',
  borderRadius: '20px',
}

const CARD_W = 280
const CARD_GAP = 16
const CYCLES = 5
const CYCLE_W = quotes.length * (CARD_W + CARD_GAP) // 18×296=5328
const ROW_OFFSETS_SP = [0, 148, 74, 222, 37, 185, 111, 259, 22, 74, 0, 185, 37, 259, 111, 148, 22, 222, 74, 37]
const ROW_CARDS = Array.from({ length: CYCLES * quotes.length }, (_, i) => quotes[i % quotes.length])

function SocialProof() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<number | null>(null)
  const [open, setOpen] = useState(false)
  const hasMoved = useRef(false)

  // GSAP 2D Draggable with pseudo-infinite X
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let d: any = null
    const init = async () => {
      const [{ gsap }, { Draggable }] = await Promise.all([
        import('gsap'),
        import('gsap/Draggable'),
      ])
      try {
        const { InertiaPlugin } = await import('gsap/InertiaPlugin')
        gsap.registerPlugin(Draggable, InertiaPlugin)
      } catch {
        gsap.registerPlugin(Draggable)
      }
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!canvas || !container) return
      await new Promise<void>(r => requestAnimationFrame(() => r()))
      const cH = container.offsetHeight
      const wH = canvas.offsetHeight

      gsap.set(canvas, { x: -CYCLE_W * 2 })

      ;[d] = Draggable.create(canvas, {
        type: 'x,y',
        bounds: {
          minX: -(CYCLE_W * CYCLES) * 2,
          maxX: 48,
          minY: wH > cH ? cH - wH - 8 : -8,
          maxY: wH > cH ? 8 : cH - wH + 8,
        },
        edgeResistance: 0.9,
        inertia: true,
        cursor: 'grab',
        activeCursor: 'grabbing',
        onPress() { hasMoved.current = false },
        onDrag() {
          hasMoved.current = true
          const cx = gsap.getProperty(canvas, 'x') as number
          if (cx > -CYCLE_W + 100) {
            gsap.set(canvas, { x: cx - CYCLE_W })
            d.update(true)
          } else if (cx < -CYCLE_W * 3 - 100) {
            gsap.set(canvas, { x: cx + CYCLE_W })
            d.update(true)
          }
        },
        onDragEnd() {
          const cx = gsap.getProperty(canvas, 'x') as number
          if (cx > -CYCLE_W + 100) gsap.set(canvas, { x: cx - CYCLE_W })
          else if (cx < -CYCLE_W * 3 - 100) gsap.set(canvas, { x: cx + CYCLE_W })
        },
      })
    }
    init()
    return () => { d?.kill() }
  }, [])

  // Escape + body scroll lock
  useEffect(() => {
    if (active === null) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCard() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [active]) // eslint-disable-line

  const openCard = (i: number) => {
    if (hasMoved.current) return
    setActive(i)
    requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)))
  }

  const closeCard = () => {
    setOpen(false)
    setTimeout(() => setActive(null), 350)
  }

  const q = active !== null ? quotes[active % quotes.length] : null
  const rows = ROW_OFFSETS_SP.map((offset, r) => ({ cards: ROW_CARDS, offset, r }))

  const renderCard = (item: typeof quotes[0], key: number, idx: number) => {
    const num = String((idx % quotes.length) + 1).padStart(2, '0')
    return (
      <div
        key={key}
        onClick={() => openCard(idx % quotes.length)}
        className="group"
        style={{
          background: 'rgba(255, 248, 231, 0.14)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          border: '1px solid rgba(255,248,231,0.08)',
          borderRadius: '20px',
          width: `${CARD_W}px`,
          height: '240px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          overflow: 'hidden',
          flexShrink: 0,
          cursor: 'pointer',
        }}
      >
        <div className="w-10 h-10 rounded-full bg-indigo-900/40 flex items-center justify-center shrink-0">
          <span className="text-indigo-300 font-bold text-sm">{num}</span>
        </div>
        <h5 className="text-white font-semibold text-base leading-snug line-clamp-1 group-hover:text-indigo-300 transition-colors">{item.title}</h5>
        <p className="text-white/75 text-xs leading-relaxed line-clamp-3 flex-1">{item.text}</p>
        <p className="text-xs text-white/45 border-t border-white/15 pt-3 leading-relaxed mt-auto group-hover:text-indigo-300/60 group-hover:border-indigo-400/20 transition-colors truncate">{item.role}</p>
      </div>
    )
  }

  return (
    <div id="reviews" style={{ position: 'relative', height: '230vh' }}>
      {/* Canvas fills entire section */}
      <div ref={containerRef} className="absolute inset-0 overflow-hidden select-none">
        <div ref={canvasRef} style={{ width: 'max-content', padding: '8px 0 16px' }}>
          {rows.map(({ cards, offset, r }) => (
            <div
              key={r}
              className="flex"
              style={{ gap: `${CARD_GAP}px`, marginLeft: `${offset + 24}px`, marginBottom: r < rows.length - 1 ? '12px' : 0 }}
            >
              {cards.map((item, i) => renderCard(item, r * cards.length + i, r * cards.length + i))}
            </div>
          ))}
        </div>
      </div>

      {/* Header card — sticky, фиксируется на 100px от верха вьюпорта */}
      <div
        style={{ position: 'sticky', top: '0px', zIndex: 10, pointerEvents: 'none', display: 'flex', justifyContent: 'center', paddingTop: '100px' }}
      >
        <div
          className="px-7 py-6 text-center"
          style={{ ...HEADER_GLASS, display: 'inline-flex', flexDirection: 'column', alignItems: 'center', minWidth: '240px', pointerEvents: 'auto' }}
        >
          <h2 className="text-2xl font-bold text-white md:text-4xl" style={urbanist}>Проблема</h2>
          <p className="text-white/40 text-sm mt-2">На основе исследования 200+ источников</p>
        </div>
      </div>

      {/* Split-screen detail overlay */}
      {active !== null && (
        <div
          className="fixed inset-0 flex"
          style={{
            zIndex: 200,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            opacity: open ? 1 : 0,
            transition: 'opacity 0.35s ease',
            pointerEvents: open ? 'auto' : 'none',
          }}
          onClick={closeCard}
        >
          <div
            className="flex-1 flex items-center justify-center p-8 lg:p-16"
            style={{ transform: open ? 'translateX(0)' : 'translateX(-24px)', transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-full max-w-md" style={{ ...GLASS, background: 'rgba(255,248,231,0.07)', borderRadius: '24px', padding: '40px' }}>
              <div className="flex gap-3 items-center mb-6">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(99,102,241,0.2)' }}>
                  <span className="text-indigo-300 text-sm font-bold">{String((active % quotes.length) + 1).padStart(2, '0')}</span>
                </div>
                <div>
                  <p className="text-white/80 font-semibold">{q!.author}</p>
                  <p className="text-white/40 text-sm">{q!.role}</p>
                </div>
              </div>
              <h3 className="text-white/90 font-bold text-xl mb-4">{q!.title}</h3>
              <p className="text-white/80 text-lg leading-relaxed">«{q!.text}»</p>
            </div>
          </div>

          <div className="hidden lg:block self-stretch my-10" style={{ width: '1px', background: 'rgba(255,248,231,0.07)' }} />

          <div
            className="hidden lg:flex flex-1 items-center justify-center p-16"
            style={{ transform: open ? 'translateX(0)' : 'translateX(24px)', transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.05s' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="max-w-sm w-full space-y-6">
              <p className="text-white/25 text-xs uppercase tracking-widest">
                {String((active % quotes.length) + 1).padStart(2, '0')} / {String(quotes.length).padStart(2, '0')}
              </p>
              <h3 className="text-3xl font-bold text-white" style={urbanist}>{q!.title}</h3>
              <p className="text-white/50">{q!.author} · {q!.role}</p>
              <div style={{ width: '40px', height: '1px', background: 'rgba(255,248,231,0.18)' }} />
              <p className="text-white/40 text-sm leading-relaxed">
                Кабинетное исследование — это данные, которые уже существуют. Harkly структурирует их, синтезирует и превращает в аргумент.
              </p>
            </div>
          </div>

          <button
            className="absolute top-6 right-6 flex items-center justify-center transition-colors"
            style={{
              zIndex: 201,
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255,248,231,0.08)',
              border: '1px solid rgba(255,248,231,0.15)',
              cursor: 'pointer',
            }}
            onClick={closeCard}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M1 1L15 15M15 1L1 15" stroke="rgba(255,248,231,0.7)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Problem ─────────────────────────────────────────────────────────────────

function Problem() {
  return (
    <div id="problem">
      <Container>
        <div className="md:w-2/3 lg:w-1/2 mb-12">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-indigo-300">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
          </svg>
          <h2 className="my-6 text-2xl font-bold text-white md:text-4xl" style={urbanist}>
            У кабинетного исследования нет дома.
          </h2>
          <p className="text-white/60 leading-relaxed">
            Раньше все решения принимались вчера, но в 2026 это уже позавчера. Как только вы задумались над методологией — ваши данные уже нерелевантны.
          </p>
        </div>

        <div className="mt-4 grid divide-x divide-y divide-white/10 overflow-hidden rounded-3xl border border-white/10 text-white/60 sm:grid-cols-3">
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
            <div key={i} className="group relative bg-white/5 transition hover:z-[1] hover:bg-white/8">
              <div className="relative space-y-6 py-10 p-8">
                <div className="w-12 h-12 flex rounded-full bg-indigo-900/40 items-center justify-center">
                  <span className="text-indigo-300 font-bold text-sm">0{i + 1}</span>
                </div>
                <div className="space-y-2">
                  <h5 className="text-xl font-semibold text-white/80 transition group-hover:text-indigo-300">
                    {item.title}
                  </h5>
                  <p className="text-white/55">{item.text}</p>
                </div>
                <p className="text-xs text-white/30 border-t border-white/10 pt-4 leading-relaxed transition group-hover:text-indigo-300/60 group-hover:border-indigo-400/20">
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
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-indigo-300">
            <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5z" clipRule="evenodd" />
          </svg>
          <h2 className="my-6 text-2xl font-bold text-white md:text-4xl" style={urbanist}>
            Один процесс. От вопроса до артефакта.
          </h2>
          <p className="text-white/60 leading-relaxed">
            Harkly — первая платформа, созданная специально для кабинетного исследования. Для случаев, когда нет пользователей для интервью, дедлайн уже сдвинулся, а стейкхолдер ждёт доказательства, а не слайды.
          </p>
        </div>

        <div className="mt-4 grid divide-x divide-y divide-white/10 overflow-hidden rounded-3xl border border-white/10 sm:grid-cols-2 lg:grid-cols-3">
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
            <div key={i} className="group relative bg-white/5 transition hover:z-[1] hover:bg-white/8">
              <div className="relative space-y-6 py-10 p-8">
                <div className="space-y-2">
                  <h5 className="text-xl font-semibold text-white/80 transition group-hover:text-indigo-300">
                    {f.title}
                  </h5>
                  <p className="text-white/55">{f.text}</p>
                </div>
                <div className="flex items-center justify-between text-indigo-300/80 group-hover:text-indigo-300">
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
    title: 'Загрузка и triage корпуса',
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
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 space-y-1">
              {spine.map((s, i) => (
                <div key={i} className="flex gap-4 items-start group cursor-default py-3 border-b border-white/5 last:border-0">
                  <div className="w-10 h-10 rounded-full bg-indigo-900/40 flex items-center justify-center shrink-0 group-hover:bg-indigo-800/50 transition">
                    <span className="text-indigo-300 text-xs font-bold">{s.step}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-widest text-indigo-300/60">{s.label}</span>
                    </div>
                    <h6 className="font-semibold text-white/70 group-hover:text-indigo-300 transition">{s.title}</h6>
                    <p className="text-sm text-white/40 mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Text */}
          <div className="md:w-7/12 lg:w-1/2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-sky-400">
              <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3z" clipRule="evenodd" />
            </svg>
            <h2 className="my-6 text-3xl font-bold text-white md:text-4xl" style={urbanist}>
              Шесть этапов. Один пайплайн.
            </h2>
            <p className="text-white/60 leading-relaxed mb-8">
              Harkly spine — это полный цикл кабинетного исследования в одном месте. От черновой формулировки вопроса до готового артефакта, где каждый вывод трассируется до источника.
            </p>
            <div className="divide-y space-y-4 divide-white/10">
              {[
                { label: 'Работает без первичных данных', desc: 'Для B2B, regulated industries, ограниченных бюджетов.' },
                { label: 'Артефакты вместо слайдов', desc: 'Evidence map, empathy map, fact pack — готовы за одну сессию.' },
                { label: 'Исследование приходит до совещания', desc: 'Не после. Данные влияют на решение, а не подтверждают его.' },
              ].map((item, i) => (
                <div key={i} className={cn('flex gap-4 md:items-center', i > 0 && 'pt-4')}>
                  <div className="w-12 h-12 flex rounded-full bg-indigo-900/40 items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-indigo-300">
                      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white/80">{item.label}</h3>
                    <p className="text-white/50">{item.desc}</p>
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

// ─── Ghost Scroll Gallery ─────────────────────────────────────────────────────

const GALLERY_GHOST_H = 300 // vh per panel

const galleryData = [
  {
    bg: 'radial-gradient(ellipse 90% 45% at 50% -5%, #E8CC70 0%, transparent 60%), radial-gradient(ellipse 60% 30% at 90% 110%, #B8922E 0%, transparent 55%), linear-gradient(170deg, #DECB80 0%, #D7BA7D 45%, #C4A660 100%)',
    dark: true,
    accentColor: '#0D0E65',
    titleLines: ['Все в одном', 'приложении.'],
    subtitle: 'Google, Notion, ChatGPT, PDF — ваш текущий стек для кабинетного исследования. Harkly собирает всё в единый процесс, где каждый источник связан с выводом.',
    cards: [
      { num: '01', title: 'Один процесс вместо четырёх инструментов', text: 'Google, Notion, ChatGPT, PowerPoint — ни один из них не знает о существовании остальных. Harkly заменяет весь стек: сбор источников, скрининг, синтез и артефакт — одна непрерывная цепь без переключений.', stat: 'Весь процесс — в одной вкладке браузера.' },
      { num: '02', title: 'Исследование не умирает с дедлайном', text: 'Каждый проект хранит источники, выводы и историю решений бессрочно. Когда через полгода стейкхолдер спросит «откуда эта цифра» — вы откроете проект и покажете исходный документ, а не будете искать его в пяти разных папках.', stat: 'Исследование становится институциональной памятью команды.' },
      { num: '03', title: 'Артефакт готовится внутри', text: 'Эмпатийная карта, карта доказательств, фактпак — генерируются прямо из синтезированных данных, без переноса в Miro или Figma. Стейкхолдер получает документ с кликабельными источниками, а не набор слайдов.', stat: 'От данных до готового артефакта — без единого экспорта.' },
    ],
  },
  {
    bg: '#080950',
    dark: false,
    accentColor: '#818cf8',
    titleLines: ['Широчайший', 'выбор источников.'],
    subtitle: 'Живые данные из Twitter, Reddit и YouTube — не из отчёта двухлетней давности. А если нужного источника нет — AI-агент добавит его по запросу.',
    cards: [
      { num: '01', title: 'Twitter / X', text: 'Нативная интеграция с Twitter/X API даёт доступ к живому голосу ваших пользователей прямо сейчас. Поиск по ключевым словам, авторам, временным диапазонам — сигнал попадает в корпус автоматически.', stat: 'Что говорят реальные люди сегодня — не то, что написано в white paper.' },
      { num: '02', title: 'Reddit', text: 'r/UXResearch, r/userexperience, r/researchops — там ваша аудитория говорит честно. Harkly индексирует по вашей гипотезе и ранжирует по релевантности, а не по популярности.', stat: 'Самый откровенный источник обратной связи — без маркетинговых фильтров.' },
      { num: '03', title: 'AI-агент по запросу', text: 'Нужен источник, которого нет в стандартном наборе? Опишите задачу в Omnibar — агент найдёт подходящий API, проверит релевантность и подключит к вашему пайплайну. Без технических знаний.', stat: 'Ни один нужный источник — за пределами вашего корпуса.' },
    ],
  },
  {
    bg: 'radial-gradient(ellipse 90% 45% at 50% -5%, #E8CC70 0%, transparent 60%), radial-gradient(ellipse 60% 30% at 90% 110%, #B8922E 0%, transparent 55%), linear-gradient(170deg, #DECB80 0%, #D7BA7D 45%, #C4A660 100%)',
    dark: true,
    accentColor: '#0D0E65',
    titleLines: ['Глубокая', 'кастомизация.'],
    subtitle: 'Исследование — это не конвейер. Harkly даёт контроль: методологию, структуру вопроса и ветки гипотез вы выбираете сами. AI адаптируется под вас, не наоборот.',
    cards: [
      { num: '01', title: 'Omnibar', text: 'Введите исследовательский вопрос в любом виде — черновом или точном. Harkly структурирует его по методологическому фрейму и разворачивает план поиска. Нет пустого экрана — только следующий шаг.', stat: 'От вопроса к структуре — за секунды, а не за совещание.' },
      { num: '02', title: 'Выбор методологии', text: 'PICOT, дерево гипотез, HCD, McKinsey — это не просто фреймы на выбор. Методология меняет что ищем, что включаем и какой артефакт получим на выходе. Один вопрос — четыре разных маршрута к истине.', stat: 'Правильный фрейм находит правильные источники.' },
      { num: '03', title: 'Параллельные ветки', text: 'Запускайте несколько гипотез из одного рабочего пространства. Каждая ветка — изолированный корпус, своя методология, свой артефакт. Конкурирующие версии одного вопроса — рядом, а не в разных документах.', stat: 'Сравнивайте гипотезы внутри, а не на совещании.' },
    ],
  },
  {
    bg: '#080950',
    dark: false,
    accentColor: '#818cf8',
    titleLines: ['Полная автоматизация', 'рутины.'],
    subtitle: 'Скрининг, извлечение, верификация — автоматически. Каждый вывод ведёт к источнику. Стейкхолдер не спросит «откуда это» — он сам увидит.',
    cards: [
      { num: '01', title: 'Семантический скрининг', text: 'Каждый документ оценивается по семантической близости к вашей гипотезе — не по совпадению слов. Дубликаты, спам и нерелевантный контент исключаются до того, как вы откроете первый файл.', stat: 'Экономия 30–40% времени на ручной фильтрации (Maze ResearchOps, 2025).' },
      { num: '02', title: 'Верификация фактов', text: 'Каждое утверждение сопоставлено с несколькими независимыми источниками. Противоречия выделены, слабые доказательства помечены. Стейкхолдер проверяет любой вывод одним кликом — и видит источник, а не ваше мнение.', stat: '91% исследователей беспокоятся о точности AI. У нас — только то, что подтверждено.' },
      { num: '03', title: 'Методологическая база', text: 'Агенты Harkly обучены на PICOT, PRISMA, Evidence Synthesis и JTBD — не generic чат-бот. Тематическое кодирование, извлечение сущностей и анализ тональности идут автоматически по методологическим правилам. Логика открыта и редактируема.', stat: 'Из 1000 документов — граф знаний. Без единой вручную прочитанной строки.' },
    ],
  },
]

function GhostScrollGallery() {
  const panelRefs = useRef<(HTMLDivElement | null)[]>([])
  const ghostRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    let killed = false

    const init = async () => {
      const { default: gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      if (killed) return

      const panels = panelRefs.current.filter(Boolean) as HTMLDivElement[]
      const ghosts = ghostRefs.current.filter(Boolean) as HTMLDivElement[]

      // Panel 0 is visible immediately — only hide panels 1+
      gsap.set(panels.slice(1), { clipPath: 'inset(100% 0 0% 0)' })

      panels.forEach((panel, index) => {
        const ghost = ghosts[index]
        const lines = panel.querySelectorAll<HTMLElement>('[data-line]')
        const cards = panel.querySelectorAll<HTMLElement>('[data-card]')
        const overlay = panel.querySelector<HTMLElement>('[data-overlay]')

        // Reveal panel from bottom (skip for panel 0 — already visible)
        if (index > 0) {
          gsap.to(panel, {
            clipPath: 'inset(0% 0 0 0)',
            scrollTrigger: { trigger: ghost, scrub: true, start: 'top bottom', end: '+75vh top' },
          })
        }

        // Text lines slide up out of wrapper
        gsap.from(lines, {
          yPercent: 125,
          rotate: 2.5,
          ease: 'power2.inOut',
          duration: 1.25,
          scrollTrigger: { trigger: ghost, start: 'top 75%', toggleActions: 'play reverse restart reverse' },
        })

        // Cards slide in from side (even=right, odd=left)
        gsap.from(cards, {
          x: index % 2 === 0 ? '100vw' : '-100vw',
          scrollTrigger: {
            trigger: ghost,
            scrub: true,
            start: '0 top',
            end: '65% top',
            onLeave: () => { if (overlay) gsap.set(overlay, { display: 'flex', opacity: 0 }) },
          },
        })

        // Final: overlay + cards drift + blur
        const stFinal = { trigger: ghost, scrub: true, start: '105% bottom' }
        if (overlay) gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, scrollTrigger: stFinal })
        gsap.to(cards, { yPercent: 15, scrollTrigger: stFinal })
        gsap.to(panel, { filter: 'blur(1px)', scrollTrigger: stFinal })
      })
    }

    init()
    return () => {
      killed = true
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => ScrollTrigger.getAll().forEach(t => t.kill()))
    }
  }, [])

  return (
    <div style={{ position: 'relative', height: `${galleryData.length * GALLERY_GHOST_H}vh` }}>
      {/* Sticky viewport — 100vh, sticks while ghost items scroll */}
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', background: galleryData[0].bg }}>
        {galleryData.map((item, i) => (
          <div
            key={i}
            ref={el => { panelRefs.current[i] = el }}
            style={{ position: 'absolute', inset: 0, background: item.bg, zIndex: i + 1 }}
          >
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-around', padding: '2vw 4vw' }}>

              {/* Cards row */}
              <div style={{ display: 'flex', gap: '2.5vw', justifyContent: 'center', alignItems: 'stretch' }}>
                {item.cards.map((card, ci) => (
                  <div
                    key={ci}
                    data-card
                    style={{
                      flex: '1 0 0',
                      height: 'clamp(180px, 42vh, 380px)',
                      background: item.dark ? 'rgba(0,0,0,0.10)' : 'rgba(255,248,231,0.06)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: item.dark ? '1px solid rgba(0,0,0,0.12)' : '1px solid rgba(255,248,231,0.1)',
                      borderRadius: '20px',
                      padding: '2vw',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1vw',
                    }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: item.dark ? 'rgba(0,0,0,0.15)' : 'rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: item.accentColor, fontWeight: 700, fontSize: 13 }}>{card.num}</span>
                    </div>
                    <h5 style={{ color: item.dark ? '#0D0E65' : '#FFF8E7', fontWeight: 600, fontSize: 'clamp(14px, 1.2vw, 22px)', lineHeight: 1.3, margin: 0 }}>{card.title}</h5>
                    <p style={{ color: item.dark ? 'rgba(13,14,101,0.65)' : 'rgba(255,248,231,0.65)', fontSize: 'clamp(11px, 0.9vw, 16px)', lineHeight: 1.6, flex: 1, margin: 0, overflow: 'hidden' }}>{card.text}</p>
                    <p style={{ color: item.dark ? 'rgba(13,14,101,0.4)' : 'rgba(255,248,231,0.35)', fontSize: 'clamp(10px, 0.75vw, 14px)', borderTop: item.dark ? '1px solid rgba(0,0,0,0.12)' : '1px solid rgba(255,248,231,0.1)', paddingTop: '0.8vw', margin: 0, lineHeight: 1.5 }}>{card.stat}</p>
                  </div>
                ))}
              </div>

              {/* Text row: title left, subtitle right */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%' }}>
                {/* Big title */}
                <div style={{ fontFamily: 'var(--font-urbanist, sans-serif)', fontSize: '7vw', fontWeight: 600, lineHeight: 1, color: item.dark ? '#0D0E65' : '#FFF8E7', textTransform: 'uppercase' }}>
                  {item.titleLines.map((line, li) => (
                    <div key={li} style={{ overflow: 'hidden' }}>
                      <div data-line style={{ lineHeight: 1 }}>{line}</div>
                    </div>
                  ))}
                </div>
                {/* Subtitle */}
                <div style={{ width: 'clamp(220px, 28vw, 440px)', paddingBottom: '0.5vw' }}>
                  <div style={{ overflow: 'hidden' }}>
                    <div data-line style={{ color: item.dark ? 'rgba(13,14,101,0.72)' : 'rgba(255,248,231,0.68)', fontSize: 'clamp(13px, 1.15vw, 20px)', fontWeight: 600, lineHeight: 1.55, fontFamily: 'var(--font-urbanist, var(--font-inter, sans-serif))' }}>{item.subtitle}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Overlay fades to next panel's bg color */}
            <div data-overlay style={{ position: 'absolute', inset: 0, background: item.bg, display: 'none', opacity: 0, zIndex: 10, pointerEvents: 'none' }} />
          </div>
        ))}
      </div>

      {/* Ghost items — absolute, provide scroll height and trigger positions */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
        {galleryData.map((_, i) => (
          <div key={i} ref={el => { ghostRefs.current[i] = el }} style={{ height: `${GALLERY_GHOST_H}vh` }} />
        ))}
      </div>
    </div>
  )
}

// ─── Stats ────────────────────────────────────────────────────────────────────

// ─── CTA ──────────────────────────────────────────────────────────────────────

function CtaSection() {
  const [telegram, setTelegram] = useState('')
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
        body: JSON.stringify({ telegram, role }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setTelegram('')
        setRole('')
      } else if (res.status === 409) {
        setStatus('error')
        setErrorMsg('Этот Telegram уже в списке ожидания.')
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
    <div className="relative py-14" id="cta">
      <GradientBlobs />
      <Container>
        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>

          {/* LEFT — Badge + Headline */}
          <div>
            <div style={{ marginBottom: '32px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '999px', border: '1px solid rgba(232,204,112,0.2)', background: 'rgba(232,204,112,0.06)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(232,204,112,0.65)', ...urbanist }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#E8CC70', flexShrink: 0 }} />
                Закрытая бета
              </span>
            </div>

            <h2 style={{ ...urbanist, lineHeight: 1.06, letterSpacing: '-0.03em' }}>
              <span style={{ display: 'block', fontSize: 'clamp(38px, 5.5vw, 76px)', fontWeight: 700, color: '#FFF8E7' }}>
                Исследуйте,<br />творите,<br />меняйте.
              </span>
              <span style={{ display: 'block', fontSize: 'clamp(20px, 2.4vw, 36px)', fontWeight: 600, color: 'rgba(255,248,231,0.28)', marginTop: '12px' }}>
                Всё остальное — за нами.
              </span>
            </h2>
          </div>

          {/* RIGHT — Glass card with subtext + form */}
          <div style={{ background: 'none', border: '1px solid rgba(255,248,231,0.12)', borderRadius: '20px', padding: '32px' }}>
            <p style={{ fontSize: 'clamp(14px, 1.1vw, 16px)', color: 'rgba(255,248,231,0.5)', lineHeight: 1.7, marginBottom: '32px', ...urbanist }}>
              Harkly в закрытой бете. Оставьте заявку — и присоединяйтесь к первым, кто строит вместе с нами.
            </p>

            {status === 'success' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', borderRadius: '14px', border: '1px solid rgba(52,211,153,0.2)', background: 'rgba(52,211,153,0.06)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(52,211,153,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <p style={{ color: '#FFF8E7', fontWeight: 600, fontSize: '15px', ...urbanist }}>Вы в списке!</p>
                  <p style={{ color: 'rgba(255,248,231,0.4)', fontSize: '13px', marginTop: '2px', ...urbanist }}>Напишем в Telegram, когда откроем доступ.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                {/* Telegram field */}
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,248,231,0.3)', fontSize: '15px', fontWeight: 500, pointerEvents: 'none', fontFamily: 'var(--font-inter, sans-serif)' }}>@</span>
                  <input
                    type="text"
                    placeholder="username"
                    value={telegram}
                    onChange={e => setTelegram(e.target.value.replace(/^@/, ''))}
                    required
                    disabled={status === 'loading'}
                    style={{ width: '100%', height: '48px', borderRadius: '12px', border: '1px solid rgba(255,248,231,0.12)', background: 'rgba(255,248,231,0.06)', paddingLeft: '34px', paddingRight: '16px', color: '#FFF8E7', fontSize: '15px', outline: 'none', fontFamily: 'var(--font-inter, sans-serif)', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Role select */}
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  disabled={status === 'loading'}
                  style={{ width: '100%', height: '48px', borderRadius: '12px', border: '1px solid rgba(255,248,231,0.12)', background: 'rgba(255,248,231,0.06)', padding: '0 16px', color: role ? '#FFF8E7' : 'rgba(255,248,231,0.3)', fontSize: '14px', outline: 'none', fontFamily: 'var(--font-inter, sans-serif)', cursor: 'pointer' }}
                >
                  <option value="" disabled style={{ background: '#080950', color: 'rgba(255,248,231,0.4)' }}>Роль</option>
                  <option value="ux-researcher" style={{ background: '#080950', color: '#FFF8E7' }}>UX Researcher</option>
                  <option value="cx-researcher" style={{ background: '#080950', color: '#FFF8E7' }}>CX Researcher</option>
                  <option value="pm" style={{ background: '#080950', color: '#FFF8E7' }}>Product Manager</option>
                  <option value="other" style={{ background: '#080950', color: '#FFF8E7' }}>Другое</option>
                </select>

                {/* Gold button */}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  style={{ width: '100%', height: '48px', borderRadius: '12px', background: '#E8CC70', color: '#080950', fontSize: '15px', fontWeight: 600, border: 'none', cursor: status === 'loading' ? 'not-allowed' : 'pointer', opacity: status === 'loading' ? 0.6 : 1, transition: 'opacity 0.15s', ...urbanist }}
                  onMouseEnter={e => { if (status !== 'loading') (e.currentTarget as HTMLButtonElement).style.opacity = '0.85' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = status === 'loading' ? '0.6' : '1' }}
                >
                  {status === 'loading' ? 'Отправка...' : 'Получить доступ →'}
                </button>

                {status === 'error' && errorMsg && (
                  <p style={{ fontSize: '13px', color: '#f87171' }}>{errorMsg}</p>
                )}
              </form>
            )}

            <p style={{ marginTop: '20px', fontSize: '12px', color: 'rgba(255,248,231,0.18)', ...urbanist }}>
              Без спама. Бета-пользователи получают 3 месяца бесплатно при запуске.
            </p>
          </div>

        </div>
      </Container>
    </div>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="py-16 border-t border-white/10">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <a href="/">
            <span className="text-xl font-bold tracking-widest text-white" style={{ fontFamily: 'var(--font-inter, sans-serif)' }}>HARKLY</span>
          </a>
          <p className="text-sm text-white/30">© {new Date().getFullYear()} Harkly. Все права защищены.</p>
          <a href="/auth/login" className="text-sm text-white/20 hover:text-white/40 transition">Dev →</a>
        </div>
      </Container>
    </footer>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Home() {
  useEffect(() => {
    let cleanup: (() => void) | undefined
    const init = async () => {
      const { default: Lenis } = await import('lenis')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      const { default: gsap } = await import('gsap')
      gsap.registerPlugin(ScrollTrigger)

      const lenis = new Lenis({ wheelMultiplier: 0.8, touchMultiplier: 0.8, lerp: 0.08 })

      // parallax: cube + heading move at 20% of scroll speed
      lenis.on('scroll', ({ scroll }: { scroll: number }) => {
        const y = -scroll * 0.4
        const bg = document.getElementById('hero-bg')
        const overlay = document.getElementById('hero-overlay')
        if (bg) bg.style.transform = `translateY(${y}px)`
        if (overlay) overlay.style.transform = `translateY(${y}px)`
      })

      // Sync Lenis smooth scroll with GSAP ScrollTrigger
      lenis.on('scroll', ScrollTrigger.update)
      const tickerFn = (time: number) => lenis.raf(time * 1000)
      gsap.ticker.add(tickerFn)
      gsap.ticker.lagSmoothing(0)

      cleanup = () => {
        lenis.destroy()
        gsap.ticker.remove(tickerFn)
      }
    }
    init()
    return () => cleanup?.()
  }, [])

  return (
    <div className="harkly-bg text-white" style={urbanist}>
      {/* Fixed layers: cube bg (z=1) + heading/CTA (z=15) — parallax 20% */}
      <Hero />
      {/* Fixed nav: always on top (z=100) */}
      <Nav />
      {/* Boy — normal flow, z=10, scrolls at 100% with page */}
      <div
        className="hc-boy-img pointer-events-none"
        style={{ position: 'relative', zIndex: 10, height: '100vh' }}
      >
        <img src="/boy.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        {/* fade moves with boy at 100% speed */}
        <div className="hero-fade" />
      </div>
      {/* Sections — z=20, solid bg, slides over hero as you scroll */}
      <div className="harkly-bg" style={{ position: 'relative', zIndex: 20 }}>
        <main>
          <div className="space-y-40">
            <SocialProof />
          </div>
          <GhostScrollGallery />
          <div className="space-y-40 pt-40 pb-40">
            <CtaSection />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  )
}
