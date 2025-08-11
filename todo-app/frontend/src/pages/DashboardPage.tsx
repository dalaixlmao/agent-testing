import { useState } from 'react';
import { Link } from 'react-router-dom';
import TodoList from '@/components/todos/TodoList';
import TodoFilters from '@/components/todos/TodoFilters';
import { useTodos, useDeleteTodo } from '@/hooks/useTodos';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const DashboardPage = () => {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const { data, isLoading } = useTodos(filters);
  const deleteMutation = useDeleteTodo();

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Todos</h1>
        <Link to="/todos/new" className="btn btn-primary">
          Add New Todo
        </Link>
      </div>

      <TodoFilters onFilterChange={handleFilterChange} />

      {isLoading || deleteMutation.isLoading ? (
        <div className="flex justify-center items-center py-16">
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <TodoList
          todos={data?.todos || []}
          isLoading={isLoading}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default DashboardPage;