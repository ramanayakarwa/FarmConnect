import api from './api';

const providerService = {
  // Get provider dashboard statistics
  getDashboard: async () => {
    const response = await api.get('/provider/dashboard');
    return response;
  },

  // Get only equipment owned by logged-in provider
  getProviderEquipment: async () => {
    const response = await api.get('/provider/equipment');
    return response;
  },

  // Get only bookings for equipment owned by logged-in provider
  getProviderBookings: async (status = null) => {
    const url = status
      ? `/provider/bookings?status=${status}`
      : '/provider/bookings';

    const response = await api.get(url);
    return response;
  },
};

export default providerService;
export { providerService };