-- APTORA single-file Supabase schema. Run as project owner in SQL editor.
-- Private application data is in schema aptora. Expose only safe view/RPC
-- objects through Supabase API settings. All user RPCs use invoker privileges.
begin;
create schema if not exists aptora;
revoke all on schema aptora from public, anon, authenticated;
grant usage on schema aptora to anon, authenticated;

create type aptora.app_role as enum ('student','employer','admin','super_admin');
create type aptora.account_status as enum ('active','suspended','deleted');
create type aptora.verification_status as enum ('pending','under_review','approved','rejected','suspended');
create type aptora.placement_status as enum ('draft','pending_review','published','rejected','closed','archived');
create type aptora.work_mode as enum ('onsite','hybrid','remote');
create type aptora.application_status as enum ('submitted','under_review','shortlisted','interview','accepted','rejected','withdrawn');
create type aptora.document_type as enum ('cv','resume','cover_letter','transcript','proof_of_enrollment','portfolio','employer_verification','other');
create type aptora.notification_type as enum ('application','placement','verification','message','system','deadline','recommendation');

create table aptora.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 role aptora.app_role not null default 'student', status aptora.account_status not null default 'active',
 full_name text not null check(length(trim(full_name)) between 2 and 160), email text not null,
 phone text, avatar_path text, address text, bio text check(bio is null or length(bio)<=2000),
 linkedin_url text, github_url text, portfolio_url text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
 check(linkedin_url is null or linkedin_url ~ '^https?://'), check(github_url is null or github_url ~ '^https?://'), check(portfolio_url is null or portfolio_url ~ '^https?://')
);
create table aptora.students (
 id uuid primary key references aptora.profiles(id) on delete cascade,
 matric_number text not null unique check(length(trim(matric_number)) between 3 and 40), faculty text not null,
 department text not null, course_of_study text not null, level smallint not null check(level between 100 and 800),
 cgpa numeric(4,2) check(cgpa between 0 and 5), cgpa_scale numeric(3,1) not null default 5 check(cgpa_scale between 1 and 10),
 graduation_year smallint check(graduation_year between 2000 and 2150), siwes_eligible boolean not null default false,
 preferred_duration_weeks smallint check(preferred_duration_weeks between 1 and 104),
 preferred_locations text[] not null default '{}', preferred_work_modes aptora.work_mode[] not null default '{}',
 profile_visibility boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table aptora.employers (
 id uuid primary key references aptora.profiles(id) on delete cascade,
 organization_name text not null check(length(trim(organization_name)) between 2 and 200), organization_slug text not null unique,
 organization_type text, industry text, website_url text, organization_email text not null, organization_phone text,
 address text not null, city text, state text, country text not null default 'Nigeria',
 description text check(description is null or length(description)<=5000), logo_path text,
 verification_status aptora.verification_status not null default 'pending', verified_at timestamptz,
 verified_by uuid references aptora.profiles(id) on delete set null, rejection_reason text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(website_url is null or website_url ~ '^https?://')
);
create table aptora.skills (
 id uuid primary key default gen_random_uuid(), name text not null unique check(length(trim(name)) between 1 and 80),
 normalized_name text generated always as(lower(trim(name))) stored unique,
 category text not null default 'general', is_active boolean not null default true, created_at timestamptz not null default now()
);
create table aptora.student_skills (
 student_id uuid not null references aptora.students(id) on delete cascade,
 skill_id uuid not null references aptora.skills(id) on delete restrict,
 proficiency smallint not null default 3 check(proficiency between 1 and 5),
 years_experience numeric(3,1) check(years_experience between 0 and 50), verified boolean not null default false,
 created_at timestamptz not null default now(), primary key(student_id,skill_id)
);
create table aptora.student_interests (
 student_id uuid not null references aptora.students(id) on delete cascade, category text not null,
 priority smallint not null default 3 check(priority between 1 and 5), created_at timestamptz not null default now(), primary key(student_id,category)
);
create table aptora.placements (
 id uuid primary key default gen_random_uuid(), employer_id uuid not null references aptora.employers(id) on delete restrict,
 title text not null check(length(trim(title)) between 5 and 180), slug text not null, category text not null,
 employment_type text not null default 'internship', work_mode aptora.work_mode not null, location text not null,
 description text not null check(length(description) between 40 and 12000), responsibilities text[] not null default '{}',
 required_skills text[] not null default '{}', preferred_skills text[] not null default '{}', required_departments text[] not null default '{}',
 min_level smallint check(min_level between 100 and 800), max_level smallint check(max_level between 100 and 800),
 min_cgpa numeric(4,2) check(min_cgpa between 0 and 5), cgpa_scale numeric(3,1) not null default 5 check(cgpa_scale between 1 and 10),
 siwes_required boolean not null default false, duration_weeks smallint check(duration_weeks between 1 and 104),
 slots smallint not null default 1 check(slots between 1 and 1000), application_instructions text,
 application_deadline timestamptz, start_date date, end_date date, status aptora.placement_status not null default 'draft',
 approved_at timestamptz, approved_by uuid references aptora.profiles(id) on delete set null, rejection_reason text,
 view_count bigint not null default 0 check(view_count>=0), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(employer_id,slug), check(min_level is null or max_level is null or min_level<=max_level), check(start_date is null or end_date is null or start_date<=end_date)
);
create table aptora.applications (
 id uuid primary key default gen_random_uuid(), placement_id uuid not null references aptora.placements(id) on delete restrict,
 student_id uuid not null references aptora.students(id) on delete restrict, status aptora.application_status not null default 'submitted',
 cover_letter text check(cover_letter is null or length(cover_letter)<=10000), resume_document_id uuid,
 submitted_at timestamptz not null default now(), reviewed_at timestamptz, reviewed_by uuid references aptora.profiles(id) on delete set null,
 employer_notes text, student_withdrawn_at timestamptz, updated_at timestamptz not null default now(), unique(placement_id,student_id)
);
create table aptora.application_events (
 id uuid primary key default gen_random_uuid(), application_id uuid not null references aptora.applications(id) on delete cascade,
 actor_id uuid references aptora.profiles(id) on delete set null, from_status aptora.application_status,
 to_status aptora.application_status not null, note text, created_at timestamptz not null default now()
);
create table aptora.saved_placements (
 student_id uuid not null references aptora.students(id) on delete cascade,
 placement_id uuid not null references aptora.placements(id) on delete cascade,
 created_at timestamptz not null default now(), primary key(student_id,placement_id)
);
create table aptora.match_settings (
 id smallint primary key default 1 check(id=1), skill_weight numeric(5,4) not null default .45 check(skill_weight between 0 and 1),
 academic_weight numeric(5,4) not null default .20 check(academic_weight between 0 and 1),
 interest_weight numeric(5,4) not null default .15 check(interest_weight between 0 and 1),
 location_weight numeric(5,4) not null default .10 check(location_weight between 0 and 1),
 duration_weight numeric(5,4) not null default .10 check(duration_weight between 0 and 1),
 min_recommendation_score numeric(5,2) not null default 35 check(min_recommendation_score between 0 and 100),
 updated_by uuid references aptora.profiles(id) on delete set null, updated_at timestamptz not null default now(),
 check(skill_weight+academic_weight+interest_weight+location_weight+duration_weight=1)
);
insert into aptora.match_settings(id) values(1);
create table aptora.recommendations (
 student_id uuid not null references aptora.students(id) on delete cascade, placement_id uuid not null references aptora.placements(id) on delete cascade,
 match_score numeric(5,2) not null check(match_score between 0 and 100), skill_score numeric(5,2) not null check(skill_score between 0 and 100),
 academic_score numeric(5,2) not null check(academic_score between 0 and 100), interest_score numeric(5,2) not null check(interest_score between 0 and 100),
 location_score numeric(5,2) not null check(location_score between 0 and 100), duration_score numeric(5,2) not null check(duration_score between 0 and 100),
 explanation jsonb not null default '{}', calculated_at timestamptz not null default now(), primary key(student_id,placement_id)
);
create table aptora.documents (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references aptora.profiles(id) on delete cascade,
 document_type aptora.document_type not null, storage_path text not null unique, original_filename text not null check(length(original_filename)<=255),
 mime_type text not null, file_size_bytes bigint not null check(file_size_bytes between 1 and 10485760),
 is_primary boolean not null default false, created_at timestamptz not null default now(), deleted_at timestamptz
);
alter table aptora.applications add constraint applications_resume_document_fk foreign key(resume_document_id) references aptora.documents(id) on delete set null;
create table aptora.notifications (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references aptora.profiles(id) on delete cascade,
 notification_type aptora.notification_type not null, title text not null check(length(title) between 1 and 160),
 body text not null check(length(body) between 1 and 2000), href text, read_at timestamptz, created_at timestamptz not null default now()
);
create table aptora.contact_messages (
 id uuid primary key default gen_random_uuid(), name text not null check(length(trim(name)) between 2 and 160), email text not null,
 subject text not null check(length(trim(subject)) between 2 and 180), message text not null check(length(trim(message)) between 10 and 5000),
 sender_id uuid references aptora.profiles(id) on delete set null, status text not null default 'new' check(status in ('new','in_progress','resolved','spam')),
 assigned_to uuid references aptora.profiles(id) on delete set null, created_at timestamptz not null default now(), resolved_at timestamptz
);
create table aptora.conversations (
 id uuid primary key default gen_random_uuid(), application_id uuid references aptora.applications(id) on delete set null,
 subject text not null check(length(subject) between 1 and 180), created_by uuid not null references aptora.profiles(id) on delete restrict,
 created_at timestamptz not null default now(), archived_at timestamptz
);
create table aptora.conversation_members (
 conversation_id uuid not null references aptora.conversations(id) on delete cascade,
 user_id uuid not null references aptora.profiles(id) on delete cascade,
 joined_at timestamptz not null default now(), last_read_at timestamptz, primary key(conversation_id,user_id)
);
create table aptora.messages (
 id uuid primary key default gen_random_uuid(), conversation_id uuid not null references aptora.conversations(id) on delete cascade,
 sender_id uuid not null references aptora.profiles(id) on delete restrict, body text not null check(length(trim(body)) between 1 and 10000),
 created_at timestamptz not null default now(), edited_at timestamptz, deleted_at timestamptz
);
create table aptora.audit_logs (
 id bigint generated always as identity primary key, actor_id uuid references aptora.profiles(id) on delete set null,
 action text not null, entity_type text not null, entity_id text, old_values jsonb, new_values jsonb,
 ip_address inet, user_agent text, created_at timestamptz not null default now()
);

create index profiles_role_status_idx on aptora.profiles(role,status);
create index students_department_level_idx on aptora.students(department,level);
create index employers_verification_idx on aptora.employers(verification_status);
create index placements_public_search_idx on aptora.placements(status,application_deadline,category,location);
create index placements_employer_created_idx on aptora.placements(employer_id,created_at desc);
create index placements_required_skills_idx on aptora.placements using gin(required_skills);
create index student_skills_skill_idx on aptora.student_skills(skill_id,student_id);
create index applications_student_idx on aptora.applications(student_id,submitted_at desc);
create index applications_placement_status_idx on aptora.applications(placement_id,status,submitted_at desc);
create index application_events_application_idx on aptora.application_events(application_id,created_at);
create index recommendations_student_score_idx on aptora.recommendations(student_id,match_score desc);
create index notifications_user_unread_idx on aptora.notifications(user_id,created_at desc) where read_at is null;
create index documents_owner_idx on aptora.documents(owner_id,created_at desc) where deleted_at is null;
create index contact_messages_status_idx on aptora.contact_messages(status,created_at desc);
create index messages_conversation_created_idx on aptora.messages(conversation_id,created_at desc) where deleted_at is null;
create index audit_logs_actor_created_idx on aptora.audit_logs(actor_id,created_at desc);
create index audit_logs_entity_idx on aptora.audit_logs(entity_type,entity_id,created_at desc);

create function aptora.current_role() returns aptora.app_role language sql stable security invoker set search_path=''
as $$ select role from aptora.profiles where id=(select auth.uid()) and status='active' and deleted_at is null $$;
create function aptora.is_admin() returns boolean language sql stable security invoker set search_path=''
as $$ select coalesce(aptora.current_role() in ('admin','super_admin'),false) $$;
create function aptora.is_super_admin() returns boolean language sql stable security invoker set search_path=''
as $$ select coalesce(aptora.current_role()='super_admin',false) $$;
create function aptora.touch_updated_at() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at:=now(); return new; end $$;

-- Public signup metadata accepts student/employer only; profiles otherwise
-- default to student. Trigger is the sole routine here needing definer rights.
create function aptora.create_profile_for_auth_user() returns trigger language plpgsql security definer set search_path=''
as $$ declare r text;
begin
 r:=coalesce(new.raw_user_meta_data->>'role','student');
 if r not in ('student','employer') then raise exception 'Invalid public account role'; end if;
 insert into aptora.profiles(id,role,full_name,email,phone) values(new.id,r::aptora.app_role,
  coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'),''),split_part(new.email,'@',1)),lower(new.email),nullif(trim(new.raw_user_meta_data->>'phone'),''));
 if r='student' then
  insert into aptora.students(id,matric_number,faculty,department,course_of_study,level) values(new.id,
   coalesce(nullif(trim(new.raw_user_meta_data->>'matric_number'),''),'PENDING-'||new.id::text),
   coalesce(nullif(trim(new.raw_user_meta_data->>'faculty'),''),'Pending'),coalesce(nullif(trim(new.raw_user_meta_data->>'department'),''),'Pending'),
   coalesce(nullif(trim(new.raw_user_meta_data->>'course_of_study'),''),'Pending'),coalesce(nullif(new.raw_user_meta_data->>'level','')::smallint,100));
 else
  insert into aptora.employers(id,organization_name,organization_slug,organization_email,organization_phone,address,website_url,description) values(new.id,
   coalesce(nullif(trim(new.raw_user_meta_data->>'organization_name'),''),'Pending organization'),'pending-'||new.id::text,
   lower(coalesce(nullif(trim(new.raw_user_meta_data->>'organization_email'),''),new.email)),nullif(trim(new.raw_user_meta_data->>'phone'),''),
   coalesce(nullif(trim(new.raw_user_meta_data->>'address'),''),'Pending'),nullif(trim(new.raw_user_meta_data->>'website_url'),''),nullif(trim(new.raw_user_meta_data->>'description'),''));
 end if;
 return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function aptora.create_profile_for_auth_user();

create function aptora.guard_profile_privileges() returns trigger language plpgsql security invoker set search_path=''
as $$ begin
 if new.role is distinct from old.role and not aptora.is_super_admin() then raise exception 'Only a super administrator can change user roles'; end if;
 if new.status is distinct from old.status and not aptora.is_admin() then raise exception 'Only an administrator can change account status'; end if;
 if new.status is distinct from old.status and (new.id=(select auth.uid()) or old.role in ('admin','super_admin')) and not aptora.is_super_admin() then raise exception 'Only a super administrator can change privileged account status'; end if;
 if new.email is distinct from old.email and new.id<>(select auth.uid()) and not aptora.is_admin() then raise exception 'Cannot change another user email'; end if;
 new.updated_at:=now(); return new;
end $$;
create trigger profiles_guard_before_update before update on aptora.profiles for each row execute function aptora.guard_profile_privileges();

create function aptora.guard_employer_verification() returns trigger language plpgsql security invoker set search_path=''
as $$ begin
 if new.id<>old.id then raise exception 'Employer identity cannot be changed'; end if;
 if not aptora.is_admin() and (new.verification_status is distinct from old.verification_status or new.verified_at is distinct from old.verified_at or new.verified_by is distinct from old.verified_by or new.rejection_reason is distinct from old.rejection_reason) then
  raise exception 'Only an administrator can change employer verification';
 end if;
 new.updated_at:=now(); return new;
end $$;
create trigger employers_guard_before_update before update on aptora.employers for each row execute function aptora.guard_employer_verification();

create function aptora.guard_placement_write() returns trigger language plpgsql security invoker set search_path=''
as $$ begin
 if tg_op='INSERT' then
  if new.employer_id<>(select auth.uid()) or aptora.current_role()<>'employer' then raise exception 'Placement owner must be the authenticated employer'; end if;
  new.status:='draft';
 else
  if new.employer_id<>old.employer_id then raise exception 'Placement owner cannot be changed'; end if;
  if not aptora.is_admin() and old.status in ('pending_review','published','closed','archived') and (to_jsonb(new)-array['status','updated_at','view_count']) is distinct from (to_jsonb(old)-array['status','updated_at','view_count']) then raise exception 'Placement details are locked while under review or published'; end if;
  if new.status is distinct from old.status and not aptora.is_admin() and not((old.status in ('draft','rejected') and new.status='pending_review') or (old.status='published' and new.status='closed')) then raise exception 'Employers can only submit drafts or close published placements'; end if;
  if new.status='published' then
   if not aptora.is_admin() then raise exception 'Only administrators can publish placements'; end if;
   if not exists(select 1 from aptora.employers e where e.id=new.employer_id and e.verification_status='approved') then raise exception 'Only verified employers can be published'; end if;
  end if;
 end if;
 new.updated_at:=now(); return new;
end $$;
create trigger placements_guard_before_write before insert or update on aptora.placements for each row execute function aptora.guard_placement_write();

create function aptora.guard_application_status() returns trigger language plpgsql security invoker set search_path=''
as $$ declare s aptora.students%rowtype; begin
 if tg_op='INSERT' then
  if new.student_id<>(select auth.uid()) or aptora.current_role()<>'student' then raise exception 'Application student must be the authenticated student'; end if;
  if not exists(select 1 from aptora.placements p where p.id=new.placement_id and p.status='published' and (p.application_deadline is null or p.application_deadline>now())) then raise exception 'Placement is not open for applications'; end if;
  select * into s from aptora.students where id=new.student_id;
  if not found or exists(select 1 from aptora.placements p where p.id=new.placement_id and ((p.min_level is not null and s.level<p.min_level) or (p.max_level is not null and s.level>p.max_level) or (p.siwes_required and not s.siwes_eligible) or (p.min_cgpa is not null and (s.cgpa is null or s.cgpa/s.cgpa_scale*p.cgpa_scale<p.min_cgpa)) or (cardinality(p.required_departments)>0 and not(s.department=any(p.required_departments))))) then raise exception 'Student does not meet placement eligibility criteria'; end if;
  if exists(select 1 from aptora.placements p, unnest(p.required_skills) req(skill) where p.id=new.placement_id and not exists(select 1 from aptora.student_skills ss join aptora.skills sk on sk.id=ss.skill_id where ss.student_id=new.student_id and lower(sk.name)=lower(req.skill))) then raise exception 'Student does not have every required skill'; end if;
  new.status:='submitted';
 else
  if new.student_id<>old.student_id or new.placement_id<>old.placement_id then raise exception 'Application ownership and placement are immutable'; end if;
  if new.student_id=(select auth.uid()) and not aptora.is_admin() then
   if new.status is distinct from old.status then
    if new.status<>'withdrawn' or (to_jsonb(new)-array['status','student_withdrawn_at','updated_at']) is distinct from (to_jsonb(old)-array['status','student_withdrawn_at','updated_at']) then raise exception 'Students may only withdraw their own application'; end if;
   elsif to_jsonb(new) is distinct from to_jsonb(old) then raise exception 'Submitted application details cannot be edited'; end if;
  elsif exists(select 1 from aptora.placements p where p.id=old.placement_id and p.employer_id=(select auth.uid())) and not aptora.is_admin() then
   if (to_jsonb(new)-array['status','employer_notes','reviewed_at','reviewed_by','updated_at']) is distinct from (to_jsonb(old)-array['status','employer_notes','reviewed_at','reviewed_by','updated_at']) then raise exception 'Employers may only update review status and notes'; end if;
  end if;
  if new.status is distinct from old.status then
   if aptora.is_admin() then null;
   elsif new.student_id=(select auth.uid()) and old.status in ('submitted','under_review','shortlisted','interview') and new.status='withdrawn' then new.student_withdrawn_at:=now();
   elsif exists(select 1 from aptora.placements p where p.id=old.placement_id and p.employer_id=(select auth.uid())) and old.status in ('submitted','under_review','shortlisted','interview') and new.status in ('under_review','shortlisted','interview','accepted','rejected') then null;
   else raise exception 'Not authorized for this application status transition'; end if;
   new.reviewed_at:=now(); new.reviewed_by:=(select auth.uid());
  end if;
  new.updated_at:=now();
 end if;
 return new;
end $$;
create trigger applications_guard_before_write before insert or update on aptora.applications for each row execute function aptora.guard_application_status();
create function aptora.record_application_status_event() returns trigger language plpgsql security definer set search_path=''
as $$ begin
 insert into aptora.application_events(application_id,actor_id,from_status,to_status)
 values(new.id,(select auth.uid()),old.status,new.status);
 return new;
end $$;
revoke all on function aptora.record_application_status_event() from public,anon,authenticated;
create trigger applications_status_event after update of status on aptora.applications
for each row when(old.status is distinct from new.status) execute function aptora.record_application_status_event();

create function aptora.notify_application_change() returns trigger language plpgsql security definer set search_path=''
as $$ declare placement_title text; employer_id uuid; begin
 select p.title,p.employer_id into placement_title,employer_id from aptora.placements p where p.id=new.placement_id;
 if tg_op='INSERT' then
  insert into aptora.notifications(user_id,notification_type,title,body,href)
  values(employer_id,'application','New application received','A student applied for '||placement_title||'.','/employer/applications?placement='||new.placement_id::text);
 else
  insert into aptora.notifications(user_id,notification_type,title,body,href)
  values(new.student_id,'application','Application status updated','Your application for '||placement_title||' is now '||replace(new.status::text,'_',' ')||'.','/student/applications');
 end if;
 return new;
end $$;
revoke all on function aptora.notify_application_change() from public,anon,authenticated;
create trigger applications_notify_insert after insert on aptora.applications for each row execute function aptora.notify_application_change();
create trigger applications_notify_status after update of status on aptora.applications for each row when(old.status is distinct from new.status) execute function aptora.notify_application_change();

create function aptora.notify_employer_verification() returns trigger language plpgsql security definer set search_path=''
as $$ begin
 if new.verification_status is distinct from old.verification_status then
  insert into aptora.notifications(user_id,notification_type,title,body,href)
  values(new.id,'verification','Organization verification updated','Your organization status is now '||replace(new.verification_status::text,'_',' ')||'.','/employer/verification');
 end if;
 return new;
end $$;
revoke all on function aptora.notify_employer_verification() from public,anon,authenticated;
create trigger employers_notify_verification after update of verification_status on aptora.employers for each row when(old.verification_status is distinct from new.verification_status) execute function aptora.notify_employer_verification();

create function aptora.notify_placement_decision() returns trigger language plpgsql security definer set search_path=''
as $$ begin
 if new.status is distinct from old.status and new.status in('published','rejected') then
  insert into aptora.notifications(user_id,notification_type,title,body,href)
  values(new.employer_id,'placement',case when new.status='published' then 'Placement published' else 'Placement needs changes' end,
   case when new.status='published' then 'Your placement “'||new.title||'” is now visible to students.' else 'Your placement “'||new.title||'” was returned for changes.' end,'/employer/placements/'||new.id::text);
 end if;
 return new;
end $$;
revoke all on function aptora.notify_placement_decision() from public,anon,authenticated;
create trigger placements_notify_decision after update of status on aptora.placements for each row when(old.status is distinct from new.status and new.status in('published','rejected')) execute function aptora.notify_placement_decision();

create function aptora.audit_sensitive_change() returns trigger language plpgsql security definer set search_path=''
as $$ declare rid text;
begin
 rid:=coalesce(to_jsonb(new)->>'id',to_jsonb(old)->>'id');
 insert into aptora.audit_logs(actor_id,action,entity_type,entity_id,old_values,new_values)
 values((select auth.uid()),lower(tg_op),tg_table_name,rid,case when tg_op in('UPDATE','DELETE') then to_jsonb(old) end,case when tg_op in('INSERT','UPDATE') then to_jsonb(new) end);
 if tg_op='DELETE' then return old; else return new; end if;
end $$;
create trigger audit_profile_changes after update or delete on aptora.profiles for each row execute function aptora.audit_sensitive_change();
create trigger audit_employer_changes after insert or update on aptora.employers for each row execute function aptora.audit_sensitive_change();
create trigger audit_placement_changes after insert or update or delete on aptora.placements for each row execute function aptora.audit_sensitive_change();
create trigger profiles_touch_updated before update on aptora.profiles for each row execute function aptora.touch_updated_at();
create trigger students_touch_updated before update on aptora.students for each row execute function aptora.touch_updated_at();
create trigger employers_touch_updated before update on aptora.employers for each row execute function aptora.touch_updated_at();
create trigger applications_touch_updated before update on aptora.applications for each row execute function aptora.touch_updated_at();

do $$ declare t text; begin foreach t in array array['profiles','students','employers','skills','student_skills','student_interests','placements','applications','application_events','saved_placements','match_settings','recommendations','documents','notifications','contact_messages','conversations','conversation_members','messages','audit_logs'] loop execute format('alter table aptora.%I enable row level security',t); end loop; end $$;
create policy profiles_read_self_admin on aptora.profiles for select to authenticated using(id=(select auth.uid()) or aptora.is_admin());
create policy profiles_update_self_admin on aptora.profiles for update to authenticated using(id=(select auth.uid()) or aptora.is_admin()) with check(id=(select auth.uid()) or aptora.is_admin());
create policy students_read_self_admin on aptora.students for select to authenticated using(id=(select auth.uid()) or aptora.is_admin());
create policy students_update_self_admin on aptora.students for update to authenticated using(id=(select auth.uid()) or aptora.is_admin()) with check(id=(select auth.uid()) or aptora.is_admin());
create policy employers_read_self_admin on aptora.employers for select to authenticated using(id=(select auth.uid()) or aptora.is_admin());
create policy employers_update_self_admin on aptora.employers for update to authenticated using(id=(select auth.uid()) or aptora.is_admin()) with check(id=(select auth.uid()) or aptora.is_admin());
create policy skills_read_active on aptora.skills for select to authenticated using(is_active or aptora.is_admin());
create policy skills_admin_manage on aptora.skills for all to authenticated using(aptora.is_admin()) with check(aptora.is_admin());
create policy student_skills_owner on aptora.student_skills for all to authenticated using(student_id=(select auth.uid()) or aptora.is_admin()) with check(student_id=(select auth.uid()) or aptora.is_admin());
create policy student_interests_owner on aptora.student_interests for all to authenticated using(student_id=(select auth.uid()) or aptora.is_admin()) with check(student_id=(select auth.uid()) or aptora.is_admin());
create policy placements_read_owner_admin on aptora.placements for select to authenticated using(employer_id=(select auth.uid()) or aptora.is_admin());
create policy placements_read_published on aptora.placements for select to authenticated using(status='published' and (application_deadline is null or application_deadline>now()));
create policy placements_insert_employer_draft on aptora.placements for insert to authenticated with check(employer_id=(select auth.uid()) and aptora.current_role()='employer' and status='draft');
create policy placements_update_owner_admin on aptora.placements for update to authenticated using(employer_id=(select auth.uid()) or aptora.is_admin()) with check(employer_id=(select auth.uid()) or aptora.is_admin());
create policy placements_delete_draft on aptora.placements for delete to authenticated using((employer_id=(select auth.uid()) and status='draft') or aptora.is_admin());
create policy applications_read_participants on aptora.applications for select to authenticated using(student_id=(select auth.uid()) or aptora.is_admin() or exists(select 1 from aptora.placements p where p.id=applications.placement_id and p.employer_id=(select auth.uid())));
create policy applications_insert_student on aptora.applications for insert to authenticated with check(student_id=(select auth.uid()) and aptora.current_role()='student');
create policy applications_update_participants on aptora.applications for update to authenticated using(student_id=(select auth.uid()) or aptora.is_admin() or exists(select 1 from aptora.placements p where p.id=applications.placement_id and p.employer_id=(select auth.uid()))) with check(student_id=(select auth.uid()) or aptora.is_admin() or exists(select 1 from aptora.placements p where p.id=applications.placement_id and p.employer_id=(select auth.uid())));
create policy application_events_read_participants on aptora.application_events for select to authenticated using(aptora.is_admin() or exists(select 1 from aptora.applications a join aptora.placements p on p.id=a.placement_id where a.id=application_events.application_id and (a.student_id=(select auth.uid()) or p.employer_id=(select auth.uid()))));
create policy saved_placements_owner on aptora.saved_placements for all to authenticated using(student_id=(select auth.uid())) with check(student_id=(select auth.uid()));
create policy match_settings_read on aptora.match_settings for select to authenticated using(true);
create policy match_settings_admin_update on aptora.match_settings for update to authenticated using(aptora.is_admin()) with check(aptora.is_admin());
create policy recommendations_owner_read on aptora.recommendations for select to authenticated using(student_id=(select auth.uid()) or aptora.is_admin());
create policy documents_owner_read on aptora.documents for select to authenticated using(owner_id=(select auth.uid()) or aptora.is_admin() or exists(select 1 from aptora.applications a join aptora.placements p on p.id=a.placement_id where a.resume_document_id=documents.id and p.employer_id=(select auth.uid())));
create policy documents_owner_insert on aptora.documents for insert to authenticated with check(owner_id=(select auth.uid()) and aptora.current_role() in('student','employer'));
create policy documents_owner_delete on aptora.documents for delete to authenticated using(owner_id=(select auth.uid()) or aptora.is_admin());
create policy notifications_owner_read on aptora.notifications for select to authenticated using(user_id=(select auth.uid()) or aptora.is_admin());
create policy notifications_owner_update on aptora.notifications for update to authenticated using(user_id=(select auth.uid()) or aptora.is_admin()) with check(user_id=(select auth.uid()) or aptora.is_admin());
create policy notifications_admin_insert on aptora.notifications for insert to authenticated with check(aptora.is_admin());
create policy contact_public_insert on aptora.contact_messages for insert to anon,authenticated with check(sender_id is null or sender_id=(select auth.uid()));
create policy contact_admin_read on aptora.contact_messages for select to authenticated using(aptora.is_admin());
create policy contact_admin_update on aptora.contact_messages for update to authenticated using(aptora.is_admin()) with check(aptora.is_admin());
create policy conversations_member_read on aptora.conversations for select to authenticated using(aptora.is_admin() or exists(select 1 from aptora.conversation_members m where m.conversation_id=conversations.id and m.user_id=(select auth.uid())));
create policy conversations_create_self on aptora.conversations for insert to authenticated with check(created_by=(select auth.uid()));
create policy conversation_members_read on aptora.conversation_members for select to authenticated using(user_id=(select auth.uid()) or aptora.is_admin());
create policy conversation_members_admin_add on aptora.conversation_members for insert to authenticated with check(aptora.is_admin());
create policy messages_member_read on aptora.messages for select to authenticated using(aptora.is_admin() or exists(select 1 from aptora.conversation_members m where m.conversation_id=messages.conversation_id and m.user_id=(select auth.uid())));
create policy messages_member_insert on aptora.messages for insert to authenticated with check(sender_id=(select auth.uid()) and exists(select 1 from aptora.conversation_members m where m.conversation_id=messages.conversation_id and m.user_id=(select auth.uid())));
create policy messages_sender_update on aptora.messages for update to authenticated using(sender_id=(select auth.uid()) or aptora.is_admin()) with check(sender_id=(select auth.uid()) or aptora.is_admin());
create policy audit_admin_read on aptora.audit_logs for select to authenticated using(aptora.is_admin());

-- These two views intentionally run with the view owner's read privileges.
-- Their projections/filters disclose only fields approved for public reading.
create view aptora.public_placements with(security_invoker=false) as
select p.id,p.title,p.slug,p.category,p.employment_type,p.work_mode,p.location,p.description,p.responsibilities,
 p.required_skills,p.preferred_skills,p.required_departments,p.min_level,p.max_level,p.min_cgpa,p.cgpa_scale,p.siwes_required,
 p.duration_weeks,p.slots,p.application_instructions,p.application_deadline,p.start_date,p.end_date,p.created_at,
 e.organization_name,e.organization_slug,e.logo_path,e.verification_status
from aptora.placements p join aptora.employers e on e.id=p.employer_id
where p.status='published' and e.verification_status='approved' and (p.application_deadline is null or p.application_deadline>now());
grant select on aptora.public_placements to anon,authenticated;
create view aptora.public_statistics with(security_invoker=false) as select
 (select count(*) from aptora.students s join aptora.profiles p on p.id=s.id where p.status='active' and p.deleted_at is null) registered_students,
 (select count(*) from aptora.employers e join aptora.profiles p on p.id=e.id where e.verification_status='approved' and p.status='active') verified_organizations,
 (select count(*) from aptora.placements p join aptora.employers e on e.id=p.employer_id where p.status='published' and e.verification_status='approved' and (p.application_deadline is null or p.application_deadline>now())) published_placements,
 (select count(*) from aptora.applications where status='accepted') successful_placements;
grant select on aptora.public_statistics to anon,authenticated;

-- Table privileges are deliberately narrow. RLS then scopes each granted
-- operation to the user's own rows or an authorized organization/admin.
grant select on aptora.profiles,aptora.students,aptora.employers,aptora.skills,
 aptora.student_skills,aptora.student_interests,aptora.placements,aptora.applications,
 aptora.application_events,aptora.saved_placements,aptora.match_settings,aptora.recommendations,
 aptora.documents,aptora.notifications,aptora.contact_messages,aptora.conversations,
 aptora.conversation_members,aptora.messages to authenticated;
grant select on aptora.audit_logs to authenticated;
grant insert,update on aptora.profiles,aptora.students,aptora.employers to authenticated;
grant insert,update,delete on aptora.student_skills,aptora.student_interests,aptora.saved_placements to authenticated;
grant insert,update,delete on aptora.placements to authenticated;
grant insert,update on aptora.applications to authenticated;
grant update on aptora.match_settings to authenticated;
grant insert,delete on aptora.documents to authenticated;
grant update(read_at) on aptora.notifications to authenticated;
grant insert on aptora.notifications to authenticated;
grant insert,update on aptora.contact_messages to authenticated;
grant insert on aptora.contact_messages to anon;
grant insert on aptora.conversations,aptora.messages to authenticated;
grant select,insert on aptora.conversation_members to authenticated;

create function aptora.search_public_placements(p_query text default null,p_category text default null,p_location text default null,p_work_mode aptora.work_mode default null,p_employment_type text default null,p_sort text default 'newest',p_page integer default 1,p_page_size integer default 12)
returns setof aptora.public_placements language sql stable security invoker set search_path=''
as $$ select * from aptora.public_placements p where (p_query is null or p.title ilike '%'||p_query||'%' or p.description ilike '%'||p_query||'%' or p.organization_name ilike '%'||p_query||'%') and (p_category is null or p.category=p_category) and (p_location is null or p.location ilike '%'||p_location||'%') and (p_work_mode is null or p.work_mode=p_work_mode) and (p_employment_type is null or p.employment_type=p_employment_type) order by case when p_sort='deadline' then p.application_deadline end asc nulls last,case when p_sort='title' then p.title end asc,case when p_sort not in('deadline','title') then p.created_at end desc limit least(greatest(p_page_size,1),50) offset(greatest(p_page,1)-1)*least(greatest(p_page_size,1),50) $$;
grant execute on function aptora.search_public_placements(text,text,text,aptora.work_mode,text,text,integer,integer) to anon,authenticated;
create function aptora.submit_contact_message(p_name text,p_email text,p_subject text,p_message text) returns uuid language plpgsql security invoker set search_path=''
as $$ declare result_id uuid; begin
 if length(trim(p_name)) not between 2 and 160 or length(trim(p_email))>320 or p_email !~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' or length(trim(p_subject)) not between 2 and 180 or length(trim(p_message)) not between 10 and 5000 then raise exception 'Please provide valid contact details and a message'; end if;
 insert into aptora.contact_messages(name,email,subject,message,sender_id) values(trim(p_name),lower(trim(p_email)),trim(p_subject),trim(p_message),(select auth.uid())) returning id into result_id; return result_id; end $$;
grant execute on function aptora.submit_contact_message(text,text,text,text) to anon,authenticated;

create function aptora.apply_to_placement(p_placement_id uuid,p_cover_letter text default null,p_resume_document_id uuid default null) returns uuid language plpgsql security invoker set search_path=''
as $$ declare new_id uuid; s aptora.students%rowtype; begin
 if aptora.current_role()<>'student' then raise exception 'Only student accounts can apply'; end if;
 select * into s from aptora.students where id=(select auth.uid()); if not found then raise exception 'Student profile is incomplete'; end if;
 if p_resume_document_id is not null and not exists(select 1 from aptora.documents d where d.id=p_resume_document_id and d.owner_id=(select auth.uid()) and d.document_type in('cv','resume') and d.deleted_at is null) then raise exception 'Resume must be owned by the student'; end if;
 if exists(select 1 from aptora.placements p where p.id=p_placement_id and ((p.min_level is not null and s.level<p.min_level) or (p.max_level is not null and s.level>p.max_level) or (p.siwes_required and not s.siwes_eligible) or (p.min_cgpa is not null and (s.cgpa is null or s.cgpa/s.cgpa_scale*p.cgpa_scale<p.min_cgpa)) or (cardinality(p.required_departments)>0 and not(s.department=any(p.required_departments))))) then raise exception 'Student does not meet placement eligibility criteria'; end if;
 if exists(select 1 from aptora.placements p, unnest(p.required_skills) req(skill) where p.id=p_placement_id and not exists(select 1 from aptora.student_skills ss join aptora.skills sk on sk.id=ss.skill_id where ss.student_id=s.id and lower(sk.name)=lower(req.skill))) then raise exception 'Student does not have every required skill'; end if;
 insert into aptora.applications(placement_id,student_id,cover_letter,resume_document_id) values(p_placement_id,(select auth.uid()),p_cover_letter,p_resume_document_id) returning id into new_id; return new_id; end $$;
grant execute on function aptora.apply_to_placement(uuid,text,uuid) to authenticated;

-- Explainable configurable recommendation scoring; ineligible and expired roles are excluded.
create function aptora.recalculate_recommendations() returns integer language plpgsql security definer set search_path=''
as $$ declare s aptora.students%rowtype; p record; w aptora.match_settings%rowtype; sk numeric; ac numeric; it numeric; loc numeric; dur numeric; total numeric; why jsonb; required_count integer; preferred_count integer; required_score numeric; preferred_score numeric; n integer:=0;
begin
 if aptora.current_role()<>'student' then raise exception 'Only students can calculate personal recommendations'; end if;
 select * into s from aptora.students where id=(select auth.uid()); if not found then return 0; end if;
 select * into w from aptora.match_settings where id=1; delete from aptora.recommendations where student_id=s.id;
 for p in select * from aptora.public_placements loop
  if (p.min_level is not null and s.level<p.min_level) or (p.max_level is not null and s.level>p.max_level) or (p.siwes_required and not s.siwes_eligible) or (p.min_cgpa is not null and (s.cgpa is null or s.cgpa/s.cgpa_scale*p.cgpa_scale<p.min_cgpa)) or (cardinality(p.required_departments)>0 and not(s.department=any(p.required_departments))) then continue; end if;
  required_count:=cardinality(p.required_skills); preferred_count:=cardinality(p.preferred_skills);
  if required_count>0 and exists(select 1 from unnest(p.required_skills) req(skill) where not exists(select 1 from aptora.student_skills ss join aptora.skills x on x.id=ss.skill_id where ss.student_id=s.id and lower(x.name)=lower(req.skill))) then continue; end if;
  if required_count=0 and preferred_count=0 then sk:=50;
  else
   required_score:=case when required_count=0 then 0 else 100 end;
   if preferred_count=0 then preferred_score:=0; else select 100.0*count(*)/preferred_count into preferred_score from aptora.student_skills ss join aptora.skills x on x.id=ss.skill_id where ss.student_id=s.id and lower(x.name)=any(select lower(v) from unnest(p.preferred_skills) v); end if;
   sk:=case when required_count=0 then preferred_score when preferred_count=0 then required_score else required_score*.7+preferred_score*.3 end;
  end if;
  ac:=100;
  select case when exists(select 1 from aptora.student_interests i where i.student_id=s.id and lower(i.category)=lower(p.category)) then 100 else 35 end into it;
  loc:=case when p.work_mode='remote' or lower(p.location)=any(select lower(v) from unnest(s.preferred_locations) v) then 100 when cardinality(s.preferred_locations)=0 then 60 else 25 end;
  dur:=case when s.preferred_duration_weeks is null or p.duration_weeks is null then 70 when abs(s.preferred_duration_weeks-p.duration_weeks)<=4 then 100 else greatest(0,100-abs(s.preferred_duration_weeks-p.duration_weeks)*3) end;
  total:=round(sk*w.skill_weight+ac*w.academic_weight+it*w.interest_weight+loc*w.location_weight+dur*w.duration_weight,2); if total<w.min_recommendation_score then continue; end if;
  select coalesce(jsonb_agg(x.name),'[]'::jsonb) into why from aptora.student_skills ss join aptora.skills x on x.id=ss.skill_id where ss.student_id=s.id and lower(x.name)=any(select lower(v) from unnest(p.required_skills||p.preferred_skills) v);
  insert into aptora.recommendations(student_id,placement_id,match_score,skill_score,academic_score,interest_score,location_score,duration_score,explanation) values(s.id,p.id,total,sk,ac,it,loc,dur,jsonb_build_object('matched_skills',why,'category_match',it=100,'location_fit',loc,'duration_fit',dur,'eligible',true)); n:=n+1;
 end loop; return n;
end $$;
grant execute on function aptora.recalculate_recommendations() to authenticated;

-- Candidate details are released only to the employer owning the application.
create function aptora.get_employer_applications(p_status aptora.application_status default null,p_placement_id uuid default null,p_page integer default 1,p_page_size integer default 20)
returns table(application_id uuid,placement_id uuid,placement_title text,student_id uuid,student_name text,department text,course_of_study text,level smallint,cgpa numeric,application_status aptora.application_status,submitted_at timestamptz,cover_letter text,resume_document_id uuid,employer_notes text)
language plpgsql stable security definer set search_path=''
as $$ begin
 if (select auth.uid()) is null or aptora.current_role()<>'employer' then raise exception 'Employer account required'; end if;
 return query select a.id,p.id,p.title,s.id,pr.full_name,s.department,s.course_of_study,s.level,s.cgpa,a.status,a.submitted_at,a.cover_letter,a.resume_document_id,a.employer_notes
 from aptora.applications a join aptora.placements p on p.id=a.placement_id join aptora.students s on s.id=a.student_id
 join aptora.profiles pr on pr.id=s.id where p.employer_id=(select auth.uid()) and (p_status is null or a.status=p_status) and (p_placement_id is null or p.id=p_placement_id)
 order by a.submitted_at desc limit least(greatest(p_page_size,1),50) offset (least(greatest(p_page,1),10000)-1)*least(greatest(p_page_size,1),50);
end $$;
revoke all on function aptora.get_employer_applications(aptora.application_status,uuid,integer,integer) from public,anon;
grant execute on function aptora.get_employer_applications(aptora.application_status,uuid,integer,integer) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('aptora-documents','aptora-documents',false,10485760,array['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
 ('aptora-avatars','aptora-avatars',false,2097152,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy aptora_document_select on storage.objects for select to authenticated using(bucket_id='aptora-documents' and (owner_id=(select auth.uid())::text or exists(select 1 from aptora.documents d join aptora.applications a on a.resume_document_id=d.id join aptora.placements p on p.id=a.placement_id where d.storage_path=name and p.employer_id=(select auth.uid())) or aptora.is_admin()));
create policy aptora_document_insert on storage.objects for insert to authenticated with check(bucket_id='aptora-documents' and owner_id=(select auth.uid())::text and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy aptora_document_delete on storage.objects for delete to authenticated using(bucket_id='aptora-documents' and (owner_id=(select auth.uid())::text or aptora.is_admin()));
create policy aptora_avatar_select on storage.objects for select to authenticated using(bucket_id='aptora-avatars' and (owner_id=(select auth.uid())::text or aptora.is_admin()));
create policy aptora_avatar_insert on storage.objects for insert to authenticated with check(bucket_id='aptora-avatars' and owner_id=(select auth.uid())::text and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy aptora_avatar_update on storage.objects for update to authenticated using(bucket_id='aptora-avatars' and owner_id=(select auth.uid())::text) with check(bucket_id='aptora-avatars' and owner_id=(select auth.uid())::text);
create policy aptora_avatar_delete on storage.objects for delete to authenticated using(bucket_id='aptora-avatars' and (owner_id=(select auth.uid())::text or aptora.is_admin()));
comment on schema aptora is 'APTORA application schema; do not expose wholesale through Supabase API.';
comment on function aptora.create_profile_for_auth_user() is 'SECURITY DEFINER auth trigger, public role allow-list enforced.';
comment on function aptora.audit_sensitive_change() is 'SECURITY DEFINER audit trigger; client has no audit write policy.';
commit;
