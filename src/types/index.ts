export type User = {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  is_premium?: boolean;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  assignees?: User[];
  last_updated_by?: string;
};

export type Presence = {
  id: string;
  user_id: string;
  last_seen_at: string;
  status: 'online' | 'offline' | 'away';
};