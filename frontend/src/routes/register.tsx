import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/register")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="h-screen w-full bg-slate-700 flex items-center justify-center">
      <div className="bg-white w-96 p-4 rounded-lg flex flex-col items-center justify-center">
        <h1>Let's create an account</h1>
        <form className="flex flex-col items-center justify-center w-full gap-4 mt-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 rounded-md border border-gray-300"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 rounded-md border border-gray-300"
          />
          <button
            type="submit"
            className="w-full p-2 rounded-md bg-slate-700 text-white cursor-pointer"
          >
            Register
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-4">
          Already have an account?
          <Link to="/login" className="text-slate-700 cursor-pointer">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
