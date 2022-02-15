import { Toolbar } from "@material-ui/core"
import DisconnectButton from "./DisconnectButton";
import ThemeToggleButton from "./ThemeToggleButton";
import InfoButton from "./InfoButton";

const NavBar = ({ walletIsConnected, disconnect, currentPage, dispatch }) => {

  return (
    <Toolbar>
      {walletIsConnected &&
        <DisconnectButton onClick={disconnect}/>
      }
      { currentPage != "info" &&
        <InfoButton dispatch={dispatch}/>
      }
      <ThemeToggleButton/>
    </Toolbar>
  );
};

export default NavBar;