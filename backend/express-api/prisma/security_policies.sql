-- HireFlow Row-Level Security (RLS) & Storage Security Policies
-- Target Database: PostgreSQL / Supabase
-- Target Schema: public

-- -------------------------------------------------------------
-- 1. Enable RLS on All Tables
-- -------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------
-- 2. Define Table Security Policies
-- -------------------------------------------------------------

-- Users
-- A user can read/write only their own user metadata.
CREATE POLICY user_self_manage ON users
  FOR ALL
  USING (auth.uid() = id);

-- Companies
-- Anyone can view company details.
CREATE POLICY anyone_view_companies ON companies
  FOR SELECT
  USING (true);

-- Only recruiters associated with a company can update company information.
CREATE POLICY recruiter_manage_company ON companies
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM recruiters
    WHERE recruiters.user_id = auth.uid() AND recruiters.company_id = id
  ));

-- Recruiters
-- Recruiters can manage their own profile details.
CREATE POLICY recruiter_manage_self ON recruiters
  FOR ALL
  USING (auth.uid() = user_id);

-- Candidates can view recruiter profiles/bios.
CREATE POLICY candidate_view_recruiters ON recruiters
  FOR SELECT
  USING (true);

-- Candidates
-- Candidates can manage their own profile details.
CREATE POLICY candidate_manage_self ON candidates
  FOR ALL
  USING (auth.uid() = user_id);

-- Recruiters can view candidate profiles to assess applications.
CREATE POLICY recruiter_view_candidates ON candidates
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM recruiters WHERE recruiters.user_id = auth.uid()
  ));

-- Jobs
-- Anyone can view active/published jobs.
CREATE POLICY view_active_jobs ON jobs
  FOR SELECT
  USING (status = 'active');

-- Company recruiters can manage (create, read, update, delete) all jobs of their company.
CREATE POLICY recruiter_manage_jobs ON jobs
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM recruiters
    WHERE recruiters.user_id = auth.uid() AND recruiters.company_id = jobs.company_id
  ));

-- Applications
-- Candidates can create, read, and manage their own applications.
CREATE POLICY candidate_manage_applications ON applications
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM candidates
    WHERE candidates.id = applications.candidate_id AND candidates.user_id = auth.uid()
  ));

-- Recruiters can read and update status of applications for jobs belonging to their company.
CREATE POLICY recruiter_manage_applications ON applications
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM jobs
    JOIN recruiters ON jobs.company_id = recruiters.company_id
    WHERE jobs.id = applications.job_id AND recruiters.user_id = auth.uid()
  ));

-- Application Events
-- Candidates can read events for their own applications.
CREATE POLICY candidate_view_application_events ON application_events
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM applications
    JOIN candidates ON applications.candidate_id = candidates.id
    WHERE applications.id = application_events.application_id AND candidates.user_id = auth.uid()
  ));

-- Recruiters can read and write events for applications under their company.
CREATE POLICY recruiter_manage_application_events ON application_events
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM applications
    JOIN jobs ON applications.job_id = jobs.id
    JOIN recruiters ON jobs.company_id = recruiters.company_id
    WHERE applications.id = application_events.application_id AND recruiters.user_id = auth.uid()
  ));

-- Saved Jobs
-- Candidates can manage their own list of saved jobs.
CREATE POLICY candidate_manage_saved_jobs ON saved_jobs
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM candidates
    WHERE candidates.id = saved_jobs.candidate_id AND candidates.user_id = auth.uid()
  ));

-- Notifications
-- Users can manage their own notification inbox.
CREATE POLICY user_manage_notifications ON notifications
  FOR ALL
  USING (auth.uid() = user_id);

-- Analytics & Activity (Aggregates)
-- Company recruiters can view analytics for jobs belonging to their company.
CREATE POLICY recruiter_view_job_analytics ON job_analytics
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM jobs
    JOIN recruiters ON jobs.company_id = recruiters.company_id
    WHERE jobs.id = job_analytics.job_id AND recruiters.user_id = auth.uid()
  ));

CREATE POLICY recruiter_view_company_analytics ON company_analytics
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM recruiters
    WHERE recruiters.company_id = company_analytics.company_id AND recruiters.user_id = auth.uid()
  ));

-- Candidates can view their own activity dashboards.
CREATE POLICY candidate_view_activity ON candidate_activities
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM candidates
    WHERE candidates.id = candidate_activities.candidate_id AND candidates.user_id = auth.uid()
  ));

-- Recommendations
-- Candidates can view recommendations offered to them.
CREATE POLICY candidate_view_recommendations ON recommendations
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM candidates
    WHERE candidates.id = recommendations.candidate_id AND candidates.user_id = auth.uid()
  ));

-- Audit Logs
-- Only admins can retrieve system audit logs. Actors can read their own logs.
CREATE POLICY user_read_own_audit_logs ON audit_logs
  FOR SELECT
  USING (actor_id = auth.uid());

-- -------------------------------------------------------------
-- 3. Define Private Storage Rules (Supabase Storage Bucket: resumes)
-- -------------------------------------------------------------

-- resumes (Private Storage Bucket)
-- Rule A: Allow candidates to upload, update and delete resumes inside their own user subfolder.
CREATE POLICY candidate_manage_resumes ON storage.objects
  FOR ALL
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Rule B: Allow recruiters to read/download candidate resumes.
CREATE POLICY recruiter_read_resumes ON storage.objects
  FOR SELECT
  USING (bucket_id = 'resumes' AND EXISTS (
    SELECT 1 FROM public.recruiters WHERE user_id = auth.uid()
  ));
