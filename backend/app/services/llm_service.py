"""
Sapti AI — LLM Service (Provider-Agnostic)
Uses LiteLLM to support Gemini, OpenAI, and Anthropic.
"""

import os
import structlog
from typing import AsyncIterator
from litellm import acompletion
import litellm

from app.config.settings import get_settings

logger = structlog.get_logger()

# Suppress LiteLLM verbose logging
litellm.set_verbose = False


# Provider → Model mapping
PROVIDER_MODEL_MAP = {
    "gemini": {
        "main": "gemini/gemini-2.5-flash",
        "fast": "gemini/gemini-2.5-flash",
    },
    "openai": {
        "main": "openai/gpt-4o",
        "fast": "openai/gpt-4o-mini",
    },
    "anthropic": {
        "main": "anthropic/claude-sonnet-4-20250514",
        "fast": "anthropic/claude-3-5-haiku-20241022",
    },
}


class LLMService:
    """Provider-agnostic LLM service using LiteLLM."""

    def __init__(self, provider: str, api_key: str):
        self.provider = provider
        self.models = PROVIDER_MODEL_MAP.get(provider, PROVIDER_MODEL_MAP["gemini"])
        self._set_api_key(provider, api_key)

    def _set_api_key(self, provider: str, api_key: str):
        """Set the API key for the chosen provider."""
        key_map = {
            "gemini": "GEMINI_API_KEY",
            "openai": "OPENAI_API_KEY",
            "anthropic": "ANTHROPIC_API_KEY",
        }
        env_var = key_map.get(provider)
        if env_var:
            os.environ[env_var] = api_key
            logger.info("llm_api_key_set", provider=provider)

    async def generate_stream(
        self,
        system_prompt: str,
        messages: list[dict],
        temperature: float | None = None,
        max_tokens: int | None = None,
    ) -> AsyncIterator[str]:
        """Generate a streaming response."""
        settings = get_settings()
        temp = temperature or settings.main_model_temperature
        tokens = max_tokens or settings.main_model_max_tokens

        all_messages = [{"role": "system", "content": system_prompt}] + messages

        try:
            response = await acompletion(
                model=self.models["main"],
                messages=all_messages,
                stream=True,
                temperature=temp,
                max_tokens=tokens,
            )

            async for chunk in response:
                delta = chunk.choices[0].delta
                if delta and delta.content:
                    yield delta.content

        except Exception as e:
            logger.error("llm_generation_error", error=str(e), provider=self.provider)
            yield f"\n\n[Sapti encountered an error: {str(e)}]"

    async def generate(
        self,
        system_prompt: str,
        messages: list[dict],
        temperature: float | None = None,
        max_tokens: int | None = None,
    ) -> str:
        """Generate a non-streaming response."""
        settings = get_settings()
        temp = temperature or settings.main_model_temperature
        tokens = max_tokens or settings.main_model_max_tokens

        all_messages = [{"role": "system", "content": system_prompt}] + messages

        try:
            response = await acompletion(
                model=self.models["main"],
                messages=all_messages,
                stream=False,
                temperature=temp,
                max_tokens=tokens,
            )
            return response.choices[0].message.content

        except Exception as e:
            logger.error("llm_generation_error", error=str(e), provider=self.provider)
            raise

    async def fast_extract(self, prompt: str, schema: type["BaseModel"] | None = None):
        """Use the fast/cheap model for extraction tasks (intent, memory)."""
        try:
            kwargs = {
                "model": self.models["fast"],
                "messages": [{"role": "user", "content": prompt}],
                "stream": False,
                "temperature": 0.3,
                "max_tokens": 2056,  # Bumped from 1024 to prevent Array cutoff
            }
            if schema:
                kwargs["response_format"] = schema
                
            response = await acompletion(**kwargs)
            content = response.choices[0].message.content
            
            if schema:
                # With structured output, content is guaranteed to be a valid JSON string matching the schema
                return schema.model_validate_json(content)
                
            return content

        except Exception as e:
            logger.error("llm_extraction_error", error=str(e), provider=self.provider)
            raise


def get_default_llm_service() -> LLMService:
    """Get LLM service using the developer's default API key (for trial chats)."""
    settings = get_settings()
    return LLMService(
        provider=settings.default_llm_provider,
        api_key=settings.default_llm_api_key,
    )
