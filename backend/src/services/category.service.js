import { CategoryModel } from "../models/category.model.js";

export const CategoryService = {
  addCategory: async (data) => {
    return await CategoryModel.create(data);
  },

  updateCategory: async (id, name) => {
    return await CategoryModel.update(id, name);
  },

  deleteCategory: async (id) => {
    return await CategoryModel.delete(id);
  },

  getAllCategories: async () => {
    return await CategoryModel.getAll();
  },
};
