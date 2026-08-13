import { useState } from "react";
import { useAppState } from "../context/AppStateContext";
import PhaseIntro from "../components/onboarding/PhaseIntro";
import "./CompanySettings.css";

export default function CompanySettings() {
  const { company, onboarding, completeCompanyProfile } = useAppState();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(company);

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

  function openEdit() {
    setForm(company);
    setEditing(true);
  }

  function save() {
    completeCompanyProfile(form);
    setEditing(false);
  }

  return (
    <div>
      <div className="breadcrumb">
        <span>設定</span>
        <span>企業情報</span>
      </div>
      <div className="page-header">
        <h1 className="page-title">
          企業情報
          {!onboarding.isCompanyProfileDone && <span className="company-status company-status--todo">未完了</span>}
          {onboarding.isCompanyProfileDone && <span className="company-status company-status--done">設定済み</span>}
        </h1>
        <button type="button" className="btn btn-solid" onClick={openEdit}>
          情報を変更
        </button>
      </div>

      <PhaseIntro
        step="company"
        title="まずは企業プロフィールを整えましょう"
        body="法人名や所在地、代表者名などの基本情報を確認・保存すると、次のステップ「メディアリストの設定」に進めるようになります。内容はいつでも変更できます。"
      />

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

      {editing && (
        <div className="company-modal__backdrop" onClick={() => setEditing(false)}>
          <div className="company-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="company-modal__title">企業情報を変更</h2>
            <div className="company-modal__grid">
              <label>
                法人名
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </label>
              <label>
                代表者名
                <input
                  value={form.representativeName}
                  onChange={(e) => setForm({ ...form, representativeName: e.target.value })}
                />
              </label>
              <label>
                代表者役職
                <input
                  value={form.representativeTitle}
                  onChange={(e) => setForm({ ...form, representativeTitle: e.target.value })}
                />
              </label>
              <label>
                電話番号
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </label>
              <label className="company-modal__grid-full">
                本社所在地
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </label>
            </div>
            <div className="company-modal__actions">
              <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>
                キャンセル
              </button>
              <button type="button" className="btn btn-solid" onClick={save}>
                保存する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
