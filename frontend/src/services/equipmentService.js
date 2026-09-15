import api from './api';

export const equipmentService = {
  getEquipment: async (filters = {}) => {
    try {
      const response = await api.get('/equipment', {
        params: filters,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  getEquipmentById: async (id) => {
    try {
      const response = await api.get(`/equipment/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  createEquipment: async (equipmentData) => {
    try {
      const response = await api.post('/equipment', equipmentData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateEquipment: async (id, equipmentData) => {
    try {
      const response = await api.put(`/equipment/${id}`, equipmentData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  deleteEquipment: async (id) => {
    try {
      const response = await api.delete(`/equipment/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default equipmentService;