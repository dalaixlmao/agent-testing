import { Todo } from '@/types';
import TodoItem from './TodoItem';
import LoadingSpinner from '../ui/LoadingSpinner';

interface TodoListProps {
  todos: Todo[];
  isLoading: boolean;
  onDelete: (id: string) => void;
}

const TodoList: React.FC<TodoListProps> = ({ todos, isLoading, onDelete }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No todos found. Create a new todo to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {todos.map((todo) => (
        <TodoItem key={todo._id} todo={todo} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default TodoList;