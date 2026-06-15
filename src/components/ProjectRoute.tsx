import { useParams } from 'react-router-dom';
import type { Project } from '../types';

interface ProjectRouteProps {
  projects: Project[];
  children: (project: Project) => React.ReactNode;
  fallback: React.ReactNode;
}

function ProjectRoute({ projects, children, fallback }: ProjectRouteProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const project = projectId ? projects.find((p) => p.id === projectId) ?? null : null;
  return <>{project ? children(project) : fallback}</>;
}

export default ProjectRoute;
