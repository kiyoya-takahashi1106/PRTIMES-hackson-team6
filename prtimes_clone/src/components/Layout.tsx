import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  IconAnalytics,
  IconBell,
  IconClipping,
  IconCompany,
  IconDashboard,
  IconDocument,
  IconMail,
  IconMediaList,
  IconPhone,
  IconSettings,
  IconStory,
  IconUser,
} from "./icons";
import { useAppState } from "../context/AppStateContext";
import GuidanceFloatingPanel from "./onboarding/GuidanceFloatingPanel";
import GuidedSpotlight from "./onboarding/GuidedSpotlight";
import "./Layout.css";

interface NavChild {
  label: string;
  to: string;
}

interface NavItem {
  label: string;
  icon: (props: { size?: number }) => ReactNode;
  to?: string;
  children?: NavChild[];
}

const nav: NavItem[] = [
  { label: "ダッシュボード", icon: (p) => <IconDashboard {...toSvgSize(p)} />, to: "/" },
  {
    label: "プレスリリース",
    icon: (p) => <IconDocument {...toSvgSize(p)} />,
    children: [
      { label: "一覧", to: "/press-releases" },
      { label: "新規作成", to: "/press-releases/new" },
    ],
  },
  {
    label: "メディアリスト",
    icon: (p) => <IconMediaList {...toSvgSize(p)} />,
    children: [
      { label: "一覧", to: "/media-lists" },
      { label: "新規作成", to: "/media-lists/new" },
      { label: "インポート", to: "/media-lists/import" },
    ],
  },
  {
    label: "ストーリー",
    icon: (p) => <IconStory {...toSvgSize(p)} />,
    children: [
      { label: "一覧", to: "/stories" },
      { label: "新規作成", to: "/stories/new" },
    ],
  },
  {
    label: "分析データ",
    icon: (p) => <IconAnalytics {...toSvgSize(p)} />,
    children: [
      { label: "レポート", to: "/analytics" },
      { label: "提携オンラインメディア", to: "/analytics/partners" },
      { label: "ソーシャル", to: "/analytics/social" },
      { label: "広告換算ツール", to: "/analytics/ad-value" },
    ],
  },
  {
    label: "Webクリッピング",
    icon: (p) => <IconClipping {...toSvgSize(p)} />,
    children: [{ label: "クリップ調査", to: "/web-clipping" }],
  },
  {
    label: "ガイダンス",
    icon: (p) => <IconBell {...toSvgSize(p)} />,
    to: "/guidance",
  },
  {
    label: "企業ページ",
    icon: (p) => <IconCompany {...toSvgSize(p)} />,
    to: "/company-page",
  },
  {
    label: "設定",
    icon: (p) => <IconSettings {...toSvgSize(p)} />,
    children: [
      { label: "企業情報", to: "/settings/company" },
      { label: "ユーザー情報", to: "/settings/user" },
      { label: "ログイン管理", to: "/settings/login" },
      { label: "料金プラン", to: "/settings/plan" },
      { label: "請求先情報", to: "/settings/billing" },
    ],
  },
];

function toSvgSize(p: { size?: number }) {
  return p.size ? { width: p.size, height: p.size } : {};
}

export default function Layout() {
  const location = useLocation();
  const activeParent = nav.find(
    (item) =>
      item.to === location.pathname ||
      item.children?.some((c) => location.pathname.startsWith(c.to.split("/new")[0]) || location.pathname === c.to)
  );
  const [openLabel, setOpenLabel] = useState<string | null>(activeParent?.children ? activeParent.label : null);
  const { company, onboarding, steps, currentStepIndex } = useAppState();

  const currentStep = currentStepIndex < steps.length ? steps[currentStepIndex] : null;

  const guidanceOpenLabel =
    onboarding.guidanceEnabled && !onboarding.guidancePaused && currentStep
      ? currentStep.key === "company"
        ? "設定"
        : currentStep.key === "mediaList"
          ? "メディアリスト"
          : currentStep.key === "analytics"
            ? "分析データ"
            : null
      : null;

  useEffect(() => {
    setOpenLabel(activeParent?.children ? activeParent.label : null);
  }, [location.pathname]);

  useEffect(() => {
    if (guidanceOpenLabel) {
      setOpenLabel(guidanceOpenLabel);
    }
  }, [guidanceOpenLabel]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="app-header__logo">
          PR ACTIVITY
        </Link>
        <Link to="/media-lists/new" className="btn btn-outline btn-sm app-header__cta">
          メディアリスト新規作成
        </Link>
        <Link
          to="/press-releases/new"
          className="btn btn-blue-outline btn-sm app-header__cta"
          data-guide-id="header-create-press"
        >
          プレスリリース新規作成
        </Link>

        <div className="app-header__support">
          <div>
            <div className="app-header__support-label">サポートデスクはこちら</div>
            <div className="app-header__phone">
              <IconPhone />
              03-6625-4684
            </div>
          </div>
          <a className="app-header__contact" href="#contact">
            <IconMail />
            問い合わせフォーム
          </a>
        </div>

        <button className="icon-btn" title="通知" type="button">
          <IconBell />
        </button>

        <div className="app-header__account">
          <div className="app-header__account-text">
            <strong>{company.name}</strong>
            企業ID：{company.id}
          </div>
          <IconUser width={30} height={30} />
        </div>
      </header>

      <div className="app-body">
        <aside className="sidebar">
          <nav>
            <ul>
              {nav.map((item) => {
                const isLeaf = !item.children;
                const isOpen = openLabel === item.label;
                const isActive =
                  (item.to && location.pathname === item.to) ||
                  item.children?.some((c) => location.pathname === c.to);

                return (
                  <li key={item.label} className="sidebar__group">
                    {isLeaf ? (
                      <NavLink
                        to={item.to!}
                        className={({ isActive }) =>
                          "sidebar__item" + (isActive ? " sidebar__item--active" : "")
                        }
                      >
                        <span className="sidebar__icon">{item.icon({})}</span>
                        {item.label}
                      </NavLink>
                    ) : (
                      <button
                        type="button"
                        className={"sidebar__item" + (isActive ? " sidebar__item--active" : "")}
                        data-guide-id={
                          item.label === "メディアリスト"
                            ? "nav-media-list-group"
                            : item.label === "分析データ"
                              ? "nav-analytics-group"
                              : item.label === "設定"
                                ? "nav-settings-group"
                                : undefined
                        }
                        onClick={() => setOpenLabel(isOpen ? null : item.label)}
                      >
                        <span className="sidebar__icon">{item.icon({})}</span>
                        {item.label}
                        <span className={"sidebar__caret" + (isOpen ? " sidebar__caret--open" : "")}>▸</span>
                      </button>
                    )}
                    {item.children && isOpen && (
                      <ul className="sidebar__submenu">
                        {item.children.map((child) => (
                          <li key={child.to}>
                            <NavLink
                              to={child.to}
                              end
                              data-guide-id={
                                child.to === "/settings/company"
                                  ? "nav-company-settings"
                                  : child.to === "/media-lists"
                                    ? "nav-media-list-link"
                                    : child.to === "/analytics"
                                      ? "nav-analytics-report"
                                      : undefined
                              }
                              className={({ isActive }) =>
                                "sidebar__subitem" + (isActive ? " sidebar__subitem--active" : "")
                              }
                            >
                              {child.label}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <main className="app-content">
          <Outlet />
        </main>
      </div>

      <GuidanceFloatingPanel />
      <GuidedSpotlight />
    </div>
  );
}
