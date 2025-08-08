// server.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sample data
const companies = [
  {
    companyId: "comp_1",
    name: "Alpha Inc",
    teams: [
      {
        teamId: "team_1",
        name: "Engineering",
        members: [
          {
            memberId: "mem_1",
            name: "Alice",
            activities: [
              { date: "2024-03-01", type: "coding", hours: 5, tags: ["feature", "frontend"] },
              { date: "2024-03-02", type: "meeting", hours: 2, tags: ["planning"] },
              { date: "2024-03-03", type: "review", hours: 1, tags: ["code"] },
            ],
          },
          {
            memberId: "mem_2",
            name: "Bob",
            activities: [
              { date: "2024-03-01", type: "coding", hours: 6, tags: ["bugfix"] },
              { date: "2024-03-03", type: "meeting", hours: 3, tags: ["sync"] },
            ],
          },
        ],
      },
      {
        teamId: "team_2",
        name: "Design",
        members: [
          {
            memberId: "mem_3",
            name: "Carol",
            activities: [
              { date: "2024-03-02", type: "design", hours: 4, tags: ["ui", "figma"] },
              { date: "2024-03-03", type: "meeting", hours: 2, tags: ["handoff"] },
            ],
          },
        ],
      },
    ],
  },
  {
    companyId: "comp_2",
    name: "Beta LLC",
    teams: [
      {
        teamId: "team_3",
        name: "Marketing",
        members: [
          {
            memberId: "mem_4",
            name: "Dan",
            activities: [
              { date: "2024-03-01", type: "content", hours: 3, tags: ["blog"] },
              { date: "2024-03-02", type: "seo", hours: 2, tags: ["keyword"] },
            ],
          },
          {
            memberId: "mem_5",
            name: "Eve",
            activities: [
              { date: "2024-03-01", type: "content", hours: 4, tags: ["social"] },
              { date: "2024-03-03", type: "meeting", hours: 2, tags: ["sync"] },
            ],
          },
        ],
      },
    ],
  },
];

// ==================== UTILITY FUNCTIONS ====================

/**
 * Validates and parses date string (YYYY-MM-DD format)
 */
const parseDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString + 'T00:00:00.000Z');
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Checks if a date is within the specified range
 */
const isDateInRange = (activityDate, startDate, endDate) => {
  const actDate = parseDate(activityDate);
  if (!actDate) return false;
  
  const start = startDate ? parseDate(startDate) : null;
  const end = endDate ? parseDate(endDate) : null;
  
  if (start && actDate < start) return false;
  if (end && actDate > end) return false;
  
  return true;
};

/**
 * Flattens nested company structure into array of all activities with member info
 */
const getAllActivitiesFlattened = (dateFilter = {}) => {
  const { startDate, endDate } = dateFilter;
  
  return companies
    .flatMap(company => 
      company.teams.flatMap(team =>
        team.members.flatMap(member =>
          member.activities
            .filter(activity => isDateInRange(activity.date, startDate, endDate))
            .map(activity => ({
              ...activity,
              memberId: member.memberId,
              memberName: member.name,
              teamId: team.teamId,
              teamName: team.name,
              companyId: company.companyId,
              companyName: company.name
            }))
        )
      )
    );
};

/**
 * Gets all members flattened from nested structure
 */
const getAllMembersFlattened = () => {
  return companies
    .flatMap(company =>
      company.teams.flatMap(team =>
        team.members.map(member => ({
          ...member,
          teamId: team.teamId,
          teamName: team.name,
          companyId: company.companyId,
          companyName: company.name
        }))
      )
    );
};

/**
 * Finds a member by ID across all companies
 */
const findMemberById = (memberId) => {
  return getAllMembersFlattened().find(member => member.memberId === memberId) || null;
};

/**
 * Groups activities by type and calculates totals with unique member counts
 */
const getActivityTypeTotals = (activities) => {
  const activityGroups = activities.reduce((acc, activity) => {
    const { type, hours, memberId } = activity;
    
    if (!acc[type]) {
      acc[type] = {
        type,
        totalHours: 0,
        memberIds: new Set()
      };
    }
    
    acc[type].totalHours += hours;
    acc[type].memberIds.add(memberId);
    
    return acc;
  }, {});
  
  return Object.values(activityGroups)
    .map(group => ({
      type: group.type,
      totalHours: group.totalHours,
      members: group.memberIds.size
    }))
    .sort((a, b) => b.totalHours - a.totalHours);
};

/**
 * Processes daily breakdown for member activities
 */
const getDailyBreakdown = (activities) => {
  const dailyGroups = activities.reduce((acc, activity) => {
    const { date, type, hours } = activity;
    
    if (!acc[date]) {
      acc[date] = {
        date,
        activities: [],
        hours: 0
      };
    }
    
    acc[date].activities.push(type);
    acc[date].hours += hours;
    
    return acc;
  }, {});
  
  return Object.values(dailyGroups)
    .sort((a, b) => a.date.localeCompare(b.date));
};

// ==================== ROUTE HANDLERS ====================

/**
 * GET /report/overview - Returns summary report across all companies
 * Query params: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
const getOverviewReport = (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Validate date parameters
    if (startDate && !parseDate(startDate)) {
      return res.status(400).json({
        error: 'Invalid date format',
        message: 'startDate must be in YYYY-MM-DD format'
      });
    }
    
    if (endDate && !parseDate(endDate)) {
      return res.status(400).json({
        error: 'Invalid date format', 
        message: 'endDate must be in YYYY-MM-DD format'
      });
    }
    
    // Get filtered activities
    const allActivities = getAllActivitiesFlattened({ startDate, endDate });
    
    // Calculate totals
    const totalCompanies = companies.length;
    const totalTeams = companies.reduce((sum, company) => sum + company.teams.length, 0);
    const totalMembers = getAllMembersFlattened().length;
    const totalActivities = allActivities.length;
    const totalHours = allActivities.reduce((sum, activity) => sum + activity.hours, 0);
    
    // Get top activity types with unique member counts
    const topActivityTypes = getActivityTypeTotals(allActivities);
    
    const overview = {
      totalCompanies,
      totalTeams,
      totalMembers,
      totalActivities,
      totalHours,
      topActivityTypes,
      ...(startDate || endDate ? { 
        dateFilter: { 
          ...(startDate && { startDate }), 
          ...(endDate && { endDate }) 
        } 
      } : {})
    };
    
    res.json(overview);
  } catch (error) {
    console.error('Error generating overview report:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate overview report'
    });
  }
};

/**
 * GET /report/member/:memberId - Returns daily activity log for a member
 * Query params: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
const getMemberReport = (req, res) => {
  try {
    const { memberId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Validate date parameters
    if (startDate && !parseDate(startDate)) {
      return res.status(400).json({
        error: 'Invalid date format',
        message: 'startDate must be in YYYY-MM-DD format'
      });
    }
    
    if (endDate && !parseDate(endDate)) {
      return res.status(400).json({
        error: 'Invalid date format',
        message: 'endDate must be in YYYY-MM-DD format'
      });
    }
    
    // Find the member
    const member = findMemberById(memberId);
    
    if (!member) {
      return res.status(404).json({
        error: 'Member not found',
        message: `Member with ID ${memberId} does not exist`
      });
    }
    
    // Filter activities by date range
    const filteredActivities = member.activities
      .filter(activity => isDateInRange(activity.date, startDate, endDate));
    
    // Handle case where no activities found in date range
    if (filteredActivities.length === 0) {
      const dateRangeMsg = startDate || endDate 
        ? ` in the specified date range` 
        : '';
      
      return res.json({
        memberId: member.memberId,
        name: member.name,
        totalHours: 0,
        dailyBreakdown: [],
        message: `No activities found for this member${dateRangeMsg}`,
        ...(startDate || endDate ? { 
          dateFilter: { 
            ...(startDate && { startDate }), 
            ...(endDate && { endDate }) 
          } 
        } : {})
      });
    }
    
    // Calculate total hours and daily breakdown
    const totalHours = filteredActivities.reduce((sum, activity) => sum + activity.hours, 0);
    const dailyBreakdown = getDailyBreakdown(filteredActivities);
    
    const memberReport = {
      memberId: member.memberId,
      name: member.name,
      totalHours,
      dailyBreakdown,
      ...(startDate || endDate ? { 
        dateFilter: { 
          ...(startDate && { startDate }), 
          ...(endDate && { endDate }) 
        } 
      } : {})
    };
    
    res.json(memberReport);
  } catch (error) {
    console.error('Error generating member report:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate member report'
    });
  }
};

// ==================== ROUTES ====================

app.get('/report/overview', getOverviewReport);
app.get('/report/member/:memberId', getMemberReport);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// List all available endpoints
app.get('/', (req, res) => {
  res.json({
    message: 'B2B SaaS Productivity Dashboard API',
    endpoints: {
      'GET /': 'This help message',
      'GET /health': 'Health check',
      'GET /report/overview': 'Summary report across all companies (supports ?startDate&endDate)',
      'GET /report/member/:memberId': 'Daily activity log for a member (supports ?startDate&endDate)'
    },
    availableMembers: getAllMembersFlattened().map(m => ({ 
      id: m.memberId, 
      name: m.name, 
      team: m.teamName 
    }))
  });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableEndpoints: [
      'GET /',
      'GET /health', 
      'GET /report/overview',
      'GET /report/member/:memberId'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong!'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Productivity Dashboard API running on port ${PORT}`);
  console.log(`📊 Overview: http://localhost:${PORT}/report/overview`);
  console.log(`👤 Member report: http://localhost:${PORT}/report/member/mem_1`);
  console.log(`📅 Date filtering: Add ?startDate=2024-03-01&endDate=2024-03-03`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  console.log(`📖 API docs: http://localhost:${PORT}/`);
});

module.exports = app;