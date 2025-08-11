import { Link } from 'react-router-dom';
import { Todo } from '@/types';
import { formatDate } from '@/utils/formatDate';
import { cn } from '@/utils/cn';

interface TodoItemProps {
  todo: Todo;
  onDelete: (id: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onDelete }) => {
  // Priority badge color
  const priorityColor = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  }[todo.priority];

  // Status badge color
  const statusColor = {
    pending: 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
  }[todo.status];

  // Format status for display
  const statusDisplay = {
    pending: 'Pending',
    'in-progress': 'In Progress',
    completed: 'Completed',
  }[todo.status];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          <Link to={`/todos/${todo._id}`} className="hover:underline">
            {todo.title}
          </Link>
        </h3>
        <div className="flex space-x-2">
          <span
            className={cn(
              'inline-block px-2 py-1 text-xs font-semibold rounded-full',
              priorityColor
            )}
          >
            {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
          </span>
          <span
            className={cn(
              'inline-block px-2 py-1 text-xs font-semibold rounded-full',
              statusColor
            )}
          >
            {statusDisplay}
          </span>
        </div>
      </div>

      {todo.description && (
        <p className="text-gray-600 mt-2 text-sm line-clamp-2">
          {todo.description}
        </p>
      )}

      <div className="mt-4 flex justify-between items-center">
        <div>
          {todo.category && (
            <span className="inline-block bg-gray-100 text-gray-800 px-2 py-1 text-xs font-medium rounded">
              {todo.category}
            </span>
          )}
          {todo.dueDate && (
            <span className="text-xs text-gray-500 ml-2">
              Due: {formatDate(todo.dueDate, 'PP')}
            </span>
          )}
        </div>

        <div className="flex space-x-2">
          <Link
            to={`/todos/${todo._id}/edit`}
            className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 py-1 px-2 rounded"
          >
            Edit
          </Link>
          <button
            onClick={() => onDelete(todo._id)}
            className="text-xs bg-red-50 hover:bg-red-100 text-red-700 py-1 px-2 rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TodoItem;