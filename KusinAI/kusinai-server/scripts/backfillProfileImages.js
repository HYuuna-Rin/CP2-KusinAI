import mongoose from "mongoose";
import dotenv from "dotenv";
import Recipe from "../models/Recipe.js";
import User from "../models/User.js";

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const recipes = await Recipe.find();

  for (let recipe of recipes) {
    let updated = false;

    // Fix comments
    for (let comment of recipe.comments) {
      if (!comment.profileImage) {
        const user = await User.findById(comment.userId).select("profileImage");
        if (user) {
          comment.profileImage = user.profileImage || "";
          updated = true;
        }
      }

      // Fix replies
      for (let reply of comment.replies) {
        if (!reply.profileImage) {
          const user = await User.findById(reply.userId).select("profileImage");
          if (user) {
            reply.profileImage = user.profileImage || "";
            updated = true;
          }
        }
      }
    }

    if (updated) {
      await recipe.save();
      console.log(`✅ Updated recipe: ${recipe.title}`);
    }
  }

  console.log("🎉 Backfill complete!");
  process.exit();
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
