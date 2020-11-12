import React, { Fragment, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getUserProfile } from "../../actions/profile";
import Spinner from "../layout/Spinner";
import { Link } from "react-router-dom";
import  DashboardActions  from "./DashboardActions";

const Dashboard = ({
  profile: { profile, loading },
  auth: { user },
  getUserProfile,
}) => {
  useEffect(() => {
    const user = getUserProfile();
  }, []);
  return (
    <Fragment>
      {loading && profile === null ? (
        <Spinner />
      ) : (
        <h1>Welcome {user && user.name}!</h1>
      )}
      {profile !== null ? (
        <DashboardActions/>
      ) : (
        <Fragment>
           <p> You have not created a profile yet! </p>
          <Link
            to="/create-profile"
            className="btn btn-primary my-1">Create Profile</Link>
        </Fragment>
      )}
    </Fragment>
  );
};

Dashboard.propTypes = {
  profile: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  getUserProfile: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  profile: state.profile,
  auth: state.auth,
});

export default connect(mapStateToProps, { getUserProfile })(
  Dashboard
);
