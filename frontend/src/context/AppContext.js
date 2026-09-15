import React, { createContext, useContext, useState, useEffect } from 'react';
import { equipmentService } from '../services/equipmentService';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [equipment, setEquipment] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      setLoading(true);

      const response = await equipmentService.getEquipment();

      // Backend response:
      // {
      //   success: true,
      //   count: 5,
      //   data: [...]
      // }

      setEquipment(response.data);

      setError(null);
    } catch (err) {
      console.log('Equipment Error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshEquipment = async () => {
    await loadEquipment();
  };

  const addBooking = (booking) => {
    setBookings(prev => [booking, ...prev]);
  };

  const updateBookingStatus = (bookingId, status) => {
    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId
          ? { ...b, status }
          : b
      )
    );
  };

  return (
    <AppContext.Provider
      value={{
        equipment,
        bookings,
        loading,
        error,
        refreshEquipment,
        addBooking,
        updateBookingStatus,
        setLoading,
        setError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }

  return context;
};

export default AppContext;