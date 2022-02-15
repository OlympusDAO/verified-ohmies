import { SecondaryButton } from "@olympusdao/component-library";

const DisconnectButton = ({ onClick }) => {

  return (
    <SecondaryButton
      variant="contained"
      onClick={onClick}
    >
      Disconnect
    </SecondaryButton>
  );
};

export default DisconnectButton;