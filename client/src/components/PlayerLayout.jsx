import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";

export default function PlayerLayout() {
  return (
    <>
      <NavBar />
      <Outlet />
    </>
  );
}
