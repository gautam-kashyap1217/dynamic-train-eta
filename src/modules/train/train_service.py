from src.modules.train.train_repository import train_repository

class TrainService:
    def search_trains(self, query: str = ""):
        df = train_repository.get_all_trains()
        if df is None or df.empty:
            return []
        if query:
            filtered = df[df['train_id'].str.contains(query, case=False, na=False)]
            return filtered.to_dict(orient="records")
        return df.head(50).to_dict(orient="records")

train_service = TrainService()