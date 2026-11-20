import type { CartItem, Category, Order, Temp } from '../model'

export type Route =
  | { s: 'S-01' }
  | { s: 'S-02'; cat: Category }
  | { s: 'S-03'; menuId: string; cartItemId?: string; temp?: Temp }
  | { s: 'S-04' }
  | { s: 'S-05' }

export interface AppState {
  now: number // 분 단위 시각(시연 시계)
  queue: number[] // 앞선 주문들의 제조 시간(분)
  queueUpdatedAt: number
  etaFail: boolean
  cart: CartItem[]
  cartShownEta: number | null // S-04에서 마지막으로 보여 준 시각
  cartNotice: { from: number; to: number } | null // 늦어졌을 때 변경 안내
  payMethod: 'easy' | 'card' | null
  notify: boolean
  orders: Order[]
  recent: Order | null
  payFail: boolean
  paying: boolean
  popup: { from: number; to: number } | null
  toast: { text: string; action?: 'cart' | 'undo' } | null
  banner: string | null // 인앱 알림 배너
}

export interface Actions {
  go: (r: Route) => void
  back: () => void
  addToCart: (item: Omit<CartItem, 'id' | 'seenEta'>, seenEta: number, editId?: string) => void
  changeQty: (id: string, delta: number) => void
  remove: (id: string) => void
  undo: () => void
  reorder: () => void
  setPay: (m: 'easy' | 'card') => void
  pressPay: () => void
  confirmPay: () => void
  keepCart: () => void
  closePopup: () => void
  setNotify: (v: boolean) => void
  retryEta: () => void
  toastAction: () => void
}

export const noopActions: Actions = {
  go: () => {}, back: () => {}, addToCart: () => {}, changeQty: () => {}, remove: () => {}, undo: () => {},
  reorder: () => {}, setPay: () => {}, pressPay: () => {}, confirmPay: () => {}, keepCart: () => {},
  closePopup: () => {}, setNotify: () => {}, retryEta: () => {}, toastAction: () => {},
}
