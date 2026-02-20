import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const tasks = [
    {
      id: 1,
      title: "Task 1",
      description: "Description 1",
      status: "todo",
    },
    {
      id: 2,
      title: "Task 2",
      description: "Description 2",
      status: "todo",
    },
    {
      id: 3,
      title: "Task 3",
      description: "Description 3",
      status: "in progress",
    },
    {
      id: 4,
      title: "Task 4",
      description: "Description 4",
      status: "review",
    },
    {
      id: 5,
      title: "Task 5",
      description: "Description 5",
      status: "completed",
    },
    {
      id: 6,
      title: "Task 6",
      description: "Description 6",
      status: "todo",
    },
    {
      id: 7,
      title: "Task 7",
      description: "Description 7",
      status: "in progress",
    },
    {
      id: 8,
      title: "Task 8",
      description: "Description 8",
      status: "review",
    },
    {
      id: 9,
      title: "Task 9",
      description: "Description 9",
      status: "completed",
    },
    {
      id: 10,
      title: "Task 10",
      description: "Description 10",
      status: "todo",
    },
    {
      id: 11,
      title: "Task 11",
      description: "Description 11",
      status: "in progress",
    },
    {
      id: 12,
      title: "Task 12",
      description: "Description 12",
      status: "review",
    },
    {
      id: 13,
      title: "Task 13",
      description: "Description 13",
      status: "completed",
    },
    {
      id: 14,
      title: "Task 14",
      description: "Description 14",
      status: "todo",
    },
    {
      id: 15,
      title: "Task 15",
      description: "Description 15",
      status: "in progress",
    },
    {
      id: 16,
      title: "Task 16",
      description: "Description 16",
      status: "review",
    },
    {
      id: 17,
      title: "Task 17",
      description: "Description 17",
      status: "completed",
    },
    {
      id: 18,
      title: "Task 18",
      description: "Description 18",
      status: "todo",
    },
    {
      id: 19,
      title: "Task 19",
      description: "Description 19",
      status: "in progress",
    },
    {
      id: 20,
      title: "Task 20",
      description: "Description 20",
      status: "review",
    },
    {
      id: 21,
      title: "Task 21",
      description: "Description 21",
      status: "completed",
    },
  ];

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (!isLoggedIn) {
      navigate({ to: "/login" });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    navigate({ to: "/login" });
  };

  return (
    <div className="h-screen w-full bg-slate-700">
      <div className="w-4xl m-auto">
        <div className="w-full flex justify-between items-center border-b border-white py-4">
          <h1 className="text-2xl font-bold text-white">Tasks</h1>
          <div>
            <button className="w-[120px] p-2 rounded-md bg-slate-700 text-white cursor-pointer">
              Add Task
            </button>
            <button
              className="w-[120px] p-2 rounded-md  border border-white text-white cursor-pointer"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>

        <div className="w-full h-[calc(100vh-100px)] overflow-y-auto grid grid-cols-3 gap-4 py-4">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white p-4 rounded-md">
              <h2 className="text-lg font-bold text-slate-700">{task.title}</h2>
              <p className="text-sm text-slate-500">{task.description}</p>
              <p className="text-sm text-slate-500">{task.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
