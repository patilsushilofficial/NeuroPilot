/**
 * Mock API layer to demonstrate Service Repository Pattern.
 * In a real application, this would wrap fetch(), Axios, Supabase, or a Firebase SDK.
 */
export const api = {
  post: async (endpoint: string, data: any) => {
    console.log(`[API POST] ${endpoint}`, data);
    return new Promise((resolve) => setTimeout(() => resolve({ success: true, data }), 500));
  },
  put: async (endpoint: string, data: any) => {
    console.log(`[API PUT] ${endpoint}`, data);
    return new Promise((resolve) => setTimeout(() => resolve({ success: true, data }), 500));
  },
  delete: async (endpoint: string) => {
    console.log(`[API DELETE] ${endpoint}`);
    return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
  },
};
