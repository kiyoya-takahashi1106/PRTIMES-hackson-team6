import { useState } from "react";
import { Link } from "react-router-dom";
import { pressReleases, type PressReleaseStatus } from "../data/mockData";
import { IconCopy, IconSearch } from "../components/icons";
import "./ListPage.css";

const badgeClass: Record<PressReleaseStatus, string> = {
  下書き: "badge-draft",
  予約済み: "badge-reserved",
  公開済み: "badge-published",
};

export default function PressReleaseList() {
  const [query, setQuery] = useState("");

  const filtered = pressReleases.filter((r) => r.title.includes(query));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">プレスリリース</h1>
      </div>

      <div className="list-toolbar">
        <div className="list-toolbar__actions">
          <Link to="/press-releases/new" className="btn btn-solid">
            新規作成
          </Link>
          <button type="button" className="btn btn-outline">
            テンプレートから新規作成
          </button>
        </div>
        <div className="search-input">
          <IconSearch />
          <input
            placeholder="検索"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="list-filters">
        <span>{filtered.length} 件</span>
        <select className="filter-select" defaultValue="all">
          <option value="all">全てのステータス</option>
          <option value="draft">下書き</option>
          <option value="reserved">予約済み</option>
          <option value="published">公開済み</option>
        </select>
        <select className="filter-select" defaultValue="20">
          <option value="20">表示件数：20</option>
          <option value="50">表示件数：50</option>
        </select>
        <select className="filter-select" defaultValue="all">
          <option value="all">全ての期間</option>
        </select>
      </div>

      <ul className="divider-list">
        {filtered.map((release) => (
          <li className="list-row" key={release.id}>
            <div className="list-row__main">
              <div className="list-row__meta">
                <span className={`badge ${badgeClass[release.status]}`}>{release.status}</span>
                <span className="list-row__date">更新日：{release.updatedAt}</span>
              </div>
              <p className="list-row__title">{release.title}</p>
              <div className="list-row__url">
                URL：{release.url}
                <button type="button" className="icon-btn icon-btn--sm" title="URLをコピー">
                  <IconCopy />
                </button>
              </div>
              <p className="list-row__note">※上記URLは、プレスリリース配信後に有効となります</p>
            </div>
            <div className="thumb-placeholder">Text Only</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
