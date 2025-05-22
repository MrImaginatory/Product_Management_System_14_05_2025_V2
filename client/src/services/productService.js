import axiosClient from './axiosClient';

export const getProducts = (params = {}) =>
  axiosClient.get('/getProducts', { params });

export const getProductById = (id) =>
  axiosClient.get(`/getProduct/${id}`);

export const createProduct = (formData) =>
  axiosClient.post('/createProduct', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateProduct = (id, formData) =>
  axiosClient.patch(`/updateProduct/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteProduct = (id) =>
  axiosClient.delete(`/deleteProduct/${id}`);
