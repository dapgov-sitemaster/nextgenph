/* =========================================================
   NextGenPH 2026 — sectors and entries
   =========================================================
   2026 has one sector: Energy. Add the 2026 entries below, in the same format
   as data/entries-2025.js (see "HOW TO EDIT" at the top of that file), with
        sectors: ["energy"]
   While "entries" is empty, the 2026 pages say
   "Entries for 2026 will be added soon."
   Once there are entries, the 2026 card on the years page goes straight to the
   Energy entries (there is no sector page to choose from when there is only one).

   video: replace "YouTubeVideoID" with the real YouTube code (the 11 characters
   after "v=" in the link). Until then the card shows "Video coming soon".
   ========================================================= */
window.NEXTGEN_DATA = window.NEXTGEN_DATA || {};
window.NEXTGEN_DATA["2026"] = {
  year: "2026",
  sectors: [
    { id: "energy", name: "Energy", art: "Energy.png" }
  ],
  entries: [
     {
      title: "Emergency Jewelry: Kinetic-Powered Mesh Wearables for Decentralized Public Safety",
      school: "Triology's System: Far Eastern University - Alabang",
      video: "YouTubeVideoID",
      description: "A subtle, piece of jewelry (e.g. a heart-shaped pendant) with a recessed tactile micro-switch button. It uses kinetic and body-heat energy harvesting for national energy emergencies and rolling brownouts when conventional device charging fails. In an emergency or automatic activation with fall detection for incapacitated people, it uses a LoRaWAN peer-to-peer mesh network to send encrypted GPS coordinates and pre-registered medical profiles directly to municipal emergency hubs, bypassing dead cell towers.",
      sectors: ["energy"]
     },
    {
      title: "AGAP: A Decentralized LoRa-Based Platform for Resilient Government Service Access During Power and Communication Disruptions",
      school: "HORNBill InnoVEX: Leonides S. Virata Memorial School",
      video: "YouTubeVideoID",
      description: "AGAP (Alternative Government Access Platform), a decentralized emergency communication platform designed to keep essential government information and assistance accessible when conventional communication infrastructure fails. The system uses solar-powered AGAP Nodes equipped with ESP32 and GPS to create a local communication network through LoRa technology, allowing communities to send emergency reports and receive government alerts even without cellular signal or internet access.",
      sectors: ["energy"]
     },
    {
      title: "H2Operation",
      school: "Likhanda: Far Eastern University - Alabang",
      video: "YouTubeVideoID",
      description: "In this project, the idea proposes the usage of hydrogen fuel cell technology in the Philippines as an alternative energy source for the government-owned ambulances to reduce greenhouse gases, lesser mechanical services, and improve efficiency for both patients and employees. The ambulance would have a fuel cell stack installed in the engine compartment while hydrogen storage tanks would be beneath the vehicle, allowing the system to store and supply hydrogen safety. During the operation, hydrogen reacts with oxygen from the air inside the fuel cell to generate electricity which makes water and heat as its by-products. By making ambulances use hydrogen as its energy source, the Philippines can promote cleaner transportation for both parties while maintaining more reliable emergency services.",
      sectors: ["energy"]
     },
    {
      title: "In the Heat of the Tran-seat: Generation of Energy and Quality Comfort in Public Transportations via Piezo-Thermal Slip-on Cushions",
      school: "MQCInnovators: Mary the Queen College (PAMPANGA), Incorporated",
      video: "YouTubeVideoID",
      description: "The primary objective of this project is to design, develop, and evaluate the Piezo-Thermal Slip-On Cushion, a practical and cost-effective retrofit solution that transforms everyday public transit seating into a dual-purpose, energy-harvesting system. This innovation enhances the passenger commuting experience by providing ergonomic support that reduces vibration-induced fatigue. Specifically, the study aims to capture the 25mW to 120mW of mechanical pressure and body heat naturally wasted during transit, converting it into usable electrical power. For instance, by offloading mobile device charging and internal sensors from the vehicle's alternator—which traditionally consumes up to 10% of engine fuel—the system reduces mechanical engine drag and increases overall vehicle fuel efficiency. Ultimately, it provides an accessible, slip-on alternative to expensive full-fleet modernizations, supporting sustainable energy goals without placing a heavy financial burden on transport operators.",
      sectors: ["energy"]
     },
    {
      title: "Pipe Integrated Producing Electricity System (P.I.P.E.S.)",
      school: "Tam-Arise: Far Eastern University Roosevelt Marikina",
      video: "YouTubeVideoID",
      description: "This prototype resolves energy instability by using a portable water generator anchored in the Marikina River to continuously capture ordinary, daily water currents. Under standard river flow, its specialized turbine spins to generate steady electricity while simultaneously  pumping a portion of the water into an elevated storage tank mounted along the riverbank. Elevating the water acts like a mechanical battery, turning simple streamflow into stored potential energy. When additional power is needed or river flow slows down, a valve opens to let gravity drain the stored water back down through a micro-turbine. This continuous discharge ensures a stable, uninterrupted power supply for off-grid lighting and essential emergency devices. Designed with a small, modular footprint, the prototype mounts directly onto existing river embankments without major construction.",
      sectors: ["energy"]
     },
    {
      title: "PowerPal: Turning Palengke Waste into Environmentally Friendly Bio-energy",
      school: "PowerPal Girls - FEU Alabang: Far Eastern University - Alabang",
      video: "YouTubeVideoID",
      description: "PowerPal: Turning Palengke Waste into Environmentally Friendly Bio-energy Project converts biodegradable food waste from public markets into electricity using an anaerobic digestion system. The waste is broken down without oxygen to produce biogas, which is then converted into electricity for the same market, creating a closed-loop system.",
      sectors: ["energy"]
     },
    {
      title: "LAKBAY ENERHIYA",
      school: "PCC The Innovators: Pasig Catholic College",
      video: "YouTubeVideoID",
      description: "To address the energy crisis, this project proposes installing vertical-axis wind turbines on bridges. This prototype captures natural wind and the wind created by passing cars. A vertical design will be used for this model because the blades will spin regardless of the wind’s direction. To ensure constant electricity when wind is absent, a solar panel is mounted on top of the pole. This system combines wind and solar power to run the streetlight independently. To utilize the available space on the wind turbines, the LGU can use it to disseminate local traffic laws and ordinances. The LGU can also place CCTV cameras powered by the prototype to improve public safety while using renewable energy.",
      sectors: ["energy"]
     },
    {
      title: "A-GRID-CULTURE: Off-Grid Barangay Micro-Hubs & Low-Fuel LGU Food Logistics",
      school: "Bunga: Don Mariano Marcos Memorial State University - South La Union Campus",
      video: "YouTubeVideoID",
      description: "A-GRID-CULTURE is an off-grid agricultural logistics system designed to maintain food flow during a National Energy Emergency. It utilizes barangay-level micro-hubs powered by passive evaporative cooling chambers  and solar energy to preserve fresh produce with zero reliance on the electric grid. \n Farmers log their harvests using a low-bandwidth SMS network, which automatically collects produce from multiple local farms into full bulk shipments. Aggregated loads are then picked up by municipal trucks using fuel-optimized routes, directly connecting farmers to LGU Kadiwa centers and public markets. This setup bypasses commercial middlemen, protecting urban consumers from price inflation while cutting government emergency fuel usage",
      sectors: ["energy"]
     },
    {
      title: "E-LIGTAS HUB: Smart & Self-Sustaining Overpass",
      school: "E-LIgtas: National University - Lipa",
      video: "YouTubeVideoID",
      description: "E-LIGTAS HUB transforms idle urban footbridges into decentralized, self-sustaining microgrids. By turning daily commuter footsteps, passing vehicular traffic, and tropical sunlight into stored electrical power, it delivers safe, illuminated crossings and essential public charging—proving that the solution to the national energy crisis begins right beneath our feet. \n Hybrid Energy Harvesting captures continuous ambient energy using high-efficiency rooftop solar panels, while harvesting kinetic energy from pedestrian foot traffic and vehicle roadway vibrations using piezoelectric tile arrays. \n Smart Storage & Power Delivery: Integrated battery management units store captured energy to run 100% off-grid LED safety lighting and public fast-charging stations with integrated commuter seating. \n\n Eco-Resilience Integration: Employs a gravity-fed rainwater collection system that automates the irrigation of vertical plant walls, naturally cooling the pedestrian walkway and minimizing municipal water use.",
      sectors: ["energy"]
     },
    {
      title: "Project SINAG: Systematic Information Network for Auditing Government Energy",
      school: "Eveready: Manuel S. Enverga University Foundation",
      video: "YouTubeVideoID",
      description: "SINAG is a centralized software application meant to eradicate the need for energy auditing manually in government buildings. Instead of relying on a manual process, the program uses an automated pipeline that imports monthly bills via OCR technology and also collects real-time usage information from IoT smart meters. SINAG's backend uses this data to calculate a building's Energy Utilization Index (EUI), identify any unusual power usage during after-hours and automatically create forms A and B as mandated by the Department of Energy (DOE).",
      sectors: ["energy"]
     },
    {
      title: "OneHealth Naga: Organized Network for Energy-responsive Health Equity, Access, Linkage, and Triage - Naga Action for Governance and Assistance",
      school: "Sidequest Maxxers: Ateneo De Manila University",
      video: "YouTubeVideoID",
      description: "OneHealth Naga is a consultation and laboratory queuing system that lets Naga City's existing health facilities coordinate scheduling and service access as one network. The system is deliberately scoped to Non-Urgent ('Green-tag') cases under the standard three-level hospital triage classification used in Philippine facilities (Emergent, Urgent, Non-Urgent). This covers routine consultations, preventive check-ups, follow-up visits, and maintenance treatment for stable, chronic, or non-life-threatening conditions, which is the category of care indigent patients are most likely to delay or skip entirely when transport and opportunity costs rise. Its core purpose is to increase indigent residents' access to this non-urgent tier of consultations, preventive care, and maintenance treatment by directly reducing the transport costs (lost wages) and opportunity costs (lost time) that the ongoing energy crisis has exacerbated.",
      sectors: ["energy"]
     },
    {
      title: "E-Sakay: Powering Affordable and Resilient Public Transport",
      school: "I-TAKAY: Cagayan State University- Carig Campus College of Public Administration",
      video: "YouTubeVideoID",
      description: "E-SAKAY is a government-led transportation program designed to help Tuguegarao City maintain reliable public transportation during a national energy emergency by reducing the sector’s dependence on fuel-powered tricycles. The program will support the gradual transition to electric tricycles (e-trikes) through an integrated system of government financing, e-trike conversion, charging stations, and digital monitoring.",
      sectors: ["energy"]
     },
    {
      title: "RecyCo. – A Community-Driven Waste-to-Energy Cooperative",
      school: "BM²: Xavier University - Ateneo de Cagayan",
      video: "YouTubeVideoID",
      description: "Recyco is a community-driven waste-to-energy cooperative composed of households, collectors, operators, and employees. Households segregate used cooking oil, used engine oil, and organic waste through the Recyco app. Organic waste is converted into cooking gas using Recyco-provided home biogas equipment. Used cooking oil and engine oil is collected and delivered to processing partners for recovery to energy. Each waste collection is verified through QR scanning, photo proof, and GPS tracking. Households receive payment for waste collected through the Recyco E-Wallet in the app. Collectors receive performance based incentives aside from salary. Most importantly, every collection, payment, route, and delivery is stored in a digital audit trail to ensure transparency and accountability.",
      sectors: ["energy"]
     },
    {
      title: "HydRoute.AI: Grid-Independent Water Security for Energy-Resilient Barangays",
      school: "Thalassarc: Mindoro State University - Main Campus",
      video: "YouTubeVideoID",
      description: "HydRoute.AI is a low-power, ESP32-based rainwater harvesting and water quality routing system that does not depend on grid electricity to fulfill its core function. Using microcontroller-level sensors, it continuously monitors turbidity, pH, and total dissolved solids as rainwater flows from the roof, and automatically routes it through a three-tier system sending highly contaminated water to a recharge pit, moderately clean water to non-potable storage, and the cleanest water through a bio-sand and UV filter into a high-quality reserve. Because the entire sensing and routing mechanism runs on minimal power (comparable to a small IoT device rather than an electric water pump or treatment plant), households and barangays retain a functioning, self-sufficient water source even during extended power interruptions, reducing their dependency on grid-powered water infrastructure precisely when the grid itself is under strain.",
      sectors: ["energy"]
     },
  ]
};