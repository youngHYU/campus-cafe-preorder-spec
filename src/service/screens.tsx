// 실제 서비스 화면 S-01 ~ S-05, P-01. 문서(정적)와 시연(동작)이 같은 컴포넌트를 공유한다.
import { useState, type ReactNode } from 'react'
import {
  CATEGORIES, MAX_QTY, MAX_SHOTS, MENUS, STAGES, cartPrep, cartTotal, clockText, itemTotal, menuById, optionText,
  orderSummary, shortClock, unitPrice, waitMinutes, won, type Category, type Size, type Temp,
} from '../model'
import { CartBar, EtaBannerS, EtaCardL, EtaInlineM, MenuCard, PrepChip, TabBar, TopBar, cartWait, menuName } from './parts'
import type { Actions, AppState, Route } from './types'

type P = { st: AppState; act: Actions }

export function Phone({ st, act, children }: P & { children: ReactNode }) {
  return (
    <div className="relative h-[760px] w-[360px] overflow-hidden rounded-[28px] border border-mid bg-white">
      <div className="flex h-11 items-center justify-between px-7 text-[13px] font-medium">
        <span>{shortClock(st.now)}</span>
        <span className="h-3 w-11 rounded bg-line" aria-hidden />
      </div>
      {children}
      {st.banner && (
        <div role="status" className="absolute left-3 right-3 top-12 z-30 rounded-2xl bg-ink px-4 py-3 text-white shadow-xl">
          <p className="text-[12px] opacity-70">알림</p>
          <p className="text-[14px] font-bold">{st.banner}</p>
        </div>
      )}
      {st.toast && (
        <div role="status" className="absolute bottom-[150px] left-5 right-5 z-20 flex h-[46px] items-center justify-between rounded-xl bg-ink px-4 text-[14px] text-white">
          <span className="font-medium">{st.toast.text}</span>
          {st.toast.action && (
            <button onClick={act.toastAction} className="font-bold text-[#8CB3FF]">{st.toast.action === 'cart' ? '보기' : '되돌리기'}</button>
          )}
        </div>
      )}
    </div>
  )
}

const Body = ({ children, pb = 100 }: { children: ReactNode; pb?: number }) => (
  <div className="no-scrollbar absolute inset-x-0 bottom-0 top-11 overflow-y-auto px-5 pt-3" style={{ paddingBottom: pb }}>{children}</div>
)

const BagIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M5.5 7.5h13l-1.1 12.5H6.6L5.5 7.5Z" stroke="#1C1C21" strokeWidth="2" strokeLinejoin="round" />
    <path d="M9 7.5V7a3 3 0 0 1 6 0v.5" stroke="#1C1C21" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

/* S-01 홈 */
export function HomeScreen({ st, act }: P) {
  const active = st.orders.find((o) => o.stage < 3)
  const count = st.cart.reduce((s, i) => s + i.qty, 0)
  return (
    <>
      <Body pb={st.cart.length ? 160 : 100}>
        <div className="flex h-[26px] items-center justify-between">
          <span data-anno="01" className="text-[18px] font-bold">학생회관 1층 카페 <span className="text-[12px]">▾</span></span>
          <button data-anno="02" onClick={() => act.go({ s: 'S-04' })} aria-label={`장바구니, ${count}개 담김`} className="relative">
            <BagIcon />
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-white">{count}</span>
            )}
          </button>
        </div>
        <div className="mt-4"><EtaCardL st={st} act={act} anno="03" /></div>
        <button data-anno="04" onClick={() => act.go({ s: 'S-02', cat: 'coffee' })} className="mt-4 h-[52px] w-full rounded-xl bg-ink text-[15px] font-bold text-white">
          메뉴 보고 주문하기
        </button>
        {active && (
          <button data-anno="05" onClick={() => act.go({ s: 'S-05' })} className="mt-4 flex w-full items-center justify-between rounded-2xl border border-ink px-4 py-3 text-left">
            <span>
              <span className="block text-[12px] text-sub">진행 중인 주문 {active.no}</span>
              <span className="block text-[15px] font-bold">{STAGES[active.stage]} · {Math.max(0, Math.ceil(active.eta - st.now))}분 남음</span>
            </span>
            <span className="text-[13px] font-medium">현황 보기 →</span>
          </button>
        )}
        {st.recent && (
          <>
            <h2 className="mt-4 text-[15px] font-bold">최근 주문</h2>
            <div data-anno="06" className="mt-3 rounded-2xl border border-line p-[15px]">
              <MenuCard thumb={48} title={orderSummary(st.recent.items)} price={won(st.recent.total)}
                action={<button onClick={act.reorder} className="rounded-full border border-mid px-[11px] py-[5px] text-[12px] font-medium text-sub">다시 담기</button>} />
            </div>
          </>
        )}
        <h2 className="mt-4 text-[15px] font-bold">카테고리</h2>
        <div data-anno="07" className="mt-3 grid grid-cols-4 gap-2.5">
          {CATEGORIES.map((c) => (
            <button key={c.key} onClick={() => act.go({ s: 'S-02', cat: c.key })} className="flex flex-col items-center gap-1.5">
              <span className="h-14 w-full rounded-xl bg-soft" aria-hidden />
              <span className="text-[12px]">{c.label}</span>
            </button>
          ))}
        </div>
      </Body>
      <CartBar st={st} act={act} anno="08" />
      <TabBar active="home" act={act} anno="09" />
    </>
  )
}

/* S-02 메뉴 목록 */
export function MenuListScreen({ st, act, cat }: P & { cat: Category }) {
  const list = MENUS.filter((m) => m.category === cat)
  return (
    <>
      <div className="absolute inset-x-0 top-11 z-[5] bg-white px-5 pb-2 pt-3">
        <h1 data-anno="01" className="text-[18px] font-bold">메뉴</h1>
        <div className="mt-4"><EtaBannerS st={st} anno="02" /></div>
        <div data-anno="03" role="tablist" className="mt-4 flex gap-5">
          {CATEGORIES.map((c) => (
            <button key={c.key} role="tab" aria-selected={c.key === cat} onClick={() => act.go({ s: 'S-02', cat: c.key })}
              className={`border-b-2 pb-1.5 text-[15px] ${c.key === cat ? 'border-ink font-bold' : 'border-transparent text-sub'}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div className="no-scrollbar absolute inset-x-0 bottom-0 top-[200px] overflow-y-auto px-5" style={{ paddingBottom: st.cart.length ? 160 : 100 }}>
        <div data-anno="04" className="divide-y divide-line">
          {list.map((m) => (
            <div key={m.id} className="py-3.5">
              <MenuCard title={m.name} price={won(m.price)} dim={m.soldOut} label={`${m.name} ${won(m.price)} ${m.soldOut ? '품절' : `제조 약 ${m.prep}분`}`}
                onClick={() => act.go({ s: 'S-03', menuId: m.id })} sub={<PrepChip prep={m.prep} soldOut={m.soldOut} />} />
            </div>
          ))}
          {!list.length && <p className="py-10 text-center text-sub">준비 중인 메뉴가 없어요</p>}
        </div>
      </div>
      <CartBar st={st} act={act} anno="05" />
      <TabBar active="menu" act={act} anno="06" />
    </>
  )
}

const Opt = ({ on, children, onClick, label }: { on: boolean; children: ReactNode; onClick: () => void; label: string }) => (
  <button role="radio" aria-checked={on} aria-label={label} onClick={onClick}
    className={`h-[43px] flex-1 rounded-[10px] border text-[14px] ${on ? 'border-ink font-bold' : 'border-line text-sub'}`}>{children}</button>
)
const Step = ({ value, set, min, max, label }: { value: number; set: (n: number) => void; min: number; max: number; label: string }) => (
  <span className="flex items-center gap-3 text-[15px]">
    <button aria-label={`${label} 줄이기`} disabled={value <= min} onClick={() => set(value - 1)} className="w-6 disabled:text-line">−</button>
    <span className="w-4 text-center font-medium" aria-live="polite">{value}</span>
    <button aria-label={`${label} 늘리기`} disabled={value >= max} onClick={() => set(value + 1)} className="w-6 disabled:text-line">+</button>
  </span>
)

/* S-03 메뉴 상세 */
export function DetailScreen({ st, act, menuId, cartItemId, preset }: P & { menuId: string; cartItemId?: string; preset?: { temp: Temp | null } }) {
  const m = menuById(menuId)
  const editing = cartItemId ? st.cart.find((c) => c.id === cartItemId) : undefined
  const [temp, setTemp] = useState<Temp | null>(editing?.temp ?? preset?.temp ?? (m.temps.length === 1 ? m.temps[0] : null))
  const [size, setSize] = useState<Size>(editing?.size ?? 'Regular')
  const [shots, setShots] = useState(editing?.shots ?? 0)
  const [qty, setQty] = useState(editing?.qty ?? 1)
  const [busy, setBusy] = useState(false)
  const others = st.cart.filter((c) => c.id !== cartItemId)
  const wait = waitMinutes(st.queue, cartPrep(others) + m.prep * qty)
  const needTemp = m.temps.length > 0 && !temp
  const disabled = needTemp || !!m.soldOut || busy
  const price = unitPrice({ menuId, size, shots }) * qty
  const add = () => {
    if (disabled) return
    setBusy(true)
    act.addToCart({ menuId, temp: m.temps.length ? temp : null, size, shots, qty }, st.now + wait, cartItemId)
  }
  return (
    <>
      <Body pb={170}>
        <TopBar title={m.name} onBack={act.back} anno="01" />
        <div data-anno="02" className="mt-3.5 grid h-[150px] place-items-center rounded-2xl bg-soft text-[12px] text-mid">메뉴 이미지</div>
        <div data-anno="03" className="mt-3.5 flex items-center justify-between">
          <div>
            <p className="text-[20px] font-bold">{m.name}</p>
            <p className="text-[14px] text-sub">{won(m.price)}</p>
          </div>
          <PrepChip prep={m.prep} soldOut={m.soldOut} />
        </div>
        {m.temps.length > 0 && (
          <div data-anno="04" className="mt-3.5">
            <p className="text-[14px] font-medium">온도 <span className="text-sub">(필수)</span></p>
            <div role="radiogroup" aria-label="온도" className="mt-3.5 flex gap-2">
              {(['HOT', 'ICE'] as Temp[]).map((t) => (
                m.temps.includes(t)
                  ? <Opt key={t} on={temp === t} onClick={() => setTemp(t)} label={t}>{t}</Opt>
                  : <span key={t} className="grid h-[43px] flex-1 place-items-center rounded-[10px] border border-dashed border-line text-[13px] text-line">{t} 없음</span>
              ))}
            </div>
            {needTemp && <p className="mt-1.5 text-[12px] text-accent">온도를 선택해 주세요</p>}
          </div>
        )}
        {m.category !== 'dessert' && (
          <>
            <div data-anno="05" className="mt-3.5">
              <p className="text-[14px] font-medium">사이즈</p>
              <div role="radiogroup" aria-label="사이즈" className="mt-3.5 flex gap-2">
                <Opt on={size === 'Regular'} onClick={() => setSize('Regular')} label="Regular">Regular</Opt>
                <Opt on={size === 'Large'} onClick={() => setSize('Large')} label="Large 500원 추가">Large +500</Opt>
              </div>
            </div>
            <div data-anno="06" className="mt-3.5 flex items-center justify-between">
              <span className="text-[14px] font-medium">샷 추가 <span className="text-[12px] text-sub">+500원</span></span>
              <Step value={shots} set={setShots} min={0} max={MAX_SHOTS} label="샷" />
            </div>
          </>
        )}
        <div data-anno="07" className="mt-3.5 flex items-center justify-between">
          <span className="text-[14px] font-medium">수량</span>
          <Step value={qty} set={setQty} min={1} max={MAX_QTY} label="수량" />
        </div>
      </Body>
      <div className="absolute inset-x-0 bottom-0 border-t border-line bg-white px-5 pb-7 pt-4">
        <EtaInlineM label={editing ? '이렇게 바꾸면' : '이 메뉴를 담으면'} wait={wait} at={st.now + wait} anno="08" fail={st.etaFail} />
        <button data-anno="09" onClick={add} disabled={disabled}
          className="mt-3 h-[52px] w-full rounded-xl bg-ink text-[15px] font-bold text-white disabled:bg-line disabled:text-sub">
          {m.soldOut ? '품절되었어요' : busy ? '담는 중…' : editing ? `${won(price)} 변경하기` : `${won(price)} 담기`}
        </button>
      </div>
    </>
  )
}

/* S-04 장바구니 · 결제 (+ P-01 팝업) */
export function CartScreen({ st, act }: P) {
  const w = cartWait(st)
  const hasSoldOut = st.cart.some((c) => menuById(c.menuId).soldOut)
  if (!st.cart.length)
    return (
      <Body>
        <TopBar title="장바구니" onBack={act.back} anno="01" />
        <div className="mt-40 text-center">
          <p className="text-[16px] font-bold">장바구니가 비어 있어요</p>
          <button onClick={() => act.go({ s: 'S-02', cat: 'coffee' })} className="mt-4 h-11 rounded-xl border border-ink px-5 text-[14px] font-bold">메뉴 보러 가기</button>
        </div>
      </Body>
    )
  return (
    <>
      <Body pb={150}>
        <TopBar title="장바구니" onBack={act.back} anno="01" />
        {st.cartNotice && (
          <div data-anno="02" role="status" className="mt-3.5 flex gap-2.5 rounded-xl border border-ink px-4 py-3 text-[13px]">
            <span className="font-bold">!</span>
            <span>메뉴를 고르는 사이 주문이 늘어 수령 예상 시각이 <b>{shortClock(st.cartNotice.from)} → {shortClock(st.cartNotice.to)}</b>로 바뀌었어요</span>
          </div>
        )}
        <ul data-anno="03" className="mt-3.5 space-y-3.5">
          {st.cart.map((c) => {
            const m = menuById(c.menuId)
            return (
              <li key={c.id}>
                <MenuCard thumb={48} title={menuName(c.menuId)} dim={m.soldOut}
                  sub={<span className="block text-[12px] text-sub">{optionText(c)}{m.soldOut && <b className="ml-1 text-ink">· 품절</b>}</span>}
                  action={<span className="text-[14px] font-medium">{won(itemTotal(c))}</span>} />
                <div className="mt-1.5 flex items-center justify-between pl-[62px] text-[12px]">
                  <span className="flex gap-3 text-sub">
                    <button onClick={() => act.go({ s: 'S-03', menuId: c.menuId, cartItemId: c.id })} className="underline">옵션 변경</button>
                    <button onClick={() => act.remove(c.id)} className="underline">삭제</button>
                  </span>
                  <span className="flex items-center gap-2.5 rounded-full border border-line px-2.5 py-0.5 text-[13px]">
                    <button aria-label={`${m.name} 수량 줄이기`} disabled={c.qty <= 1} onClick={() => act.changeQty(c.id, -1)} className="disabled:text-line">−</button>
                    <span>{c.qty}</span>
                    <button aria-label={`${m.name} 수량 늘리기`} disabled={c.qty >= MAX_QTY} onClick={() => act.changeQty(c.id, 1)} className="disabled:text-line">+</button>
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
        <div data-anno="04" className="mt-3.5 space-y-1.5 rounded-xl bg-soft p-[18px] text-[13px]">
          <div className="flex justify-between"><span className="text-sub">수령 예상</span>
            <b className="text-[15px]">{st.etaFail ? '계산 중…' : `${clockText(st.now + w)} (약 ${w}분 뒤)`}</b></div>
          <div className="flex justify-between"><span className="text-sub">총 결제 금액</span><b className="text-[15px]">{won(cartTotal(st.cart))}</b></div>
        </div>
        <p className="mt-3.5 text-[14px] font-medium">결제 수단</p>
        <div data-anno="05" role="radiogroup" aria-label="결제 수단" className="mt-3 space-y-3 text-[14px]">
          {([['easy', '간편결제'], ['card', '신용 · 체크카드']] as const).map(([k, l]) => (
            <button key={k} role="radio" aria-checked={st.payMethod === k} onClick={() => act.setPay(k)} className="flex items-center gap-2.5">
              <span className={`h-[18px] w-[18px] rounded-full border-2 ${st.payMethod === k ? 'border-[5px] border-ink' : 'border-mid'}`} aria-hidden />{l}
            </button>
          ))}
        </div>
        {hasSoldOut && <p className="mt-3 text-[12px] font-medium text-accent">품절된 메뉴를 삭제하면 결제할 수 있어요</p>}
      </Body>
      <div className="absolute inset-x-0 bottom-0 bg-white px-5 pb-6 pt-4">
        <button data-anno="06" onClick={act.pressPay} disabled={!st.payMethod || st.paying || hasSoldOut}
          className="h-[52px] w-full rounded-xl bg-ink text-[15px] font-bold text-white disabled:bg-line disabled:text-sub">
          {st.paying ? '결제 중…' : `${won(cartTotal(st.cart))} 결제하기`}
        </button>
        <button data-anno="07" onClick={act.keepCart} disabled={st.paying} className="mt-3 w-full text-[13px] text-sub">다음에 주문하기 (장바구니 보관)</button>
      </div>
      {st.popup && <PayPopup st={st} act={act} />}
    </>
  )
}

export function PayPopup({ st, act }: P) {
  if (!st.popup) return null
  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-black/45" onClick={act.closePopup}>
      <div role="dialog" aria-modal="true" aria-labelledby="p01-title" onClick={(e) => e.stopPropagation()} className="w-[300px] space-y-3 rounded-[20px] bg-white px-6 pb-5 pt-7">
        <h2 id="p01-title" data-anno="01" className="text-[18px] font-bold">수령 예상 시각이 또 바뀌었어요</h2>
        <p className="text-[14px] text-sub">결제하려는 사이 주문이 늘었어요</p>
        <div data-anno="02" className="flex items-center justify-center gap-2 rounded-xl bg-soft py-3">
          <span className="text-[16px] text-sub">{clockText(st.popup.from)}</span><b className="text-sub">→</b>
          <b className="text-[20px] text-accent">{clockText(st.popup.to)}</b>
        </div>
        <button data-anno="03" autoFocus onClick={act.confirmPay} className="h-12 w-full rounded-xl bg-ink text-[15px] font-bold text-white">그래도 결제하기</button>
        <button data-anno="04" onClick={act.keepCart} className="w-full pt-1 text-[14px] font-medium text-sub">다음에 주문하기 (장바구니 보관)</button>
      </div>
    </div>
  )
}

/* S-05 주문 현황 */
export function OrderScreen({ st, act }: P) {
  const o = [...st.orders].reverse().find((x) => x.stage < 3)
  if (!o)
    return (
      <>
        <Body>
          <h1 className="text-[18px] font-bold">주문 현황</h1>
          <div className="mt-40 text-center">
            <p className="text-[16px] font-bold">진행 중인 주문이 없어요</p>
            <button onClick={() => act.go({ s: 'S-02', cat: 'coffee' })} className="mt-4 h-11 rounded-xl border border-ink px-5 text-[14px] font-bold">메뉴 보러 가기</button>
          </div>
        </Body>
        <TabBar active="orders" act={act} />
      </>
    )
  const remain = Math.ceil(o.eta - st.now)
  const late = remain <= 0 && o.stage < 2
  return (
    <>
      <Body>
        <h1 data-anno="01" className="text-[18px] font-bold">주문 현황</h1>
        <div data-anno="02" className="mt-4 rounded-2xl bg-soft py-5 text-center">
          <p className="text-[12px] text-sub">주문번호</p>
          <p className="text-[36px] font-bold leading-[52px]">{o.no}</p>
        </div>
        <ol data-anno="03" className="mx-auto mt-4 flex w-[260px] items-start justify-between" aria-label={`현재: ${STAGES[o.stage]}`}>
          {STAGES.map((s, i) => (
            <li key={s} className="relative flex w-12 flex-col items-center gap-1.5">
              <span className={`h-6 w-6 rounded-full border-2 border-ink ${i <= o.stage ? 'bg-ink' : 'bg-white'}`} aria-hidden />
              <span className={`text-[12px] ${i === o.stage ? 'font-bold' : 'text-sub'}`}>{s}</span>
              {i < 2 && <span className={`absolute left-[38px] top-[11px] h-0.5 w-[70px] ${i < o.stage ? 'bg-ink' : 'bg-line'}`} aria-hidden />}
            </li>
          ))}
        </ol>
        <div data-anno="04" className="mt-5 text-center" aria-live="polite">
          {o.stage === 2 ? (
            <><p className="text-[22px] font-bold">음료가 나왔어요</p><p className="text-[14px] text-sub">픽업대에서 받아 가세요</p></>
          ) : late ? (
            <><p className="text-[22px] font-bold">조금 늦어지고 있어요</p><p className="text-[14px] text-sub">새 예상 {clockText(Math.floor(st.now) + 2)}</p></>
          ) : (
            <><p className="text-[28px] font-bold">약 {remain}분 남음</p><p className="text-[14px] text-sub">{clockText(o.eta)} 수령 예상</p></>
          )}
        </div>
        <div data-anno="05" className="mt-4 flex justify-between border-t border-line py-3.5 text-[13px]">
          <span className="text-sub">수령 위치</span><span>학생회관 1층 픽업대</span>
        </div>
        <div data-anno="06" className="flex items-center justify-between border-t border-line py-3.5 text-[13px]">
          <span>음료가 나오면 알림 받기</span>
          <button role="switch" aria-checked={st.notify} aria-label="음료가 나오면 알림 받기" onClick={() => act.setNotify(!st.notify)}
            className={`relative h-6 w-10 rounded-full ${st.notify ? 'bg-ink' : 'bg-line'}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${st.notify ? 'left-[18px]' : 'left-0.5'}`} />
          </button>
        </div>
        <div data-anno="07" className="flex justify-between border-t border-line py-3.5 text-[13px]">
          <span>{orderSummary(o.items)}{o.items.length > 1 ? '건' : ''}</span><span>{won(o.total)}</span>
        </div>
      </Body>
      <TabBar active="orders" act={act} anno="08" />
    </>
  )
}

export function ScreenFor({ route, st, act }: P & { route: Route }) {
  switch (route.s) {
    case 'S-01': return <HomeScreen st={st} act={act} />
    case 'S-02': return <MenuListScreen st={st} act={act} cat={route.cat} />
    case 'S-03': return <DetailScreen key={route.menuId + (route.cartItemId ?? '')} st={st} act={act} menuId={route.menuId} cartItemId={route.cartItemId} preset={route.temp ? { temp: route.temp } : undefined} />
    case 'S-04': return <CartScreen st={st} act={act} />
    case 'S-05': return <OrderScreen st={st} act={act} />
  }
}
