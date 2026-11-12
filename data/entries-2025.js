/* =========================================================
   NextGenPH 2025 — sectors and entries
   =========================================================
   HOW TO EDIT
   - Add an entry: copy one { ... } block inside "entries" below, paste it after
     the last one (don't forget the comma between blocks) and change the text.
   - video: the 11-character code after "v=" in the YouTube link
            (youtube.com/watch?v=THIS_PART  or  youtu.be/THIS_PART).
   - sectors: which sector pages show the entry, e.g. ["education"].
              An entry can be in several: ["education", "energy"].
              Use ["all"] to show it in every sector.
   - Sector names/ids are listed in "sectors". The "art" file is the tile picture
     in images/sectors/ (a text tile is shown until that file exists).
   Keep the quotes, commas and brackets exactly as they are.
   ========================================================= */
window.NEXTGEN_DATA = window.NEXTGEN_DATA || {};
window.NEXTGEN_DATA["2025"] = {
  year: "2025",
  sectors: [
    { id: "education", name: "Education", art: "Education.png" },
    { id: "health-nutrition", name: "Health and Nutrition", art: "Health and Nutrition.png" },
    { id: "social-welfare", name: "Social Welfare and Protection", art: "Social Welfare and Protection.png" },
    { id: "transportation", name: "Transportation", art: "Transportation.png" },
    { id: "infrastructure", name: "Infrastructure", art: "Infrastructure.png" },
    { id: "environment", name: "Environment", art: "Environment.png" },
    { id: "tourism", name: "Tourism", art: "Tourism.png" },
    { id: "food-agriculture", name: "Food and Agriculture", art: "Food and Agriculture.png" },
    { id: "labor-employment", name: "Labor and Employment", art: "Labor and Employment.png" },
    { id: "security-justice-peace", name: "Security, Justice and Peace", art: "Security, Justice and Peace.png" },
    { id: "arts-culture-sports", name: "Arts, Culture and Sports", art: "Arts, Culture, and Sports.png" },
    { id: "energy", name: "Energy", art: "Energy.png" },
  ],
  entries: [
    {
      title: "Community Voice PH",
      school: "Amontay National High School",
      video: "fcylMub4HPI",
      description: "Community Voice PH: Boses ng Komunidad introduces a digital platform where citizens directly participate in shaping development priorities. The application uses creative innovations such as mobile accessibility, interactive project listings, and transparent voting systems to ensure that every voice is heard.",
      sectors: ["all"]
    },
    {
      title: "SENYAS: Sign Language Educational Navigator for Basic FSL Interactions",
      school: "Quezon City Science High School",
      video: "eqP_0Tz8NV8",
      description: "SENYAS, an educational language app made to teach how to communicate using the Filipino Sign Language; SENYAS will utilize Python as the programming language incorporating tools such as YOLOv5, OBS studio, and SQlite which enables features such as AI libraries, video playback, and storage for pre-existing videos respectively.",
      sectors: ["education"]
    },
    {
      title: "eSkolar: A Centralized Scholarship Management Platform for Filipino Students",
      school: "University of St. La Salle - Bacolod",
      video: "5QVBBuQlCVs",
      description: "eSkolar is an AI-powered platform that centralizes scholarship opportunities and streamlines the entire application process for both students and scholarship providers.",
      sectors: ["education"]
    },
    {
      title: "ATAY: AI Multi-Modal Tool Assessing Young Adult’s Biomarker And Factors For Metabolic Dysfunction-Associated Fatty Liver Disease (MAFLD) Risk Detection",
      school: "Quezon City Science High School",
      video: "EqKu-qwF1kI",
      description: "“ATAY” model, designed to automatically assess liver health and MAFLD risk in young adults by analyzing liver health datasets related to NAFLD such as biomarkers, demographics, lifestyle habits, and medical history.",
      sectors: ["health-nutrition"]
    },
    {
      title: "TRAC: Treatment Recording and Admission Care System for Hospitalized Patients",
      school: "Philippine Science High School - Central Visayas Campus",
      video: "rpQbmuZytQs",
      description: "TRAC is a digital prescription and medication tracking system designed strictly for admitted patients. Each patient will be provided with an ID band containing both a barcode and a QR code. The barcode will be used by healthcare workers, who can scan it with a hospital device or mobile phone to access the patient’s complete medication data, allergies, and restrictions. The QR code will be intended for patients, allowing them to quickly view their prescriptions, schedules, and dietary notes through the hospital’s website or portal.",
      sectors: ["health-nutrition"]
    },
    {
      title: "Dementra: An AI-Powered Smart Anklet and Mobile Application for Safer and Smarter Dementia Care.",
      school: "Camarines Norte State College",
      video: "trG33E5NF0s",
      description: "Demetra is an AI-powered smart anklet paired with a mobile application designed to improve the safety, monitoring, and support of individuals living with dementia and their caregivers.",
      sectors: ["health-nutrition"]
    },
    {
      title: "Nutrindahan: Empowering Farmers, Nourishing Families, and Creating Smarter Access to Nutrition",
      school: "Carlos Hilado Memorial State University",
      video: "eue5o9iA-jU",
      description: "Nutrindahan is a digital platform combining Artificial Intelligence-powered nutrition guidance, community food mapping, and virtual coaching. To ensure seamless integration and effective implementation, the Local Nutrition Office will handle the backend data management and AI model refinement, while the Local Agriculture Office, in coordination with community health workers, will manage front-line services, ensuring direct engagement with users. This collaborative approach will harmonize with existing local and national programs, such as the Philippine Plan of Action for Nutrition and the National Feeding Program.",
      sectors: ["health-nutrition"]
    },
    {
      title: "Konsulta Kiosk: Improving Healthcare Access for Patients and Providers through Telehealth and Digital Health Record Integration In Urban Communities",
      school: "Lyceum of the Philippines University - Cavite",
      video: "LiYpidkf41A",
      description: "The Konsulta Kiosk is a solar-powered telehealth booth integrated with a Digital Health Record (DHR) system, designed to act as a bridge between barangay health centers and hospitals. It decentralizes primary consultations, digitizes patient records, and links them seamlessly to higher-level care.",
      sectors: ["health-nutrition"]
    },
    {
      title: "Anthromax",
      school: "Cagayan State University - Andrews Campus",
      video: "trG33E5NF0s",
      description: "Anthromax is an all-in-one, portable briefcase that integrates essential anthropometric tools into a single, cohesive unit. This durable, hardshell case contains a fixed digital weighing scale and a collapsible height rod. The tools automatically transmit data wirelessly to a detachable, tablet-like screen, eliminating manual data entry and reducing human error.",
      sectors: ["health-nutrition"]
    },
    {
      title: "Tryci: Tricycle Hailing App",
      school: "Lucrecia R. Kasilag Senior High School",
      video: "HjojE4NV9MA",
      description: "Tryci is a barangay-partnered tricycle booking app that modernizes local public transportation. Rather than depend on tricycle terminals or face unscrupulous fares, commuters can simply reserve a tricycle via the app. When they provide pickup and destination, the app calculates the proper fare automatically using the official barangay matrix, which guarantees fairness and transparency.",
      sectors: ["transportation"]
    },
    {
      title: "Self-Cleaning Streets: Photocatalytic Coatings for Philippine Roads and Buildings",
      school: "Philippine Science High School - Zamboanga Peninsula Region Campus",
      video: "iQaGwyySB3c",
      description: "Self-Cleaning Streets: Photocatalytic Coatings for Philippine Roads and Buildings is an Urban infrastructure coating system that cleans itself and removes air pollution.",
      sectors: ["infrastructure"]
    },
    {
      title: "People's Trust Chain: Transparent Infrastructure Procurement System",
      school: "Manuel S. Enverga University",
      video: "DGajccIDnUE",
      description: "People's Trust Chain (PTC) is a comprehensive blockchain-based procurement platform that revolutionizes how DPWH manages contracts and ensures accountability through immutable record-keeping and transparent processes.",
      sectors: ["infrastructure"]
    },
    {
      title: "EMBER: ESP32-Based Mobile Bot for Emergency Response with Ceramic Fireproofing",
      school: "Quezon City Science High School",
      video: "-xpNPCAhmC8",
      description: "Ember is a wheeled device that can autonomously detect and extinguish fires. Furthermore, this device includes a siren that will flash alarming lights to guide trapped civilians to the nearest and safest exit cleared by the device.",
      sectors: ["infrastructure"]
    },
    {
      title: "Bambutech: Smart Bamboo Propagule Harvester",
      school: "Valencia National High School",
      video: "RiqlCDQNPcM",
      description: "BambuTech, an automated device designed to climb bamboo culms and cut propagules without requiring farmers to climb. The device employs eight omni-wheels, six of which are motorized in a V-shaped arrangement for vertical climbing and sideways alignment.",
      sectors: ["food-agriculture"]
    },
    {
      title: "Project Namnama: Dehydrate to Hydrate Food Security (Envisioning a More Food-Secure Philippines)",
      school: "Pines City National High School - Senior High School",
      video: "BYYMowDGva8",
      description: "Project Namnama envisions a more food-secure Philippines by teaching the communities ways of preserving and prolonging the life span of fruits and vegetables through the food processing method called dehydration.",
      sectors: ["food-agriculture"]
    },
    {
      title: "AgriChain: An Integrated Decision Support System for Sustainable Fruit and Vegetable Distribution using Predictive Analytics and Machine Learning",
      school: "West Visayas State University - Main Campus",
      video: "EHaHBd5QOuA",
      description: "AgriChain is a web and mobile‚Äìbased system built to help farmers, farm cooperatives, consumers, and government agencies work together in creating a more reliable food supply chain.",
      sectors: ["food-agriculture"]
    },
    {
      title: "PILISEED - Pili + Seed: Choose the Right Start",
      school: "Bulacan State University",
      video: "VBjdZZbs_AU",
      description: "PILISEED is a practical, low-cost combo: a solar-powered IoT sensor that measures soil pH, nutrients (ppm), moisture, temperature, humidity, and light, plus an AI-driven mobile app. The device provides instant, offline crop recommendations at the field; when connected, the mobile app syncs historical readings, runs crop-match algorithms, generates AI forecasts (time-to-harvest and success probability), and offers a contextual chatbot, “Ask PILISEED” that answers questions using the farm’s data.",
      sectors: ["food-agriculture"]
    },
    {
      title: "KITA: A low-connectivity friendly AI tool that turns MSME paper logs into smart decisions to boost rural productivity and competitiveness",
      school: "Ateneo de Manila University",
      video: "dtIfLpaQEoE",
      description: "Backed by Ateneo’s Technology Business Incubator (BUILD), KITA is the “missing-middle” layer between pen-and-paper and full ERP/CRM. It is modular, AI-assisted, and low-connectivity-tolerant, delivering the 20% of capability that moves 80% of MSME work. KITA turns paper into decisions through our framework (Capture → Compute → Decide → Connect), so micro and small operators in both the metro and rural provinces lift productivity and competitiveness without a costly system overhaul.",
      sectors: ["labor-employment"]
    },
    {
      title: "TanodPH: Bantay sa Hustisya - The Police Transparency Hub",
      school: "West Visayas State University",
      video: "ojfUfjYqML0",
      description: "TanodPH creates the Philippines’ first comprehensive Police Transparency Hub that fundamentally transforms how citizens interact with law enforcement through unprecedented access to real-time crime data, complaint tracking, and police accountability metrics.",
      sectors: ["security-justice-peace"]
    },
    {
      title: "Project Liwanag",
      school: "Catanduanes National High School",
      video: "JIS_5KrO-xM",
      description: "Project Liwanag aims to empower Filipino families, particularly those in Catanduanes, where electricity rates are among the highest in the country, by promoting sustainable living and energy awareness. The project introduces practical electricity monitoring solutions to help households manage consumption efficiently and make informed energy choices.",
      sectors: ["energy"]
    },
  ]
};
