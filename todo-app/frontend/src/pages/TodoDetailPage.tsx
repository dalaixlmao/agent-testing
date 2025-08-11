import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTodo, useDeleteTodo } from '@/hooks/useTodos';
import { formatDate } from '@/utils/formatDate';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { cn } from '@/utils/cn';

const TodoDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data, isLoading } = useTodo(id!);
  const deleteMutation = useDeleteTodo();

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      deleteMutation.mutate(id!, {
        onSuccess: () => {
          navigate('/todos');
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!data?.todo) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Todo not found</p>
        <Link to="/todos" className="btn btn-primary mt-4">
          Back to Todos
        </Link>
      </div>
    );
  }

  const { todo } = data;

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
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{todo.title}</h1>
          <div className="flex space-x-2 mt-2">
            <span
              className={cn(
                'inline-block px-2 py-1 text-xs font-semibold rounded-full',
                priorityColor
              )}
            >
              {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)} Priority
            </span>
            <span
              className={cn(
                'inline-block px-2 py-1 text-xs font-semibold rounded-full',
                statusColor
              )}
            >
              {statusDisplay}
            </span>
            {todo.category && (
              <span className="inline-block bg-gray-100 text-gray-800 px-2 py-1 text-xs font-medium rounded">
                {todo.category}
              </span>
            )}
          </div>
        </div>

        <div className="flex space-x-4">
          <Link to={`/todos/${todo._id}/edit`} className="btn btn-secondary">
            Edit
          </Link>
          <button 
            onClick={handleDelete} 
            className="btn btn-danger"
            disabled={deleteMutation.isLoading}
          >
            {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Description</h2>
          <p className="text-gray-700 whitespace-pre-line">
            {todo.description || 'No description provided'}
          </p>
        </div>

        <div className="border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {todo.dueDate && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
              <p className="mt-1">{formatDate(todo.dueDate)}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-500">Created</h3>
            <p className="mt-1">{formatDate(todo.createdAt)}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
            <p className="mt-1">{formatDate(todo.updatedAt)}</p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link to="/todos" className="text-primary-600 hover:text-primary-800">
          &larr; Back to all todos
        </Link>
      </div>
    </div>
  );
};

export default TodoDetailPage;