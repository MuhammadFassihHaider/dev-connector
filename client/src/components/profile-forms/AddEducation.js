import React, { Fragment, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withRouter, Link } from "react-router-dom";
import { addEducation } from "../../actions/profile";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
const AddEducation = ({ addEducation, history }) => {
  const [formData, setFormData] = useState({
    school: "",
    degree: "",
    fieldofstudy: "",
    from: "",
    to: "",
    current: false,
    description: "",
  });

  const [toDateDisabled, toggleDisabled] = useState(false);

  const validationSchema = yup.object({
    school: yup.string().required("Required").trim().ensure(),
    degree: yup.string().required("Required").trim().ensure(),
    fieldofstudy: yup.string().trim().ensure(),
    from: yup.string().trim().ensure(),
    to: yup.string().trim().ensure(),
    description: yup.string().trim().ensure(),
  });

  const { school, degree, fieldofstudy, from, to, current, description } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Fragment>
      <h1 className="large text-primary">Add Education</h1>
      <p className="lead">
        <i className="fas fa-code-branch" /> Add any school or bootcamp that you attended
      </p>
      <small>* = required field</small>
      <Formik
        initialValues={formData}
        onSubmit={(values) => {
          console.log(values)
          addEducation(history, values);
        }}
        validationSchema={validationSchema}
      >
        <Form
          className="form"
        >
          <div className="form-group">
            <Field
              placeholder="* School or Bootcamp"
              name="school"
              className="formik__inputField"
              
            />
            <ErrorMessage name="school" />
          </div>
          <div className="form-group">
            <Field
              placeholder="* Degree or Certificate"
              name="degree"
              className="formik__inputField"
            />
            <ErrorMessage name="degree" />
          </div>
          <div className="form-group">
            <Field
              placeholder="Field of Study"
              name="fieldofstudy"
              className="formik__inputField"
            />
            <ErrorMessage name="fieldofstudy"/>
          </div>
          <div className="form-group">
            <h4>From Date</h4>
            <input type="date" name="from" value={from} onChange={onChange} />
          </div>
          <div className="form-group">
            <p>
              <input
                type="checkbox"
                name="current"
                checked={current}
                value={current}
                onChange={() => {
                  setFormData({ ...formData, current: !current });
                  toggleDisabled(!toDateDisabled);
                }}
              />{" "}
              Current Job
            </p>
          </div>
          <div className="form-group">
            <h4>To Date</h4>
            <input type="date" name="to" value={to} onChange={onChange} disabled={current} />
          </div>
          <div className="form-group">
            <Field
              as="textarea"
              name="description"
              cols="30"
              rows="5"
              placeholder="Program Description"
            />
            <ErrorMessage name="description" />
          </div>
          <input type="submit" className="btn btn-primary my-1" />
          <Link className="btn btn-light my-1" to="/dashboard">
            Go Back
          </Link>
        </Form>
      </Formik>
    </Fragment>
  );
};

AddEducation.propTypes = {
  addEducation: PropTypes.func.isRequired,
};

export default connect(null, { addEducation })(withRouter(AddEducation));
