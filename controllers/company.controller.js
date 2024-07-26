import { Company } from "../model/company.model.js";
export const registerCompany = async (req, res) => {
  try {
    const { companyname, description, website, socialmedia } = req.body;
    if (!companyname || !description || !website || !socialmedia) {
      return res.status(400).json({
        message: "All field is required",
        success: false,
      });
    }
    const match = await Company.findOne({companyname });
    if (match) {
      return res.status(400).json({
        message: "Company name is already exists.",
        success: false,
      });
    }
  } catch (error) {}
};
