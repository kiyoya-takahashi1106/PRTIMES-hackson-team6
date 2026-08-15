import unittest

from recommendation import build_embedding_text, rank_media


class RecommendationTest(unittest.TestCase):
    def test_build_embedding_text_omits_empty_parts(self) -> None:
        self.assertEqual(
            build_embedding_text(" title ", "", " body "),
            "title\n\nbody",
        )

    def test_rank_media_deduplicates_by_media_id_and_keeps_max_score(self) -> None:
        rows = [
            {"media_id": 7, "site_name": "Example", "similarity": 0.71, "release_id": 1},
            {"media_id": 7, "site_name": "Example", "similarity": 0.92, "release_id": 2},
            {"media_id": 8, "site_name": "News", "similarity": 0.83, "release_id": 3},
        ]

        self.assertEqual(
            rank_media(rows),
            [
                {"mediaId": "7", "siteName": "Example", "score": 0.92, "sourceReleaseId": "2"},
                {"mediaId": "8", "siteName": "News", "score": 0.83, "sourceReleaseId": "3"},
            ],
        )

    def test_rank_media_falls_back_to_site_name_identity(self) -> None:
        rows = [
            {"media_id": None, "site_name": "Example", "similarity": 0.6, "release_id": 1},
            {"media_id": None, "site_name": "Example", "similarity": 0.7, "release_id": 2},
        ]

        self.assertEqual(len(rank_media(rows)), 1)
        self.assertEqual(rank_media(rows)[0]["score"], 0.7)


if __name__ == "__main__":
    unittest.main()
