export const formatPrice = (price) => `₹${price}/day`;

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? diff : 1;
};

export const calculateTotal = (price, startDate, endDate) => {
  const days = calculateDays(startDate, endDate);
  return price * days;
};

export const getStatusColor = (status) => {
  const colors = {
    pending: '#FF9800',
    accepted: '#2E7D32',
    on_the_way: '#1976D2',
    completed: '#4CAF50',
    rejected: '#F44336',
  };
  return colors[status] || '#666';
};

export const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    accepted: 'Accepted',
    on_the_way: 'On The Way',
    completed: 'Completed',
    rejected: 'Rejected',
  };
  return labels[status] || status;
};

export const generateBookingId = () => {
  return 'BK' + Math.random().toString(36).substr(2, 6).toUpperCase();
};
