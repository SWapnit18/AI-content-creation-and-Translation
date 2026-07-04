import React, { useState, useEffect } from 'react';
import {
  History, Sparkles, Clock, Coins, FileText, Trash2, Edit3, Search,
  Download, Check, X, ChevronDown, ChevronUp, TrendingUp, BarChart3, RefreshCw
} from 'lucide-react';
import { getHistory, deleteHistory, updateHistory, getAnalytics } from '../services/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [history, setHistory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Query state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Expanded item state
  const [expandedId, setExpandedId] = useState(null);

  // Inline edit state
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editInput, setEditInput] = useState('');
  const [editOutput, setEditOutput] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset page on new search
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  // Fetch History and Analytics
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const historyData = await getHistory({
        type: typeFilter,
        page: currentPage,
        limit: 5,
        search: debouncedSearch
      });

      if (historyData.success) {
        setHistory(historyData.records || []);
        setTotalRecords(historyData.pagination?.total || 0);
        setTotalPages(historyData.pagination?.pages || 1);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
      toast.error('Failed to load history logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalyticsData = async () => {
    setLoadingAnalytics(true);
    try {
      const analyticsData = await getAnalytics();
      if (analyticsData.success) {
        setAnalytics(analyticsData.analytics);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [typeFilter, currentPage, debouncedSearch]);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
    fetchAnalyticsData();
    toast.success('Dashboard data refreshed');
  };

  // Delete log item
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this generation history? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await deleteHistory(id);
      if (res.success) {
        toast.success('Log record deleted');
        setHistory(history.filter(item => item._id !== id));
        fetchAnalyticsData(); // Update stats
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete record');
    }
  };

  // Start inline edit
  const startEdit = (item, e) => {
    e.stopPropagation();
    setEditingId(item._id);
    setEditTitle(item.title || '');
    setEditInput(item.inputText || '');
    setEditOutput(item.outputText || '');
  };

  // Save inline edit
  const saveEdit = async (id, e) => {
    e.preventDefault();
    if (!editTitle.trim() || !editOutput.trim()) {
      toast.error('Title and output content cannot be empty');
      return;
    }

    setSavingEdit(true);
    try {
      const res = await updateHistory(id, {
        title: editTitle,
        inputText: editInput,
        outputText: editOutput
      });

      if (res.success) {
        toast.success('Generation updated successfully');
        setHistory(history.map(item => item._id === id ? res.record : item));
        setEditingId(null);
        fetchAnalyticsData(); // Recalculate metrics (e.g. word count)
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update record');
    } finally {
      setSavingEdit(false);
    }
  };

  // Cancel inline edit
  const cancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  // Toggle item accordion expansion
  const toggleExpand = (id) => {
    if (editingId) return; // Don't collapse while editing
    setExpandedId(expandedId === id ? null : id);
  };

  // Export content to Txt
  const exportAsTxt = (item, e) => {
    e.stopPropagation();
    const content = `Title: ${item.title || 'AI Generation'}\n` +
      `Type: ${item.type.toUpperCase()}\n` +
      `Date: ${new Date(item.createdAt).toLocaleString()}\n` +
      `Estimated Cost: $${item.metadata?.estimatedCost || 0}\n` +
      `Processing Time: ${item.processingTimeMs || 0}ms\n\n` +
      `─── Prompt/Input ───\n${item.inputText}\n\n` +
      `─── Result/Output ───\n${item.outputText}\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${(item.title || 'generation').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exported as TXT file');
  };

  // Export content to CSV
  const exportAsCsv = (item, e) => {
    e.stopPropagation();
    const headers = ['Title', 'Type', 'Date', 'WordCount', 'ProcessingTimeMs', 'InputText', 'OutputText'];
    
    // Simple word count helper
    const wordCount = item.type === 'quote' ? item.metadata?.wordCount || 0 : item.outputText.split(/\s+/).filter(Boolean).length;
    const dateStr = new Date(item.createdAt).toLocaleString();
    
    const fields = [
      item.title || 'AI Generation',
      item.type,
      dateStr,
      wordCount,
      item.processingTimeMs || 0,
      item.inputText,
      item.outputText
    ].map(val => `"${String(val).replace(/"/g, '""')}"`);

    const csvContent = headers.join(',') + '\n' + fields.join(',');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${(item.title || 'generation').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exported as CSV file');
  };

  // Print specific item / Export to PDF
  const printItem = (item, e) => {
    e.stopPropagation();
    const printWindow = window.open('', '_blank');
    const typeLabel = item.type === 'translation' ? 'Translation Output' :
                      item.type === 'creative' ? 'Creative Copy' :
                      item.type === 'improve' ? 'Improved Version' : 'Quote Sheet';
                      
    const htmlContent = `
      <html>
        <head>
          <title>${item.title || 'AI Document'}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { font-size: 24px; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 24px; }
            .meta { font-size: 13px; color: #64748b; margin-bottom: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f8fafc; padding: 15px; border-radius: 8px; }
            .section { margin-bottom: 30px; }
            .section-title { font-weight: bold; font-size: 14px; text-transform: uppercase; color: #475569; letter-spacing: 0.5px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; margin-bottom: 12px; }
            .box { padding: 16px; background: #fafafa; border: 1px solid #f1f5f9; border-radius: 6px; white-space: pre-wrap; font-size: 15px; }
            .output { background: #fff; border: none; font-size: 16px; color: #0f172a; }
          </style>
        </head>
        <body>
          <h1>WordFlow Document: ${item.title || 'Generated Content'}</h1>
          <div class="meta">
            <div><strong>Type:</strong> ${typeLabel}</div>
            <div><strong>Date:</strong> ${new Date(item.createdAt).toLocaleString()}</div>
            <div><strong>Processing Time:</strong> ${item.processingTimeMs || 0} ms</div>
            <div><strong>Char Count:</strong> ${item.outputText?.length || 0} chars</div>
          </div>
          <div class="section">
            <div class="section-title">Original Prompt / Input</div>
            <div class="box">${item.inputText}</div>
          </div>
          <div class="section">
            <div class="section-title">AI Generated Output</div>
            <div class="output">${item.outputText.replace(/\n/g, '<br />')}</div>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Convert markdown list or basic markdown to simple list element for output previews
  const renderFormattedOutput = (text) => {
    if (!text) return '';
    // If quote, format JSON
    try {
      const parsed = JSON.parse(text);
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
          <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-body)' }}>Price Per Word</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-heading)', marginTop: 4 }}>${parsed.pricePerWord}</div>
          </div>
          <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-body)' }}>Delivery Window</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-heading)', marginTop: 4 }}>{parsed.deliveryDays}</div>
          </div>
        </div>
      );
    } catch (e) {
      // Return standard paragraphs
      return text.split('\n').map((para, i) => {
        if (!para.trim()) return null;
        if (para.startsWith('**') && para.endsWith('**')) {
          return <h4 key={i} style={{ color: 'var(--text-heading)', margin: '1.2rem 0 0.5rem 0', fontWeight: 700 }}>{para.replace(/\*\*/g, '')}</h4>;
        }
        if (para.startsWith('* ') || para.startsWith('- ')) {
          return <li key={i} style={{ marginLeft: '1.5rem', marginBottom: '0.3rem', color: 'var(--text-body)' }}>{para.substring(2)}</li>;
        }
        return <p key={i} style={{ marginBottom: '0.85rem', lineHeight: 1.7, color: 'var(--text-body)' }}>{para}</p>;
      });
    }
  };

  // Render SVG Analytics Chart
  const renderSvgChart = () => {
    if (!analytics) return null;
    const { typesBreakdown } = analytics;
    
    // Chart data mapping
    const chartData = [
      { label: 'Translation', count: typesBreakdown.translation, color: 'var(--primary)' },
      { label: 'Creative', count: typesBreakdown.creative, color: 'var(--secondary)' },
      { label: 'Refine', count: typesBreakdown.improve, color: '#10b981' },
      { label: 'Quotes', count: typesBreakdown.quote, color: '#f59e0b' }
    ];
    
    const maxCount = Math.max(...chartData.map(d => d.count), 1);
    
    return (
      <div style={{ marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={18} style={{ color: 'var(--primary)' }} />
          Volume by Content Category
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {chartData.map((bar, index) => {
            const percentage = (bar.count / maxCount) * 100;
            return (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 40px', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-heading)' }}>{bar.label}</span>
                <div style={{ height: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 9999, overflow: 'hidden', display: 'flex' }}>
                  <div
                    style={{
                      width: `${Math.max(percentage, bar.count > 0 ? 5 : 0)}%`,
                      height: '100%',
                      backgroundColor: bar.color,
                      borderRadius: 9999,
                      transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: `0 0 10px ${bar.color}40`
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-heading)', textAlign: 'right' }}>{bar.count}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '2rem 0' }}>
      {/* Upper header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-heading)' }} className="gradient-text">
            Creator Dashboard
          </h1>
          <p style={{ color: 'var(--text-body)', marginTop: 4 }}>
            Monitor your generated assets, track productivity metrics, and manage history.
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={loading || loadingAnalytics}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '10px 18px',
            borderRadius: 8,
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-heading)',
            border: '1px solid var(--border)',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={16} className={(loading || loadingAnalytics) ? 'spin-anim' : ''} style={{ animation: (loading || loadingAnalytics) ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin-anim {
          animation: spin 1s linear infinite;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2rem;
        }
        .stats-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          transition: transform 0.2s, border-color 0.2s;
        }
        .stats-card:hover {
          transform: translateY(-2px);
          border-color: var(--primary);
        }
        .stats-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justifyContent: center;
        }
        .history-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          margin-bottom: 1rem;
          overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .history-card.expanded {
          border-color: var(--primary);
          box-shadow: var(--shadow);
        }
        .history-header {
          padding: 1.25rem;
          display: flex;
          align-items: center;
          justifyContent: space-between;
          cursor: pointer;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .history-type-badge {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 9999px;
          text-transform: uppercase;
        }
        .badge-translation { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
        .badge-creative { background: rgba(236, 72, 153, 0.15); color: #f472b6; }
        .badge-improve { background: rgba(16, 185, 129, 0.15); color: #34d399; }
        .badge-quote { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
        
        .history-action-btn {
          background: none;
          border: none;
          color: var(--text-body);
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justifyContent: center;
          transition: all 0.2s;
        }
        .history-action-btn:hover {
          color: var(--text-heading);
          background-color: rgba(255, 255, 255, 0.05);
        }
        .history-action-btn.btn-delete:hover {
          color: #ef4444;
          background-color: rgba(239, 68, 68, 0.1);
        }
        
        .filter-tab {
          padding: 0.5rem 1.25rem;
          font-size: 0.9rem;
          font-weight: 500;
          border-radius: 9999px;
          cursor: pointer;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-body);
          transition: all 0.2s;
        }
        .filter-tab.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }
        .filter-tab:hover:not(.active) {
          border-color: var(--text-body);
          color: var(--text-heading);
        }
        
        .edit-input-field {
          width: 100%;
          background: var(--bg-alt);
          border: 1px solid var(--border);
          color: var(--text-heading);
          border-radius: 8px;
          padding: 10px 14px;
          font-family: inherit;
          margin-bottom: 0.75rem;
          outline: none;
        }
        .edit-input-field:focus {
          border-color: var(--primary);
        }
      `}} />

      {/* Analytics Cards */}
      {analytics ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          
          {/* Visual Column Card 1: Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="stats-card">
              <div className="stats-icon-wrapper" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
                <Sparkles size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-body)' }}>Total AI Generations</span>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: 2 }}>{analytics.totalGenerations}</h2>
              </div>
            </div>
            
            <div className="stats-card">
              <div className="stats-icon-wrapper" style={{ backgroundColor: 'rgba(236, 72, 153, 0.15)', color: 'var(--secondary)' }}>
                <FileText size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-body)' }}>Words Written</span>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: 2 }}>{analytics.totalWordCount.toLocaleString()}</h2>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="stats-card">
              <div className="stats-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                <Clock size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-body)' }}>Avg Speed (Processing)</span>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: 2 }}>{analytics.avgProcessingTimeMs} ms</h2>
              </div>
            </div>
            
            <div className="stats-card">
              <div className="stats-icon-wrapper" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                <Coins size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-body)' }}>Estimated Project Valuation</span>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: 2 }}>${analytics.totalEstimatedCost.toFixed(2)}</h2>
              </div>
            </div>
          </div>

          {/* SVG Column Chart (Visual Analytics) */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {renderSvgChart()}
          </div>
          
        </div>
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)', color: 'var(--text-body)', marginBottom: '2rem' }}>
          {loadingAnalytics ? 'Loading analytics insights...' : 'Generate some content to populate your dashboard insights!'}
        </div>
      )}

      {/* Control Filters Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem' }}>
        
        {/* Search Field */}
        <div style={{ position: 'relative', width: '100%', maxWidth: 300 }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-body)' }} />
          <input
            type="text"
            placeholder="Search prompt or result..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '10px 16px 10px 40px',
              margin: 0,
              fontSize: '0.9rem',
              backgroundColor: 'var(--bg-alt)'
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-body)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Categories */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'All Logs', value: '' },
            { label: 'Translate', value: 'translation' },
            { label: 'Creative', value: 'creative' },
            { label: 'Refine', value: 'improve' },
            { label: 'Quotes', value: 'quote' }
          ].map(tab => (
            <button
              key={tab.value}
              className={`filter-tab ${typeFilter === tab.value ? 'active' : ''}`}
              onClick={() => {
                setTypeFilter(tab.value);
                setCurrentPage(1);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logs History List */}
      <div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={20} style={{ color: 'var(--primary)' }} />
          Generation History ({totalRecords} records)
        </h2>

        {loading ? (
          <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-body)' }}>
            <span className="spinner" style={{ border: '2px solid var(--primary)', borderTop: '2px solid transparent', borderRadius: '50%', width: 24, height: 24, display: 'inline-block', animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
            <p>Loading history records...</p>
          </div>
        ) : history.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)', color: 'var(--text-body)' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '0.5rem' }}>No records found</p>
            <p style={{ fontSize: '0.9rem' }}>
              {search || typeFilter ? 'No search results match your criteria. Try altering your filters.' : 'You have not generated any content yet. Try a generator above!'}
            </p>
          </div>
        ) : (
          history.map(item => {
            const isExpanded = expandedId === item._id;
            const isEditing = editingId === item._id;
            
            // Format Badge type
            const typeLabel = item.type === 'translation' ? 'Translate' :
                              item.type === 'creative' ? 'Creative' :
                              item.type === 'improve' ? 'Refine' : 'Quote';

            return (
              <div key={item._id} className={`history-card ${isExpanded ? 'expanded' : ''}`}>
                
                {/* Header view */}
                <div className="history-header" onClick={() => toggleExpand(item._id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 200 }}>
                    <span className={`history-type-badge badge-${item.type}`}>{typeLabel}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: '0.95rem' }}>
                      {item.title || 'AI Generation'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} onClick={e => e.stopPropagation()}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-body)' }}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    
                    {/* Action buttons */}
                    <button className="history-action-btn" title="Edit Content" onClick={(e) => startEdit(item, e)}>
                      <Edit3 size={16} />
                    </button>
                    
                    {/* Export dropdown */}
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <button className="history-action-btn" title="Download Text" onClick={(e) => exportAsTxt(item, e)}>
                        <Download size={16} />
                      </button>
                    </div>

                    <button className="history-action-btn" title="Export CSV" onClick={(e) => exportAsCsv(item, e)} style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                      CSV
                    </button>

                    <button className="history-action-btn" title="Print/PDF" onClick={(e) => printItem(item, e)}>
                      PDF
                    </button>

                    <button className="history-action-btn btn-delete" title="Delete record" onClick={(e) => handleDelete(item._id, e)}>
                      <Trash2 size={16} />
                    </button>

                    {/* Toggle Indicator */}
                    <button
                      className="history-action-btn"
                      onClick={() => toggleExpand(item._id)}
                      style={{ color: 'var(--text-body)' }}
                    >
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Accordion Body */}
                {isExpanded && (
                  <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-alt)' }}>
                    
                    {isEditing ? (
                      /* Editing Form View */
                      <form onSubmit={(e) => saveEdit(item._id, e)} onClick={e => e.stopPropagation()}>
                        <div style={{ marginBottom: '1rem' }}>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-heading)', marginBottom: 4 }}>Title</label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            className="edit-input-field"
                            required
                          />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-heading)', marginBottom: 4 }}>Prompt / Input</label>
                          <textarea
                            value={editInput}
                            onChange={e => setEditInput(e.target.value)}
                            className="edit-input-field"
                            rows={3}
                          />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-heading)', marginBottom: 4 }}>Generated Output</label>
                          <textarea
                            value={editOutput}
                            onChange={e => setEditOutput(e.target.value)}
                            className="edit-input-field"
                            rows={8}
                            required
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            style={{
                              padding: '8px 16px',
                              borderRadius: 6,
                              border: '1px solid var(--border)',
                              background: 'none',
                              color: 'var(--text-heading)',
                              fontWeight: 500
                            }}
                          >
                            Cancel
                          </button>
                          
                          <button
                            type="submit"
                            disabled={savingEdit}
                            style={{
                              padding: '8px 16px',
                              borderRadius: 6,
                              border: 'none',
                              background: 'var(--primary)',
                              color: '#fff',
                              fontWeight: 500,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            {savingEdit ? 'Saving...' : (
                              <>
                                <Check size={16} />
                                Save
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* Static Content View */
                      <div>
                        {/* Display Input */}
                        <div style={{ marginBottom: '1.25rem' }}>
                          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-heading)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                            Input Prompt
                          </h4>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-body)', padding: '0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: 6, border: '1px solid var(--border)', whiteSpace: 'pre-wrap' }}>
                            {item.inputText}
                          </div>
                        </div>

                        {/* Display Output */}
                        <div>
                          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-heading)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                            Generated Result
                          </h4>
                          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-card)', borderRadius: 6, border: '1px solid var(--border)', overflowWrap: 'break-word' }}>
                            {renderFormattedOutput(item.outputText)}
                          </div>
                        </div>

                        {/* Display performance specs */}
                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem', fontSize: '0.75rem', color: 'var(--text-body)', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                          <span><strong>Time:</strong> {item.processingTimeMs || 0} ms</span>
                          {item.ipAddress && <span><strong>IP:</strong> {item.ipAddress}</span>}
                          <span><strong>Saved at:</strong> {new Date(item.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>
            );
          })
        )}

        {/* Pagination controls */}
        {!loading && totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem', alignItems: 'center' }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                color: 'var(--text-heading)',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              Previous
            </button>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-body)' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                color: 'var(--text-heading)',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
