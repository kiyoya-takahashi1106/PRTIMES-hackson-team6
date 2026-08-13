import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAppState, type StepKey } from "../../context/AppStateContext";
import "./GuidedSpotlight.css";

interface GuidePlan {
  selectors: string[];
  title: string;
  message: string;
}

interface SpotlightBox {
  top: number;
  left: number;
  width: number;
  height: number;
  borderRadius: string;
}

function getGuidePlan(step: StepKey, pathname: string): GuidePlan {
  if (step === "company") {
    if (pathname === "/settings/company") {
      return {
        selectors: ['[data-guide-id="company-save"]', '[data-guide-id="company-edit-trigger"]'],
        title: "ステップ1: 企業プロフィール設定",
        message: "企業情報を入力し終えたら、「保存する」をクリックしてステップ1を完了させてください。",
      };
    }
    return {
      selectors: ['[data-guide-id="nav-company-settings"]', '[data-guide-id="nav-settings-group"]'],
      title: "ステップ1: 企業プロフィール設定",
      message: "サイドバーの「企業情報」をクリックして設定ページに進みましょう。",
    };
  }

  if (step === "mediaList") {
    if (pathname === "/media-lists/new") {
      return {
        selectors: ['[data-guide-id="media-list-submit"]'],
        title: "ステップ2: メディアリスト作成",
        message: "リスト名を入力し、「リストを作成する」をクリックしてください。",
      };
    }
    if (pathname === "/media-lists") {
      return {
        selectors: ['[data-guide-id="media-list-create"]'],
        title: "ステップ2: メディアリスト作成",
        message: "まず「新規作成」をクリックしてリスト作成画面へ進みます。",
      };
    }
    return {
      selectors: ['[data-guide-id="nav-media-list-link"]', '[data-guide-id="nav-media-list-group"]'],
      title: "ステップ2: メディアリスト作成",
      message: "サイドバーの「メディアリスト」を開き、一覧へ進んでください。",
    };
  }

  if (step === "content") {
    if (pathname === "/posts/new") {
      return {
        selectors: ['[data-guide-id="post-type-press"]', '[data-guide-id="post-type-story"]'],
        title: "ステップ3: 投稿",
        message: "作成する投稿タイプを選んでクリックしてください。",
      };
    }
    if (pathname === "/press-releases/new") {
      return {
        selectors: ['[data-guide-id="press-release-body"]', '[data-guide-id="press-release-submit"]'],
        title: "ステップ3: 投稿",
        message: "記事をここで完成させてください。書き終えたら、OKを押して送信前までガイドを一時停止します。",
      };
    }
    if (pathname === "/stories/new") {
      return {
        selectors: ['[data-guide-id="story-body"]', '[data-guide-id="story-submit"]'],
        title: "ステップ3: 投稿",
        message: "記事をここで完成させてください。書き終えたら、OKを押して送信前までガイドを一時停止します。",
      };
    }
    return {
      selectors: ['[data-guide-id="header-create-press"]'],
      title: "ステップ3: 投稿",
      message: "右上の「プレスリリース新規作成」をクリックして作成を始めましょう。",
    };
  }

  if (pathname === "/analytics") {
    return {
      selectors: ['[data-guide-id="analytics-tab-press"]'],
      title: "ステップ4: 効果測定",
      message: "「プレスリリース」タブを確認し、反響データをチェックしてください。",
    };
  }

  return {
    selectors: ['[data-guide-id="nav-analytics-report"]', '[data-guide-id="nav-analytics-group"]'],
    title: "ステップ4: 効果測定",
    message: "サイドバーの「分析データ」から「レポート」へ進んでください。",
  };
}

function pickVisibleElement(selectors: string[]): HTMLElement | null {
  let best: { el: HTMLElement; score: number; area: number } | null = null;
  let emptyField: HTMLElement | null = null;

  for (const selector of selectors) {
    const candidates = document.querySelectorAll(selector);
    for (const node of candidates) {
      if (!(node instanceof HTMLElement)) continue;
      const rect = node.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) continue;

      if (node instanceof HTMLTextAreaElement || node instanceof HTMLInputElement) {
        if (node.value.trim() === "") {
          emptyField = node;
        }
      }

      const area = rect.width * rect.height;
      let score = 0;
      if (node.classList.contains("active") || node.getAttribute("aria-current") === "page") score += 50;
      if (node.closest(".sidebar__submenu")) score += 25;
      if (node.tagName === "A" || node.tagName === "BUTTON") score += 20;
      if (node.classList.contains("tab") || node.classList.contains("sidebar__subitem")) score += 20;

      if (!best || score > best.score || (score === best.score && area < best.area)) {
        best = { el: node, score, area };
      }
    }
  }

  return emptyField ?? best?.el ?? null;
}

export default function GuidedSpotlight() {
  const location = useLocation();
  const { onboarding, steps, currentStepIndex, setGuidanceEnabled, setGuidancePaused } = useAppState();
  const [targetBox, setTargetBox] = useState<SpotlightBox | null>(null);
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight });

  const isComplete = currentStepIndex >= steps.length;
  const step = !isComplete ? steps[currentStepIndex] : null;

  const plan = useMemo(
    () => (step ? getGuidePlan(step.key, location.pathname) : null),
    [step, location.pathname]
  );

  useEffect(() => {
    if (!onboarding.guidanceEnabled || !plan || location.pathname === "/guidance") {
      setTargetBox(null);
      return;
    }

    const update = () => {
      const el = pickVisibleElement(plan.selectors);
      if (!el) {
        setTargetBox(null);
      } else {
        const rect = el.getBoundingClientRect();
        const computed = window.getComputedStyle(el);
        const pad = 6;
        setTargetBox({
          top: rect.top - pad,
          left: rect.left - pad,
          width: rect.width + pad * 2,
          height: rect.height + pad * 2,
          borderRadius: computed.borderRadius && computed.borderRadius !== "0px" ? computed.borderRadius : "10px",
        });
      }

      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    update();

    const observer = new MutationObserver(update);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [location.pathname, onboarding.guidanceEnabled, plan]);

  if (!onboarding.guidanceEnabled || onboarding.guidancePaused || !plan || location.pathname === "/guidance" || isComplete || !step) return null;

  if (!targetBox) {
    return (
      <div className="guided-spotlight guided-spotlight--fallback">
        <div className="guided-spotlight__mask" />
        <button type="button" className="guided-spotlight__stop" onClick={() => setGuidanceEnabled(false)}>
          ガイド終了
        </button>
        <div className="guided-spotlight__tip-card">
          <p className="guided-spotlight__msg">{plan.message}</p>
        </div>
      </div>
    );
  }

  const centerX = targetBox.left + targetBox.width / 2;

  const tipWidth = 340;
  const tipLeft = Math.min(Math.max(16, centerX - tipWidth / 2), viewport.width - tipWidth - 16);
  const tipTop =
    targetBox.top + targetBox.height + 18 > viewport.height - 180
      ? targetBox.top - 146
      : targetBox.top + targetBox.height + 18;

  return (
    <div className="guided-spotlight" aria-live="polite">
      <div className="guided-spotlight__mask" />
      <button type="button" className="guided-spotlight__stop" onClick={() => setGuidanceEnabled(false)}>
        ガイド終了
      </button>
      <div
        className="guided-spotlight__ring"
        style={{
          width: targetBox.width,
          height: targetBox.height,
          top: targetBox.top,
          left: targetBox.left,
          borderRadius: targetBox.borderRadius,
        }}
      />

      <div className="guided-spotlight__tip-card" style={{ top: tipTop, left: tipLeft }}>
        <p className="guided-spotlight__msg">{plan.message}</p>
        {(location.pathname === "/press-releases/new" || location.pathname === "/stories/new") && (
          <div className="guided-spotlight__controls">
            <button type="button" className="btn btn-solid btn-sm" onClick={() => setGuidancePaused(true)}>
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
