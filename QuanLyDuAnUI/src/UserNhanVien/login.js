import React, { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import APIs, { endpoints } from '../configs/APIs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import {Container, Spinner } from 'react-bootstrap';
import cookie from "react-cookies";
import { MyDispatchContext } from '../configs/ContextEmployee';

const LoginNV = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useContext(MyDispatchContext);

  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      setLoading(true);
      setErr(false);

      // Gọi API đăng nhập
      const res = await APIs.post(endpoints.login, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const { access_token, user } = res.data;
      // Lưu thông tin đăng nhập vào cookie
      cookie.save('user', user);
            
      dispatch({
          "type": "login",
          "payload": user
      });
      // Cập nhật trạng thái đăng nhập và lưu thông tin người dùng vào localStorage
      localStorage.setItem('access-token', access_token);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', JSON.stringify(user));
      // Chuyển hướng người dùng về trang trước đó hoặc '/journeys'
     navigate("/journeys")
    } catch (ex) {
      console.error('Login error:', ex);
      setErr(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="card p-4 shadow" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="mb-4">Login</h2>
        {err && <div className="alert alert-danger">Invalid credentials. Please try again.</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label visually-hidden">Username</label>
            <div className="input-group">
              <span className="input-group-text"><FontAwesomeIcon icon={faUser} /></span>
              <input
                type="text"
                className="form-control"
                id="username"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label visually-hidden">Password</label>
            <div className="input-group">
              <span className="input-group-text"><FontAwesomeIcon icon={faLock} /></span>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="mb-10">
          {loading &&
               (
                <Container className="d-flex justify-content-center align-items-center" style={{ height: '1vh' }}>
                  <Spinner animation="border" role="status">
                    <span className="sr-only">Loading...</span>
                  </Spinner>
                </Container>
              )}

            <button type="submit" className="btn btn-primary d-block mx-auto" style={{margin:"20px"}}>Login</button>
            <p className="mt-100-alert alert-danger">Ghi Chú: Chỉ có nhân viên được phép đăng nhập.</p>

          </div>

        </form>
      </div>
    </div>
  );
};

export default LoginNV;
