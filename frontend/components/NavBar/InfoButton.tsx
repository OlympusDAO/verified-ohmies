import { SecondaryButton } from "@olympusdao/component-library";

const InfoButton = ({ dispatch }) => {

  return (
    <SecondaryButton
      startIcon="info-fill"
      variant="contained"
      onClick={() => 
        dispatch({type: "SET_CURRENT_PAGE", currentPage: "info"})}
    >
      Info
    </SecondaryButton>
  );
};

export default InfoButton;