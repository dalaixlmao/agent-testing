import { useForm } from 'react-hook-form';
import { TodoFormData, Todo } from '@/types';

interface TodoFormProps {
  onSubmit: (data: TodoFormData) => void;
  isLoading: boolean;
  defaultValues?: Partial<TodoFormData>;
}

const TodoForm: React.FC<TodoFormProps> = ({
  onSubmit,
  isLoading,
  defaultValues = {
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    category: '',
    dueDate: undefined,
  },
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TodoFormData>({
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="title" className="form-label">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          className="form-input"
          {...register('title', {
            required: 'Title is required',
            maxLength: {
              value: 100,
              message: 'Title cannot be more than 100 characters',
            },
          })}
        />
        {errors.title && (
          <p className="form-error">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="form-label">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          className="form-input"
          {...register('description', {
            maxLength: {
              value: 500,
              message: 'Description cannot be more than 500 characters',
            },
          })}
        />
        {errors.description && (
          <p className="form-error">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="form-label">
            Status
          </label>
          <select id="status" className="form-input" {...register('status')}>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="form-label">
            Priority
          </label>
          <select id="priority" className="form-input" {...register('priority')}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label htmlFor="category" className="form-label">
            Category
          </label>
          <input
            id="category"
            type="text"
            className="form-input"
            {...register('category', {
              maxLength: {
                value: 50,
                message: 'Category cannot be more than 50 characters',
              },
            })}
          />
          {errors.category && (
            <p className="form-error">{errors.category.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="dueDate" className="form-label">
            Due Date
          </label>
          <input
            id="dueDate"
            type="date"
            className="form-input"
            {...register('dueDate')}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Todo'}
        </button>
      </div>
    </form>
  );
};

export default TodoForm;