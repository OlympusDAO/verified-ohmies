import React from "react";
import { SvgIcon, Link } from "@material-ui/core";
import VerifiedOhmiesLogo from "../public/logos/verified-ohmies-logo.svg";

const _Logo = () => {
  return (
    <SvgIcon
      color="primary"
      component={VerifiedOhmiesLogo}
      viewBox="0 0 400 300"
      style={{ minWidth: "300px", minHeight: "200px", width: "300px" }}
    />
  )
}

const Logo = ({ currentPage, dispatch }) => {

  return (
    <>
    {/* If we're in info page, logo is clickable. Else it's not. */}
    { currentPage == "info" ?
      <Link onClick={() =>
        dispatch({ type: "SET_CURRENT_PAGE", currentPage: "auth" })}>
        <_Logo />
      </Link>
      :
      <_Logo />
    }
    </>
  );
};

export default Logo;