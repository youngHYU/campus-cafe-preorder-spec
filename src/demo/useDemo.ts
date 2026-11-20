// 시연하기 상태 관리. 실제 서버 대신 Mock 대기열 · 시연 시계를 쓴다.
import { useCallback, useEffect, useRef, useState } from 'react'
import { DEMO_START, MAX_QTY, cartPrep, cartTotal, menuById, waitMinutes, type CartItem } from '../model'
import type { ScreenId } from '../spec'
import { baseState, snapshot } from '../service/snapshots'
import type { Actions, AppState, Route } from '../service/types'

const CART_KEY = 'cafe-demo-cart-v1'
const loadCart = (): CartItem[] => {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]') } catch { return [] }
}
const saveCart = (c: CartItem[]) => { try { localStorage.setItem(CART_KEY, JSON.stringify(c)) } catch { /* 저장 불가 환경 */ } }

let seq = 0
const uid = () => `i${Date.now().toString(36)}${seq++}`

export function initialFor(id: ScreenId): { st: AppState; route: Route } {
  const st = { ...baseState(), cart: loadCart() }
  const snap = snapshot(id)
  // 개별 화면 직접 진입용 목업 초기 상태
  if (id === 'S-04' || id === 'P-01') {
    const cart = st.cart.length ? st.cart : snap.st.cart.map((c) => ({ ...c, seenEta: DEMO_START + 13 }))
    if (id === 'P-01') return { st: { ...snap.st, cart }, route: { s: 'S-04' } }
    return { st: { ...st, cart }, route: { s: 'S-04' } }
  }
  if (id === 'S-05') return { st: { ...st, orders: snap.st.orders.map((o) => ({ ...o, eta: DEMO_START + 9 })) }, route: { s: 'S-05' } }
  return { st, route: snap.route }
}

export function useDemo(startId: ScreenId) {
  const init = useRef(initialFor(startId))
  const [st, setSt] = useState<AppState>(init.current.st)
  const [stack, setStack] = useState<Route[]>(init.current.route.s === 'S-01' ? [init.current.route] : [{ s: 'S-01' }, init.current.route])
  const route = stack[stack.length - 1]
  const startedAt = useRef(Date.now())
  const removed = useRef<{ item: CartItem; index: number } | null>(null)
  const timers = useRef<number[]>([])
  const stRef = useRef(st)
  stRef.current = st

  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)) }
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  useEffect(() => saveCart(st.cart), [st.cart])

  const cartEta = (s: AppState) => s.now + waitMinutes(s.queue, cartPrep(s.cart))

  // S-04 진입 · 30초 갱신 시 비교 (F-ETA-03)
  const checkCart = useCallback((s: AppState): AppState => {
    if (!s.cart.length || s.etaFail) return s
    const eta = Math.floor(cartEta(s))
    const base = s.cartShownEta ?? Math.max(...s.cart.map((c) => Math.floor(c.seenEta)))
    const notice = eta - base >= 1 ? { from: base, to: eta } : eta === base ? s.cartNotice : null
    return { ...s, cartShownEta: eta, cartNotice: notice }
  }, [])

  const routeRef = useRef(route)
  routeRef.current = route
  useEffect(() => { if (routeRef.current.s === 'S-04' && !stRef.current.popup) setSt((s) => checkCart(s)) }, [checkCart])

  // 시연 시계 (실제 1초 = 1초) + 30초마다 예상 시각 갱신
  useEffect(() => {
    const t = window.setInterval(() => {
      setSt((s) => {
        const now = init.current.st.now + (Date.now() - startedAt.current) / 60000
        let next: AppState = { ...s, now }
        if (!s.etaFail && now - s.queueUpdatedAt >= 0.5) {
          next = { ...next, queueUpdatedAt: now }
          if (routeRef.current.s === 'S-04') next = checkCart(next)
        }
        return next
      })
    }, 1000)
    return () => clearInterval(t)
  }, [checkCart])

  const toastId = useRef(0)
  const toast = (text: string, action?: 'cart' | 'undo') => {
    const id = ++toastId.current
    setSt((s) => ({ ...s, toast: { text, action } }))
    later(() => { if (toastId.current === id) setSt((s) => ({ ...s, toast: null })) }, 3000)
  }

  const go = (r: Route) => {
    setStack((k) => (r.s === 'S-01' ? [r] : [...k, r]))
    if (r.s === 'S-04') setSt((s) => checkCart(s))
  }
  const reset = (r: Route) => { setStack(r.s === 'S-01' ? [r] : [{ s: 'S-01' }, r]); if (r.s === 'S-04') setSt((s) => checkCart(s)) }

  const merge = (cart: CartItem[], item: Omit<CartItem, 'id'>, skipId?: string): { cart: CartItem[]; capped: boolean } => {
    const same = cart.find((c) => c.id !== skipId && c.menuId === item.menuId && c.temp === item.temp && c.size === item.size && c.shots === item.shots)
    if (!same) return { cart: [...cart, { ...item, id: uid() }], capped: false }
    const qty = Math.min(MAX_QTY, same.qty + item.qty)
    return { cart: cart.map((c) => (c === same ? { ...c, qty, seenEta: item.seenEta } : c)), capped: same.qty + item.qty > MAX_QTY }
  }

  const act: Actions = {
    go,
    back: () => setStack((k) => (k.length > 1 ? k.slice(0, -1) : k)),
    addToCart: (item, seenEta, editId) => {
      later(() => {
        let capped = false
        setSt((s) => {
          const base = editId ? s.cart.filter((c) => c.id !== editId) : s.cart
          const r = merge(editId ? base : s.cart, { ...item, seenEta })
          capped = r.capped
          let cart = r.cart
          if (editId) { // 같은 위치 유지
            const idx = s.cart.findIndex((c) => c.id === editId)
            const moved = cart[cart.length - 1]
            if (moved && !base.includes(moved) && idx >= 0) cart = [...cart.slice(0, -1).slice(0, idx), moved, ...cart.slice(0, -1).slice(idx)]
          }
          return { ...s, cart, cartShownEta: editId ? s.cartShownEta : null }
        })
        if (editId) { setStack((k) => k.slice(0, -1)); setSt((s) => checkCart(s)); return }
        setStack((k) => (k.length > 1 && k[k.length - 2].s === 'S-02' ? k.slice(0, -1) : [...k.slice(0, -1), { s: 'S-02', cat: menuById(item.menuId).category }]))
        later(() => toast(capped ? '한 메뉴는 10개까지 담을 수 있어요' : '장바구니에 담았어요', 'cart'), 0)
      }, 400)
    },
    changeQty: (id, d) => setSt((s) => checkCart({ ...s, cart: s.cart.map((c) => (c.id === id ? { ...c, qty: Math.max(1, Math.min(MAX_QTY, c.qty + d)) } : c)) })),
    remove: (id) => {
      setSt((s) => {
        const index = s.cart.findIndex((c) => c.id === id)
        removed.current = { item: s.cart[index], index }
        return checkCart({ ...s, cart: s.cart.filter((c) => c.id !== id) })
      })
      toast('삭제했어요', 'undo')
    },
    undo: () => {
      const r = removed.current
      if (!r) return
      setSt((s) => ({ ...s, toast: null, cart: [...s.cart.slice(0, r.index), r.item, ...s.cart.slice(r.index)] }))
      removed.current = null
    },
    reorder: () => {
      const s = stRef.current
      if (!s.recent) return
      const ok = s.recent.items.filter((i) => !menuById(i.menuId).soldOut)
      if (!ok.length) { toast('모두 품절이라 담지 못했어요'); return }
      const seen = s.now + waitMinutes(s.queue, cartPrep([...s.cart, ...ok]))
      setSt((x) => {
        let cart = x.cart
        for (const i of ok) cart = merge(cart, { ...i, seenEta: seen }).cart
        return { ...x, cart, cartShownEta: null }
      })
      const skipped = s.recent.items.length - ok.length
      toast(skipped ? `품절 ${skipped}개는 빼고 담았어요` : '최근 주문을 담았어요', 'cart')
    },
    setPay: (m) => setSt((s) => ({ ...s, payMethod: m })),
    pressPay: () => {
      const s = stRef.current
      if (s.paying) return
      const eta = Math.floor(cartEta(s))
      if (!s.etaFail && s.cartShownEta != null && eta - s.cartShownEta >= 1) {
        setSt((x) => ({ ...x, popup: { from: x.cartShownEta!, to: eta } }))
        return
      }
      act.confirmPay()
    },
    confirmPay: () => {
      const s0 = stRef.current
      if (s0.paying) return
      setSt((s) => ({ ...s, popup: null, paying: true, cartShownEta: s.popup ? s.popup.to : s.cartShownEta }))
      later(() => {
        const s = stRef.current
        if (s.payFail) {
          setSt((x) => ({ ...x, paying: false }))
          toast('결제에 실패했어요. 다시 시도해 주세요')
          return
        }
        const no = `A-${127 + s.orders.length}`
        const wait = waitMinutes(s.queue, cartPrep(s.cart))
        const order = { no, total: cartTotal(s.cart), eta: s.now + wait, stage: 0 as const, items: s.cart.map(({ seenEta: _x, ...i }) => i) }
        setSt((x) => ({ ...x, paying: false, cart: [], cartShownEta: null, cartNotice: null, orders: [...x.orders, order], queue: [...x.queue, cartPrep(x.cart)] }))
        reset({ s: 'S-05' })
        later(() => setSt((x) => ({ ...x, orders: x.orders.map((o) => (o.no === no && o.stage === 0 ? { ...o, stage: 1 } : o)) })), 5000)
      }, 900)
    },
    keepCart: () => {
      setSt((s) => ({ ...s, popup: null }))
      reset({ s: 'S-01' })
      toast('장바구니에 보관했어요')
    },
    closePopup: () => setSt((s) => ({ ...s, popup: null, cartShownEta: s.popup?.to ?? s.cartShownEta, cartNotice: s.popup ? { from: s.popup.from, to: s.popup.to } : s.cartNotice })),
    setNotify: (v) => setSt((s) => ({ ...s, notify: v })),
    retryEta: () => setSt((s) => ({ ...s, etaFail: false, queueUpdatedAt: s.now })),
    toastAction: () => {
      const t = stRef.current.toast
      setSt((s) => ({ ...s, toast: null }))
      if (t?.action === 'cart') go({ s: 'S-04' })
      if (t?.action === 'undo') act.undo()
    },
  }

  // 시연 컨트롤 (매장 · 다른 학생 쪽 이벤트를 대신 발생)
  const control = {
    addQueue: () => setSt((s) => ({ ...s, queue: [...s.queue, 4], queueUpdatedAt: s.now })),
    popQueue: () => setSt((s) => ({ ...s, queue: s.queue.slice(1), queueUpdatedAt: s.now })),
    toggleEtaFail: () => setSt((s) => ({ ...s, etaFail: !s.etaFail })),
    togglePayFail: () => setSt((s) => ({ ...s, payFail: !s.payFail })),
    ready: () => {
      const s = stRef.current
      const o = [...s.orders].reverse().find((x) => x.stage < 2)
      if (!o) return
      setSt((x) => ({ ...x, queue: (() => { const q = [...x.queue]; const k = q.lastIndexOf(cartPrep(o.items)); if (k >= 0) q.splice(k, 1); return q })(), orders: x.orders.map((y) => (y.no === o.no ? { ...y, stage: 2 } : y)), banner: x.notify ? `${o.no} 음료가 나왔어요 · 학생회관 1층 픽업대` : null }))
      later(() => setSt((x) => ({ ...x, banner: null })), 4000)
    },
    pickedUp: () => {
      const s = stRef.current
      const o = [...s.orders].reverse().find((x) => x.stage === 2)
      if (!o) return
      setSt((x) => ({ ...x, orders: x.orders.map((y) => (y.no === o.no ? { ...y, stage: 3 } : y)), recent: { ...o, stage: 3 } }))
    },
    restart: (id: ScreenId) => {
      saveCart([])
      const fresh = initialFor(id)
      startedAt.current = Date.now()
      init.current = fresh
      setSt({ ...fresh.st, cart: id === 'S-04' || id === 'P-01' ? fresh.st.cart : [] })
      setStack(fresh.route.s === 'S-01' ? [fresh.route] : [{ s: 'S-01' }, fresh.route])
    },
  }

  return { st, route, act, control }
}
