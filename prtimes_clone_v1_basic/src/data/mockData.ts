export const company = {
  name: "株式会社ハッカソン",
  id: "99125",
  nameKana: "ハッカソン",
  shortName: "未設定",
  foundedAt: "未設定",
  representativeName: "ハッカソン代表",
  representativeTitle: "事業主",
  postalCode: "100-0000",
  address: "ハッカソン",
  phone: "080-9999-9999",
  marketSegment: "東証スタンダード",
};

export type PressReleaseStatus = "下書き" | "予約済み" | "公開済み";

export interface PressRelease {
  id: string;
  title: string;
  status: PressReleaseStatus;
  updatedAt: string;
  url: string;
}

export const pressReleases: PressRelease[] = [
  {
    id: "000000024",
    title: "テスト配信リリース24",
    status: "下書き",
    updatedAt: "2026.08.13 (木) 11:49",
    url: "https://latest.stg-prtimes.net/main/html/rd/p/000000024.000099125.html",
  },
  {
    id: "000000023",
    title: "テスト配信リリース23",
    status: "下書き",
    updatedAt: "2026.08.13 (木) 11:38",
    url: "https://latest.stg-prtimes.net/main/html/rd/p/000000023.000099125.html",
  },
  {
    id: "000000022",
    title: "新商品発売のお知らせ",
    status: "公開済み",
    updatedAt: "2026.08.10 (月) 15:02",
    url: "https://latest.stg-prtimes.net/main/html/rd/p/000000022.000099125.html",
  },
  {
    id: "000000021",
    title: "サービスリニューアルのご案内",
    status: "予約済み",
    updatedAt: "2026.08.05 (水) 09:40",
    url: "https://latest.stg-prtimes.net/main/html/rd/p/000000021.000099125.html",
  },
];

export interface MediaList {
  id: string;
  name: string;
  updatedAt: string;
  count: number;
  breakdown: { label: string; value: number }[];
}

const breakdownLabels = ["テレビ", "雑誌", "新聞", "Web", "フリーペーパー", "ラジオ", "通信社"];

function emptyBreakdown() {
  return breakdownLabels.map((label) => ({ label, value: 0 }));
}

export const mediaLists: MediaList[] = [
  {
    id: "list-5",
    name: "名称未設定リスト(5)",
    updatedAt: "2026.08.13（木）11:21",
    count: 0,
    breakdown: emptyBreakdown(),
  },
  {
    id: "list-4",
    name: "名称未設定リスト(4)",
    updatedAt: "2026.08.13（木）11:11",
    count: 0,
    breakdown: emptyBreakdown(),
  },
  {
    id: "list-3",
    name: "IT・Web媒体リスト",
    updatedAt: "2026.08.02（日）18:44",
    count: 12,
    breakdown: [
      { label: "テレビ", value: 0 },
      { label: "雑誌", value: 1 },
      { label: "新聞", value: 0 },
      { label: "Web", value: 10 },
      { label: "フリーペーパー", value: 0 },
      { label: "ラジオ", value: 0 },
      { label: "通信社", value: 1 },
    ],
  },
];

export type StoryStatus = "下書き" | "予約済み" | "公開済み" | "非公開";

export interface Story {
  id: string;
  title: string;
  status: StoryStatus;
  updatedAt: string;
  url: string;
}

export const stories: Story[] = [
  {
    id: "x1eDkmfZ9Wx",
    title: "タイトル無し",
    status: "下書き",
    updatedAt: "2026.8.13 (木) 11:27",
    url: "https://latest.stg-prtimes.net/story/detail/x1eDkmfZ9Wx",
  },
  {
    id: "roladMhz1Rb",
    title: "123",
    status: "下書き",
    updatedAt: "2026.8.13 (木) 11:27",
    url: "https://latest.stg-prtimes.net/story/detail/roladMhz1Rb",
  },
];

export const reportSummary = {
  rangeStart: "2026/07/14",
  rangeEnd: "2026/08/13",
  pageViews: 12,
  visitors: 12,
  reprintSites: 0,
  followers: 0,
};

export const reportDaily = [
  { date: "07/14", pv: 0, uu: 0 },
  { date: "07/21", pv: 0, uu: 0 },
  { date: "07/28", pv: 0, uu: 0 },
  { date: "08/04", pv: 1, uu: 1 },
  { date: "08/09", pv: 3, uu: 3 },
  { date: "08/11", pv: 6, uu: 6 },
  { date: "08/12", pv: 9, uu: 9 },
  { date: "08/13", pv: 12, uu: 12 },
];

export const dashboardNotices = [
  {
    id: "notice-1",
    title: "テスト4",
    body: "",
    collapsed: true,
  },
  {
    id: "notice-2",
    title: "コンテンツ掲載基準を更新しました",
    body: "「日本初」「No.1」等の最上級表現の改定や、メディアタイアップ広告に関する基準の新設など、コンテンツ掲載基準を更新しました。ご配信前に、ぜひ改定・新設のご案内をご確認いただけますと幸いです。",
    collapsed: false,
  },
  {
    id: "notice-3",
    title: "Webクリッピングで SNS投稿の取得が可能になりました",
    body: "Webクリッピングのクリップ調査で、指定したキーワードに基づきSNS（X、Instagram、TikTok）上の投稿を毎日自動で取得し、一覧で確認できるようになりました。Web記事だけでなく、SNS上の生活者の反響もまとめてご確認いただけます。",
    collapsed: false,
  },
];
