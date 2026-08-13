import { useState } from "react";
import "./TitleHintPopover.css";

const tips = [
  "数字を入れると具体性が伝わります（例：「利用者数10万人突破」）。",
  "「誰が・何を・なぜ」を最初の一文で伝えましょう。",
  "新規性を示す言葉（「初」「新登場」「業界初」）は読者の目を引きます。",
  "30〜40文字程度に収めると、一覧表示でも見切れません。",
];

export default function TitleHintPopover() {
  const [open, setOpen] = useState(false);

  return (
    <div className="title-hint">
      <button
        type="button"
        className="title-hint__trigger"
        onClick={() => setOpen((v) => !v)}
      >
        💡 タイトル作成のコツ
      </button>
      {open && (
        <div className="title-hint__popover">
          <p className="title-hint__heading">魅力的なタイトルにするヒント</p>
          <ul>
            {tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
          <button type="button" className="title-hint__close" onClick={() => setOpen(false)}>
            閉じる
          </button>
        </div>
      )}
    </div>
  );
}
