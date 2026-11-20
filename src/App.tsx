import { useCallback, useEffect, useState } from 'react'
import { SCREENS, type ScreenId } from './spec'
import { FlowPage } from './pages/Flow'
import { DocsPage } from './pages/Docs'
import { DemoPage } from './pages/Demo'

type View = { tab: 'flow' } | { tab: 'docs'; id: ScreenId } | { tab: 'demo'; id: ScreenId }
const ids = SCREENS.map((s) => s.id) as ScreenId[]

function parse(hash: string): View {
  const [, tab, id] = hash.replace(/^#/, '').split('/')
  const sid = (ids.includes(id as ScreenId) ? id : 'S-01') as ScreenId
  if (tab === 'flow') return { tab: 'flow' }
  if (tab === 'demo') return { tab: 'demo', id: sid }
  return { tab: 'docs', id: sid } // 첫 진입은 문서 보기
}

export default function App() {
  const [view, setView] = useState<View>(() => parse(location.hash))
  useEffect(() => {
    const on = () => { setView(parse(location.hash)); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const nav = useCallback((h: string) => { location.hash = h }, [])

  return (
    <div className="min-h-screen">
      <Header view={view} nav={nav} />
      <main className="mx-auto max-w-[1520px] px-4 pb-20 pt-6 sm:px-8">
        {view.tab === 'flow' && <FlowPage nav={nav} />}
        {view.tab === 'docs' && <DocsPage id={view.id} nav={nav} />}
        {view.tab === 'demo' && <DemoPage key={view.id} id={view.id} nav={nav} />}
      </main>
    </div>
  )
}

function Header({ view, nav }: { view: View; nav: (h: string) => void }) {
  const lastId = view.tab === 'flow' ? 'S-01' : view.id
  const tabs = [
    { k: 'flow', label: '전체 흐름 보기', h: '#/flow' },
    { k: 'docs', label: '문서 보기', h: `#/docs/${lastId}` },
    { k: 'demo', label: '시연하기', h: `#/demo/${lastId}` },
  ]
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1520px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-8">
        <div className="flex items-center gap-3">
          <img src="/favicon.svg" alt="" className="h-9 w-9" />
          <div>
            <p className="text-[15px] font-bold leading-tight">교내 카페 사전 주문 <span className="ml-1 rounded bg-soft px-1.5 py-0.5 text-[11px] font-medium text-sub">ver 1.0</span></p>
            <p className="text-[12px] text-sub">화면설계서와 기능명세서 · 잇타 10기 기획 스터디 3주차</p>
          </div>
        </div>
        <nav className="no-print flex gap-1 rounded-xl bg-soft p-1" aria-label="메뉴">
          {tabs.map((t) => (
            <button key={t.k} onClick={() => nav(t.h)} aria-current={view.tab === t.k ? 'page' : undefined}
              className={`rounded-lg px-3.5 py-1.5 text-[14px] ${view.tab === t.k ? 'bg-white font-bold text-doc shadow-sm' : 'text-sub hover:text-ink'}`}>
              {t.label}
            </button>
          ))}
        </nav>
        <button onClick={() => window.print()} className="no-print ml-auto rounded-lg border border-line px-3 py-1.5 text-[13px]">문서 인쇄</button>
      </div>
    </header>
  )
}
