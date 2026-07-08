import {
  ChatTicketRequest,
  ChatTicketResponse,
  StreamTokenRequest,
  StreamTokenResponse,
} from "@/types/chat.types";
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
    /** Fan LiveKit join token — public endpoint, returns chat endpoints too. */
    createStreamToken: builder.mutation<
      StreamTokenResponse,
      StreamTokenRequest
    >({
      query: ({ stream_id: streamId, ...body }) => ({
        url: `${BASE_PATHS.STREAMS_SERVICE}/${streamId}/token`,
        method: "POST",
        body,
      }),
    }),
    /** Exchange the long-lived JWT for a single-use ~30s WS ticket. */
    createChatTicket: builder.mutation<ChatTicketResponse, ChatTicketRequest>({
      query: ({ ticket_url: ticketUrl, ...body }) => ({
        url: ticketUrl ?? `${BASE_PATHS.CHAT_SERVICE}/ws/ticket`,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetStreamsQuery,
  useGetStreamQuery,
  useCreateStreamTokenMutation,
  useCreateChatTicketMutation,
} = streamsApi;
