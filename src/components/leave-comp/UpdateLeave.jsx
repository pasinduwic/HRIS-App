import axios from "axios";
import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { Form, Modal, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { addUpdateData } from "../../redux/features/GlobalData";
import {
  addAlertDetails,
  addSessionUser,
  setRefresh,
  updateModalTogal
} from "../../redux/features/StatusVar";
import moment from "moment";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useLocation, useNavigate } from "react-router-dom";

const UpdateLeave = (data) => {
  const updateModal = useSelector((state) => state.statusVar.value.updateModal);
  const updateDataInitial = useSelector(
    (state) => state.globalData.value.updateData
  );

  const refreshData = useSelector((state) => state.statusVar.value.refreshData);
  const dispatch = useDispatch();
  const _id = updateDataInitial?._id;
  const [loader, setLoader] = useState(false);
  const [dateCount, setDateCount] = useState(0);
  const sessionUser = useSelector((state) => state.statusVar.value.sessionUser);
  const axiosPrivate = useAxiosPrivate();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      dispatch(updateModalTogal(false));
      // console.log(updateDataInitial);
    };
  }, []);
  // handel submit
  const handelSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);
    const passingData = updateDataInitial;
    // delete updateDataInitial._id;
    // delete updateDataInitial.__v;

    try {
      const responce = await axiosPrivate.put("/api/leave" + _id, passingData, {
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
          message: "Item updated successfully!"
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
      dispatch(updateModalTogal(false));
      setLoader(false);
    }
  };

  //handel change
  const handelOnChange = (e) => {
    const fieldName = e.target.getAttribute("name");
    const fieldValue = e.target.value;

    const newData = { ...updateDataInitial };
    newData[fieldName] = fieldValue;
    if (newData.startDate !== "" && newData.endDate !== "") {
      const countDays =
        moment(newData.endDate).diff(moment(newData.startDate), "days") + 1;

      // setDateCount(countDays);
      newData.numberofDays = countDays;
    }
    dispatch(addUpdateData(newData));
    console.log(newData);
  };

  const datForPicker = (date) => {
    return moment(date).format("YYYY-MM-DD");
  };

  useEffect(() => {
    setDateCount(0);
    const updatedLeaves = Object.assign({}, updateDataInitial);
    updatedLeaves.startDate = moment(updatedLeaves.startDate).format(
      "YYYY-MM-DD"
    );
    updatedLeaves.endDate = moment(updatedLeaves.endDate).format("YYYY-MM-DD");

    updatedLeaves.leaveType = JSON.stringify(updatedLeaves.leaveType);
    console.log(updatedLeaves);
    dispatch(addUpdateData(updatedLeaves));
  }, [updateModal]);

  return (
    <Modal
      show={updateModal}
      onHide={() => dispatch(updateModalTogal(false))}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Update Leave</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Employee Name</Form.Label>
            <Form.Select
              placeholder="Name"
              onChange={handelOnChange}
              name="employee"
              disabled
            >
              <option value={updateDataInitial?.employee?._id} selected>
                {updateDataInitial?.employee?.first_name}
              </option>
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label>Leave Type</Form.Label>
            <Form.Select
              placeholder="Name"
              onChange={handelOnChange}
              name="leaveType"
              disabled={updateDataInitial.status !== 0 ? true : false}
              // disabled
            >
              <option
                value="1"
                selected={updateDataInitial?.leaveType === 1 && true}
              >
                Anual
              </option>

              <option
                value="2"
                selected={updateDataInitial?.leaveType === 2 && true}
              >
                Casual
              </option>
              <option
                value="3"
                selected={updateDataInitial?.leaveType === 3 && true}
              >
                Medical
              </option>
              <option
                value="4"
                selected={updateDataInitial?.leaveType === 4 && true}
              >
                No pay
              </option>
              <option
                value="5"
                selected={updateDataInitial?.leaveType === 5 && true}
              >
                Carry Over
              </option>
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              placeholder="Location"
              onChange={handelOnChange}
              name="startDate"
              value={datForPicker(updateDataInitial?.startDate)}
              disabled={updateDataInitial?.status !== 0 ? true : false}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>End Date</Form.Label>
            <Form.Control
              type="date"
              placeholder="Location"
              onChange={handelOnChange}
              name="endDate"
              value={datForPicker(updateDataInitial?.endDate)}
              disabled={updateDataInitial?.status !== 0 ? true : false}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>No of Days</Form.Label>
            <Form.Control
              type="text"
              placeholder="No of Days"
              onChange={handelOnChange}
              name="numberofDays"
              value={updateDataInitial?.numberofDays}
              disabled
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Status</Form.Label>
            <Form.Select
              placeholder="Name"
              onChange={handelOnChange}
              name="status"
              // disabled
            >
              <option
                value="0"
                selected={updateDataInitial?.status === 0 && true}
              >
                Approval Pending
              </option>
              <option
                value="1"
                selected={updateDataInitial?.status === 1 && true}
              >
                Approved
              </option>
              <option
                value="2"
                selected={updateDataInitial?.status === 2 && true}
              >
                Rejected
              </option>
            </Form.Select>
          </Form.Group>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => dispatch(updateModalTogal(false))}
            >
              Close
            </Button>
            <Button variant="primary" type="submit" onClick={handelSubmit}>
              {loader ? <Spinner animation="border" size="sm" /> : "Update"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UpdateLeave;
