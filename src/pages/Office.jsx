import { useEffect, useState } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

import { Add } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";

import UpdateOffice from "../components/office-comp/UpdateOffice";
import AddOffice from "../components/office-comp/AddOffice";
import Table from "../components/Table";
import { useDispatch, useSelector } from "react-redux";
import {
  addAlertDetails,
  addModalTogal,
  addSessionUser,
  setTableLoader
} from "../redux/features/StatusVar";
import { useLocation, useNavigate } from "react-router-dom";

const Office = () => {
  const [tableData, setTableData] = useState([]);
  const dispatch = useDispatch();
  const refreshData = useSelector((state) => state.statusVar.value.refreshData);
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
        const responce = await axiosPrivate.get("/api/office", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `token ${sessionUser.accessToken}`
          },
          withCredentials: true,
          signal: controller.signal
        });
        console.log(responce);
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

  //defining columns
  const columns = [
    {
      header: "Name",
      accessorKey: "name"
    },
    {
      header: "Location",
      accessorKey: "location"
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h3>Offices</h3>
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
          endPoint="/api/office"
          fileName="Office-data"
        />
      </div>

      <UpdateOffice />
      <AddOffice />
    </div>
  );
};

export default Office;
