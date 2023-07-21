import { useEffect, useState } from "react";
import { Add } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";

import UpdateLeave from "../components/leave-comp/UpdateLeave";
import AddLeave from "../components/leave-comp/AddLeave";
import Table from "../components/Table";
import { useDispatch, useSelector } from "react-redux";
import {
  addAlertDetails,
  addModalTogal,
  addSessionUser,
  setTableLoader
} from "../redux/features/StatusVar";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useLocation, useNavigate } from "react-router-dom";

const Leaves = () => {
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
    const controller = new AbortController();
    dispatch(setTableLoader(true));
    const getData = async () => {
      try {
        const responce = await axiosPrivate.get("/api/leave", {
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
          return dispatch(
            addAlertDetails({
              status: true,
              type: "error",
              message: "Something went wrong!"
            })
          );
        }

        setTableData(responce.data);
        // console.log(tableData);
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
        // console.log(responce.data);
        if (responce.data.error === "Invalid!") {
          dispatch(addSessionUser({ type: "remove", payload: sessionUser }));
          return navigate("/", { state: { from: location }, replace: true });
        }

        if (responce.data.error) {
          return dispatch(
            addAlertDetails({
              status: true,
              type: "error",
              message: "Something went wrong!"
            })
          );
        }

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
      header: "Type",
      accessorKey: "leaveType",
      Cell: ({ cell }) =>
        cell.getValue() === 1
          ? "Anual"
          : cell.getValue() === 2
          ? "Casual"
          : cell.getValue() === 3
          ? "Medical"
          : cell.getValue() === 4
          ? "Nopay"
          : "Carry overs"
    },
    {
      accessorFn: (row) => new Date(row.startDate),
      header: "Start",
      accessorKey: "startDate",
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
      accessorFn: (row) => new Date(row.endDate),
      header: "End",
      accessorKey: "endDate",
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
      header: "No of Days",
      accessorKey: "numberofDays"
    },
    {
      header: "Status",
      accessorKey: "status",
      Cell: ({ cell }) => (
        <span
          style={{
            color:
              cell.getValue() === 1
                ? "green"
                : cell.getValue() === 2
                ? "red"
                : ""
          }}
        >
          {cell.getValue() === 0
            ? "Approval Pending"
            : cell.getValue() === 1
            ? "Approved"
            : "Rejected"}
        </span>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h3>Leaves</h3>
        <div style={{ display: "flex" }}>
          <div className="add">
            <Tooltip title="Add Item">
              <IconButton
                onClick={() => dispatch(addModalTogal(true))}
                // variant="contained"
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
          endPoint="/api/leave"
          fileName="Leaves-Data"
        />
      </div>

      <UpdateLeave />
      <AddLeave employeeList={employeeList} />
    </div>
  );
};

export default Leaves;
