import { createClient } from '@/lib/supabase/server';
import { createIssueSchema } from '@/lib/validations/issue';
import { NextResponse } from 'next/server';

// POST /api/projects/[projectId]/issues - 이슈 생성
export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        { status: 401 }
      );
    }

    const validation = createIssueSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: validation.error.issues[0].message } },
        { status: 400 }
      );
    }

    // 프로젝트 조회 및 팀 멤버십 검증
    const { data: project } = await supabase
      .from('projects')
      .select('*, team:teams!inner(id)')
      .eq('id', projectId)
      .is('deleted_at', null)
      .single();

    if (!project) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '프로젝트를 찾을 수 없습니다' } },
        { status: 404 }
      );
    }

    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', project.team_id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!membership) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다' } },
        { status: 403 }
      );
    }

    // 프로젝트당 이슈 200개 제한 (AC-3)
    const { count } = await supabase
      .from('issues')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .is('deleted_at', null);

    if (count !== null && count >= 200) {
      return NextResponse.json(
        { success: false, error: { code: 'LIMIT_EXCEEDED', message: '프로젝트당 최대 200개의 이슈만 생성할 수 있습니다' } },
        { status: 400 }
      );
    }

    // issue_number 자동 생성 (AC-2)
    const { data: maxIssue } = await supabase
      .from('issues')
      .select('issue_number')
      .eq('project_id', projectId)
      .order('issue_number', { ascending: false })
      .limit(1)
      .single();

    const issueNumber = (maxIssue?.issue_number || 0) + 1;

    // 기본 상태(Backlog) 조회 (AC-4)
    const { data: defaultStatus } = await supabase
      .from('statuses')
      .select('id')
      .eq('project_id', projectId)
      .eq('name', 'Backlog')
      .single();

    if (!defaultStatus) {
      return NextResponse.json(
        { success: false, error: { code: 'CONFIGURATION_ERROR', message: '프로젝트에 기본 상태가 설정되지 않았습니다' } },
        { status: 500 }
      );
    }

    const { title, description, priority, assigneeId, dueDate, labelIds } = validation.data;

    // 이슈 생성
    const { data: issue, error: insertError } = await supabase
      .from('issues')
      .insert({
        project_id: projectId,
        owner_id: user.id,
        assignee_id: assigneeId || null,
        status_id: defaultStatus.id,
        issue_number: issueNumber,
        title,
        description: description || null,
        priority,
        due_date: dueDate || null,
        position: issueNumber,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: '이슈 생성 실패' } },
        { status: 500 }
      );
    }

    // 라벨 연결
    if (labelIds && labelIds.length > 0) {
      await supabase
        .from('issue_labels')
        .insert(labelIds.map((labelId) => ({ issue_id: issue.id, label_id: labelId })));
    }

    return NextResponse.json({ success: true, data: issue }, { status: 201 });
  } catch (error) {
    console.error('POST /api/projects/[projectId]/issues error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류' } },
      { status: 500 }
    );
  }
}

// GET /api/projects/[projectId]/issues - 이슈 목록 조회 (검색/필터/정렬 지원)
export async function GET(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        { status: 401 }
      );
    }

    // 쿼리 파라미터 파싱 (AC: #1, #3~8, #11)
    const search = searchParams.get('search') || '';
    const statusFilter = searchParams.get('status')?.split(',').filter(Boolean) || [];
    const priorityFilter = searchParams.get('priority')?.split(',').filter(Boolean) || [];
    const assigneeFilter = searchParams.get('assignee') || '';
    const labelFilter = searchParams.get('label')?.split(',').filter(Boolean) || [];
    const dueDateFrom = searchParams.get('dueDateFrom') || '';
    const dueDateTo = searchParams.get('dueDateTo') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // 기본 쿼리 구성
    let query = supabase
      .from('issues')
      .select(
        `
        *,
        status:statuses(id, name, color),
        assignee:profiles(id, name, email, avatar_url),
        owner:profiles!issues_owner_id_fkey(id, name),
        labels:issue_labels(label:labels(id, name, color))
      `
      )
      .eq('project_id', projectId)
      .is('deleted_at', null);

    // 검색 필터 (AC-1: 제목 검색)
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    // 상태 필터 (AC-3)
    if (statusFilter.length > 0) {
      query = query.in('status_id', statusFilter);
    }

    // 우선순위 필터 (AC-4)
    if (priorityFilter.length > 0) {
      query = query.in('priority', priorityFilter);
    }

    // 담당자 필터 (AC-5)
    if (assigneeFilter === 'unassigned') {
      query = query.is('assignee_id', null);
    } else if (assigneeFilter) {
      query = query.eq('assignee_id', assigneeFilter);
    }

    // 마감일 범위 필터 (AC-7)
    if (dueDateFrom) {
      query = query.gte('due_date', dueDateFrom);
    }
    if (dueDateTo) {
      query = query.lte('due_date', dueDateTo);
    }

    // 정렬 (AC-11)
    const sortMapping: Record<string, string> = {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      dueDate: 'due_date',
    };

    if (sortBy === 'priority') {
      // 우선순위 정렬은 클라이언트에서 처리 (HIGH > MEDIUM > LOW)
      query = query.order('created_at', { ascending: sortOrder === 'asc' });
    } else {
      const sortColumn = sortMapping[sortBy] || 'created_at';
      query = query.order(sortColumn, { ascending: sortOrder === 'asc' });
    }

    const { data: issues, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: '이슈 목록 조회 실패' } },
        { status: 500 }
      );
    }

    // 라벨 필터 적용 (AC-6: 클라이언트 사이드 필터링 - Supabase 제한)
    let filteredIssues = issues || [];
    if (labelFilter.length > 0) {
      filteredIssues = filteredIssues.filter((issue: any) => {
        const issueLabels = issue.labels?.map((il: any) => il.label?.id) || [];
        return labelFilter.every((labelId) => issueLabels.includes(labelId));
      });
    }

    // 우선순위 정렬 (클라이언트 사이드)
    if (sortBy === 'priority') {
      const priorityOrder: Record<string, number> = { HIGH: 1, MEDIUM: 2, LOW: 3 };
      filteredIssues.sort((a: any, b: any) => {
        const orderA = priorityOrder[a.priority] || 99;
        const orderB = priorityOrder[b.priority] || 99;
        return sortOrder === 'asc' ? orderA - orderB : orderB - orderA;
      });
    }

    return NextResponse.json({ success: true, data: filteredIssues });
  } catch (error) {
    console.error('GET /api/projects/[projectId]/issues error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류' } },
      { status: 500 }
    );
  }
}
