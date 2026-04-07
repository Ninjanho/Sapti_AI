"""
Sapti AI — Horse 4: Generator Agent
Generates the LLM response using the dynamic system prompt.
"""

import structlog
from app.agents.state import SaptiState
from app.services.llm_service import LLMService

logger = structlog.get_logger()


async def generator_node(state: SaptiState) -> dict:
    """Horse 4 — Generate the response using the complete system prompt."""
    logger.info("generator_start", user_id=state.user_id)

    if not state.system_prompt:
        logger.error("generator_no_prompt")
        return {"response": "I'm having trouble gathering my thoughts. Could you try again?"}

    llm = LLMService(
        provider=state.llm_provider,
        api_key=state.llm_api_key or "",
    )

    # Build message list from conversation history + current message
    messages = []
    for msg in state.conversation_history[-10:]:  # Last 10 messages for context
        messages.append({
            "role": msg.get("role", "user"),
            "content": msg.get("content", ""),
        })
    messages.append({"role": "user", "content": state.user_message})

    try:
        response = await llm.generate(
            system_prompt=state.system_prompt,
            messages=messages,
        )

        logger.info("generator_complete", response_length=len(response))
        return {"response": response}

    except Exception as e:
        logger.error("generator_error", error=str(e))
        return {
            "response": "I'm having a moment — something went wrong on my end. Please try again after some time.",
            "error": str(e),
        }
