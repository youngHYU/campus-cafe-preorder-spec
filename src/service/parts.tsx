// 공통 컴포넌트 C-01 ~ C-04 (화면 정의서 3장)
import type { ReactNode } from 'react'
import { cartCount, cartPrep, cartTotal, clockText, menuById, waitMinutes, waitText, won } from '../model'
import type { Actions, AppState } from './types'

export const baseWait = (st: AppState) => waitMinutes(st.queue, 0)
export const cartWait = (st: AppState) => waitMinutes(st.queue, cartPrep(st.cart))

export function updatedText(st: AppState) {
  const diff = Math.floor(st.now - st.queueUpdatedAt)
  return diff < 1 ? '방금 업데이트' : `${diff}분 전 업데이트`
}

/* C-01 L · 홈 예상 수령 시각 카드 */
export function EtaCardL({ st, act, anno }: { st: AppState; act: Actions; anno?: string }) {
  const w = baseWait(st)
  if (st.etaFail)
    return (
      <div data-anno={anno} className="rounded-2xl bg-soft p-5" role="status">
        <p className="text-[13px] text-sub">지금 주문하면</p>
        <p className="mt-2 text-[17px] font-bold">예상 시각을 불러오지 못했어요</p>
        <p className="mt-1 text-[13px] text-mid">마지막 값 · {waitText(w)} · {clockText(st.now + w)} ({updatedText(st)} 기준)</p>
        <button onClick={act.retryEta} className="mt-3 h-9 rounded-lg border border-ink px-3 text-[13px] font-bold">다시 시도</button>
      </div>
    )
  return (
    <div data-anno={anno} className="rounded-2xl bg-soft p-5" aria-live="polite">
      <p className="text-[13px] text-sub">지금 주문하면</p>
      <p className="mt-1 text-[30px] font-bold leading-[44px]">{waitText(w)}</p>
      <p className="text-[16px] font-medium">{clockText(st.now + w)} 수령 예상</p>
      <div className="mt-2 border-t border-line pt-1.5 text-[12px] text-sub">
        대기 주문 {st.queue.length}건 · {updatedText(st)}
      </div>
    </div>
  )
}

/* C-01 S · 메뉴 목록 상단 배너 */
export function EtaBannerS({ st, anno }: { st: AppState; anno?: string }) {
  const w = baseWait(st)
  return (
    <div data-anno={anno} className="flex h-11 items-center gap-2.5 rounded-xl bg-soft px-3.5 text-[14px] font-medium" aria-live="polite">
      <span className="h-[18px] w-[18px] rounded-full bg-mid" aria-hidden />
      {st.etaFail ? (
        <span className="text-sub">예상 시각을 불러오지 못했어요</span>
      ) : (
        <span>지금 주문 시 {waitText(w).replace(' 뒤', '')} · {clockText(st.now + w)} 수령</span>
      )}
    </div>
  )
}

/* C-01 M · 담기 직전 / 장바구니 요약 / 주문 현황 */
export function EtaInlineM({ label, wait, at, anno, fail }: { label: string; wait: number; at: number; anno?: string; fail?: boolean }) {
  return (
    <div data-anno={anno} aria-live="polite">
      <p className="text-[12px] text-sub">{label}</p>
      {fail ? (
        <p className="text-[15px] font-bold text-sub">예상 시각을 계산하지 못했어요</p>
      ) : (
        <p className="text-[16px] font-bold">{waitText(wait)} · {clockText(at)} 수령 예상</p>
      )}
    </div>
  )
}

/* C-02 메뉴 아이템 카드 (공통 틀 + 보조 정보/액션 슬롯) */
export function MenuCard({ thumb = 64, title, price, sub, action, dim, anno, onClick, label }: {
  thumb?: number; title: string; price?: string; sub?: ReactNode; action?: ReactNode; dim?: boolean; anno?: string; onClick?: () => void; label?: string
}) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      data-anno={anno}
      onClick={onClick}
      aria-label={label}
      disabled={onClick ? dim : undefined}
      className={`flex w-full items-center gap-3.5 text-left ${dim ? 'opacity-45' : ''}`}
    >
      <span className="shrink-0 rounded-xl bg-line" style={{ width: thumb, height: thumb }} aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium">{title}</span>
        {price && <span className="block text-[13px] text-sub">{price}</span>}
        {sub}
      </span>
      {action}
    </Tag>
  )
}

export const PrepChip = ({ prep, soldOut }: { prep: number; soldOut?: boolean }) => (
  <span className={`mt-1 inline-block rounded-full border px-2.5 py-[3px] text-[12px] ${soldOut ? 'border-ink bg-ink text-white' : 'border-mid text-sub'}`}>
    {soldOut ? '품절' : `제조 약 ${prep}분`}
  </span>
)

/* C-03 장바구니 바 */
export function CartBar({ st, act, anno }: { st: AppState; act: Actions; anno?: string }) {
  if (!st.cart.length) return null
  const w = cartWait(st)
  return (
    <button
      data-anno={anno}
      onClick={() => act.go({ s: 'S-04' })}
      className="absolute bottom-[86px] left-5 right-5 z-10 flex h-[58px] items-center justify-between rounded-[14px] bg-accent px-[18px] text-left text-white shadow-lg"
    >
      <span>
        <span className="block text-[15px] font-bold">{cartCount(st.cart)}개 · {won(cartTotal(st.cart))}</span>
        <span className="block text-[12px] opacity-85">{st.etaFail ? '예상 시각 확인 중' : `${clockText(st.now + w)} 수령 예상`}</span>
      </span>
      <span className="text-[14px] font-bold">장바구니 보기 →</span>
    </button>
  )
}

/* C-04 하단 탭 바 */
export function TabBar({ active, act, anno }: { active: 'home' | 'menu' | 'orders' | 'my'; act: Actions; anno?: string }) {
  const tabs = [
    { k: 'home', label: '홈', go: () => act.go({ s: 'S-01' }) },
    { k: 'menu', label: '메뉴', go: () => act.go({ s: 'S-02', cat: 'coffee' }) },
    { k: 'orders', label: '주문 현황', go: () => act.go({ s: 'S-05' }) },
    { k: 'my', label: '마이', go: () => {} },
  ] as const
  return (
    <nav data-anno={anno} className="absolute bottom-0 left-0 right-0 flex h-[77px] border-t border-line bg-white pt-[13px]" aria-label="하단 탭">
      {tabs.map((t) => (
        <button key={t.k} onClick={t.go} aria-current={active === t.k ? 'page' : undefined} disabled={t.k === 'my'}
          className="flex flex-1 flex-col items-center gap-1">
          <span className={`h-[22px] w-[22px] rounded-md ${active === t.k ? 'bg-ink' : 'bg-line'}`} aria-hidden />
          <span className={`text-[11px] ${active === t.k ? 'font-bold' : 'text-sub'}`}>{t.label}</span>
        </button>
      ))}
    </nav>
  )
}

export function TopBar({ title, onBack, anno }: { title: string; onBack?: () => void; anno?: string }) {
  return (
    <div data-anno={anno} className="flex h-[29px] items-center gap-3">
      {onBack && <button onClick={onBack} aria-label="뒤로가기" className="text-[20px] leading-none">←</button>}
      <h1 className="text-[18px] font-bold">{title}</h1>
    </div>
  )
}

export const menuName = (id: string) => menuById(id).name
