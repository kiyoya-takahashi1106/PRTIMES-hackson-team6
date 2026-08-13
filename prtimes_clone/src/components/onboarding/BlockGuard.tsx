import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAppState } from "../../context/AppStateContext";
import "./BlockGuard.css";

interface Props {
  children: ReactNode;
}

export default function BlockGuard({ children }: Props) {
  const { onboarding, canCreateContent } = useAppState();

  if (canCreateContent) return <>{children}</>;

  const missing = [
    !onboarding.isCompanyProfileDone && { label: "企業プロフィール設定", path: "/settings/company" },
    !onboarding.isMediaListDone && { label: "メディアリストの設定", path: "/media-lists" },
  ].filter(Boolean) as { label: string; path: string }[];

  return (
    <div className="block-guard">
      <div className="block-guard__icon">🔒</div>
      <p className="block-guard__title">まずは準備を済ませましょう</p>
      <p className="block-guard__desc">
        プレスリリースやストーリーを配信する前に、次の設定を完了させる必要があります。
      </p>
      <ul className="block-guard__list">
        {missing.map((m) => (
          <li key={m.path}>
            <Link to={m.path} className="btn btn-outline btn-sm">
              {m.label}へ進む
            </Link>
          </li>
        ))}
      </ul>
      <Link to="/" className="block-guard__back">
        ダッシュボードに戻る
      </Link>
    </div>
  );
}
