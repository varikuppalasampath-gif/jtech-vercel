import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Users, Eye, Calendar, Clock, RefreshCw, Database, AlertCircle } from 'lucide-react'

export default function VisitorDashboard({ isOpen, onClose, stats, loading, error, onRefresh }) {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setTimeout(() => setRefreshing(false), 400)
    }
  }

  if (!isOpen) return null

  const dailyList = Array.isArray(stats?.daily_stats) ? [...stats.daily_stats].reverse() : []
  const maxVisitorsInDay = dailyList.reduce((max, d) => Math.max(max, d.visitors || 0), 1)

  return (
    <AnimatePresence>
      <div className="vmodal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="vmodal-title">
        <motion.div
          className="vmodal-content"
          onClick={e => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="vmodal-header">
            <div>
              <div className="vmodal-badge">
                <Database size={13} />
                <span>Source: {stats?.source === 'database' ? 'Live MySQL Database' : 'Analytics Service'}</span>
              </div>
              <h3 id="vmodal-title">Visitor Analytics Dashboard</h3>
              <p className="vmodal-sub">Real-time visitor metrics from Jtech production database.</p>
            </div>
            <div className="vmodal-actions">
              <button
                type="button"
                className="vmodal-icon-btn"
                onClick={handleRefresh}
                disabled={loading || refreshing}
                title="Refresh statistics"
                aria-label="Refresh statistics"
              >
                <RefreshCw size={17} className={loading || refreshing ? 'spin' : ''} />
              </button>
              <button
                type="button"
                className="vmodal-icon-btn"
                onClick={onClose}
                title="Close dashboard"
                aria-label="Close dashboard"
              >
                <X size={19} />
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="vmodal-alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* 4 Primary Metrics */}
          <div className="vmodal-grid">
            <div className="vmodal-card">
              <div className="vmodal-card-top">
                <span className="vmodal-card-label">Total Unique Visitors</span>
                <span className="vmodal-card-ico ico-blue"><Users size={18} /></span>
              </div>
              <div className="vmodal-card-num">
                {loading && !stats ? '...' : (stats?.total_visitors ?? 0).toLocaleString()}
              </div>
              <div className="vmodal-card-desc">Lifetime unique visitors (deduplicated visitor IDs)</div>
            </div>

            <div className="vmodal-card">
              <div className="vmodal-card-top">
                <span className="vmodal-card-label">Total Visitor-Days</span>
                <span className="vmodal-card-ico ico-indigo"><Calendar size={18} /></span>
              </div>
              <div className="vmodal-card-num">
                {loading && !stats ? '...' : (stats?.total_visitor_days ?? stats?.total_visitors ?? 0).toLocaleString()}
              </div>
              <div className="vmodal-card-desc">Total daily unique visitor sessions recorded in database</div>
            </div>

            <div className="vmodal-card">
              <div className="vmodal-card-top">
                <span className="vmodal-card-label">Today's Unique Visitors</span>
                <span className="vmodal-card-ico ico-green"><Clock size={18} /></span>
              </div>
              <div className="vmodal-card-num">
                {loading && !stats ? '...' : (stats?.today_visitors ?? 0).toLocaleString()}
              </div>
              <div className="vmodal-card-desc">Active unique visitors today (CURDATE)</div>
            </div>

            <div className="vmodal-card">
              <div className="vmodal-card-top">
                <span className="vmodal-card-label">Total Page Views</span>
                <span className="vmodal-card-ico ico-amber"><Eye size={18} /></span>
              </div>
              <div className="vmodal-card-num">
                {loading && !stats ? '...' : ((stats?.total_page_views || stats?.total_views) ?? 0).toLocaleString()}
              </div>
              <div className="vmodal-card-desc">Total page view events logged across all visitors</div>
            </div>
          </div>

          {/* Daily Statistics Table */}
          <div className="vmodal-section">
            <div className="vmodal-section-title">
              <h4>Daily Visitor Breakdown</h4>
              <span className="vmodal-section-note">Showing recent daily activity</span>
            </div>

            {dailyList.length === 0 ? (
              <div className="vmodal-empty">
                {loading ? 'Loading statistics...' : 'No daily breakdown records available yet.'}
              </div>
            ) : (
              <div className="vmodal-table-wrap">
                <table className="vmodal-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Unique Visitors</th>
                      <th>Activity Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyList.map(item => {
                      const pct = Math.round(((item.visitors || 0) / maxVisitorsInDay) * 100)
                      return (
                        <tr key={item.visit_date}>
                          <td className="font-mono">{item.visit_date}</td>
                          <td><strong>{(item.visitors || 0).toLocaleString()}</strong></td>
                          <td>
                            <div className="vmodal-bar-bg">
                              <div className="vmodal-bar-fill" style={{ width: `${Math.max(8, pct)}%` }} />
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="vmodal-footer">
            <span>Definitions: <strong>Total Visitors</strong> = COUNT(DISTINCT visitor_id) · <strong>Visitor-Days</strong> = COUNT(*) in unique_visitors_daily · <strong>Page Views</strong> = COUNT(*) in visitor_events.</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
