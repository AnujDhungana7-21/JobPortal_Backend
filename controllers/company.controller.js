import { Company } from "../model/company.model.js";
export const registerCompany = async (req, res) => {
  try {
    let { companyname, description, website, socialmedia } = req.body;
    companyname.trim().toLowerCase();
    const match = await Company.findOne({ companyname });
    if (match) {
      return res.status(400).json({
        message: "Company name is already exists.",
        success: false,
      });
    }
    const newCompany = await Company.create({
      companyname,
      description,
      website,
      socialmedia,
      userid: req.id,
    });
    return res.status(201).json({
      message: "Company register Successfully",
      newCompany,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      error: err.message,
      message: "server Error",
      status: false,
    });
  }
};
export const getCompany = async (res, req) => {
  try {
    const userid = req.id;
    const companies = await Company.find(userid);
    if (!companies) {
      return res.status(404).json({
        message: "Companies not found",
        success: false,
      });
    }
    return res.status(200).json({
      companies,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      error: err.message,
      message: "server Error",
      status: false,
    });
  }
};
