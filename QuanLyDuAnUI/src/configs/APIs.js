import axios from "axios";

//const BASE_URL = 'https://thanhduong.pythonanywhere.com';
const BASE_URL = 'http://192.168.1.19:8000';

export const endpoints = {
     'login': '/users/loginStaff/',
     'xetDuyet':(NV_id) => `/users/${NV_id}/postsXetDuyet/`,
     'xetDuyetPost':(Post_id) => `/posts/${Post_id}/checkBaiViet/`,
     'approveJourney':(Post_id) => `/posts/${Post_id}/updateXetDuyetPost/`,
     'cancelApproval':(Post_id) => `/posts/${Post_id}/updateXetDuyetPost/`,
     'stripe':(id_tour) => `/create-checkout-session/${id_tour}/`,
     'apiEmail':"/api/send/mail",
     "sucessPay":"/api/save_invoice_and_send_email",
     'local': '/local/',
     'picture': '/picture/',
      'transport': '/transports/',
      'tag':'/tags/',
      'tinTuc':(NV_id) => `/users/${NV_id}/tinTucXetDuyet/`,
      'UpPost': "/api/post/",
      'luunguoithan': (Post_id) => `/posts/${Post_id}/luuThongTinNguoiThan/`,

};
export const authApi = (accessToken) => axios.create({
    baseURL: BASE_URL,
    headers: {
        "Authorization": `bearer ${accessToken}`
    }
})
export default axios.create({
    baseURL: BASE_URL
});