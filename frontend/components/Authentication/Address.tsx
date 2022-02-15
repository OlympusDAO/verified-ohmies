import { SecondaryButton } from "@olympusdao/component-library";

const Address = ({ address }) => {

  return (
    <SecondaryButton
      size="large"
      variant="contained"
      disabled={true}
    >
      {address}
    </SecondaryButton>
  );
};

export default Address;