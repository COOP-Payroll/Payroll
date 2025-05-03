// const { CampaignParticipant, Campaign, Employee } = require("../models");
const CampaignParticipant = require("../models/campaignParticipant");
const Campaign = require("../models/campaigns");

exports.createParticipant = async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      accountNumber,
      paymentMethod,
      campaignId,
      //   employeeId,
    } = req.body;

    const participant = await CampaignParticipant.create({
      fullName,
      phoneNumber,
      accountNumber,
      paymentMethod,
      CampaignId: campaignId,
      //   EmployeeId: employeeId,
    });

    res.status(201).json(participant);
  } catch (error) {
    console.error("Error creating participant:", error);
    res.status(500).json({ message: "Failed to create participant" });
  }
};



exports.getAllParticipants = async (req, res) => {
  try {
    const participants = await CampaignParticipant.findAll({
      include: [Campaign],
    });

    res.status(200).json({ data: participants });
  } catch (error) {
    console.error("Error fetching participants:", error);
    res.status(500).json({ message: "Failed to fetch participants" });
  }
};

exports.getParticipantById = async (req, res) => {
  try {
    const { id } = req.params;

    const participant = await CampaignParticipant.findByPk(id, {
      include: [Campaign, Employee],
    });

    if (!participant)
      return res.status(404).json({ message: "Participant not found" });

    res.status(200).json({ data: participant });
  } catch (error) {
    console.error("Error fetching participant:", error);
    res.status(500).json({ message: "Failed to fetch participant" });
  }
};

exports.updateParticipant = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await CampaignParticipant.update(req.body, {
      where: { id },
    });

    if (updated[0] === 0)
      return res.status(404).json({ message: "Participant not found" });

    res.status(200).json({ message: "Participant updated successfully" });
  } catch (error) {
    console.error("Error updating participant:", error);
    res.status(500).json({ message: "Failed to update participant" });
  }
};

exports.deleteParticipant = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await CampaignParticipant.destroy({ where: { id } });

    if (!deleted)
      return res.status(404).json({ message: "Participant not found" });

    res.status(200).json({ message: "Participant deleted successfully" });
  } catch (error) {
    console.error("Error deleting participant:", error);
    res.status(500).json({ message: "Failed to delete participant" });
  }
};
