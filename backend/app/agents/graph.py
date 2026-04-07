"""
Sapti AI — LangGraph Workflow Definition
Orchestrates the 7 Horses into a coherent workflow.
"""

import structlog
from langgraph.graph import StateGraph, END

from app.agents.state import SaptiState
from app.agents.perceiver import perceiver_node
from app.agents.rememberer import rememberer_node
from app.agents.world_builder import world_builder_node
from app.agents.generator import generator_node

logger = structlog.get_logger()


def build_sapti_graph() -> StateGraph:
    """Build the LangGraph workflow for Sapti's conversation pipeline.

    Flow:
        perceiver → rememberer → world_builder → generator → chronicler → END

    Horses 1-4 are in the critical path (sync).
    Horse 5 (chronicler) runs after response generation.
    Horses 6-7 (curator, evolver) run as periodic background tasks, not in this graph.
    """

    graph = StateGraph(SaptiState)

    # Add nodes (the horses)
    graph.add_node("perceiver", perceiver_node)
    graph.add_node("rememberer", rememberer_node)
    graph.add_node("world_builder", world_builder_node)
    # graph.add_node("generator", generator_node)        ## Added generator with stream in directly chat.py

    # Define edges (linear flow)
    graph.set_entry_point("perceiver")
    graph.add_edge("perceiver", "rememberer")
    graph.add_edge("rememberer", "world_builder")
    # graph.add_edge("world_builder", "generator")      ## Added generator with stream in directly chat.py
    # graph.add_edge("generator", END)                  ## Added generator with stream in directly chat.py
    graph.add_edge("world_builder", END)

    return graph


# Compile the graph once at module load
_compiled_graph = None


def get_sapti_graph():
    """Get the compiled Sapti workflow graph (cached)."""
    global _compiled_graph
    if _compiled_graph is None:
        graph = build_sapti_graph()
        _compiled_graph = graph.compile()
        logger.info("sapti_graph_compiled")
    return _compiled_graph
