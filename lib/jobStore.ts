import { Job } from '@/types/index';

/** In-memory job store — initialised from JOBS_DATA env var on cold start */
let jobStore: Job[] | null = null;

function getInitialJobs(): Job[] {
  const envData = process.env.JOBS_DATA;
  if (!envData) return [];

  try {
    const parsed = JSON.parse(envData);
    return parsed.map((j: Record<string, unknown>) => ({
      ...j,
      postedDate: new Date(j.postedDate as string),
      deadline: j.deadline ? new Date(j.deadline as string) : undefined,
    }));
  } catch {
    console.error('Failed to parse JOBS_DATA env var');
    return [];
  }
}

export function getJobs(): Job[] {
  if (jobStore === null) {
    jobStore = getInitialJobs();
  }
  return jobStore;
}

export function addJob(job: Job): Job {
  if (jobStore === null) {
    jobStore = getInitialJobs();
  }
  jobStore.push(job);
  return job;
}

export function deleteJob(id: string): boolean {
  if (jobStore === null) {
    jobStore = getInitialJobs();
  }
  const before = jobStore.length;
  jobStore = jobStore.filter((j) => j.id !== id);
  return jobStore.length < before;
}

export function exportJobsJson(): string {
  return JSON.stringify(getJobs().map((j) => ({
    ...j,
    postedDate: j.postedDate instanceof Date ? j.postedDate.toISOString() : j.postedDate,
    deadline: j.deadline instanceof Date ? j.deadline.toISOString() : j.deadline,
  })));
}
