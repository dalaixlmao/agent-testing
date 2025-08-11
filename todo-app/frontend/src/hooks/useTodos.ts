import { useQuery, useMutation, useQueryClient } from 'react-query';
import { todosAPI } from '@/services/api';
import { Todo, TodoFormData } from '@/types';
import { toast } from 'react-toastify';

export const useTodos = (filters?: Record<string, string>) => {
  return useQuery<{ todos: Todo[] }>(
    ['todos', filters], 
    () => todosAPI.getAllTodos(filters),
    {
      keepPreviousData: true,
    }
  );
};

export const useTodo = (id: string) => {
  return useQuery<{ todo: Todo }>(
    ['todo', id],
    () => todosAPI.getTodoById(id),
    {
      enabled: !!id, // Only run query if id exists
    }
  );
};

export const useCreateTodo = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (todoData: TodoFormData) => todosAPI.createTodo(todoData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('todos');
        toast.success('Todo created successfully!');
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || 'Failed to create todo'
        );
      },
    }
  );
};

export const useUpdateTodo = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (todoData: Partial<TodoFormData>) => todosAPI.updateTodo(id, todoData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['todos']);
        queryClient.invalidateQueries(['todo', id]);
        toast.success('Todo updated successfully!');
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || 'Failed to update todo'
        );
      },
    }
  );
};

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (id: string) => todosAPI.deleteTodo(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('todos');
        toast.success('Todo deleted successfully!');
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || 'Failed to delete todo'
        );
      },
    }
  );
};