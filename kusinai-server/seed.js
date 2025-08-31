import mongoose from "mongoose";
import dotenv from "dotenv";
import Recipe from "./models/Recipe.js";

dotenv.config();

const recipes = [
  {
    title: "Chicken Adobo",
    region: "Tagalog Region",
    ingredients: [
      "1kg chicken",
      "1/2 cup soy sauce",
      "1/4 cup vinegar",
      "4 cloves garlic",
      "1 tsp whole peppercorn",
      "2 pcs bay leaf",
      "1 tbsp cooking oil",
      "1 cup water"
    ],
    steps: [
      "Heat oil in a pan and sauté garlic until golden brown.",
      "Add chicken and cook until lightly browned.",
      "Pour in soy sauce and vinegar. Add peppercorn and bay leaves.",
      "Let it boil without stirring for 5 minutes.",
      "Add water and simmer for 30–40 minutes until chicken is tender.",
      "Adjust seasoning to taste."
    ],
    method: "Stewing",
    nutrition: {
      calories: "350 kcal",
      protein: "25g",
      fat: "20g",
      carbs: "8g"
    },
    substitutions: [
      "Soy sauce → coconut aminos",
      "Chicken → tofu or mushroom for vegan option"
    ],
    image: "https://www.panlasangpinoy.com/wp-content/uploads/2023/03/Chicken-Adobo.jpg"
  },
  {
    title: "Pork Sinigang",
    region: "Luzon",
    ingredients: [
      "1kg pork belly",
      "1 medium onion, quartered",
      "2 medium tomatoes, quartered",
      "1 pack sinigang mix (tamarind)",
      "1 cup string beans",
      "1 cup kangkong (water spinach)",
      "1 radish, sliced",
      "2 eggplants, sliced",
      "6 cups water"
    ],
    steps: [
      "In a large pot, combine pork, onions, tomatoes, and water. Bring to a boil.",
      "Lower heat and simmer until pork is tender.",
      "Add sinigang mix and vegetables.",
      "Cook until vegetables are tender.",
      "Serve hot."
    ],
    method: "Boiling",
    nutrition: {
      calories: "400 kcal",
      protein: "28g",
      fat: "30g",
      carbs: "10g"
    },
    substitutions: [
      "Pork → fish or shrimp",
      "Sinigang mix → fresh tamarind or calamansi"
    ],
    image: "https://www.panlasangpinoy.com/wp-content/uploads/2019/07/Sinigang-na-Baboy-Recipe.jpg"
  }
  
];

// ✅ Directly insert the original recipes without stripping ingredients
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB ✅");
    await Recipe.deleteMany(); // Clear existing
    await Recipe.insertMany(recipes); // ⬅ no cleaning
    console.log("🍲 Full-format recipe data inserted!");
    process.exit();
  })
  .catch(err => {
    console.error("❌ Error inserting data:", err);
    process.exit(1);
  });
