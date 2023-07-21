import { useEffect, useState } from "react";
import { Add } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";

import AddAttendance from "../components/attendance-comp/AddAttendance";
import UpdateAttendance from "../components/attendance-comp/UpdateAttendance";
import Table from "../components/Table";
import { useDispatch, useSelector } from "react-redux";
import {
  addAlertDetails,
  addModalTogal,
  addSessionUser,
  setTableLoader
} from "../redux/features/StatusVar";

//Date Picker Imports
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useLocation, useNavigate } from "react-router-dom";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

const Attendance = () => {
  const [tableData, setTableData] = useState([]);
  const dispatch = useDispatch();
  const refreshData = useSelector((state) => state.statusVar.value.refreshData);
  const [employeeList, setEmployeeList] = useState([]);
  const sessionUser = useSelector((state) => state.statusVar.value.sessionUser);
  const axiosPrivate = useAxiosPrivate();
  const location = useLocation();
  const navigate = useNavigate();

  //fetching table data
  useEffect(() => {
    dispatch(setTableLoader(true));
    const controller = new AbortController();
    const getData = async () => {
      try {
        const responce = await axiosPrivate.get("/api/attendance", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `token ${sessionUser.accessToken}`
          },
          withCredentials: true,
          signal: controller.signal
        });

        if (responce.data.error === "Invalid!") {
          dispatch(addSessionUser({ type: "remove", payload: sessionUser }));
          return navigate("/", { state: { from: location }, replace: true });
        }
        if (responce.data.error) {
          dispatch(
            addAlertDetails({
              status: true,
              type: "error",
              message: "failed to load data!"
            })
          );
        }

        setTableData(responce.data);
        // console.log(responce.data);
      } catch (e) {
        dispatch(
          addAlertDetails({
            status: true,
            type: "error",
            message: "failed to load data!"
          })
        );
      } finally {
        dispatch(setTableLoader(false));
      }
    };
    getData();
    return () => controller.abort();
  }, [refreshData]);

  useEffect(() => {
    const controller = new AbortController();
    const getemployeeList = async () => {
      try {
        const responce = await axiosPrivate.get("/api/employee", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `token ${sessionUser.accessToken}`
          },
          withCredentials: true,
          signal: controller.signal
        });

        if (responce.data.error === "Invalid!") {
          dispatch(addSessionUser({ type: "remove", payload: sessionUser }));
          return navigate("/", { state: { from: location }, replace: true });
        }
        // console.log(responce.data);

        setEmployeeList(responce.data);
      } catch (e) {
        dispatch(
          addAlertDetails({
            status: true,
            type: "error",
            message: "failed to load data!"
          })
        );
      }
    };
    getemployeeList();
    return () => controller.abort();
  }, []);

  //defining columns
  const columns = [
    {
      accessorFn: (row) =>
        `${row.employee.first_name} ${row.employee.last_name}`,
      id: "name",
      header: "Employee"
    },
    {
      header: "Date",
      accessorFn: (row) => new Date(row.date),
      accessorKey: "date",
      Cell: ({ cell }) => new Date(cell.getValue()).toLocaleDateString(),
      filterFn: "lessThanOrEqualTo",
      sortingFn: "datetime",
      Filter: ({ column }) => (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            onChange={(newValue) => {
              column.setFilterValue(newValue);
            }}
            slotProps={{
              textField: {
                helperText: "Filter Mode: Less Than",
                sx: { minWidth: "120px" },
                variant: "standard"
              }
            }}
            value={column.getFilterValue()}
          />
        </LocalizationProvider>
      )
    },
    {
      header: "In",
      accessorKey: "in"
    },
    {
      header: "Out",
      accessorKey: "out"
    },
    {
      header: "OT (hrs)",
      accessorKey: "OT"
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h3>Attendance</h3>
        <div style={{ display: "flex" }}>
          <div className="add">
            <Tooltip title="Add Item">
              <IconButton
                onClick={() => dispatch(addModalTogal(true))}
                sx={{ border: "1px solid gray" }}
                size="medium"
              >
                {" "}
                <Add />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      </div>
      <div className="page-content">
        <Table
          tableData={tableData}
          columns={columns}
          endPoint="/api/attendance"
          fileName="Attendance"
        />
      </div>

      <UpdateAttendance />
      <AddAttendance employeeList={employeeList} />
    </div>
  );
};

export default Attendance;
