import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { all } from "./common";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
      
    baseUrl: `${all.baseurl}`,
    prepareHeaders: (headers) => {
      const token = JSON.parse(localStorage.getItem('adminToken'))
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);  
      }
      return headers;
    },
    
  }),
  tagTypes: ["postTag"],

  endpoints: (builder) => ({}),
});