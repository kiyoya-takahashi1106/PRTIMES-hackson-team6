import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { type StoryStatus } from "../data/mockData";
import { useAppState } from "../context/AppStateContext";
import { IconCopy } from "../components/icons";
import "./ListPage.css";

const badgeClass: Record<StoryStatus, string> = {
  下書き: "badge-draft",
  予約済み: "badge-reserved",
  公開済み: "badge-published",
  非公開: "badge-draft",
};

type TabKey = "all" | StoryStatus;

const tabs: { key: TabKey; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "下書き", label: "下書き" },
  { key: "予約済み", label: "予約済み" },
  { key: "公開済み", label: "公開済み" },
  { key: "非公開", label: "非公開" },
];

export default function StoryList() {
  const { stories } = useAppState();
  const [tab, setTab] = useState<TabKey>("all");

  const counts = useMemo(() => {
    const map: Record<TabKey, number> = {
      all: stories.length,
      下書き: 0,
      予約済み: 0,
      公開済み: 0,
      非公開: 0,
    };
    stories.forEach((s) => {
      map[s.status] += 1;
    });
    return map;
  }, [stories]);

  const filtered = tab === "all" ? stories : stories.filter((s) => s.status === tab);

  return (
    <div>
      <div className="breadcrumb">
        <span>ストーリー</span>
        <span>一覧</span>
      </div>
      <div className="page-header">
        <h1 className="page-title">ストーリー 一覧</h1>
        <div style={{ display: "flex", gap: 12 }}>
          <a href="#about" className="btn btn-outline">
            ストーリーとは？
          </a>
          <Link to="/stories/new" className="btn btn-solid">
            新規作成
          </Link>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 20 }}>
        {tabs.map((t) => (
          <div
            key={t.key}
            className={"tab" + (tab === t.key ? " active" : "")}
            onClick={() => setTab(t.key)}
          >
            {t.label}({counts[t.key]})
          </div>
        ))}
      </div>

      <ul className="divider-list">
        {filtered.map((story) => (
          <li className="list-row" key={story.id}>
            <div className="list-row__main">
              <div className="list-row__meta">
                <span className={`badge ${badgeClass[story.status]}`}>{story.status}</span>
                <span className="list-row__date">更新日：{story.updatedAt}</span>
              </div>
              <p className="list-row__title">{story.title}</p>
              <a href="#media-list" className="list-row__link">
                メディアリストを確認
              </a>
              <div className="list-row__url">
                URL：{story.url}
                <button type="button" className="icon-btn icon-btn--sm" title="URLをコピー">
                  <IconCopy />
                </button>
              </div>
            </div>
            <div className="thumb-placeholder">Text Only</div>
          </li>
        ))}
        {filtered.length === 0 && <p style={{ padding: "24px 0", color: "var(--color-gray-500)" }}>該当するストーリーはありません。</p>}
      </ul>
    </div>
  );
}
