import React, { createContext, useState } from "react";
import { ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import getTheme from "../themes";
import Cookie from "js-cookie";

interface CustomThemeContextInterface {
  appTheme: string;
  setTheme: any;
}

export const CustomThemeContext = createContext<CustomThemeContextInterface>({
  // Set the default theme and setter.
  appTheme: "dark",
  setTheme: null,
});

const CustomThemeProvider = ({ children, initialAppTheme }) => {
  // State to hold selected theme
  const [themeName, _setThemeName] = useState(initialAppTheme);

  // Retrieve theme object by theme name
  const theme = getTheme(themeName);

  // Wrap setThemeName to store new theme names as cookie.
  const setThemeName = (name) => {
    Cookie.set("appTheme", name);
    _setThemeName(name);
  };

  const contextValue = {
    appTheme: themeName,
    setTheme: setThemeName,
  };

  return (
    <CustomThemeContext.Provider value= { contextValue }>
      <ThemeProvider theme={theme}>         
        <CssBaseline />
        { children } 
      </ThemeProvider>
    </CustomThemeContext.Provider>
  );
};

export default CustomThemeProvider;