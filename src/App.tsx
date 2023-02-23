import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./styles/App.scss";
import Challenge from "./routes/challenge";
import Vis from "./routes/vis";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Challenge />,
  },
  {
    path: "/vis",
    element: <Vis />,
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
