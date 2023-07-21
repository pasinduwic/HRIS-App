import { useEffect, useState } from "react";
import { Add } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";

import UpdateDesignation from "../components/designation-comp/UpdateDesignation";
import AddDesignation from "../components/designation-comp/AddDesignation";
import Table from "../components/Table";
import { useDispatch, useSelector } from "react-redux";
import {
  addAlertDetails,
  addModalTogal,
  addSessionUser,
  setTableLoader
} from "../redux/features/StatusVar";
import { useLocation, useNavigate } from "react-router-dom";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

const Designation = () => {
  const [tableData, setTableData] = useState([]);
  const [deptData, setDeptData] = useState([]);
  const dispatch = useDispatch();
  const refreshData = useSelector((state) => state.statusVar.value.refreshData);
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
        const responce = await axiosPrivate.get("/api/designation", {
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
    const getOfficeData = async () => {
      try {
        const responce = await axiosPrivate.get("/api/department", {
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

        setDeptData(responce.data);
        // console.log(tableData);
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
    getOfficeData();
    return () => controller.abort();
  }, []);

  //defining columns
  const columns = [
    {
      header: "Name",
      accessorKey: "name"
    },
    {
      header: "Level",
      accessorKey: "level",
      Cell: ({ cell }) =>
        cell.getValue() === 0
          ? "Trainee"
          : cell.getValue() === 1
          ? "Associate"
          : cell.getValue() === 2
          ? "Senior"
          : cell.getValue() === 3
          ? "Manager"
          : "Exco"
    },
    {
      header: "Department",
      accessorKey: "department.name"
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h3>Designations</h3>
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
          endPoint="/api/designation"
          fileName="Designation"
        />
      </div>

      <AddDesignation deptList={deptData} />
      <UpdateDesignation deptList={deptData} />
    </div>
  );
};

export default Designation;
