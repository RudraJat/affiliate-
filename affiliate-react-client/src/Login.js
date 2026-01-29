import { useState } from "react";
import axios from "axios";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

function Login({ updateUserDetails }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validate = () => {
    let isValid = true;
    let newErrors = {};

    if (formData.username.length === 0) {
      isValid = false;
      newErrors.username = "Username is mandatory";
    }

    if (formData.password.length === 0) {
      isValid = false;
      newErrors.password = "Password is mandatory";
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validate()) {
      // Data to be sent to the server
      const body = {
        username: formData.username,
        password: formData.password,
      };
      const config = {
        // Tells axios to include cookie in the request + some other auth headers
        withCredentials: true,
      };
      try {
        const response = await axios.post(
          "http://localhost:5001/auth/login",
          body,
          config,
        );
        updateUserDetails(response.data.user);
      } catch (error) {
        console.log(error);
        setErrors({ message: "Something went wrong, please try again" });
      }
    }
  };

  // adding google sso

  const handleGoogleSuccess = async (authResponse) => {
    try {
      const response = await axios.post(
        "http://localhost:5001/auth/google-login",
        { idToken: authResponse.credential }, // it'll send google JWT back to frontend
        { withCredentials: true }, //it will allow cookies to be sent and recieved(Without this cookies won't be saved on browser)
      );
      updateUserDetails(response.data.user);
    } catch (error) {
      console.log(error);
      setErrors({ message: "Error processing google auth, please try again" });
    }
  };

  const handleGoogleError = async (error) => {
    console.log(error);
    setErrors({
      message: "Error in google authrization flow, please try again",
    });
  };

  return (
    <div className="container text-center">
      {message && message}
      {errors.message && errors.message}
      <h1>Login Page</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
          {errors.username && errors.username}
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && errors.password}
        </div>
        <div>
          <button>Submit</button>
        </div>

        {/* adding google sso button(sign in with google) */}
        <h2>OR</h2>
        {/* This will provide google login button manually we don't have to add on something on our own */}
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError}/>
        </GoogleOAuthProvider>
      </form>
    </div>
  );
}

export default Login;
