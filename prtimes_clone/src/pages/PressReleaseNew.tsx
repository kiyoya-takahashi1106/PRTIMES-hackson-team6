import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppStateContext";
import {
  fetchMediaRecommendations,
  type MediaRecommendation,
} from "../lib/mediaRecommendations";
import BlockGuard from "../components/onboarding/BlockGuard";
import "./CreateForm.css";
import "./DraftSuccess.css";

const flowSteps = ["リリース本文", "追加情報設定", "配信先を選択", "配信詳細設定", "最終確認"];
const purposes = ["CM放映", "新商品", "イベント", "キャンペーン", "業績発表"];
const categories = ["モバイル端末", "ネットサービス", "アプリ", "ビジネス", "エンタメ"];

export default function PressReleaseNew() {
  const { addPressRelease, mediaLists, setGuidancePaused } = useAppState();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectionMode, setSelectionMode] = useState<"manual" | "auto">("manual");
  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [purpose, setPurpose] = useState(purposes[0]);
  const [category, setCategory] = useState(categories[0]);
  const [subCategory, setSubCategory] = useState(categories[1]);
  const [scheduleType, setScheduleType] = useState<"now" | "reserve">("now");
  const [recommendations, setRecommendations] = useState<MediaRecommendation[]>([]);
  const [recommendationStatus, setRecommendationStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [recommendationError, setRecommendationError] = useState("");
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const filteredMediaLists = mediaLists.filter((list) => list.name.toLowerCase().includes(search.toLowerCase()));
  const selectedLists = mediaLists.filter((list) => selectedListIds.includes(list.id));
  const destinationCount =
    selectionMode === "auto"
      ? recommendations.length
      : selectedLists.reduce((sum, list) => sum + Math.max(list.count, 0), 0);
  const canGoNext =
    step !== 2 ||
    (selectionMode === "auto" ? recommendationStatus === "success" && recommendations.length > 0 : selectedListIds.length > 0);

  function toggleList(id: string) {
    setSelectedListIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  async function selectAuto() {
    setSelectionMode("auto");
    setRecommendationStatus("loading");
    setRecommendationError("");
    setRecommendations([]);
    try {
      const result = await fetchMediaRecommendations(title, body);
      setRecommendations(result.recommendations);
      setRecommendationStatus("success");
    } catch (error) {
      setRecommendationError(error instanceof Error ? error.message : "メディアの自動選択に失敗しました。");
      setRecommendationStatus("error");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addPressRelease(title);
    setGuidancePaused(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className="create-form__success">
        <div className="create-form__success-icon">🎉</div>
        <h1 className="page-title" style={{ marginBottom: 8 }}>
          下書きを作成しました
        </h1>
        <p style={{ color: "var(--color-gray-700)", fontSize: 13, marginBottom: 24 }}>
          「PR活動の進み具合」のステップ3が完了しました。続けて効果測定のステップに進んでみましょう。
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button className="btn btn-outline" onClick={() => navigate("/press-releases")}>
            一覧を見る
          </button>
          <button className="btn btn-solid" onClick={() => navigate("/analytics")}>
            効果測定へ進む
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="release-page">
      <div className="breadcrumb">
        <span>プレスリリース</span>
        <span>新規作成</span>
      </div>
      <div className="page-header release-page__header">
        <h1 className="page-title">プレスリリース新規作成</h1>
      </div>

      <BlockGuard>
        <p className="release-page__intro">
          ストーリーとの違いに迷ったら
          <Link to="/posts/new" style={{ color: "var(--color-blue)", marginLeft: 4 }}>
            比較ページ
          </Link>
          を確認してください。
        </p>

        <form className="create-form release-flow" onSubmit={handleSubmit}>
          <div className="release-flow__toolbar">
            <div>
              <span className="release-flow__status">下書き</span>
              <strong>配信設定</strong>
            </div>
            <div className="release-flow__toolbar-actions">
              <button className="btn btn-outline btn-sm" type="button">
                共有
              </button>
              <button className="btn btn-solid btn-sm" type="submit">
                保存
              </button>
            </div>
          </div>

          <div className="release-flow__stepper" aria-label="配信設定の進行状況">
            {flowSteps.map((label, index) => (
              <button
                className={
                  "release-flow__step" +
                  (index === step ? " release-flow__step--active" : "") +
                  (index < step ? " release-flow__step--done" : "")
                }
                key={label}
                onClick={() => setStep(index)}
                type="button"
              >
                <span>{index + 1}</span>
                {label}
              </button>
            ))}
          </div>

          {step === 0 && (
            <section className="release-flow__panel">
              <PanelHead stepLabel="STEP 1" title="リリース本文" body="タイトルと本文を作成します。追加情報は次のステップで設定します。" />
              <div className="release-editor release-editor--body-only">
                <label className="release-editor__body">
                  <span className="create-form__label">タイトル</span>
                  <input
                    autoFocus
                    className="create-form__input release-editor__title"
                    placeholder="例：〇〇株式会社、新サービス「△△」を提供開始"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <span className="create-form__label">本文</span>
                  <textarea
                    className="create-form__textarea"
                    placeholder="配信内容の本文を入力してください"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    data-guide-id="press-release-body"
                  />
                </label>
              </div>
            </section>
          )}

          {step === 1 && (
            <section className="release-flow__panel">
              <PanelHead
                stepLabel="STEP 2"
                title="追加情報設定"
                body="配信先の推薦や検索に使う目的・カテゴリを設定します。"
              />
              <div className="release-additional">
                <SelectField label="プレスリリースの目的" value={purpose} options={purposes} onChange={setPurpose} />
                <SelectField label="ビジネスカテゴリ" value={category} options={categories} onChange={setCategory} />
                <SelectField label="サブカテゴリ" value={subCategory} options={categories} onChange={setSubCategory} />
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="release-flow__panel">
              <PanelHead
                stepLabel="STEP 3"
                title="配信先を選択"
                body="メディアリストを選ぶと、配信予定数と最終確認に反映されます。"
              />

              <div className="release-destination__mode">
                <label className={selectionMode === "manual" ? "is-selected" : ""}>
                  <input
                    checked={selectionMode === "manual"}
                    name="selectionMode"
                    onChange={() => setSelectionMode("manual")}
                    type="radio"
                  />
                  <span>
                    <strong>手動選択</strong>
                    <small>選択したメディアリストへプレスリリースを配信します</small>
                  </span>
                </label>
                <label className={selectionMode === "auto" ? "is-selected" : ""}>
                  <input
                    checked={selectionMode === "auto"}
                    name="selectionMode"
                    onChange={selectAuto}
                    type="radio"
                  />
                  <span>
                    <strong>自動選択</strong>
                    <small>内容が近い過去のプレスリリースから掲載メディアを自動で選択します</small>
                  </span>
                </label>
              </div>

              <div className="release-destination__summary-grid">
                <div>
                  <span>配信予定メディア数</span>
                  <strong>{destinationCount}</strong>
                </div>
                <div>
                  <span>選択済みリスト</span>
                  <strong>{selectionMode === "manual" ? selectedListIds.length : "自動"}</strong>
                </div>
                <div>
                  <span>利用可能リスト</span>
                  <strong>{mediaLists.length}</strong>
                </div>
              </div>

              {selectionMode === "manual" ? (
                <>
                  <div className="release-destination__list-head">
                    <div className="release-destination__tabs">
                      <button className="is-active" type="button">
                        PR TIMESリスト
                      </button>
                      <button type="button">インポートリスト</button>
                    </div>
                    <div className="release-destination__search">
                      <span>⌕</span>
                      <input
                        aria-label="メディアリストを検索"
                        placeholder="検索"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                      {search && (
                        <button type="button" onClick={() => setSearch("")}>
                          ×
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="release-destination__sort-row">
                    <span>{filteredMediaLists.length} 項目</span>
                    <div>
                      <button type="button">メディア件数</button>
                      <button type="button">更新日</button>
                    </div>
                  </div>

                  <div className="release-destination__list">
                    {filteredMediaLists.length === 0 && (
                      <div className="release-destination__empty">条件に一致するメディアリストがありません。</div>
                    )}
                    {filteredMediaLists.map((list) => (
                      <label
                        className={
                          "release-destination__item" +
                          (selectedListIds.includes(list.id) ? " release-destination__item--selected" : "")
                        }
                        key={list.id}
                      >
                        <input
                          checked={selectedListIds.includes(list.id)}
                          onChange={() => toggleList(list.id)}
                          type="checkbox"
                        />
                        <span className="release-destination__item-body">
                          <span className="release-destination__item-meta">更新日：{list.updatedAt}</span>
                          <strong>{list.name}</strong>
                          <span className="release-destination__breakdown">
                            {list.breakdown.map((item) => `${item.label} ${item.value}`).join("　")}
                          </span>
                        </span>
                        <span className="release-destination__count">
                          <strong>{list.count}</strong>
                          <small>媒体</small>
                        </span>
                        <button className="release-destination__more" type="button" aria-label={`${list.name}の詳細`}>
                          ...
                        </button>
                      </label>
                    ))}
                  </div>
                </>
              ) : (
                <div className="release-destination__auto-panel">
                  {recommendationStatus === "loading" && (
                    <>
                      <strong>類似するプレスリリースを検索しています。</strong>
                      <span>掲載実績のあるメディアを選定中です。</span>
                    </>
                  )}
                  {recommendationStatus === "success" && (
                    <>
                      <strong>{recommendations.length}媒体を自動選択しました。</strong>
                      <span>過去の掲載実績をもとに選定しています。</span>
                      <ol className="release-destination__recommendations">
                        {recommendations.map((item) => (
                          <li key={item.mediaId ?? item.siteName}>
                            <span>{item.siteName}</span>
                          </li>
                        ))}
                      </ol>
                    </>
                  )}
                  {recommendationStatus === "error" && (
                    <>
                      <strong>メディアを自動選択できませんでした。</strong>
                      <span>{recommendationError}</span>
                      <button className="btn btn-outline btn-sm" onClick={selectAuto} type="button">
                        再試行
                      </button>
                    </>
                  )}
                  {recommendationStatus === "idle" && (
                    <span>自動選択を選ぶと、類似するプレスリリースから掲載メディアを推薦します。</span>
                  )}
                </div>
              )}
            </section>
          )}

          {step === 3 && (
            <section className="release-flow__panel">
              <PanelHead
                stepLabel="STEP 4"
                title="配信詳細設定"
                body="配信タイミングを選択します。予約配信の日時指定は次の実装で拡張できます。"
              />
              <div className="release-flow__choice-list">
                <ScheduleChoice
                  active={scheduleType === "now"}
                  name="scheduleType"
                  title="今すぐ配信"
                  body="最終確認後にすぐ配信できる状態にします"
                  onChange={() => setScheduleType("now")}
                />
                <ScheduleChoice
                  active={scheduleType === "reserve"}
                  name="scheduleType"
                  title="予約配信"
                  body="配信日時をあとで指定します"
                  onChange={() => setScheduleType("reserve")}
                />
              </div>
            </section>
          )}

          {step === 4 && (
            <section className="release-flow__panel">
              <div className="release-confirm__bar">
                <button type="button" className="btn btn-outline" onClick={() => setStep(0)}>
                  編集
                </button>
                <button type="button" className="btn btn-outline">
                  プレビューを見る
                </button>
              </div>

              <PanelHead stepLabel="STEP 5" title="最終確認" body="内容に問題がなければ配信に進みます。" />
              <div className="release-confirm__grid">
                <ConfirmSection
                  title="リリース本文"
                  rows={[`タイトル：${title.trim() || "未入力"}`, `本文：${body.trim() || "未入力"}`]}
                />
                <ConfirmSection
                  title="追加情報"
                  rows={[
                    `プレスリリースの目的：${purpose}`,
                    `ビジネスカテゴリ：${category}`,
                    `サブカテゴリ：${subCategory}`,
                  ]}
                />
                <ConfirmSection
                  title="配信先"
                  rows={[
                    selectionMode === "auto"
                      ? "自動選択"
                      : selectedLists.length
                        ? selectedLists.map((list) => list.name).join("、")
                        : "未選択",
                    `配信予定メディア数：${destinationCount}`,
                  ]}
                />
                <ConfirmSection title="配信設定" rows={[scheduleType === "now" ? "今すぐ配信" : "予約配信"]} />
              </div>
            </section>
          )}

          <div className="create-form__actions release-flow__actions">
            {step > 0 && (
              <button className="btn btn-outline" onClick={() => setStep((prev) => prev - 1)} type="button">
                戻る
              </button>
            )}
            <button className="btn btn-outline" type="submit">
              下書き保存
            </button>
            {step < flowSteps.length - 1 ? (
              <button
                className="btn btn-solid"
                disabled={!canGoNext}
                onClick={() => setStep((prev) => prev + 1)}
                type="button"
              >
                次へ
              </button>
            ) : (
              <button className="btn btn-solid" data-guide-id="press-release-submit" type="submit">
                配信する
              </button>
            )}
          </div>
        </form>
      </BlockGuard>
    </div>
  );
}

function PanelHead({ stepLabel, title, body }: { stepLabel: string; title: string; body: string }) {
  return (
    <div className="release-flow__panel-head">
      <span>{stepLabel}</span>
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label>
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
    </label>
  );
}

function ScheduleChoice({
  active,
  name,
  title,
  body,
  onChange,
}: {
  active: boolean;
  name: string;
  title: string;
  body: string;
  onChange: () => void;
}) {
  return (
    <label className={active ? "is-selected" : ""}>
      <input checked={active} name={name} onChange={onChange} type="radio" />
      <span>
        <strong>{title}</strong>
        <small>{body}</small>
      </span>
    </label>
  );
}

function ConfirmSection({ title, rows }: { title: string; rows: string[] }) {
  return (
    <div className="release-confirm__section">
      <h2>{title}</h2>
      {rows.map((row) => (
        <p key={row}>{row}</p>
      ))}
    </div>
  );
}
