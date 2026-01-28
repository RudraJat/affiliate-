import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./Home";
import Login from "./Login";
import AppLayout from "./layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import { useEffect, useState } from "react";
import axios from "axios";
import Error from "./pages/Error";
import Logout from "./pages/Logout";

function App() {
  const [userDetails, setUserDetails] = useState(null);

  const updateUserDetails = (updatedUserDetails) => {
    setUserDetails(updatedUserDetails);
  };

  const isUserLoggedIn = async () => {
    try {
      const response = await axios.post('http://localhost:5001/auth/is-user-logged-in', {}, {
        withCredentials: true
      });
      updateUserDetails(response.data.user);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    isUserLoggedIn();
  }, []);

  return (
    <Routes>
      <Route path="/" element={userDetails ?
        <Navigate to="/dashboard" /> :
        <AppLayout>
          <Home />
        </AppLayout>
      }
      />
      <Route path="/login" element={userDetails ?
        <Navigate to="/dashboard" /> :
        <AppLayout>
          <Login updateUserDetails={updateUserDetails} />
        </AppLayout>}
      />
      <Route path="/dashboard" element={userDetails ?
        <Dashboard /> :
        <Navigate to="/login" />} />

      <Route path="/logout" element={userDetails ?
        <Logout updateUserDetails={updateUserDetails} /> :
        <Navigate to="/login" />} />

      <Route path="/error" element={userDetails ?
        <Error /> :
        <AppLayout><Error /></AppLayout>} />
    </Routes>


  );
}

export default App;
