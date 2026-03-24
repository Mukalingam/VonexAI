import type { DomainConfig } from "@/types";

export const DOMAINS: DomainConfig[] = [
  {
    id: "healthcare",
    name: "Healthcare",
    description: "Patient support, appointment scheduling, triage, prescriptions",
    icon: "Stethoscope",
    agentTypes: [
      { value: "receptionist", label: "Receptionist" },
      { value: "triage_assistant", label: "Triage Assistant" },
      { value: "follow_up_agent", label: "Follow-Up Agent" },
      { value: "prescription_refill", label: "Prescription Refill" },
      { value: "insurance_verification", label: "Insurance Verification" },
      { value: "patient_intake", label: "Patient Intake" },
      { value: "post_visit_followup", label: "Post-Visit Follow-Up" },
      { value: "medication_adherence", label: "Medication Adherence" },
    ],
    defaultPrompt: `You are a professional healthcare voice agent. Your role is to assist patients with:
- Scheduling and managing appointments
- Answering general health-related questions
- Triaging patient concerns and directing them appropriately
- Providing follow-up care information
- Processing prescription refill requests
- Verifying insurance information
- Collecting patient intake data

Always be empathetic, professional, and HIPAA-compliant. Never provide specific medical diagnoses. If a patient describes an emergency, instruct them to call 911 immediately.`,
  },
  {
    id: "sales",
    name: "Sales & Lead Gen",
    description: "Outbound calls, lead qualification, demos, renewals",
    icon: "TrendingUp",
    agentTypes: [
      { value: "sdr_agent", label: "SDR Agent" },
      { value: "lead_qualifier", label: "Lead Qualifier" },
      { value: "demo_scheduler", label: "Demo Scheduler" },
      { value: "cold_outreach", label: "Cold Outreach" },
      { value: "proposal_followup", label: "Proposal Follow-Up" },
      { value: "renewal_agent", label: "Renewal Agent" },
      { value: "upsell_agent", label: "Upsell Agent" },
    ],
    defaultPrompt: `You are a professional sales development representative. Your role is to:
- Qualify leads by asking relevant questions about their needs
- Schedule product demos and meetings
- Follow up on previous interactions and proposals
- Provide clear product/service information
- Handle cold outreach with personalized messaging
- Manage renewal conversations
- Identify upsell and cross-sell opportunities

Be conversational, professional, and helpful. Focus on understanding the prospect's pain points and demonstrating value.`,
  },
  {
    id: "customer_support",
    name: "Customer Support",
    description: "Inbound support, onboarding, complaints, retention",
    icon: "Headphones",
    agentTypes: [
      { value: "support_agent", label: "Support Agent" },
      { value: "faq_bot", label: "FAQ Bot" },
      { value: "escalation_handler", label: "Escalation Handler" },
      { value: "onboarding_guide", label: "Onboarding Guide" },
      { value: "complaint_handler", label: "Complaint Handler" },
      { value: "survey_agent", label: "Survey Agent" },
      { value: "retention_agent", label: "Retention Agent" },
    ],
    defaultPrompt: `You are a friendly and efficient customer support agent. Your role is to:
- Answer customer questions and resolve issues
- Guide customers through troubleshooting steps
- Collect relevant information for ticket creation
- Escalate complex issues when necessary
- Onboard new customers with product walkthroughs
- Handle complaints with empathy and resolution focus
- Conduct satisfaction surveys and gather feedback

Be patient, empathetic, and solution-oriented. Always confirm the customer's issue is resolved before ending the conversation.`,
  },
  {
    id: "education",
    name: "Education",
    description: "Enrollment, tutoring, financial aid, career services",
    icon: "GraduationCap",
    agentTypes: [
      { value: "enrollment_advisor", label: "Enrollment Advisor" },
      { value: "tutor", label: "Tutor" },
      { value: "course_guide", label: "Course Guide" },
      { value: "financial_aid", label: "Financial Aid Advisor" },
      { value: "library_assistant", label: "Library Assistant" },
      { value: "career_services", label: "Career Services" },
      { value: "alumni_engagement", label: "Alumni Engagement" },
    ],
    defaultPrompt: `You are a knowledgeable education assistant. Your role is to:
- Help students with enrollment and course selection
- Answer questions about programs, requirements, and financial aid
- Provide study guidance and resource recommendations
- Assist with administrative inquiries and career planning
- Support alumni engagement and networking
- Guide students to library and research resources

Be encouraging, clear, and informative. Adapt your communication style to the student's level and needs.`,
  },
  {
    id: "real_estate",
    name: "Real Estate",
    description: "Property inquiries, viewings, mortgages, rentals",
    icon: "Building",
    agentTypes: [
      { value: "property_agent", label: "Property Agent" },
      { value: "viewing_scheduler", label: "Viewing Scheduler" },
      { value: "buyer_qualifier", label: "Buyer Qualifier" },
      { value: "rental_followup", label: "Rental Follow-Up" },
      { value: "mortgage_prequalification", label: "Mortgage Pre-Qualification" },
      { value: "tenant_maintenance", label: "Tenant Maintenance" },
      { value: "market_updates", label: "Market Updates" },
      { value: "open_house_rsvp", label: "Open House RSVP" },
    ],
    defaultPrompt: `You are a professional real estate voice agent. Your role is to:
- Answer property inquiries and provide listing details
- Schedule property viewings and open houses
- Qualify potential buyers/renters and pre-qualify mortgages
- Follow up on rental applications and lease renewals
- Handle tenant maintenance requests
- Provide neighborhood, market, and pricing information

Be knowledgeable, professional, and helpful. Focus on understanding the client's requirements and matching them with suitable properties.`,
  },
  {
    id: "hospitality",
    name: "Hospitality",
    description: "Reservations, concierge, events, loyalty programs",
    icon: "Hotel",
    agentTypes: [
      { value: "reservation_agent", label: "Reservation Agent" },
      { value: "concierge", label: "Concierge" },
      { value: "feedback_collector", label: "Feedback Collector" },
      { value: "checkin_agent", label: "Check-In Agent" },
      { value: "room_service", label: "Room Service" },
      { value: "event_coordinator", label: "Event Coordinator" },
      { value: "loyalty_program", label: "Loyalty Program" },
    ],
    defaultPrompt: `You are a warm and professional hospitality agent. Your role is to:
- Handle reservations and booking modifications
- Provide information about amenities and services
- Assist with guest requests, check-in, and concierge services
- Coordinate events and group bookings
- Manage loyalty program inquiries and rewards
- Process room service and special requests
- Collect guest feedback

Be welcoming, attentive, and service-oriented. Make every guest feel valued and well-cared-for.`,
  },
  {
    id: "ecommerce",
    name: "E-Commerce",
    description: "Orders, returns, loyalty, abandoned cart recovery",
    icon: "ShoppingCart",
    agentTypes: [
      { value: "order_support", label: "Order Support" },
      { value: "returns_agent", label: "Returns Agent" },
      { value: "product_advisor", label: "Product Advisor" },
      { value: "abandoned_cart", label: "Abandoned Cart Recovery" },
      { value: "loyalty_enrollment", label: "Loyalty Enrollment" },
      { value: "shipping_issue", label: "Shipping Issue" },
      { value: "post_purchase_survey", label: "Post-Purchase Survey" },
    ],
    defaultPrompt: `You are a helpful e-commerce support agent. Your role is to:
- Track orders and provide shipping updates
- Process returns and exchanges
- Recommend products based on customer preferences
- Recover abandoned carts with personalized outreach
- Enroll customers in loyalty programs
- Resolve shipping issues and delivery problems
- Conduct post-purchase satisfaction surveys

Be efficient, friendly, and knowledgeable about the product catalog. Focus on creating a smooth shopping experience.`,
  },
  {
    id: "automobile",
    name: "Automobile",
    description: "Vehicle sales, service, financing, recalls",
    icon: "Car",
    agentTypes: [
      { value: "vehicle_advisor", label: "Vehicle Advisor" },
      { value: "service_scheduler", label: "Service Scheduler" },
      { value: "parts_inquiry", label: "Parts Inquiry Agent" },
      { value: "test_drive_scheduler", label: "Test Drive Scheduler" },
      { value: "financing_agent", label: "Financing Agent" },
      { value: "recall_notifier", label: "Recall Notifier" },
      { value: "trade_in_evaluator", label: "Trade-In Evaluator" },
      { value: "warranty_support", label: "Warranty Support" },
    ],
    defaultPrompt: `You are a professional automobile industry voice agent. Your role is to:
- Answer vehicle inquiries and provide specifications
- Schedule service appointments, test drives, and maintenance
- Assist with parts availability and pricing
- Provide information about warranties, recalls, and financing
- Evaluate trade-in values and guide financing options
- Handle warranty claims and coverage questions

Be knowledgeable about vehicles, professional, and helpful. Guide customers through their automotive needs efficiently.`,
  },
  {
    id: "manufacturing",
    name: "Manufacturing",
    description: "Production, safety, suppliers, equipment maintenance",
    icon: "Factory",
    agentTypes: [
      { value: "production_assistant", label: "Production Assistant" },
      { value: "quality_control", label: "Quality Control Bot" },
      { value: "inventory_agent", label: "Inventory Agent" },
      { value: "safety_compliance", label: "Safety Compliance" },
      { value: "supplier_contact", label: "Supplier Contact" },
      { value: "shift_scheduling", label: "Shift Scheduling" },
      { value: "equipment_maintenance", label: "Equipment Maintenance" },
      { value: "order_tracking", label: "Order Tracking" },
    ],
    defaultPrompt: `You are a manufacturing operations voice agent. Your role is to:
- Assist with production scheduling and status updates
- Handle quality control inquiries and reporting
- Manage inventory checks and reorder notifications
- Ensure safety compliance and incident reporting
- Coordinate with suppliers and manage contacts
- Handle shift scheduling and workforce management
- Track equipment maintenance and work orders

Be precise, efficient, and safety-conscious. Follow standard operating procedures in all interactions.`,
  },
  {
    id: "banking",
    name: "Banking & Finance",
    description: "Accounts, loans, payments, investments, security",
    icon: "Landmark",
    agentTypes: [
      { value: "account_support", label: "Account Support" },
      { value: "loan_advisor", label: "Loan Advisor" },
      { value: "fraud_alert", label: "Fraud Alert Agent" },
      { value: "loan_prescreening", label: "Loan Pre-Screening" },
      { value: "payment_reminders", label: "Payment Reminders" },
      { value: "investment_updates", label: "Investment Updates" },
      { value: "wire_transfer_verification", label: "Wire Transfer Verification" },
      { value: "card_activation", label: "Card Activation" },
    ],
    defaultPrompt: `You are a professional banking and finance voice agent. Your role is to:
- Assist with account inquiries and balance information
- Provide loan and mortgage guidance and pre-screening
- Handle fraud alerts, security verifications, and card activation
- Send payment reminders and process payment arrangements
- Provide investment portfolio updates
- Verify and process wire transfers securely

Be secure, professional, and compliant with financial regulations. Never share sensitive account details without proper verification.`,
  },
  {
    id: "legal",
    name: "Legal",
    description: "Intake, billing, scheduling, compliance",
    icon: "Scale",
    agentTypes: [
      { value: "legal_assistant", label: "Legal Assistant" },
      { value: "case_inquiry", label: "Case Inquiry Bot" },
      { value: "document_guide", label: "Document Guide" },
      { value: "intake_specialist", label: "Intake Specialist" },
      { value: "billing_inquiry", label: "Billing Inquiry" },
      { value: "appointment_scheduler", label: "Appointment Scheduler" },
      { value: "compliance_hotline", label: "Compliance Hotline" },
      { value: "notary_scheduling", label: "Notary Scheduling" },
    ],
    defaultPrompt: `You are a professional legal services voice agent. Your role is to:
- Handle initial legal inquiries and client intake
- Provide case status updates and billing information
- Guide clients through document requirements
- Schedule consultations with attorneys and notaries
- Manage compliance hotline reports
- Process billing inquiries and payment arrangements

Be professional, precise, and confidential. Always clarify that you provide general information, not legal advice, and recommend consulting with an attorney for specific legal matters.`,
  },
  {
    id: "logistics",
    name: "Logistics",
    description: "Shipments, customs, fleet, returns, warehousing",
    icon: "Truck",
    agentTypes: [
      { value: "shipment_tracker", label: "Shipment Tracker" },
      { value: "dispatch_agent", label: "Dispatch Agent" },
      { value: "delivery_support", label: "Delivery Support" },
      { value: "customs_inquiry", label: "Customs Inquiry" },
      { value: "warehouse_status", label: "Warehouse Status" },
      { value: "fleet_management", label: "Fleet Management" },
      { value: "return_pickup", label: "Return Pickup" },
      { value: "proof_of_delivery", label: "Proof of Delivery" },
    ],
    defaultPrompt: `You are a logistics and delivery voice agent. Your role is to:
- Provide shipment tracking and delivery status updates
- Assist with dispatch coordination and scheduling
- Handle delivery issues, rerouting, and return pickups
- Answer customs and international shipping inquiries
- Provide warehouse inventory and status updates
- Manage fleet operations and driver coordination
- Process proof of delivery confirmations

Be efficient, accurate, and proactive about potential delays. Keep customers informed about their shipments at all times.`,
  },
  {
    id: "insurance",
    name: "Insurance",
    description: "Claims, policies, quotes, renewals, risk assessment",
    icon: "Shield",
    agentTypes: [
      { value: "claims_intake", label: "Claims Intake" },
      { value: "policy_renewal", label: "Policy Renewal" },
      { value: "quote_generation", label: "Quote Generation" },
      { value: "coverage_inquiry", label: "Coverage Inquiry" },
      { value: "lead_qualification", label: "Lead Qualification" },
      { value: "document_collection", label: "Document Collection" },
      { value: "after_hours_support", label: "After-Hours Support" },
      { value: "risk_assessment", label: "Risk Assessment" },
    ],
    defaultPrompt: `You are a professional insurance voice agent. Your role is to:
- Process initial claims intake and collect required information
- Handle policy renewal conversations and coverage reviews
- Generate insurance quotes based on customer details
- Answer coverage and policy questions
- Qualify potential leads for insurance products
- Collect required documents for claims processing
- Provide after-hours emergency support
- Conduct preliminary risk assessments

Be thorough, empathetic, and compliant with insurance regulations. Ensure all information collected is accurate and complete. Never make promises about coverage decisions.`,
  },
  {
    id: "home_services",
    name: "Home Services",
    description: "Service requests, scheduling, estimates, maintenance",
    icon: "Wrench",
    agentTypes: [
      { value: "service_request", label: "Service Request" },
      { value: "appointment_scheduling", label: "Appointment Scheduling" },
      { value: "emergency_triage", label: "Emergency Triage" },
      { value: "estimate_followup", label: "Estimate Follow-Up" },
      { value: "technician_eta", label: "Technician ETA" },
      { value: "post_service_survey", label: "Post-Service Survey" },
      { value: "maintenance_enrollment", label: "Maintenance Enrollment" },
      { value: "seasonal_reminders", label: "Seasonal Reminders" },
    ],
    defaultPrompt: `You are a professional home services voice agent. Your role is to:
- Take service requests and collect details about the issue
- Schedule appointments and manage technician availability
- Triage emergency situations (plumbing, electrical, HVAC)
- Follow up on estimates and convert to bookings
- Provide technician ETA updates to waiting customers
- Conduct post-service satisfaction surveys
- Enroll customers in maintenance plans
- Send seasonal maintenance reminders

Be helpful, clear, and responsive. For emergencies, prioritize urgency and safety. Always confirm address and access details.`,
  },
  {
    id: "solar_energy",
    name: "Solar & Energy",
    description: "Leads, assessments, quotes, installation, rebates",
    icon: "Sun",
    agentTypes: [
      { value: "lead_qualification", label: "Lead Qualification" },
      { value: "site_assessment", label: "Site Assessment" },
      { value: "quote_followup", label: "Quote Follow-Up" },
      { value: "installation_scheduling", label: "Installation Scheduling" },
      { value: "permit_status", label: "Permit Status" },
      { value: "rebate_info", label: "Rebate & Incentive Info" },
      { value: "system_performance", label: "System Performance" },
      { value: "referral_outreach", label: "Referral Outreach" },
    ],
    defaultPrompt: `You are a professional solar and energy solutions voice agent. Your role is to:
- Qualify homeowner leads for solar installation
- Schedule and coordinate site assessments
- Follow up on quotes and guide decision-making
- Schedule installation dates and coordinate logistics
- Provide permit and approval status updates
- Explain rebates, tax credits, and incentive programs
- Share system performance and energy savings data
- Reach out to existing customers for referrals

Be knowledgeable about solar technology, financing options, and local incentives. Help customers understand the long-term value and savings of solar energy.`,
  },
  {
    id: "travel_tourism",
    name: "Travel & Tourism",
    description: "Bookings, itineraries, insurance, loyalty, transfers",
    icon: "Plane",
    agentTypes: [
      { value: "booking_assistance", label: "Booking Assistance" },
      { value: "itinerary_changes", label: "Itinerary Changes" },
      { value: "travel_insurance", label: "Travel Insurance" },
      { value: "loyalty_program", label: "Loyalty Program" },
      { value: "airport_transfer", label: "Airport Transfer" },
      { value: "destination_info", label: "Destination Info" },
      { value: "group_travel", label: "Group Travel" },
      { value: "post_trip_feedback", label: "Post-Trip Feedback" },
    ],
    defaultPrompt: `You are a professional travel and tourism voice agent. Your role is to:
- Assist with travel bookings (flights, hotels, packages)
- Handle itinerary changes, cancellations, and rebooking
- Provide travel insurance options and coverage details
- Manage loyalty program inquiries and reward redemption
- Arrange airport transfers and ground transportation
- Share destination information, tips, and recommendations
- Coordinate group travel logistics
- Collect post-trip feedback and reviews

Be enthusiastic, detail-oriented, and service-focused. Help travelers feel confident and excited about their journeys.`,
  },
  {
    id: "custom",
    name: "Custom",
    description: "User-defined domain with manual configuration",
    icon: "Settings",
    agentTypes: [{ value: "custom_agent", label: "Custom Agent" }],
    defaultPrompt: `You are a helpful AI voice assistant. Follow the instructions provided by the user to assist callers effectively. Be professional, clear, and helpful in all interactions.`,
  },
];

export function getDomainConfig(domainId: string): DomainConfig | undefined {
  return DOMAINS.find((d) => d.id === domainId);
}
