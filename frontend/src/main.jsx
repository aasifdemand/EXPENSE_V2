import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store.jsx";
import { Toaster } from "react-hot-toast";
import { LocationProvider } from "./contexts/LocationContext.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import "@fontsource/poppins/300.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <BrowserRouter>
      <LocationProvider>
        <App />
        <Toaster />
      </LocationProvider>
    </BrowserRouter>
  </Provider>
);
