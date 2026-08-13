import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../context/AppStateContext";
import "./CreateForm.css";

export default function MediaListNew() {
  const { onboarding, addMediaList } = useAppState();
  const [name, setName] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addMediaList(name);
    navigate("/media-lists");
  }

  return (
    <div>
      <div className="breadcrumb">
        <span>メディアリスト</span>
        <span>新規作成</span>
      </div>
      <div className="page-header">
        <h1 className="page-title">メディアリスト新規作成</h1>
      </div>

      {!onboarding.isCompanyProfileDone && (
        <div className="create-form__soft-tip">
          先に企業プロフィールを整えておくと、より信頼される配信につながります（必須ではありません）。
        </div>
      )}

      <form className="create-form" onSubmit={handleSubmit}>
        <label className="create-form__field">
          <span className="create-form__label">リスト名</span>
          <input
            className="create-form__input"
            placeholder="例：IT・Web媒体リスト"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </label>

        <p className="create-form__hint">
          作成後、リストの詳細画面からメディア（記者・編集部）を1件ずつ追加できます。まずは空のリストを作成してみましょう。
        </p>

        <div className="create-form__actions">
          <button type="submit" className="btn btn-solid">
            リストを作成する
          </button>
        </div>
      </form>
    </div>
  );
}
