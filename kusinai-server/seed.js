import mongoose from "mongoose";
import dotenv from "dotenv";
import Recipe from "./models/Recipe.js";

dotenv.config();

const recipes = [
  /* #1 - Bicol Region: Pork Bicol Express */
  {
    title: "Pork Bicol Express",
    region: "Bicol Region",
    ingredients: [
      "300g Pork Belly sliced",
      "125ml Water",
      "1 tsp. Sugar optional",
      "1 tbsp. Ginger strips",
      "3 gloves garlic chopped",
      "1 small onion sliced",
      "1 tbsp. Spicy bagoong",
      "5 pcs. Green chili sliced",
      "200ml coconut milk",
      "pinch salt & pepper to taste"
    ],
    steps: [
      "Place the pork in a pan and boil until the liquid dries up and the meat starts to render its own fat",
      "Season lightly with salt and pepper",
      "Toss in the ginger and sauté for about 30 seconds to release its aroma",
      "Add the garlic and onion, then cook until softened and fragrant",
      "Stir in the spicy bagoong and sauté for about a minute to blend the flavors",
      "Pour in two-thirds of the coconut milk, then let it simmer gently over low heat.",
      "Drop in the green chilies and keep stirring from time to time to prevent burning.",
      "Continue simmering until the dish turns fragrant and the coconut oil begins to surface.",
      "Add the remaining coconut milk and cook for another 2 minutes.",
      "Please give it a taste test and adjust the seasoning as needed. Add a pinch of sugar if you like a subtle sweetness.",
      "Serve hot with rice and enjoy your creamy, spicy Bicol Express!"
    ],
    method: "",
    nutrition: {
      calories: 450,
      protein: 22,
      fat: 50,
      carbs: 11
    },
    substitutions: [
      "Pork - chicken or seafood"
    ],
    image: "https://panlasangpinoy.com/wp-content/uploads/2016/11/Pork-chop-bicol-express_.jpg"
  },
  /* #2 - Tagalog Region: Kinamatisang Baboy na Tuyo */
  {
    title: "Kinamatisang Baboy na Tuyo",
    region: "Tagalog Region",
    ingredients: [
      "500 g Pork Belly cubed",
      "1 med. Onion sliced",
      "3 cloves Garlic chopped",
      "4 med. Tomatoes sliced",
      "1½ tbsp. Oyster Sauce",
      "1 cup Water add more if needed",
      "2 pcs. Chili slices",
      "Salt & Pepper to taste"
    ],
    steps: [
      "Heat a pan over medium heat.",
      "Sear the pork belly until it browns and starts to render its fat.",
      "Season with salt and pepper to taste",
      "Once nicely browned, remove the pork from the pan and set it aside",
      "In the same pan, add a bit of oil if needed.",
      "Sauté the onions and garlic until they soften and become fragrant.",
      "Add the sliced tomatoes and sauté until they turn mushy and release their juices.",
      "Season again with a little salt and pepper to boost the flavor.",
      "Return the seared pork belly to the pan and give everything a good stir.",
      "Add oyster sauce and mix well until the pork is nicely coated.",
      "Pour in about a cup of water.",
      "Bring it to a boil over medium heat for around 5 minutes.",
      "Lower the heat and let it simmer until the pork turns tender.",
      "Add some chili if you want a bit of heat, then taste and adjust the seasoning as needed.",
      "Continue to simmer until the sauce reduces and thickens slightly.",
      "Serve hot with steamed rice and enjoy your hearty Kinamatisang Baboy na Tuyo!"
    ],
    method: "",
    nutrition: {
      calories: 540,
      protein: 12,
      fat: 60,
      carbs: 5
    },
    substitutions: [
      ""
    ],
    image: "https://www.pinoyrecipe.net/wp-content/uploads/2025/06/Kinamatisang-Baboy-Recipe-Simple-and-Healthy-Filipino-Dish-360x361.jpg"
  },
  /* #3 - Ilo-Ilo Region: Batchoy using Instant Noodles */
  {
    title: "Batchoy using Instant Noodles",
    region: "Ilo-Ilo Region",
    ingredients: [
      "1 pack Lucky Me Batchoy Noodles + extra noodle",
      "500 ml Water",
      "1 tbsp. Oil",
      "2 stalks Spring Onion chopped & divided",
      "¼ cup Pork Belly boiled & sliced thinly",
      "¼ cup Pork Liver boiled & sliced thinly",
      "1 med. Egg"
    ],
    steps: [
      "Boil the pork belly and liver in water for 8-10 minutes.",
      "Drain, let them cool, and slice thinly. Set aside.",
      "In a saucepan, heat oil over medium heat.",
      "Sauté the white part of the spring onions until golden brown.",
      "Pour in 2 cups of water and bring to a boil.",
      "Add the Batchoy seasoning packets and stir well.",
      "Boil the noodles in the broth for 2 minutes, then remove immediately and place in a serving bowl.",
      "Drop the sliced pork belly, liver, and egg into the boiling broth.",
      "Let it cook for 1 minute, then remove and arrange over the noodles.",
      "Pour the hot broth over the noodles and toppings.",
      "Garnish with crushed chicharon, chopped spring onions, and a sprinkle of black pepper.",
      "Serve immediately while hot.",
      "Enjoy your flavorful Batchoy!"
    ],
    method: "",
    nutrition: {
      calories: 162,
      fat: 18,
      carbs: 42
    },
    substitutions: [
      ""
    ],
    image: "https://www.pinoyrecipe.net/wp-content/uploads/2025/03/A-bowl-of-easy-to-prepare-Batchoy--683x1024.jpg"
  },
  /* #4 - : Sarciadong Tuyo */
  {
    title: "Sarciadong Tuyo",
    region: "",
    ingredients: [
      "12 pcs Tuyo fried",
      "2 tbsp. Canola Oil",
      "5 cloves Garlic chopped",
      "1 med. White Onion sliced",
      "8 small Ripe Tomatoes sliced",
      "¼ tsp. Black Pepper",
      "¼ tsp. Magic Sarap Seasoning",
      "8 tbsp. Water",
      "3 tbsp. White Vinegar",
      "2 tsp. White Sugar"
    ],
    steps: [
      "Slice and finely chop 5 cloves garlic",
      "Thinly slice 1 medium onion",
      "Thinly Slice 8 pieces tomaotes",
      "Pour canola oil in a fry pan",
      "Heat oil in a pan.",
      "Fry dried fish (Tuyo) for about 2-3 mins.",
      "Remove & drain oil in paper towel.",
      "Pour 2 tbsp. Canola Oil in a fry pan",
      "Saute garlic until light brown.",
      "Add in sliced Onion & saute until softened.",
      "Add in sliced Tomatoes & saute until mushy.",
      "Add ¼ tsp. Black Pepper and ¼ tsp. Seasoning Granules",
      "Pour 8 tbsp. Water and 3 tbsp. Vinegar",
      "Add 2 tsp. White Sugar",
      "Add more water, vinegar & seasoning to taste.",
      "Add in fried dried fish & let it simmer for 3 mins.",
      "Sarciadong Tuyo is ready to serve!",
      "Serve with steamed white Rice & Scrambled Eggs.",
      "This recipe is good for three people."
    ],
    method: "",
    nutrition: {
      calories: 300,
      protein: 15,
      carbs: 16
    },
    substitutions: [
      ""
    ],
    image: "https://panlasangpinoy.com/wp-content/uploads/2014/10/Sarciadong-Daing.jpg"
  },
  /* #5 - : Ginisang Repolyo at Corned Beef */
  {
    title: "Ginisang Repolyo at Corned Beef",
    region: "",
    ingredients: [
      "2 cans 150g corned beef",
      "2 cups sliced cabbage",
      "1 small onion sliced",
      "1 clove minced garlic",
      "1 tablespoons cooking oil",
      "Salt and ground black pepper to taste"
    ],
    steps: [
      "Heat oil in a frypan then saute garlic and onion.",
      "Add corned beef, then simmer for 3 minutes.",
      "Add sliced Repolyo (cabbage), then cover and continue to simmer for 5 minutes or until cabbage are soft.",
      "Season with salt and pepper then mix.",
      "If you want it dry, just continue to simmer.",
      "Transfer to a serving dish and serve with rice."
    ],
    method: "",
    nutrition: {
      calories: 210,
      protein: 18,
      carbs: 12
    },
    substitutions: [
      ""
    ],
    image: "https://panlasangpinoy.com/wp-content/uploads/2017/07/Corned-Beef-with-Cabbage-and-Potato.jpg"
  },
  /* #6 - : Chicken Sotanghon Soup */
  {
    title: "Chicken Sotanghon Soup",
    region: "",
    ingredients: [
      "2 tbsp. Canola Oil",
      "4 cloves Garlic minced",
      "1 med. Onion sliced",
      "1 inch Ginger strips",
      "400 grams Chicken Legs quartered",
      "1/2 tsp Salt & Black Pepper",
      "1 liter Water",
      "1-1½ pcs Chicken Cubes adjust according to taste",
      "1 med. Carrot strips",
      "1 cup Cabbage sliced",
      "3.2 oz Sotanghon Vermicelli, dry or soak in water",
      "2 tbsp Atsuete Seeds or 1tbsp. Atsuete Powder",
      "3 tbsp Scallions chopped (white part)",
      "4 med Hard Boiled Eggs halves",
      "4 tbsp Fried Garlic (less or more for garnish)",
      "4 tbsp Scallions chopped (green part)"
    ],
    steps: [
      "Pour 2 tbsp Oil in a Casserole, then Heat Oil.",
      "Add 1 med. White Onion, then Saute onion until softened.",
      "Add minced Garlic, Saute until light brown.",
      "Add Chicken and continue to saute until it renders some fat & a little broth.",
      "Add ginger then saute until fragrant.",
      "Add 1/2 tsp. of Salt & Black Pepper",
      "Season with salt & pepper.",
      "Continue to saute until chicken turns lightly brown.",
      "Pour 1 Liter of Water",
      "Cover & simmer chicken for 20mins. on medium low heat.",
      "Remove any scum that floats on top.",
      "Soak 2tbsp. atsuete seeds in water or hot broth for about 5mins.",
      "Add 1 Chicken Knorr Cube and Carrot strips",
      "Simmer carrots for 2 minutes.",
      "Add 1 cup Cabbage then Simmer for another 2 minutes.",
      "Add 3.2oz of Vermicelli  glass noodles (dry or soak in water).",
      "Pour in soaked atsuete seeds through a strainer.",
      "Simmer for another 5 minutes.",
      "Next, add chopped scallions, (white part)",
      "Taste and adjust seasoning and salt according to your preference.",
      "Our Chicken  Sotanghon is done!",
      "Serve immediately while it's piping hot.",
      "Top with hard boiled egg, scallions & fried garlic.",
      "A tasty  Chicken Soup that will satisfy & give you comfort on a cold & rainy day."
    ],
    method: "",
    nutrition: {
      calories: 245,
      protein: 3,
      fat: 7.8,
      carbs: 42
    },
    substitutions: [
      ""
    ],
    image: "https://panlasangpinoy.com/wp-content/uploads/2010/10/Chicken-Sotanghon-Soup.jpg"
  },
  /* #7 - : Jollibee Style Burger Steak Recipe */
  {
    title: "Jollibee Style Burger Steak Recipe",
    region: "",
    ingredients: [
      "300 g Lean Beef & 100g Pork or 400 g Ground Beef",
      "5 tbsp. Bread Crumbs",
      "3 tbsp. Evap or Fresh Milk",
      "½ tsp. Salt & Pepper to taste",
      "2 tsp. Knorr Liquid Seasoning",
      "3 tbsp. Onion minced",
      "1 med. Egg",
      "4 tbsp. Oil for frying",
      "2 tbsp. Butter or Margarine",
      "½ cup Mushroom slices",
      "2 tbsp. Flour",
      "1¼ cups Hot Water",
      "½ cube Knorr Beef Cube",
      "¼ tsp. Black Pepper",
      "1 tsp. Soy Sauce"
    ],
    steps: [
      "~~Burger Patty~~",

"Prepare the Mixture:",
"In a large mixing bowl, combine breadcrumbs and milk.",
"Let the mixture sit for 2-3 minutes until the breadcrumbs soften.",
"Add ground beef (or a mix of beef and pork for extra flavor).",
"Season with salt, pepper, and a splash of liquid seasoning for depth.",
"Toss in finely minced onion and crack in an egg. Mix everything thoroughly until well combined.",
"Shape the Patties:",
"Divide the meat mixture into 6 equal portions. Roll each portion into a ball, then flatten it gently with your hands to form a patty.",
"Place each patty on a sheet of wax paper to prevent sticking.",
"Arrange them in a container and freeze for at least 30 minutes to firm up. (Thaw for 10-15 minutes before cooking if frozen.)",

"Cook the Patties:",
"Heat a thin layer of oil in a frying pan over medium heat. Once the oil is hot, carefully add the patties.",
"Fry for 2-3 minutes on each side or until golden brown and cooked through.",
"Avoid overcrowding the pan to ensure even cooking.",
"Remove the patties and set them aside on a plate lined with paper towels to drain excess oil.",

"~~Mushroom Gravy~~",

"Sauté the Mushrooms:",
"In the same pan, melt butter over low heat.",
"Add sliced mushrooms and sauté for 1-2 minutes until they soften and release their aroma.",
"Make the Roux:",
"Sprinkle flour over the mushrooms and stir continuously for 2 minutes to cook out the raw flour taste.",
"Create the Gravy:",
"Gradually pour in hot water while stirring constantly to prevent lumps.",
"Add a beef cube, a dash of soy sauce, and a pinch of black pepper for seasoning.",
"Let the gravy simmer for 3-4 minutes, stirring occasionally, until it thickens to your desired consistency.",
"Combine and Serve:",
"Place the cooked burger patties on a plate, pour the hot mushroom gravy over them, and serve with steamed rice.",
    ],
    method: "",
    nutrition: {
      calories: 560,
      protein: 25,
      fat: 43,
      carbs: 16
    },
    substitutions: [
      ""
    ],
    image: "https://panlasangpinoy.com/wp-content/uploads/2010/06/burger-steak-1.jpg"
  },
  /* #8 - : Adobong Pusit */
  {
    title: "Adobong Pusit",
    region: "",
    ingredients: [
"300 g Squid cleaned & Sliced",
"2 tbsp. Canola Oil",
"2 cloves Garlic minced",
"1 small Onion chopped",
"1 thumb size Ginger sliced",
"1 med. Tomato chopped",
"1½ tbsp. Soy Sauce",
"2 tbsp. Vinegar",
"1½ tbsp. Oyster Sauce",
"2 pcs. Green Chilli",
"Salt & Pepper to taste"
    ],
    steps: [
      "Clean the squid thoroughly. Remove the plastic-like cartilage and slice into thick rings.",
"Rinse well under running water, then drain completely.",
"In a pan, heat some oil over medium heat. Sauté the garlic, ginger, onions, and tomato until soft and fragrant.",
"Add the squid and cook for 1 minute over medium heat, stirring gently.",
"Pour in the seasonings (soy sauce, vinegar, and others). Let it simmer for 3 to 4 minutes without stirring too much.",
"Add the green chili. Taste and adjust with salt and pepper as needed.",
"Serve hot with rice and enjoy!"
    ],
    method: "",
    nutrition: {
      calories: 101,
      protein: 3,
      fat: 7,
      carbs: 5
    },
    substitutions: [
      "→ "
    ],
    image: "https://panlasangpinoy.com/wp-content/uploads/2019/01/adobong-pusit.jpg"
  },
  /* #9 - : Arroz A la Cubana Recipe */
  {
    title: "Arroz A la Cubana",
    region: "",
    ingredients: [
"3 tbsp. Canola Oil",
"1 med. Carrot diced",
"1 med. Potato diced",
"1 sm. Red Bell Pepper diced",
"Pinch Salt to taste",

"Meat:",
"2 tbsp. Canola Oil",
"1 med. Onion chopped",
"2 cloves Garlic minced",
"500 g Ground Beef",
"2 tbsp. Tomato Paste",
"1 tsp. Sriracha",
"1 tbsp. Soy Sauce",
"¼ cup Green Peas",
"¼ cup Raisins",
"½ cup Beef Stock",
"Salt & Pepper to taste"
    ],
    steps: [
  "Heat oil in a pan over medium heat.",
"Fry the diced carrots and potatoes for 2 to 3 minutes until lightly golden.",
"Add the bell peppers and fry for another minute.",
"Remove all the vegetables from the pan and set aside.",
"In the same pan, add a bit more oil if needed.",
"Sauté the onions and garlic until softened and fragrant.",
"Add the ground beef and cook until it turns brown.",
"Season with salt and pepper, then stir-fry to combine.",
"Mix in the tomato paste, sriracha, and soy sauce.",
"Continue to sauté until the beef is fully cooked and well coated.",
"Return the fried vegetables to the pan.",
"Add green peas and raisins, then stir everything together.",
"Pour in the beef stock and let it simmer on low heat until the liquid evaporates.",
"Do a taste test and adjust the seasoning if needed.",
"Once done, set the picadillo aside.",
"In the same pan, heat more oil and fry the saba banana slices until light brown.",
"Fry eggs sunny-side up, and sprinkle with a little salt.",
"Serve everything on a plate with warm rice, picadillo, fried bananas, and eggs."
    ],
    method: "",
    nutrition: {
      calories: 800,
      protein: 41,
      fat: 39,
      carbs: 82
    },
    substitutions: [
      ""
    ],
    image: "https://panlasangpinoy.com/wp-content/uploads/2014/10/Arroz-a-la-Cubana-7.jpg"
  },
  /* #10 - : Chili Cheese Dog */
  {
    title: "Chili Cheese Dog",
    region: "",
    ingredients: [
   " Chili Sauce:",
  "250 g Ground Beef",
"3 cloves Garlic minced",
"1 med. White Onion chopped",
"Pinch Salt & Pepper to taste",
"160 ml Water",
"2 tsp Worcestershire Sauce",
"2 tsp Chili Powder",
"200 ml Tomato Sauce",
"3 tbsp Ketchup",
"1 tbsp Honey Mustard or Mustard",
"1½ tbsp Brown Sugar",

"You also Need:",
"4 pcs Hotdogs (we used Purefoods Chicken Hotdogs)",
"4 pcs Hotdog Buns",
"½ cup Grated Cheese",
"4 tbsp Onion chopped, for topping",
"Mayo & Honey Mustard for drizzle"
    ],
    steps: [
      " Let's cook Chili con Carne:",
"Fry ground beef in a preheated pan.",
"Saute beef until brown.",
"Add chopped onion and saute.",
"Add minced garlic and saute until softened.",
"Pour in water and bring to a simmer on low heat.",
"Add more water and simmer for 3mins.",
"Season with Worcestershire Sauce and Chili Powder.",
"Pour in Tomato Sauce, Ketchup and Honey Mustard.",
"Stir and simmer for another 3mins.",
"Taste test and adjust seasoning if needed.",
"Add sugar and stir until dissolve.",
"Let's Cook Hot dog & Buns:",
"Cook hotdogs in chili sauce for 1min. on each side. Set aside.",
"Toast Hotdog Buns in a pan.",
"Assembly Chili Cheese Dogs:",
"Toasted Buns, Slice Cheese, Hotdog, Chili con Carne and more grated Cheese.",
"Top with onions and drizzle with mayo and mustard."
    ],
    method: "",
    nutrition: {
      calories: 385,
      protein: 18,
      fat: 22,
      carbs: 32
    },
    substitutions: [
      ""
    ],
    image: "https://www.pinoyrecipe.net/wp-content/uploads/2024/12/Chili-Cheese-Dogs-Recipe-683x1024.jpg"
  },
  /* #11 - : Tuna Caldereta */
  {
    title: "Tuna Caldereta",
    region: "",
    ingredients: [
      "2 cans 155g Tuna Caldereta",
"1 large Potato, cut into cubes",
"1 medium Carrots, cubed",
"1/2 cup water",
"1 medium bell pepper, sliced",
"1 small onion, sliced",
"1/8 cup fresh green peas",
"1 1/2 tbsp Tomato paste (optional)",
"1 tbsp oil",
"salt & pepper to taste"
    ],
    steps: [
      "In a saucepan over medium heat, combine potato, carrots, and water.",
"Cover saucepan and let it simmer for 8 minutes or until potato and carrots are tender, or water evaporates.",
"Add oil and onion, then add salt and pepper and mix.",
"Pour in tomato paste (optional) and century Tuna Caldereta.",
"Add remaining salt, then cover and let it simmer for 3 minutes.",
"Add bell pepper, green peas, and simmer for another minute.",
"Enjoy your Tuna Caldereta!",

"Tip: You can add a little water if you don't want a thicker sauce. "
    ],
    method: "",
    nutrition: {
      calories: 210,
      protein: 18,
      fat: 5,
      carbs: 10
    },
    substitutions: [
      ""
    ],
    image: "https://www.pinoyrecipe.net/wp-content/uploads/2020/08/Easy-Tuna-Caldereta-Recipe-360x361.jpg"
  },
  /* #12 - Creamy Pininyahang Manok */
  {
    title: "Creamy Pininyahang Manok",
    region: "",
    ingredients: [
      "650 grams Chicken Leg",
"375 grams Chicken Thigh cut into serving portions",
"2 pouches 115 grams each Pineapple Tidbits drained then reserve syrup",
"2 tbsp Ginger cut into strips",
"6 cloves Garlic crushed",
"1 large Red Onion sliced",
"1 to 2 tbsp Patis fish sauce",
"1/2 tsp Peppercorn",
"1 pc Red Bell Pepper medium sized cut into cubes",
"1 can 400ml coconut milk",
"1 tbsp Canola oil"
    ],
    steps: [
      "In a Fry Pan, add cooking oil",
"Sauté garlic",
"Sauté onion until transparent",
"Fry chicken until light brown",
"Add reserved Pineapple juice.",
"Cover and let it simmer for about 15 minutes.",
"Add 1 tablespoon of Patis",
"When it boils, add Coconut Milk",
"and simmer for another 15 minutes.",
"Stir to mix coconut milk",
"Cover and simmer for another 15 minutes",
"Add Carrots simmer for 5 minutes",
"Add Pineapple Chunks and continue to cook 5 minutes",
"Add bell pepper and remaining Patis",
"Add black pepper, stir and cook for 2 minutes.",
"Our Pininyahang Manok is now ready to serve!",
"Transfer in a bowl and serve with steamed rice and enjoy"
    ],
    method: "",
    nutrition: {
      calories: 860,
      protein: 37,
      fat: 63,
      carbs: 45
    },
    substitutions: [
      ""
    ],
    image: "https://panlasangpinoy.com/wp-content/uploads/2025/09/Creamy-pinyahang-manok.jpg"
  },
  /* #13 - Chicken Inasal */
  {
    title: "Chicken Inasal",
    region: "Negros Occidental",
    ingredients: [
      "4 pcs Chicken quarter legs",

"INASAL MARINADE:",
"8-10 pcs Calamansi",
"1/2 cup Tuba vinegar",
"1/4 cup  soy sauce",
"1 30g Sachet Oyster sauce",
"1 tsp ground pepper",
"6 cloves garlic",
"3 pcs thumbs size Ginger",

"CHICKEN OIL:",
"100 g Chicken skin/fats",
"1/4 cup Canola Oil",
"1 tbsp atsuete seeds",

"DIPPING SAUCE:",
"Spicy Sinamak",
"Toyo-Mansi",
"Siling Labuyo",

"SERVE WITH:",
"Rice & Fried Garlic"
    ],
    steps: [
      "We need to slit the chicken legs (watch the video to see how to do it)",
"Place the chicken in a baking pan or a large bowl",
"Pound Ginger using mortal and pestle",
"Pour Vinegar (Tuba is recommended for Inasal) to Chicken",
"Add soy sauce, calamansi juice, ground black pepper, crushed garlic and ginger",
"Add 1(30g) Sachet of Oyster sauce",
"You can also add Tanglad stalk but optional",
"Using gloves massage the marinade into the chicken.",
"Place in the refrigerator and Marinate for at 2 to 6 hours.",
"In a fry pan over medium heat, place fatty chicken skin and fry, turning as needed, until crisp and renders oil.",
"Then add atsuete seeds fry until the oil turns orange, remove from heat and set aside.",
"Lightly grease grill and heat over hot coals.",
"Drain chicken from marinade and scrape off any stray aromatics. Arrange chicken in a single layer over hot grates with skin side up.",
"Grill chicken for about 30 to 40 minutes, turning once or twice and basting regularly with chicken oil.",
"Remove from the grill and allow to rest for about 3 minutes. Serve hot with the remaining chicken oil, steamed rice and dipping sauce."
    ],
    method: "",
    nutrition: {
      calories: 460,
      protein: 32,
      fat: 30,
      carbs: 10
    },
    substitutions: [
      ""
    ],
    image: "https://panlasangpinoy.com/wp-content/uploads/2013/02/Inasal.jpg"
  },
  /* #14 - Corned Beef Guisado with Potato */
  {
    title: "Corned Beef Guisado with Potato",
    region: "",
    ingredients: [
      "1 med. Potato peeled & diced",
"3 tbsp. Canola Oil for frying",
"2 150g Chili Garlic Corned Beef",
"2 cloves Garlic minced",
"1 med. Onion sliced",
"A pinch Salt & Pepper to Taste"
    ],
    steps: [
      "Heat 3 tbsp. Canola Oil in a pan",
"Add into the pan 1 med. Potato",
"A pinch of Salt & Pepper, to taste",
"Fry potatoes until lightly brown & drain in paper towel.",
"Set aside.",
"Heat 1 tbsp. Canola Oil",
"2 cloves Garlic, minced 1 med. Onion, sliced",
"Saute until fragrant & softened.",
"Add 2 (150g) Chili Garlic Corned Beef in the pan",
"Saute for about 7-8 minutes.",
"Add fried potatoes and saute for another 3-4 mins.",
"Our Fried Corned Beef with Potatoes is ready to serve",
"Served it with fried rice or hash browns."
    ],
    method: "",
    nutrition: {
      calories: 290,
      protein: 15,
      fat: 20,
      carbs: 14
    },
    substitutions: [
      ""
    ],
    image: "https://panlasangpinoy.com/wp-content/uploads/2012/08/Corned-Beef-Recipe.jpg"
  },
  /* #15 - : Sarciadong Daing */
  {
    title: "Sarciadong Daing",
    region: "",
    ingredients: [
      "3 pcs Daing na Tuyo dried Fish",
"2 eggs",
"1 onion sliced",
"3 cloves garlic",
"3 large ripe tomatoes",
"4 tbsp Canola cooking oil",
"1 to 2 cups water",
"2 tbsp chopped green onions for garnish",
"2 pcs green chili",
"salt and ground black pepper"
    ],
    steps: [
      "In a bowl crack and beat 2 eggs then set aside",
"Pour 2 tbsp Canola Oil in a pan",
"Fry Daing until golden brown",
"Remove from the pan and place on a paper towel to drain excess oil",
"In a new pan pour 2 tbsp Canola Oil",
"Add garlic and saute",
"Add onion and continue to saute until onion is translucent",
"Add tomato and a pinch of black pepper then mix",
"Add a pinch of salt and 1/2 cup of water",
"Cover and cook for 3 minutes",
"Once the tomatoes are cooked you can now add daing then mix",
"Add 1/2 cup water",
"Add egg then cover and cook for 5 minutes",
"Add chili and scallions",
"Our Sarciadong Daing is now ready to Serve!"
    ],
    method: "",
    nutrition: {
      calories: 325,
      protein: 17,
      fat: 9,
      carbs: 16
    },
    substitutions: [
      ""
    ],
    image: "https://panlasangpinoy.com/wp-content/uploads/2014/10/Sarciadong-Daing-199x300.jpg"
  },
  /* #16 - Cheesy Baked Bangus */
  {
    title: "Cheesy Baked Bangus",
    region: "",
    ingredients: [
      "Boneless bangus big milkfish",
"2 pcs tomatoes chopped",
"2 pcs medium red bell pepper sliced",
"1 pc onion sliced",
"1 box 165g Melty Cheese (Quick Melt or Melt Sarap)",
"1 tbsp liquid seasoning",
"1 tbsp ground black pepper",
"1 1/2 tbsp. All-in-One Seasoning Granules",
"1/4 cup scallions chopped for garnish",

"You also need these:",
"melted butter",
"banana leaves",
"or aluminum foil if you do not have banana leaves"
    ],
    steps: [
      "Season bangus with ground black pepper and all-in-one seasoning granules",
"Massage seasoning into bangus, set aside",
"In a bowl, add tomato, onion, and pour seasoning then mix well",
"Place bangus in a large baking pan (if you do not have banana leaf you need to grease the pan with butter)",
"Spread on top marinated tomato and onion",
"Add red bell pepper",
"Sprinkle with grated  cheese and make sure to cover the whole bangus with cheese",
"Cover Bangus with banana leaf (you can also use aluminum foil)",
"~ It's time to Bake ~",

"Bake to 350 degrees oven for 20 minutes (Take note: baking time will depend on the size of your bangus)",
"Garnish with scallions",
"Our Cheesy Baked Bangus is now Ready to Serve"
    ],
    method: "baked",
    nutrition: {
      calories: 575,
      protein: 42,
      fat: 38,
      carbs: 12
    },
    substitutions: [
      ""
    ],
    image: "https://www.pinoyrecipe.net/wp-content/uploads/2011/09/Cheesy-Baked-Bangus-360x361.jpg"
  },
  /* #17 -  Beef Broccoli */
  {
    title: "Beef Broccoli",
    region: "",
    ingredients: [
      " Marinade:",
"300 g Beef Strips thin & pounded",
"2 tbsp  Soy Sauce",
"1 tbsp Sesame Oil",
"1 tbsp Corn Starch",
"1/4 tsp Black Pepper",
"360 g Broccoli trimmed & cut",
"1 tsp Salt",
"1 liter Water for boiling",
"2 cups Icy Water for soak & rinse",
"1 med Red Bell Pepper julienne",
"2 tbsp Oil for saute",

"Toppings:",
"Fried Garlic or Sesame Seeds",

"Sauce:",
"1 cup Chicken Stock or Water",
"2 tbsp Soy Sauce",
"2 tbsp Oyster Sauce",
"1 tbsp Sesame Oil",
"2 tbsp Corn Starch or Potato Starch",
"1-2 tsp Sugar",
"1/4 tsp Black Pepper to taste"
    ],
    steps: [
      "~ How to Prepare ~",
"Pond the thinly sliced 300g Beef Strips",
"In large bowl season Beef with 2tbsp. Soy Sauce, 1/4tsp. Black Pepper, 1tbsp. Corn Starch and 1tbsp. Sesame Oil",
"Massage beef to season evenly then, let it rest for at least an hour to marinate well.",

"~ For the Sauce ~",
"In another bowl combine Chicken Stock, Soy Sauce, Black Pepper and Sesame Oil",
"Add Sugar, Oyster Sauce and Corn Starch",
"Stir well until starch is fully dissolve then set aside.",

"~ How to cook the Veggies ~",
"In a pot add 1tbsp. Salt into a Liter of Water & bring to a boil on med. heat.",
"Next, when it boils add Broccoli in a boiling water.",
"In another bowl add ice cubes in 2 cups of water.",
"Blanch Broccoli for about 1-2 minutes.",
"Next, transfer Broccoli into the cold water to stop the cooking process.",
"Drain well & Set aside.",
"Heat 2 tbsp. Oil in a frying pan & saute Red Bell Pepper",
"Saute for about 2-3 minutes & remove from the pan.",

"~ Time to Stir Fry ~",
"On the same pan add 1tbsp. Oil & fry marinated Beef on a med. high heat.",
"Fry Beef for about 4-5 minutes, (We don't want to over cook it.)",
"Stir the sauce & pour onto the beef.",
"Let it simmer and stir until the sauce thickens.",
"Add the blanched Broccoli florettes.",
"Add sauteed Red Bell Peppers",
"Stir just until well blended & coated.",
"Our Stir Fried Beef Broccoli with Bell Pepper is done!",
"Garnish with Fried Garlic or Toasted Sesame Seeds.",
"This super easy to cook Beef recipe is great for your family.",
"Serve hot with steamed rice."
    ],
    method: "stir fry",
    nutrition: {
      calories: 356,
      protein: 45,
      fat: 57,
      carbs: 22
    },
    substitutions: [
      ""
    ],
    image: "https://panlasangpinoy.com/wp-content/uploads/2019/01/Beef-with-Broccoli-Panlasang-Pinoy.jpg"
  },
  /* #18 - Chicken Pastil */
  {
    title: "Chicken Pastil",
    region: "Mindanao",
    ingredients: [
      " ½ cup Canola Oil",
"2 cloves Garlic minced",
"1 med. Red Onion minced",
"350 g Chicken boiled & Shredded",
"4 tbsp  Soy Sauce",
"3 tbsp White Vinegar",
"1½ tbsp White/Brown Sugar",
"½ tsp Black Pepper",
"½ tsp Turmeric Powder optional",
"2 tbsp Margarine optional "
    ],
    steps: [
      "~ Shredded Chicken ~",
"In a pot add 1 liter of water, 1 tsp Salt and 1 tsp Black Pepper & 2 Laurel Leaves",
"Add 350g Chicken Breast Fillet",
"Boil on med. heat for about 15 mins.",
"Drain, let it cool down & shred the chicken",

"~ Let's Fry ~",
"In a fry pan pour ½ cup Oil",
"Add minced Garlic and minced Red Onion",
"Fry until translucent then add 350g shredded chicken and saute",
"Add ½tsp Black Pepper, ½tsp Turmeric & 1½tbsp Sugar",
"Add 4 tbsp soy sauce & saute",
"Add 3 tbsp vinegar & let it simmer",
"add 2 tbsp margarine (optional)",
"Fry until chicken flakes are crispy",

"~ Assemble ~",
"Originally Pastil is wrapped in Banana Leaves.",
"But I'm using a 400ml Plastic Container at the moment.",
"1/2 cup of Rice, Lettuce (optional), Tomato,",
"hard boiled Egg & 1/4 cup of Pastil",
"You can also add Cucumber",
"Serve and Enjoy! "
    ],
    method: "Fry and Boil",
    nutrition: {
      calories: 350,
      protein: 0,
      fat: 25,
      carbs: 15
    },
    substitutions: [
      ""
    ],
    image: "https://www.pinoyrecipe.net/wp-content/uploads/2022/08/Chicken-Pastil-Recipe-768x512.jpg"
  },
  /* #19 - Skinless Garlic Longganisa */
  {
    title: "Skinless Garlic Longganisa",
    region: "",
    ingredients: [
      " 500 g Ground Pork",
"¼ cup Brown Sugar",
"¼ cup Garlic minced",
"1 tbsp Oyster Sauce",
"2 tbsp Banana Ketsup",
"1 tsp Atsuete/Annatto Powder",
"1½ tsp Iodized Salt to taste",
"½ tsp Black Pepper to taste",
"1 tbsp All-Purpose Flour",
"2 tbsp Canola Oil for frying "
    ],
    steps: [
      "~ How to Prepare ~",
"Combine all the ingredient in a large bowl",
"Mix well with your clean hands until well blended",
"Rest Longganisa mixture for 30 mins.",

"~ Wrapping ~",
"I'm using a 4.5×6.5 inches Wax Paper",
"Put 1½ tbsp of the mixture & roll tightly.",
"Fold both ends to close & seal the Longganiza.",
"Refrigerate Overnight. Thaw and fry",
"(Freeze Longganisa this will last for a month)",

"~ Let's Fry ~",
"Pour 2 tbsp of oil in a pan & preheat on low medium setting.",
"Thaw & Fry Garlic Longganisa",
"Fry until golden brown",
"Smells so good! Our Garlic Longannisa is done ",
"Serve while it's hot with fried Rice & Egg",
"This recipe makes 20 pieces of Mini-Longganisa "
    ],
    method: "",
    nutrition: {
      calories: 130,
      protein: 8,
      fat: 11,
      carbs: 6
    },
    substitutions: [
      ""
    ],
    image: "https://panlasangpinoy.com/wp-content/uploads/2018/10/Skiness-Longganisa-Recipe.jpg"
  },
  /* #20 - Pork Sinigang Batwan */
  {
    title: "Pork Sinigang Batwan",
    region: "Visayas",
    ingredients: [
      "3/4 kilo Pork chop",
"10 pcs small Batuan",
"2 medium-sized tomato sliced",
"1 big onion sliced",
"4 cloves garlic minced",
"2 pcs egg plant sliced diagonally",
"2 pcs Okra sliced",
"10 pcs of string beans cut to 2 inches",
"1 medium labanos radish, cut diagonally",
"7 cups of water",
"1 bundle kangkong river spinach",
"3 pcs of green chili",
"2 pcs long red chili",
"2 pcs pork broth cubes",
"salt and black pepper to taste "
    ],
    steps: [
      " Boil pork using 2 cups of water",
"Add 1 tbsp of salt",
"This process will eliminate the scum and odor of pork",
"Boil for 3 minutes, then remove from the pot and set aside",
"In a pot add 2 tbsp of oil",
"Saute garlic and onion",
"Continue to saute until onion is translucent",
"Add tomato slices and cook for 2 minutes",
"Add pork slices",
"Add 1 tbsp of salt and ground black pepper",
"Mix well",
"Continue to cook until the fat render (about 5 minutes or more)",
"Add 5 cups of water then cover",
"When it starts to boil add Batuan",
"Cover and boil for 5 minutes",
"Add radish or labanos",
"Cover and cook for 3 minutes",
"Time to press the batuan to get more flavor from it",
"Add eggplant,string beans then cover and cook for 3 minutes",
"Add kangkong stems, okra and 2 pcs pork broth cubes then simmer for 3 minutes",
"Mix then taste it if you still need to add salt",
"Add salt to taste and add chilis then cook for 1 minute",
"Add kangkong leaves",
"Cook for another 1 minute",
"Serve hot with rice"
    ],
    method: "Boil",
    nutrition: {
      calories: 460,
      protein: 36,
      fat: 35,
      carbs: 14
    },
    substitutions: [
      ""
    ],
    image: "https://www.pinoyrecipe.net/wp-content/uploads/2022/09/Sinigang-na-Baboy-sa-Batuan-Recipe-360x361.jpg"
  },
  /* #21 - Daing na Bangus */
  {
    title: "Daing na Bangus",
    region: "",
    ingredients: [
      "1/2 kilo boneless bangus",
"1 cup vinegar",
"1 head garlic peeled and crushed",
"1/2 tbsp peppercorns cracked",
"1 tbsp salt",
"1/4 cup Canola oil",
"1 pc. tomato for garnish",
"siling labuyo + vinegar for dipping sauce "
    ],
    steps: [
      "~ How to Prepare ~",
"Let's start by marinating our Boneless Bangus",
"In a baking pan add 1 tbsp Salt, cracked black pepper, vinegar and garlic",
"Marinate for 3 hours but we recommend 8 hours",

"~ Lets Fry ~",
"Before frying drain the excess liquid using paper towels to avoid oil splatter",
"In a frying pan pour 1/4 cup Canola Oil",
"Fry until it is golden brown",
"Drain excess oil with paper towel",
"It is best served with a spiced vinegar dipping sauce",
    ],
    method: "fry",
    nutrition: {
      calories: 450,
      protein: 0,
      fat: 25,
      carbs: 0
    },
    substitutions: [
      ""
    ],
    image: "https://panlasangpinoy.com/wp-content/uploads/2016/02/daing-na-bangus-recipe-2.jpg"
  },
  /* #22 - Chicken Bistek */
  {
    title: "Chicken Bistek",
    region: "",
    ingredients: [
      "3/4 kilo Chicken drumsticks",
"1/4 cup soy sauce",
"1 medium Red onion, peeled and sliced",
"1 large White onion, peeled and sliced",
"4 cloves garlic, peeled and minced",
"1/2 teaspoon  black pepper",
"1/4 cup calamansi juice",
"3 tablespoons canola oil",
"1 cup water",
"2 tablespoons liver spread (optional) "
    ],
    steps: [
      "Wash and clean the chicken and drain.",
"In a large bowl, combine onions, garlic, peppercorns, Calamansi juice and soy sauce, then add the chicken and mix well.",
"Massage marinade into Chicken meat then marinate inside the refrigerator for about 2 hours.",
"Drain the chicken then set aside and reserve the marinade.",
"In a deep fry pan pour Canola oil then apply heat.",
"Fry chicken and Cook until chicken is lightly browned then add reserved onions and garlic from the marinade.",
"Add reserved marinade and water and bring to a boil.",
"Lower heat, cover, and simmer for 40 minutes or until chicken is cooked through.",
"Add Liver spread and cook for about 3 minutes until sauce is thickened.",
"Season with salt to taste.",
"Garnish with sliced onion rings and serve hot with rice. "
    ],
    method: "",
    nutrition: {
      calories: 478,
      protein: 40,
      fat: 322,
      carbs: 9
    },
    substitutions: [
      ""
    ],
    image: "https://panlasangpinoy.com/wp-content/uploads/2025/02/Chicken-bistek.jpg"
  },
  /* #23 -  Authentic Kansi */
  {
    title: "Authentic Kansi",
    region: "Western Visayas",
    ingredients: [
      " For Kansi:",
"1 kilo Beef Shank",
"1/4 kilo Chopped Jackfruit",
"8 pcs small Batwan fruit or",
"Batwan paste (use Batwan paste if fruit not available in your area)",
"1 bundle tanglad",
"5 to 6 cups Water",
"2 pcs medium Onion chopped",
"2 tbsp Atsuete oil",
"4 pcs finger chilis",
"1 tsp salt",
"Fish sauce according to taste",

"For Atsute oil:",
"1/2 cup Canola oil for atsuete oil",
"1/4 cup atsute oil "
    ],
    steps: [
      "~Let's prepare Atsuete Oil.~",
"1/2 cup Canola Oil",
"1/4 cup atsuete seeds",
"Let it simmer over low heat",
"Let the atsuete infuse in oil & render its color",
"simmer for 2-3 mins., fire off & let it cool down",
"strain atsuete oil & discard the seeds",
"Transfer Atsuete Oil in a bottle or",
"sealed container. Store at room temp.",

"~Let's Start Cooking Cansi~",
"In large pot add 1 kilo Beef Kansi (Osso Buco cut)",
"Pour 5 cups of water",
"Cover and bring it to a rapid boiling",
"Lower the heat to medium remove scum",
"Add onion slices, tanglad, batuan and salt",
"Cover and let it simmer for 10 minutes",
"Add langka slices, 2 tbsp Atsuete (Annatto) Oil",
"Cover again and let it simmer for 25 minutes or until langka is cooked",
"Check if langka is soft",
"Add 4 finger chilis and 2 tbsp patis",
"Cover and simmer for 3 minutes",
"Check if the meat is already tender",
"Check the taste and add more fish sauce & adjust according to your taste",
"Our Cansi is now Ready to Serve",
"Transfer in a serving bowl & pour the soup then serve immediately "
    ],
    method: "",
    nutrition: {
      calories: 650,
      protein: 55,
      fat: 30,
      carbs: 48
    },
    substitutions: [
      "batwan fruit → batwan paste"
    ],
    image: "https://www.pinoyrecipe.net/wp-content/uploads/2025/01/Savor-Bacolods-Flavor-Traditional-Kansi-Recipe-683x1024.jpg"
  },
  /* #24 - Bulanglang */
  {
    title: "Bulanglang",
    region: "Batangas Province and Southern part of Philippines",
    ingredients: [
      "1/2 cup shrimp de-veined",
"1/4 medium sized butternut squash peeled and cubed",

"1 bundle string beans sliced",
"8 pcs okra sliced",
"5 cloves garlic minced",
"1 red onion chopped",
"5 pcs tomatoes chopped",
"1 piece eggplant sliced",
"2 tablespoons  bagoong alamang",
"black pepper ground",
"4 cups water",
"Canola Oil "
    ],
    steps: [
      "On a pot add oil then, add garlic, onion and sauté for a minute;",
"Add-in tomatoes and cook until it becomes soft.",
"Add okra and string beans, eggplants then, stir fry for 2 minutes.",
"Pour in water then add the shrimps, butternut squash and bagoong, bring to a boil and simmer for 8 minutes or until vegetables are cooked.",
"Season with black pepper then serve. "
    ],
    method: "",
    nutrition: {
      calories: 120,
      protein: 8,
      fat: 10,
      carbs: 10
    },
    substitutions: [
      "Bagoong Alamang → Rufina Patis"
    ],
    image: "https://panlasangpinoy.com/wp-content/uploads/2012/01/Bulanglang.jpg"
  },
  /* #25 - Tuna Bicol Express */
  {
    title: "Tuna Bicol Express",
    region: "",
    ingredients: [
      "2 cans 155g Tuna Chunks in Oil, drained",
"1/2 cup 200ml coconut milk or coconut cream",
"2 tbsp oil",
"4 cloves garlic minced",
"1 medium onion chopped",
"1 pcs siling haba green chili, sliced",
"2 tbsp bagoong",
"Salt & pepper to taste "
    ],
    steps: [
      "Heat the pan over medium heat and add oil.",
"Saute Garlic and onion saute for one minute.",
"Then add chili, tuna drained flakes, bagoong, and saute",
"Pour half can of coconut cream or coconut milk then, let it simmer for 4 minutes.",
"Add salt and pepper to taste.",
"Simmer for two more minutes until the coconut milk is thickened.",
"Our Tuna Bicol Express is done, and it smells so good! "
    ],
    method: "",
    nutrition: {
      calories: 350,
      protein: 30,
      fat: 0,
      carbs: 8
    },
    substitutions: [
      ""
    ],
    image: "https://www.pinoyrecipe.net/wp-content/uploads/2021/05/Tuna-Bicol-Express-360x361.jpg"
  },
  /* #26 - Creamy Chicken Pastel */
  {
    title: "Creamy Chicken Pastel",
    region: "",
    ingredients: [
      " Ingredients Part 1:",
"3/4 kilo Chicken fillet sliced",

"Marinade:",
"1/2 Lemon or 5 pcs Calamansi",
"2 tbsp Soy Sauce",
"1/2 tsp Black Pepper",

"Ingredients Part 2:",
"4 tbsp Canola Oil",
"1 medium Carrot cubed",
"2 medium Potatoes cubed",
"2 pcs Chicken Sausage sliced",
"1 can Vienna Sausage sliced",
"2 tbsp butter",
"5 cloves Garlic minced",
"1 medium White Onions chopped",
"1 tbsp All-Purpose Flour",
"1 cup water",
"1 pc chicken cube",
"1/2 tsp Black Pepper",
"3 pcs dried Bay Leaves",
"1 can 115g Button Mushroom, halves",
"1/8 cup frozen green peas thawed",
"1 medium Red Bellpepper, sliced",
"12 pcs quail eggs boiled",
"1/4 cup Cheese Melts",
"Salt to taste "
    ],
    steps: [
      "Let's marinate first our chicken fillet",
"Pour 2 tbsp soy sauce and 1 tsp ground black pepper",
"Squeeze half lemon juice",
"Massage chicken to coat and absorb the marinade, then set aside.",
"Heat 2 tbsp Canola oil then fry carrots and potato",
"Fry until light brown in color",
"Fry sliced Chicken Sausage until cooked then set aside",
"Heat 2 tbsp of butter and saute garlic",
"Add onions and continue to saute until translucent in color",
"Add marinated chicken and saute cover then simmer for 10 minutes",
"Add 1 tbsp All-purpose flour",
"Add chicken sausage and 1 cup of water",
"Add 1 chicken cube, 3 bay leaves, 1 small can button mushrooms and 1/2 tsp ground pepper",
"Cover and simmer for 5 minutes",
"Add green peas, potato and carrots",
"Pour 1 cup all-purpose cream then mix",
"Simmer for 3 minutes then add bell pepper, quail eggs and 1 can vienna sausage",
"Add cheese and mix then Cover and simmer for 2 minutes",
"Test the taste, add salt according to taste",
"Our Chicken Pastel is now ready to serve"
    ],
    method: "",
    nutrition: {
      calories: 440,
      protein: 37,
      fat: 25,
      carbs: 22
    },
    substitutions: [
      ""
    ],
    image: "https://panlasangpinoy.com/wp-content/uploads/2019/09/how-to-cook-chicken-pastel-panlasang-pinoy.jpg"
  },
  /* #27 - Adobong Puti */
  {
    title: "Adobong Puti",
    region: "",
    ingredients: [
      "3/4 kilo pork belly",
"1 teaspoon salt",
"1 head garlic, crushed",
"1 medium onion, sliced",
"1 tablespoon crushed peppercorns",
"4 pcs laurel leaves",
"1 cup Vinegar",
"4 tbsp Patis (fish sauce)",
"5 tbsp canola oil "
    ],
    steps: [
      "Heat oil in a pan",
"Saute Garlic and Onion for 2 minutes",
"Add pork belly, Vinegar, Water, patis, black pepper and bay leaf",
"Cover & let it simmer over med. heat",
"Cook until the liquid evaporates, about 15 minutes",
"When the pork fat starts to render, fry until it is golden brown.",
"You can now remove this from the pan but I prefer a little bit crispy.",
"Our Adobong Puti is now ready to serve.",
"This recipe is good for for 2 to 3 person. "
    ],
    method: "",
    nutrition: {
      calories: 1300,
      protein: 25,
      fat: 130,
      carbs: 5
    },
    substitutions: [
      ""
    ],
    image: "https://www.kawalingpinoy.com/wp-content/uploads/2020/04/adobo-puti-680x510.jpg"
  },
  /* #28 - Filipino Style Chicken Curry */
  {
    title: "Filipino Style Chicken Curry",
    region: "",
    ingredients: [
      "1 kilo chicken",
"2 medium sized potatoes chopped",
"1 big carrot sliced",
"1 tbsp garlic minced",
"3 stalks celery cut into 2 inches length",
"1 medium onion chopped",
"1 small red bell pepper cut into cubes",
"2 tbsp fish sauce",
"1 cup coconut milk",
"2 tbsp curry powder",
"1 thumb ginger cut into strips",
"1 cup water "
    ],
    steps: [
      "Cut the chicken into pieces. Leave the chicken bone-in. If you prefer boneless chicken meat, then de-bone the chicken.",
"Heat up a deep pot and add the oil.",
"Fry the potato and carrots for 2 minutes  and set aside",
"Sauté Chicken together with garlic, onion and ginger.",
"When garlic is  light brown in color add fish sauce, and curry powder",
"Stir well then add water then cover the pot and lower the heat to medium and simmer until the chicken is tender.",
"Once the chicken is cooked add the red bell pepper, celery, carrot and potato then simmer for 5 minutes",
"Add the coconut milk and mix well. Simmer for another 5 minutes.",
"Serve hot with rice."
    ],
    method: "",
    nutrition: {
      calories: 480,
      protein: 32,
      fat: 38,
      carbs: 8
    },
    substitutions: [
      ""
    ],
    image: "https://panlasangpinoy.com/wp-content/uploads/2021/08/Pinoy-Style-Chicken-Curry.jpg"
  },
  /* #29 - Ginisang Munggo with Chicken */
  {
    title: "Ginisang Munggo with Chicken",
    region: "",
    ingredients: [
      "400 grams chicken thigh cut into small pieces",
"2 cups monggo or mung beans soaked in water",
"5 cups water for boiling",
"4 tablespoons Canola cooking oil",
"1 head garlic minced",
"2 pieces onions chopped",
"1 Cup or 3 pcs tomatoes diced",
"1 pc chicken broth cube",
"6 pc s Sitaw or string beans cut to 1 inch",
"1 Bunch Alugbati leaves",
"1 tsp black pepper",
"Salt to taste "
    ],
    steps: [
      "In a pan, add the Munggo or Mung bean, water and Beef cube then bring to a boil.",
"Simmer until the Munggo or Mung Bean is soft enough (about 35 to 50 minutes)",
"On a separate pan, saute the garlic,onion, and tomato then add the chicken and simmer for 5 mins",
"Add the fish sauce and simmer for about 15 minutes or until the Chicken meat is tender (Note:* If necessary, you may add water to help make the meat tender but make sure to add more time to simmer)", 
"Pour the cooked Mung beans and String Beans then simmer for 10 minutes, now add the Malabar spinach ( alugbati )",
"Add salt and pepper to taste",
"Serve hot with Fried fish or Pork. "
    ],
    method: "",
    nutrition: {
      calories: 930,
      protein: 37,
      fat: 50,
      carbs: 49
    },
    substitutions: [
      "Chiken Breast → Shrimp or Pork"
    ],
    image: "https://www.pinoyrecipe.net/wp-content/uploads/2012/03/Ginisang-Monggo-with-Chicken-360x361.jpg"
  },
  /* #30 - Utan Bisaya */
  {
    title: "Utan Bisaya",
    region: "Visayan",
    ingredients: [
      "1 cup Gabi",
"1 cup Pumpkin",
"2 pcs Sitaw",
"1 pcs Eggplant",
"3 pcs Okra",
"4 cups Water",
"1 pc small Patola",
"3 pcs fried Galunggong",
"1 sachet MAGGI® Magic Sarap® 8g",
"1/2 cup Malunggay",
"1/2 cup Alugbati "
    ],
    steps: [
      "Season galunggong with Maggi Magic Sarap, then fry it until it's golden brown.",
"Set it aside to cool while you prepare the veggies for this Utan Bisaya recipe.",
"Prepare kalabasa, gabi, sitaw, okra, talong, and patola by cubing it into pieces for boiling.",
"Flake the fried galunggong and start boiling water for your Utan Bisaya",

"~Time to cook our Utan Bisaya ~",
"In a large pan or wok pour 4 cups of water then bring it to boil",
"Put the cubed kalabasa and gabi in the boiling water and let it simmer for 5 minutes, then add the talong, sitaw, and okra.",
"Simmer for 3 another minutes then add galunggong and patola.",
"Add sachet(8g) MAGGI MAGIC SARAP and alugbati and malunggay leaves, then simmer it for 1 minute.",
"Now you're ready to enjoy this yummy dish on a rainy day"
    ],
    method: "",
    nutrition: {
      calories: 60,
      protein: 5,
      fat: 1,
      carbs: 7
    },
    substitutions: [
      ""
    ],
    image: "https://panlasangpinoy.com/wp-content/uploads/2021/06/easy-utan-bisaya.jpg"
  },
  /* #31 - Nilagang Baboy with Langka Ilonggo Version */
  {
    title: "Nilagang Baboy with Langka Ilonggo Version",
    region: "Western Visayas",
    ingredients: [
      "1 kilo Pork Chopped",
"1/4 kilo Chopped Jackfruit",
"8 pcs small Batuan fruit or Batuan paste",
"1 bundle tanglad",
"5 to 6 cups Water",
"7 cloves Garlic minced",
"2 pcs small Onion chopped",
"1 thumb size ginger",
"1 tbsp Atsuete oil",
"2 pcs pork cubes",
"2 tbsp Canola oil for frying",
"6 stems scallions",
"6 pcs chilis",
"salt according to taste "
    ],
    steps: [
      "~ How to Cook ~",
"Let's start by making Atsuete Oil.",
"Pour 1/2 cup Canola Oil",
"Add 1/4 cup atsuete seeds",
"Heat Oil until it starts to bubble",
"Let the atsuete infuse in oil & render its color",
"simmer for 2-3 mins., fire off & let it cool down",
"strain atsuete oil & discard the seeds",
"Transfer Atsuete Oil in a bottle or",
"sealed container. Store at room temp.",
"Let's start cooking Linaga na Baboy",
"Heat canola oil in a pan",
"saute minced garlic, chopped onions and sliced ginger",
"Saute until ginger is fragrant.",
"add pork then add 1/2 tbsp of salt and saute",
"Sear the Pork until light brown",
"pour 5 cups of water",
"Cover & let it bring to a rapid boiling.",
"when it starts to boil add langka",
"Add tanglad and Batuan",
"Cover again & let it boil for 5 mins.",
"add 2 pork cubes",
"Simmer for 20 minutes or until the langka is cooked",
"Add atsuete oil and mix",
"add scallions & chilis, simmer for another 3 min. "
    ],
    method: "",
    nutrition: {
      calories: 265,
      protein: 22,
      fat: 16,
      carbs: 9
    },
    substitutions: [
      ""
    ],
    image: "https://www.pinoyrecipe.net/wp-content/uploads/2021/08/Linaga-na-Baboy-Ilonggo-Dish-360x361.jpg"
  },
  /* #32 - Ginisang Corned Beef with Ampalaya and Egg */
  {
    title: "Ginisang Corned Beef with Ampalaya and Egg",
    region: "",
    ingredients: [
      "1 pcs.  bitter melon ampalaya, sliced",
"1 can 260g Corned beef",
"2 cloves garlic minced",
"1 small onion sliced",
"1 large tomato diced",
"2 large eggs beaten",
"1 can full of water",
"1/8 tbsp paprika",
"1/2 tbsp salt",
"1/4 tbsp black pepper",
"1 tbsp Oil "
    ],
    steps: [
      "Heat oil in a frypan then saute garlic and onion.",
"Add tomatoes then, add corned beef, then simmer for 3 minutes.",
"Add sliced Ampalaya and about 40ml water, then cover and continue to simmer for 5 minutes or until ampalaya are tender.",
"Beat eggs with chili powder, salt, and pepper.",
"Add beaten eggs and mix until eggs are cooked.",
"Transfer to a serving dish and serve with rice. "
    ],
    method: "",
    nutrition: {
      calories: 220,
      protein: 18,
      fat: 0,
      carbs: 10
    },
    substitutions: [
      ""
    ],
    image: "https://www.pinoyrecipe.net/wp-content/uploads/2020/05/Corned-Beef-with-Ampalaya-360x361.jpg"
  },
  /* #33 -Ginataang Tilapia */
  {
    title: "Ginataang Tilapia",
    region: "Luzon's southern part of the Bicol region.",
    ingredients: [
      "3-4 pcs or 1/2 kilo fresh Tilapia",
"1 pc large Onion, diced",
"1 tablespoon Ginger, minced",
"1/8 cup vinegar",
"2 pcs Siling Haba, sliced",
"1 tsp shrimp paste (bagoong)",
"3/4 cup kakang gata (freshly squeezed coconut milk)",
"1 tbsp. fish sauce (patis)",
"Canola Oil "
    ],
    steps: [
      "In a frying pan pour Canola oil then sauté garlic, ginger, and onions",
"Add the fish sauce and shrimp paste",
"Pour-in the Coconut milk and stir until natural oil from the coconut cream comes out",
"Add the siling haba and simmer for 2 minutes",
"Lower the heat and add the tilapia and pour vinegar",
"Cover your pan and simmer for 7 to 10 minutes",
"Serve hot with steamed rice. "
    ],
    method: "Fry",
    nutrition: {
      calories: 280,
      protein: 20,
      fat: 15,
      carbs: 5
    },
    substitutions: [
      ""
    ],
    image: "https://panlasangpinoy.com/wp-content/uploads/2019/03/ginataang-tilapia-recipe.jpg"
  },
  /* #34 - Chicken Tinola */
  {
    title: "Chicken Tinola",
    region: "",
    ingredients: [
      "3/4 kilo Chicken drumstick cut",
"2 tbsp canola oil",
"1 small onion peeled and sliced",
"3 cloves garlic minced",
"2 thumb-sized fresh ginger",
"1 cup tomato sliced",
"2 pcs chicken cubes",
"5 cups water",
"1 small green papaya cut into 2-inch wedges",
"2 cups fresh Siling Labuyo leaves",
"2 bunch of Lemongrass",
"3 pcs finger chili",
"salt and pepper to taste",
"3 tbsp fish sauce "
    ],
    steps: [
      "In a large pan, heat oil and saute' garlic, onion, and ginger and cook until ginger is fragrant.",
"Add tomato slices and cook for 3 minutes then add chicken.",
"When the chicken turned brown, add water and lemongrass.",
"Bring to a boil, skimming scum that floats on top.",
"Lower heat and simmer for about 20 minutes or until chicken is almost done.",
"Add 1 chicken cube.",
"Add papaya and Siling Haba ( chili ) and continue to simmer for an additional 5 minutes or until papaya softens but not overcooked.",
"Taste test and add another 1 chicken cube (optional).",
"Add Chilli leaves, season with  Patis and simmer for another 2 minutes then turn off the heat.",
"Serve steaming hot with plain rice. "
    ],
    method: "",
    nutrition: {
      calories: 430,
      protein: 30,
      fat: 35,
      carbs: 6
    },
    substitutions: [
      ""
    ],
    image: "https://panlasangpinoy.com/wp-content/uploads/2018/11/Classic-Chicken-Tinola.jpg"
  },
  /* #35 - Chicken Afritada */
  {
    title: "Chicken Afritada",
    region: "",
    ingredients: [
      "Set 1",
"1 kilo chicken drumstick",
"1 tablespoon salt",
"1 tablespoon ground  black pepper adjust according to taste",

"Set 2",
"2 pcs small carrots diced",
"2 pcs potatoes diced and soaked in water",
"1 head garlic minced",
"1 piece onion chopped",
"2 pcs tomato sliced",
"3 pieces small red bell peppers diced",
"3 pieces laurel leaves",
"2 cups water",
"1 pack  Tomato Sauce 200 grams",
"1 tbsp Tomato paste",
"1 tbsp Liver spread",
"1 chicken cube "
    ],
    steps: [
      "Heat oil in a skillet over medium heat.",
"Fry carrots and potatoes until edges are lightly browned. Set aside.",
"Sear chicken for 2-3 minutes each side. Remove from oil and set aside.",
"In the same skillet with oil. Saute garlic and onion until aromatic and limp.",
"Pour in the tomato sauce and 1 cup water. Turn heat to low and let it simmer for 5-10 minutes until the tomato sauce loses some of its sourness.",
"Add the chicken and ¼ - ½ cup water or as needed.",
"Season with salt. Cover and simmer for another 30-40 minutes or until the chicken are cooked through and the sauce is reduced with the oil floating on the surface.",
"Add the potatoes, carrots and bell pepper, butter, potted meat and grated cheese. Cook for another 5 minutes.",
"Transfer to a serving dish and serve with hot rice. "
    ],
    method: "",
    nutrition: {
      calories: 512,
      protein: 43,
      fat: 36,
      carbs: 10
    },
    substitutions: [
      ""
    ],
    image: "https://panlasangpinoy.com/wp-content/uploads/2018/12/Chicken-Afritada-Recipe-Panlasang-Pinoy.jpg"
  },
  /* #36 - Chicken Asado */
  {
    title: "Chicken Asado",
    region: "Pampanga and Bulacan",
    ingredients: [
      "1 kilo chicken leg part, choice cuts",
"3 medium sized potatoes cut into quarter",
"4 tablespoons calamansi or lemon juice",
"2 tablespoons soy sauce",
"1 3/4 cup tomato sauce",
"1/4 cup butter",
"1 medium onion diced",
"3 pieces dried bay leaves",
"1 teaspoon fresh ground black pepper",
"salt to taste",
"1 cup Canola cooking oil "
    ],
    steps: [
      "Sprinkle salt and ground black pepper to the chicken, then rub the ingredients and leave it for about 20 minutes.",
"Apply heat in a frying pan, pour the Canola cooking oil, then fry the chicken. When all the chicken slices are cooked, set aside.",
"In a separate frying pan, apply heat and melt the butter.",
"When the butter is fully melted, add and saute the onions until it becomes soft.",
"Add the bay leaves and saute for a minute.",
"Pour the tomato sauce, stir, then bring to a boil.",
"When it started to boil, add the soy sauce, then stir.",
"Add the sliced potatoes.",
"Add the calamansi juice and stir.",
"Cover the frying pan and simmer for 12 minutes.",
"Add the pan fried chicken slices, then mix the chicken to the sauce and simmer for another 5 minutes.",
"When the potato is already soft turn off the heat and serve while its hot. "
    ],
    method: "",
    nutrition: {
      calories: 206,
      protein: 20,
      fat: 2,
      carbs: 42
    },
    substitutions: [
      ""
    ],
    image: "https://panlasangpinoy.com/wp-content/uploads/2014/12/Chicken-Asado.jpg"
  },
  /* #37 -  Max's Style Fried Chicken */
  {
    title: "Max's Style Fried Chicken",
    region: "",
    ingredients: [
      "3 Chicken leg quarters",

"For the marinade:",
"1 tablespoon Ginger grated",
"1/2 teaspoon ground black pepper",
"3 cloves garlic minced",
"1 tablespoon salt",

"For Poaching liquid:",
"1 tbsp cracked black pepper",
"3 cloves garlic",
"1 onion quartered",
"3 bay leaves",
"salt to taste",
"water",

"For Frying:",
"Canola Cooking oil",

"For Dipping sauce:",
"5 tbsp Tomato Ketchup or",
"5 tbsp Lechon Spicy Sauce "
    ],
    steps: [
      " Prepare to Marinate:",
"Wash and clean chicken legs, then pat dry using paper towels.",
"Place the chicken legs in a large bowl, then add the garlic, ginger, salt, and ground black pepper.",
"Generously rub the spices and seasonings into the chicken meat.",
"Set aside and marinate for 3 hours to overnight.",

"Prepare Poaching Liquid:",
"In a pan, pour water, add whole black pepper, garlic cloves, onion, bay leaf, and salt to taste.",
"Tip: Make sure that the poaching liquid is salty.",
"Let it boil for 3 minutes, then add chicken.",
"Make sure the chicken is submerged in the poaching liquid.",
"Cook the chicken for 15 minutes over medium fire.",
"After 15 minutes, remove the chicken.",
"Chill to remove liquid from chicken skin so that when you fry, it will become crispy.",

"Let's Fry:",
"Before frying, make sure to pat dry chicken with a paper towel to remove the remaining moisture.",
"Add oil only halfway to the frypan.",
"Fry until the chicken skins are golden brown.",
"Remove from the pan.",
"Place on a paper towel to drain excess oil.",
"Serve with Garlic Rice and Lechon sauce or  Banana ketchup. "
    ],
    method: "",
    nutrition: {
      calories: 450,
      protein: 40,
      fat: 28,
      carbs: 15
    },
    substitutions: [
      ""
    ],
    image: "https://panlasangpinoy.com/wp-content/uploads/2009/08/maxsstylefriedchicken.jpg"
  },
  /* #38 - Creamy Bistek Tagalog */
  {
    title: "Creamy Bistek Tagalog",
    region: "",
    ingredients: [
      " For Marinade:",
"1/2 kilo beef sirloin or beef tenderloin sliced 1/4-inch thick tapa slice",
"8 tbsp Calamansi juice or lemon juice",
"1/2 cup  Soy sauce",
"3 cloves garlic sliced",
"2 large onions cut into rings",
"Cooking Bistek:",
"4 tbsp Canola cooking oil",
"1 250 ml All Purpose Cream",
"1 tsp freshly-ground pepper",
"2 large onions cut into rings",
"2 tbsp scallions sliced "
    ],
    steps: [
      "In a glass bowl mix kalamansi juice, soy sauce, and garlic. Add more soy sauce if the taste is too sour; if it's too salty, add more juice. Make sure to balance out the flavors but you can also adjust the taste near the end of cooking the beef.",
"Thinly sliced the beef into about 1/4″ strips (This is called Tapa slice when you buy the meat in the Market). We highly suggest that you pound it with a meat tenderizer, this will make the beef soft when cooked.",
"Rub the meat with the freshly-ground pepper then add the meat to soy sauce mixture and stir to let it soak up the marinade evenly. Let sit in the marinade for at least 30 minutes.",
"Heat a frying pan. Add one tablespoon of oil. Stir fry the onion rings until translucent and a tiny bit brown on the edges but still with a bit of a crunch. Remove from skillet and set aside.",
"In the same pan, heat one tablespoon of oil. Pan-fry the beef working in batches, remove after browning on both sides. When all the beef has been browned, pour the marinade into the frying pan and bring to a slow boil and simmer for a 5 minutes or until cooked through.",
"Pour the All Purpose Cream then simmer for another 5 minutes.",
"Adjust the sauce with more soy sauce or juice, or some water, to suit your taste. After adding soy sauce always let it cook a little.",
"Slide the beef slices onto a serving plate, arrange the onion rings on top.",
"Serve hot with rice. "
    ],
    method: "",
    nutrition: {
      calories: 435,
      protein: 56,
      fat: 25,
      carbs: 0
    },
    substitutions: [
      ""
    ],
    image: "https://www.pinoyrecipe.net/wp-content/uploads/2016/09/Creamy-Bistek-Tagalog-1-360x361.jpg"
  },
  /* #39 -  Lumpiang Shanghai */
  {
    title: "Magical Lumpiang Shanghai",
    region: "",
    ingredients: [
      " Filling:",
"1/2 kg Ground Pork",
"1/4 kg Ground Beef",
"1 sachet MAGGI® Magic Sarap®",
"3 tbsp Oyster Sauce",
"1/2 teaspoon ground black pepper",
"1 medium Onion minced",
"3 cloves Garlic minced",
"1/8 cup green onion",
"1 cup Carrot grated",
"1 pc Egg",

"Wrapping:",
"Lumpia Wrapper",
"1/4 cup Water",

"Frying:",
"Vegetable Oil "
    ],
    steps: [
      " Filling:",
"In a large bowl, combine ground pork, ground beef, MAGGI® Magic Sarap®, MAGGI® Oyster Sauce, garlic, onion, green onion, egg, and carrot.",
"Use your hands to Mix everything and knead the meat.",

"Wrap Lumpia:",
"Layout a few wrappers at a time on a flat surface. (See the video on how to wrap Lumpia properly)",
"Take one and place about 2 tbsp of the filling in a line down the wrapper's center.",
"Ensure the filling is no thicker than your thumb, or the wrapper will cook faster than the meat.",
"Take the bottom and top edges of the wrapper and fold them towards the center.",
"Take a left and right sides, and fold them towards the center.",
"Moisten the last edge of the wrapper to seal.",
"Now repeat using the rest of the wrappers, and have hubby or the kids help you out.",

"Fry Lumpia:",
"Heat oil in a deep-fryer then, fry four lumpia at a time depending on your frypan's size.",
"Fry for about 3 or 4 minutes, turning once.",
"Lumpia are cooked through when they float, and the wrapper is golden brown.",
"Cut in half, or serve as is with dipping sauce.",

"Dipping Sauce:",
"You can use many dipping sauces like sweet and sour sauce, soy sauce with lemon, or banana ketchup.",
"I like it with Pinakurat only, try it you'll love it. "
    ],
    method: "",
    nutrition: {
      calories: 190,
      protein: 6,
      fat: 21,
      carbs: 4
    },
    substitutions: [
      ""
    ],
    image: "https://www.pinoyrecipe.net/wp-content/uploads/2021/01/Magical-Lumpiang-Shanghai-Recipe-360x361.jpg"
  },
  /* #40 - Taba ng talangka */
  {
    title: "Taba ng talangka",
    region: "",
    ingredients: [
      "4 cups cooked rice",
"2 tbsp Canola cooking oil",
"1 tbsp chopped ginger",
"1 tbsp chopped garlic",
"1/4 cup chopped onions",
"2 tbsp taba ng talangka crab fat",
"100 g shrimp shelled and deveined",
"1/4 cup tinapa flakes",
"1/2 cup squid rings",
"3 pcs bay leaf",
"salt to taste",
"1/4 cup green peas",
"2 pcs hard boiled eggs sliced",
"scallions sliced "
    ],
    steps: [
      "Heat oil in a large frying pan or wok.",
"Saute ginger, garlic, onions until fragrant.",
"Stir in Taba ng talangka or Aligue,  shrimps, bay leaf, tinapa flakes and squid rings.",
"Cook until  seafood changes in color or for about 3 minutes.",
"Season with salt to taste.",
"Add rice and green peas. Mix well and continue to cook until rice is completely heated.",
"Garnish with sliced hard boiled eggs and scallions on top.",
"Serve immediately. "
    ],
    method: "",
    nutrition: {
      calories: 400,
      protein: 15,
      fat: 5,
      carbs: 82
    },
    substitutions: [
      ""
    ],
    image: "https://www.pinoyrecipe.net/wp-content/uploads/2013/10/Taba-ng-Talangka-Rice-Recipe.jpg"
  },
  /* #41 - Salted Egg Shrimp */
  {
    title: "Salted Egg Shrimp",
    region: "",
    ingredients: [
      "3 pcs Salted Eggs",
"300 grams Shrimp",
"3 tbsp cornstarch",
"1 tbsp oil",
"3 tbsp butter",
"2 cloves garlic, minced",
"2 chili, sliced",
"1/4 cup milk",
"salt and pepper to taste",
"scallions and chili for garnish "
    ],
    steps: [
      "~ How to Prepare ~",
"Separate salted egg yolks & discard egg whites",
"Mash well and set aside",
"Clean shrimp, devein and remove shells.",
"Mix shrimp with corn starch and egg white (optional)",

"~ Let's Cook ~",
"Heat the oil over medium heat",
"Fry shrimps (large prawns are good for this recipe)",
"Drain oil on paper towel and set aside",
"Heat oil and melt butter in a pan over low heat",
"Saute garlic",
"Add chili and salted egg yolk",
"Add milk gradually and stir well until smooth",
"Add butter",
"Add shrimps in the sauce and mix",
"Make sure to coat all the shrimps",
"Garnish with scallions and chillies",
"Perfect ulam! Serve it with steamed rice."
    ],
    method: "",
    nutrition: {
      calories: 380,
      protein: 28,
      fat: 29,
      carbs: 8
    },
    substitutions: [
      ""
    ],
    image: "https://panlasangpinoy.com/wp-content/uploads/2018/04/Salted-Egg-Prawn-Recipe.jpg"
  },
  /* #42 - Corned Beef with Repolyo */
  {
    title: "Corned Beef with Repolyo",
    region: "",
    ingredients: [
      "2 cans 150g corned beef",
"2 cups sliced cabbage",
"1 small onion sliced",
"2 cloves minced garlic",
"1 tablespoons cooking oil",
"Salt and ground black pepper to taste "
    ],
    steps: [
      "Heat oil in a frypan then saute garlic and onion.",
"Add corned beef then simmer for 3 minutes.",
"Add cabbage, then cover and continue to simmer for 5 minutes or until cabbage is soft.",
"Add salt, and ground black pepper, then stir.",
"Transfer to a serving dish and serve with rice. "
    ],
    method: "",
    nutrition: {
      calories: 175,
      protein: 10,
      fat: 9,
      carbs: 18
    },
    substitutions: [
      ""
    ],
    image: "https://www.pinoyrecipe.net/wp-content/uploads/2020/04/Corned-Beef-Repolyo-360x361.jpg"
  },
  /* #43 - Chicken Feet Adobo (Adobong Adidas) */
  {
    title: "Chicken Feet Adobo (Adobong Adidas)",
    region: "",
    ingredients: [
      "1/2 kilo chicken feet, cleaned",
"4 pieces dried chili",
"1/2 cup soy sauce",
"1 tablespoon oyster sauce",
"2 tablespoons vinegar",
"1/2 teaspoon whole peppercorn",
"1 teaspoon salt",
"1 tablespoon sugar",
"4 pieces dried bay leaves",
"5 cloves garlic crushed",
"1 cup cooking oil",
"1 1/2 cups water",
"3 tablespoons cooking oil for sauteing "
    ],
    steps: [
      "Heat frying pan and 1 cup of cooking oil.",
"Fry the chicken feet until color turns light brown then set aside.",
"On another frying pan, heat 3 tablespoons of cooking oil.",
"Saute dried chili and garlic.",
"Add-in the fried chicken feet, soy sauce, and water thenh, let it boil.",
"When it started to boil add the dried bay leaves, oyster sauce, salt, whole peppercorn, and sugar.",
"Simmer until chicken feet becomes tender, you can add water as necessary.",
"When chicken feet is tender, add vinegar and stir.  Cover and cook for another 5 minutes.",
"Turn-off stove and transfer to a serving plate, garnish with parsley. "
    ],
    method: "",
    nutrition: {
      calories: 73,
      protein: 2,
      fat: 6,
      carbs: 0
    },
    substitutions: [
      ""
    ],
    image: "https://www.pinoyrecipe.net/wp-content/uploads/2019/03/Chicken-Feet-Adodo.jpg"
  },
  /* #44 - Tinolang Manok with Malunggay */
  {
    title: "Tinolang Manok with Malunggay",
    region: "",
    ingredients: [
      "1 kilo Chicken legs choice cuts",
"1 small young papaya cut into small pieces.",
"2 tablespoons ginger crushed and sliced into strips",
"1/2 cup Malunggay leaves you can also use chili leaves",
"1 liter of water",
"3 siling haba (chili)",
"1 to 2 stalk lemongrass",
"5 garlic cloves minced",
"5 pieces of tomatoes small sized sliced ( optional )",
"1 red onion diced",
"4 tablespoons oil",
"2 tablespoons patis fish sauce",
"1 Chicken broth cube "
    ],
    steps: [
      "In a casserole, heat oil and saute' garlic, onion, tomatoes and ginger.",
"When the tomatoes are cooked, fry chicken until slightly brown.",
"Add water and lemongrass.",
"Bring to a boil, then Add papaya.",
"Cover and simmer for about 20 minutes or until chicken is tender.",
"Add Siling Haba (chili) and chicken cube then, continue to simmer for an additional 5 minutes or until papaya softens but not overcooked.",
"Season with patis or salt.",
"Add Malunggay leaves then, simmer for additional 2 minutes then, turn off the heat.",
"Serve steaming hot with plain rice. "
    ],
    method: "",
    nutrition: {
      calories: 286,
      protein: 29,
      fat: 15,
      carbs: 8.8
    },
    substitutions: [
      "Chicken → Pork",
      "Papaya → Chayote",
      "Moringa leaves → Malunggay"
    ],
    image: "https://www.pinoyrecipe.net/wp-content/uploads/2011/08/Chicken-Tinola-with-Malunggay-Recipe-320x321.jpg"
  },
  /* #45 - Stir Fried Chili Clams */
  {
    title: "Stir Fried Chili Clams",
    region: "",
    ingredients: [
      "1/2 kilo clams scrubbed and cleaned",
"2 slices ginger minced",
"2 cloves garlic minced",
"1 hot green chili thinly sliced",
"1 green onion thinly sliced",
"2 sprigs cilantro",
"2 tbsp peanut or vegetable oil",

"Chili Clam Sauce:",
"1/4 cup soup stock",
"1/4 cup ketchup",
"2 tbsp chili garlic sauce",
"1 tbsp soy sauce",
"1 tbsp palm vinegar",
"2 tsp sugar "
    ],
    steps: [
      " Clean the clams:",
"In a large container add enough water and at least 1 tablespoon of salt.  Soak the clams in for 3 hours, this process will clean the sands inside the clams.",
"Thoroughly rinse the clams in several changes of cold water, discarding any open clams.",
"Scrub the shells with a stiff brush to remove grit and rinse well. Drain the clams in a colander, shaking out the excess water and pat dry with paper towels.",

"Cooking:",
"Combine the seasoning ingredients in a bowl and set aside.",
"Heat oil in a hot wok over high heat.",
"Add ginger, garlic and chili and stir-fry for about 10 seconds until fragrant.",
"Add the clams, seasonings, green onion and cilantro and toss until well combined.",
"Cover and cook for 6-8 minutes (depending on the size of the clams).",
"Garnish and serve the clams: Stir in the scallions and pour the sauce over the clams. "
    ],
    method: "",
    nutrition: {
      calories: 189,
      protein: 5,
      fat: 21,
      carbs: 0
    },
    substitutions: [
      ""
    ],
    image: "https://www.pinoyrecipe.net/wp-content/uploads/2013/10/Chili-Clams-Singapore-Style-Recipe.jpg"
  },
  /* #46 - Shanghai Fried Rice */
  {
    title: "Shanghai Fried Rice",
    region: "",
    ingredients: [
      "1/2 kilo leftover rice",
"3 eggs",
"5 oz. peas",
"Ham",
"1/3 tsp salt",
"3 cloves Garlic",
"1 tbsp spring onions",
"White pepper optional",
"Olive oil or Canola Oil for frying "
    ],
    steps: [
      "Finely chop the garlic and slice the spring onions and ham, set aside.",
"Boil peas in a saucepan with boiling water until nearly cooked.",
"Heat a wok to medium with 1 tsp oil, fry the scrambled egg, cut into strips, set aside.",
"Reheat wok to medium high with 1 tbsp oil, saute spring onions and garlic then add rice and slowly crumble any lumps.",
"Combine together all vegetables; continue stirring until all ingredients are dispersed in the fried rice.",
"Stir in salt, white pepper and green onions, mix well.",
"Remove fried rice and serve it hot with Tapa or Skinless Longganisa or Tocino. "
    ],
    method: "",
    nutrition: {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0
    },
    substitutions: [
      ""
    ],
    image: "https://www.pinoyrecipe.net/wp-content/uploads/2018/04/Shanghai-Fried-Rice.jpg"
  },
  /* #47 - Batchoy */
  {
    title: "La Paz Batchoy",
    region: "Iloilo Province",
    ingredients: [
      "1 medium size onion quartered",
"1/2 head garlic crushed",
"1/2 tsp. shrimp paste bagoong",
"1 tbsp. peppercorns crushed",
"2 tbsp. Worcestershire sauce",
"10-12 c. beef/pork stock",
"1 tbsp. sugar",
"1 tsp.  soy sauce",
"salt to taste",
"Toppings",
"250 g. pork",
"150 g. pork liver",
"150 g. shrimps",
"1 pc. chicken breast",
"chicharon crushed",
"chopped garlic fried",
"chopped spring onion "
    ],
    steps: [
      "In a large pot, pour in 10-12 c. of stock (from boiled beef and pork bones) and add all broth ingredients and bring to a boil.",
"Reduce heat and blanch shrimp until cooked.",
"Remove shrimp from the pot, remove shell and head each shrimp, set aside.",
"Add in pork, chicken and liver in the pot, let simmer for 25 minutes or until pork, chicken and liver are tender add more stock if necessary.",
"Remove pork, chicken and liver from the pot, drain and let cool.",
"Continue simmering the broth in low heat until ready to serve, season with salt to taste.",
"Slice the pork, chicken and liver into thin strips and set aside.",
"Place noodles in serving bowl and pour strained boiling stock over the noodles. Top with pork, chicken, liver, shrimp.",
"Garnish with chicharon, spring onion and fried garlic.",
"Serve immediately. "
    ],
    method: "",
    nutrition: {
      calories: 330,
      protein: 18,
      fat: 30,
      carbs: 5
    },
    substitutions: [
      ""
    ],
    image: "https://www.pinoyrecipe.net/wp-content/uploads/2018/03/La-Paz-Batchoy-768x512.jpg"
  },
  /* #48 - Shrimp Sinigang with Cabbage */
  {
    title: "Shrimp Sinigang with Cabbage",
    region: "Visayan",
    ingredients: [
      "1 Kilo Shrimp",
"6-8 tablespoons Batuan puree or 2 pcs tamarind cubes",
"1 big Onion (diced)",
"3 big tomatoes (quartered)",
"1/4 kilo Cabbage",
"3 pieces long green pepper (Siling haba)",
"5 cups rice-wash or water",
"Salt or Patis (fish sauce) "
    ],
    steps: [
      "Boil water with onion, peppercorns, 1 tsp of salt and tomatoes for at least 15 minutes or until tomatoes are really macerated and soup is reddish already (this maximizes the flavor of tomatoes in the soup and adds sourness as well).",
"Add Batuan puree  and the Shrimp and let simmer on mid low heat for 5 minutes.",
"Add veggies and let simmer uncovered for additional 5 minutes or until veggies are done.",
"Season with Patis or fish sauce "
    ],
    method: "",
    nutrition: {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0
    },
    substitutions: [
      "Fish Sauce → Patis"
    ],
    image: "https://www.pinoyrecipe.net/wp-content/uploads/2012/05/filipino-shrimp-sinigang.jpg"
  },
  /* #49 - Egg Sarciado */
  {
    title: "Egg Sarciado",
    region: "",
    ingredients: [
      "5 pieces hard boiled eggs shell removed",
"1 piece raw egg beaten",
"3 medium plum tomato diced",
"1 medium yellow onion diced",
"3 stems scallions cut into small parts",
"2 cloves garlic minced",
"1 small red bell pepper sliced",
"1 small green bell pepper sliced",
"1½ cup water",
"1 Chicken Cube",
"1/4 tsp ground black pepper",
"1/8 tsp salt to taste",
"3 tbsp Canola cooking oil "
    ],
    steps: [
      "Heat the oil in a pan.",
"Saute the onion, garlic, tomato, and bell peppers for 3 to 5 minutes.",
"Pour-in the chicken (or vegetable) broth. Let boil.",
"Add the fish sauce and ground black pepper. Stir.",
"Pour-in the beaten egg. Stir until the egg is distributed. Continue to cook for 3 minutes more.",
"Add the chopped scallions and boiled eggs. Cook for 2 minutes,",
"Transfer to a serving bowl.",
"Garnish with Scallions on top.",
"Serve with Steam Rice "
    ],
    method: "",
    nutrition: {
      calories: 300,
      protein: 60,
      fat: 0,
      carbs: 100
    },
    substitutions: [
      ""
    ],
    image: "https://www.pinoyrecipe.net/wp-content/uploads/2017/01/Egg-Sarciado-Recipe-1-360x361.jpg"
  },
  /* #50 - Bacon and Broccoli Mushroom Soup */
  {
    title: "Bacon and Broccoli Mushroom Soup",
    region: "",
    ingredients: [
      "10 bacon strips diced",
"1 pound sliced fresh mushrooms",
"1 medium onion chopped",
"3 garlic cloves minced",
"1 quart heavy whipping cream",
"1 can 14-1/2 ounces chicken broth",
"1-1/4 cups shredded Swiss cheese",
"3 tablespoons cornstarch",
"1/2 teaspoon salt",
"1/2 teaspoon pepper",
"3 tablespoons cold water "
    ],
    steps: [
      "In a large saucepan, cook bacon over medium heat until crisp. Using a slotted spoon, remove to paper towels; drain, reserving 2 tablespoons drippings. In the drippings, saute mushrooms and onion until tender.",
"Add garlic; cook 1 minute longer. Stir in cream and broth. Gradually stir in cheese until melted.",
"In a small bowl, combine the cornstarch, salt, pepper and water until smooth.",
"Stir into soup. Bring to a boil; cook and stir for 2 minutes or until thickened.",
"Garnish with bacon."
    ],
    method: "",
    nutrition: {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0
    },
    substitutions: [
      ""
    ],
    image: "https://www.pinoyrecipe.net/wp-content/uploads/2017/02/Bacon-and-Broccoli-Mushroom-Soup-Recipe-2-300x219.jpg"
  },
  /* #51 - Garlic Butter Shrimp */
  {
    title: "Garlic Butter Shrimp",
    region: "",
    ingredients: [
      "1/4 kilo shrimp",
"2 tbsp scallions chopped for garnish",
"1/4 cup butter",
"4 tbsp garlic minced",
"1/2 tsp ground black pepper",
"1/4 tsp chili flakes optional",
"1 cup lemon or orange soda",
"salt to taste "
    ],
    steps: [
      "In a deep bowl, pour the Lemon or Orange Soda then add the shrimp.",
"Marinate the shrimp in soda for about 15 to 30 minutes.",
"Melt the butter in a frying pan and apply heat until hot enough to cook the garlic",
"Add the garlic and cook until the color turns to golden brown",
"Add the shrimp and then cook until the color turns orange.",
"Pour the remaining lemon or orange soda marinade.",
"Turn the fire to low then simmer until the liquid evaporates completely.",
"Add ground black pepper, chili flakes and salt as needed.",
"Sprinkle with scallions on top.",
"Serve hot with steamed rice or your favorite beer. "
    ],
    method: "",
    nutrition: {
      calories: 220,
      protein: 30,
      fat: 11,
      carbs: 2
    },
    substitutions: [
      ""
    ],
    image: "https://www.pinoyrecipe.net/wp-content/uploads/2017/01/Garlic-Butter-Shrimp-Recipe-320x321.jpg"
  },
  /* #52 - Sinigang na Isda sa Miso */
  {
    title: "Sinigang na Isda sa Miso",
    region: "",
    ingredients: [
      "1/2 Bansa Barracuda, cleaned and sliced",
"½ cup white Miso soybean paste",
"3 medium ripe tomatoes sliced",
"1 pack Tamarind soup powder",
"3 tablespoons fish sauce",
"3 pieces long green chilies siling pahaba",
"1 medium onion sliced",
"2 tablespoons Canola cooking oil",
"5 cups water "
    ],
    steps: [
      "In a deep cooking pot pour the Canola cooking oil then add onions then sauté for 2 minutes.",
"Add the Miso paste and then mix with the onions and cook for another 2 minutes.",
"Pour-in the Patis (fish sauce) and water, and then bring it to a boil.",
"When its boiling, add the tomatoes and tamarind soup powder then cook for another 6 minutes.",
"Add the long green chilies and fish then in a low heat simmer for 20 minutes.",
"Turn off the heat, adjust the taste by adding more Patis if needed.",
"Place in a serving bowl while its hot, then serve. "
    ],
    method: "",
    nutrition: {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0
    },
    substitutions: [
      "Barracuda → Maya-maya, Bangus, or Salmon"
    ],
    image: "https://www.pinoyrecipe.net/wp-content/uploads/2016/07/sinigang-na-isda-sa-miso-recipe-1-300x225.jpg"
  },
  /* #53 -  Sinigang na Bangus at Talbos ng Kamote */
  {
    title: "Sinigang na Bangus at Talbos ng Kamote",
    region: "",
    ingredients: [
      "1 medium size Bangus Milkfish, sliced",
"1 liter rice washing or water",
"2 pcs ripe tomatoes sliced",
"1 pc medium onion sliced",
"1 sachet Sinigang sa Sampaloc Mix",
"2 cups talbos ng kamote stems removed",
"2 pcs siling haba finger chilies",
" Patis orfish sauce, to taste "
    ],
    steps: [
      "In a deep skillet pour the rice washing and boil",
"Add tomatoes and onions, simmer for 2 minutes.",
"Add bangus and cook until white in color or about 10 minutes.",
"Add Sinigang sa Sampaloc Mix and stir.",
"Bring to a boil then ower heat and simmer while adding the talbos ng kamote.",
"Add siling haba, if you it a little more spicy cut it in to half.",
"Season with patis to taste.",
"Serve it in a bowl with steamed rice."
    ],
    method: "",
    nutrition: {
      calories: 530,
      protein: 40,
      fat: 29,
      carbs: 9
    },
    substitutions: [
      "Fish Sauce → Patis"
    ],
    image: "https://www.pinoyrecipe.net/wp-content/uploads/2016/06/Sinigang-na-Bangus-at-Talbos-ng-Kamote-Recipe.jpg"
  },
  /* #54 - Chili Mud Crab */
  {
    title: "Chili Mud Crab",
    region: "",
    ingredients: [
      "1 Kilo Mud Crab Alimango, cut in half",
"3 pieces Red chili sliced",
"4 tbsp Tomato sauce",
"1/2 cup sweet chili sauce",
"2 tbsp Hoisin sauce",
"2 tbsp Patis Fish sauce",
"2 tbsp Canola cooking oil",
"3 cloves garlic minced",
"1 thumb sized ginger minced",
"1/2 tsp sesame oil",
"1/4 cup water",
"4 pcs scallions thinly sliced crosswise "
    ],
    steps: [
      "Clean and cut the Mud crabs in half.",
"Heat a cooking pot and pour the cooking oil",
"Add in the pan the garlic, then saute.",
"Add the ginger, crushed red pepper and continue sauteing",
"Add the Mud crab (Alimango) and cook for 4 minutes",
"Add the hoisin sauce,sweet chili sauce, tomato sauce, fish sauce,and sesame oil then mix with the other ingredients",
"Pour the water and bring to a boil then simmer until the sauce is thickened.",
"Remove from fire and place on a serving dish then garnish with green onions on top.",
"Serve hot with steamed rice."
    ],
    method: "",
    nutrition: {
      calories: 390,
      protein: 32,
      fat: 15,
      carbs: 37
    },
    substitutions: [
      ""
    ],
    image: "https://www.pinoyrecipe.net/wp-content/uploads/2015/07/Spicy-Chili-Mud-Crab-Recipe.jpg"
  },
  /* #55 - Pork Guisantes */
  {
    title: "Pork Guisantes",
    region: "",
    ingredients: [
      "1/2 kilo Pork cut into strips",
"1 pc. canned sweet peas 14oz or 1 cup frozen sweet peas",
"1 large red bell pepper cut into strips",
"1 small green bell pepper cut into strips",
"3 pcs ripe tomatoes diced",
"1 cup tomato sauce",
"1 1/2 cups beef broth",
"2 cloves garlic diced",
"1 medium onion peeled and cut into cube",
"2 tbsp Canola cooking oil",
"1/2 tsp ground black pepper",
"salt to taste "
    ],
    steps: [
      "In a large pan pour Canola cooking oil, then apply heat.",
"Saute onions and garlic.",
"Add the pork and stir-fry for 5 minutes.",
"Add the diced tomatoes then stir fry for 2 minutes.",
"Pour the beef broth and let boil. Simmer until the pork is tender (about 30 minutes.)",
"Pour the tomato sauce and mix well.",
"Sprinkle black pepper and salt then stir.",
"Add the green bell pepper, red bell pepper and green peas, then cook for 5 minutes.",
"Turn the heat off, and then transfer to a serving plate.",
"Serve with steamed rice. "
    ],
    method: "",
    nutrition: {
      calories: 375,
      protein: 56,
      fat: 7,
      carbs: 12
    },
    substitutions: [
      ""
    ],
    image: "https://www.pinoyrecipe.net/wp-content/uploads/2015/06/Pork-Guisantes-by-Pinoy-Recipe-at-Iba-Pa-320x321.jpg"
  },
  /* #56 - Pork Bistek */
  {
    title: "Pork Bistek",
    region: "",
    ingredients: [
      "3/4 kilo Pork loin tapa sliced",
"1/2 cup soy sauce",
"1 tablespoon Worcestershire sauce optional",
"1 1/2 cups water",
"1/2 large white onion peeled and sliced crosswise",
"1/2 large white onion sliced into rings for garnish",
"10 small sized calamansi sliced and juiced",
"1 small sized bell pepper for garnish",
"4 cloves garlic crushed",
"3 tablespoons cooking oil",
"Salt and pepper to taste "
    ],
    steps: [
      "Let's prepare the marinade.",
"Remove the juice from Calamansi, pour it in a large pan where you will place your marinade",
"Add the Worcestershire sauce",
"Add the Soy sauce",
"Add the Garlic",
"Add freshly ground black pepper",
"Mix the marinade and add the Pork slices then refrigerate for at least 2 hours.",
"Heat the frying pan and pour the Canola Cooking oil.",
"Saute the onions, once cooked remove from the frying pan and set aside.",
"On the same frying pan, add canola oil.",
"Pan-fry both sides of the pork slices for 2 to 3 minutes or until medium brown.",
"Remove the cooked pork slices and pan-fry the remaining slices.",
"Pour the soy sauce and calamansi juice marinade into another sauce pan.",
"Add water then add the sauteed onions to the Bistek mixture.",
"Let it boil. When it starts boiling, add to the mixture the fried pork slices then mix well.",
"Simmer for 20 minutes or until the pork becomes tender(add more water if needed).",
"When the pork is already tender add the bell red pepper and the remaining onions rings.",
"Cook for 5 more minutes, you can add salt to adjust the taste. You should have some sauce in it when its done.",
"Garnish with the onion rings.",
"Transfer to a serving plate and serve with steamed rice. "
    ],
    method: "",
    nutrition: {
      calories: 300,
      protein: 40,
      fat: 10,
      carbs: 4
    },
    substitutions: [
      "Pork → Beef"
    ],
    image: "https://www.pinoyrecipe.net/wp-content/uploads/2015/06/Pork-Bistek-Recipe-360x361.jpg"
  },
  /* #57 - Chop Suey */
  {
    title: "Chop Suey",
    region: "",
    ingredients: [
      "1/4 kilo broccoli cut into florets",
"1/4 kilo cauliflower cut into florets",
"1 large carrot peeled and sliced",
"1/2 cup chicharo snow peas",
"1/4 small cabbage cut into 1-inch thick strips",
"1 cup Chinese pechay",
"1 small red bell pepper seeded and cut into small pieces",
"1 small bell pepper seeded and cut into small pieces",
"1/4 cup button mushrooms",
"1 small onion peeled and sliced",
"2 cloves garlic peeled and minced",
"1 cup chicken thigh fillets cut into 1-inch cubes",
"1 tablespoon  oyster sauce",
"½ cup chicken liver cut into 1-inch cubes",
"5 pieces baby corn halved crosswise",
"10 quail eggs hard boiled and peeled",
"1 chicken cube",
"1 cup shrimps",
"1-1/2 teaspoons corn starch",
"2 tablespoon Canola oil",
"salt and pepper to taste "
    ],
    steps: [
      "In a Large sauce pan, add 3 1/2 cups of water, 1 teaspoon salt and simmer.",
"Also prepare a bowl with water and lots of ice for your vegetable ice bath.",
"Add carrots, bell pepper, young corn and snow peas (chicharo) cook for about 2 minutes.",
"Using a slotted spoon, remove the veggies from sauce pan and place it into a bowl of ice bath.",
"Add cauliflower and broccoli to the sauce pan and cook for about 3 minutes",
"Using a slotted spoon, remove the broccoli and cauliflower from sauce pan and place it into a bowl of ice bath.",
"Dissolve the Chicken Cube using water from the poaching liquid.",
"Set aside and reserve the poaching liquid.",
"Drain vegetables from the ice bath when they are cold.",
"Pour and heat Canola oil in a wok or large sauce pan.",
"Saute onions and garlic and cook until softened.",
"Add the sliced chicken and cook for 3 minutes.",
"Add the chicken liver and continue to cook for about 2 minutes or until the liver is cooked.",
"Pour the dissolved chicken cube and mix.",
"Pour 2 cups of the reserved poaching liquid and oyster sauce.",
"Cover the pan and bring to a boil and cook for 5 minutes.",
"Add the hardboiled quail eggs and mushrooms.",
"Add the shrimp and cook for 1 minute.",
"Drain the vegetables then add to the mixture",
"Gently stir the veggies to combine, and cook for about 5 minutes.",
"Add salt and pepper.",
"Add cabbage and chinese pechay.",
"Combine 1/4 cup of cold water and corn starch in a small bowl and stir until corn starch is dissolved.",
"Add the dissolved corn starch.",
"Gently stir the Chopsuey mixture.",
"Add corn starch mixture to pan, stirring gently.",
"Cook for about 2 minutes until the sauce has thickened.",
"Season with salt and pepper to taste.",
"Remove from the sauce pan or wok and place in a serving dish. "
    ],
    method: "",
    nutrition: {
      calories: 167,
      protein: 16,
      fat: 8,
      carbs: 9.5
    },
    substitutions: [
      "Meat Broth  → Water"
    ],
    image: "https://www.pinoyrecipe.net/wp-content/uploads/2015/05/Chop-Suey-Recipe-by-PinoyRecipenet-320x321.jpg"
  },
  /* #58 -  Sinampalukang Manok */
  {
    title: "Sinampalukang Manok",
    region: "",
    ingredients: [
      "1 kilo chicken sliced into serving sizes (we used drumstick cut)",
"2 cups Kangkong river spinach",
"1 bunch Sitaw string beans",
"1 medium Eggplant sliced",
"4 small tomatoes quartered",
"1 cup Tamarind leaves young leaves if available",
"1 bunch Lemongrass tanglad",
"1 medium onion sliced",
"2 pcs. long chilli",
"1 sachet Sinigang mix",
"1 chicken cube bouillon",
"3 tbsp Patis fish sauce",
"3 tbsp Canola Cooking oil",
"4 cups water",
"salt to taste "
    ],
    steps: [
      "Pour Canola oil in a large cooking pot then apply heat.",
"Add onion and tomatoes then saute.",
"When it becomes soft, add the chicken.",
"Let the chicken cook until it turns light brown.",
"Add in the fish sauce, and the chicken cube(bouillon) then stir well.",
"Pour water and add lemongrass then cover the pot and bring it to boil.",
"When it begins to boil add the tamarind leaves and the sinigang mix powder.",
"Continue to cook until the chicken becomes tender.",
"Add the chilis, eggplant and Sitaw (string beans) then simmer for 5 minutes.",
"Add kangkong leaves and simmer for another 5 minutes.",
"You can add more Salt according to your taste.",
"Serve in a large bowl with fried fish or friend chicken. "
    ],
    method: "",
    nutrition: {
      calories: 240,
      protein: 25,
      fat: 3,
      carbs: 58
    },
    substitutions: [
      ""
    ],
    image: "https://www.pinoyrecipe.net/wp-content/uploads/2015/04/Sinampalukang-Manok-Filipino-Recipe-320x321.jpg"
  },
  /* #59 - Ginisang Baguio Beans */
  {
    title: "Ginisang Baguio Beans",
    region: "Baguio City",
    ingredients: [
      "1/2 kilo Baguio beans (green beans), sliced diagonally",
"1/4 kilo Lean ground beef or pork",
"1 medium Red Bell pepper, thinly sliced",
"1 medium onion, diced",
"2 cloves garlic, minced",
"1 medium tomato, diced",
"2 tbsp. Patis (fish sauce)",
"1/4 tsp. ground black pepper",
"Salt to taste",
"3 tablespoons Canola cooking oil "
    ],
    steps: [
      "Pour the oil in a saucepan then apply heat.",
"Add the garlic and onion then saute for 2 minutes and add the tomato, continue cooking for another 2 minutes.",
"When the tomato is already soft, add the ground pork or beef and continue to saute until the meat turns light brown.",
"Add the Baguio Beans (green Beans), ground black pepper and Patis (fish sauce), stir well, continue to saute for 3 minutes.",
"Add the sliced carrots and bell pepper then toss and continue to saute for 3 minutes.",
"Transfer to a serving plate. Serve."
    ],
    method: "",
    nutrition: {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0
    },
    substitutions: [
      ""
    ],
    image: "https://www.pinoyrecipe.net/wp-content/uploads/2015/03/ginisang-baguio-beans-recipe.jpg"
  },
  /* #60 - Linat-An */
  {
    title: "Linat-An",
    region: "Cebu and Mindanao",
    ingredients: [
      "1 kilo Pork spare ribs",
"7 pcs Sitaw(string beans), cut into 2 inches length",
"1 bunch of scallions, cut into 2 inches length",
"2 pcs medium sized Gabi(taro root), chopped",
"1 bunch of Tanglad(lemongrass), clean it well then tie it together",
"3 1/2 cups rice washing",
"2 1/2 cups Pork broth",
"1 medium sized Red bell pepper, sliced",
"1/2 teaspoon Ground  black pepper",
"Salt to taste "
    ],
    steps: [
      "Pour the Pork broth and rice washing in a large cooking pot, cover and bring to a boil.",
"When it starts to boil, add-in the onions, lemongrass, and spare ribs.",
"Simmer the soup until the pork  meat becomes tender, it will take about 1 hour.",
"Add the gabi(taro root) then simmer for another 10 minutes.",
"Add-in the Red bell pepper and Sitaw(string beans), then simmer for another 2 minutes.",
"Put-in the green onions, then black pepper and salt to taste, mix well.",
"Serve with hot steam rice. "
    ],
    method: "",
    nutrition: {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0
    },
    substitutions: [
      ""
    ],
    image: "https://www.pinoyrecipe.net/wp-content/uploads/2014/12/Linat-an-recipe.jpg"
  },
  /* #61 -Filipino Picadillo */
  {
    title: "Filipino Picadillo",
    region: "",
    ingredients: [
      "1/2 kilo Lean Ground Beef",
"1 cup of tomato sauce",
"1 cup of potatoes, cut into small cubes",
"1/2 cup carrots, cut into small cubes",
"1/2 cup Frozen green peas, thawed",
"5 cloves of garlic, crushed",
"1 medium-sized onion, minced",
"1 piece Beef cube",
"4 tbsp. Canola cooking oil",
"1/2 cup of water",
"Salt and pepper to taste "
    ],
    steps: [
      "Heat a saucepan then pour Canola cooking oil.",
"Fry the potatoes, carrots and green peas then set aside.",
"Saute garlic until the color turns light brown.",
"Add the onions then cook until the color becomes transparent.",
"Add the lean ground beef and cook until it turns light brown.",
"Add the tomato sauce and water then add the beef cube and bring it to a boil.",
"Lower the heat and let it simmer for 15 minutes.",
"Add the green peas, potatoes and carrots then mix-well then cook for another 10 minutes or until the potatoes are tender.",
"Add some salt according to your taste and ground black pepper then stir.",
"Serve with steamed rice."
    ],
    method: "",
    nutrition: {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0
    },
    substitutions: [
      ""
    ],
    image: "https://www.pinoyrecipe.net/wp-content/uploads/2015/02/picadillo-beef-recipe.jpg"
  },
  /* #62 - Stuffed Squid */
  {
    title: "Stuffed Squid",
    region: "",
    ingredients: [
      "6 medium-sized fresh squid",
"1 onion, chopped",
"6 cloves of garlic, minced",
"1/4 cup of butter, melted",
"1/2 cup of parsley, chopped",
"1 tsp. tarragon",
"1 1/2 cups of fresh shrimp, cooked and finely chopped",
"1 1/2 cups of crabmeat, cooked and finely chopped",
"1/2 cup scallions",
"1 cup of tomato sauce",
"1/2 cup of red wine",
"salt and pepper to taste "
    ],
    steps: [
      " Cook the Squid Stuffing:",
"In a frying pan add the half melted butter and saute the chopped onion then add half of the minced garlic.",
"When the Onions are soft, add chopped crabmeat, tarragon, parsley, and shrimp.",
"Mix well together all the ingredients then season with salt and pepper according to your taste.",
"Stuff the Squid and cook the Sauce:",
"Stuff the cooked filling firmly into the cleaned squids.",
"In another saucepan,apply and add the remaining butter.",
"Add the remaining garlic and the chopped scallions then saute until tender.",
"Add the red wine and the tomato sauce, bring to a boil then let it simmer for about 5 minutes.",
"Add the stuffed squid and lower the heat then let if simmer until squid are tender, it will take about 25 minutes.",
"Garnish with chopped scallions or parsley. "
    ],
    method: "",
    nutrition: {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0
    },
    substitutions: [
      ""
    ],
    image: "https://www.pinoyrecipe.net/wp-content/uploads/2015/01/stuffed-squid-with-sauce.jpg"
  },
  /* #63 - Breaded Pork Chops */
  {
    title: "Breaded Pork Chops",
    region: "",
    ingredients: [
      "1 kilo pork chops ( 4 to 5 slices )",
"2 tbsp. Seasoned Salt",
"3/4 cup Japanese Bread crumbs (Panko)",
"1/2 cup All Purpose flour",
"1 teaspoon salt",
"1 pc. Egg, beaten",
"1/2 tsp. ground black pepper",
"1 tsp. beef broth powder",
"2 cups Canola cooking oil "
    ],
    steps: [
      "Wash and Clean the Pork chops, then drain and pat dry using paper towels.",
"Rub and gently massage the seasoned salt on each Pork chop and put in a plate then place inside the fridge.",
"Allow the Pork Chops to sit for at least 1 hour.",
"Beat the egg and whisk while adding salt and pepper, then set Aside.",
"Add the all-purpose flour, Bread crumbs, and beef broth powder in a Zip lock bag then mix well to distribute the all the ingredients. Set Aside.",
"Pour cooking oil in the frying pan then apply heat.",
"Dip each Pork chop in the egg mixture, make sure that all the parts of the pork meat are covered then dredge-in bread crumbs and flour mixture.",
"In a medium heat pan-fry each pork chop, cook each side until it turns golden brown that will take about 6 minutes depending on the thickness of the Pork chop.",
"Place the cooked pork chops in a paper towel to drain the excess cooking oil.",
"Serve with your favorite dipping sauce and steamed rice. "
    ],
    method: "",
    nutrition: {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0
    },
    substitutions: [
      ""
    ],
    image: "https://www.pinoyrecipe.net/wp-content/uploads/2015/01/breaded-pork-chops-pinoy-recipe.jpg"
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


