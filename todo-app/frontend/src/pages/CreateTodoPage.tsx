import { useNavigate } from 'react-router-dom';
import TodoForm from '@/components/todos/TodoForm';
import { TodoFormData } from '@/types';
import { useCreateTodo } from '@/hooks/useTodos';

const CreateTodoPage = () => {
  const navigate = useNavigate();
  const createTodoMutation = useCreateTodo();

  const handleSubmit = (data: TodoFormData) => {
    createTodoMutation.mutate(data, {
      onSuccess: () => {
        navigate('/todos');
      },
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Todo</h1>
        <p className="text-gray-600 mt-1">
          Fill in the form below to create a new todo item.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <TodoForm
          onSubmit={handleSubmit}
          isLoading={createTodoMutation.isLoading}
        />
      </div>
    </div>
  );
};

export default CreateTodoPage;