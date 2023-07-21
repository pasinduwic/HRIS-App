import { useEffect, useState } from "react";

import { Add, Download, Visibility } from "@mui/icons-material";
import { Box, IconButton, Tooltip } from "@mui/material";
import MaterialReactTable from "material-react-table";

import AddEmployee from "../components/emp-comp/AddEmployee";
import { useDispatch, useSelector } from "react-redux";
import {
  addAlertDetails,
  addModalTogal,
  addSessionUser,
  setTableLoader
} from "../redux/features/StatusVar";
import { useLocation, useNavigate } from "react-router-dom";
import Notifications from "../components/Notification";
import { CSVLink } from "react-csv";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

const Employee = () => {
  const [tableData, setTableData] = useState([]);
  const dispatch = useDispatch();
  const addModal = useSelector((state) => state.statusVar.value.addModal);
  const refreshData = useSelector((state) => state.statusVar.value.refreshData);
  const tableLoader = useSelector((state) => state.statusVar.value.tableLoader);
  const [exportHeaders, setExportHeaders] = useState([]);
  const sessionUser = useSelector((state) => state.statusVar.value.sessionUser);
  const axiosPrivate = useAxiosPrivate();
  const location = useLocation();

  const navigate = useNavigate();

  //fetching table data
  useEffect(() => {
    const controller = new AbortController();
    const getData = async () => {
      dispatch(setTableLoader(true));
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
        console.log(tableData);
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
      header: "Emp No",
      accessorKey: "employee_no"
    },
    {
      accessorFn: (row) => `${row.first_name} ${row.last_name}`,
      id: "name",
      header: "Name"
    },
    // {
    //   header: "Last Name",
    //   accessorKey: "last_name"
    // },
    {
      header: "Designation",
      accessorKey: "designation.name"
    },
    // {
    //   header: "Email",
    //   accessorKey: "email"
    // },
    // {
    //   header: "EPF",
    //   accessorKey: "epf_no"
    // },
    // {
    //   header: "Photo",
    //   accessorKey: "photo"
    // },
    // {
    //   header: "HOD",
    //   accessorKey: "HOD.first_name"
    // },
    {
      header: "department",
      accessorKey: "department.name"
    }
    // {
    //   header: "Phone: office",
    //   accessorKey: "phone_office"
    // },
    // {
    //   header: "Phone: personal",
    //   accessorKey: "phone_personal"
    // },
    // {
    //   header: "Address",
    //   accessorKey: "address"
    // },
    // {
    //   header: "Emg-contact",
    //   accessorKey: "emergancy_contact_name"
    // },
    // {
    //   header: "Emg-number",
    //   accessorKey: "emergancy_contact_number"
    // },
    // {
    //   header: "Joined Date",
    //   accessorKey: "joined_date"
    // },
    // {
    //   header: "End Date",
    //   accessorKey: "end_date"
    // },
    // {
    //   header: "Status",
    //   accessorKey: "emp_status"
    // },
    // {
    //   header: "Office",
    //   accessorKey: "office.name"
    // }
  ];

  useEffect(() => {
    const downloadData = columns.map((col) => ({
      label: col.header,
      key: col.accessorKey
    }));

    setExportHeaders(downloadData);
  }, []);

  const handelView = (row) => {
    // console.log(row.original);
    navigate(`/home/employee/${row.original._id}`);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h3>Employees</h3>
        <div style={{ display: "flex" }}>
          <div className="add">
            {!addModal && (
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
            )}
          </div>
        </div>
      </div>
      <div className="page-content">
        {!addModal ? (
          <div className="tb">
            <MaterialReactTable
              displayColumnDefOptions={{
                "mrt-row-actions": {
                  muiTableHeadCellProps: {
                    align: "center"
                  },
                  size: 120
                }
              }}
              columns={columns}
              data={tableData}
              state={{ showSkeletons: tableLoader }}
              // enableEditing
              enableRowActions
              renderTopToolbarCustomActions={({ table }) => (
                <Box>
                  {/* <CSVLink
                    data={tableData}
                    headers={exportHeaders}
                    filename={"Employee-data.csv"}
                    target="_blank"
                  >
                    <Tooltip title="Download">
                      <IconButton>
                        <Download />
                      </IconButton>
                    </Tooltip>
                  </CSVLink> */}
                </Box>
              )}
              renderRowActions={({ row, table }) => (
                <Box
                  sx={{
                    display: "flex",
                    gap: "1rem",
                    justifyContent: "center"
                  }}
                >
                  <IconButton onClick={() => handelView(row)}>
                    <Visibility />
                  </IconButton>
                </Box>
              )}
            />
          </div>
        ) : (
          <AddEmployee empNo={tableData.length + 1} />
        )}
      </div>

      <Notifications />
    </div>
  );
};

export default Employee;
