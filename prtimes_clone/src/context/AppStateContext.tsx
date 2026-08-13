import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  company as initialCompany,
  mediaLists as initialMediaLists,
  pressReleases as initialPressReleases,
  stories as initialStories,
  type MediaList,
  type PressRelease,
  type Story,
} from "../data/mockData";

const STORAGE_KEY = "prtimes-clone-app-state-v1";

export type StepKey = "company" | "mediaList" | "content" | "analytics";

interface OnboardingState {
  isCompanyProfileDone: boolean;
  isMediaListDone: boolean;
  isContentPublished: boolean;
  isAnalyticsChecked: boolean;
  seenIntros: StepKey[];
  seenSpotlights: StepKey[];
  guidanceEnabled: boolean;
  guidancePaused: boolean;
  guidanceStep: StepKey;
}

interface CompanyInfo {
  name: string;
  id: string;
  nameKana: string;
  shortName: string;
  foundedAt: string;
  representativeName: string;
  representativeTitle: string;
  postalCode: string;
  address: string;
  phone: string;
  marketSegment: string;
}

interface PersistedState {
  company: CompanyInfo;
  mediaLists: MediaList[];
  pressReleases: PressRelease[];
  stories: Story[];
  onboarding: OnboardingState;
}

const defaultOnboarding: OnboardingState = {
  isCompanyProfileDone: false,
  isMediaListDone: false,
  isContentPublished: false,
  isAnalyticsChecked: false,
  seenIntros: [],
  seenSpotlights: [],
  guidanceEnabled: true,
  guidancePaused: false,
  guidanceStep: "company",
};

const defaultState: PersistedState = {
  company: initialCompany,
  mediaLists: initialMediaLists,
  pressReleases: initialPressReleases,
  stories: initialStories,
  onboarding: defaultOnboarding,
};

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed,
      onboarding: { ...defaultOnboarding, ...parsed.onboarding },
    };
  } catch {
    return defaultState;
  }
}

export interface StepInfo {
  key: StepKey;
  label: string;
  shortLabel: string;
  description: string;
  path: string;
  done: boolean;
}

interface AppStateValue {
  company: CompanyInfo;
  mediaLists: MediaList[];
  pressReleases: PressRelease[];
  stories: Story[];
  onboarding: OnboardingState;
  steps: StepInfo[];
  currentStepIndex: number;
  isStepReachable: (index: number) => boolean;
  canCreateContent: boolean;
  updateCompany: (patch: Partial<CompanyInfo>) => void;
  completeCompanyProfile: (patch?: Partial<CompanyInfo>) => void;
  addMediaList: (name: string) => void;
  addPressRelease: (title: string) => void;
  addStory: (title: string) => void;
  markAnalyticsChecked: () => void;
  dismissIntro: (key: StepKey) => void;
  dismissSpotlight: (key: StepKey) => void;
  setGuidanceEnabled: (enabled: boolean) => void;
  setGuidancePaused: (paused: boolean) => void;
  setGuidanceStep: (key: StepKey) => void;
  resetOnboarding: () => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

let idCounter = 100;
function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

function nowLabel() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} (${"日月火水木金土"[d.getDay()]}) ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const onboarding = state.onboarding;

  const steps: StepInfo[] = useMemo(
    () => [
      {
        key: "company",
        label: "企業プロフィール設定",
        shortLabel: "企業プロフィール",
        description: "会社の基本情報を整えて、信頼できる発信元であることを伝えましょう。",
        path: "/settings/company",
        done: onboarding.isCompanyProfileDone,
      },
      {
        key: "mediaList",
        label: "メディアリストの設定",
        shortLabel: "メディアリスト",
        description: "配信したい記者・メディアをリストに登録し、配信先を準備します。",
        path: "/media-lists",
        done: onboarding.isMediaListDone,
      },
      {
        key: "content",
        label: "プレスリリース or ストーリーの投稿",
        shortLabel: "投稿",
        description: "プレスリリースかストーリーを選んで、最初の情報発信をしましょう。",
        path: "/posts/new",
        done: onboarding.isContentPublished,
      },
      {
        key: "analytics",
        label: "閲覧データの確認",
        shortLabel: "効果測定",
        description: "配信した情報がどれだけ読まれたか、レポートで振り返りましょう。",
        path: "/analytics",
        done: onboarding.isAnalyticsChecked,
      },
    ],
    [onboarding]
  );

  const currentStepIndex = useMemo(() => {
    const idx = steps.findIndex((s) => !s.done);
    return idx === -1 ? steps.length : idx;
  }, [steps]);

  const isStepReachable = (index: number) => index <= currentStepIndex;

  const canCreateContent = onboarding.isCompanyProfileDone && onboarding.isMediaListDone;

  function patchOnboarding(patch: Partial<OnboardingState>) {
    setState((prev) => ({ ...prev, onboarding: { ...prev.onboarding, ...patch } }));
  }

  function updateCompany(patch: Partial<CompanyInfo>) {
    setState((prev) => ({ ...prev, company: { ...prev.company, ...patch } }));
  }

  function completeCompanyProfile(patch?: Partial<CompanyInfo>) {
    if (patch) updateCompany(patch);
    patchOnboarding({ isCompanyProfileDone: true });
  }

  function addMediaList(name: string) {
    const newList: MediaList = {
      id: nextId("list"),
      name: name.trim() || "名称未設定リスト",
      updatedAt: nowLabel(),
      count: 0,
      breakdown: ["テレビ", "雑誌", "新聞", "Web", "フリーペーパー", "ラジオ", "通信社"].map((label) => ({
        label,
        value: 0,
      })),
    };
    setState((prev) => ({ ...prev, mediaLists: [newList, ...prev.mediaLists] }));
    patchOnboarding({ isMediaListDone: true });
  }

  function addPressRelease(title: string) {
    const id = nextId("000000");
    const newRelease: PressRelease = {
      id,
      title: title.trim() || "無題のプレスリリース",
      status: "下書き",
      updatedAt: nowLabel(),
      url: `https://latest.stg-prtimes.net/main/html/rd/p/${id}.000099125.html`,
    };
    setState((prev) => ({ ...prev, pressReleases: [newRelease, ...prev.pressReleases] }));
    patchOnboarding({ isContentPublished: true });
  }

  function addStory(title: string) {
    const id = nextId("story");
    const newStory: Story = {
      id,
      title: title.trim() || "タイトル無し",
      status: "下書き",
      updatedAt: nowLabel(),
      url: `https://latest.stg-prtimes.net/story/detail/${id}`,
    };
    setState((prev) => ({ ...prev, stories: [newStory, ...prev.stories] }));
    patchOnboarding({ isContentPublished: true });
  }

  function markAnalyticsChecked() {
    patchOnboarding({ isAnalyticsChecked: true });
  }

  function dismissIntro(key: StepKey) {
    if (onboarding.seenIntros.includes(key)) return;
    patchOnboarding({ seenIntros: [...onboarding.seenIntros, key] });
  }

  function dismissSpotlight(key: StepKey) {
    if (onboarding.seenSpotlights.includes(key)) return;
    patchOnboarding({ seenSpotlights: [...onboarding.seenSpotlights, key] });
  }

  function setGuidanceEnabled(enabled: boolean) {
    patchOnboarding({ guidanceEnabled: enabled });
  }

  function setGuidancePaused(paused: boolean) {
    patchOnboarding({ guidancePaused: paused });
  }

  function setGuidanceStep(key: StepKey) {
    patchOnboarding({ guidanceStep: key });
  }

  function resetOnboarding() {
    setState((prev) => ({ ...prev, onboarding: defaultOnboarding }));
  }

  const value: AppStateValue = {
    company: state.company,
    mediaLists: state.mediaLists,
    pressReleases: state.pressReleases,
    stories: state.stories,
    onboarding,
    steps,
    currentStepIndex,
    isStepReachable,
    canCreateContent,
    updateCompany,
    completeCompanyProfile,
    addMediaList,
    addPressRelease,
    addStory,
    markAnalyticsChecked,
    dismissIntro,
    dismissSpotlight,
    setGuidanceEnabled,
    setGuidancePaused,
    setGuidanceStep,
    resetOnboarding,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
