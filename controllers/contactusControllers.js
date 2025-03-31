// const ContactUs = require("../models/ContactUs");
const ContactUs = require("../models/contactusModel");
const createError = require(".././utils/error.js");
// Create a new contact message
exports.createContact = async (req, res, next) => {
  try {
    const { fullname, email, message } = req.body;
    const contact = await ContactUs.create({
      fullname,
      email,
      message,
    });

    if (!email) {
      return next(
        createError.createError(
          400,
          "Email is required. Please provide a valid email address"
        )
      );
    }
    // Email validation using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(
        createError.createError(
          400,
          "Invalid email format. Please provide a valid email address."
        )
      );
    }
    res.status(201).json({
      success: true,
      //   data: contact,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.log(error);
    return next(createError.createError(503, "Internal server error "));
  }
};

// Get all contact messages
exports.getAllContacts = async (req, res, next) => {
  try {
    const contacts = await ContactUs.findAll({
      where: { isActive: true },
    });
    res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    return next(createError.createError(503, "Internal server error "));
  }
};

// Get single contact message by ID
exports.getContactById = async (req, res, next) => {
  try {
    const contact = await ContactUs.findByPk(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }
    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    return next(createError.createError(503, "Internal server error "));
  }
};

// Update contact message
exports.updateContact = async (req, res, next) => {
  try {
    const contact = await ContactUs.findByPk(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    const updatedContact = await contact.update(req.body);
    res.status(200).json({
      success: true,
      data: updatedContact,
      message: "Contact message updated successfully",
    });
  } catch (error) {
    return next(createError.createError(503, "Internal server error "));
  }
};

// Soft delete contact message (set isActive to false)
exports.deleteContact = async (req, res, next) => {
  try {
    const contact = await ContactUs.findByPk(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    await contact.update({ isActive: false });
    res.status(200).json({
      success: true,
      message: "Contact message deleted successfully",
    });
  } catch (error) {
    return next(createError.createError(503, "Internal server error "));
  }
};
