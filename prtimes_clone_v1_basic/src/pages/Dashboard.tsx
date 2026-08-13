import { useState } from "react";
import { dashboardNotices } from "../data/mockData";
import { IconChevronDown, IconClose } from "../components/icons";
import "./Dashboard.css";

export default function Dashboard() {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState<string[]>(
    dashboardNotices.filter((n) => n.collapsed).map((n) => n.id)
  );

  const visible = dashboardNotices.filter((n) => !dismissed.includes(n.id));

  function toggle(id: string) {
    setCollapsed((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function dismiss(id: string) {
    setDismissed((prev) => [...prev, id]);
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">ダッシュボード</h1>
      </div>

      <div className="dashboard-notices">
        {visible.map((notice) => {
          const isCollapsed = collapsed.includes(notice.id);
          return (
            <div className="card" key={notice.id}>
              <div className="dashboard-notice__head">
                <h3 className="dashboard-notice__title">{notice.title}</h3>
                <div className="dashboard-notice__actions">
                  <button
                    type="button"
                    className="icon-btn icon-btn--sm"
                    onClick={() => toggle(notice.id)}
                    title={isCollapsed ? "開く" : "閉じる"}
                  >
                    <IconChevronDown
                      style={{ transform: isCollapsed ? "rotate(0deg)" : "rotate(180deg)" }}
                    />
                  </button>
                  <button
                    type="button"
                    className="icon-btn icon-btn--sm"
                    onClick={() => dismiss(notice.id)}
                    title="閉じる"
                  >
                    <IconClose />
                  </button>
                </div>
              </div>
              {!isCollapsed && notice.body && <p className="dashboard-notice__body">{notice.body}</p>}
            </div>
          );
        })}

        <div className="card">
          <div className="dashboard-notice__head">
            <h3 className="dashboard-notice__title">企業ページの情報を充実させましょう！</h3>
          </div>
          <p className="dashboard-notice__body">
            企業ページはメディアや生活者があなたの会社を知る入り口です。ロゴやSNSリンクなどを設定して、企業の魅力をアピールしましょう。
          </p>
        </div>
      </div>
    </div>
  );
}
