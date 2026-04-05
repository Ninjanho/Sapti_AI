"""
Sapti AI — Horse 6(A): Curator Agent
Distills patterns across users into Hive Mind insights (periodic/cron).
"""

import json
import structlog
from pydantic import BaseModel
from app.services.supabase_client import get_supabase_admin
from app.services.llm_service import get_default_llm_service
from app.services.embedding_service import generate_embedding
from app.config.settings import get_settings

logger = structlog.get_logger()

# Structured Output Schema
class HiveMindInsight(BaseModel):
    content: str
    category: str
    tags: list[str]

class HiveMindInsightList(BaseModel):
    insights: list[HiveMindInsight]

DISTILLATION_PROMPT = """You are the Hive Mind Curator. Analyze these anonymized memory patterns from multiple users
and extract universal insights worth adding to the collective wisdom.

Memory patterns (grouped by similarity):
{patterns}

Rules:
1. NEVER include identifying information about any individual
2. Focus on universal human patterns, wisdom, and insights
3. Only extract genuinely valuable insights (not generic platitudes)
4. Quality over quantity — be selective

Return a JSON array of insights:
[{{"content": "...", "category": "wisdom|pattern|knowledge|empathy", "tags": ["..."]}}]

If no meaningful patterns found, return: []"""


async def run_curation_cycle():
    """Run a full Hive Mind curation cycle. Called periodically."""
    logger.info("curator_cycle_start")

    db = get_supabase_admin()
    settings = get_settings()

    try:
        # Minimum chunk size needed to recognize universal patterns
        MINIMUM_PATTERN_BATCH = 15

        # 1. Find the timestamp of the last successful curation
        last_hive_mind = (
            db.table("hive_mind")
            .select("created_at")
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )

        # 2. Get un-curated memories chronologically
        query = db.table("memory_nodes").select("content, memory_type, tags").eq("is_active", True)

        if last_hive_mind.data:
            last_curated_time = last_hive_mind.data[0]["created_at"]
            query = query.filter("created_at", "gt", last_curated_time)

        # Process from oldest to newest to maintain linear timeline
        result = query.order("created_at", desc=False).limit(100).execute()

        new_memories_count = len(result.data) if result.data else 0

        if new_memories_count < MINIMUM_PATTERN_BATCH:
            logger.info("curator_insufficient_new_data", new_memories=new_memories_count, required=MINIMUM_PATTERN_BATCH)
            return

        # Group patterns (anonymized)
        patterns_text = "\n".join(
            f"- [{m['memory_type']}] {m['content']}" for m in result.data
        )

        llm = get_default_llm_service()
        prompt = DISTILLATION_PROMPT.format(patterns=patterns_text)
        prompt = DISTILLATION_PROMPT.format(patterns=patterns_text)
        
        # Pydantic Structured Output handles all JSON formatting and extraction flawlessly
        response_model = await llm.fast_extract(prompt, schema=HiveMindInsightList)
        insights = response_model.insights

        if not insights:
            return

        # Store insights in hive_mind table
        stored_count = 0
        for insight in insights[:10]: # Limit to max 10 insights per run why? because for the time being we have limited memory nodes to process
            try:
                embedding = await generate_embedding(insight.content)

                db.table("hive_mind").insert({
                    "content": insight.content,
                    "category": insight.category,
                    "tags": insight.tags,
                    "embedding": embedding,
                    "contributor_count": len(result.data),
                    "quality_score": 0.7,
                }).execute()

                stored_count += 1
            except Exception as e:
                logger.warning("curator_insight_store_fail", error=str(e))
                continue

        logger.info("curator_cycle_complete", insights_stored=stored_count)

    except Exception as e:
        logger.error("curator_cycle_error", error=str(e))
