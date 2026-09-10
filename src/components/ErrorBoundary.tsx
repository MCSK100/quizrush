import { Component } from 'react';
import type { ReactNode } from 'react';

export default class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    console.error('[quizlly] page crash:', error);
  }
  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="font-display text-2xl text-ink">Something glitched.</p>
        <p className="mt-2 text-sm font-bold text-muted">The game hit an unexpected error. Your room is safe — rejoin it.</p>
        <p className="mx-auto mt-3 max-w-md truncate rounded-2xl bg-white px-4 py-2 font-num text-xs text-muted" style={{ border: '1px solid rgba(120,100,180,0.10)' }}>
          {String(error.message || error).slice(0, 160)}
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <button onClick={() => location.reload()} className="qr-btn-primary rounded-2xl px-6 py-3 font-display">RELOAD</button>
          <button onClick={() => { this.setState({ error: null }); location.hash = ''; location.pathname = '/'; }} className="rounded-2xl bg-white px-6 py-3 font-display shadow-sticker-sm" style={{ border: '1px solid rgba(120,100,180,0.10)' }}>HOME</button>
        </div>
      </div>
    );
  }
}
