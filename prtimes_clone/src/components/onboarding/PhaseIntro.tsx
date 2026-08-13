import { useAppState, type StepKey } from "../../context/AppStateContext";
import { IconClose } from "../icons";
import "./PhaseIntro.css";

interface Props {
  step: StepKey;
  title: string;
  body: string;
}

export default function PhaseIntro({ step, title, body }: Props) {
  const { onboarding, dismissIntro } = useAppState();

  if (onboarding.seenIntros.includes(step)) return null;

  return (
    <div className="phase-intro">
      <div className="phase-intro__icon">💡</div>
      <div className="phase-intro__body">
        <p className="phase-intro__title">{title}</p>
        <p className="phase-intro__text">{body}</p>
      </div>
      <button
        type="button"
        className="icon-btn icon-btn--sm phase-intro__close"
        onClick={() => dismissIntro(step)}
        title="閉じる"
      >
        <IconClose />
      </button>
      <div className="phase-intro__tail" />
    </div>
  );
}
