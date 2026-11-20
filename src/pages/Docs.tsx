import { useCallback, useEffect, useState } from 'react'
import { DOC_SOURCE, FEATURES, SCREENS, figmaNode, type ScreenId } from '../spec'
import { FrameViewer } from '../ui/FrameViewer'

const Card = ({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) => (
  <section className={`rounded-2xl border border-line bg-white p-5 print-break ${className}`}>
    <h3 className="text-[15px] font-bold">{title}</h3>
    <div className="mt-3 text-[14px] leading-relaxed">{children}</div>
  </section>
)

export function DocsPage({ id, nav }: { id: ScreenId; nav: (h: string) => void }) {
  const idx = SCREENS.findIndex((s) => s.id === id)
  const spec = SCREENS[idx]
  const prev = SCREENS[idx - 1], next = SCREENS[idx + 1]
  const [sel, setSel] = useState<string | null>(null)
  const [mapped, setMapped] = useState<string[]>([])
  useEffect(() => setSel(null), [id])
  const onBoxes = useCallback((n: string[]) => setMapped(n), [])
  const select = (no: string) => {
    setSel(no)
    document.getElementById(`anno-${no}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }
  const feats = spec.features.map((f) => FEATURES.find((x) => x.id === f)!)

  return (
    <div className="mx-auto max-w-[1460px] space-y-6">
      {/* A. 화면 개요 */}
      <section className="rounded-2xl border border-line bg-white p-5">
        <div className="no-print grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-[13px]">
          <button disabled={!prev} onClick={() => prev && nav(`#/docs/${prev.id}`)} className="justify-self-start text-sub disabled:opacity-30">
            ← 이전 문서{prev && ` · ${prev.id} ${prev.name}`}
          </button>
          <span className="text-[12px] text-mid">문서 탐색 순서 (서비스 이동 흐름과 다름)</span>
          <button disabled={!next} onClick={() => next && nav(`#/docs/${next.id}`)} className="justify-self-end text-sub disabled:opacity-30">
            {next && `${next.id} ${next.name} · `}다음 문서 →
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-baseline gap-3">
          <span className="rounded-md bg-ink px-2 py-0.5 text-[13px] font-bold text-white">{spec.id}</span>
          <h1 className="text-[26px] font-bold">{spec.name}</h1>
          <span className="rounded-md bg-soft px-2 py-0.5 text-[12px] text-sub">{spec.type}</span>
        </div>
        <dl className="mt-4 grid gap-x-8 gap-y-3 text-[14px] md:grid-cols-2 xl:grid-cols-3">
          {[
            ['화면 목적', spec.purpose],
            ['들어오는 곳', spec.entry],
            ['나가는 곳', spec.exit],
            ['서비스 Route', spec.route],
            ['문서 원본', DOC_SOURCE],
          ].map(([k, v]) => (
            <div key={k}><dt className="text-[12px] font-medium text-doc">{k}</dt><dd className="mt-0.5">{v}</dd></div>
          ))}
          <div><dt className="text-[12px] font-medium text-doc">Figma 자료 출처</dt>
            <dd className="mt-0.5"><a className="underline" href={figmaNode(spec.figma.node)} target="_blank" rel="noreferrer">{spec.figma.label}</a>
              <span className="block text-[12px] text-sub">문서 프레임은 와이어프레임을 같은 크기(360×760)로 구현한 화면</span></dd></div>
        </dl>
      </section>

      {/* B. 화면 설명 | 구성 요소와 동작 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="화면 설명" className="lg:col-span-3"><p>{spec.display}</p></Card>
        <Card title="주요 동작"><ul className="list-disc space-y-1 pl-5">{spec.actions.map((a) => <li key={a}>{a}</li>)}</ul></Card>
        <Card title="상태 · 예외 처리">
          <dl className="space-y-1.5">{spec.states.map((s) => <div key={s.k}><dt className="inline font-bold">{s.k}</dt> <dd className="inline text-sub">{s.v}</dd></div>)}</dl>
        </Card>
        <Card title="반응형 · 접근성"><ul className="list-disc space-y-1 pl-5">{spec.a11y.map((a) => <li key={a}>{a}</li>)}</ul></Card>
      </div>

      {/* C. Figma 화면과 번호별 구성 요소 */}
      <section className="grid overflow-hidden rounded-2xl border border-line bg-white xl:grid-cols-[minmax(0,1.15fr)_minmax(380px,1fr)]">
        <div className="border-b border-line xl:border-b-0 xl:border-r"><FrameViewer spec={spec} selected={sel} onSelect={select} onBoxes={onBoxes} /></div>
        <div className="p-5">
          <h2 className="text-[17px] font-bold">구성 요소</h2>
          <p className="mt-1 text-[12px] text-sub">번호는 Notion 화면 정의서의 구성 요소 번호</p>
          <ol className="mt-4 space-y-2">
            {spec.annos.map((a) => {
              const on = sel === a.no
              const has = mapped.includes(a.no)
              return (
                <li key={a.no} id={`anno-${a.no}`}>
                  <button onClick={() => setSel(on ? null : a.no)} aria-pressed={on}
                    className={`flex w-full gap-3 rounded-xl border p-3 text-left transition ${on ? 'border-num bg-numSoft' : 'border-line hover:border-mid'}`}>
                    <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${has ? 'bg-num text-white' : 'border border-dashed border-num text-num'}`}>{a.no}</span>
                    <span className="min-w-0">
                      <span className="block text-[14px] font-bold">{a.name}</span>
                      <span className="block text-[13px] text-sub">{a.desc}</span>
                      {a.note && <span className="mt-1 inline-block rounded bg-accentSoft px-1.5 py-0.5 text-[11px] text-accent">{a.note}</span>}
                      {!has && a.mapped !== false && <span className="mt-1 block text-[11px] text-num">대응 영역 확인 필요</span>}
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      {/* D. 기능명세 */}
      <section>
        <h2 className="mb-3 text-[20px] font-bold">기능명세 <span className="text-[14px] font-normal text-sub">· 이 화면과 연결된 기능 {feats.length}개</span></h2>
        <div className="space-y-4">
          {feats.map((f) => (
            <article key={f.id} className="rounded-2xl border border-line bg-white p-5 print-break">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-docSoft px-2 py-0.5 text-[13px] font-bold text-doc">{f.id}</span>
                <h3 className="text-[17px] font-bold">{f.name}</h3>
                <span className="text-[12px] text-sub">{f.type} · 중요도 {f.priority} · 연결 화면 {f.screens.join(', ')}</span>
              </div>
              <p className="mt-1 text-[14px]">{f.desc}</p>
              <div className="mt-3 flex flex-wrap items-start gap-2 rounded-xl bg-soft px-3 py-2 text-[13px]">
                <span className="font-bold">현재 구현 상태</span>
                <span className={`rounded px-1.5 text-[12px] font-bold ${f.impl.status === '구현' ? 'bg-docSoft text-doc' : 'bg-accentSoft text-accent'}`}>{f.impl.status}</span>
                {f.impl.note && <span className="text-sub">{f.impl.note}</span>}
              </div>
              <dl className="mt-3 divide-y divide-line text-[14px]">
                {f.rows.map((r) => (
                  <div key={r.k} className="grid gap-1 py-2 md:grid-cols-[150px_1fr]">
                    <dt className="font-medium text-sub">{r.k}</dt>
                    <dd>{Array.isArray(r.v) ? <ol className="list-decimal space-y-0.5 pl-5">{r.v.map((x) => <li key={x}>{x}</li>)}</ol> : r.v}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
