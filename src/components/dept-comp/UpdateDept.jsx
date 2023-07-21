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
import { Formik } from "formik";
import * as yup from "yup";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useLocation, useNavigate } from "react-router-dom";

const validationSchema = yup.object().shape({
  name: yup.string().required()
});

const UpdateDepartment = ({ officeList }) => {
  const updateModal = useSelector((state) => state.statusVar.value.updateModal);
  const refreshData = useSelector((state) => state.statusVar.value.refreshData);
  const updateDataInitial = useSelector(
    (state) => state.globalData.value.updateData
  );
  const dispatch = useDispatch();
  const _id = updateDataInitial._id;
  const [loader, setLoader] = useState(false);
  const sessionUser = useSelector((state) => state.statusVar.value.sessionUser);
  const axiosPrivate = useAxiosPrivate();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      dispatch(updateModalTogal(false));
      // console.log("hutta")
    };
  }, []);

  // handel submit
  const handleFormSubmit = async () => {
    // e.preventDefault();
    setLoader(true);
    const passingData = updateDataInitial;
    // delete updateDataInitial._id;
    // delete updateDataInitial.__v;

    try {
      const responce = await axiosPrivate.put(
        "/api/department" + _id,
        passingData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `token ${sessionUser.accessToken}`
          },
          withCredentials: true
          // signal: controller.signal
        }
      );
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
    dispatch(addUpdateData(newData));
  };
  return (
    <Modal
      show={updateModal}
      onHide={() => dispatch(updateModalTogal(false))}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Update Department</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Formik
          validationSchema={validationSchema}
          initialValues={{
            name: updateDataInitial.name,
            office: updateDataInitial.office
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
                <Form.Label>Departmet Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Name"
                  onChange={(e) => {
                    handleChange(e);
                    handelOnChange(e);
                  }}
                  name="name"
                  // value={updateDataInitial.name}
                  defaultValue={updateDataInitial.name}
                  isInvalid={!!errors.name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group>
                <Form.Label>Office</Form.Label>
                <Form.Select
                  placeholder="Location"
                  onChange={(e) => {
                    handleChange(e);
                    handelOnChange(e);
                  }}
                  name="office"
                  defaultValue={updateDataInitial.Office?._id}
                  // isInvalid={!!errors.office}
                >
                  {officeList.map((office) =>
                    updateDataInitial.office?._id === office?._id ? (
                      <option value={office._id} key={office._id} selected>
                        {office.name}
                      </option>
                    ) : (
                      <option value={office._id} key={office._id}>
                        {office.name}
                      </option>
                    )
                  )}
                </Form.Select>
                {/* <Form.Control.Feedback type="invalid">{errors.office}</Form.Control.Feedback> */}
              </Form.Group>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => dispatch(updateModalTogal(false))}
                >
                  Close
                </Button>
                <Button variant="primary" type="submit" onClick={handleSubmit}>
                  {loader ? <Spinner animation="border" size="sm" /> : "Update"}
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
};

export default UpdateDepartment;
