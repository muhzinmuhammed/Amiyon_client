
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import PrivateRoute from './private/Index';

import AdminLoginPage from './Pages/AdminLogin/AdminLoginPage'
import CompanyPage from './pages/Company/CompanyPage';
import EmployeePage from './pages/Employee/EmployeePage';
function App() {
 

  return (
    <>
         <Provider store={store}>
     <Router>
<Routes>

<Route path="/login" element={<AdminLoginPage />} />

<Route element={<PrivateRoute />}>

<Route path="/" element={<CompanyPage />} />
<Route path="/employee" element={<EmployeePage />} />
</Route>
</Routes>
</Router>
</Provider>
    </>
  )
}

export default App
