interface Props {
  title: string;
}

export default function Placeholder({ title }: Props) {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
      </div>
      <div className="placeholder-page">
        <p>この画面はハッカソンのデモ範囲外のため準備中です。</p>
      </div>
    </div>
  );
}
