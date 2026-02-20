import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    console.log(email, password);
    if (email === "" || password === "") {
      alert("Please fill in all fields");
      return;
    }
    localStorage.setItem("user", JSON.stringify({ email, password }));
    localStorage.setItem("isLoggedIn", "true");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="h-screen w-full bg-slate-700 flex items-center justify-center">
      <div className="bg-white w-96 p-4 rounded-lg flex flex-col items-center justify-center">
        <h1>Login</h1>
        <form className="flex flex-col items-center justify-center w-full gap-4 mt-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 rounded-md border border-gray-300"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 rounded-md border border-gray-300"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="w-full p-2 rounded-md bg-slate-700 text-white cursor-pointer"
            onClick={() => {
              handleLogin();
            }}
          >
            Login
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-slate-700 cursor-pointer">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
