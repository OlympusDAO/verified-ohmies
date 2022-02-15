import { PrimaryButton } from "@olympusdao/component-library";

const CTAButton = ({ text, onClick, disabled=false }) => {

  return (
    <PrimaryButton
      size="large"
      variant="contained"
      onClick={onClick}
      disabled={disabled}
    >
      <p id="CTAButtonText">{ text }</p>
    </PrimaryButton>
  );
};

export default CTAButton;