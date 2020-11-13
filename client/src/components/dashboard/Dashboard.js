import React, { Fragment, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Spinner from "../layout/Spinner";
import { Link } from "react-router-dom";
import DashboardActions from "./DashboardActions";
import Experience from "./Experience";
import Education from "./Education";
import { getUserProfile, deleteAccount } from "../../actions/profile";

const Dashboard = ({
  profile: { profile, loading },
  auth: { user },
  getUserProfile,
  deleteAccount,
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
        <Fragment>
          <DashboardActions />
          <Experience experience={profile.experience} />
          <Education education={profile.education} />

          <div className="my-2">
            <button className="btn btn-danger" onClick={() => deleteAccount()}>
              Delete My Account
            </button>
          </div>
        </Fragment>
      ) : (
        <Fragment>
          <p> You have not created a profile yet! </p>
          <Link to="/create-profile" className="btn btn-primary my-1">
            Create Profile
          </Link>

          <div className="my-2">
            <button className="btn btn-danger" onClick={() => deleteAccount()}>
              Delete My Account
            </button>
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

Dashboard.propTypes = {
  profile: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  getUserProfile: PropTypes.func.isRequired,
  deleteAccount: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  profile: state.profile,
  auth: state.auth,
});

export default connect(mapStateToProps, { getUserProfile, deleteAccount })(
  Dashboard
);
