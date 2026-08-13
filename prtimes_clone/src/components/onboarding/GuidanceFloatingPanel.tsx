import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppState } from "../../context/AppStateContext";
import "./GuidanceFloatingPanel.css";

export default function GuidanceFloatingPanel() {
  const location = useLocation();
  const navigate = useNavigate();
  const { steps, onboarding, currentStepIndex, setGuidancePaused } = useAppState();
  const [collapsed, setCollapsed] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [completionPrompt, setCompletionPrompt] = useState<string | null>(null);
  const prevDoneCountRef = useRef(steps.filter((step) => step.done).length);

  const currentStep = useMemo(
    () => (currentStepIndex < steps.length ? steps[currentStepIndex] : null),
    [currentStepIndex, steps]
  );
  const doneCount = useMemo(() => steps.filter((step) => step.done).length, [steps]);

  useEffect(() => {
    const prev = prevDoneCountRef.current;
    if (doneCount > prev) {
      const completedStep = [...steps].reverse().find((step) => step.done);
      if (completedStep) {
        const stepIndex = steps.findIndex((step) => step.key === completedStep.key) + 1;
        const messages: Record<string, string> = {
          company: "ステップ1が完了しました。次はメディアリストを作成して、配信先を準備しましょう。",
          mediaList: "ステップ2が完了しました。次は自分のプレスリリースやストーリーを作成しましょう。",
          content: "ステップ3が完了しました。次は反響を見て改善策を確認しましょう。",
          analytics: "ステップ4が完了しました。ガイドは完了です。引き続き改善を続けましょう。",
        };
        setCompletionPrompt(`ステップ${stepIndex}が完了しました。${messages[completedStep.key] ?? "次のステップに進みましょう。"}`);
      }
      setJustCompleted(true);
      window.setTimeout(() => setJustCompleted(false), 1200);
    }
    prevDoneCountRef.current = doneCount;
  }, [doneCount, steps]);

  function handleNavigate(targetPath: string) {
    setGuidancePaused(false);
    navigate(targetPath);
  }

  function handlePauseGuide() {
    setCompletionPrompt(null);
    setGuidancePaused(true);
  }

  function handleContinueGuide() {
    setCompletionPrompt(null);
    setGuidancePaused(false);
    if (currentStep) {
      navigate(currentStep.path);
    }
  }

  if (!onboarding.guidanceEnabled || location.pathname === "/guidance") return null;

  return (
    <aside
      className={
        "guidance-float" +
        (collapsed ? " guidance-float--collapsed" : "") +
        (justCompleted ? " guidance-float--celebrate" : "")
      }
      aria-live="polite"
    >
      <button
        type="button"
        className="guidance-float__toggle"
        onClick={() => setCollapsed((prev) => !prev)}
        aria-expanded={!collapsed}
      >
        {collapsed ? "ガイドを開く" : "ガイドを閉じる"}
      </button>

      {!collapsed && (
        <div className="guidance-float__body">
          <p className="guidance-float__eyebrow">GUIDANCE</p>
          <h3 className="guidance-float__title">現在ステータス・フロー</h3>

          <div className="guidance-float__flow" role="list" aria-label="オンボーディングの進捗">
            {steps.map((step, idx) => {
              const status = step.done ? "done" : idx === currentStepIndex ? "current" : "todo";
              return (
                <div key={step.key} className="guidance-float__flow-item" role="listitem">
                  <button
                    type="button"
                    className={`guidance-float__node guidance-float__node--${status}${
                      justCompleted && idx === doneCount - 1 ? " guidance-float__node--pop" : ""
                    }`}
                    onClick={() => handleNavigate(step.path)}
                    aria-label={step.label}
                  >
                    {step.done ? "✓" : idx + 1}
                  </button>
                  <span className="guidance-float__node-label">{step.shortLabel}</span>
                  {idx < steps.length - 1 && (
                    <span className={"guidance-float__connector" + (step.done ? " guidance-float__connector--done" : "")} />
                  )}
                </div>
              );
            })}
          </div>

          {completionPrompt && (
            <div className="guidance-float__prompt">
              <p className="guidance-float__prompt-text">{completionPrompt}</p>
              <div className="guidance-float__prompt-actions">
                <button type="button" className="btn btn-solid btn-sm" onClick={handleContinueGuide}>
                  続ける
                </button>
                <button type="button" className="btn btn-outline btn-sm" onClick={handlePauseGuide}>
                  後で
                </button>
              </div>
            </div>
          )}

          {currentStep && !completionPrompt && (
            <p className="guidance-float__current">
              <span className="guidance-float__continue-dot" />
              ガイド進行中: 次は「{currentStep.shortLabel}」です
            </p>
          )}

          <div className="guidance-float__actions">
            <button
              type="button"
              className="btn btn-solid btn-sm"
              onClick={() => handleNavigate(steps[Math.min(currentStepIndex, steps.length - 1)].path)}
            >
              現在のステップへ
            </button>
            <Link to="/guidance" className="guidance-float__link">
              ガイダンス設定を開く
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}
