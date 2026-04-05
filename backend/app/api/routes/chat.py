"""
Sapti AI — Chat API Routes
Handles chat streaming via SSE.
"""

import json
import asyncio
import structlog
from fastapi import APIRouter, Request
from sse_starlette.sse import EventSourceResponse

from app.api.middleware.auth import get_current_user
from app.api.deps import get_llm_for_user
from app.models.conversation import ChatRequest
from app.agents.graph import get_sapti_graph
from app.agents.state import SaptiState
from app.agents.chronicler import chronicler_node
from app.services.supabase_client import get_supabase_admin
from app.utils.crypto import decrypt_api_key
from app.config.settings import get_settings

logger = structlog.get_logger()

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/stream")
async def chat_stream(
    chat_request: ChatRequest,
    request: Request,
):
    """Stream a chat response from Sapti via Server-Sent Events."""
    user = await get_current_user(request)
    user_id = user["user_id"]
    llm_service = await get_llm_for_user(request)
    db = get_supabase_admin()
    settings = get_settings()

    logger.info("chat_stream_start", user_id=user_id, conversation_id=chat_request.conversation_id)

    # Get or create conversation
    conversation_id = chat_request.conversation_id
    if not conversation_id:
        conv_result = db.table("conversations").insert({
            "user_id": user_id,
            "title": chat_request.message[:50] + ("..." if len(chat_request.message) > 50 else ""),
        }).execute()
        conversation_id = conv_result.data[0]["id"]

    # Store user message
    db.table("messages").insert({
        "conversation_id": conversation_id,
        "role": "user",
        "content": chat_request.message,
    }).execute()

    # Get conversation history (last 20 messages)
    history_result = (
        db.table("messages")
        .select("role, content")
        .eq("conversation_id", conversation_id)
        .order("created_at")
        .limit(20)
        .execute()
    )
    conversation_history = history_result.data or []

    profile_result = (
        db.table("profiles")
        .select("free_chats_used, custom_key_chats_used, encrypted_api_key, llm_provider, display_name")
        .eq("id", user_id)
        .single()
        .execute()
    )
    profile = profile_result.data or {}
    encrypted_key = profile.get("encrypted_api_key")
    provider = profile.get("llm_provider", settings.default_llm_provider)
    display_name = profile.get("display_name")
    free_chats_used = profile.get("free_chats_used", 0)
    is_trial = not encrypted_key and free_chats_used < settings.free_chat_limit

    # Resolve the API key cleanly
    if encrypted_key:
        resolved_api_key = decrypt_api_key(encrypted_key)
    else:
        resolved_api_key = settings.default_llm_api_key

    async def event_generator():
        try:
            # Send conversation_id first
            yield {
                "event": "metadata",
                "data": json.dumps({"conversation_id": conversation_id}),
            }

            # Run the LangGraph workflow
            graph = get_sapti_graph()

            initial_state = SaptiState(
                user_id=user_id,
                user_name=display_name,
                user_message=chat_request.message,
                conversation_id=conversation_id,
                conversation_history=conversation_history[:-1],
                llm_provider=provider,
                llm_api_key=resolved_api_key,
                is_trial_chat=is_trial,
            )

            # Run the graph
            result = await graph.ainvoke(initial_state.model_dump())

            response_text = result.get("response", "")

            # Stream the response in chunks for smooth animation
            chunk_size = 3
            for i in range(0, len(response_text), chunk_size):
                chunk = response_text[i:i + chunk_size]
                yield {
                    "event": "token",
                    "data": json.dumps({"content": chunk}),
                }
                await asyncio.sleep(0.02)

            # Store assistant response
            msg_result = db.table("messages").insert({
                "conversation_id": conversation_id,
                "role": "assistant",
                "content": response_text,
                "metadata": {
                    "intent": result.get("intent"),
                    "emotion": result.get("emotion_signal"),
                    "memories_created": result.get("new_memory_ids", []),
                },
            }).execute()

            # Increment usage trackers
            if is_trial: # If user is on trial increment free chats used
                used = free_chats_used + 1
                db.table("profiles").update({
                    "free_chats_used": used,
                }).eq("id", user_id).execute()
            else: # If user has provided their own API key increment custom key chats used
                db.table("profiles").update({
                    "custom_key_chats_used": profile.get("custom_key_chats_used", 0) + 1,
                }).eq("id", user_id).execute()

            # Execute chronicler in complete background
            final_state = SaptiState(**result)
            asyncio.create_task(chronicler_node(final_state))

            # Send completion event
            yield {
                "event": "done",
                "data": json.dumps({
                    "conversation_id": conversation_id,
                    "message_id": msg_result.data[0]["id"] if msg_result.data else None,
                    "free_chats_remaining": max(0, settings.free_chat_limit - (free_chats_used + 1)) if is_trial else None,
                }),
            }

        except Exception as e:
            logger.error("chat_stream_error", user_id=user_id, error=str(e))
            yield {
                "event": "error",
                "data": json.dumps({"error": str(e)}),
            }

    return EventSourceResponse(event_generator())
