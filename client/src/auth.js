// Логин / регистрация
import { apiPost } from './api.js';

export function isLoggedIn() {
  return !!localStorage.getItem('ht_token');
}

export function getToken() {
  return localStorage.getItem('ht_token');
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('ht_user'));
  } catch {
    return null;
  }
}

export async function login(email, password) {
  const data = await apiPost('/auth/login', { email, password });
  localStorage.setItem('ht_token', data.accessToken);
  localStorage.setItem('ht_user', JSON.stringify(data.user));
  return data.user;
}

export async function register(fields) {
  const data = await apiPost('/auth/register', fields);
  localStorage.setItem('ht_token', data.accessToken);
  localStorage.setItem('ht_user', JSON.stringify(data.user));
  return data.user;
}

export async function fetchProfile() {
  const { default: apiGet } = await import('./api.js');
  const user = await apiGet('/auth/me');
  localStorage.setItem('ht_user', JSON.stringify(user));
  return user;
}

export async function updateProfile(data) {
  const { default: apiPut } = await import('./api.js');
  const res = await apiPut('/auth/profile', data);
  const user = res.user;
  localStorage.setItem('ht_user', JSON.stringify(user));
  return user;
}

export function logout() {
  localStorage.removeItem('ht_token');
  localStorage.removeItem('ht_user');
  window.location.hash = '#login';
}
