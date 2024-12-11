import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Sidebar from "@/components/sidebar";
import withAuth from "../api/auth/withAuth";
import Cookies from "../../src/utils/cookies";

const Inicio = () => {
  return (
    <>
      <Cookies />
      <div style={{ display: "flex", flexDirection: "row" }}>
        <Sidebar />
      </div>
    </>
  );
};

export default withAuth(Inicio);
