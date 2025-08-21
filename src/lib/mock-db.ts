export interface Project {
  id: string
  title: string
  createdAt: string
}

export const mockProjects: Record<string, Project[]> = {
  // key = user id
  "mock-user": [
    { id: "proj-1", title: "My First Book", createdAt: "2025-08-01" },
    { id: "proj-2", title: "Travel Memoir", createdAt: "2025-08-14" },
  ],
  "1": [ // Demo user projects
    { id: "proj-1", title: "My First Novel", createdAt: "2024-01-10" },
    { id: "proj-2", title: "Poetry Collection", createdAt: "2024-02-15" },
    { id: "proj-3", title: "Business Guide", createdAt: "2024-03-20" },
  ],
  "2": [ // Free user projects
    { id: "proj-4", title: "Short Stories", createdAt: "2024-01-25" },
  ],
  "guest": [ // Guest user projects
    { id: "proj-5", title: "Sample Project", createdAt: "2024-12-01" },
  ],
}

// Hook to get projects for a specific user
export function useMockProjects(userId: string | undefined): Project[] {
  if (!userId) return []
  return mockProjects[userId] || []
}

// Helper function to get a single project by ID across all users
export function getProjectById(projectId: string): Project | undefined {
  for (const userProjects of Object.values(mockProjects)) {
    const project = userProjects.find(p => p.id === projectId)
    if (project) return project
  }
  return undefined
}

// Helper function to format date for display
export function formatProjectDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
} 