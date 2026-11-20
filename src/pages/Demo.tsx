import { useDemo } from '../demo/useDemo'
import { clockText } from '../model'
import { SCREENS, type ScreenId } from '../spec'
import { Phone, ScreenFor } from '../service/screens'

const Btn = ({ onClick, children, on }: { onClick: () => void; children: React.ReactNode; on?: boolean }) => (
  <button onClick={onClick} className={`w-full rounded-lg border px-3 py-2 text-left text-[13px] ${on ? 'border-accent bg-accentSoft font-bold text-accent' : 'border-line bg-white hover:border-mid'}`}>{children}</button>
)

export function DemoPage({ id, nav }: { id: ScreenId; nav: (h: string) => void }) {
  const { st, route, act, control } = useDemo(id)
  return (
    <div className="mx-auto flex max-w-[1100px] flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center">
      <div className="max-w-full overflow-x-auto"><Phone st={st} act={act}><ScreenFor route={route} st={st} act={act} /></Phone></div>
      <aside className="w-full max-w-[360px] space-y-4 text-[13px]">
        <section className="rounded-2xl border border-line bg-white p-4">
          <h2 className="text-[15px] font-bold">시연 안내</h2>
          <p className="mt-1 text-sub">실제 서버 · 결제 · 푸시 연동 없이 Mock 데이터로 동작해요. 시계는 {clockText(14 * 60 + 35)}에서 시작해 실제 시간만큼 흘러요. 장바구니는 이 브라우저에만 보관돼요.</p>
          <dl className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-soft p-2"><dt className="text-[11px] text-sub">시연 시각</dt><dd className="font-bold">{clockText(st.now)}</dd></div>
            <div className="rounded-lg bg-soft p-2"><dt className="text-[11px] text-sub">대기 주문 (Mock)</dt><dd className="font-bold">{st.queue.length}건</dd></div>
          </dl>
        </section>
        <section className="rounded-2xl border border-line bg-white p-4">
          <h2 className="text-[15px] font-bold">매장 · 다른 학생 이벤트</h2>
          <p className="mt-1 text-sub">명세의 예외 상황을 직접 일으켜 볼 수 있어요.</p>
          <div className="mt-3 space-y-2">
            <Btn onClick={control.addQueue}>다른 학생 주문 +1 (예상 시각 약 2분 늦어짐)</Btn>
            <Btn onClick={control.popQueue}>대기 주문 1건 완료</Btn>
            <Btn onClick={control.ready}>내 주문 제조 완료 → 수령 대기 · 알림</Btn>
            <Btn onClick={control.pickedUp}>내 주문 수령 완료</Btn>
            <Btn onClick={control.toggleEtaFail} on={st.etaFail}>예상 시각 조회 실패 {st.etaFail ? 'ON' : 'OFF'}</Btn>
            <Btn onClick={control.togglePayFail} on={st.payFail}>결제 실패 {st.payFail ? 'ON' : 'OFF'}</Btn>
          </div>
          <p className="mt-3 rounded-lg bg-accentSoft p-2.5 text-[12px] text-accent">
            결제 직전 안내 보기: 메뉴를 담은 뒤 ‘다른 학생 주문 +1’ → 장바구니 진입. 장바구니에서 한 번 더 누른 뒤 결제하기 → P-01 팝업
          </p>
        </section>
        <section className="rounded-2xl border border-line bg-white p-4">
          <h2 className="text-[15px] font-bold">처음부터 · 화면 직접 진입</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {SCREENS.map((s) => (
              <button key={s.id} onClick={() => { if (s.id === id) control.restart(s.id); else nav(`#/demo/${s.id}`) }}
                className={`rounded-lg border px-2 py-2 text-left ${s.id === id ? 'border-ink font-bold' : 'border-line'}`}>
                <span className="text-[11px] text-sub">{s.id}</span><br />{s.name}
              </button>
            ))}
          </div>
          <button onClick={() => control.restart(id)} className="mt-2 w-full rounded-lg bg-ink py-2 font-bold text-white">이 화면부터 다시 시작</button>
        </section>
      </aside>
    </div>
  )
}
