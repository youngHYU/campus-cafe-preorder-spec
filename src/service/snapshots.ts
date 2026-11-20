// 문서 · 전체 흐름 미리보기에 쓰는 화면별 정적 상태 (2주차 와이어프레임 예시 값과 같게 맞춤)
import { DEMO_START, INITIAL_QUEUE, type CartItem, type Order } from '../model'
import type { ScreenId } from '../spec'
import type { AppState, Route } from './types'

const cart2: CartItem[] = [
  { id: 'c1', menuId: 'latte', temp: 'ICE', size: 'Regular', shots: 0, qty: 1, seenEta: DEMO_START + 13 },
  { id: 'c2', menuId: 'americano', temp: 'ICE', size: 'Regular', shots: 0, qty: 1, seenEta: DEMO_START + 13 },
]

export const RECENT: Order = {
  no: 'A-098', total: 4800, eta: 0, stage: 3,
  items: [
    { id: 'r1', menuId: 'americano', temp: 'ICE', size: 'Regular', shots: 0, qty: 1 },
    { id: 'r2', menuId: 'latte', temp: 'ICE', size: 'Regular', shots: 0, qty: 1 },
  ],
}

export const baseState = (): AppState => ({
  now: DEMO_START, queue: [...INITIAL_QUEUE], queueUpdatedAt: DEMO_START, etaFail: false,
  cart: [], cartShownEta: null, cartNotice: null, payMethod: 'easy', notify: true,
  orders: [], recent: RECENT, payFail: false, paying: false, popup: null, toast: null, banner: null,
})

const busyQueue = [...INITIAL_QUEUE, 4] // 고르는 사이 주문 1건 증가 → 2:51

export function snapshot(id: ScreenId): { st: AppState; route: Route } {
  const st = baseState()
  switch (id) {
    case 'S-01': return { st: { ...st, cart: cart2 }, route: { s: 'S-01' } }
    case 'S-02': return { st: { ...st, cart: cart2 }, route: { s: 'S-02', cat: 'coffee' } }
    case 'S-03': return { st, route: { s: 'S-03', menuId: 'latte', temp: 'ICE' } }
    case 'S-04':
      return { st: { ...st, queue: busyQueue, cart: cart2, cartShownEta: DEMO_START + 16, cartNotice: { from: DEMO_START + 13, to: DEMO_START + 16 } }, route: { s: 'S-04' } }
    case 'P-01':
      return { st: { ...st, queue: [...busyQueue, 4], cart: cart2, cartShownEta: DEMO_START + 16, cartNotice: { from: DEMO_START + 13, to: DEMO_START + 16 }, popup: { from: DEMO_START + 16, to: DEMO_START + 19 } }, route: { s: 'S-04' } }
    case 'S-05':
      return {
        st: { ...st, now: DEMO_START + 7, orders: [{ no: 'A-127', total: 4800, eta: DEMO_START + 16, stage: 1, items: cart2.map(({ seenEta: _s, ...i }) => i) }] },
        route: { s: 'S-05' },
      }
  }
}
