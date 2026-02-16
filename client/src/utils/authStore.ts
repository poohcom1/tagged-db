export const getAuthToken = (baseUrl: string) => {
  return localStorage.getItem("tagged_db.auth." + baseUrl) || null;
};

export const setAuthToken = (baseUrl: string, token: string) => {
  localStorage.setItem("tagged_db.auth." + baseUrl, token);
};

export const clearAuthToken = (baseUrl: string) => {
  localStorage.removeItem("tagged_db.auth." + baseUrl);
};
