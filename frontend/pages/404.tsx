import { Box, Grid, SvgIcon, Link, Typography, makeStyles } from "@material-ui/core";
import { Paper } from "@olympusdao/component-library";
import PoweredByOlympus from "@components/PoweredByOlympus";
import VerifiedOhmies from "../public/logos/verified-ohmies-logo-horizontal.svg";
import Icon404 from "../public/icons/404.svg";

const useStyles = makeStyles((theme) => ({
  content: {
    [theme.breakpoints.down("sm")]: {
      marginTop: "40px",
    },
  },
  image: {
    [theme.breakpoints.down("sm")]: {
      width: "70vw",
    },
    [theme.breakpoints.only("md")]: {
      width: "40vw",
    },
    [theme.breakpoints.up("md")]: {
      width: "25vw",
    },
  },
  paperBox: {
    [theme.breakpoints.down("md")]: {
      width: "70vw",
    },
    [theme.breakpoints.up("md")]: {
      width: "35vw",
    },
  },
}));

export default function Custom404() {
  const classes = useStyles();
  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100vh"
      justifyContent="space-between"
      margin={"auto"}
    >
      <Box
        display="flex"
        flexDirection="row"
        width="100vw"
        height="10vh"
      >
        <Link href="/">
          <SvgIcon
            color="primary"
            component={VerifiedOhmies}
            viewBox="0 0 400 56"
            style={
              { minWidth: "200px", minHeight: "56px", width: "200px", marginTop:"20px", marginLeft: "30px" }
            }
          />
        </Link>
      </Box>
      <Box
        flexDirection="column"
        justifyContent="space-between"
        alignItems="center"
        height={"85vh"}
        width={"75%"}
        margin={"auto"}
        className={classes.content}
      >
        <Grid
          container
          spacing={10}
          direction="column"
          alignItems="center"
          justifyContent="center"
        >
          <Link href="/">
            <SvgIcon
              color="primary"
              component={Icon404}
              viewBox="0 0 1434 436"
              style={{ minWidth: "120px", minHeight: "100px", width: "140px" }}
            />
          </Link>

          <Box alignContent="center" alignItems="center" className={classes.image}>
            <img width="100%" src="images/404/pepe-is-lost.png" />
          </Box>

          <Box className={classes.paperBox} mt={2}>
            <Paper>
              <Box 
                display="flex" 
                justifyContent="center" 
              >
                <Typography variant="body1" align="center">Are you lost, fren?</Typography>
              </Box>
            </Paper>
          </Box>
          <PoweredByOlympus />
        </Grid>
      </Box>
    </Box>
  )
}