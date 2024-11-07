
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  const userToken = localStorage.getItem('adminToken');


  return userToken  ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;