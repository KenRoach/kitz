// ─── RenewFlow i18n Translations ───

export type Locale = "en" | "es" | "pt";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  es: "ES",
  pt: "PT",
};

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  es: "Español",
  pt: "Português",
};

// Translation keys
export interface Translations {
  // Dashboard
  goodMorning: string;
  portfolioSummary: string;
  devicesTracked: string;
  activeDevices: string;
  clients: string;
  revenueAtRisk: string;
  next90Days: string;
  tpmSavings: string;
  vsOemPrice: string;
  renewalRate: string;
  activeAlerts: string;
  viewAll: string;
  renewalPipeline: string;
  recentActivity: string;
  // Support dashboard
  opsDashboard: string;
  supportOverview: string;
  totalAssets: string;
  organizations: string;
  urgent: string;
  requireAttention: string;
  lapsed: string;
  recoveryQueue: string;
  activeQuotes: string;
  pendingApproval: string;
  // Delivery dashboard
  myDashboard: string;
  deliveryOverview: string;
  assignedPOs: string;
  awaitingFulfillment: string;
  urgentDevices: string;
  daysToExpiry: string;
  devicesInScope: string;
  acrossAllPOs: string;
  // Sidebar
  general: string;
  dashboard: string;
  inbox: string;
  alerts: string;
  sales: string;
  quoter: string;
  purchaseOrders: string;
  importAssets: string;
  operations: string;
  support: string;
  rewards: string;
  pipeline: string;
  // Pipeline page
  businessPipeline: string;
  trackRenewals: string;
  stage: string;
  discovered: string;
  quoted: string;
  approved: string;
  ordered: string;
  fulfilled: string;
  lapsedRecover: string;
  totalValue: string;
  devices: string;
  // Orders
  assignedPOsTitle: string;
  newPO: string;
  // Support
  supportTickets: string;
  serviceTickets: string;
  newTicket: string;
  // Sidebar sections (role-specific)
  overview: string;
  management: string;
  fulfillment: string;
  communication: string;
  tracking: string;
  // Sidebar labels (role-specific)
  messages: string;
  quotesReview: string;
  partnerRewards: string;
  quoteBuilder: string;
  // How it works
  howItWorks: string;
  suggestImprovement: string;
  suggestionPlaceholder: string;
  sendSuggestion: string;
  suggestionSent: string;
  suggestionThanks: string;
  // Chat
  aiConnected: string;
  thinking: string;
  messagePlaceholder: string;
  waitingPlaceholder: string;
  connectionError: string;
  // Chat quick actions
  quickExpiring: string;
  quickCritical: string;
  quickSummary: string;
  quickLapsed: string;
  promptExpiring: string;
  promptCritical: string;
  promptSummary: string;
  promptLapsed: string;
  // Settings
  settings: string;
  profileSettings: string;
  companyInfo: string;
  displayName: string;
  emailAddress: string;
  phone: string;
  companyName: string;
  timezone: string;
  language: string;
  emailSignature: string;
  notificationPrefs: string;
  emailNotifications: string;
  renewalAlerts: string;
  weeklyDigest: string;
  saveChanges: string;
  saved: string;
  // Notifications
  assetAlerts: string;
  expiringWithin30: string;
  totalDevices: string;
  // Support (dynamic subtitles)
  needAttention: string;
  ticket: string;
  tickets: string;
  // Orders
  active: string;
  totalValueLabel: string;
  // Inbox
  inboxSubtitle: string;
  // Import
  downloadTemplate: string;
  // Empty states
  noTicketsTitle: string;
  noTicketsDesc: string;
  noOrdersTitle: string;
  noOrdersDesc: string;
  noEmailsTitle: string;
  noEmailsDesc: string;
  // Inbox tabs & actions
  compose: string;
  searchEmails: string;
  all: string;
  received: string;
  sent: string;
  promos: string;
  starred: string;
  reply: string;
  // Orders
  draft: string;
  pendingApprovalStatus: string;
  submitted: string;
  acknowledged: string;
  cancelled: string;
  poPipeline: string;
  submittedToVendor: string;
  loadingPOs: string;
  noOrdersMatch: string;
  // Import
  uploadSubtitle: string;
  dropFileHere: string;
  dragDropFile: string;
  orClickBrowse: string;
  mapColumns: string;
  matchColumns: string;
  back: string;
  previewImport: string;
  importMore: string;
  goToDashboard: string;
  assetsImported: string;
  trackingMessage: string;
  required: string;
  selectColumn: string;
  // Quoter
  downloadPdf: string;
  sendQuote: string;
  newQuote: string;
  fromAssets: string;
  lineItems: string;
  totalTpm: string;
  totalOem: string;
  savings: string;
  savingsPercent: string;
  selectDevices: string;
  buildCustomQuote: string;
  // Rewards
  yourPoints: string;
  level: string;
  next: string;
  howToEarn: string;
  pointsHistory: string;
  noPointsYet: string;
  earnByClosing: string;
  rewardsSubtitle: string;
  // Pipeline extras
  totalDevicesLabel: string;
  activePipeline: string;
  inProgress: string;
  reset: string;
  searchDevices: string;
  allClients: string;
  noDevicesFound: string;
  pipelineByClient: string;
  fulfillmentPipeline: string;
  manageFulfillment: string;
  manageRenewals: string;
  // Common
  loading: string;
  darkMode: string;
  lightMode: string;
  signOut: string;
  aiChat: string;
  warrantyPlatform: string;
}

export const translations: Record<Locale, Translations> = {
  en: {
    goodMorning: "Good morning, Partner",
    portfolioSummary: "Portfolio summary",
    devicesTracked: "devices tracked",
    activeDevices: "Active Devices",
    clients: "clients",
    revenueAtRisk: "Revenue at Risk",
    next90Days: "Next 90 days",
    tpmSavings: "TPM Savings",
    vsOemPrice: "vs OEM list price",
    renewalRate: "Renewal Rate",
    activeAlerts: "Active Alerts",
    viewAll: "View all",
    renewalPipeline: "Renewal Pipeline",
    recentActivity: "Recent Activity",
    opsDashboard: "Operations Dashboard",
    supportOverview: "RenewFlow support overview",
    totalAssets: "Total Assets",
    organizations: "organizations",
    urgent: "Urgent",
    requireAttention: "Require attention",
    lapsed: "Lapsed",
    recoveryQueue: "Recovery queue",
    activeQuotes: "Active Quotes",
    pendingApproval: "Pending approval",
    myDashboard: "My Dashboard",
    deliveryOverview: "Delivery fulfillment overview",
    assignedPOs: "Assigned POs",
    awaitingFulfillment: "Awaiting fulfillment",
    urgentDevices: "Urgent Devices",
    daysToExpiry: "≤14 days to expiry",
    devicesInScope: "Devices in Scope",
    acrossAllPOs: "Across all POs",
    general: "General",
    dashboard: "Dashboard",
    inbox: "Inbox",
    alerts: "Alerts",
    sales: "Sales",
    quoter: "Rapid Quote Generator",
    purchaseOrders: "Purchase Orders",
    importAssets: "Import Assets",
    operations: "Operations",
    support: "Support",
    rewards: "My Rewards",
    pipeline: "Pipeline",
    businessPipeline: "Business Pipeline",
    trackRenewals: "Track warranty renewal progress across all stages",
    stage: "Stage",
    discovered: "Discovered",
    quoted: "Quoted",
    approved: "Approved",
    ordered: "Ordered",
    fulfilled: "Fulfilled",
    lapsedRecover: "Lapsed (recover)",
    totalValue: "Total Value",
    devices: "devices",
    assignedPOsTitle: "Assigned POs",
    newPO: "New PO",
    newTicket: "New Ticket",
    supportTickets: "Support Tickets",
    serviceTickets: "Service Tickets",
    overview: "Overview",
    management: "Management",
    fulfillment: "Fulfillment",
    communication: "Communication",
    tracking: "Tracking",
    messages: "Messages",
    quotesReview: "Quotes Review",
    partnerRewards: "Partner Rewards",
    quoteBuilder: "Quote Builder",
    howItWorks: "How does it work?",
    suggestImprovement: "Suggest an Improvement",
    suggestionPlaceholder: "Tell us how we can make RenewFlow better...",
    sendSuggestion: "Send Suggestion",
    suggestionSent: "Sent!",
    suggestionThanks: "Thanks for your feedback! We review every suggestion.",
    aiConnected: "RenewFlow AI connected. How can I help?",
    thinking: "Thinking...",
    messagePlaceholder: "Message...",
    waitingPlaceholder: "Waiting...",
    connectionError: "Connection error. Please try again.",
    quickExpiring: "{count} expiring soon",
    quickCritical: "{count} critical devices",
    quickSummary: "Portfolio summary",
    quickLapsed: "{count} lapsed",
    promptExpiring: "Which warranties are expiring in the next 30 days?",
    promptCritical: "Show me all critical tier devices and their status",
    promptSummary: "Give me a summary of my portfolio — devices, savings, and alerts",
    promptLapsed: "Which warranties have lapsed and need recovery?",
    settings: "Settings",
    profileSettings: "Profile Settings",
    companyInfo: "Company Information",
    displayName: "Display Name",
    emailAddress: "Email Address",
    phone: "Phone",
    companyName: "Company Name",
    timezone: "Timezone",
    language: "Language",
    emailSignature: "Email Signature",
    notificationPrefs: "Notification Preferences",
    emailNotifications: "Email Notifications",
    renewalAlerts: "Renewal Alerts",
    weeklyDigest: "Weekly Digest",
    saveChanges: "Save Changes",
    saved: "Saved",
    assetAlerts: "Asset Alerts",
    expiringWithin30: "expiring within 30 days",
    totalDevices: "total devices",
    needAttention: "need attention",
    ticket: "ticket",
    tickets: "tickets",
    active: "active",
    totalValueLabel: "total value",
    inboxSubtitle: "Send & receive emails with customers and partners",
    downloadTemplate: "Download Template",
    noTicketsTitle: "No support tickets yet",
    noTicketsDesc: "When you or your team create support tickets, they will appear here.",
    noOrdersTitle: "No purchase orders yet",
    noOrdersDesc: "Generate a quote and convert it to a purchase order to get started.",
    noEmailsTitle: "Your inbox is empty",
    noEmailsDesc: "Send your first email to a customer or partner to start communicating.",
    compose: "Compose",
    searchEmails: "Search emails...",
    all: "All",
    received: "Received",
    sent: "Sent",
    promos: "Promos",
    starred: "Starred",
    reply: "Reply",
    draft: "Draft",
    pendingApprovalStatus: "Pending Approval",
    submitted: "Submitted",
    acknowledged: "Acknowledged",
    cancelled: "Cancelled",
    poPipeline: "PO Pipeline",
    submittedToVendor: "Submitted to Vendor",
    loadingPOs: "Loading purchase orders...",
    noOrdersMatch: "No purchase orders match this filter.",
    uploadSubtitle: "Upload your installed base from Excel or CSV",
    dropFileHere: "Drop your file here",
    dragDropFile: "Drag & drop your Excel or CSV file",
    orClickBrowse: "or click to browse",
    mapColumns: "Map Your Columns",
    matchColumns: "match columns to RenewFlow fields",
    back: "Back",
    previewImport: "Preview Import",
    importMore: "Import More",
    goToDashboard: "Go to Dashboard",
    assetsImported: "Assets Imported",
    trackingMessage: "RenewFlow will track warranty expirations and send alerts automatically.",
    required: "required",
    selectColumn: "— Select column —",
    downloadPdf: "Download PDF",
    sendQuote: "Send Quote",
    newQuote: "New Quote",
    fromAssets: "From Assets",
    lineItems: "Line Items",
    totalTpm: "Total TPM",
    totalOem: "Total OEM",
    savings: "Savings",
    savingsPercent: "Savings %",
    selectDevices: "Select devices from your installed base",
    buildCustomQuote: "Build a custom quote with brand and model selection",
    yourPoints: "Your Points",
    level: "Level",
    next: "Next",
    howToEarn: "How to Earn",
    pointsHistory: "Points History",
    noPointsYet: "No points history yet. Start earning by closing renewals!",
    earnByClosing: "Start earning by closing renewals!",
    rewardsSubtitle: "Earn points for usage, referrals, and sales — updated in real time",
    totalDevicesLabel: "Total Devices",
    activePipeline: "Active Pipeline",
    inProgress: "In Progress",
    reset: "Reset",
    searchDevices: "Search devices, serial, client...",
    allClients: "All Clients",
    noDevicesFound: "No devices found",
    pipelineByClient: "Pipeline by Client",
    fulfillmentPipeline: "Fulfillment Pipeline",
    manageFulfillment: "Manage warranty fulfillment workflow",
    manageRenewals: "Manage and advance warranty renewals through each stage",
    loading: "Loading...",
    darkMode: "Dark mode",
    lightMode: "Light mode",
    signOut: "Sign out",
    aiChat: "AI Chat",
    warrantyPlatform: "Warranty Platform",
  },
  es: {
    goodMorning: "Buenos días, Socio",
    portfolioSummary: "Resumen de portafolio",
    devicesTracked: "dispositivos rastreados",
    activeDevices: "Dispositivos Activos",
    clients: "clientes",
    revenueAtRisk: "Ingresos en Riesgo",
    next90Days: "Próximos 90 días",
    tpmSavings: "Ahorro TPM",
    vsOemPrice: "vs precio OEM",
    renewalRate: "Tasa de Renovación",
    activeAlerts: "Alertas Activas",
    viewAll: "Ver todo",
    renewalPipeline: "Pipeline de Renovación",
    recentActivity: "Actividad Reciente",
    opsDashboard: "Panel de Operaciones",
    supportOverview: "Resumen de soporte RenewFlow",
    totalAssets: "Activos Totales",
    organizations: "organizaciones",
    urgent: "Urgente",
    requireAttention: "Requieren atención",
    lapsed: "Vencidos",
    recoveryQueue: "Cola de recuperación",
    activeQuotes: "Cotizaciones Activas",
    pendingApproval: "Pendiente de aprobación",
    myDashboard: "Mi Panel",
    deliveryOverview: "Resumen de cumplimiento de entregas",
    assignedPOs: "OC Asignadas",
    awaitingFulfillment: "Pendiente de entrega",
    urgentDevices: "Dispositivos Urgentes",
    daysToExpiry: "≤14 días para vencer",
    devicesInScope: "Dispositivos en Alcance",
    acrossAllPOs: "En todas las OC",
    general: "General",
    dashboard: "Panel",
    inbox: "Bandeja",
    alerts: "Alertas",
    sales: "Ventas",
    quoter: "Cotizador Rápido",
    purchaseOrders: "Órdenes de Compra",
    importAssets: "Importar Activos",
    operations: "Operaciones",
    support: "Soporte",
    rewards: "Mis Recompensas",
    pipeline: "Pipeline",
    businessPipeline: "Pipeline de Negocio",
    trackRenewals: "Seguimiento de renovaciones de garantía en todas las etapas",
    stage: "Etapa",
    discovered: "Descubierto",
    quoted: "Cotizado",
    approved: "Aprobado",
    ordered: "Ordenado",
    fulfilled: "Cumplido",
    lapsedRecover: "Vencido (recuperar)",
    totalValue: "Valor Total",
    devices: "dispositivos",
    assignedPOsTitle: "OC Asignadas",
    newPO: "Nueva OC",
    newTicket: "Nuevo Ticket",
    supportTickets: "Tickets de Soporte",
    serviceTickets: "Tickets de Servicio",
    overview: "Resumen",
    management: "Gestión",
    fulfillment: "Cumplimiento",
    communication: "Comunicación",
    tracking: "Seguimiento",
    messages: "Mensajes",
    quotesReview: "Revisión de Cotizaciones",
    partnerRewards: "Recompensas de Socios",
    quoteBuilder: "Creador de Cotizaciones",
    howItWorks: "¿Cómo funciona?",
    suggestImprovement: "Sugiere una Mejora",
    suggestionPlaceholder: "Cuéntanos cómo podemos mejorar RenewFlow...",
    sendSuggestion: "Enviar Sugerencia",
    suggestionSent: "¡Enviado!",
    suggestionThanks: "¡Gracias por tu comentario! Revisamos cada sugerencia.",
    aiConnected: "RenewFlow IA conectada. ¿En qué puedo ayudarte?",
    thinking: "Pensando...",
    messagePlaceholder: "Mensaje...",
    waitingPlaceholder: "Esperando...",
    connectionError: "Error de conexión. Inténtalo de nuevo.",
    quickExpiring: "{count} por vencer",
    quickCritical: "{count} dispositivos críticos",
    quickSummary: "Resumen del portafolio",
    quickLapsed: "{count} vencidos",
    promptExpiring: "¿Cuáles garantías vencen en los próximos 30 días?",
    promptCritical: "Muéstrame todos los dispositivos de nivel crítico y su estado",
    promptSummary: "Dame un resumen de mi portafolio — dispositivos, ahorros y alertas",
    promptLapsed: "¿Cuáles garantías han vencido y necesitan recuperación?",
    settings: "Configuración",
    profileSettings: "Configuración de Perfil",
    companyInfo: "Información de la Empresa",
    displayName: "Nombre",
    emailAddress: "Correo Electrónico",
    phone: "Teléfono",
    companyName: "Nombre de Empresa",
    timezone: "Zona Horaria",
    language: "Idioma",
    emailSignature: "Firma de Correo",
    notificationPrefs: "Preferencias de Notificación",
    emailNotifications: "Notificaciones por Correo",
    renewalAlerts: "Alertas de Renovación",
    weeklyDigest: "Resumen Semanal",
    saveChanges: "Guardar Cambios",
    saved: "Guardado",
    assetAlerts: "Alertas de Activos",
    expiringWithin30: "vencen en 30 días",
    totalDevices: "dispositivos totales",
    needAttention: "necesitan atención",
    ticket: "ticket",
    tickets: "tickets",
    active: "activo(s)",
    totalValueLabel: "valor total",
    inboxSubtitle: "Envía y recibe correos con clientes y socios",
    downloadTemplate: "Descargar Plantilla",
    noTicketsTitle: "Sin tickets de soporte",
    noTicketsDesc: "Cuando tú o tu equipo creen tickets de soporte, aparecerán aquí.",
    noOrdersTitle: "Sin órdenes de compra",
    noOrdersDesc: "Genera una cotización y conviértela en una orden de compra para comenzar.",
    noEmailsTitle: "Tu bandeja está vacía",
    noEmailsDesc: "Envía tu primer correo a un cliente o socio para comenzar a comunicarte.",
    compose: "Redactar",
    searchEmails: "Buscar correos...",
    all: "Todos",
    received: "Recibidos",
    sent: "Enviados",
    promos: "Promos",
    starred: "Destacados",
    reply: "Responder",
    draft: "Borrador",
    pendingApprovalStatus: "Pendiente de Aprobación",
    submitted: "Enviado",
    acknowledged: "Confirmado",
    cancelled: "Cancelado",
    poPipeline: "Pipeline de OC",
    submittedToVendor: "Enviado al Proveedor",
    loadingPOs: "Cargando órdenes de compra...",
    noOrdersMatch: "No hay órdenes de compra que coincidan con este filtro.",
    uploadSubtitle: "Sube tu base instalada desde Excel o CSV",
    dropFileHere: "Suelta tu archivo aquí",
    dragDropFile: "Arrastra y suelta tu archivo Excel o CSV",
    orClickBrowse: "o haz clic para explorar",
    mapColumns: "Mapear Columnas",
    matchColumns: "asocia columnas con campos de RenewFlow",
    back: "Atrás",
    previewImport: "Vista Previa",
    importMore: "Importar Más",
    goToDashboard: "Ir al Panel",
    assetsImported: "Activos Importados",
    trackingMessage: "RenewFlow rastreará los vencimientos de garantía y enviará alertas automáticamente.",
    required: "requerido",
    selectColumn: "— Seleccionar columna —",
    downloadPdf: "Descargar PDF",
    sendQuote: "Enviar Cotización",
    newQuote: "Nueva Cotización",
    fromAssets: "Desde Activos",
    lineItems: "Líneas",
    totalTpm: "Total TPM",
    totalOem: "Total OEM",
    savings: "Ahorro",
    savingsPercent: "% Ahorro",
    selectDevices: "Selecciona dispositivos de tu base instalada",
    buildCustomQuote: "Crea una cotización personalizada con marca y modelo",
    yourPoints: "Tus Puntos",
    level: "Nivel",
    next: "Siguiente",
    howToEarn: "Cómo Ganar",
    pointsHistory: "Historial de Puntos",
    noPointsYet: "Sin historial de puntos. ¡Comienza ganando cerrando renovaciones!",
    earnByClosing: "¡Comienza ganando cerrando renovaciones!",
    rewardsSubtitle: "Gana puntos por uso, referidos y ventas — actualizado en tiempo real",
    totalDevicesLabel: "Total Dispositivos",
    activePipeline: "Pipeline Activo",
    inProgress: "En Progreso",
    reset: "Reiniciar",
    searchDevices: "Buscar dispositivos, serial, cliente...",
    allClients: "Todos los Clientes",
    noDevicesFound: "No se encontraron dispositivos",
    pipelineByClient: "Pipeline por Cliente",
    fulfillmentPipeline: "Pipeline de Cumplimiento",
    manageFulfillment: "Gestionar flujo de cumplimiento de garantías",
    manageRenewals: "Gestionar y avanzar renovaciones de garantía en cada etapa",
    loading: "Cargando...",
    darkMode: "Modo oscuro",
    lightMode: "Modo claro",
    signOut: "Cerrar sesión",
    aiChat: "Chat IA",
    warrantyPlatform: "Plataforma de Garantías",
  },
  pt: {
    goodMorning: "Bom dia, Parceiro",
    portfolioSummary: "Resumo do portfólio",
    devicesTracked: "dispositivos rastreados",
    activeDevices: "Dispositivos Ativos",
    clients: "clientes",
    revenueAtRisk: "Receita em Risco",
    next90Days: "Próximos 90 dias",
    tpmSavings: "Economia TPM",
    vsOemPrice: "vs preço OEM",
    renewalRate: "Taxa de Renovação",
    activeAlerts: "Alertas Ativos",
    viewAll: "Ver tudo",
    renewalPipeline: "Pipeline de Renovação",
    recentActivity: "Atividade Recente",
    opsDashboard: "Painel de Operações",
    supportOverview: "Visão geral de suporte RenewFlow",
    totalAssets: "Ativos Totais",
    organizations: "organizações",
    urgent: "Urgente",
    requireAttention: "Requerem atenção",
    lapsed: "Vencidos",
    recoveryQueue: "Fila de recuperação",
    activeQuotes: "Cotações Ativas",
    pendingApproval: "Pendente de aprovação",
    myDashboard: "Meu Painel",
    deliveryOverview: "Visão geral de entregas",
    assignedPOs: "OCs Atribuídas",
    awaitingFulfillment: "Aguardando entrega",
    urgentDevices: "Dispositivos Urgentes",
    daysToExpiry: "≤14 dias para vencer",
    devicesInScope: "Dispositivos em Escopo",
    acrossAllPOs: "Em todas as OCs",
    general: "Geral",
    dashboard: "Painel",
    inbox: "Caixa de Entrada",
    alerts: "Alertas",
    sales: "Vendas",
    quoter: "Cotador Rápido",
    purchaseOrders: "Pedidos de Compra",
    importAssets: "Importar Ativos",
    operations: "Operações",
    support: "Suporte",
    rewards: "Minhas Recompensas",
    pipeline: "Pipeline",
    businessPipeline: "Pipeline de Negócios",
    trackRenewals: "Acompanhe o progresso das renovações de garantia em todas as etapas",
    stage: "Etapa",
    discovered: "Descoberto",
    quoted: "Cotado",
    approved: "Aprovado",
    ordered: "Pedido",
    fulfilled: "Entregue",
    lapsedRecover: "Vencido (recuperar)",
    totalValue: "Valor Total",
    devices: "dispositivos",
    assignedPOsTitle: "OCs Atribuídas",
    newPO: "Nova OC",
    newTicket: "Novo Ticket",
    supportTickets: "Tickets de Suporte",
    serviceTickets: "Tickets de Serviço",
    overview: "Visão Geral",
    management: "Gestão",
    fulfillment: "Entrega",
    communication: "Comunicação",
    tracking: "Acompanhamento",
    messages: "Mensagens",
    quotesReview: "Revisão de Cotações",
    partnerRewards: "Recompensas de Parceiros",
    quoteBuilder: "Criador de Cotações",
    howItWorks: "Como funciona?",
    suggestImprovement: "Sugira uma Melhoria",
    suggestionPlaceholder: "Conte-nos como podemos melhorar o RenewFlow...",
    sendSuggestion: "Enviar Sugestão",
    suggestionSent: "Enviado!",
    suggestionThanks: "Obrigado pelo seu feedback! Revisamos cada sugestão.",
    aiConnected: "RenewFlow IA conectada. Como posso ajudar?",
    thinking: "Pensando...",
    messagePlaceholder: "Mensagem...",
    waitingPlaceholder: "Aguardando...",
    connectionError: "Erro de conexão. Tente novamente.",
    quickExpiring: "{count} vencendo em breve",
    quickCritical: "{count} dispositivos críticos",
    quickSummary: "Resumo do portfólio",
    quickLapsed: "{count} vencidos",
    promptExpiring: "Quais garantias estão vencendo nos próximos 30 dias?",
    promptCritical: "Mostre-me todos os dispositivos de nível crítico e seu status",
    promptSummary: "Me dê um resumo do meu portfólio — dispositivos, economias e alertas",
    promptLapsed: "Quais garantias venceram e precisam de recuperação?",
    settings: "Configurações",
    profileSettings: "Configurações de Perfil",
    companyInfo: "Informações da Empresa",
    displayName: "Nome",
    emailAddress: "Endereço de Email",
    phone: "Telefone",
    companyName: "Nome da Empresa",
    timezone: "Fuso Horário",
    language: "Idioma",
    emailSignature: "Assinatura de Email",
    notificationPrefs: "Preferências de Notificação",
    emailNotifications: "Notificações por Email",
    renewalAlerts: "Alertas de Renovação",
    weeklyDigest: "Resumo Semanal",
    saveChanges: "Salvar Alterações",
    saved: "Salvo",
    assetAlerts: "Alertas de Ativos",
    expiringWithin30: "vencendo em 30 dias",
    totalDevices: "dispositivos totais",
    needAttention: "precisam de atenção",
    ticket: "ticket",
    tickets: "tickets",
    active: "ativo(s)",
    totalValueLabel: "valor total",
    inboxSubtitle: "Envie e receba emails com clientes e parceiros",
    downloadTemplate: "Baixar Modelo",
    noTicketsTitle: "Nenhum ticket de suporte",
    noTicketsDesc: "Quando você ou sua equipe criarem tickets de suporte, eles aparecerão aqui.",
    noOrdersTitle: "Nenhum pedido de compra",
    noOrdersDesc: "Gere uma cotação e converta-a em um pedido de compra para começar.",
    noEmailsTitle: "Sua caixa de entrada está vazia",
    noEmailsDesc: "Envie seu primeiro email para um cliente ou parceiro para começar a se comunicar.",
    compose: "Redigir",
    searchEmails: "Buscar emails...",
    all: "Todos",
    received: "Recebidos",
    sent: "Enviados",
    promos: "Promos",
    starred: "Favoritos",
    reply: "Responder",
    draft: "Rascunho",
    pendingApprovalStatus: "Pendente de Aprovação",
    submitted: "Enviado",
    acknowledged: "Confirmado",
    cancelled: "Cancelado",
    poPipeline: "Pipeline de OC",
    submittedToVendor: "Enviado ao Fornecedor",
    loadingPOs: "Carregando pedidos de compra...",
    noOrdersMatch: "Nenhum pedido de compra corresponde a este filtro.",
    uploadSubtitle: "Faça upload da sua base instalada em Excel ou CSV",
    dropFileHere: "Solte seu arquivo aqui",
    dragDropFile: "Arraste e solte seu arquivo Excel ou CSV",
    orClickBrowse: "ou clique para buscar",
    mapColumns: "Mapear Colunas",
    matchColumns: "associe colunas aos campos do RenewFlow",
    back: "Voltar",
    previewImport: "Pré-visualização",
    importMore: "Importar Mais",
    goToDashboard: "Ir ao Painel",
    assetsImported: "Ativos Importados",
    trackingMessage: "O RenewFlow rastreará os vencimentos de garantia e enviará alertas automaticamente.",
    required: "obrigatório",
    selectColumn: "— Selecionar coluna —",
    downloadPdf: "Baixar PDF",
    sendQuote: "Enviar Cotação",
    newQuote: "Nova Cotação",
    fromAssets: "Dos Ativos",
    lineItems: "Itens",
    totalTpm: "Total TPM",
    totalOem: "Total OEM",
    savings: "Economia",
    savingsPercent: "% Economia",
    selectDevices: "Selecione dispositivos da sua base instalada",
    buildCustomQuote: "Crie uma cotação personalizada com marca e modelo",
    yourPoints: "Seus Pontos",
    level: "Nível",
    next: "Próximo",
    howToEarn: "Como Ganhar",
    pointsHistory: "Histórico de Pontos",
    noPointsYet: "Sem histórico de pontos. Comece ganhando fechando renovações!",
    earnByClosing: "Comece ganhando fechando renovações!",
    rewardsSubtitle: "Ganhe pontos por uso, indicações e vendas — atualizado em tempo real",
    totalDevicesLabel: "Total Dispositivos",
    activePipeline: "Pipeline Ativo",
    inProgress: "Em Progresso",
    reset: "Resetar",
    searchDevices: "Buscar dispositivos, serial, cliente...",
    allClients: "Todos os Clientes",
    noDevicesFound: "Nenhum dispositivo encontrado",
    pipelineByClient: "Pipeline por Cliente",
    fulfillmentPipeline: "Pipeline de Entrega",
    manageFulfillment: "Gerenciar fluxo de entrega de garantias",
    manageRenewals: "Gerenciar e avançar renovações de garantia em cada etapa",
    loading: "Carregando...",
    darkMode: "Modo escuro",
    lightMode: "Modo claro",
    signOut: "Sair",
    aiChat: "Chat IA",
    warrantyPlatform: "Plataforma de Garantias",
  },
};
