import { createPublicClient } from "@/lib/supabase/public";
import type { PublicPlacementRow, WorkMode } from "@/types/database";

export type OpportunityFilters = {
  query?: string;
  category?: string;
  location?: string;
  workMode?: string;
  employmentType?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
};

export async function searchOpportunities(filters: OpportunityFilters = {}) {
  const client = createPublicClient();
  if (!client) return { placements: [] as PublicPlacementRow[], configured: false, failed: false };

  const { data, error } = await client.rpc("search_public_placements", {
    p_query: filters.query?.trim() || null,
    p_category: filters.category || null,
    p_location: filters.location?.trim() || null,
    p_work_mode: (filters.workMode || null) as WorkMode | null,
    p_employment_type: filters.employmentType || null,
    p_sort: filters.sort || "newest",
    p_page: filters.page ?? 1,
    p_page_size: filters.pageSize ?? 12,
  });

  if (error) return { placements: [] as PublicPlacementRow[], configured: true, failed: true };
  return { placements: data ?? [], configured: true, failed: false };
}

export async function getPublicOpportunity(id: string) {
  const client = createPublicClient();
  if (!client) return { placement: null, configured: false, failed: false };
  const { data, error } = await client.from("public_placements").select("*").eq("id", id).maybeSingle();
  return { placement: error ? null : data, configured: true, failed: Boolean(error) };
}

export async function getPublicStatistics() {
  const client = createPublicClient();
  if (!client) return null;
  const { data, error } = await client.from("public_statistics").select("*").maybeSingle();
  return error ? null : data;
}
