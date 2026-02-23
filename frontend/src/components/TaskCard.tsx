import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "@tanstack/react-router";

type Task = {
  id: number;
  title: string;
  description: string;
  status: string;
};

type TaskCardProps = {
  task: Task;
  statusOptions: readonly string[];
  onStatusChange: (taskId: number, newStatus: string) => void;
};

const statusColors: Record<string, string> = {
  todo: "bg-zinc-100 text-zinc-700 border-zinc-200",
  "in progress": "bg-blue-50 text-blue-700 border-blue-200",
  review: "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const TaskCard = ({ task, statusOptions, onStatusChange }: TaskCardProps) => {
  return (
    <Link
      to="/dashboard/task/$taskId"
      params={{ taskId: String(task.id) }}
      className="bg-white rounded-lg border border-zinc-200 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3 group block"
    >
      <h3 className="font-medium text-zinc-900 text-[15px] leading-snug">
        {task.title}
      </h3>
      {task.description && (
        <p className="text-sm text-zinc-500 line-clamp-2">{task.description}</p>
      )}
      <div
        className="mt-auto pt-1"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Select
          value={task.status}
          onValueChange={(value) => onStatusChange(task.id, value)}
        >
          <SelectTrigger
            className={`h-8 w-full text-xs font-medium border rounded-md cursor-pointer ${
              statusColors[task.status] ?? "bg-zinc-100 text-zinc-700 border-zinc-200"
            } hover:opacity-90`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border-zinc-200">
            {statusOptions.map((status) => (
              <SelectItem
                key={status}
                value={status}
                className="text-sm cursor-pointer"
              >
                <span className="capitalize">{status}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Link>
  );
};

export default TaskCard;
