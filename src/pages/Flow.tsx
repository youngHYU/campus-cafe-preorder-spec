import { CHECKS, COMPONENTS, SCREENS } from '../spec'
import { MiniPreview } from '../ui/StaticScreen'

export function FlowPage({ nav }: { nav: (h: string) => void }) {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-line bg-white p-6">
        <h1 className="text-[22px] font-bold">전체 흐름</h1>
        <p className="mt-1 text-[14px] text-sub">2주차 User Flow 원문 기준. 판단 지점은 주문 전(S-01)과 결제 직전(S-04 · P-01) 두 번이며, 두 지점 모두 주문하지 않고 빠지는 길을 둔다.</p>
        <ol className="mt-4 flex flex-wrap items-center gap-2 text-[13px]">
          {[['주문 전 판단', 'S-01 홈'], ['주문', 'S-02 메뉴 목록 → S-03 메뉴 상세 → S-04 장바구니 · 결제 (→ P-01)'], ['수령', 'S-05 주문 현황 → 제조 완료 알림']].map(([k, v], i) => (
            <li key={k} className="flex items-center gap-2">
              {i > 0 && <span className="text-mid">→</span>}
              <span className="rounded-lg bg-docSoft px-2 py-1 font-bold text-doc">{k}</span><span>{v}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {SCREENS.map((s) => (
          <article key={s.id} className="flex flex-col rounded-2xl border border-line bg-white p-5 print-break">
            <p className="text-[12px] font-medium text-sub"><span className="rounded bg-ink px-1.5 py-0.5 text-white">{s.id}</span> · {s.type}</p>
            <h2 className="mt-2 text-[18px] font-bold">{s.name}</h2>
            <div className="mt-3 flex justify-center rounded-xl bg-[#EEF0F3] py-4"><MiniPreview id={s.id} scale={0.42} /></div>
            <p className="mt-3 text-[14px]">{s.purpose}</p>
            <p className="mt-2 text-[12px] text-sub">다음 이동 · {s.next.map((n) => SCREENS.find((x) => x.id === n)?.name ? `${n} ${SCREENS.find((x) => x.id === n)!.name}` : n).join(' / ')}</p>
            <div className="mt-auto flex gap-2 pt-4">
              <button onClick={() => nav(`#/docs/${s.id}`)} className="h-10 flex-1 rounded-lg bg-doc text-[14px] font-bold text-white">문서 보기</button>
              <button onClick={() => nav(`#/demo/${s.id}`)} className="h-10 flex-1 rounded-lg border border-ink text-[14px] font-bold">시연하기</button>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-6">
          <h2 className="text-[17px] font-bold">공통 컴포넌트 <span className="text-[13px] font-normal text-sub">· 2주차 피드백 반영</span></h2>
          <ul className="mt-3 divide-y divide-line text-[14px]">
            {COMPONENTS.map((c) => (
              <li key={c.id} className="py-2.5"><b>{c.id} {c.name}</b><p className="text-[13px] text-sub">{c.screens} · {c.diff}</p></li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-line bg-white p-6">
          <h2 className="text-[17px] font-bold">확인 필요 목록</h2>
          <ul className="mt-3 divide-y divide-line text-[14px]">
            {CHECKS.map(([k, id, v]) => (
              <li key={k} className="py-2.5"><b>{k}</b> <span className="text-[12px] text-sub">{id}</span><p className="text-[13px] text-sub">{v}</p></li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
