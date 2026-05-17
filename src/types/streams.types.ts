export interface GetStreamsResponse {
  live: Stream[];
  recent: Stream[];
}

export interface Stream {
  id: string;
  stream_id: string;
  dj_user_id: string;
  dj_name: string;
  title: string;
  started_at: string; // ISO timestamp, e.g. "2026-04-27T18:19:40.816Z"
  ended_at: string; // ISO timestamp, e.g. "2026-04-27T18:19:40.816Z"
  duration_seconds: number;
  peak_listeners: number;
  archive_url: string;
}
