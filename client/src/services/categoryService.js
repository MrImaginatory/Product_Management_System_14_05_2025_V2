import axiosClient from './axiosClient';

export const getCategories = (params = {}) =>
  axiosClient.get('/categories', { params });

export const getCategoryById = (id) =>
  axiosClient.get(`/category/${id}`);

export const createCategory = (data) =>
  axiosClient.post('/createCategory', data);

export const updateCategory = (id, data) =>
  axiosClient.patch(`/updateCategory/${id}`, data);

export const deleteCategory = (id) =>
  axiosClient.delete(`/deleteCategory/${id}`);

export const createSubCategory = (id, subCategory) =>
  axiosClient.patch(`/createSubCategory/${id}`, subCategory);

export const updateSubCategory = (id, data) =>
  axiosClient.patch(`/updateSubCategory/${id}`, data);

export const deleteSubCategory = (id, data) =>
  axiosClient.delete(`/deleteSubCategory/${id}`, { data });
