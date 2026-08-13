import { company } from "../data/mockData";
import "./CompanySettings.css";

const rows: { label: string; value: string; note?: string }[] = [
  { label: "法人名", value: company.name },
  {
    label: "法人名（カナ）",
    value: company.nameKana,
    note: "※変更をご希望の場合は、法人名変更申請フォームよりご依頼ください。",
  },
  { label: "法人名略称", value: company.shortName },
  { label: "会社設立日", value: company.foundedAt },
  { label: "代表者名", value: company.representativeName },
  { label: "代表者役職", value: company.representativeTitle },
  { label: "本社所在地", value: `${company.postalCode}\n${company.address}` },
  { label: "電話番号", value: company.phone },
  { label: "上場区分", value: company.marketSegment },
];

export default function CompanySettings() {
  return (
    <div>
      <div className="breadcrumb">
        <span>設定</span>
        <span>企業情報</span>
      </div>
      <div className="page-header">
        <h1 className="page-title">企業情報</h1>
        <button type="button" className="btn btn-solid">
          情報を変更
        </button>
      </div>

      <div className="info-table">
        {rows.map((row) => (
          <div className="info-row" key={row.label}>
            <div className="info-label">{row.label}</div>
            <div className="info-value">
              {row.value.split("\n").map((line, i) => (
                <div key={i}>{line}</div>
              ))}
              {row.note && <div className="info-note">{row.note}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
