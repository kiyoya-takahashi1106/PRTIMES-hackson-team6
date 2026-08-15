import os
from dataclasses import dataclass
from typing import Any, Iterable

from openai import OpenAI
from sqlalchemy import Connection, inspect, text

from db import engine


EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIMENSIONS = 1024
SIMILAR_RELEASE_LIMIT = 30
RECOMMENDATION_LIMIT = int(os.environ.get("MEDIA_RECOMMENDATION_LIMIT", "42"))


class RecommendationDataError(RuntimeError):
    pass


@dataclass(frozen=True)
class SimilarRelease:
    company_id: Any
    release_id: Any
    similarity: float


def build_embedding_text(title: str, lead_paragraph: str, body: str) -> str:
    return "\n\n".join(part.strip() for part in (title, lead_paragraph, body) if part.strip())


def rank_media(rows: Iterable[dict[str, Any]], limit: int = RECOMMENDATION_LIMIT) -> list[dict[str, Any]]:
    ranked: dict[str, dict[str, Any]] = {}
    for row in rows:
        media_id = row.get("media_id")
        site_name = str(row.get("site_name") or "").strip()
        if media_id is None and not site_name:
            continue

        key = f"id:{media_id}" if media_id is not None else f"name:{site_name}"
        score = float(row["similarity"])
        current = ranked.get(key)
        if current is None or score > current["score"]:
            ranked[key] = {
                "mediaId": str(media_id) if media_id is not None else None,
                "siteName": site_name or f"media_id: {media_id}",
                "score": score,
                "sourceReleaseId": str(row["release_id"]),
            }

    return sorted(ranked.values(), key=lambda item: (-item["score"], item["siteName"]))[:limit]


def _table_columns(connection: Connection, table_name: str) -> set[str]:
    return {column["name"] for column in inspect(connection).get_columns(table_name)}


def _find_clip_table(connection: Connection) -> str:
    table_names = set(inspect(connection).get_table_names())
    for candidate in ("webclipping_list", "web_clipping_list"):
        if candidate in table_names:
            return candidate
    raise RecommendationDataError("webclipping_list table was not found")


def _validate_schema(connection: Connection) -> tuple[str, set[str]]:
    release_columns = _table_columns(connection, "release")
    missing_release = {"company_id", "release_id", "embedding"} - release_columns
    if missing_release:
        raise RecommendationDataError(
            f"release table is missing required columns: {', '.join(sorted(missing_release))}"
        )

    clip_table = _find_clip_table(connection)
    clip_columns = _table_columns(connection, clip_table)
    missing_clip = {"release_id"} - clip_columns
    if missing_clip:
        raise RecommendationDataError(
            f"{clip_table} table is missing required columns: {', '.join(sorted(missing_clip))}"
        )
    if "media_id" not in clip_columns and "site_name" not in clip_columns:
        raise RecommendationDataError(f"{clip_table} has neither media_id nor site_name")
    return clip_table, clip_columns


def _similar_releases(connection: Connection, embedding: list[float]) -> list[SimilarRelease]:
    vector = "[" + ",".join(str(value) for value in embedding) + "]"
    rows = connection.execute(
        text(
            """
            SELECT company_id,
                   release_id,
                   1 - (embedding <=> CAST(:embedding AS vector)) AS similarity
            FROM release
            WHERE embedding IS NOT NULL
            ORDER BY embedding <=> CAST(:embedding AS vector)
            LIMIT :limit
            """
        ),
        {"embedding": vector, "limit": SIMILAR_RELEASE_LIMIT},
    ).mappings()
    return [
        SimilarRelease(
            company_id=row["company_id"],
            release_id=row["release_id"],
            similarity=float(row["similarity"]),
        )
        for row in rows
    ]


def _clipping_rows(
    connection: Connection,
    clip_table: str,
    clip_columns: set[str],
    releases: list[SimilarRelease],
) -> list[dict[str, Any]]:
    # Both known table names are allow-listed in _find_clip_table; values stay bound parameters.
    media_id_select = "media_id" if "media_id" in clip_columns else "NULL"
    site_name_select = "site_name" if "site_name" in clip_columns else "NULL"
    has_company_id = "company_id" in clip_columns
    results: list[dict[str, Any]] = []

    for release in releases:
        company_filter = " AND company_id = :company_id" if has_company_id else ""
        rows = connection.execute(
            text(
                f"""
                SELECT {media_id_select} AS media_id,
                       {site_name_select} AS site_name
                FROM {clip_table}
                WHERE release_id = :release_id{company_filter}
                """
            ),
            {"release_id": release.release_id, "company_id": release.company_id},
        ).mappings()
        results.extend(
            {
                "media_id": row["media_id"],
                "site_name": row["site_name"],
                "similarity": release.similarity,
                "release_id": release.release_id,
            }
            for row in rows
        )
    return results


def recommend_media(title: str, lead_paragraph: str, body: str) -> dict[str, Any]:
    source_text = build_embedding_text(title, lead_paragraph, body)
    if not source_text:
        raise ValueError("title, leadParagraph, or body is required")

    if engine.dialect.name != "postgresql":
        raise RecommendationDataError("media recommendations require PostgreSQL with pgvector")

    with engine.connect() as connection:
        clip_table, clip_columns = _validate_schema(connection)
        embedding = OpenAI(api_key=os.environ.get("OPENAI_API_KEY")).embeddings.create(
            model=EMBEDDING_MODEL,
            input=source_text,
            dimensions=EMBEDDING_DIMENSIONS,
        ).data[0].embedding
        if len(embedding) != EMBEDDING_DIMENSIONS:
            raise RecommendationDataError(
                f"embedding dimension mismatch: expected {EMBEDDING_DIMENSIONS}, got {len(embedding)}"
            )

        similar = _similar_releases(connection, embedding)
        recommendations = rank_media(
            _clipping_rows(connection, clip_table, clip_columns, similar)
        )

    if not similar:
        raise RecommendationDataError("no releases with embeddings were found")
    if not recommendations:
        raise RecommendationDataError("no published media were found for the similar releases")

    return {
        "recommendations": recommendations,
        "similarReleaseCount": len(similar),
        "model": EMBEDDING_MODEL,
        "dimensions": EMBEDDING_DIMENSIONS,
    }
