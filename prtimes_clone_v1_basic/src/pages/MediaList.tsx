import { useState } from "react";
import { Link } from "react-router-dom";
import { mediaLists } from "../data/mockData";
import { IconSearch } from "../components/icons";
import "./MediaList.css";

export default function MediaList() {
  const [tab, setTab] = useState<"pr" | "import">("pr");
  const [query, setQuery] = useState("");

  const filtered = mediaLists.filter((list) => list.name.includes(query));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">メディアリスト</h1>
      </div>

      <div className="list-toolbar">
        <div className="list-toolbar__actions">
          <Link to="/media-lists/new" className="btn btn-solid">
            新規作成
          </Link>
          <span className="media-help">
            PR TIMESリストの作成方法は<a href="#guide">こちらをクリック</a>
          </span>
        </div>
        <div className="search-input">
          <IconSearch />
          <input placeholder="検索" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="tabs">
        <div className={"tab" + (tab === "pr" ? " active" : "")} onClick={() => setTab("pr")}>
          PR TIMESリスト
        </div>
        <div className={"tab" + (tab === "import" ? " active" : "")} onClick={() => setTab("import")}>
          インポートリスト
        </div>
      </div>

      {tab === "pr" ? (
        <>
          <div className="list-filters" style={{ borderBottom: "none" }}>
            <span>{filtered.length} 項目</span>
            <select className="filter-select" defaultValue="count">
              <option value="count">メディア件数</option>
              <option value="name">名前</option>
            </select>
            <select className="filter-select" defaultValue="updated">
              <option value="updated">更新日</option>
            </select>
          </div>

          <ul className="divider-list">
            {filtered.map((list) => (
              <li className="media-row" key={list.id}>
                <label className="media-row__checkbox">
                  <input type="checkbox" />
                </label>
                <div className="media-row__main">
                  <div className="media-row__meta">
                    <span>更新日：{list.updatedAt}</span>
                  </div>
                  <p className="media-row__title">{list.name}</p>
                  <div className="media-row__breakdown">
                    {list.breakdown.map((b) => (
                      <span key={b.label}>
                        {b.label} {b.value}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="media-row__count">{list.count}</div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="placeholder-page">
          <p>インポートリストはまだありません。</p>
        </div>
      )}
    </div>
  );
}
