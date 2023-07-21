import axios from "axios";
import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { Form, Modal, Row, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  addAlertDetails,
  addModalTogal,
  addSessionUser,
  setRefresh
} from "../../redux/features/StatusVar";
import moment from "moment";
import { Formik } from "formik";
import * as yup from "yup";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useLocation, useNavigate } from "react-router-dom";

const validationSchema = yup.object().shape({
  // employee: yup.string().required(),
  leaveType: yup.string().required("Leave type is required!"),
  startDate: yup.string().required("Start data is required!"),
  endDate: yup.string().required("End date is required!")
  // numberofDays: yup.number().required().positive().integer(),
});

const AddLeave = ({ employeeList }) => {
  const addModal = useSelector((state) => state.statusVar.value.addModal);
  const refreshData = useSelector((state) => state.statusVar.value.refreshData);
  const [addData, setAddData] = useState([]);
  const dispatch = useDispatch();
  const [loader, setLoader] = useState(false);
  const [dateCount, setDateCount] = useState(0);
  const sessionUser = useSelector((state) => state.statusVar.value.sessionUser);
  const axiosPrivate = useAxiosPrivate();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setDateCount(0);
    return () => {
      dispatch(addModalTogal(false));
      // console.log("hutta")
    };
  }, []);
  //handel submit
  const handleFormSubmit = async () => {
    // e.preventDefault();
    // console.log(addData)
    setLoader(true);
    if (addData?.numberofDays < 0) {
      return dispatch(
        addAlertDetails({
          status: true,
          type: "error",
          message: "Selected end date is invalid!"
        })
      );
    }
    try {
      const responce = await axiosPrivate.post("/api/leave", addData, {
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
      dispatch(setRefresh(!refreshData));
    } catch (e) {
      dispatch(
        addAlertDetails({
          status: true,
          type: "error",
          message: "Something went wrong!"
        })
      );
    } finally {
      dispatch(addModalTogal(false));
      setLoader(false);
    }
  };

  //handel change
  const handelOnChange = (e) => {
    const fieldName = e.target.getAttribute("name");
    const fieldValue = e.target.value;

    const newData = { ...addData };
    newData[fieldName] = fieldValue;

    if (newData.oneDay) {
      newData.endDate = newData.startDate;
      newData.numberofDays = 1;
    }

    if (newData.startDate !== "" && newData.endDate !== "") {
      const countDays =
        moment(newData.endDate).diff(moment(newData.startDate), "days") + 1;

      // setDateCount(countDays);
      newData.numberofDays = countDays;
    }

    setAddData(newData);
    console.log(newData);
  };
  const handelCheckOnChange = (e) => {
    const fieldName = e.target.getAttribute("name");
    const fieldValue = e.target.checked;

    const newData = { ...addData };
    newData[fieldName] = fieldValue;

    if (newData.oneDay) {
      newData.endDate = newData.startDate;
      newData.numberofDays = 1;
    }

    setAddData(newData);
    // console.log(newData);
  };

  const datForPicker = (date) => {
    return moment(date).format("YYYY-MM-DD");
  };

  return (
    <Modal
      show={addModal}
      onHide={() => dispatch(addModalTogal(false))}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Add Leave</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Formik
          validationSchema={validationSchema}
          initialValues={{
            employee: "",
            leaveType: "",
            startDate: "",
            endDate: moment(new Date()).format("YYYY-MM-DD"),
            numberofDays: ""
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
            <Form>
              <Form.Group>
                <Form.Label>Employee Name</Form.Label>
                <Form.Select
                  placeholder="Name"
                  onChange={(e) => {
                    handelOnChange(e);
                    handleChange(e);
                  }}
                  name="employee"
                  isInvalid={!!errors.employee}
                  // disabled
                >
                  <option>-- Select item --</option>
                  {employeeList.map((emp) => (
                    <option value={emp._id}>{emp.first_name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group>
                <Form.Label>Leave Type</Form.Label>
                <Form.Select
                  placeholder="Name"
                  onChange={(e) => {
                    handelOnChange(e);
                    handleChange(e);
                  }}
                  name="leaveType"
                  isInvalid={!!errors.leaveType}
                >
                  <option value="">- Select Leave Type -</option>
                  <option value="1">Anual</option>
                  <option value="2">Casual</option>
                  <option value="3">Medical</option>
                  <option value="4">No pay</option>
                  <option value="5">Carry Over</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.leaveType}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  placeholder="Location"
                  onChange={(e) => {
                    handelOnChange(e);
                    handleChange(e);
                  }}
                  name="startDate"
                  isInvalid={!!errors.startDate}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.startDate}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="modal-row">
                <Form.Check
                  type="checkbox"
                  label="One day leave"
                  name="oneDay"
                  onChange={handelCheckOnChange}
                />
              </Form.Group>

              {!addData.oneDay && (
                <Form.Group>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    placeholder="Location"
                    onChange={(e) => {
                      handelOnChange(e);
                      handleChange(e);
                    }}
                    name="endDate"
                    isInvalid={!!errors.endDate}
                    value={datForPicker(addData.endDate)}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.endDate}
                  </Form.Control.Feedback>
                </Form.Group>
              )}
              <Form.Group>
                <Form.Label>No of Days</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="No of Days"
                  onChange={(e) => {
                    handelOnChange(e);
                    handleChange(e);
                  }}
                  name="numberofDays"
                  value={addData?.numberofDays}
                  isInvalid={!!errors.numberofDays}
                  disabled
                />
                <Form.Control.Feedback type="invalid">
                  {errors.numberofDays}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  placeholder="Name"
                  onChange={handelOnChange}
                  name="status"
                  disabled
                >
                  <option>Approval Pending</option>
                </Form.Select>
              </Form.Group>

              <Modal.Footer>
                <Button
                  variant="text"
                  onClick={() => dispatch(addModalTogal(false))}
                >
                  Close
                </Button>
                <Button variant="text" type="submit" onClick={handleSubmit}>
                  {loader ? <Spinner animation="border" size="sm" /> : "Add"}
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
};

export default AddLeave;
