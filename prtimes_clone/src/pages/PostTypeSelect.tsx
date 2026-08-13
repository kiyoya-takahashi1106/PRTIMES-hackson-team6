import { Link } from "react-router-dom";
import PhaseIntro from "../components/onboarding/PhaseIntro";
import "./PostTypeSelect.css";

const options = [
  {
    key: "press",
    title: "プレスリリース",
    to: "/press-releases/new",
    tagline: "「何が起きたか」を正式に発表する",
    description:
      "新商品・新サービスの発表や、業務提携、決算などの「事実」を、報道機関向けに正式な文書として発信する機能です。",
    points: ["公式な発表・お知らせに最適", "新聞・Web媒体などへの転載を狙える", "5W1Hを明確に、簡潔にまとめる"],
    accent: "press",
  },
  {
    key: "story",
    title: "ストーリー",
    to: "/stories/new",
    tagline: "「なぜ・どうやって」の裏側を伝える",
    description:
      "プレスリリースの背景にある想いや開発秘話、プロジェクトのプロセスなど、「行動や成果の裏側にあるエピソード」を伝える機能です。",
    points: ["開発の裏話や、社員・チームの想いを発信", "共感を通じてファンやメディアとの関係を深める", "写真や体験談を交えた自由な形式でOK"],
    accent: "story",
  },
];

export default function PostTypeSelect() {
  return (
    <div>
      <div className="breadcrumb">
        <span>投稿</span>
        <span>新規作成</span>
      </div>
      <div className="page-header">
        <h1 className="page-title">何を配信しますか？</h1>
      </div>

      <PhaseIntro
        step="content"
        title="プレスリリースとストーリー、どちらを使う？"
        body="「発表したい事実」があるならプレスリリース、その「裏側にあるエピソードや想い」を伝えたいならストーリーがおすすめです。迷ったら下記の比較を参考にしてください。"
      />

      <div className="post-type-grid">
        {options.map((opt) => (
          <Link
            to={opt.to}
            className={`post-type-card post-type-card--${opt.accent}`}
            key={opt.key}
            data-guide-id={opt.key === "press" ? "post-type-press" : "post-type-story"}
          >
            <div className="post-type-card__tag">{opt.tagline}</div>
            <h2 className="post-type-card__title">{opt.title}</h2>
            <p className="post-type-card__desc">{opt.description}</p>
            <ul className="post-type-card__points">
              {opt.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <span className="post-type-card__cta">{opt.title}を作成する →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
