import { useEffect, useRef, useState } from "react";

import { Close, Edit, ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Breadcrumbs,
  Button,
  IconButton,
  Skeleton,
  Tooltip,
  Typography
} from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import { addAlertDetails, addSessionUser } from "../redux/features/StatusVar";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Col, Form, Row, Spinner } from "react-bootstrap";
import Notifications from "../components/Notification";
import { Formik } from "formik";
import * as yup from "yup";
import moment from "moment";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import Link from "@mui/material/Link";
import Avatar from "@mui/material/Avatar";
import DeleteIcon from "@mui/icons-material/Delete";

const validationSchema = yup.object().shape({
  epf_no: yup.number().required("EPF is required!"),
  first_name: yup.string().required("First name is required!"),
  last_name: yup.string().required("Last name is required!"),
  email: yup.string().required("Email is required!"),
  NIC: yup.string().required("NIC is required!")
});
const validationSalarySchema = yup.object().shape({
  basic: yup.number().required("Basic Salary is required!")
});

const EmployeeDetails = () => {
  const [employeeData, setEmployeeData] = useState({
    employee_no: "",
    first_name: "",
    last_name: "",
    designation: "",
    email: "",
    epf_no: 0,
    photo: "",
    HOD: "",
    department: "",
    phone_office: 0,
    phone_personal: 0,
    address: "",
    emergancy_contact_name: "",
    emergancy_contact_number: 0,
    joined_date: "",
    end_date: "",
    emp_status: 0,
    office: "",
    NIC: "",
    nationality: "",
    riligion: "",
    marital_status: 0,
    carder: 0,
    birthDay: ""
  });
  const [salaryDetails, setSalaryDetails] = useState();
  const [loader, setLoader] = useState(false);
  const [newSalary, setNewSalary] = useState(false);
  const [newLeave, setNewLeave] = useState(false);
  const [deptData, setDeptData] = useState([]);
  const [officeData, setOfficeData] = useState([]);
  const [designationData, setDesignationData] = useState([]);
  const [HODData, setHODData] = useState([]);
  const [leaveDetails, setLeaveDetails] = useState();
  const dispatch = useDispatch();
  const [setActiveStep] = useState(0);
  const [mode, setMode] = useState(0);
  const [formLoader, setFormLoader] = useState(true);
  const [expanded, setExpanded] = useState("p1");
  const id = useParams().id;
  const sessionUser = useSelector((state) => state.statusVar.value.sessionUser);
  const axiosPrivate = useAxiosPrivate();
  const location = useLocation();
  const navigate = useNavigate();
  const hiddenUpload = useRef(null);
  //fetching table data
  useEffect(() => {
    const controller = new AbortController();
    const getData = async () => {
      setFormLoader(true);
      try {
        const responce = await axiosPrivate.get("/api/employee" + id, {
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
              message: "failed to load data!"
            })
          );
        }
        setEmployeeData(responce.data);
        // console.log("employeeData");
        console.log(employeeData);
        const responceSalary = await axiosPrivate.get("/api/salary" + id, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `token ${sessionUser.accessToken}`
          },
          withCredentials: true,
          signal: controller.signal
        });
        const responceLeave = await axiosPrivate.get("/api/lvrecords" + id, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `token ${sessionUser.accessToken}`
          },
          withCredentials: true,
          signal: controller.signal
        });

        if (responceSalary.data.error) {
          console.log(responceSalary.data.error);
          dispatch(
            addAlertDetails({
              status: true,
              type: "error",
              message: "failed to load salary!"
            })
          );
          setSalaryDetails({
            EPFCompany: 0,
            EPFEmp: 0,
            ETF: 0,
            OTAllawance: 0,
            basic: 0,
            employee: responce.data._id,
            gross: 0,
            mobileAllawance: 0,
            net: 0,
            otherAllawance: 0,
            transportAllawance: 0,
            tax: 0
          });
          setNewSalary(true);
        } else {
          setSalaryDetails(responceSalary.data);
        }
        if (responceLeave.data.error) {
          dispatch(
            addAlertDetails({
              status: true,
              type: "error",
              message: "failed to load leave!"
            })
          );
          setLeaveDetails({
            employee: responce.data._id,
            anual: 0,
            casual: 0,
            medical: 0
          });
          setNewLeave(true);
        } else {
          setLeaveDetails(responceLeave.data);
        }
        setFormLoader(false);
        const responceDept = await axiosPrivate.get("/api/department", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `token ${sessionUser.accessToken}`
          },
          withCredentials: true,
          signal: controller.signal
        });
        const responceHOD = await axiosPrivate.get("/api/employee", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `token ${sessionUser.accessToken}`
          },
          withCredentials: true,
          signal: controller.signal
        });
        const responceDesignation = await axiosPrivate.get("/api/designation", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `token ${sessionUser.accessToken}`
          },
          withCredentials: true,
          signal: controller.signal
        });
        const responceOffice = await axiosPrivate.get("/api/office", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `token ${sessionUser.accessToken}`
          },
          withCredentials: true,
          signal: controller.signal
        });

        if (
          responceLeave.data.error === "Invalid!" ||
          responceSalary.data.error === "Invalid!" ||
          responceOffice.data.error === "Invalid!" ||
          responceDesignation.data.error === "Invalid!" ||
          responceHOD.data.error === "Invalid!" ||
          responceDept.data.error === "Invalid!"
        ) {
          dispatch(addSessionUser({ type: "remove", payload: sessionUser }));
          return navigate("/", { state: { from: location }, replace: true });
        }
        // console.log(employeeData);
        if (responceDept.data.error) {
          dispatch(
            addAlertDetails({
              status: true,
              type: "error",
              message: "failed to load departments!"
            })
          );
        } else {
          setDeptData(responceDept.data);
        }
        if (responceHOD.data.error) {
          dispatch(
            addAlertDetails({
              status: true,
              type: "error",
              message: "failed to load HOD!"
            })
          );
        } else {
          setHODData(responceHOD.data);
        }
        if (responceDesignation.data.error) {
          dispatch(
            addAlertDetails({
              status: true,
              type: "error",
              message: "failed to load designations!"
            })
          );
        } else {
          setDesignationData(responceDesignation.data);
        }
        if (responceOffice.data.error) {
          dispatch(
            addAlertDetails({
              status: true,
              type: "error",
              message: "failed to load HOD!"
            })
          );
        } else {
          setOfficeData(responceOffice.data);
        }

        //need  check error logics

        // console.log(salaryDetails);
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

  const handelNext = () => {
    // console.log(salaryDetails);
    setActiveStep((pre) => pre + 1);
  };
  const handelBack = () => {
    setActiveStep((pre) => pre - 1);
  };

  const handelSalarySubmit = async () => {
    setLoader(true);
    try {
      // console.log(newSalary)
      let responceSalary;
      if (newSalary) {
        responceSalary = await axiosPrivate.post("/api/salary", salaryDetails, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `token ${sessionUser.accessToken}`
          },
          withCredentials: true
        });
      } else {
        responceSalary = await axiosPrivate.put(
          "/api/salary" + salaryDetails?._id,
          salaryDetails,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `token ${sessionUser.accessToken}`
            },
            withCredentials: true
          }
        );
      }

      if (responceSalary.data.error === "Invalid!") {
        dispatch(addSessionUser({ type: "remove", payload: sessionUser }));
        return navigate("/", { state: { from: location }, replace: true });
      }

      console.log(responceSalary.data);

      if (responceSalary.data.error) {
        return dispatch(
          addAlertDetails({
            status: true,
            type: "error",
            message: "Something went wrong in Salary updating!"
          })
        );
      }
      if (responceSalary.data.errorSpecified) {
        return dispatch(
          addAlertDetails({
            status: true,
            type: "error",
            message: responceSalary.data.errorSpecified
          })
        );
      }

      dispatch(
        addAlertDetails({
          status: true,
          type: "success",
          message: "Salary Details updated successfully!"
        })
      );
      // setActiveStep(0);
      setMode(0);
      setNewSalary(false);
    } catch (e) {
      dispatch(
        addAlertDetails({
          status: true,
          type: "error",
          message: "Something went wrong!"
        })
      );
    } finally {
      setLoader(false);
    }
  };
  const handleFormSubmit = async () => {
    setLoader(true);

    try {
      const responce = await axiosPrivate.put(
        "/api/employee" + id,
        employeeData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `token ${sessionUser.accessToken}`
          },
          withCredentials: true
        }
      );

      if (responce.data.error === "Invalid!") {
        dispatch(addSessionUser({ type: "remove", payload: sessionUser }));
        return navigate("/", { state: { from: location }, replace: true });
      }
      if (responce.data.error) {
        return dispatch(
          addAlertDetails({
            status: true,
            type: "error",
            message: "Something went wrong in Employe updating!"
          })
        );
      }
      if (responce.data.errorSpecified) {
        return dispatch(
          addAlertDetails({
            status: true,
            type: "error",
            message: responce.data.errorSpecified
          })
        );
      }

      dispatch(
        addAlertDetails({
          status: true,
          type: "success",
          message: "Employee Details updated successfully!"
        })
      );

      setMode(0);
    } catch (e) {
      dispatch(
        addAlertDetails({
          status: true,
          type: "error",
          message: "Something went wrong!"
        })
      );
    } finally {
      setLoader(false);
    }
  };
  const handelLeaveSubmit = async () => {
    setLoader(true);

    try {
      let responceLeave;
      if (newLeave) {
        responceLeave = await axiosPrivate.post(
          "/api/lvrecords",
          leaveDetails,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `token ${sessionUser.accessToken}`
            },
            withCredentials: true
          }
        );
      } else {
        responceLeave = await axiosPrivate.put(
          "/api/lvrecords" + leaveDetails?._id,
          leaveDetails,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `token ${sessionUser.accessToken}`
            },
            withCredentials: true
          }
        );
      }

      if (responceLeave.data.error === "Invalid!") {
        dispatch(addSessionUser({ type: "remove", payload: sessionUser }));
        return navigate("/", { state: { from: location }, replace: true });
      }

      // console.log(responceLeave.data);
      if (responceLeave.data.error) {
        return dispatch(
          addAlertDetails({
            status: true,
            type: "error",
            message: "Something went wrong in Leave updating!"
          })
        );
      }
      if (responceLeave.data.errorSpecified) {
        return dispatch(
          addAlertDetails({
            status: true,
            type: "error",
            message: responceLeave.data.errorSpecified
          })
        );
      }

      dispatch(
        addAlertDetails({
          status: true,
          type: "success",
          message: "Leave details updated successfully!"
        })
      );

      setMode(0);
      setNewLeave(false);
    } catch (e) {
      dispatch(
        addAlertDetails({
          status: true,
          type: "error",
          message: "Something went wrong!"
        })
      );
    } finally {
      setLoader(false);
    }
  };

  const handelOnChange = async (e) => {
    const fieldName = e.target.getAttribute("name");
    var fieldValue = "";
    const newData = { ...employeeData };
    if (e.target.files) {
      var reader = new FileReader();
      await reader.readAsDataURL(e.target.files[0]);
      reader.onload = async () => {
        fieldValue = await reader.result;
        newData[fieldName] = fieldValue;
      };
      reader.onerror = (error) => {
        dispatch(
          addAlertDetails({
            status: true,
            type: "error",
            message: "Something went wrong!"
          })
        );
      };
    } else {
      fieldValue = e.target.value;
      newData[fieldName] = fieldValue;
    }
    setEmployeeData(newData);
    // console.log(newData);
  };
  const handelSalaryOnChange = (e) => {
    const fieldName = e.target.getAttribute("name");
    const fieldValue = e.target.value;
    console.log(fieldValue);
    const newData = { ...salaryDetails };
    newData[fieldName] = fieldValue;
    //calc gross
    newData.gross =
      parseInt(newData.basic) +
      parseInt(newData.transportAllawance) +
      parseInt(newData.mobileAllawance) +
      parseInt(newData.otherAllawance);

    //calc epf
    newData.EPFEmp = (parseInt(newData.basic) * 8) / 100;
    newData.EPFCompany = (parseInt(newData.basic) * 12) / 100;
    newData.ETF = (parseInt(newData.basic) * 3) / 100;

    //calc net
    newData.net =
      parseInt(newData.gross) -
      parseInt(newData.EPFEmp) -
      parseInt(newData.tax);

    setSalaryDetails(newData);
    console.log(newData);
  };
  const handelLeaveOnChange = (e) => {
    const fieldName = e.target.getAttribute("name");
    const fieldValue = e.target.value;
    // console.log(fieldName);
    const newData = { ...leaveDetails };
    newData[fieldName] = fieldValue;
    setLeaveDetails(newData);
    // console.log(newData);
  };

  const handelMode = () => {
    setMode(0);
    // setActiveStep(0);
  };

  const datForPicker = (date) => {
    return moment(date).format("YYYY-MM-DD");
  };

  const handlePanelChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };
  return (
    <div className="page-container">
      <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: "20px" }}>
        <Link
          underline="hover"
          color="inherit"
          onClick={() => navigate("/home/employee")}
        >
          Employee
        </Link>
        <Typography color="text.primary">Employee Details</Typography>
      </Breadcrumbs>
      <div className="page-header">
        <h3>
          Employee Details - {employeeData.first_name} {employeeData.last_name}
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div className="add">
            <Tooltip title="Add Item">
              <IconButton
                onClick={() => {
                  mode === 0 ? setMode(1) : handelMode();
                }}
                sx={{ border: "1px solid gray" }}
                size="medium"
              >
                {" "}
                {loader ? (
                  <Spinner animation="border" size="sm" />
                ) : mode === 0 ? (
                  <Edit />
                ) : (
                  <Close />
                )}
              </IconButton>
            </Tooltip>
          </div>
        </div>
      </div>
      <div className="emp-detail-content page-content">
        <Formik
          validationSchema={validationSchema}
          initialValues={{
            first_name: "employeeData.first_name",
            last_name: "employeeData.last_name",
            email: "employeeData.email",
            epf_no: 1,
            NIC: "employeeData.NIC"
          }}
          onSubmit={(values) => {
            handleFormSubmit();
          }}
        >
          {({
            handleSubmit,
            handleChange,
            handleBlur,
            values,
            touched,
            isValid,
            errors
          }) => (
            <div>
              <Form>
                <Accordion
                  expanded={expanded === "p1" ? true : false}
                  onChange={handlePanelChange("p1")}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    Official Details
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
                      {formLoader ? (
                        <>
                          <Row>
                            <Form.Group as={Col}>
                              <Skeleton animation="wave" width="50%" />
                              <Skeleton animation="wave" />
                            </Form.Group>
                            <Form.Group as={Col}>
                              <Skeleton animation="wave" width="50%" />
                              <Skeleton animation="wave" />
                            </Form.Group>
                            <Form.Group as={Col}>
                              <Skeleton animation="wave" width="50%" />
                              <Skeleton animation="wave" />
                            </Form.Group>
                          </Row>
                          <Row>
                            <Form.Group as={Col}>
                              <Skeleton animation="wave" width="50%" />
                              <Skeleton animation="wave" />
                            </Form.Group>
                            <Form.Group as={Col}>
                              <Skeleton animation="wave" width="50%" />
                              <Skeleton animation="wave" />
                            </Form.Group>
                          </Row>
                          <Row>
                            <Form.Group as={Col}>
                              <Skeleton animation="wave" width="50%" />
                              <Skeleton animation="wave" />
                            </Form.Group>
                            <Form.Group as={Col}>
                              <Skeleton animation="wave" width="50%" />
                              <Skeleton animation="wave" />
                            </Form.Group>
                          </Row>
                          <Row>
                            <Form.Group as={Col}>
                              <Skeleton animation="wave" width="50%" />
                              <Skeleton animation="wave" />
                            </Form.Group>
                            <Form.Group as={Col}>
                              <Skeleton animation="wave" width="50%" />
                              <Skeleton animation="wave" />
                            </Form.Group>
                          </Row>
                          <Row>
                            <Form.Group as={Col}>
                              <Skeleton animation="wave" width={50} />
                              <Skeleton animation="wave" />
                            </Form.Group>
                            <Form.Group as={Col}>
                              <Skeleton animation="wave" width={50} />
                              <Skeleton animation="wave" />
                            </Form.Group>
                            <Form.Group as={Col}>
                              <Skeleton animation="wave" width={50} />
                              <Skeleton animation="wave" />
                            </Form.Group>
                            <Form.Group as={Col}>
                              <Skeleton animation="wave" width={50} />
                              <Skeleton animation="wave" />
                            </Form.Group>
                          </Row>
                        </>
                      ) : (
                        <>
                          <Row style={{ alignItems: "center" }}>
                            <Form.Group as={Col}>
                              <Form.Label>Employee Number</Form.Label>
                              <Form.Control
                                type="text"
                                value={employeeData.employee_no}
                                disabled
                                onChange={handelOnChange}
                                name="employee_no"
                                size="sm"
                              />
                            </Form.Group>
                            <Form.Group as={Col}>
                              <Form.Label>EPF Number</Form.Label>
                              <Form.Control
                                disabled={mode === 0 ? true : false}
                                type="text"
                                value={employeeData.epf_no}
                                onChange={(e) => {
                                  handelOnChange(e);
                                  handleChange(e);
                                }}
                                name="epf_no"
                                isInvalid={!!errors.epf_no}
                                size="sm"
                              />
                              <Form.Control.Feedback type="invalid">
                                {errors.epf_no}
                              </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group
                              as={Col}
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "6px",
                                margin: "20px 0"
                              }}
                            >
                              <Avatar
                                alt=""
                                src={employeeData.photo}
                                htmlFor="file-upload"
                                onClick={() =>
                                  mode === 0
                                    ? null
                                    : hiddenUpload.current.click()
                                }
                                sx={{ width: 80, height: 80 }}
                              />

                              <Form.Label>
                                Employee Image
                                {mode === 0 || employeeData.photo === "" ? (
                                  <></>
                                ) : (
                                  <Tooltip title="Delete Image">
                                    <IconButton
                                      onClick={() => {
                                        const newData = { ...employeeData };
                                        newData["photo"] = "";
                                        setEmployeeData(newData);
                                      }}
                                      // variant="contained"
                                      // sx={{ border: "1px solid gray" }}
                                      size="small"
                                      color="error"
                                    >
                                      {" "}
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Form.Label>
                              <Form.Control
                                type="file"
                                id="file-upload"
                                onChange={(e) => {
                                  handelOnChange(e);
                                  handleChange(e);
                                }}
                                size="sm"
                                name="photo"
                                ref={hiddenUpload}
                                style={{ display: "none" }}
                              />
                            </Form.Group>
                          </Row>
                          <Row>
                            <Form.Group as={Col}>
                              <Form.Label>First Name</Form.Label>
                              <Form.Control
                                disabled={mode === 0 ? true : false}
                                type="text"
                                value={employeeData.first_name}
                                onChange={(e) => {
                                  handelOnChange(e);
                                  handleChange(e);
                                }}
                                name="first_name"
                                isInvalid={!!errors.first_name}
                                size="sm"
                              />
                              <Form.Control.Feedback type="invalid">
                                {errors.first_name}
                              </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col}>
                              <Form.Label>Last Name</Form.Label>
                              <Form.Control
                                disabled={mode === 0 ? true : false}
                                type="text"
                                value={employeeData.last_name}
                                onChange={(e) => {
                                  handelOnChange(e);
                                  handleChange(e);
                                }}
                                name="last_name"
                                isInvalid={!!errors.last_name}
                                size="sm"
                              />
                              <Form.Control.Feedback type="invalid">
                                {errors.last_name}
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Row>
                          <Row>
                            <Form.Group as={Col}>
                              <Form.Label>Designation</Form.Label>
                              <Form.Select
                                disabled={mode === 0 ? true : false}
                                onChange={handelOnChange}
                                name="designation"
                                size="sm"
                              >
                                {mode === 1 ? (
                                  designationData.map((desig) =>
                                    desig._id ===
                                    employeeData.designation?._id ? (
                                      <option
                                        value={desig._id}
                                        key={desig._id}
                                        selected
                                      >
                                        {desig.name}
                                      </option>
                                    ) : (
                                      <option value={desig._id} key={desig._id}>
                                        {desig.name}
                                      </option>
                                    )
                                  )
                                ) : (
                                  <option>
                                    {employeeData.designation?.name}
                                  </option>
                                )}
                              </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col}>
                              <Form.Label>Department</Form.Label>
                              <Form.Select
                                disabled={mode === 0 ? true : false}
                                onChange={handelOnChange}
                                name="department"
                                size="sm"
                              >
                                {mode === 1 ? (
                                  deptData?.map((dept) => (
                                    <option
                                      value={dept._id}
                                      key={dept._id}
                                      selected={
                                        dept._id ===
                                        employeeData.department?._id
                                      }
                                    >
                                      {dept.name}
                                    </option>
                                  ))
                                ) : (
                                  <option>
                                    {employeeData.department?.name}
                                  </option>
                                )}
                              </Form.Select>
                            </Form.Group>
                          </Row>
                          <Row>
                            <Form.Group as={Col}>
                              <Form.Label>Office Based At</Form.Label>
                              <Form.Select
                                disabled={mode === 0 ? true : false}
                                onChange={handelOnChange}
                                name="office"
                                size="sm"
                              >
                                {mode === 1 ? (
                                  officeData?.map((office) => (
                                    <option
                                      value={office._id}
                                      key={office._id}
                                      selected={
                                        office._id === employeeData.office?._id
                                      }
                                    >
                                      {office.name}
                                    </option>
                                  ))
                                ) : (
                                  <option>{employeeData.office?.name}</option>
                                )}
                              </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col}>
                              <Form.Label>Reporting Manger</Form.Label>
                              <Form.Select
                                disabled={mode === 0 ? true : false}
                                onChange={handelOnChange}
                                name="HOD"
                                size="sm"
                              >
                                {mode === 1 ? (
                                  HODData.map((HOD) => (
                                    <option
                                      value={HOD._id}
                                      key={HOD._id}
                                      selected={
                                        HOD._id === employeeData.HOD?._id
                                          ? true
                                          : false
                                      }
                                    >
                                      {HOD.first_name}
                                    </option>
                                  ))
                                ) : (
                                  <option>
                                    {employeeData.HOD?.first_name}
                                  </option>
                                )}
                              </Form.Select>
                            </Form.Group>
                          </Row>
                          <Row>
                            <Form.Group as={Col}>
                              <Form.Label>Joined Date</Form.Label>
                              <Form.Control
                                disabled={mode === 0 ? true : false}
                                type="date"
                                value={datForPicker(employeeData.joined_date)}
                                onChange={handelOnChange}
                                name="joined_date"
                                size="sm"
                              />
                            </Form.Group>
                            <Form.Group as={Col}>
                              <Form.Label>Resigned Date</Form.Label>
                              <Form.Control
                                disabled={mode === 0 ? true : false}
                                type="date"
                                value={
                                  employeeData.end_date
                                    ? datForPicker(employeeData.end_date)
                                    : ""
                                }
                                onChange={handelOnChange}
                                name="end_date"
                                size="sm"
                              />
                            </Form.Group>
                            <Form.Group as={Col}>
                              <Form.Label>Employee Status</Form.Label>
                              <Form.Select
                                disabled={mode === 0 ? true : false}
                                onChange={handelOnChange}
                                name="emp_status"
                                size="sm"
                              >
                                <option
                                  value="1"
                                  selected={
                                    employeeData.emp_status === 1 && true
                                  }
                                >
                                  Active
                                </option>
                                <option
                                  value="2"
                                  selected={
                                    employeeData.emp_status === 2 && true
                                  }
                                >
                                  Inactive
                                </option>
                              </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col}>
                              <Form.Label>Employee Carder</Form.Label>
                              <Form.Select
                                disabled={mode === 0 ? true : false}
                                onChange={handelOnChange}
                                name="emp_status"
                                size="sm"
                              >
                                <option
                                  value="0"
                                  selected={employeeData.carder === 0 && true}
                                >
                                  Intern
                                </option>
                                <option
                                  value="1"
                                  selected={employeeData.carder === 1 && true}
                                >
                                  Contract
                                </option>
                                <option
                                  value="2"
                                  selected={employeeData.carder === 2 && true}
                                >
                                  Permanent
                                </option>
                                <option
                                  value="3"
                                  selected={employeeData.carder === 3 && true}
                                >
                                  Exco
                                </option>
                              </Form.Select>
                            </Form.Group>
                          </Row>
                          <Box
                            sx={{ display: "flex", justifyContent: "flex-end" }}
                          >
                            {mode === 1 && !loader ? (
                              <Button onClick={() => handelMode()}>
                                Discard
                              </Button>
                            ) : (
                              ""
                            )}
                            {mode === 1 ? (
                              loader ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                <Button
                                  variant="primary"
                                  onClick={handleSubmit}
                                >
                                  Save
                                </Button>
                              )
                            ) : (
                              ""
                            )}
                          </Box>
                        </>
                      )}{" "}
                    </Box>
                  </AccordionDetails>
                </Accordion>

                <Accordion
                  expanded={expanded === "p2" ? true : false}
                  onChange={handlePanelChange("p2")}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    Contact Details
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
                      <Row>
                        <Form.Group as={Col}>
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            disabled={mode === 0 ? true : false}
                            type="text"
                            value={employeeData.email}
                            onChange={(e) => {
                              handelOnChange(e);
                              handleChange(e);
                            }}
                            name="email"
                            isInvalid={!!errors.email}
                            size="sm"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.email}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Row>
                      <Row>
                        <Form.Group as={Col}>
                          <Form.Label>Phone - Official</Form.Label>
                          <Form.Control
                            disabled={mode === 0 ? true : false}
                            type="text"
                            value={employeeData.phone_office}
                            onChange={handelOnChange}
                            name="phone_office"
                            size="sm"
                          />
                        </Form.Group>
                        <Form.Group as={Col}>
                          <Form.Label>Phone - Personal</Form.Label>
                          <Form.Control
                            disabled={mode === 0 ? true : false}
                            type="text"
                            value={employeeData.phone_personal}
                            onChange={handelOnChange}
                            name="phone_personal"
                            size="sm"
                          />
                        </Form.Group>
                      </Row>
                      <Row>
                        <Form.Group as={Col}>
                          <Form.Label>Address</Form.Label>
                          <Form.Control
                            disabled={mode === 0 ? true : false}
                            type="text"
                            value={employeeData.address}
                            onChange={handelOnChange}
                            name="address"
                            size="sm"
                          />
                        </Form.Group>
                      </Row>
                      <Row>
                        <h3>Emergancy Contact Details</h3>
                      </Row>
                      <Row>
                        <Form.Group as={Col}>
                          <Form.Label>Name</Form.Label>
                          <Form.Control
                            disabled={mode === 0 ? true : false}
                            type="text"
                            value={employeeData.emergancy_contact_name}
                            onChange={handelOnChange}
                            name="emergancy_contact_name"
                            size="sm"
                          />
                        </Form.Group>
                        <Form.Group as={Col}>
                          <Form.Label>Contact Number</Form.Label>
                          <Form.Control
                            disabled={mode === 0 ? true : false}
                            type="text"
                            value={employeeData.emergancy_contact_number}
                            onChange={handelOnChange}
                            name="emergancy_contact_number"
                            size="sm"
                          />
                        </Form.Group>
                      </Row>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      {mode === 1 && !loader ? (
                        <Button
                          // color="inherit"
                          onClick={() => handelMode()}
                        >
                          Discard
                        </Button>
                      ) : (
                        ""
                      )}
                      {mode === 1 ? (
                        loader ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          <Button variant="secondary" onClick={handleSubmit}>
                            Save
                          </Button>
                        )
                      ) : (
                        ""
                      )}
                    </Box>
                  </AccordionDetails>
                </Accordion>

                <Accordion
                  expanded={expanded === "p3" ? true : false}
                  onChange={handlePanelChange("p3")}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    Personal Details
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
                      <Row>
                        <Form.Group as={Col}>
                          <Form.Label>NIC</Form.Label>
                          <Form.Control
                            disabled={mode === 0 ? true : false}
                            type="text"
                            defaultValue={employeeData.NIC}
                            onChange={(e) => {
                              handelOnChange(e);
                              handleChange(e);
                            }}
                            name="NIC"
                            isInvalid={!!errors.NIC}
                            size="sm"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.NIC}
                          </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group as={Col}>
                          <Form.Label>Birthday</Form.Label>
                          <Form.Control
                            disabled={mode === 0 ? true : false}
                            type="date"
                            value={
                              employeeData.birthDay
                                ? datForPicker(employeeData.birthDay)
                                : ""
                            }
                            onChange={handelOnChange}
                            name="birthDay"
                            size="sm"
                          />
                        </Form.Group>
                      </Row>
                      <Row>
                        <Form.Group as={Col}>
                          <Form.Label>Nationality</Form.Label>
                          <Form.Control
                            disabled={mode === 0 ? true : false}
                            type="text"
                            value={employeeData.nationality}
                            onChange={handelOnChange}
                            name="nationality"
                            size="sm"
                          />
                        </Form.Group>
                        <Form.Group as={Col}>
                          <Form.Label>Religion</Form.Label>
                          <Form.Control
                            disabled={mode === 0 ? true : false}
                            type="text"
                            value={employeeData.riligion}
                            onChange={handelOnChange}
                            name="riligion"
                            size="sm"
                          />
                        </Form.Group>
                      </Row>
                      <Row>
                        <Form.Group as={Col}>
                          <Form.Label>Marital Status</Form.Label>
                          <Form.Select
                            disabled={mode === 0 ? true : false}
                            onChange={handelOnChange}
                            name="marital_status"
                            size="sm"
                          >
                            <option
                              value="0"
                              selected={
                                employeeData.marital_status === 0 && true
                              }
                            >
                              Unmarried
                            </option>
                            <option
                              value="1"
                              selected={
                                employeeData.marital_status === 1 && true
                              }
                            >
                              Married
                            </option>
                          </Form.Select>
                        </Form.Group>
                        <Form.Group as={Col}></Form.Group>
                        <Form.Group as={Col}></Form.Group>
                      </Row>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      {mode === 1 && !loader ? (
                        <Button
                          // color="inherit"
                          onClick={() => handelMode()}
                        >
                          Discard
                        </Button>
                      ) : (
                        ""
                      )}
                      {mode === 1 ? (
                        loader ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          <Button variant="primary" onClick={handleSubmit}>
                            Save
                          </Button>
                        )
                      ) : (
                        ""
                      )}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Form>
            </div>
          )}
        </Formik>
        <Accordion
          expanded={expanded === "p4" ? true : false}
          onChange={handlePanelChange("p4")}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            Salary Details
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Formik
                validationSchema={validationSalarySchema}
                initialValues={{
                  basic: 0
                }}
                onSubmit={(values) => {
                  handelSalarySubmit();
                }}
              >
                {({
                  handleSubmit,
                  handleChange,
                  handleBlur,
                  values,
                  touched,
                  isValid,
                  errors
                }) => (
                  <Form>
                    <Row>
                      <Form.Group as={Col}>
                        <Form.Label>Basic Salary</Form.Label>
                        <Form.Control
                          disabled={mode === 0 ? true : false}
                          type="text"
                          value={salaryDetails?.basic}
                          // defaultValue={salaryDetails?.basic}
                          onChange={(e) => {
                            handelSalaryOnChange(e);
                            handleChange(e);
                          }}
                          name="basic"
                          isInvalid={!!errors.basic}
                          size="sm"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.basic}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Row>
                    <Row>
                      <Form.Group as={Col}>
                        <Form.Label>Trasport Allawance </Form.Label>
                        <Form.Control
                          disabled={mode === 0 ? true : false}
                          type="text"
                          value={salaryDetails?.transportAllawance}
                          onChange={handelSalaryOnChange}
                          name="transportAllawance"
                          size="sm"
                        />
                      </Form.Group>
                      <Form.Group as={Col}>
                        <Form.Label>Mobile Allawance</Form.Label>
                        <Form.Control
                          disabled={mode === 0 ? true : false}
                          type="text"
                          value={salaryDetails?.mobileAllawance}
                          onChange={handelSalaryOnChange}
                          name="mobileAllawance"
                          size="sm"
                        />
                      </Form.Group>
                    </Row>
                    <Row>
                      <Form.Group as={Col}>
                        <Form.Label>Other Allawances</Form.Label>
                        <Form.Control
                          disabled={mode === 0 ? true : false}
                          type="text"
                          value={salaryDetails?.otherAllawance}
                          onChange={handelSalaryOnChange}
                          name="otherAllawance"
                          size="sm"
                        />
                      </Form.Group>
                      <Form.Group as={Col}>
                        <Form.Label>OT Allawance</Form.Label>
                        <Form.Control
                          disabled={mode === 0 ? true : false}
                          type="text"
                          value={salaryDetails?.OTAllawance}
                          onChange={handelSalaryOnChange}
                          name="OTAllawance"
                          size="sm"
                        />
                      </Form.Group>
                    </Row>
                    <Row>
                      <Form.Group as={Col}>
                        <Form.Label>Gross Salary</Form.Label>
                        <Form.Control
                          type="text"
                          value={salaryDetails?.gross}
                          onChange={handelSalaryOnChange}
                          name="gross"
                          disabled
                          size="sm"
                        />
                      </Form.Group>
                    </Row>
                    <Row>
                      <Form.Group as={Col}>
                        <Form.Label>EPF Employee</Form.Label>
                        <Form.Control
                          type="text"
                          value={salaryDetails?.EPFEmp}
                          onChange={handelSalaryOnChange}
                          name="EPFEmp"
                          disabled
                          size="sm"
                        />
                      </Form.Group>
                      <Form.Group as={Col}>
                        <Form.Label>EPF Company</Form.Label>
                        <Form.Control
                          type="text"
                          value={salaryDetails?.EPFCompany}
                          onChange={handelSalaryOnChange}
                          name="EPFCompany"
                          disabled
                          size="sm"
                        />
                      </Form.Group>
                      <Form.Group as={Col}>
                        <Form.Label>ETF</Form.Label>
                        <Form.Control
                          type="text"
                          value={salaryDetails?.ETF}
                          onChange={handelSalaryOnChange}
                          name="ETF"
                          disabled
                          size="sm"
                        />
                      </Form.Group>
                      <Form.Group as={Col}>
                        <Form.Label>Tax</Form.Label>
                        <Form.Control
                          disabled={mode === 0 ? true : false}
                          type="number"
                          value={salaryDetails?.tax}
                          onChange={handelSalaryOnChange}
                          name="tax"
                          size="sm"
                        />
                      </Form.Group>
                    </Row>
                    <Row>
                      <Form.Group as={Col}>
                        <Form.Label>Net Salary</Form.Label>
                        <Form.Control
                          type="text"
                          value={salaryDetails?.net}
                          onChange={handelSalaryOnChange}
                          name="net"
                          disabled
                          size="sm"
                        />
                      </Form.Group>
                    </Row>
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      {mode === 1 && !loader ? (
                        <Button
                          // color="inherit"
                          onClick={() => handelMode()}
                        >
                          Discard
                        </Button>
                      ) : (
                        ""
                      )}
                      {mode === 1 ? (
                        loader ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          <Button variant="secondary" onClick={handleSubmit}>
                            Save
                          </Button>
                        )
                      ) : (
                        ""
                      )}
                    </Box>
                  </Form>
                )}
              </Formik>
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded === "p5" ? true : false}
          onChange={handlePanelChange("p5")}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            Leave Details
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Form>
                <Row>
                  <Form.Group as={Col}>
                    <Form.Label>Anual Leaves</Form.Label>
                    <Form.Control
                      type="number"
                      value={leaveDetails?.anual}
                      onChange={handelLeaveOnChange}
                      name="anual"
                      disabled
                      size="sm"
                    />
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Form.Label>Casual Leaves</Form.Label>
                    <Form.Control
                      type="number"
                      value={leaveDetails?.casual}
                      onChange={handelLeaveOnChange}
                      name="casual"
                      disabled
                      size="sm"
                    />
                  </Form.Group>
                  <Form.Group as={Col}></Form.Group>
                </Row>
                <Row>
                  <Form.Group as={Col}>
                    <Form.Label>Medical Leaves</Form.Label>
                    <Form.Control
                      type="number"
                      value={leaveDetails?.medical}
                      onChange={handelLeaveOnChange}
                      name="medical"
                      disabled
                      size="sm"
                    />
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Form.Label>Nopay Leaves</Form.Label>
                    <Form.Control
                      type="number"
                      value={leaveDetails?.nopay}
                      onChange={handelLeaveOnChange}
                      name="nopay"
                      disabled
                      size="sm"
                    />
                  </Form.Group>
                  <Form.Group as={Col}></Form.Group>
                </Row>
                <Row>
                  <Form.Group as={Col}>
                    <Form.Label>Carryover Leaves</Form.Label>
                    <Form.Control
                      type="number"
                      value={leaveDetails?.carryOver}
                      onChange={handelLeaveOnChange}
                      name="carryOver"
                      disabled={mode === 0 ? true : false}
                      size="sm"
                    />
                  </Form.Group>
                  <Form.Group as={Col}></Form.Group>
                  <Form.Group as={Col}></Form.Group>
                </Row>
              </Form>
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                {mode === 1 && !loader ? (
                  <Button
                    // color="inherit"
                    onClick={() => handelMode()}
                  >
                    Discard
                  </Button>
                ) : (
                  ""
                )}
                {mode === 1 ? (
                  loader ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <Button variant="secondary" onClick={handelLeaveSubmit}>
                      Save
                    </Button>
                  )
                ) : (
                  ""
                )}
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      </div>
      <Notifications />
    </div>
  );
};

export default EmployeeDetails;
