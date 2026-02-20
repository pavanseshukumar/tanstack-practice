import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const navigate = useNavigate();
  return (
    <div className="h-screen w-full  flex flex-col items-center justify-center">
      <h1>Hello World</h1>
      <button
        className="w-[120px] p-2 rounded-md bg-slate-700 text-white cursor-pointer"
        onClick={() => navigate({ to: "/login" })}
      >
        Logout
      </button>
    </div>
  );
}
