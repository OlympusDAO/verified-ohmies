import { useContext } from "react";
import { Typography, Grid, Box, makeStyles, SvgIcon } from "@material-ui/core";
import {
  Paper,
  ErrorNotification,
  InfoNotification,
} from "@olympusdao/component-library";
import BalancesBox from "./BalancesBox";
import Address from "@components/Authentication/Address";
import CTAButton from "@components/CTAButton";
import { CustomThemeContext } from "@hooks/CustomThemeProvider";
import VerifiedBadge from "../../public/icons/verified-badge.svg";
import FailedBadge from "../../public/icons/failed-badge.svg";
import { darkTheme } from "../../themes/dark";

const useStyles = makeStyles((theme) => ({
  paperBox: {
    [theme.breakpoints.down("md")]: {
      width: "70vw",
    },
    [theme.breakpoints.up("md")]: {
      width: "35vw",
    },
  },
}));

const Authentication = ({
  chainIsSupported,
  chainData,
  score,
  address,
  authenticate,
  authStatus,
}) => {
  const classes = useStyles();
  const { appTheme, setTheme } = useContext(CustomThemeContext);

  return (
    <>
      {chainIsSupported ? (
        <Grid
          container
          spacing={10}
          direction="column"
          alignItems="center"
          justifyContent="center"
        >
          {authStatus == "success" && (
            <InfoNotification style={{ background: "#2196f3" }} dismissible>
              Authentication successful!
            </InfoNotification>
          )}
          <Box mb={5}>
            <Typography variant="h3">{chainData.name}</Typography>
          </Box>
          {/* TODO: make this box vertically narrower */}
          <BalancesBox score={score} />
          <Grid
            container
            direction="row"
            alignItems="center"
            justifyContent="center"
          >
            <Box>
              <Address address={address} />
            </Box>
            {authStatus == "success" && (
              <Box marginLeft={1}>
                {/* Color setting here is hacky, but the badge colors deviate from the rest of the theme patterns for dark mode. */}
                <SvgIcon
                  htmlColor={appTheme == "light" ? "primary" : darkTheme.gold}
                  component={VerifiedBadge}
                  viewBox="0 0 100 100"
                  style={{ minWidth: "25px", minHeight: "25px", width: "25px" }}
                />
              </Box>
            )}
            {score == 0 && (
              <Box marginLeft={1}>
                {/* Color setting here is hacky, but the badge colors deviate from the rest of the theme patterns for dark mode. */}
                <SvgIcon
                  htmlColor={appTheme == "light" ? "primary" : darkTheme.gold}
                  component={FailedBadge}
                  viewBox="0 0 100 100"
                  style={{ minWidth: "25px", minHeight: "25px", width: "25px" }}
                />
              </Box>
            )}
          </Grid>
          {/* User doesn't own any tokens */}
          {score == 0 && (
            <Box className={classes.paperBox} mt={2}>
              <Paper>
                <Typography variant="body1" align="center">
                  Fren, you haven’t applied for your Olympus Citizenship.
                </Typography>
              </Paper>
            </Box>
          )}
          {/* User owns tokens but hasn't authenticated yet */}
          {score > 0 &&
            authStatus != "success" &&
            (authStatus == "waiting" ? (
              <CTAButton
                text="Authenticating..."
                onClick={null}
                disabled={true}
              />
            ) : (
              <CTAButton text="Authenticate" onClick={authenticate} />
            ))}
          {/* User has successfuly authenticated */}
          {authStatus == "success" && (
            <Box className={classes.paperBox} mt={2}>
              {/* TODO: word wrapping gets messed up on smaller screens */}
              <Paper>
                <Box display="flex" justifyContent="center" flexDirection="row">
                  <Typography variant="body1" align="center">
                    Verified Ohmie, your Olympus Citizenship has been approved.
                  </Typography>
                </Box>
              </Paper>
            </Box>
          )}
        </Grid>
      ) : (
        <Grid
          container
          spacing={10}
          direction="column"
          alignItems="center"
          justifyContent="center"
        >
          <ErrorNotification dismissible>
            Please switch to Ethereum Mainnet!
          </ErrorNotification>
          <Box mb={20}>
            <Typography variant="h3" align="center">
              Unsupported Network
            </Typography>
          </Box>
          <Grid
            container
            direction="row"
            alignItems="center"
            justifyContent="center"
          >
            <Box>
              <Address address={address} />
            </Box>
            <Box marginLeft={1}>
              {/* Color setting here is hacky, but the badge colors deviate from the rest of the theme patterns for dark mode. */}
              <SvgIcon
                htmlColor={appTheme == "light" ? "primary" : darkTheme.gold}
                component={FailedBadge}
                viewBox="0 0 100 100"
                style={{ minWidth: "25px", minHeight: "25px", width: "25px" }}
              />
            </Box>
          </Grid>
          <Box className={classes.paperBox} mt={2}>
            <Paper>
              <Box display="flex" justifyContent="center" flexDirection="row">
                <Typography variant="body1" align="center">
                  *sad Vitalik noises*
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Grid>
      )}
    </>
  );
};

export default Authentication;
