import axios from "axios";
// import { SERVER_HOST, SERVER_PORT } from "@env";

export const BASE_URL = "http://10.17.48.157:8000/";

export const endpoints = {
  user: (useRouteId) => `/users/?id=${useRouteId}`,
  login: "o/token/",
  current_user: "users/current-user/",
  category: "danhmuc/",
  post: "allposts/",
  postnews: "postsTinTuc/",
  postNewsDetail: (newsId) => `postsTinTuc/${newsId}/`,
  comments: (newsId) => `postsTinTuc/${newsId}/comments/`,
};

export const authApi = (token) => {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

export default axios.create({
  baseURL: BASE_URL,
});
