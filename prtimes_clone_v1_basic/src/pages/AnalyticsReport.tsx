import { useState } from "react";
import { reportDaily, reportSummary } from "../data/mockData";
import "./AnalyticsReport.css";

const CHART_WIDTH = 720;
const CHART_HEIGHT = 220;

export default function AnalyticsReport() {
  const [tab, setTab] = useState<"press" | "story">("press");

  const maxValue = Math.max(...reportDaily.map((d) => d.pv), 1);
  const stepX = CHART_WIDTH / (reportDaily.length - 1);

  const points = reportDaily.map((d, i) => {
    const x = i * stepX;
    const y = CHART_HEIGHT - (d.pv / maxValue) * CHART_HEIGHT;
    return `${x},${y}`;
  });

  const areaPoints = `0,${CHART_HEIGHT} ${points.join(" ")} ${CHART_WIDTH},${CHART_HEIGHT}`;

  return (
    <div>
      <div className="breadcrumb">
        <span>分析データ</span>
        <span>レポート</span>
      </div>
      <div className="page-header">
        <h1 className="page-title">レポート</h1>
      </div>

      <div className="tabs" style={{ marginBottom: 24 }}>
        <div className={"tab" + (tab === "press" ? " active" : "")} onClick={() => setTab("press")}>
          プレスリリース
        </div>
        <div className={"tab" + (tab === "story" ? " active" : "")} onClick={() => setTab("story")}>
          ストーリー
        </div>
      </div>

      <div className="report-range">
        <input type="date" defaultValue="2026-07-14" className="filter-select" />
        <span>~</span>
        <input type="date" defaultValue="2026-08-13" className="filter-select" />
        <button type="button" className="btn btn-outline btn-sm report-range__save">
          データ保存
        </button>
      </div>

      {tab === "press" ? (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-card__label">ページビュー</div>
              <div className="stat-card__value">{reportSummary.pageViews}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__label">訪問者数</div>
              <div className="stat-card__value">{reportSummary.visitors}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__label">転載サイト</div>
              <div className="stat-card__value">{reportSummary.reprintSites}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__label">フォロワー数</div>
              <div className="stat-card__value">{reportSummary.followers}</div>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-legend">
              <span>
                <i className="chart-legend__dot chart-legend__dot--pv" />
                ページビュー数
              </span>
              <span>
                <i className="chart-legend__dot chart-legend__dot--uu" />
                訪問者数(UU)
              </span>
            </div>
            <svg
              className="chart-svg"
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              preserveAspectRatio="none"
            >
              <polygon points={areaPoints} className="chart-area" />
              <polyline points={points.join(" ")} className="chart-line" />
            </svg>
            <div className="chart-x-axis">
              {reportDaily.map((d) => (
                <span key={d.date}>{d.date}</span>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="placeholder-page">
          <p>ストーリーのレポートはまだデータがありません。</p>
        </div>
      )}
    </div>
  );
}
