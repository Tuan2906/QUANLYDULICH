import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Step 1
import { BASE_URL, endpoints } from "../API";

function LoginForm() {
  const [username, setusername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Step 2

  async function handleSubmit(e) {
    e.preventDefault();
    const url = `${BASE_URL}${endpoints.login}`;

    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);
    formData.append("grant_type", "password");
    formData.append("client_id", "tsEaWqK2nl8yxy5kRtajUeJJ0ism8jyiNOigjasX");
    formData.append(
      "client_secret",
      "kAV8nxyvFc1UXlFx8AGo1jMtrjBlYoppbSXy1Q7PS1oECF6nr8e4z6dVp6syXBXW8opGhXSaPcJLRYez8QsHU1XJaBFAN9E3u66PmEvf51sLpR9rLRVxgPCFggJd3xyc"
    );

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.access_token;
        try {
          const response = await fetch(`${BASE_URL}${endpoints.current_user}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            const userData = await response.json();
            localStorage.setItem("user", JSON.stringify(userData));
          } else {
            console.error("Failed to fetch current user:", response.statusText);
          }
        } catch (error) {
          console.error("Error fetching current user:", error);
        }

        localStorage.setItem("token", token);
        navigate("/chat/");
        console.log("Login successful");
      } else {
        // Handle login failure
        console.error("Login failed:", response.statusText);
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Username:</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setusername(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit">Login</button>
    </form>
  );
}

export default LoginForm;
