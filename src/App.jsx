import { Routes, Route } from "react-router-dom";
import "./styles.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "./pages/Home";
import Login from "./components/Login";
import RequireAuth from "./components/RequireAuth";
import Dashboard from "./pages/Dashboard";
import Department from "./pages/Department";
import Office from "./pages/Office";
import Employee from "./pages/Employee";
import EmployeeDetails from "./pages/EmployeeDetails";
import Attendance from "./pages/Attendance";
import Leaves from "./pages/Leaves";
import Payrol from "./pages/Payrol";
import Designation from "./pages/Designation";
import Unauthorized from "./pages/Unauthorized";

import PersistLogin from "./components/loginComp/PersistLogin";

export default function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route element={<PersistLogin />}>
          <Route element={<RequireAuth />}>
            <Route path="/home" element={<Home />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="department" element={<Department />} />
              <Route path="office" element={<Office />} />
              <Route path="employee" element={<Employee />} />
              <Route path="employee/:id" element={<EmployeeDetails />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="leaves" element={<Leaves />} />
              <Route element={<RequireAuth allowedRoles={[2000]} />}>
                <Route path="payrol" element={<Payrol />} />
              </Route>
              <Route element={<RequireAuth allowedRoles={[2001]} />}>
                <Route path="designation" element={<Designation />} />
              </Route>
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Login />} />
      </Routes>
    </div>
  );
}
