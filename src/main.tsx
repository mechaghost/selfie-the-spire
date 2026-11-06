import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
const Root = import.meta.env.DEV && new URLSearchParams(location.search).has('arena-benchmark')
    ? React.lazy(() => import('./dev/ArenaPerformanceReview'))
    : import.meta.env.DEV && new URLSearchParams(location.search).has('arena-study')
    ? React.lazy(() => import('./dev/ArenaLayoutStudy'))
    : import.meta.env.DEV && new URLSearchParams(location.search).has('review')
    ? React.lazy(() => import('./dev/ReviewHarness')) : App
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <React.Suspense fallback={<p>Opening review…</p>}><Root /></React.Suspense>
    </React.StrictMode>,
)
