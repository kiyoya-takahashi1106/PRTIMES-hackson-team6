import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppStateContext";
import BlockGuard from "../components/onboarding/BlockGuard";
import TitleHintPopover from "../components/onboarding/TitleHintPopover";
import "./CreateForm.css";

export default function PressReleaseNew() {
  const { addPressRelease } = useAppState();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addPressRelease(title);
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
    <div>
      <div className="breadcrumb">
        <span>プレスリリース</span>
        <span>新規作成</span>
      </div>
      <div className="page-header">
        <h1 className="page-title">プレスリリース新規作成</h1>
      </div>

      <BlockGuard>
        <p style={{ fontSize: 13, color: "var(--color-gray-500)", marginBottom: 16 }}>
          ストーリーとの違いに迷ったら
          <Link to="/posts/new" style={{ color: "var(--color-blue)", marginLeft: 4 }}>
            比較ページ
          </Link>
          を確認してください。
        </p>

        <form className="create-form" onSubmit={handleSubmit}>
          <label className="create-form__field">
            <span className="create-form__label">タイトル</span>
            <input
              className="create-form__input"
              placeholder="例：〇〇株式会社、新サービス「△△」を提供開始"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </label>
          <TitleHintPopover />

          <label className="create-form__field" style={{ marginTop: 8 }}>
            <span className="create-form__label" style={{ marginTop: 20, display: "block" }}>
              本文
            </span>
            <textarea
              className="create-form__textarea"
              placeholder="配信内容の本文を入力してください"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </label>

          <div className="create-form__actions">
            <button type="submit" className="btn btn-outline">
              下書き保存
            </button>
            <button type="submit" className="btn btn-solid">
              配信する
            </button>
          </div>
        </form>
      </BlockGuard>
    </div>
  );
}
