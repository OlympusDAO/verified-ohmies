import React, { useContext } from "react";
import { CustomThemeContext } from "@hooks/CustomThemeProvider";
import { SecondaryButton } from "@olympusdao/component-library";

const ThemeToggleButton = () => {
  const { appTheme, setTheme } = useContext(CustomThemeContext);

  const handleThemeChange = (appTheme, setTheme) => {
    if (appTheme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  return (
    <>
      { appTheme === "light" ? (
        <SecondaryButton 
          onClick={() => handleThemeChange(appTheme, setTheme)}
          variant="contained"
          icon="sun" 
        />
      ) : (
        <SecondaryButton
          onClick={() => handleThemeChange(appTheme, setTheme)}
          variant="contained"
          icon="moon"
        />
      )}
    </>
  );
};

export default ThemeToggleButton;