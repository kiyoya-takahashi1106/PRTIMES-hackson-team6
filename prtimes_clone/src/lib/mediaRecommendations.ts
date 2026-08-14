export interface MediaRecommendation {
  mediaId: string | null;
  siteName: string;
  score: number;
  sourceReleaseId: string;
}

interface MediaRecommendationResponse {
  recommendations: MediaRecommendation[];
  similarReleaseCount: number;
  model: string;
  dimensions: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

export async function fetchMediaRecommendations(
  title: string,
  body: string
): Promise<MediaRecommendationResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/media-recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, lead_paragraph: "" }),
    });
  } catch {
    throw new Error("推薦APIに接続できません。しばらくしてから再試行してください。");
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(payload?.detail ?? "メディアの自動選択に失敗しました。");
  }

  return (await response.json()) as MediaRecommendationResponse;
}
