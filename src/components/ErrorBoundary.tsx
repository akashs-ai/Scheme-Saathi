import React from 'react';
import { SchemeSaathiLogo } from './SchemeSaathiLogo';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'An unexpected rendering issue occurred.',
    };
  }

  handleReload = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#4a4d44] p-4 sm:p-6 flex items-center justify-center">
          <div className="max-w-md w-full glass-window rounded-[28px] p-8 text-center space-y-4 text-white">
            <div className="flex justify-center">
              <SchemeSaathiLogo size={48} variant="lime" />
            </div>
            <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
              Display Recovery
            </h1>
            <p className="text-xs text-[#A3A3A3] leading-relaxed">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="px-5 py-2.5 rounded-full bg-[#B6FF50] text-[#050505] text-xs font-semibold hover:bg-[#c8ff78] transition-colors"
            >
              Restore Workspace
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
