from src.integrations.graph.network_graph import railway_graph


class ETARepository:
    """Provides graph data required by the ETA service."""

    def get_segment_data(self, current_station: str, next_station: str):
        print(
            "Looking for graph segment:",
            current_station,
            "->",
            next_station
        )

        segment = railway_graph.get_edge_data(
            current_station,
            next_station
        )

        if segment is None:
            print("Segment not found.")
            print(
                "Available graph nodes:",
                list(railway_graph.graph.nodes())[:50]
            )

        return segment

    def get_route(self, current_station: str, destination: str):
        return railway_graph.get_shortest_path(
            current_station,
            destination
        )


eta_repository = ETARepository()