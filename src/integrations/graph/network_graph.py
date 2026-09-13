
import networkx as nx
import pandas as pd

from src.config.paths import GRAPH_EDGE_WEIGHTS_PATH


class RailwayNetworkEngine:
    """Builds and manages the railway network graph."""

    def __init__(self):
        self.graph = nx.DiGraph()
        self._build_graph()

    @staticmethod
    def _normalize_station_code(value):
        """
        Normalize station codes so that values such as
        'mtj', ' MTJ ', and 'MTJ' are treated equally.
        """
        if value is None:
            return ""

        return str(value).strip().upper()

    def _build_graph(self):
        """Load railway segments from the graph edge CSV."""

        if not GRAPH_EDGE_WEIGHTS_PATH.exists():
            print(
                "Graph edge weights file not found:",
                GRAPH_EDGE_WEIGHTS_PATH
            )
            return

        df = pd.read_csv(GRAPH_EDGE_WEIGHTS_PATH)

        required_columns = {
            "current_station",
            "next_station",
            "distance_to_next_station_km",
            "section_average_speed_kmph",
            "track_congestion",
            "route_segment_id",
        }

        missing_columns = required_columns.difference(df.columns)

        if missing_columns:
            raise ValueError(
                "Graph edge CSV is missing required columns: "
                f"{sorted(missing_columns)}"
            )

        loaded_edges = 0
        skipped_edges = 0

        for _, row in df.iterrows():
            source = self._normalize_station_code(
                row["current_station"]
            )

            target = self._normalize_station_code(
                row["next_station"]
            )

            if not source or not target:
                skipped_edges += 1
                continue

            try:
                distance_km = float(
                    row["distance_to_next_station_km"]
                )

                average_speed_kmph = float(
                    row["section_average_speed_kmph"]
                )

                congestion = float(
                    row["track_congestion"]
                )

                route_segment_id = str(
                    row["route_segment_id"]
                ).strip()

                if distance_km <= 0 or average_speed_kmph <= 0:
                    skipped_edges += 1
                    continue

                self.graph.add_edge(
                    source,
                    target,
                    weight=distance_km,
                    distance_km=distance_km,
                    average_speed_kmph=average_speed_kmph,
                    congestion=congestion,
                    route_segment_id=route_segment_id,
                )

                loaded_edges += 1

            except (TypeError, ValueError):
                skipped_edges += 1

        print(
            f"Railway graph loaded: "
            f"{loaded_edges} edges, "
            f"{self.graph.number_of_nodes()} stations."
        )

        if skipped_edges:
            print(
                f"Skipped invalid graph rows: {skipped_edges}"
            )

    def get_shortest_path(self, source: str, target: str):
        """Return the shortest path between two stations."""

        source = self._normalize_station_code(source)
        target = self._normalize_station_code(target)

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
        """Return data for a direct railway segment."""

        source = self._normalize_station_code(source)
        target = self._normalize_station_code(target)

        return self.graph.get_edge_data(
            source,
            target
        )

    def has_edge(self, source: str, target: str):
        """Check whether a direct railway segment exists."""

        source = self._normalize_station_code(source)
        target = self._normalize_station_code(target)

        return self.graph.has_edge(
            source,
            target
        )


railway_graph = RailwayNetworkEngine()