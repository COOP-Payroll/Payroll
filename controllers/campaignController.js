const Campaign = require("../models/campaigns.js");
const Region = require("../models/region.js");

exports.createCampaign = async (req, res) => {
  try {
    const {
      name,
      description,
      startDate,
      endDate,
      budget,
      status,
      regionId,
      campaignType,
      targetPopulation,
      healthOutcome,
      successMetrics,
      requiredResources,
      complianceRequirements,
      riskAssessment,
      reportingFrequency,
    } = req.body;

    // Validate required fields
    if (!name || !startDate || !endDate || !campaignType) {
      return res.status(400).json({
        message:
          "Missing required fields: name, startDate, endDate, and campaignType are required",
      });
    }

    const campaign = await Campaign.create({
      name,
      description,
      startDate,
      endDate,
      budget,
      status,
      regionId,
      campaignType,
      targetPopulation,
      healthOutcome,
      successMetrics,
      requiredResources,
      complianceRequirements,
      riskAssessment,
      reportingFrequency,
    });

    res.status(201).json({
      message: "Campaign created successfully",
      data: campaign,
    });
  } catch (error) {
    console.error("Error creating campaign:", error);
    res.status(500).json({
      message: "Failed to create campaign",
      error: error.message,
    });
  }
};

exports.getAllCampaigns = async (req, res, next) => {
  try {
    const campaigns = await Campaign.findAll({
      include: [
        {
          model: Region,
          as: "Region",
          foreignKey: "regionId",
          required: false,
        },
      ],
      where: {
        regionId: req?.user?.regionId,
        isActive: true,
      },
    });

    res.status(200).json({ data: campaigns });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({
      message: "Failed to fetch campaigns",
      error: error.message,
    });
  }
};

exports.getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await Campaign.findByPk(id, {
      include: [
        {
          model: Region,
          as: "Region",
          foreignKey: "regionId",
          required: false,
        },
      ],
    });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    res.status(200).json({ data: campaign });
  } catch (error) {
    console.error("Error fetching campaign:", error);
    res.status(500).json({
      message: "Failed to fetch campaign",
      error: error.message,
    });
  }
};

exports.updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent updating regionId and approval related fields
    const restrictedFields = [
      "regionId",
      "approvalStatus",
      "approvalDate",
      "approvedBy",
    ];
    restrictedFields.forEach((field) => {
      if (field in req.body) {
        delete req.body[field];
      }
    });

    const campaign = await Campaign.findByPk(id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    await campaign.update(req.body);

    res.status(200).json({
      message: "Campaign updated successfully",
      data: campaign,
    });
  } catch (error) {
    console.error("Error updating campaign:", error);
    res.status(500).json({
      message: "Failed to update campaign",
      error: error.message,
    });
  }
};

exports.deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    const [updated] = await Campaign.update(
      { isActive: false },
      { where: { id } }
    );

    if (updated === 0) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    res.status(200).json({
      message: "Campaign marked as inactive successfully",
    });
  } catch (error) {
    console.error("Error updating campaign to inactive:", error);
    res.status(500).json({
      message: "Failed to mark campaign as inactive",
      error: error.message,
    });
  }
};
