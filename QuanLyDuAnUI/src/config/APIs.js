import axios from "axios";
const BASE_URL = "http://10.17.48.157:8000/";

export let endpoints = {
  login: "/o/token/",
  "current-user": "/users/current-user/",
  users: "/users/",
  tag_posts: (tag_id) => `/tags/${tag_id}/posts/`,
  tag: "/tags/",
  posts: (post_id) => `/posts/${post_id}/`,
  payMomo: "/payUrl",
  comments: (post_id) => `/posts/${post_id}/comments/`,
  reply: (comment_id) => `/comments/${comment_id}/replies/`,
  "add-comment": (post_id) => `/posts/${post_id}/comments/`,
  "add-rep": (comment_id) => `/comments/${comment_id}/replies/`,
  "add-cart": (post_id) => `/posts/${post_id}/userRegiterCartPost/`,
  cart: "users/cartUser/posts/",
  "delete-cart": (post_id) => `/posts/${post_id}/deleteCart/`,
  rates: (rateId) => `/posts/${rateId}/rates/`,
};
export const authApi = (accessToken) =>
  axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `bearer ${accessToken}`,
    },
  });
export default axios.create({
  baseURL: BASE_URL,
});
