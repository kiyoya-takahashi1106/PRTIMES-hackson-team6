import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import PressReleaseList from "./pages/PressReleaseList";
import MediaList from "./pages/MediaList";
import StoryList from "./pages/StoryList";
import AnalyticsReport from "./pages/AnalyticsReport";
import CompanySettings from "./pages/CompanySettings";
import Placeholder from "./pages/Placeholder";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />

          <Route path="/press-releases" element={<PressReleaseList />} />
          <Route path="/press-releases/new" element={<Placeholder title="プレスリリース新規作成" />} />

          <Route path="/media-lists" element={<MediaList />} />
          <Route path="/media-lists/new" element={<Placeholder title="メディアリスト新規作成" />} />
          <Route path="/media-lists/import" element={<Placeholder title="メディアリスト インポート" />} />

          <Route path="/stories" element={<StoryList />} />
          <Route path="/stories/new" element={<Placeholder title="ストーリー新規作成" />} />

          <Route path="/analytics" element={<AnalyticsReport />} />
          <Route path="/analytics/partners" element={<Placeholder title="提携オンラインメディア" />} />
          <Route path="/analytics/social" element={<Placeholder title="ソーシャル" />} />
          <Route path="/analytics/ad-value" element={<Placeholder title="広告換算ツール" />} />

          <Route path="/web-clipping" element={<Placeholder title="Webクリッピング" />} />
          <Route path="/company-page" element={<Placeholder title="企業ページ" />} />

          <Route path="/settings/company" element={<CompanySettings />} />
          <Route path="/settings/user" element={<Placeholder title="ユーザー情報" />} />
          <Route path="/settings/login" element={<Placeholder title="ログイン管理" />} />
          <Route path="/settings/plan" element={<Placeholder title="料金プラン" />} />
          <Route path="/settings/billing" element={<Placeholder title="請求先情報" />} />

          <Route path="*" element={<Placeholder title="ページが見つかりません" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
