import api from './api';

export const bookingService = {
  createBooking: async (bookingData) => {
    try {
      const response = await api.post('/bookings', bookingData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getBookings: async () => {
    try {
      const response = await api.get('/bookings');
      return response;
    } catch (error) {
      throw error;
    }
  },

  getBookingById: async (id) => {
    try {
      const response = await api.get(`/bookings/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateBooking: async (id, bookingData) => {
    try {
      const response = await api.put(`/bookings/${id}`, bookingData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateBookingStatus: async (id, status) => {
    try {
      const response = await api.put(`/bookings/${id}`, { status });
      return response;
    } catch (error) {
      throw error;
    }
  },

  acceptBooking: async (id) => {
    try {
      const response = await api.put(`/bookings/${id}`, {
        status: 'accepted',
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  rejectBooking: async (id) => {
    try {
      const response = await api.put(`/bookings/${id}`, {
        status: 'rejected',
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  deleteBooking: async (id) => {
    try {
      const response = await api.delete(`/bookings/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default bookingService;