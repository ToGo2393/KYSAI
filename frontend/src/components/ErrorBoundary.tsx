import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (
                <div className="p-8 bg-red-50 border border-red-200 rounded-lg max-w-2xl mx-auto mt-10">
                    <h2 className="text-xl font-bold text-red-800 mb-2">Something went wrong.</h2>
                    <p className="text-red-700 mb-4">Please try refreshing the page.</p>
                    <details className="whitespace-pre-wrap text-sm text-red-600 bg-red-100 p-4 rounded">
                        {this.state.error && this.state.error.toString()}
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
