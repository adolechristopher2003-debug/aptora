export type AppRole = "student" | "employer" | "admin" | "super_admin";
export type AccountStatus = "active" | "suspended" | "deleted";
export type VerificationStatus = "pending" | "under_review" | "approved" | "rejected" | "suspended";
export type PlacementStatus = "draft" | "pending_review" | "published" | "rejected" | "closed" | "archived";
export type WorkMode = "onsite" | "hybrid" | "remote";
export type ApplicationStatus = "submitted" | "under_review" | "shortlisted" | "interview" | "accepted" | "rejected" | "withdrawn";
export type DocumentType = "cv" | "resume" | "cover_letter" | "transcript" | "proof_of_enrollment" | "portfolio" | "employer_verification" | "other";
export type NotificationType = "application" | "placement" | "verification" | "message" | "system" | "deadline" | "recommendation";

type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

type ProfileRow = {
  id: string; role: AppRole; status: AccountStatus; full_name: string; email: string; phone: string | null;
  avatar_path: string | null; address: string | null; bio: string | null; linkedin_url: string | null;
  github_url: string | null; portfolio_url: string | null; created_at: string; updated_at: string; deleted_at: string | null;
};
type StudentRow = {
  id: string; matric_number: string; faculty: string; department: string; course_of_study: string; level: number;
  cgpa: number | null; cgpa_scale: number; graduation_year: number | null; siwes_eligible: boolean;
  preferred_duration_weeks: number | null; preferred_locations: string[]; preferred_work_modes: WorkMode[];
  profile_visibility: boolean; created_at: string; updated_at: string;
};
type EmployerRow = {
  id: string; organization_name: string; organization_slug: string; organization_type: string | null;
  industry: string | null; website_url: string | null; organization_email: string; organization_phone: string | null;
  address: string; city: string | null; state: string | null; country: string; description: string | null; logo_path: string | null;
  verification_status: VerificationStatus; verified_at: string | null; verified_by: string | null; rejection_reason: string | null;
  created_at: string; updated_at: string;
};
type PlacementRow = {
  id: string; employer_id: string; title: string; slug: string; category: string; employment_type: string;
  work_mode: WorkMode; location: string; description: string; responsibilities: string[]; required_skills: string[];
  preferred_skills: string[]; required_departments: string[]; min_level: number | null; max_level: number | null;
  min_cgpa: number | null; cgpa_scale: number; siwes_required: boolean; duration_weeks: number | null; slots: number;
  application_instructions: string | null; application_deadline: string | null; start_date: string | null; end_date: string | null;
  status: PlacementStatus; approved_at: string | null; approved_by: string | null; rejection_reason: string | null;
  view_count: number; created_at: string; updated_at: string;
};
export type PublicPlacementRow = Omit<PlacementRow, "employer_id" | "status" | "approved_at" | "approved_by" | "rejection_reason" | "view_count" | "updated_at"> & {
  organization_name: string; organization_slug: string; logo_path: string | null; verification_status: VerificationStatus;
};
type ApplicationRow = {
  id: string; placement_id: string; student_id: string; status: ApplicationStatus; cover_letter: string | null;
  resume_document_id: string | null; submitted_at: string; reviewed_at: string | null; reviewed_by: string | null;
  employer_notes: string | null; student_withdrawn_at: string | null; updated_at: string;
};
type DocumentRow = {
  id: string; owner_id: string; document_type: DocumentType; storage_path: string; original_filename: string;
  mime_type: string; file_size_bytes: number; is_primary: boolean; created_at: string; deleted_at: string | null;
};
type NotificationRow = {
  id: string; user_id: string; notification_type: NotificationType; title: string; body: string; href: string | null;
  read_at: string | null; created_at: string;
};

export interface Database {
  aptora: {
    Tables: {
      profiles: Table<ProfileRow, Pick<ProfileRow, "id" | "full_name" | "email"> & Partial<ProfileRow>>;
      students: Table<StudentRow, Pick<StudentRow, "id" | "matric_number" | "faculty" | "department" | "course_of_study" | "level"> & Partial<StudentRow>>;
      employers: Table<EmployerRow, Pick<EmployerRow, "id" | "organization_name" | "organization_slug" | "organization_email" | "address"> & Partial<EmployerRow>>;
      placements: Table<PlacementRow, Pick<PlacementRow, "employer_id" | "title" | "slug" | "category" | "work_mode" | "location" | "description"> & Partial<PlacementRow>>;
      applications: Table<ApplicationRow, Pick<ApplicationRow, "placement_id" | "student_id"> & Partial<ApplicationRow>>;
      documents: Table<DocumentRow, Pick<DocumentRow, "owner_id" | "document_type" | "storage_path" | "original_filename" | "mime_type" | "file_size_bytes"> & Partial<DocumentRow>>;
      notifications: Table<NotificationRow, Pick<NotificationRow, "user_id" | "notification_type" | "title" | "body"> & Partial<NotificationRow>>;
      skills: Table<{ id: string; name: string; normalized_name: string; category: string; is_active: boolean; created_at: string }, { name: string; category?: string }>;
      student_skills: Table<{ student_id: string; skill_id: string; proficiency: number; years_experience: number | null; verified: boolean; created_at: string }, { student_id: string; skill_id: string; proficiency?: number; years_experience?: number | null }>;
      student_interests: Table<{ student_id: string; category: string; priority: number; created_at: string }, { student_id: string; category: string; priority?: number }>;
      saved_placements: Table<{ student_id: string; placement_id: string; created_at: string }, { student_id: string; placement_id: string }>;
      recommendations: Table<{ student_id: string; placement_id: string; match_score: number; skill_score: number; academic_score: number; interest_score: number; location_score: number; duration_score: number; explanation: Record<string, unknown>; calculated_at: string }, never>;
      match_settings: Table<{ id: number; skill_weight: number; academic_weight: number; interest_weight: number; location_weight: number; duration_weight: number; min_recommendation_score: number; updated_by: string | null; updated_at: string }, { id?: number; skill_weight?: number; academic_weight?: number; interest_weight?: number; location_weight?: number; duration_weight?: number; min_recommendation_score?: number; updated_by?: string | null }>;
      audit_logs: Table<{ id: number; actor_id: string | null; action: string; entity_type: string; entity_id: string | null; old_values: Record<string, unknown> | null; new_values: Record<string, unknown> | null; ip_address: string | null; user_agent: string | null; created_at: string }, never>;
      contact_messages: Table<{ id: string; name: string; email: string; subject: string; message: string; sender_id: string | null; status: string; assigned_to: string | null; created_at: string; resolved_at: string | null }, { name: string; email: string; subject: string; message: string; sender_id?: string | null }, { status?: string; assigned_to?: string | null; resolved_at?: string | null }>;
    };
    Views: {
      public_placements: { Row: PublicPlacementRow; Relationships: [] };
      public_statistics: { Row: { registered_students: number; verified_organizations: number; published_placements: number; successful_placements: number }; Relationships: [] };
    };
    Functions: {
      search_public_placements: { Args: { p_query?: string | null; p_category?: string | null; p_location?: string | null; p_work_mode?: WorkMode | null; p_employment_type?: string | null; p_sort?: string; p_page?: number; p_page_size?: number }; Returns: PublicPlacementRow[] };
      submit_contact_message: { Args: { p_name: string; p_email: string; p_subject: string; p_message: string }; Returns: string };
      apply_to_placement: { Args: { p_placement_id: string; p_cover_letter?: string | null; p_resume_document_id?: string | null }; Returns: string };
      recalculate_recommendations: { Args: Record<PropertyKey, never>; Returns: number };
      get_employer_applications: { Args: { p_status?: ApplicationStatus | null; p_placement_id?: string | null; p_page?: number; p_page_size?: number }; Returns: { application_id: string; placement_id: string; placement_title: string; student_id: string; student_name: string; department: string; course_of_study: string; level: number; cgpa: number | null; application_status: ApplicationStatus; submitted_at: string; cover_letter: string | null; resume_document_id: string | null; employer_notes: string | null }[] };
      current_role: { Args: Record<PropertyKey, never>; Returns: AppRole | null };
    };
    Enums: { app_role: AppRole; account_status: AccountStatus; verification_status: VerificationStatus; placement_status: PlacementStatus; work_mode: WorkMode; application_status: ApplicationStatus; document_type: DocumentType; notification_type: NotificationType };
    CompositeTypes: Record<string, never>;
  };
}
