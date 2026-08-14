import os

import psycopg
from dotenv import load_dotenv
from openai import OpenAI
from pgvector.psycopg import register_vector


load_dotenv()

DATABASE_URL = os.environ["DATABASE_URL"]

MODEL = "text-embedding-3-small"
DIMENSIONS = 1024
LIMIT = 1000


openai_client = OpenAI(
    api_key=os.environ["OPENAI_API_KEY"]
)


def main():
    with psycopg.connect(DATABASE_URL) as conn:
        register_vector(conn)

        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    company_id,
                    release_id,
                    body
                FROM release
                WHERE body IS NOT NULL
                  AND body <> ''
                  AND embedding IS NULL
                ORDER BY created_at DESC
                LIMIT %s
                """,
                (LIMIT,),
            )

            releases = cur.fetchall()

        print(f"{len(releases)}件をEmbeddingします")

        for index, (company_id, release_id, body) in enumerate(releases, start=1):
            try:
                response = openai_client.embeddings.create(
                    model=MODEL,
                    input=body,
                    dimensions=DIMENSIONS,
                )

                embedding = response.data[0].embedding

                with conn.cursor() as cur:
                    cur.execute(
                        """
                        UPDATE release
                        SET embedding = %s
                        WHERE company_id = %s
                          AND release_id = %s
                        """,
                        (
                            embedding,
                            company_id,
                            release_id,
                        ),
                    )

                conn.commit()

                print(
                    f"[{index}/{len(releases)}] "
                    f"release_id={release_id} 完了"
                )

            except Exception as e:
                conn.rollback()
                print(
                    f"[ERROR] release_id={release_id}: {e}"
                )

    print("Embedding処理完了")


if __name__ == "__main__":
    main()