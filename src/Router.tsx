import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./styles/App.scss";
import Challenge from "./routes/Challenge";
import Analysis from "./routes/Analysis";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Challenge />,
  },
  {
    path: "/history",
    element: <Analysis />,
  },
]);

function App() {
  return (
    <div className="app">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
