'use client';

import { useLocalStorage } from './useLocalStorage';
import { Session } from '@/types/session';

export function useSessionHistory() {
  const [sessions, setSessions] = useLocalStorage<Session[]>('sessions', []);

  const addSession = (session: Session) => {
    setSessions(prev => [session, ...prev]);
  };

  const getRecentSessions = (count: number = 10): Session[] => {
    return sessions.slice(0, count);
  };

  const getSessionsByType = (type: Session['type']): Session[] => {
    return sessions.filter(s => s.type === type);
  };

  const getTotalTime = (): number => {
    return sessions.reduce((acc, s) => acc + s.duration, 0);
  };

  return { sessions, addSession, getRecentSessions, getSessionsByType, getTotalTime };
}
