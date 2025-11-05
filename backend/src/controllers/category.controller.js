import { CategoryService } from "../services/category.service.js";

export const addCategory = async (req, res) => {
  try {
    const { name, name_arabic } = req.body;
    const langid = 2;

    const data = { name, name_arabic, catlangid: langid };
    const result = await CategoryService.addCategory(data);

    res.status(200).json({
      success: 1,
      message: "Category added successfully",
      data: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: 0, message: "Internal server error" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    await CategoryService.updateCategory(id, name);
    res.status(200).json({ success: 1, message: "Category updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: 0, message: "Internal server error" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await CategoryService.deleteCategory(id);
    res.status(200).json({ success: 1, message: "Category deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: 0, message: "Internal server error" });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const result = await CategoryService.getAllCategories();
    res.status(200).json({ success: 1, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: 0, message: "Internal server error" });
  }
};
