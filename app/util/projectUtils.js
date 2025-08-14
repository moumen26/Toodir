// utils/projectUtils.js

export const formatProjectStatus = (status) => {
  if (!status) return 'Planning';
  
  const statusMap = {
    'active': 'In Progress',
    'completed': 'Completed',
    'done': 'Completed',
    'review': 'Review',
    'planning': 'Planning',
    'pending': 'Planning'
  };
  
  return statusMap[status.toLowerCase()] || status;
};

export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'done':
      return '#10B981';
    case 'active':
    case 'in progress':
    case 'in-progress':
      return '#8B5CF6';
    default:
      return '#6B7280';
  }
};

export const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'high':
      return '#EF4444';
    case 'medium':
      return '#F59E0B';
    case 'low':
      return '#10B981';
    default:
      return '#6B7280';
  }
};

export const calculateProjectProgress = (project) => {
  // Use backend calculated progress if available
  if (project.progress_percentage !== undefined) {
    return project.progress_percentage;
  }
  
  // Fallback calculation based on tasks
  const totalTasks = project.total_tasks || 0;
  const closedTasks = project.closed_tasks || 0;
  
  if (totalTasks === 0) return 0;
  return Math.round((closedTasks / totalTasks) * 100);
};

export const formatProjectStats = (projects) => {
  if (!projects || projects.length === 0) {
    return {
      total: 0,
      completed: 0,
      inProgress: 0,
      review: 0,
      planning: 0,
      avgProgress: 0,
    };
  }

  const stats = {
    total: projects.length,
    completed: 0,
    inProgress: 0,
    review: 0,
    planning: 0,
    avgProgress: 0,
  };

  let totalProgress = 0;
  
  projects.forEach(project => {
    const status = project.status?.toLowerCase();
    switch (status) {
      case 'completed':
      case 'done':
        stats.completed++;
        break;
      case 'active':
      case 'in progress':
      case 'in-progress':
        stats.inProgress++;
        break;
      case 'review':
        stats.review++;
        break;
      case 'planning':
      case 'pending':
      default:
        stats.planning++;
        break;
    }
    totalProgress += project.progress_percentage || 0;
  });

  stats.avgProgress = totalProgress / projects.length;
  return stats;
};