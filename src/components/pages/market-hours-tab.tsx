"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MARKET_SESSIONS } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';

type SessionStatus = 'closed' | 'open' | 'overlap';

type MarketSession = (typeof MARKET_SESSIONS)[number] & {
    status: SessionStatus;
    localOpen: string;
    localClose: string;
    progress: number;
};

const getSessionStatus = (open: number, close: number, currentHour: number, openSessions: string[]): SessionStatus => {
    let isOpen;
    if (open < close) { // Same day session (e.g., London)
        isOpen = currentHour >= open && currentHour < close;
    } else { // Overnight session (e.g., Sydney)
        isOpen = currentHour >= open || currentHour < close;
    }

    if (isOpen) {
        return openSessions.length > 1 ? 'overlap' : 'open';
    }
    return 'closed';
};

const getSessionProgress = (open: number, close: number, currentHour: number, currentMinute: number): number => {
    let duration;
    let elapsed;

    if (open < close) { // Same day session
        duration = close - open;
        elapsed = currentHour - open + (currentMinute / 60);
    } else { // Overnight session
        duration = (24 - open) + close;
        if (currentHour >= open) {
            elapsed = currentHour - open + (currentMinute / 60);
        } else {
            elapsed = (24 - open) + currentHour + (currentMinute / 60);
        }
    }
    
    return Math.min(100, (elapsed / duration) * 100);
};

export function MarketHoursTab() {
  const [sessions, setSessions] = useState<MarketSession[]>([]);
  const [currentTime, setCurrentTime] = useState<string>('');
  
  useEffect(() => {
    const updateSessions = () => {
      const now = new Date();
      const currentUTCHour = now.getUTCHours();
      const currentUTCMinute = now.getUTCMinutes();
      
      const openSessionNames = MARKET_SESSIONS
        .filter(s => {
          if (s.open < s.close) return currentUTCHour >= s.open && currentUTCHour < s.close;
          return currentUTCHour >= s.open || currentUTCHour < s.close;
        })
        .map(s => s.name);

      const updatedSessions = MARKET_SESSIONS.map(session => {
        const status = getSessionStatus(session.open, session.close, currentUTCHour, openSessionNames);
        const progress = status !== 'closed' ? getSessionProgress(session.open, session.close, currentUTCHour, currentUTCMinute) : 0;
        
        const openDate = new Date();
        openDate.setUTCHours(session.open, 0, 0, 0);
        
        const closeDate = new Date();
        closeDate.setUTCHours(session.close, 0, 0, 0);

        return {
          ...session,
          status,
          progress,
          localOpen: openDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          localClose: closeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      });

      setSessions(updatedSessions);
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    
    updateSessions();
    const interval = setInterval(updateSessions, 1000);
    return () => clearInterval(interval);
  }, []);

  if (sessions.length === 0) {
      return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Forex Market Hours</CardTitle>
                <CardDescription>Loading market session data...</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-5 w-32" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                    </div>
                ))}
            </CardContent>
        </Card>
      );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Forex Market Hours</CardTitle>
        <CardDescription>Track active trading sessions and identify high-volume overlaps. Your current time: <span className="font-mono font-semibold">{currentTime}</span></CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.map(session => (
          <div key={session.name}>
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-semibold text-lg font-headline">{session.name}</h3>
              <div className="text-right">
                <p className="text-sm font-medium">{session.localOpen} - {session.localClose}</p>
                <p className={`text-xs font-bold uppercase ${
                    session.status === 'open' ? 'text-primary' : 
                    session.status === 'overlap' ? 'text-accent' : 
                    'text-muted-foreground'}`
                }>
                  {session.status}
                </p>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
               <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    session.status === 'open' ? 'bg-primary' : 
                    session.status === 'overlap' ? 'bg-accent' : 
                    'bg-transparent'
                  }`}
                  style={{ width: `${session.progress}%` }}
                />
            </div>
          </div>
        ))}
        <div className="flex items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary" /> Open Session</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-accent" /> Overlap</div>
        </div>
      </CardContent>
    </Card>
  );
}
