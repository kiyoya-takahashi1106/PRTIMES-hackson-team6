import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppStateProvider } from "./context/AppStateContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import PressReleaseList from "./pages/PressReleaseList";
import PressReleaseNew from "./pages/PressReleaseNew";
import MediaList from "./pages/MediaList";
import MediaListNew from "./pages/MediaListNew";
import StoryList from "./pages/StoryList";
import StoryNew from "./pages/StoryNew";
import PostTypeSelect from "./pages/PostTypeSelect";
import AnalyticsReport from "./pages/AnalyticsReport";
import CompanySettings from "./pages/CompanySettings";
import GuidancePage from "./pages/GuidancePage";
import Placeholder from "./pages/Placeholder";

export default function App() {
  return (
    <AppStateProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />

            <Route path="/posts/new" element={<PostTypeSelect />} />

            <Route path="/press-releases" element={<PressReleaseList />} />
            <Route path="/press-releases/new" element={<PressReleaseNew />} />

            <Route path="/media-lists" element={<MediaList />} />
            <Route path="/media-lists/new" element={<MediaListNew />} />
            <Route path="/media-lists/import" element={<Placeholder title="メディアリスト インポート" />} />

            <Route path="/stories" element={<StoryList />} />
            <Route path="/stories/new" element={<StoryNew />} />

            <Route path="/analytics" element={<AnalyticsReport />} />
            <Route path="/analytics/partners" element={<Placeholder title="提携オンラインメディア" />} />
            <Route path="/analytics/social" element={<Placeholder title="ソーシャル" />} />
            <Route path="/analytics/ad-value" element={<Placeholder title="広告換算ツール" />} />

            <Route path="/guidance" element={<GuidancePage />} />

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
    </AppStateProvider>
  );
}
