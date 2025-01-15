import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000/api/v1" }),
    endpoints: (builder) => ({
        getMessages: builder.query({
            query: (data) => ({
                url: `/message/get/${data}`,
                credentials: "include"
            })
        }),
        sendMessage: builder.mutation({
            query: (data) => {
                let formData = new FormData()

                formData.append("message", data.message)

                return {
                    url: `/message/create/${data.recieverId}`,
                    method: "POST",
                    body: formData,
                    credentials: "include"
                }
            },
        }),
        UsersWithMessages: builder.query({
            query: (data) => ({
                url: `/auth/withmessage/`,
                credentials: "include"
            })
        }),
        searchUsers: builder.query({
            query: (data) => ({
                url: `/auth/all/?keyword=${data}`,
                credentials: "include"
            })
        }),
        createGroup: builder.mutation({
            query: (data) => {

                let formData = new FormData()

                formData.append("name", data.name)
                formData.append("avatar", data.avatar)
                formData.append("members", JSON.stringify(data.members))

                return {
                    url: `/group/create`,
                    method: "POST",
                    body: formData,
                    credentials: "include"
                }
            }
        })
    }),
});

export const {
    useSendMessageMutation,
    useGetMessagesQuery,
    useUsersWithMessagesQuery,
    useSearchUsersQuery,
    useCreateGroupMutation
} = api;