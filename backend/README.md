# B2B SaaS Productivity Dashboard Backend

A Node.js + Express backend API that provides companies insights into their team's productivity based on logged activities. Each company has multiple teams, and each team has multiple members who log their daily activities including type, hours spent, and tags.

## 🚀 Features

- **Overview Reports** - Get summary statistics across all companies
- **Member Activity Reports** - Detailed daily activity logs for individual members
- **Date Range Filtering** - Filter activities by start and end dates
- **Unique Member Counting** - Accurate member counts without double counting
- **Error Handling** - Comprehensive validation and error responses
- **Clean Architecture** - Modular code using functional programming principles

## 📊 Data Structure

The system manages a hierarchical structure:
```
Companies → Teams → Members → Activities
```

Each activity contains:
- `date` - Activity date (YYYY-MM-DD)
- `type` - Activity type (coding, meeting, design, etc.)
- `hours` - Hours spent on the activity
- `tags` - Array of relevant tags

## 🛠️ Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd productivity-dashboard

# Install dependencies
npm install

# Start the server
npm start
# or
node server.js
```

The server will start on `http://localhost:3000`

## 📡 API Endpoints

### 1. Overview Report
**GET** `/report/overview`

Returns summary statistics across all companies.

**Query Parameters:**
- `startDate` (optional) - Filter start date (YYYY-MM-DD)
- `endDate` (optional) - Filter end date (YYYY-MM-DD)

**Example Request:**
```bash
curl "http://localhost:3000/report/overview?startDate=2024-03-01&endDate=2024-03-03"
```

**Example Response:**
```json
{
  "totalCompanies": 2,
  "totalTeams": 3,
  "totalMembers": 5,
  "totalActivities": 12,
  "totalHours": 34,
  "topActivityTypes": [
    {
      "type": "coding",
      "totalHours": 11,
      "members": 2
    },
    {
      "type": "meeting",
      "totalHours": 9,
      "members": 4
    },
    {
      "type": "content",
      "totalHours": 7,
      "members": 2
    }
  ],
  "dateFilter": {
    "startDate": "2024-03-01",
    "endDate": "2024-03-03"
  }
}
```

### 2. Member Activity Report
**GET** `/report/member/:memberId`

Returns daily activity log for a specific member.

**Path Parameters:**
- `memberId` - Unique member identifier

**Query Parameters:**
- `startDate` (optional) - Filter start date (YYYY-MM-DD)
- `endDate` (optional) - Filter end date (YYYY-MM-DD)

**Example Request:**
```bash
curl "http://localhost:3000/report/member/mem_1?startDate=2024-03-02&endDate=2024-03-03"
```

**Example Response:**
```json
{
  "memberId": "mem_1",
  "name": "Alice",
  "totalHours": 3,
  "dailyBreakdown": [
    {
      "date": "2024-03-02",
      "activities": ["meeting"],
      "hours": 2
    },
    {
      "date": "2024-03-03",
      "activities": ["review"],
      "hours": 1
    }
  ],
  "dateFilter": {
    "startDate": "2024-03-02",
    "endDate": "2024-03-03"
  }
}
```

### 3. Health Check
**GET** `/health`

Returns server health status.

**Example Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-08-08T10:30:00.000Z",
  "uptime": 3600.123
}
```

### 4. API Documentation
**GET** `/`

Returns available endpoints and sample member IDs for testing.

## 🧪 Testing

### Available Test Member IDs:
- `mem_1` - Alice (Engineering)
- `mem_2` - Bob (Engineering)
- `mem_3` - Carol (Design)
- `mem_4` - Dan (Marketing)
- `mem_5` - Eve (Marketing)

### Sample Test Commands:
```bash
# Overview report (all data)
curl http://localhost:3000/report/overview

# Overview with date filtering
curl "http://localhost:3000/report/overview?startDate=2024-03-01&endDate=2024-03-02"

# Member report
curl http://localhost:3000/report/member/mem_1

# Member report with date filtering
curl "http://localhost:3000/report/member/mem_1?startDate=2024-03-02"

# Health check
curl http://localhost:3000/health

# API documentation
curl http://localhost:3000/
```

## 🏗️ Architecture

### Key Design Principles:
- **Functional Programming** - Uses `map()`, `reduce()`, `filter()`, `flatMap()`, and `Set`
- **Immutable Operations** - Pure functions with no side effects
- **Modular Structure** - Separated utility functions and route handlers
- **Error Handling** - Comprehensive validation and error responses

### Core Functions:
- `getAllActivitiesFlattened()` - Flattens nested data structure with date filtering
- `getActivityTypeTotals()` - Aggregates activity types with unique member counts
- `getDailyBreakdown()` - Groups activities by date
- `findMemberById()` - Locates members across all companies
- `isDateInRange()` - Validates and filters by date range

## 📁 Project Structure

```
productivity-dashboard/
├── server.js           # Main application file
├── package.json        # Dependencies and scripts
├── README.md          # Project documentation
└── node_modules/      # Installed packages
```

## 🔧 Configuration

### Environment Variables:
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)

### Package.json Scripts:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

## 🚨 Error Handling

The API handles various error scenarios:

- **400 Bad Request** - Invalid date format
- **404 Not Found** - Member not found or invalid routes
- **500 Internal Server Error** - Server errors with detailed logging

## 📈 Sample Data

The application includes sample data with:
- 2 companies (Alpha Inc, Beta LLC)
- 3 teams (Engineering, Design, Marketing)
- 5 members with various activities
- Activity types: coding, meeting, design, content, seo, review
- Date range: 2024-03-01 to 2024-03-03

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

