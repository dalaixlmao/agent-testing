import { useParams, useNavigate } from 'react-router-dom';
import TodoForm from '@/components/todos/TodoForm';
import { TodoFormData } from '@/types';
import { useTodo, useUpdateTodo } from '@/hooks/useTodos';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const EditTodoPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data, isLoading: isFetching } = useTodo(id!);
  const updateTodoMutation = useUpdateTodo(id!);

  const handleSubmit = (formData: TodoFormData) => {
    updateTodoMutation.mutate(formData, {
      onSuccess: () => {
        navigate(`/todos/${id}`);
      },
    });
  };

  if (isFetching) {
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
      </div>
    );
  }

  // Format date for form
  const formattedTodo = {
    ...data.todo,
    dueDate: data.todo.dueDate ? data.todo.dueDate.split('T')[0] : undefined,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Todo</h1>
        <p className="text-gray-600 mt-1">
          Update your todo item using the form below.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <TodoForm
          onSubmit={handleSubmit}
          isLoading={updateTodoMutation.isLoading}
          defaultValues={formattedTodo}
        />
      </div>
    </div>
  );
};

export default EditTodoPage;