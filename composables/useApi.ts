import { useLoading } from './useLoading';

/**
 * API 请求封装，使用 Nuxt 的 $fetch
 */
export const useApi = () => {
  const { setLoading } = useLoading();

  const apiRequest = async (
    endpoint: string,
    method: string = 'GET',
    data: any = null,
    customHeaders: Record<string, string> = {},
    showLoading: boolean = false
  ) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    if (showLoading) setLoading(true);

    try {
      const options: any = { method, headers };
      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = data;
      }
      const result = await $fetch(endpoint, options);
      return result;
    } catch (error) {
      console.error('API 请求错误:', error);
      throw error;
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  return { apiRequest };
};
