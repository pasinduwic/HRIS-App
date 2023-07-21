import axios from "axios";
import { useEffect, useState } from "react";
import { Box, Button, Card, IconButton, Skeleton } from "@mui/material";
import { Col, Form, Modal, Row, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  addAlertDetails,
  addModalTogal,
  addSessionUser,
  setRefresh,
  setTableLoader,
  updateModalTogal
} from "../../redux/features/StatusVar";
import { Close } from "@mui/icons-material";
import { Formik } from "formik";
import * as yup from "yup";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useLocation, useNavigate } from "react-router-dom";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PaysheetPDF from "../PaysheetPDF";

const validationSchema = yup.object().shape({
  employee: yup.string().required("Employee is required!"),
  payType: yup.string().required("Pay type is required!"),
  date: yup.string().required("Date is required!"),
  month: yup.string().required("Month is required!")
});

const AddPayrol = ({ empList }) => {
  const [employeeData, setEmployeeData] = useState([]);
  const [selectedEmployeeData, setSelectedEmployeeData] = useState();
  const [salaryData, setSalaryData] = useState();
  const [loader, setLoader] = useState(false);
  const [leaveData, setLeaveData] = useState();
  const noPayRate = 12;
  const deleteModal = useSelector((state) => state.statusVar.value.deleteModal);
  const dispatch = useDispatch();
  const addModal = useSelector((state) => state.statusVar.value.addModal);
  const updateModal = useSelector((state) => state.statusVar.value.updateModal);
  const refreshData = useSelector((state) => state.statusVar.value.refreshData);
  const sessionUser = useSelector((state) => state.statusVar.value.sessionUser);
  const [addData, setAddData] = useState({
    paidBy: sessionUser?._id
  });
  const axiosPrivate = useAxiosPrivate();
  const location = useLocation();
  const navigate = useNavigate();

  const [formLoader, setFormLoader] = useState(true);
  const [finishCalculation, setFinishCalculation] = useState(false);
  const [paySaved, setPaySaved] = useState(false);

  //fetching table data
  useEffect(() => {
    const controller = new AbortController();
    setFormLoader(true);
    const getData = async () => {
      try {
        const responceEmp = await axiosPrivate.get("/api/employee", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `token ${sessionUser.accessToken}`
          },
          withCredentials: true,
          signal: controller.signal
        });
        if (responceEmp.data.error === "Invalid!") {
          dispatch(addSessionUser({ type: "remove", payload: sessionUser }));
          return navigate("/", { state: { from: location }, replace: true });
        }
        // console.log(responceEmp.data)
        if (responceEmp.data.error) {
          return dispatch(
            addAlertDetails({
              status: true,
              type: "error",
              message: "Something went wrong!"
            })
          );
        }

        setEmployeeData(responceEmp.data);
        setFormLoader(false);
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
    return () => {
      dispatch(addModalTogal(false));
      dispatch(updateModalTogal(false));
      controller.abort();
      // console.log("hutta")
    };
  }, []);

  //calculate
  const handelCalculate = async () => {
    // console.log(selectedEmployeeData);
    // setFinishCalculation(false)
    setLoader(true);
    try {
      const responceSalary = await axiosPrivate.get(
        "/api/salary" + selectedEmployeeData._id,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `token ${sessionUser.accessToken}`
          },
          withCredentials: true
          // signal: controller.signal
        }
      );
      // console.log(responceSalary.data);
      setSalaryData(responceSalary.data);

      const responceLeave = await axiosPrivate.get(
        "/api/lvrecords" + selectedEmployeeData._id,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `token ${sessionUser.accessToken}`
          },
          withCredentials: true
          // signal: controller.signal
        }
      );
      const responceAttendance = await axiosPrivate.get(
        "/api/attendance" + selectedEmployeeData._id,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `token ${sessionUser.accessToken}`
          },
          withCredentials: true
          // signal: controller.signal
        }
      );
      // await setLeaveData(responceLeave.data);
      if (
        responceSalary.data.error === "Invalid!" ||
        responceLeave.data.error === "Invalid!" ||
        responceAttendance.data.error === "Invalid!"
      ) {
        dispatch(addSessionUser({ type: "remove", payload: sessionUser }));
        return navigate("/", { state: { from: location }, replace: true });
      }
      const newLeaveData = responceLeave.data;
      const newSalaryData = responceSalary.data;
      // console.log(responceAttendance.data);
      let otCount = 0;
      if (!responceAttendance.data.error) {
        const attendanceData = responceAttendance.data.filter(
          (data) => data.month === parseInt(addData?.month)
        );
        // console.log(attendanceData)
        if (addData?.month !== 0 && attendanceData.length !== 0) {
          attendanceData.map((atte) => (otCount += atte.OT));
          // console.log(otCount);
        }
      }

      // console.log(otCount);
      // console.log(addData);
      if (responceSalary.data.error) {
        return dispatch(
          addAlertDetails({
            status: true,
            type: "error",
            message: "No Salary details available!"
          })
        );
      }
      const salaryEdited = Object.assign({}, responceSalary.data);

      delete salaryEdited._id;
      delete salaryEdited.__v;
      // delete salaryEdited.net;
      // delete salaryEdited.OTAllawance
      salaryEdited["OTCount"] = otCount;

      salaryEdited["otAmount"] =
        salaryEdited?.OTCount * newSalaryData?.OTAllawance;

      salaryEdited["nopay"] = noPayRate * newLeaveData?.nopay;
      salaryEdited["gross"] = newSalaryData?.gross + salaryEdited?.otAmount;
      salaryEdited["amountToEmployee"] =
        salaryEdited?.gross -
        salaryEdited?.EPFEmp -
        salaryEdited?.nopay -
        salaryEdited?.tax;
      salaryEdited["amount"] =
        salaryEdited?.amountToEmployee +
        newSalaryData?.ETF +
        newSalaryData?.EPFCompany;
      salaryEdited["amountByCompany"] =
        newSalaryData?.ETF + newSalaryData?.EPFCompany;

      // console.log(salaryEdited);
      setAddData((pre) => ({ ...pre, ...salaryEdited }));
      // console.log(addData);
      setFinishCalculation(true);

      // console.log(responceLeave.data);
    } catch (e) {
      dispatch(
        addAlertDetails({
          status: true,
          type: "error",
          message: "failed to load data!"
        })
      );
    } finally {
      setLoader(false);
    }
  };

  //handel change
  const handelOnChange = (e) => {
    const fieldName = e.target.getAttribute("name");
    const fieldValue = e.target.value;

    const newData = { ...addData };
    newData[fieldName] = fieldValue;

    setAddData(newData);
    console.log(addData);
  };

  const handelSubmit = async () => {
    // console.log("addData");
    // console.log(addData);
    // console.log(selectedEmployeeData);
    // setPaySaved(true);
    setLoader(true);
    try {
      const responce = await axiosPrivate.post("/api/payrol", addData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `token ${sessionUser.accessToken}`
        },
        withCredentials: true
        // signal: controller.signal
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
          message: "Item added successfully!"
        })
      );
      setPaySaved(true);
      // console.log(paySaved);
      dispatch(setRefresh(!refreshData));
    } catch (e) {
      console.log(e);
      dispatch(
        addAlertDetails({
          status: true,
          type: "error",
          message: "Something went wrong!"
        })
      );
    } finally {
      // dispatch(addModalTogal(false));

      setLoader(false);
    }
  };

  return (
    <Card
      sx={{
        margin: " 10px 10px 100px 10px",
        textAlign: "left",
        padding: "20px"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "28px"
        }}
      >
        <h5
          style={{
            margin: "0"
          }}
        >
          Add new Payrol
        </h5>
        <IconButton
          onClick={() => {
            dispatch(addModalTogal(false));
            dispatch(updateModalTogal(false));
          }}
          // variant="contained"
          sx={{ borderRadius: "50%", border: "1px solid gray" }}
          size="small"
        >
          {" "}
          <Close />
        </IconButton>
      </div>
      <Formik
        validationSchema={validationSchema}
        initialValues={{
          employee: "",
          payType: "",
          date: "",
          month: ""
        }}
        onSubmit={(values) => {
          // console.log("received")
          handelCalculate();
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
            {formLoader ? (
              <>
                <Row>
                  <Col>
                    <Form.Group>
                      <Skeleton animation="wave" width="50%" />

                      <Skeleton animation="wave" />
                    </Form.Group>
                  </Col>
                  <Col></Col>
                </Row>
                <Row style={{ marginBottom: "20px" }}>
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

                <Skeleton animation="wave" width="20%" />
              </>
            ) : (
              <>
                <Row>
                  <Col>
                    <Form.Group>
                      <Form.Label>Employee</Form.Label>

                      <Form.Select
                        placeholder="Location"
                        onChange={(e) => {
                          setSelectedEmployeeData(
                            employeeData.filter(
                              (emp) => emp._id === e.target.value
                            )[0]
                          );
                          handelOnChange(e);
                          handleChange(e);
                        }}
                        name="employee"
                        size="sm"
                        isInvalid={!!errors.employee}
                      >
                        <option value="">-- Select Employee --</option>
                        {employeeData?.map((emp) => (
                          <option value={emp._id} key={emp._id}>
                            {emp.first_name}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.employee}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col></Col>
                </Row>
                <Row style={{ marginBottom: "20px" }}>
                  <Form.Group as={Col}>
                    <Form.Label>Payrol Type</Form.Label>
                    <Form.Select
                      placeholder="Location"
                      onChange={(e) => {
                        handelOnChange(e);
                        handleChange(e);
                      }}
                      name="payType"
                      size="sm"
                      isInvalid={!!errors.payType}
                    >
                      <option value="">-- Select Type --</option>
                      <option value="1">Salary</option>
                      <option value="2">Other</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.payType}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group as={Col}>
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                      type="date"
                      placeholder="amount"
                      onChange={(e) => {
                        handelOnChange(e);
                        handleChange(e);
                      }}
                      name="date"
                      size="sm"
                      isInvalid={!!errors.date}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.date}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Form.Label>Month</Form.Label>
                    <Form.Select
                      placeholder="Location"
                      onChange={(e) => {
                        handelOnChange(e);
                        handleChange(e);
                      }}
                      name="month"
                      size="sm"
                      isInvalid={!!errors.month}
                    >
                      <option value="">-- Select Type --</option>
                      <option value={1}>January</option>
                      <option value={2}>February</option>
                      <option value={3}>March</option>
                      <option value={4}>April</option>
                      <option value={5}>May</option>
                      <option value={6}>June</option>
                      <option value={7}>July</option>
                      <option value={8}>August</option>
                      <option value={9}>September</option>
                      <option value={10}>October</option>
                      <option value={11}>November</option>
                      <option value={12}>December</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.month}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Row>
                {addData.payType === "1" ? (
                  <Row>
                    <Button
                      variant="outlined"
                      onClick={handleSubmit}
                      className="col"
                    >
                      {!loader ? (
                        "Calculate Salary"
                      ) : (
                        <Spinner animation="border" size="sm" />
                      )}
                    </Button>
                    <div className="col"></div>
                  </Row>
                ) : (
                  <></>
                )}
              </>
            )}

            {/* salary */}

            {salaryData?.error ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  color: "red",
                  alignItems: "center",
                  marginTop: "100px"
                }}
              >
                <h3>
                  No salary details available! Please add salary details first!
                </h3>
              </div>
            ) : finishCalculation ? (
              <>
                <Row>
                  <h5 style={{ marginBottom: "20px" }}>Salary</h5>
                  <Col>
                    <Form.Group>
                      <Form.Label>Basic Salary</Form.Label>
                      <Form.Control
                        type="number"
                        onChange={handelOnChange}
                        name="basic"
                        value={addData?.basic}
                        disabled
                        size="sm"
                      />
                    </Form.Group>
                  </Col>
                  <Col
                    style={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "flex-end",
                      padding: "0 20px"
                    }}
                  ></Col>

                  <h5>Allawances</h5>
                  <Form.Group as={Col}>
                    <Form.Label>Transport</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="amount"
                      onChange={handelOnChange}
                      name="transportAllawance"
                      value={addData?.transportAllawance}
                      disabled
                      size="sm"
                    />
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Form.Label>Mobile</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="amount"
                      onChange={handelOnChange}
                      name="mobileAllawance"
                      value={addData?.mobileAllawance}
                      disabled
                      size="sm"
                    />
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Form.Label>Other</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="amount"
                      onChange={handelOnChange}
                      name="otherAllawance"
                      value={addData?.otherAllawance}
                      disabled
                      size="sm"
                    />
                  </Form.Group>
                </Row>
                {/* ot */}
                <Row>
                  <h5>Over Time (OT)</h5>
                  <Form.Group as={Col}>
                    <Form.Label>Allawance</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="amount"
                      onChange={handelOnChange}
                      name="OTAllawance"
                      value={salaryData?.OTAllawance}
                      disabled
                      size="sm"
                    />
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Form.Label>Time</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="amount"
                      onChange={handelOnChange}
                      name="otTime"
                      value={addData?.OTCount}
                      disabled
                      size="sm"
                    />
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Form.Label>Amount</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="amount"
                      onChange={handelOnChange}
                      name="otAmount"
                      value={addData?.otAmount}
                      disabled
                      size="sm"
                    />
                  </Form.Group>
                </Row>
                <Row>
                  <Col>
                    <Form.Group>
                      <Form.Label>Gross salary</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="amount"
                        onChange={handelOnChange}
                        name="gross"
                        value={addData?.gross}
                        disabled
                        size="sm"
                      />
                    </Form.Group>
                  </Col>
                  <Col></Col>
                </Row>
                {/* deductions */}
                <Row>
                  <h5>Deductions</h5>
                  <Form.Group as={Col}>
                    <Form.Label>EPF</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="amount"
                      onChange={handelOnChange}
                      name="EPFEmp"
                      value={addData?.EPFEmp}
                      disabled
                      size="sm"
                    />
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Form.Label>No pay</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="amount"
                      // onChange={handelOnChange}
                      name="nopay"
                      value={addData?.nopay}
                      disabled
                      size="sm"
                    />
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Form.Label>Tax</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="amount"
                      onChange={handelOnChange}
                      name="tax"
                      value={addData?.tax}
                      disabled
                      size="sm"
                    />
                  </Form.Group>
                </Row>
                {/* compay pays */}
                <Row>
                  <h5>Company pays</h5>
                  <Form.Group as={Col}>
                    <Form.Label>ETF</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="amount"
                      onChange={handelOnChange}
                      name="ETF"
                      value={addData?.ETF}
                      disabled
                      size="sm"
                    />
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Form.Label>EPF</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="amount"
                      onChange={handelOnChange}
                      name="EPFCompany"
                      value={addData?.EPFCompany}
                      disabled
                      size="sm"
                    />
                  </Form.Group>
                </Row>
                <Row>
                  <Form.Group as={Col}>
                    <Form.Label>Net Salary</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="amount"
                      onChange={handelOnChange}
                      name="amountToEmployee"
                      value={addData?.amountToEmployee}
                      disabled
                      size="sm"
                    />
                  </Form.Group>
                </Row>
                <Row>
                  <Form.Group as={Col}>
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={addData?.description}
                      onChange={handelOnChange}
                      size="sm"
                      disabled={paySaved}
                    />
                  </Form.Group>
                  <Col>
                    <Form.Group>
                      <Form.Label>Paid By</Form.Label>
                      <Form.Control
                        name="paidBy"
                        value={sessionUser?.displayName}
                        disabled
                        size="sm"
                      />
                    </Form.Group>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-start",
                        padding: "10px 0"
                      }}
                      className="pay-btn"
                    >
                      {paySaved ? (
                        <PDFDownloadLink
                          document={
                            <PaysheetPDF
                              data={addData}
                              fName={selectedEmployeeData.first_name}
                              lName={selectedEmployeeData.last_name}
                              EPF={selectedEmployeeData.epf_no}
                            />
                          }
                          fileName={`paysheet ${selectedEmployeeData.first_name} ${selectedEmployeeData.last_name}`}
                        >
                          {({ loading }) =>
                            loading ? (
                              <Button
                                variant="outlined"
                                disabled
                                className="w-100"
                              >
                                Prepairing Paysheet
                              </Button>
                            ) : (
                              <Button
                                variant="outlined"
                                // onClick={handelSubmit}
                                className="w-100"
                              >
                                Download Paysheet
                              </Button>
                            )
                          }
                        </PDFDownloadLink>
                      ) : (
                        <Button
                          variant="outlined"
                          onClick={handelSubmit}
                          className="w-100"
                        >
                          {loader ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            "Pay"
                          )}
                        </Button>
                      )}
                    </div>
                  </Col>
                </Row>
              </>
            ) : addData.payType === "2" ? (
              <>
                <Row>
                  <Form.Group as={Col}>
                    <Form.Label>Amount</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="amount"
                      onChange={handelOnChange}
                      name="amount"
                      value={addData?.amount}
                      // disabled
                      size="sm"
                    />
                  </Form.Group>
                </Row>
                <Row>
                  <Form.Group as={Col}>
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={addData?.description}
                      onChange={handelOnChange}
                      size="sm"
                    />
                  </Form.Group>
                  <Col>
                    <Form.Group>
                      <Form.Label>Paid By</Form.Label>
                      <Form.Control
                        name="paidBy"
                        value={sessionUser?.displayName}
                        disabled
                        size="sm"
                      />
                    </Form.Group>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-start",
                        padding: "10px 0"
                      }}
                    >
                      <Button
                        variant="outlined"
                        onClick={handelSubmit}
                        className="w-100"
                      >
                        {loader ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          "Pay"
                        )}
                      </Button>
                    </div>
                  </Col>
                </Row>
              </>
            ) : (
              <></>
            )}
          </Form>
        )}
      </Formik>
    </Card>
  );
};

export default AddPayrol;
