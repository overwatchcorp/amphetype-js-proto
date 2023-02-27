import { NavLink } from "react-router-dom";
import "../styles/App.scss";

const Header = () => (
  <div className="header">
    <NavLink
      className={({ isActive }) =>
        `header-link ${isActive ? "header-link-active" : ""}`
      }
      to="/"
    >
      challenge
    </NavLink>
    <NavLink
      className={({ isActive }) =>
        `header-link ${isActive ? "header-link-active" : ""}`
      }
      to="/history"
    >
      history
    </NavLink>
  </div>
);

export default Header;
