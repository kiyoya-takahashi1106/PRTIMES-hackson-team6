import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppStateContext";
import "./GuidancePage.css";

export default function GuidancePage() {
  const navigate = useNavigate();
  const { onboarding, steps, currentStepIndex, setGuidanceEnabled } = useAppState();
  const doneCount = useMemo(() => steps.filter((step) => step.done).length, [steps]);

  return (
    <div className="guidance-page">
      <div className="page-header guidance-page__header">
        <div>
          <h1 className="page-title">ガイダンス</h1>
          <p className="guidance-page__lead">現在の進捗に追従して、全アクションを横フローチャートで確認できます。</p>
        </div>
      </div>

      <div className="guidance-page__grid">
        <section className="card guidance-page__card">
          <div className="guidance-page__switch-row">
            <div>
              <h2 className="guidance-page__section-title">フローティングガイド</h2>
              <p className="guidance-page__muted">ガイダンスページ以外で、進捗フローと未完了アクションを表示します。</p>
            </div>
            <label className="guidance-page__switch">
              <input
                type="checkbox"
                checked={onboarding.guidanceEnabled}
                onChange={(e) => setGuidanceEnabled(e.target.checked)}
              />
              <span>{onboarding.guidanceEnabled ? "ON" : "OFF"}</span>
            </label>
          </div>
        </section>

        <section className="card guidance-page__card">
          <h2 className="guidance-page__section-title">進捗フローチャート</h2>
          <p className="guidance-page__muted">各ステップをクリックすると対象ページへ移動します。</p>

          <div className="guidance-page__flow" role="list" aria-label="進捗フローチャート">
            {steps.map((step, idx) => {
              const status = step.done ? "done" : idx === currentStepIndex ? "current" : "todo";
              return (
                <div key={step.key} className="guidance-page__flow-item" role="listitem">
                  <button
                    type="button"
                    className={`guidance-page__flow-node guidance-page__flow-node--${status}`}
                    onClick={() => navigate(step.path)}
                  >
                    {step.done ? "✓" : idx + 1}
                  </button>
                  <p className="guidance-page__flow-label">{step.shortLabel}</p>
                  {idx < steps.length - 1 && (
                    <span className={"guidance-page__flow-connector" + (step.done ? " guidance-page__flow-connector--done" : "")} />
                  )}
                </div>
              );
            })}
          </div>
          <p className="guidance-page__summary">
            完了 {doneCount} / {steps.length} ステップ
          </p>
        </section>
      </div>
    </div>
  );
}
