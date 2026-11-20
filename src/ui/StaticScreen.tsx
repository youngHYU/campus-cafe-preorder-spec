// 문서 · 미리보기용 정적 화면. 실제 서비스 화면 컴포넌트를 그대로 쓰되 조작은 막는다.
import type { ScreenId } from '../spec'
import { Phone, ScreenFor } from '../service/screens'
import { snapshot } from '../service/snapshots'
import { noopActions } from '../service/types'

export function StaticScreen({ id }: { id: ScreenId }) {
  const { st, route } = snapshot(id)
  return (
    <div inert className="pointer-events-none select-none">
      <Phone st={st} act={noopActions}>
        <ScreenFor route={route} st={st} act={noopActions} />
      </Phone>
    </div>
  )
}

export function MiniPreview({ id, scale = 0.5 }: { id: ScreenId; scale?: number }) {
  return (
    <div className="overflow-hidden" style={{ width: 360 * scale, height: 760 * scale }} aria-hidden>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: 360, height: 760 }}>
        <StaticScreen id={id} />
      </div>
    </div>
  )
}
