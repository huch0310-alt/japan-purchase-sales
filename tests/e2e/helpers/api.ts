import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'http://43.153.155.76:3001/api';

let apiInstance: AxiosInstance | null = null;

export function getApi(token?: string): AxiosInstance {
  apiInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return apiInstance;
}

export async function login(username: string, password: string): Promise<{ token: string; userId: string }> {
  const api = getApi();
  const response = await api.post('/auth/login', { username, password });
  return {
    token: response.data.access_token,
    userId: response.data.user?.id || '',
  };
}

export async function apiGet(path: string, token: string) {
  const api = getApi(token);
  return api.get(path);
}

export async function apiPost(path: string, data: any, token: string) {
  const api = getApi(token);
  return api.post(path, data);
}

export async function apiPut(path: string, data: any, token: string) {
  const api = getApi(token);
  return api.put(path, data);
}

export async function apiDelete(path: string, token: string) {
  const api = getApi(token);
  return api.delete(path);
}
