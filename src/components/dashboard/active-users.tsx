'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { Presence } from '@/types';
import { getInitials } from '@/lib/utils';

export default function ActiveUsers() {
  const [activeUsers, setActiveUsers] = useState<Presence[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient();
  
  useEffect(() => {
    // Set up initial presence status for current user
    const setupPresence = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        // Update or insert presence data for current user
        await supabase
          .from('user_presence')
          .upsert({
            user_id: user.id,
            status: 'online',
            last_seen_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
          
        // Fetch all online users
        fetchActiveUsers();
        
        // Set up interval to update last_seen_at
        const interval = setInterval(async () => {
          await supabase
            .from('user_presence')
            .update({ last_seen_at: new Date().toISOString() })
            .eq('user_id', user.id);
        }, 30000); // Update every 30 seconds
        
        return () => clearInterval(interval);
      } catch (error) {
        console.error('Error setting up presence:', error);
      }
    };
    
    setupPresence();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('presence-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence',
        },
        () => {
          fetchActiveUsers();
        }
      )
      .subscribe();
      
    // Clean up on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const fetchActiveUsers = async () => {
    try {
      // Calculate threshold for "online" - 2 minutes ago
      const twoMinutesAgo = new Date();
      twoMinutesAgo.setMinutes(twoMinutesAgo.getMinutes() - 2);
      
      const { data: presenceData, error } = await supabase
        .from('user_presence')
        .select(`
          *,
          profiles:user_id (
            id,
            name,
            avatar_url
          )
        `)
        .gt('last_seen_at', twoMinutesAgo.toISOString())
        .order('last_seen_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to match our Presence type
      const formattedPresence = presenceData.map((p: any) => ({
        id: p.id,
        user_id: p.user_id,
        last_seen_at: p.last_seen_at,
        status: p.status,
        user: p.profiles,
      }));
      
      setActiveUsers(formattedPresence);
    } catch (error) {
      console.error('Error fetching active users:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex overflow-x-auto py-2 px-1 -mx-4 scrollbar-hide">
        <div className="flex space-x-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex overflow-x-auto py-2 px-1 -mx-4 scrollbar-hide">
      <div className="flex space-x-2">
        {activeUsers.map((presence) => (
          <div key={presence.id} className="relative group">
            <div className={`h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center ring-2 ring-white dark:ring-gray-800 presence-indicator ${presence.status}`}>
              {presence.user?.avatar_url ? (
                <img
                  src={presence.user.avatar_url}
                  alt={presence.user.name || 'User'}
                  className="h-full w-full object-cover rounded-full"
                />
              ) : (
                <span className="text-xs font-medium">
                  {getInitials(presence.user?.name || '')}
                </span>
              )}
            </div>
            
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded hidden group-hover:block whitespace-nowrap">
              {presence.user?.name || 'User'}
              <div className="absolute left-1/2 -translate-x-1/2 top-full -mt-px border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}