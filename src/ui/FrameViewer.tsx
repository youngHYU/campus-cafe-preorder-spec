// 문서 C: 큰 프레임 + 번호별 구성 요소. 번호 위치는 실제 DOM 요소 위치에서 측정한다.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Anno, ScreenSpec } from '../spec'
import { StaticScreen } from './StaticScreen'

interface Box { no: string; x: number; y: number; w: number; h: number }
const W = 360, H = 760, PAD = 24

export function FrameViewer({ spec, selected, onSelect, onBoxes }: { spec: ScreenSpec; selected: string | null; onSelect: (no: string) => void; onBoxes?: (nos: string[]) => void }) {
  const viewport = useRef<HTMLDivElement>(null)
  const phone = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState(1)
  const [scale, setScale] = useState(1)
  const [manual, setManual] = useState(false)
  const [boxes, setBoxes] = useState<Box[]>([])
  const [hover, setHover] = useState<string | null>(null)

  const computeFit = useCallback(() => {
    const el = viewport.current
    if (!el) return
    const byW = (el.clientWidth - PAD * 2) / W
    const byH = (Math.max(560, window.innerHeight - 140) - PAD * 2) / H
    const f = Math.max(0.2, Math.min(1.6, byW, byH))
    setFit(f)
    if (!manual) setScale(f)
  }, [manual])

  useLayoutEffect(() => {
    computeFit()
    const ro = new ResizeObserver(computeFit)
    if (viewport.current) ro.observe(viewport.current)
    window.addEventListener('resize', computeFit)
    return () => { ro.disconnect(); window.removeEventListener('resize', computeFit) }
  }, [computeFit])

  // 실제 요소 위치 측정 (배율과 무관한 원본 좌표로 저장)
  const measure = useCallback(() => {
    const root = phone.current
    if (!root) return
    const scope: ParentNode = spec.id === 'P-01' ? root.querySelector('[role=dialog]') ?? root : root
    const r0 = root.getBoundingClientRect()
    const k = r0.width / W
    const list: Box[] = []
    scope.querySelectorAll<HTMLElement>('[data-anno]').forEach((el) => {
      const no = el.dataset.anno!
      const r = el.getBoundingClientRect()
      if (!r.width || !r.height) return
      // 화면 밖으로 잘린 요소는 보이는 부분만
      const y = Math.max(0, (r.top - r0.top) / k), y2 = Math.min(H, (r.bottom - r0.top) / k)
      if (y2 <= y) return
      list.push({ no, x: (r.left - r0.left) / k, y, w: r.width / k, h: y2 - y })
    })
    setBoxes(list)
    onBoxes?.([...new Set(list.map((b) => b.no))])
  }, [spec.id, onBoxes])

  useEffect(() => {
    setManual(false)
    const t = setTimeout(measure, 50)
    document.fonts?.ready.then(measure)
    return () => clearTimeout(t)
  }, [measure])
  useEffect(() => { measure() }, [scale, measure])

  const zoom = (v: number) => { setManual(true); setScale(Math.min(1.6, Math.max(Math.min(0.25, fit), v))) }
  const active = selected ?? hover
  const pct = Math.round(scale * 100)

  return (
    <div className="flex h-full flex-col">
      <div className="no-print flex flex-wrap items-center gap-2 border-b border-line px-4 py-2.5 text-[13px]">
        <button onClick={() => zoom(scale - 0.1)} className="h-8 w-8 rounded-lg border border-line" aria-label="축소">−</button>
        <input type="range" min={Math.round(Math.min(25, fit * 100))} max={160} value={pct} onChange={(e) => zoom(Number(e.target.value) / 100)}
          aria-label="배율" className="w-28 accent-[#16A34A]" />
        <button onClick={() => zoom(scale + 0.1)} className="h-8 w-8 rounded-lg border border-line" aria-label="확대">+</button>
        <span className="w-12 text-center tabular-nums">{pct}%</span>
        <button onClick={() => { setManual(false); setScale(fit) }} className="h-8 rounded-lg border border-line px-3">화면 맞춤</button>
        <span className="ml-auto text-[12px] text-sub">번호를 누르면 오른쪽 설명이 강조돼요</span>
      </div>
      <div ref={viewport} className="relative min-h-0 flex-1 overflow-auto bg-[#EEF0F3]" style={{ maxHeight: 'calc(100vh - 120px)' }}>
        <div style={{ width: W * scale + PAD * 2, height: H * scale + PAD * 2, padding: PAD }} className="mx-auto">
          <div style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: 'top left' }} className="relative">
            <div ref={phone}><StaticScreen id={spec.id} /></div>
            {boxes.map((b, i) => {
              const on = active === b.no
              return (
                <div key={b.no + i}>
                  <div className={`pointer-events-none absolute rounded-md ${on ? 'border-2 border-num bg-num/10' : ''}`}
                    style={{ left: b.x - 2, top: b.y - 2, width: b.w + 4, height: b.h + 4 }} />
                  <button
                    onClick={() => onSelect(b.no)} onMouseEnter={() => setHover(b.no)} onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover(b.no)} onBlur={() => setHover(null)}
                    aria-label={`구성 요소 ${b.no} ${spec.annos.find((a) => a.no === b.no)?.name ?? ''}`}
                    className={`absolute grid place-items-center rounded-full text-[11px] font-bold shadow ring-2 ring-white ${on ? 'bg-num text-white' : 'bg-num/90 text-white'}`}
                    style={{ left: b.x - 10, top: b.y - 10, width: 22, height: 22, transform: `scale(${Math.min(2.4, 1 / scale)})`, transformOrigin: 'center' }}
                  >{b.no}</button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <MissingNote annos={spec.annos} boxes={boxes} />
    </div>
  )
}

function MissingNote({ annos, boxes }: { annos: Anno[]; boxes: Box[] }) {
  const missing = annos.filter((a) => !boxes.some((b) => b.no === a.no))
  if (!missing.length) return null
  return <p className="border-t border-line px-4 py-2 text-[12px] text-sub">프레임에 영역 없음: {missing.map((m) => m.no).join(', ')} (설명 목록 참고)</p>
}

