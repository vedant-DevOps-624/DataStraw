import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ticketService } from '../api/axios';
import StatusBadge, { PriorityBadge } from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';

export default function TicketDetail() {
  const { ticket_id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showAiResult, setShowAiResult] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  const loadTicket = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ticketService.get(ticket_id);
      setTicket(response.data);
      setStatus(response.data.status);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
  }, [ticket_id]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setSubmitting(true);
    setSuccess(null);
    setApiError(null);
    try {
      const response = await ticketService.update(ticket_id, { status: newStatus });
      setTicket(response.data);
      setSuccess('Status updated');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setApiError(err.response?.data?.detail || 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    setSubmitting(true);
    setSuccess(null);
    setApiError(null);
    try {
      const response = await ticketService.update(ticket_id, { note: note.trim() });
      setTicket(response.data);
      setNote('');
      setSuccess('Note added');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setApiError(err.response?.data?.detail || 'Failed to add note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAiAssist = async () => {
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);
    setCopied(false);
    setShowAiResult(true);
    try {
      const response = await ticketService.aiAssist(ticket_id);
      setAiResult(response.data);
    } catch (err) {
      setAiError(err.response?.data?.detail || 'Failed to generate AI assistance');
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!aiResult?.suggested_response) return;
    try {
      await navigator.clipboard.writeText(aiResult.suggested_response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleInsertIntoNote = () => {
    if (!aiResult?.suggested_response) return;
    setNote((prev) => (prev ? `${prev}\n\n${aiResult.suggested_response}` : aiResult.suggested_response));
    toast('Copied AI response into Note field', 'info');
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await ticketService.delete(ticket_id);
      toast('Ticket deleted successfully', 'success');
      navigate('/');
    } catch (err) {
      setApiError(err.response?.data?.detail || 'Failed to delete ticket');
      setShowDeleteDialog(false);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="space-y-4">
        <Link to="/" className="text-sm text-blue-600 hover:text-blue-800">&larr; Back to Dashboard</Link>
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">{error}</div>
      </div>
    );
  }

  if (!ticket) return null;

  const canDelete = ticket.status === 'Closed';

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/" className="text-xs font-medium text-blue-600 hover:text-blue-800">&larr; Back to Dashboard</Link>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Ticket {ticket.ticket_id}</h1>
          <p className="text-xs text-gray-500">Created {formatDate(ticket.created_at)}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
          {canDelete && (
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
            >
              Delete Ticket
            </button>
          )}
          {!canDelete && (
            <span className="text-xs text-gray-400">Delete available when Closed</span>
          )}
        </div>
      </div>

      {success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">{success}</div>
      )}
      {apiError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{apiError}</div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left Column: Ticket Details & Existing Notes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">Ticket Details</h2>
            <dl className="mt-3 space-y-2.5">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Customer</dt>
                <dd className="mt-0.5 text-sm text-gray-900">{ticket.customer_name} &lt;{ticket.customer_email}&gt;</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Subject</dt>
                <dd className="mt-0.5 text-sm font-medium text-gray-900">{ticket.subject}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Description</dt>
                <dd className="mt-0.5 text-sm text-gray-800 whitespace-pre-wrap rounded-md bg-gray-50 p-3 border border-gray-100">{ticket.description}</dd>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Created</dt>
                  <dd className="mt-0.5 text-xs text-gray-700">{formatDate(ticket.created_at)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Updated</dt>
                  <dd className="mt-0.5 text-xs text-gray-700">{formatDate(ticket.updated_at)}</dd>
                </div>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">Notes</h2>
            {ticket.notes && ticket.notes.length > 0 ? (
              <ul className="mt-3 space-y-2.5">
                {ticket.notes.map((noteItem) => (
                  <li key={noteItem.id} className="rounded-md border border-gray-100 bg-gray-50 p-3">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{noteItem.note_text}</p>
                    <p className="mt-1.5 text-xs text-gray-400">{formatDate(noteItem.created_at)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-gray-500">No notes yet.</p>
            )}
          </div>
        </div>

        {/* Right Column: Actions (Status, AI Assistant, Add Note) - All visible on single screen */}
        <div className="space-y-3.5">
          {/* 1. Update Status */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-gray-900">Update Status</h2>
              <select
                value={status}
                onChange={handleStatusChange}
                disabled={submitting}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          {/* 2. AI Ticket Assistant */}
          <div className="rounded-lg border border-indigo-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI Ticket Assistant
              </h2>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">Groq AI</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">Generate summary & suggested response.</p>
            <button
              type="button"
              onClick={handleAiAssist}
              disabled={aiLoading}
              className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {aiLoading ? (
                <>
                  <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Generating Assistance...</span>
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Generate AI Assistance</span>
                </>
              )}
            </button>

            {aiError && (
              <div className="mt-3 rounded-md bg-red-50 p-3 text-xs text-red-800">
                <p>{aiError}</p>
                <button
                  type="button"
                  onClick={handleAiAssist}
                  disabled={aiLoading}
                  className="mt-1.5 rounded border border-red-300 bg-white px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  Retry
                </button>
              </div>
            )}

            {aiResult && (
              <div className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50/20 p-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-indigo-100/60">
                  <span className="text-xs font-semibold text-indigo-950 flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    AI Generated Analysis
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAiResult(!showAiResult)}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    {showAiResult ? 'Collapse' : 'Expand'}
                  </button>
                </div>

                {showAiResult ? (
                  <div className="mt-2.5 space-y-2.5">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Summary</h3>
                      <p className="mt-1 rounded-md border border-indigo-50 bg-white p-2 text-xs text-gray-800 whitespace-pre-wrap leading-relaxed max-h-24 overflow-y-auto">
                        {aiResult.summary}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Suggested Response</h3>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={handleInsertIntoNote}
                            title="Insert into Note field"
                            className="rounded border border-indigo-200 bg-white px-2 py-0.5 text-xs font-medium text-indigo-700 hover:bg-indigo-50 transition-colors"
                          >
                            Use in Note
                          </button>
                          <button
                            type="button"
                            onClick={handleCopy}
                            className="rounded border border-gray-300 bg-white px-2 py-0.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            {copied ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                      <p className="mt-1 rounded-md border border-gray-200 bg-white p-2 text-xs text-gray-800 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                        {aiResult.suggested_response}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-1.5 text-xs text-gray-500 italic truncate">
                    {aiResult.summary}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 3. Add Note */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">Add Note</h2>
            <form onSubmit={handleAddNote} className="mt-2 space-y-2">
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write an internal note..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={submitting || !note.trim()}
                className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Saving...' : 'Add Note'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Ticket"
        message={`Are you sure you want to delete ticket ${ticket.ticket_id}? This action cannot be undone and all associated notes will be permanently removed.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        confirmLabel={deleting ? 'Deleting...' : 'Delete'}
        disabled={deleting}
      />
    </div>
  );
}
