import DashboardCards from "../components/DashboardCards";
import GroupsIcon from "@mui/icons-material/Groups";
import DomainAddIcon from "@mui/icons-material/DomainAdd";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Typography
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  addAlertDetails,
  addModalTogal,
  addSessionUser
} from "../redux/features/StatusVar";
import { useDispatch } from "react-redux";
import moment from "moment";
import ChartComp from "../components/Chart";
import { useSelector } from "react-redux";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import UpdateCard from "../components/UpdateCard";

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [employeeCount, setEmployeeCount] = useState(undefined);
  const [birthdayList, setBirthdayList] = useState([]);
  const [attendanceCount, setAttendanceCount] = useState(undefined);
  const [leaveData, setLeaveData] = useState(undefined);
  const [deptCount, setDeptCount] = useState(undefined);
  const [graphdata, setGraphData] = useState(undefined);
  const sessionUser = useSelector((state) => state.statusVar.value.sessionUser);
  const axiosPrivate = useAxiosPrivate();
  const location = useLocation();

  //fetching table data
  const presenceToday = async () => {
    setAttendanceCount(undefined);
    const responceAttendance = await axiosPrivate.get("/api/attendance", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${sessionUser.accessToken}`
      },
      withCredentials: true
    });

    if (responceAttendance.data.error) {
      dispatch(
        addAlertDetails({
          status: true,
          type: "error",
          message: "failed to load attendance!"
        })
      );
      setAttendanceCount(0);
    } else {
      let attCount = 0;

      // console.lo(responceAttendance.data);
      responceAttendance.data.map((att) => {
        // console.log(moment(att.date).format("YYYY-MM-DD"));
        if (
          moment(att.date).format("YYYY-MM-DD") ===
          moment(new Date()).format("YYYY-MM-DD")
        ) {
          attCount += 1;
        }
      });
      // console.log(moment(new Date()).format("YYYY-MM-DD"));
      setAttendanceCount(attCount);
    }
  };

  const leaveToday = async () => {
    setLeaveData(undefined);
    const responceLeave = await axiosPrivate.get("/api/leave", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${sessionUser.accessToken}`
      },
      withCredentials: true
    });

    if (responceLeave.data.error) {
      dispatch(
        addAlertDetails({
          status: true,
          type: "error",
          message: "failed to load leave!"
        })
      );
    } else {
      const onLeaveList = responceLeave.data.filter((leave) =>
        moment(new Date()).isBetween(
          moment(leave.startDate).format("YYYY-MM-DD"),
          moment(leave.endDate).add(1, "days").format("YYYY-MM-DD")
        )
      );

      // console.log(onLeaveList);
      setLeaveData(onLeaveList);
    }
  };
  useEffect(() => {
    // console.log("sessionUsernew");
    // console.log(sessionUser);
    const controller = new AbortController();
    const getData = async () => {
      try {
        const responce = await axiosPrivate.get("/api/employee", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `token ${sessionUser?.accessToken}`
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
              message: "failed to load employee data!"
            })
          );
        } else {
          setEmployeeCount(responce.data.length);

          // console.log(employeeData.length)
          const Blist = responce.data
            .filter((emp) => emp.birthDay)
            .filter(
              (emp) =>
                moment(emp.birthDay).format("YYYY-MM-DD") ===
                moment(new Date()).format("YYYY-MM-DD")
            );

          // console.log(Blist);
          setBirthdayList(Blist);
        }

        //fetching grap data
        const responcePayrol = await axiosPrivate.get("/api/payrol", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `token ${sessionUser.accessToken}`
          },
          withCredentials: true,
          signal: controller.signal
        });

        if (responcePayrol.data.error === "Invalid!") {
          dispatch(addSessionUser({ type: "remove", payload: sessionUser }));
          return navigate("/", { state: { from: location }, replace: true });
        }

        if (responcePayrol.data.error) {
          dispatch(
            addAlertDetails({
              status: true,
              type: "error",
              message: "failed to load graph data!"
            })
          );
        } else {
          let data = [
            {
              month: 1,
              amount: 0,
              otAmount: 0
            },
            {
              month: 2,
              amount: 0,
              otAmount: 0
            },
            {
              month: 3,
              amount: 0,
              otAmount: 0
            },
            {
              month: 4,
              amount: 0,
              otAmount: 0
            },
            {
              month: 5,
              amount: 0,
              otAmount: 0
            },
            {
              month: 6,
              amount: 0,
              otAmount: 0
            },
            {
              month: 7,
              amount: 0,
              otAmount: 0
            },
            {
              month: 8,
              amount: 0,
              otAmount: 0
            },
            {
              month: 9,
              amount: 0,
              otAmount: 0
            },
            {
              month: 10,
              amount: 0,
              otAmount: 0
            },
            {
              month: 11,
              amount: 0,
              otAmount: 0
            },
            {
              month: 12,
              amount: 0,
              otAmount: 0
            }
          ];

          responcePayrol.data.map((payrol) =>
            data.map((d) => {
              if (d.month === payrol.month) {
                d.amount += payrol.amount;
                d.otAmount += payrol.otAmount;
              }
            })
          );

          data.sort();

          // console.log(data);
          setGraphData(data);
        }

        const responceDept = await axiosPrivate.get("/api/department", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `token ${sessionUser.accessToken}`
          },
          withCredentials: true,
          signal: controller.signal
        });

        if (responceDept.data.error === "Invalid!") {
          dispatch(addSessionUser({ type: "remove", payload: sessionUser }));
          return navigate("/", { state: { from: location }, replace: true });
        }

        if (responceDept.data.error) {
          dispatch(
            addAlertDetails({
              status: true,
              type: "error",
              message: "failed to load departments!"
            })
          );
        } else {
          setDeptCount(responceDept.data.length);
        }

        presenceToday();
        leaveToday();
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
    getData();
    return () => controller.abort();
  }, []);
  return (
    <div className="dashboard page-container">
      <div className="page-header">
        <h3>Dasboard</h3>
      </div>

      <div className="page-content dashboard-content">
        <div className="dashboard-upper">
          <Paper
            elevation={2}
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <div className="cards">
              <DashboardCards
                value={employeeCount}
                name={"Total Employees"}
                image={<GroupsIcon color="success" fontSize="large" />}
              />
              <DashboardCards
                value={deptCount}
                name={"Total Departments"}
                image={
                  <DomainAddIcon
                    sx={{ color: "rgb(22, 30, 84)" }}
                    fontSize="large"
                  />
                }
              />
            </div>
            <div className="graphs">
              <ChartComp
                data={graphdata}
                color1="rgb(253, 47, 47)"
                color2="rgb(22, 30, 84)"
                type="Composed"
              />
              {/* <ChartComp
              data={graphdata}
              color1="#82ca9d"
              color2="#413ea0"
              type="pie"
            /> */}
            </div>
          </Paper>
        </div>

        <div className="dashboard-lower">
          <div className="shortcut-container">
            <Card className="short-cuts">
              <CardHeader title="Shortcuts" />
              <CardContent>
                <Box className="shortcut-box">
                  <Paper elevation={3} className="shortcut-paper">
                    <IconButton
                      onClick={() => {
                        dispatch(addModalTogal(true));
                        navigate("/home/leaves");
                      }}
                      sx={{ border: "1px solid gray" }}
                      size="small"
                    >
                      {" "}
                      <Add />
                    </IconButton>
                    <Typography variant="caption" display="block">
                      Add Leave
                    </Typography>
                  </Paper>
                  <Paper elevation={3} className="shortcut-paper">
                    <IconButton
                      onClick={() => {
                        dispatch(addModalTogal(true));
                        navigate("/home/attendance");
                      }}
                      sx={{ border: "1px solid gray" }}
                      size="small"
                    >
                      {" "}
                      <Add />
                    </IconButton>
                    <Typography variant="caption" display="block">
                      Add Attendance
                    </Typography>
                  </Paper>
                </Box>
              </CardContent>
            </Card>
          </div>
          <div className="updates">
            <Card sx={{ height: "98%" }}>
              <CardHeader title="Updates" />
              <CardContent>
                <Box sx={{ overflow: "scroll" }}>
                  <div className="update-cards">
                    <UpdateCard
                      value={attendanceCount}
                      name={"Presence Today"}
                      func={presenceToday}
                    />
                    <UpdateCard
                      value={leaveData?.length}
                      name={"On Leaves Today"}
                      viewList={leaveData}
                      func={leaveToday}
                    />
                  </div>

                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    sx={{ textAlign: "left", margin: "0 0 10px 18px" }}
                  >
                    {birthdayList.length === 0
                      ? "No Birthdays Today"
                      : "Birthdays Today"}
                  </Typography>

                  <List>
                    {birthdayList.map((emp) => (
                      <>
                        <ListItem alignItems="flex-start">
                          <ListItemAvatar>
                            <Avatar alt="Remy Sharp" src={emp.photo} />
                          </ListItemAvatar>
                          <ListItemText
                            primary={emp.first_name + " " + emp.last_name}
                            secondary={moment(new Date()).format("YYYY-MM-DD")}
                          />
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </>
                    ))}
                  </List>
                </Box>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
