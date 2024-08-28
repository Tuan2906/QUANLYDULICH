import cookie from "react-cookies";

const MyUserReducer = (current, action) => {
    switch (action.type) {
        case "login":
            return action.payload;
        case "logout":
            localStorage.removeItem("access-token");
            localStorage.removeItem("user")
            return null;
    }
    return current;
}

export default MyUserReducer;