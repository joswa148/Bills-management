import axios from '../axiosInstance';

export const billsApi = {
  getBills: async () => {
    const response = await axios.get('/subscriptions');
    return response.data.data;
  },
  getInvoices: async () => {
    const response = await axios.get('/subscriptions/invoices');
    return response.data.data;
  },
  getInvoice: async (id) => {
    const response = await axios.get(`/subscriptions/${id}`);
    return response.data.data;
  },
  getBill: async (id) => {
    const response = await axios.get(`/subscriptions/${id}`);
    return response.data.data;
  },
  createBill: async (bill) => {
    const response = await axios.post('/subscriptions', bill);
    return response.data.data; // Now returns { subscriptionId, invoiceId }
  },
  updateBill: async (id, data) => {
    const response = await axios.put(`/subscriptions/${id}`, data);
    return response.data.data;
  },
  deleteBill: async (id) => {
    await axios.delete(`/subscriptions/${id}`);
    return true;
  },
  scanBill: async (formData) => {
    const response = await axios.post('/subscriptions/scan', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data; // Now returns { jobId, status: 'pending', ... }
  },
  getScanStatus: async (jobId) => {
    const response = await axios.get(`/subscriptions/scan/${jobId}`);
    return response.data.data;
  },
  mapVendor: async (rawName, canonicalName) => {
    const response = await axios.post('/subscriptions/vendors/map', { rawName, canonicalName });
    return response.data;
  }
};
