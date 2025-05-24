import Joi from "joi";

const createWorkFlowSchema = {
  body: Joi.object({
    name: Joi.string()
      .required()
      .min(3)
      .max(100)
      .description("Name of the approval flow")
      .example("Campaign Approval Flow"),

    // companyId: Joi.string()
    //   .required()
    //   .description("Company ID associated with the flow"),

    stages: Joi.array()
      .min(1)
      .required()
      .items(
        Joi.object({
          name: Joi.string()
            .required()
            .min(3)
            .max(50)
            .description("Name of the approval stage")
            .example("Manager Approval"),

          roles: Joi.array()
            .min(1)
            .required()
            .items(
              Joi.string()
                .description("Role required for approval at this stage")
                .example("role_manager")
            )
            .description("List of roles that can approve at this stage")
            .unique(), // ensures no duplicate roles in the array
        })
      )
      .description("Sequence of approval stages")
      .unique("name"), // ensures stage names are unique
  }),
};

export default { createWorkFlowSchema };
