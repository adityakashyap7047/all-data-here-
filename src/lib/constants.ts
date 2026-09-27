export const VPS_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    slug: 'starter',
    cpu: 1,
    ram: 2,
    storage: 40,
    bandwidth: 2,
    ipv4Count: 1,
    priceMonthly: 5.99,
    priceYearly: 59.99,
    features: ['1 vCPU', '2 GB RAM', '40 GB NVMe', '2 TB Bandwidth', '1 IPv4', 'DDoS Protection', 'API Access', '99.9% SLA'],
    location: 'US-EAST',
    sortOrder: 1,
  },
  {
    id: 'standard',
    name: 'Standard',
    slug: 'standard',
    cpu: 2,
    ram: 4,
    storage: 80,
    bandwidth: 4,
    ipv4Count: 1,
    priceMonthly: 11.99,
    priceYearly: 119.99,
    features: ['2 vCPU', '4 GB RAM', '80 GB NVMe', '4 TB Bandwidth', '1 IPv4', 'DDoS Protection', 'API Access', '99.9% SLA', 'Free Backups'],
    location: 'US-EAST',
    sortOrder: 2,
  },
  {
    id: 'professional',
    name: 'Professional',
    slug: 'professional',
    cpu: 4,
    ram: 8,
    storage: 160,
    bandwidth: 8,
    ipv4Count: 1,
    priceMonthly: 23.99,
    priceYearly: 239.99,
    features: ['4 vCPU', '8 GB RAM', '160 GB NVMe', '8 TB Bandwidth', '1 IPv4', 'DDoS Protection', 'API Access', '99.9% SLA', 'Free Backups', 'Priority Support'],
    location: 'US-EAST',
    sortOrder: 3,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    slug: 'enterprise',
    cpu: 8,
    ram: 16,
    storage: 320,
    bandwidth: 16,
    ipv4Count: 2,
    priceMonthly: 47.99,
    priceYearly: 479.99,
    features: ['8 vCPU', '16 GB RAM', '320 GB NVMe', '16 TB Bandwidth', '2 IPv4', 'DDoS Protection', 'API Access', '99.99% SLA', 'Free Backups', 'Priority Support', 'Dedicated IP'],
    location: 'US-EAST',
    sortOrder: 4,
  },
];

export const OS_TEMPLATES = [
  { id: 'ubuntu-22.04', name: 'Ubuntu 22.04 LTS', type: 'linux' },
  { id: 'ubuntu-20.04', name: 'Ubuntu 20.04 LTS', type: 'linux' },
  { id: 'debian-12', name: 'Debian 12', type: 'linux' },
  { id: 'debian-11', name: 'Debian 11', type: 'linux' },
  { id: 'centos-9', name: 'CentOS Stream 9', type: 'linux' },
  { id: 'rocky-9', name: 'Rocky Linux 9', type: 'linux' },
  { id: 'almalinux-9', name: 'AlmaLinux 9', type: 'linux' },
  { id: 'fedora-39', name: 'Fedora 39', type: 'linux' },
  { id: 'windows-2022', name: 'Windows Server 2022', type: 'windows', price: 5.00 },
  { id: 'windows-2019', name: 'Windows Server 2019', type: 'windows', price: 5.00 },
];

export const LOCATIONS = [
  { id: 'us-east', name: 'New York, USA', flag: '🇺🇸' },
  { id: 'us-west', name: 'San Francisco, USA', flag: '🇺🇸' },
  { id: 'eu-central', name: 'Frankfurt, Germany', flag: '🇩🇪' },
  { id: 'eu-west', name: 'London, UK', flag: '🇬🇧' },
  { id: 'ap-south', name: 'Singapore', flag: '🇸🇬' },
  { id: 'ap-east', name: 'Tokyo, Japan', flag: '🇯🇵' },
];

export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: ['*'],
  ADMIN: ['users:read', 'users:write', 'vps:read', 'vps:write', 'orders:read', 'orders:write', 'billing:read', 'billing:write', 'tickets:read', 'tickets:write', 'audit:read', 'settings:read', 'settings:write'],
  SUPPORT: ['users:read', 'vps:read', 'tickets:read', 'tickets:write'],
  BILLING: ['users:read', 'orders:read', 'orders:write', 'billing:read', 'billing:write', 'invoices:read', 'invoices:write', 'payments:read', 'payments:write'],
  CUSTOMER: ['vps:read:self', 'vps:write:self', 'orders:read:self', 'billing:read:self', 'tickets:read:self', 'tickets:write:self', 'profile:read', 'profile:write'],
  API: ['vps:read', 'vps:write', 'metrics:read'],
};

export const VPS_ACTIONS = [
  { id: 'start', label: 'Start', icon: 'play', variant: 'primary', confirm: false },
  { id: 'stop', label: 'Stop', icon: 'square', variant: 'secondary', confirm: true },
  { id: 'reboot', label: 'Reboot', icon: 'rotate-cw', variant: 'secondary', confirm: true },
  { id: 'reinstall', label: 'Reinstall OS', icon: 'refresh-cw', variant: 'danger', confirm: true },
  { id: 'resize', label: 'Resize Plan', icon: 'maximize', variant: 'secondary', confirm: true },
  { id: 'console', label: 'Console', icon: 'terminal', variant: 'ghost', confirm: false },
  { id: 'backup', label: 'Create Backup', icon: 'database', variant: 'secondary', confirm: false },
] as const;

export const TICKET_CATEGORIES = [
  { value: 'GENERAL', label: 'General Inquiry' },
  { value: 'BILLING', label: 'Billing & Payments' },
  { value: 'TECHNICAL', label: 'Technical Support' },
  { value: 'VPS', label: 'VPS Issues' },
  { value: 'NETWORK', label: 'Network & Connectivity' },
  { value: 'SECURITY', label: 'Security & Abuse' },
  { value: 'ABUSE', label: 'Abuse Report' },
  { value: 'SALES', label: 'Pre-Sales Questions' },
  { value: 'FEATURE_REQUEST', label: 'Feature Request' },
];

export const TICKET_PRIORITIES = [
  { value: 'LOW', label: 'Low', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { value: 'NORMAL', label: 'Normal', color: 'text-green-400', bg: 'bg-green-500/10' },
  { value: 'HIGH', label: 'High', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { value: 'URGENT', label: 'Urgent', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { value: 'CRITICAL', label: 'Critical', color: 'text-red-400', bg: 'bg-red-500/10' },
];

export const TICKET_STATUSES = [
  { value: 'OPEN', label: 'Open', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { value: 'WAITING_CUSTOMER', label: 'Waiting Customer', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { value: 'WAITING_STAFF', label: 'Waiting Staff', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { value: 'RESOLVED', label: 'Resolved', color: 'text-green-400', bg: 'bg-green-500/10' },
  { value: 'CLOSED', label: 'Closed', color: 'text-gray-400', bg: 'bg-gray-500/10' },
];

export const NOTIFICATION_TYPES = {
  INFO: { icon: 'info', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  SUCCESS: { icon: 'check-circle', color: 'text-green-400', bg: 'bg-green-500/10' },
  WARNING: { icon: 'alert-triangle', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  ERROR: { icon: 'x-circle', color: 'text-red-400', bg: 'bg-red-500/10' },
  VPS_STATUS: { icon: 'server', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  BILLING: { icon: 'credit-card', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  TICKET: { icon: 'message-square', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  SECURITY: { icon: 'shield', color: 'text-red-400', bg: 'bg-red-500/10' },
  MAINTENANCE: { icon: 'wrench', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  PROMOTIONAL: { icon: 'gift', color: 'text-pink-400', bg: 'bg-pink-500/10' },
};