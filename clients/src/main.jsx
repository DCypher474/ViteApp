import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // Import BrowserRouter here
import App from './App'; // Your App component
import './index.css'; // Your global styles

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>  {/* Wrap your App component with BrowserRouter here */}
      <App />
    </BrowserRouter>
  </StrictMode>
);
