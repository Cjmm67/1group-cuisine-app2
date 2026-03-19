import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getJobs, addJob, deleteJob, exportJobsJson } from '@/lib/jobStore';

export const runtime = 'nodejs';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-1cuisinesg-secret-change-in-production'
);

async function getUser(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { email: payload.email as string, role: payload.role as string };
  } catch {
    return null;
  }
}

/** GET /api/jobs — returns all jobs */
export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const jobs = getJobs();
  const exportParam = request.nextUrl.searchParams.get('export');

  if (exportParam === 'true') {
    return NextResponse.json({ jobs, exportJson: exportJobsJson() });
  }

  return NextResponse.json({ jobs });
}

/** POST /api/jobs — add a new job (admin only) */
export async function POST(request: NextRequest) {
  const user = await getUser(request);
  if (!user || (user.role !== 'admin' && user.role !== 'master_admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();

    const job = {
      id: `job-${Date.now()}`,
      title: body.title,
      restaurant: body.restaurant,
      position: body.position || body.title,
      cuisine: body.cuisine || [],
      location: body.location || 'Singapore',
      salary: body.salary || undefined,
      description: body.description,
      requirements: body.requirements || [],
      experienceLevel: body.experienceLevel || 'mid',
      type: body.type || 'full_time',
      postedDate: new Date(),
      deadline: body.deadline ? new Date(body.deadline) : undefined,
    };

    addJob(job);
    return NextResponse.json({ job }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid job data' }, { status: 400 });
  }
}

/** DELETE /api/jobs?id=xxx — remove a job (admin only) */
export async function DELETE(request: NextRequest) {
  const user = await getUser(request);
  if (!user || (user.role !== 'admin' && user.role !== 'master_admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
  }

  const deleted = deleteJob(id);
  if (!deleted) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
