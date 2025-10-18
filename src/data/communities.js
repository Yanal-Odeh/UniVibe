// Shared communities data
const communities = [
  {
    id: 1,
    name: "Computer Science Club",
    description: "For all tech enthusiasts and programmers",
    avatar: "🖥️",
    color: "#667eea",
    members: [
      { id: 1, name: "Sarah Johnson", role: "admin", email: "sarah@univibe.edu", joinDate: "2024-01-15" },
      { id: 2, name: "Mike Chen", role: "moderator", email: "mike@univibe.edu", joinDate: "2024-01-20" },
      { id: 3, name: "Emily Davis", role: "member", email: "emily@univibe.edu", joinDate: "2024-02-10" },
      { id: 4, name: "Alex Kumar", role: "member", email: "alex@univibe.edu", joinDate: "2024-02-15" },
      { id: 12, name: "James Wilson", role: "moderator", email: "james@univibe.edu", joinDate: "2024-01-25" },
      { id: 13, name: "Olivia Martinez", role: "member", email: "olivia@univibe.edu", joinDate: "2024-03-01" },
      { id: 14, name: "Daniel Lee", role: "member", email: "daniel@univibe.edu", joinDate: "2024-03-05" },
      { id: 15, name: "Sophia Brown", role: "member", email: "sophia@univibe.edu", joinDate: "2024-03-10" },
      { id: 16, name: "Noah Anderson", role: "member", email: "noah@univibe.edu", joinDate: "2024-03-15" },
      { id: 17, name: "Emma Taylor", role: "member", email: "emma@univibe.edu", joinDate: "2024-03-20" },
      { id: 18, name: "Liam Garcia", role: "member", email: "liam@univibe.edu", joinDate: "2024-03-25" },
      { id: 19, name: "Ava Rodriguez", role: "member", email: "ava@univibe.edu", joinDate: "2024-04-01" },
      { id: 20, name: "William Kim", role: "member", email: "william@univibe.edu", joinDate: "2024-04-05" },
      { id: 21, name: "Isabella Nguyen", role: "member", email: "isabella@univibe.edu", joinDate: "2024-04-10" }
    ],
    get memberCount() {
      return this.members.length;
    }
  },
  {
    id: 2,
    name: "Art & Design Society",
    description: "Creative minds unite! Share your artwork and designs",
    avatar: "🎨",
    color: "#f093fb",
    members: [
      { id: 5, name: "Jessica Lee", role: "admin", email: "jessica@univibe.edu", joinDate: "2024-01-10" },
      { id: 6, name: "David Park", role: "member", email: "david@univibe.edu", joinDate: "2024-01-25" }
    ],
    get memberCount() {
      return this.members.length;
    }
  },
  {
    id: 3,
    name: "Sports & Fitness",
    description: "Stay active and healthy together",
    avatar: "⚽",
    color: "#4facfe",
    members: [
      { id: 7, name: "Ryan Martinez", role: "admin", email: "ryan@univibe.edu", joinDate: "2024-01-05" },
      { id: 8, name: "Lisa Wang", role: "moderator", email: "lisa@univibe.edu", joinDate: "2024-01-12" }
    ],
    get memberCount() {
      return this.members.length;
    }
  },
  {
    id: 4,
    name: "Photography Club",
    description: "Capture moments, share perspectives",
    avatar: "📷",
    color: "#43e97b",
    members: [
      { id: 9, name: "Tom Wilson", role: "admin", email: "tom@univibe.edu", joinDate: "2024-01-08" }
    ],
    get memberCount() {
      return this.members.length;
    }
  },
  {
    id: 5,
    name: "Music & Bands",
    description: "Musicians, singers, and music lovers welcome",
    avatar: "🎵",
    color: "#fa709a",
    members: [
      { id: 10, name: "Amy Zhang", role: "admin", email: "amy@univibe.edu", joinDate: "2024-01-03" }
    ],
    get memberCount() {
      return this.members.length;
    }
  },
  {
    id: 6,
    name: "Book Club",
    description: "Read, discuss, and share your favorite books",
    avatar: "📚",
    color: "#ffd16a",
    members: [
      { id: 11, name: "Chris Brown", role: "admin", email: "chris@univibe.edu", joinDate: "2024-01-18" }
    ],
    get memberCount() {
      return this.members.length;
    }
  }
];

export default communities;
