import HomeSkeleton from './HomeSkeleton';
import TasksSkeleton from './TasksSkeleton';
import ProjectsSkeleton from './ProjectsSkeleton';
import ProjectDetailSkeleton from './ProjectDetailSkeleton';
import HabitsSkeleton from './HabitsSkeleton';
import PomodoroSkeleton from './PomodoroSkeleton';
import CalendarSkeleton from './CalendarSkeleton';

interface PageSkeletonProps {
  pathname: string;
}

export default function PageSkeleton({ pathname }: PageSkeletonProps) {
  if (pathname.startsWith('/app/projects/')) return <ProjectDetailSkeleton />;
  if (pathname.startsWith('/app/projects')) return <ProjectsSkeleton />;
  if (pathname.startsWith('/app/habits')) return <HabitsSkeleton />;
  if (pathname.startsWith('/app/pomodoro')) return <PomodoroSkeleton />;
  if (pathname.startsWith('/app/calendar')) return <CalendarSkeleton />;
  if (pathname.startsWith('/app/settings')) return <TasksSkeleton />;
  if (pathname.startsWith('/app/home') || pathname.startsWith('/app/templates')) return <HomeSkeleton />;
  if (pathname.startsWith('/app/tasks')) return <TasksSkeleton />;
  return <TasksSkeleton />;
}
