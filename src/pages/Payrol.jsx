import { useEffect, useState } from "react";
import { Add } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";

import UpdatePayrol from "../components/payrol-comp/UpdatePayrol";
import AddPayrol from "../components/payrol-comp/AddPayrol";
import Table from "../components/Table";
import { useDispatch, useSelector } from "react-redux";
import {
  addAlertDetails,
  addModalTogal,
  addSessionUser,
  setTableLoader
} from "../redux/features/StatusVar";
import { useLocation, useNavigate } from "react-router-dom";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import Notifications from "../components/Notification";

const Payrol = () => {
  const [tableData, setTableData] = useState();
  const dispatch = useDispatch();
  const addModal = useSelector((state) => state.statusVar.value.addModal);
  const refreshData = useSelector((state) => state.statusVar.value.refreshData);
  const updateModal = useSelector((state) => state.statusVar.value.updateModal);
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
        const responce = await axiosPrivate.get("/api/payrol", {
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

  const columns = [
    {
      accessorFn: (row) =>
        `${row.employee.first_name} ${row.employee.last_name}`,
      id: "name",
      header: "Employee"
    },
    {
      accessorFn: (row) => new Date(row.date),
      header: "Date",
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
      header: "Amount",
      accessorKey: "amount",
      Cell: ({ cell }) => `Rs. ${cell.getValue()}`
    },
    {
      header: "Month",
      accessorKey: "month",
      Cell: ({ cell }) =>
        cell.getValue() === 1
          ? "January"
          : cell.getValue() === 2
          ? "February"
          : cell.getValue() === 3
          ? "March"
          : cell.getValue() === 4
          ? "April"
          : cell.getValue() === 5
          ? "May"
          : cell.getValue() === 6
          ? "June"
          : cell.getValue() === 7
          ? "July"
          : cell.getValue() === 8
          ? "August"
          : cell.getValue() === 9
          ? "September"
          : cell.getValue() === 10
          ? "October"
          : cell.getValue() === 11
          ? "November"
          : "December"
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h3>Payrol</h3>
        <div style={{ display: "flex" }}>
          <div className="add">
            {!addModal && !updateModal ? (
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
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
      <div className="page-content">
        {addModal ? (
          <AddPayrol />
        ) : updateModal ? (
          <UpdatePayrol />
        ) : (
          <Table
            tableData={tableData}
            columns={columns}
            endPoint="/api/payrol"
            isView={true}
            fileName="Payrol-data"
          />
          // <></>
        )}
      </div>
      <Notifications />
    </div>
  );
};

export default Payrol;
