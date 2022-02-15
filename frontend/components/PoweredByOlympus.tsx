import React from "react";
import { SvgIcon, Link } from "@material-ui/core";
import PoweredBy from "../public/logos/powered-by-olympus.svg";

const PoweredByOlympus = () => {

  return (
    <Link href="https://olympusdao.finance" target="_blank">
      <SvgIcon
        color="primary"
        component={PoweredBy}
        viewBox="0 0 400 100"
        style={{ minWidth: "100px", minHeight: "100px", width: "100" }}
      />
    </Link>
  );
};

export default PoweredByOlympus;