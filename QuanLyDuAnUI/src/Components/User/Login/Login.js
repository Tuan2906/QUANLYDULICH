import React, { useContext, useState } from "react";
import "./Login.css"; // Import CSS file
import APIs, { authApi, endpoints } from "../../../config/APIs";
import cookies from "react-cookies";
import "@fortawesome/fontawesome-free/css/all.min.css"; // Import FontAwesome
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MySpinner from "../../Common/Spiner";

const Login = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const toggleForm = () => {
    setIsSignIn(!isSignIn);
  };
  return (
    <div className={`containerS ${isSignIn ? "" : "active"}`} id="container">
      <div className={`form-container ${isSignIn ? "sign-in" : "sign-up"}`}>
        {isSignIn ? (
          <SignInForm />
        ) : (
          <SignUpForm setIsSignIn={setIsSignIn} isSignIn={isSignIn} />
        )}
      </div>
      <div className="toggle-container">
        <TogglePanel isSignIn={isSignIn} onToggle={toggleForm} />
      </div>
    </div>
  );
};

const SignUpForm = ({ setIsSignIn, isSignIn }) => {
  const [image, setImage] = useState(null);
  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    username: "",
    password: "",
    confirm: "",
    avatar: "",
  });
  const nav = useNavigate();
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Now `imageUrl` contains the uploaded image URL
      const reader = new FileReader();
      reader.onloadend = async () => {
        setImage(reader.result);
        console.log("Image loaded", reader.result);

        const { name } = e.target;
        setUser({ ...user, [name]: file });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("user", user);
    if (user.avatar) {
      const formData = new FormData();
      for (const key in user) {
        formData.append(key, user[key]);
      }

      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      try {
        let res = await APIs.post(endpoints["users"], formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("Response:", res);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        alert(
          "Tạo tài khoảng thành công, Vui lòng nhập lại username và password"
        );
        setIsSignIn(!isSignIn);
      }
    } else {
      alert("Hãy chọn ảnh avatar");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Create Account</h1>
      <div className="avatar-container">
        <div className="avatar">
          {image ? (
            <img src={image} alt="Avatar" />
          ) : (
            <i className="fas fa-user fa-3x"></i>
          )}
          <label htmlFor="file-upload" className="file-upload-label">
            <i className="fas fa-camera"></i>
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            name="avatar"
            onChange={handleImageChange}
          />
        </div>
      </div>
      <input
        type="text"
        placeholder="Họ"
        name="first_name"
        value={user.first_name}
        onChange={handleInputChange}
      />
      <input
        type="text"
        placeholder="Tên"
        name="last_name"
        value={user.last_name}
        onChange={handleInputChange}
      />
      <input
        type="text"
        placeholder="Username"
        name="username"
        value={user.username}
        onChange={handleInputChange}
        required
      />
      <input
        type="password"
        placeholder="Password"
        name="password"
        value={user.password}
        onChange={handleInputChange}
        required
      />
      <input
        type="password"
        placeholder="Confirm Password"
        name="confirm"
        value={user.confirm}
        onChange={handleInputChange}
        required
      />
      <button type="submit">Sign Up</button>
    </form>
  );
};

const SignInForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [test, setTest] = useState("");
  const nav = useNavigate();
  const loginUser = async (event) => {
    setLoading(true);
    event.preventDefault(); // Ngăn chặn hành động mặc định của form (refresh trang)
    try {
      console.log("username", username);
      console.log("pass", password);
      // Gửi yêu cầu HTTP sử dụng fetch hoặc axios
      let res = await APIs.post(
        endpoints["login"],
        {
          username: username,
          password: password,
          client_id: "N1kEnPaI19Cj4ntAm668vAlH9iT0nYcsDiCAvk3Q",
          client_secret:
            "SKDX2OLdLIbPnkptjklXIKBPiymOEGvzopTLf1aVMf8dpU6VWCBVG7wDcL5YGSXHh2sc3aljVOoUG4tOWbNDoUu6XHIjk9bPnNrejwltaLNJyFtc7RgZ2qfpvWAiqBd5",
          grant_type: "password",
        },
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setTest(res.data.access_token);
      cookies.save("access-token", res.data.access_token);
      localStorage.setItem("isStaff", "false");

      setTimeout(async () => {
        // setLoading(false);
        let userRes = await authApi(res.data.access_token).get(
          endpoints["current-user"]
        );
        nav("/Home");
        cookies.save("user", userRes.data);
      }, 100);
    } catch (ex) {
      console.error(ex);
      alert("Tài khoản bị khóa hoặc chưa đăng ký người dùng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={loginUser}>
      <h1>Sign In</h1>
      <span>or use your email password</span>
      <input
        type="text"
        placeholder="Username"
        onChange={(event) => setUsername(event.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(event) => setPassword(event.target.value)}
        required
      />
      <a href="#">Forget Your Password?</a>
      {loading ? (
        <MySpinner animation="grow" size="sm" />
      ) : (
        <button type="submit">Sign In</button>
      )}
    </form>
  );
};

const TogglePanel = ({ isSignIn, onToggle }) => {
  return (
    <div className="toggle">
      <div
        className={`toggle-panel ${isSignIn ? "toggle-left" : "toggle-right"}`}
      >
        {isSignIn ? (
          <>
            <h1>Welcome Back!</h1>
            <button className="hidden" onClick={onToggle}>
              Sign Up
            </button>
          </>
        ) : (
          <>
            <h1>Hello, Friend!</h1>
            <button className="hidden" onClick={onToggle}>
              Sign In
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
