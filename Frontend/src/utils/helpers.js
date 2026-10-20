// ========================================
// STUDY BUDDY – UTILITY HELPERS
// ========================================

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

export function formatShortDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  });
}

export function getRelativeTime(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function getDaysUntil(date) {
  const now = new Date();
  const target = new Date(date);
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 'Overdue';
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return `${diff} days`;
}

export function getPriorityColor(priority) {
  const colors = { high: '#E2685E', urgent: '#E2685E', medium: '#F0A94E', low: '#5BB974', normal: '#6FA8DC' };
  return colors[priority] || '#948E88';
}

export function getStatusColor(status) {
  const colors = { completed: '#5BB974', 'in-progress': '#F0A94E', pending: '#948E88', submitted: '#6FA8DC', review: '#C9B6E4', active: '#5BB974', inactive: '#E2685E', draft: '#F0A94E', available: '#E75480', upcoming: '#C9B6E4' };
  return colors[status] || '#948E88';
}

export function getLevelColor(level) {
  const colors = { Beginner: '#5BB974', Intermediate: '#F0A94E', Advanced: '#E2685E' };
  return colors[level] || '#948E88';
}

export function getDifficultyColor(difficulty) {
  const colors = { Easy: '#5BB974', Medium: '#F0A94E', Hard: '#E2685E' };
  return colors[difficulty] || '#948E88';
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function generateInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
