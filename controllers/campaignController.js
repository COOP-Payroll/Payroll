const Campaign = require("../models/campaigns.js");
const Region = require("../models/region.js");

exports.createCampaign = async (req, res) => {
  try {
    const { name, description, startDate, endDate, budget, status, regionId } =
      req.body;

    const campaign = await Campaign.create({
      name,
      description,
      startDate,
      endDate,
      budget,
      status,
      regionId,

      //   CompanyId: companyId,
    });

    res.status(201).json({
      message: "Create successfully",
      data: campaign,
    });
  } catch (error) {
    console.error("Error creating campaign:", error);
    res.status(500).json({ message: "Failed to create campaign" });
  }
};

exports.getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.findAll({
      include: [
        {
          model: Region,
          as: "Region",
          foreignKey: "regionId",
          required: false, // optional: returns all campaigns even if Region is null
        },
      ],
    });

    res.status(200).json({ data: campaigns });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ message: "Failed to fetch campaigns" });
  }
};

exports.getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await Campaign.findByPk(id, {
      //   include: [Company],
      include: [
        {
          model: Region,
          as: "Region",
          foreignKey: "regionId",
          required: false, // optional: returns all campaigns even if Region is null
        },
      ],
    });

    if (!campaign)
      return res.status(404).json({ message: "Campaign not found" });

    res.status(200).json({ data: campaign });
  } catch (error) {
    console.error("Error fetching campaign:", error);
    res.status(500).json({ message: "Failed to fetch campaign" });
  }
};

exports.updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent updating regionId
    if ("regionId" in req.body) {
      delete req.body.regionId;
    }

    const campaign = await Campaign.findByPk(id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    await campaign.update(req.body);

    res.status(200).json({
      message: "Campaign updated successfully",
      campaign,
    });
  } catch (error) {
    console.error("Error updating campaign:", error);
    res.status(500).json({ message: "Failed to update campaign" });
  }
};

exports.deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    const [updated] = await Campaign.update(
      { isActive: false },
      { where: { id } }
    );

    if (updated === 0)
      return res.status(404).json({ message: "Campaign not found" });

    res
      .status(200)
      .json({ message: "Campaign marked as inactive successfully" });
  } catch (error) {
    console.error("Error updating campaign to inactive:", error);
    res.status(500).json({ message: "Failed to mark campaign as inactive" });
  }
};
