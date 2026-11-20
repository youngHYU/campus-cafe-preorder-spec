// 서비스 데이터 모델 · Mock Data · 예상 수령 시각 계산 (F-ETA)
// 실제 API 연동 없음. 모든 값은 시연용 Mock.

export type Category = 'coffee' | 'noncoffee' | 'tea' | 'dessert'
export type Temp = 'HOT' | 'ICE'
export type Size = 'Regular' | 'Large'

export interface Menu {
  id: string
  name: string
  price: number
  prep: number // 제조 시간(분)
  category: Category
  temps: Temp[] // 비어 있으면 온도 선택 없음(디저트)
  soldOut?: boolean
}

export const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'coffee', label: '커피' },
  { key: 'noncoffee', label: '논커피' },
  { key: 'tea', label: '티' },
  { key: 'dessert', label: '디저트' },
]

export const MENUS: Menu[] = [
  { id: 'americano', name: '아메리카노', price: 2000, prep: 1, category: 'coffee', temps: ['HOT', 'ICE'] },
  { id: 'latte', name: '카페라떼', price: 2800, prep: 2, category: 'coffee', temps: ['HOT', 'ICE'] },
  { id: 'vanilla', name: '바닐라라떼', price: 3200, prep: 2, category: 'coffee', temps: ['HOT', 'ICE'] },
  { id: 'coldbrew', name: '콜드브루', price: 3000, prep: 1, category: 'coffee', temps: ['ICE'] },
  { id: 'einspanner', name: '아인슈페너', price: 3800, prep: 4, category: 'coffee', temps: ['ICE'] },
  { id: 'caramel', name: '카라멜마키아토', price: 3500, prep: 3, category: 'coffee', temps: ['HOT', 'ICE'], soldOut: true },
  { id: 'choco', name: '초코라떼', price: 3000, prep: 2, category: 'noncoffee', temps: ['HOT', 'ICE'] },
  { id: 'strawberry', name: '딸기라떼', price: 3500, prep: 2, category: 'noncoffee', temps: ['ICE'] },
  { id: 'greentea', name: '그린티라떼', price: 3200, prep: 2, category: 'noncoffee', temps: ['HOT', 'ICE'] },
  { id: 'chamomile', name: '캐모마일', price: 2500, prep: 1, category: 'tea', temps: ['HOT'] },
  { id: 'earlgrey', name: '얼그레이', price: 2500, prep: 1, category: 'tea', temps: ['HOT', 'ICE'] },
  { id: 'yuja', name: '유자차', price: 3000, prep: 1, category: 'tea', temps: ['HOT', 'ICE'] },
  { id: 'croffle', name: '크로플', price: 3500, prep: 3, category: 'dessert', temps: [] },
  { id: 'cookie', name: '초코칩 쿠키', price: 2000, prep: 1, category: 'dessert', temps: [] },
]

export const menuById = (id: string) => MENUS.find((m) => m.id === id)!

export const SIZE_EXTRA = 500 // Large
export const SHOT_PRICE = 500 // 확인 필요
export const MAX_QTY = 10
export const MAX_SHOTS = 3
export const BARISTAS = 2 // 동시 제조 인원(가정, 확인 필요)
export const BASE_PREP = 1 // 장바구니가 비었을 때 기준 메뉴 제조 시간(가정, 확인 필요)
export const ETA_CAP = 60

export interface CartItem {
  id: string
  menuId: string
  temp: Temp | null
  size: Size
  shots: number
  qty: number
  seenEta: number // 담을 때 사용자에게 보인 수령 시각(분 단위 시각)
}

export type Stage = 0 | 1 | 2 | 3 // 접수 · 제조 중 · 수령 대기 · 수령 완료
export const STAGES = ['접수', '제조 중', '수령 대기']

export interface Order {
  no: string
  items: Omit<CartItem, 'seenEta'>[]
  total: number
  eta: number
  stage: Stage
}

export const unitPrice = (i: Pick<CartItem, 'menuId' | 'size' | 'shots'>) =>
  menuById(i.menuId).price + (i.size === 'Large' ? SIZE_EXTRA : 0) + i.shots * SHOT_PRICE
export const itemTotal = (i: Pick<CartItem, 'menuId' | 'size' | 'shots' | 'qty'>) => unitPrice(i) * i.qty
export const cartTotal = (items: Pick<CartItem, 'menuId' | 'size' | 'shots' | 'qty'>[]) =>
  items.reduce((s, i) => s + itemTotal(i), 0)
export const cartCount = (items: { qty: number }[]) => items.reduce((s, i) => s + i.qty, 0)
export const cartPrep = (items: { menuId: string; qty: number }[]) =>
  items.reduce((s, i) => s + menuById(i.menuId).prep * i.qty, 0)

// F-ETA-01: 예상 대기 = (앞선 주문들의 제조 시간 합 ÷ 동시 제조 인원) + 내 메뉴 제조 시간, 분은 올림
export const waitMinutes = (queue: number[], myPrep: number) => {
  const ahead = queue.reduce((s, p) => s + p, 0) / BARISTAS
  return Math.ceil(ahead + (myPrep > 0 ? myPrep : BASE_PREP))
}

export const won = (n: number) => `${n.toLocaleString('ko-KR')}원`

export const clockText = (minuteOfDay: number) => {
  const m = Math.floor(minuteOfDay)
  const h = Math.floor(m / 60) % 24
  const mm = String(m % 60).padStart(2, '0')
  const ampm = h < 12 ? '오전' : '오후'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${ampm} ${h12}:${mm}`
}
export const shortClock = (minuteOfDay: number) => clockText(minuteOfDay).replace(/^오[전후] /, '')
export const waitText = (w: number) => (w > ETA_CAP ? '60분 이상' : `약 ${w}분 뒤`)

export const optionText = (i: Pick<CartItem, 'menuId' | 'temp' | 'size' | 'shots' | 'qty'>) =>
  [i.temp, i.size, i.shots ? `샷 +${i.shots}` : null, `${i.qty}개`].filter(Boolean).join(' · ')

export const orderSummary = (items: { menuId: string; temp?: Temp | null }[]) => {
  if (!items.length) return ''
  const first = items[0]
  const name = `${first.temp === 'ICE' && first.menuId === 'americano' ? '아이스 ' : ''}${menuById(first.menuId).name}`
  return items.length > 1 ? `${name} 외 ${items.length - 1}` : name
}

// 시연 시작 시각: 오후 2:35 (2주차 와이어프레임 예시와 같은 상황)
export const DEMO_START = 14 * 60 + 35
// 대기 주문 8건, 제조 시간 합 22분 → 11분 + 기준 1분 = 약 12분 · 오후 2:47
export const INITIAL_QUEUE = [2, 4, 1, 2, 3, 2, 4, 4]
