"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <motion.div
          className="min-h-[400px] flex items-center justify-center p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 max-w-md w-full text-center">
            <div className="bg-red-500/10 p-4 rounded-xl w-fit mx-auto mb-4">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />
            </div>
            
            <h2 className="text-xl font-semibold text-white mb-2">
              Something went wrong
            </h2>
            
            <p className="text-neutral-400 mb-6">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
            >
              <ArrowPathIcon className="h-5 w-5" />
              <span>Refresh Page</span>
            </button>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="text-neutral-400 text-sm cursor-pointer">
                  Error Details (Development)
                </summary>
                <pre className="text-xs text-neutral-500 mt-2 p-3 bg-neutral-800 rounded-lg overflow-auto">
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
          </div>
        </motion.div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary 