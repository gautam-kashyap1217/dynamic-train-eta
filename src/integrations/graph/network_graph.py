import networkx as nx
import pandas as pd

from src.config.paths import GRAPH_EDGE_WEIGHTS_PATH


class RailwayNetworkEngine:
    """Builds and manages the railway network graph."""

    def __init__(self):
        self.graph = nx.DiGraph()
        self._build_graph()

    def _build_graph(self):
        if not GRAPH_EDGE_WEIGHTS_PATH.exists():
            return

        df = pd.read_csv(GRAPH_EDGE_WEIGHTS_PATH)

        for _, row in df.iterrows():
            source = row["current_station"]
            target = row["next_station"]

            self.graph.add_edge(
                source,
                target,
                weight=float(row["distance_to_next_station_km"]),
                distance_km=float(row["distance_to_next_station_km"]),
                average_speed_kmph=float(row["section_average_speed_kmph"]),
                congestion=float(row["track_congestion"]),
                route_segment_id=row["route_segment_id"],
            )

    def get_shortest_path(self, source: str, target: str):
        try:
            return nx.shortest_path(
                self.graph,
                source=source,
                target=target,
                weight="weight",
            )
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return []

    def get_edge_data(self, source: str, target: str):
        return self.graph.get_edge_data(source, target)


railway_graph = RailwayNetworkEngine()