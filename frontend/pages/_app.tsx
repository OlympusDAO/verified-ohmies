import type { AppProps } from "next/app";
import { useContext, useEffect } from "react";
import CustomThemeProvider, { CustomThemeContext } from "../hooks/CustomThemeProvider";
import '../style.scss'

function App({ Component, pageProps }: AppProps) {

  const ThemeContext = useContext(CustomThemeContext);

  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <CustomThemeProvider initialAppTheme={ThemeContext.appTheme}>
      <Component {...pageProps} />
    </CustomThemeProvider>
  );
}
export default App;
