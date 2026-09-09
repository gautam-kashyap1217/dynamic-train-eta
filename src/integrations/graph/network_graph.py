import networkx as nx
import pandas as pd
from src.config.paths import GRAPH_EDGE_WEIGHTS_PATH

class RailwayNetworkEngine:
    """Builds and manages a NetworkX topological graph for corridor routing and hop analysis."""
    
    def __init__(self):
        self.graph = nx.DiGraph()
        self._build_graph()

    def _build_graph(self):
        if GRAPH_EDGE_WEIGHTS_PATH.exists():
            df = pd.read_csv(GRAPH_EDGE_WEIGHTS_PATH)
            for _, row in df.iterrows():
                # Assuming columns like source, target, weight/distance exist
                source = row.get("source", row.get("current_station"))
                target = row.get("target", row.get("next_station"))
                weight = row.get("weight", row.get("scheduled_travel_time_min", 1.0))
                if source and target:
                    self.graph.add_edge(source, target, weight=float(weight))

    def get_shortest_path(self, source: str, target: str):
        try:
            return nx.shortest_path(self.graph, source=source, target=target, weight="weight")
        except Exception:
            return []

railway_graph = RailwayNetworkEngine()