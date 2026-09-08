import { useEffect, useRef } from 'react';
import type { QuizConfig, Room } from '../types';

export function netWsUrl(): string | null {
  const base = ((import.meta as unknown as { env: Record<string, string | undefined> }).env.VITE_AI_ENDPOINT || '').trim().replace(/\/$/, '');
  if (!base) return null;
  return base.replace(/^http/, 'ws') + '/socket';
}

export function netEnabled(): boolean {
  return netWsUrl() !== null;
}

export interface NetSession {
  code: string;
  playerId: string;
  name: string;
}

const NET_KEY = 'qr-net';

export function loadNetSession(): NetSession | null {
  try {
    const s = JSON.parse(sessionStorage.getItem(NET_KEY) || 'null');
    if (s && typeof s.code === 'string' && typeof s.playerId === 'string') return s as NetSession;
    return null;
  } catch {
    return null;
  }
}

export function saveNetSession(s: NetSession) {
  try {
    sessionStorage.setItem(NET_KEY, JSON.stringify(s));
  } catch { /* ignore */ }
}

export function clearNetSession() {
  try {
    sessionStorage.removeItem(NET_KEY);
  } catch { /* ignore */ }
}

export type NetMsg = { t: string; [k: string]: unknown };

export function useNetSocket(code: string | undefined, onMsg: (m: NetMsg) => void, onStatus?: (s: 'open' | 'closed') => void) {
  const handler = useRef(onMsg);
  handler.current = onMsg;
  const statusRef = useRef(onStatus);
  statusRef.current = onStatus;
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const url = netWsUrl();
    if (!url || !code) return;
    const wsUrl: string = url;
    let dead = false;
    let tries = 0;
    let ws: WebSocket | null = null;
    let retry: ReturnType<typeof setTimeout> | undefined;
    function open() {
      if (dead) return;
      tries += 1;
      try {
        ws = new WebSocket(wsUrl);
      } catch {
        return;
      }
      wsRef.current = ws;
      ws.onopen = () => {
        if (dead) return;
        tries = 0;
        statusRef.current?.('open');
        const s = loadNetSession();
        if (s && s.code === code) ws?.send(JSON.stringify({ t: 'hello', code, playerId: s.playerId }));
      };
      ws.onmessage = (e) => {
        try {
          handler.current(JSON.parse(String(e.data)) as NetMsg);
        } catch { /* ignore */ }
      };
      const down = () => {
        statusRef.current?.('closed');
        if (!dead && tries < 4) retry = setTimeout(open, 1200 * tries);
      };
      ws.onclose = down;
      ws.onerror = () => { try { ws?.close(); } catch { /* ignore */ } };
    }
    open();
    return () => {
      dead = true;
      clearTimeout(retry);
      try { ws?.close(); } catch { /* ignore */ }
      if (wsRef.current === ws) wsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  function send(msg: object) {
    const ws = wsRef.current;
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify(msg));
      return true;
    }
    return false;
  }

  return { send };
}

export function joinNetRoom(code: string, name: string, avatar: string): Promise<{ room: Room; you: string }> {
  const url = netWsUrl();
  if (!url) return Promise.reject(new Error('no backend'));
  return new Promise((resolve, reject) => {
    let done = false;
    const ws = new WebSocket(url);
    const to = setTimeout(() => { if (!done) { done = true; try { ws.close(); } catch { /* ignore */ } reject(new Error('timeout')); } }, 12000);
    ws.onopen = () => ws.send(JSON.stringify({ t: 'join', code, name, avatar }));
    ws.onmessage = (e) => {
      try {
        const m = JSON.parse(String(e.data)) as NetMsg;
        if (m.t === 'room' && m.you) {
          done = true;
          clearTimeout(to);
          try { ws.close(); } catch { /* ignore */ }
          resolve({ room: m.room as Room, you: String(m.you) });
        } else if (m.t === 'error') {
          done = true;
          clearTimeout(to);
          try { ws.close(); } catch { /* ignore */ }
          reject(new Error(String(m.msg || 'failed')));
        }
      } catch { /* ignore */ }
    };
    ws.onerror = () => { if (!done) { done = true; clearTimeout(to); reject(new Error('connect failed')); } };
  });
}

export function createNetRoom(cfg: QuizConfig & { mode?: string; maxPlayers?: number }, name: string, avatar: string): Promise<{ room: Room; you: string }> {
  const url = netWsUrl();
  if (!url) return Promise.reject(new Error('no backend'));
  return new Promise((resolve, reject) => {
    let done = false;
    const ws = new WebSocket(url);
    const to = setTimeout(() => { if (!done) { done = true; try { ws.close(); } catch { /* ignore */ } reject(new Error('timeout')); } }, 12000);
    ws.onopen = () => ws.send(JSON.stringify({ t: 'create', name, avatar, config: cfg }));
    ws.onmessage = (e) => {
      try {
        const m = JSON.parse(String(e.data)) as NetMsg;
        if (m.t === 'room' && m.you) {
          done = true;
          clearTimeout(to);
          try { ws.close(); } catch { /* ignore */ }
          resolve({ room: m.room as Room, you: String(m.you) });
        } else if (m.t === 'error') {
          done = true;
          clearTimeout(to);
          try { ws.close(); } catch { /* ignore */ }
          reject(new Error(String(m.msg || 'failed')));
        }
      } catch { /* ignore */ }
    };
    ws.onerror = () => { if (!done) { done = true; clearTimeout(to); reject(new Error('connect failed')); } };
  });
}
