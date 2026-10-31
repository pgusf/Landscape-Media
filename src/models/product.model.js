
module.exports = (mongoose) => {
  const schema = new mongoose.Schema(
    {
      productImg: {
        type: [String],
        default: [],
      },

      productName: {
        type: String,
        trim: true,
        default: "",
      },

      description: {
        type: String,
        default: "",
      },

      LeadTime: {
        type: String,
        default: "",
      },

      LoadClass: {
        type: String,
        default: "",
      },

      standard: {
        type: String,
        default: "",
      },

      subCategory: {
        type: String,
        default: "",
      },

      category: {
        type: String,
        default: "",
      },

      isPriceOnReq: {
        type: Boolean,
        default: true,
      },

      price: {
        type: Number,
        default: 0,
      },

      suppliedBy: {
        type: String,
        default: "",
      },

      specification: {
        depth: {
          type: String,
          default: "",
        },
        width: {
          type: String,
          default: "",
        },
        maxSpam: {
          type: String,
          default: "",
        },
        cores: {
          type: String,
          default: "",
        },
        strand: {
          type: String,
          default: "",
        },
        fireRating: {
          type: String,
          default: "",
        },
      },

      attachedDocs: {
        type: [String],
        default: [],
      },
    },
    {
      timestamps: true,
    }
  );

  schema.set("toJSON", {
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
    },
  });

  return mongoose.model("products", schema);
};
