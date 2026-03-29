import API from "./api";

export const loginUser = async ({ email, password }) => {
  const response = await API.post("/auth/login", { email, password });
  return response.data.data; // ✅ Devolver solo el objeto data interno
};

export const getUserProfile = async () => {
  const response = await API.get("/auth/profile");
  return response.data.data;
};

export const logoutUser = async () => {
  const response = await API.post("/auth/logout");
  return response.data;
};
