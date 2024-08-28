import APIs, { endpoints } from "./config/APIs";

const getTags= async () => {
    try{
        let res = await APIs.get(endpoints['tag']);
        return res.data;        
    }catch(ex) {
        console.log(ex);
    }
}

export const getPosts= async (id_tag,page) => {
    try {
        let url = `${endpoints['tag_posts'](id_tag)}?&page=${page}`;
        let res = await APIs.get(url);
        return res.data.results;
    } catch(ex) {
        console.error(ex);
    }
  }

export const getPost = async (post_id) => {
    try {
        let res = await APIs.get(endpoints['posts'](post_id));
        return res.data
    } catch (ex) {
        console.error(ex);
    }
}
export default getTags;