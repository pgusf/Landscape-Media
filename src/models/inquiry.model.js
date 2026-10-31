// Export a Mongoose model configuration for a "user" model

module.exports = (mongoose) => {
  // Define the schema for the "user" model
  const schema = new mongoose.Schema(
    {
      // First name of the user
      howShouldWeMeet: {
        type: String,
        default: "",
      },
      pickDay: {
        type: String,
        default: "",
      },
      chooseTime: {
        type: String,
        default: "",
      },
      personName: {
        type: String,
        default: "",
      },
      email: {
        type: String,
        default: "",
      },
      companyName: {
        type: String, 
        default: "",
      },
      phone: {
        type: String,
        default: "",
      },
      requiredService: {
        type: String,
        default: "",
      },
     

      // Last action timestamp with a default value of null
    },
    {
      timestamps: true, // Automatically add "createdAt" and "updatedAt" timestamps to documents
    }
  );
  // schema.index({ mobile: 1, type: 1 }, { unique: true });
  // schema.index({ email: 1, type: 1 }, { unique: true });

  // Define how the schema should transform to JSON
  schema.set("toJSON", {
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
    },
  });

  // Create and return the "user" model based on the schema
  return mongoose.model("inquiry", schema);
};
