import { api } from "../api";


const adminAuth = api.injectEndpoints({

    endpoints: (builder) => ({
    
        Login: builder.mutation({
            query: (values) => ({
                url: '/v3/admin/login',
                method: 'POST',
                body: values,
            }),

        }),
        
       
    }),
});

export const {  useLoginMutation} = adminAuth;