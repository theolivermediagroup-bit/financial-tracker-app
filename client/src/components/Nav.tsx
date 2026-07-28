import { NavLink } from "react-router-dom";

export function Nav() {
  return (
    <nav className="nav">
      <span className="nav-brand">Budget Tracker</span>
      <div className="nav-links">
        <NavLink to="/" end className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
          Dashboard
        </NavLink>
        <NavLink
          to="/categories"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
        >
          Categories
        </NavLink>
      </div>
    </nav>
  );
}
