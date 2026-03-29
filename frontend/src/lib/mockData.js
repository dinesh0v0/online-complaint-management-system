export const mockComplaints = [
  {
    id: "CMP-2026-001",
    title: "Noise Disturbance in Sector 4",
    description: "Loud music playing past midnight for the third consecutive night from house no. 42.",
    category: "Nuisance",
    status: "Pending",
    priority: "Low",
    date: "2026-03-28",
    citizenName: "John Doe",
  },
  {
    id: "CMP-2026-002",
    title: "Theft at Local Grocery",
    description: "Shoplifting incident at the corner store, suspect caught on CCTV.",
    category: "Theft",
    status: "In Progress",
    priority: "High",
    date: "2026-03-29",
    citizenName: "Jane Smith",
  },
  {
    id: "CMP-2026-003",
    title: "Traffic Signal Malfunction",
    description: "Main street traffic light is stuck on red causing huge congestion.",
    category: "Traffic",
    status: "Resolved",
    priority: "Medium",
    date: "2026-03-27",
    citizenName: "Robert Johnson",
  },
  {
    id: "CMP-2026-004",
    title: "Suspicious Activity",
    description: "Unidentified vehicle parked in abandoned lot for 3 days.",
    category: "Suspicious",
    status: "Pending",
    priority: "Medium",
    date: "2026-03-29",
    citizenName: "Alice Brown",
  }
];

export const mockStats = {
  total: 45,
  resolved: 28,
  pending: 12,
  inProgress: 5,
};

export const complaintsOverTimeData = [
  { name: 'Mon', complaints: 4 },
  { name: 'Tue', complaints: 3 },
  { name: 'Wed', complaints: 7 },
  { name: 'Thu', complaints: 5 },
  { name: 'Fri', complaints: 8 },
  { name: 'Sat', complaints: 12 },
  { name: 'Sun', complaints: 6 },
];

export const complaintsByStatusData = [
  { name: 'Resolved', value: 28, color: '#15803d' },
  { name: 'Pending', value: 12, color: '#b45309' },
  { name: 'In Progress', value: 5, color: '#CD0000' }
];
