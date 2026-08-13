import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../../context/AppStateContext";
import "./ProgressStepper.css";

export default function ProgressStepper() {
  const { steps, currentStepIndex, isStepReachable, onboarding, dismissSpotlight, resetOnboarding } =
    useAppState();
  const navigate = useNavigate();
  const [lockedHint, setLockedHint] = useState<number | null>(null);

  const isComplete = currentStepIndex >= steps.length;
  const currentStep = !isComplete ? steps[currentStepIndex] : null;
  const showSpotlight = !!currentStep && !onboarding.seenSpotlights.includes(currentStep.key);

  function handleStepClick(index: number) {
    if (!isStepReachable(index)) {
      setLockedHint(index);
      window.setTimeout(() => setLockedHint((v) => (v === index ? null : v)), 2600);
      return;
    }
    navigate(steps[index].path);
  }

  function goToCurrentStep() {
    if (currentStep) {
      if (showSpotlight) dismissSpotlight(currentStep.key);
      navigate(currentStep.path);
    }
  }

  return (
    <>
      {showSpotlight && <div className="stepper-overlay" onClick={() => dismissSpotlight(currentStep!.key)} />}

      <div className={"stepper-card" + (showSpotlight ? " stepper-card--spotlight" : "")}>
        <div className="stepper-card__head">
          <h2 className="stepper-card__title">PR活動の進み具合</h2>
          <button type="button" className="stepper-card__reset" onClick={resetOnboarding}>
            進捗をリセット（デモ用）
          </button>
        </div>

        <ol className="stepper">
          {steps.map((step, index) => {
            const isCurrent = index === currentStepIndex;
            const status = step.done ? "done" : isCurrent ? "current" : "locked";
            return (
              <li className="stepper__item" key={step.key}>
                <div className="stepper__row">
                  <button
                    type="button"
                    className={`stepper__node stepper__node--${status}`}
                    onClick={() => handleStepClick(index)}
                    aria-label={step.label}
                  >
                    {step.done ? "✓" : index + 1}
                  </button>
                  {index < steps.length - 1 && (
                    <div className={"stepper__connector" + (step.done ? " stepper__connector--done" : "")} />
                  )}
                </div>
                <div className="stepper__label-wrap">
                  <span className={"stepper__label" + (isCurrent ? " stepper__label--current" : "")}>
                    {step.shortLabel}
                  </span>
                  {lockedHint === index && (
                    <div className="stepper__lock-hint">
                      先に「{steps[currentStepIndex]?.shortLabel}」を完了させましょう
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        {currentStep ? (
          <div className="stepper-callout">
            <div className="stepper-callout__badge">NEXT STEP</div>
            <p className="stepper-callout__title">{currentStep.label}</p>
            <p className="stepper-callout__desc">{currentStep.description}</p>
            <button type="button" className="btn btn-solid" onClick={goToCurrentStep}>
              {currentStep.shortLabel}へ進む
            </button>
          </div>
        ) : (
          <div className="stepper-callout stepper-callout--done">
            <p className="stepper-callout__title">🎉 4つのステップが完了しました！</p>
            <p className="stepper-callout__desc">
              引き続きプレスリリースやストーリーを配信して、PR活動を継続していきましょう。
            </p>
          </div>
        )}
      </div>
    </>
  );
}
