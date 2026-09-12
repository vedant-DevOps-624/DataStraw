export default function StatusBadge({ status }) {
  const styles = {
    Open: 'bg-green-100 text-green-800',
    'In Progress': 'bg-yellow-100 text-yellow-800',
    Closed: 'bg-gray-200 text-gray-700',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const styles = {
    Low: 'bg-blue-50 text-blue-700',
    Medium: 'bg-gray-100 text-gray-700',
    High: 'bg-red-50 text-red-700',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[priority] || 'bg-gray-100 text-gray-800'}`}>
      {priority}
    </span>
  );
}
