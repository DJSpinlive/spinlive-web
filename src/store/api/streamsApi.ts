import { GetStreamsResponse, Stream } from "@/types/streams.types";
import { BASE_PATHS } from "@/utilities";

import { baseSlice } from "./apiSlice";

export const streamsApi = baseSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getStreams: builder.query<GetStreamsResponse, void>({
      query: () => ({
        url: `${BASE_PATHS.STREAMS_SERVICE}`,
        method: "GET",
      }),
    }),
    getStream: builder.query<Stream, string>({
      query: (streamId) => ({
        url: `${BASE_PATHS.STREAMS_SERVICE}/${streamId}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetStreamsQuery, useGetStreamQuery } = streamsApi;
