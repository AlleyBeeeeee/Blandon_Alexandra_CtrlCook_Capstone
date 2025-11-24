import API from "../api/axios";

export const login = async (email, password) => {
  const { data } = await API.post("/users/login", { email, password });
  localStorage.setItem("user", JSON.stringify(data)); // store token
  return data;
};

export const register = async (username, email, password) => {
  const { data } = await API.post("/users", { username, email, password });
  localStorage.setItem("user", JSON.stringify(data));
  return data;
};
