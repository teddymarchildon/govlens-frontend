import { supabase } from '../lib/supabase';
import { AgencyDocument, Bill, Congressman, SavedBill, SavedCongressman } from '../types/types';

// Types for Court API
export interface Judge {
  id: string;
  remote_id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  full_name: string;
}

export interface Court {
  id: number;
  name: string;
  jurisdiction: string;
  url: string;
}

export interface Opinion {
  id: string;
  type: string;
  date_created: string;
  pdf_file_path: string | null;
  html_file_path: string | null;
  text_file_path: string | null;
  author: Judge;
  joined_by: Judge[];
}

export interface Cluster {
  id: string;
  case_name: string;
  case_name_short: string;
  date_filed: string;
  court_id: number;
  docket_number: string;
  court: Court;
  opinions: Opinion[];
}

export interface ClusterDetail extends Cluster {
  scdb_id?: string | null;
  scdb_decision_direction?: string | null;
  scdb_votes_majority?: number | null;
  scdb_votes_minority?: number | null;
}

export interface OpinionsByType {
  [type: string]: Opinion[];
}

// Storage API
export const getStoragePublicUrl = (bucket: string, path: string): string | null => {
  if (!path) return null;

  try {
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return publicUrl;
  } catch (error) {
    throw error;
  }
};

// Bills API
export const getBills = async (params: any = {}) => {
  let query = supabase.from('bill').select('*');

  if (params.limit) {
    query = query.limit(params.limit);
  }

  if (params.policy_area) {
    query = query.eq('policy_area', params.policy_area);
  }

  // If sponsor_id is provided, filter bills by sponsor
  if (params.sponsor_id) {
    // We need to get the bill IDs sponsored by this congressman first
    const { data: sponsoredBills, error: sponsorError } = await supabase
      .from('sponsored_bills')
      .select('bill_id')
      .eq('congressman_id', params.sponsor_id);

    if (sponsorError) throw sponsorError;

    // If there are sponsored bills, filter the query
    if (sponsoredBills && sponsoredBills.length > 0) {
      const billIds = sponsoredBills.map(item => item.bill_id);
      query = query.in('id', billIds);
    } else {
      // If no bills are sponsored by this congressman, return empty array
      return [];
    }
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

export const getBillById = async (billId: string) => {
  const { data, error } = await supabase
    .from('bill')
    .select('*')
    .eq('id', billId)
    .single();

  if (error) throw error;
  return data;
};

export const getBillTexts = async (billId: string) => {
  const { data, error } = await supabase
    .from('bill_text')
    .select('*')
    .eq('bill_id', billId);

  if (error) throw error;
  return data;
};

export const getBillSponsors = async (billId: string): Promise<Congressman[]> => {
  const { data, error } = await supabase
    .from('sponsored_bills')
    .select('congressman_id, congressman:congressman(*)')
    .eq('bill_id', billId);

  if (error) throw error;
  return data.map(item => item.congressman) as unknown as Congressman[];
};

export const getBillCosponsors = async (billId: string): Promise<Congressman[]> => {
  const { data, error } = await supabase
    .from('cosponsored_bills')
    .select('congressman_id, congressman:congressman(*)')
    .eq('bill_id', billId);

  if (error) throw error;
  return data.map(item => item.congressman) as unknown as Congressman[];
};

// Congressmen API
export const getCongressmen = async (params: any = {}) => {
  let query = supabase.from('congressman').select('*');

  if (params.limit) {
    query = query.limit(params.limit);
  }

  if (params.party) {
    query = query.eq('party', params.party);
  }

  if (params.state) {
    query = query.eq('state', params.state);
  }

  if (params.chamber) {
    query = query.eq('chamber', params.chamber);
  }

  // Search by name if provided
  if (params.search) {
    query = query.ilike('full_name', `%${params.search}%`);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as unknown as Congressman[];
};

export const getCongressmanById = async (congressmanId: string) => {
  const { data, error } = await supabase
    .from('congressman')
    .select('*')
    .eq('id', congressmanId)
    .single();

  if (error) throw error;
  return data;
};

export const getCongressmanSponsoredBills = async (congressmanId: string): Promise<Bill[]> => {
  const { data, error } = await supabase
    .from('sponsored_bills')
    .select(`
      bill_id,
      bill:bill(
        *,
        sponsor:sponsored_bills!bill_id(
          congressman:congressman(*)
        ),
        cosponsors:cosponsored_bills!bill_id(
          congressman:congressman(*)
        )
      )
    `)
    .eq('congressman_id', congressmanId);

  if (error) throw error;
  return data.map(item => ({
    ...item.bill,
    sponsor: item.bill.sponsor[0],
    cosponsors: item.bill.cosponsors
  })) as unknown as Bill[];
};

export const getCongressmanCosponsoredBills = async (congressmanId: string): Promise<Bill[]> => {
  const { data, error } = await supabase
    .from('cosponsored_bills')
    .select(`
      bill_id,
      bill:bill(
        *,
        sponsor:sponsored_bills!bill_id(
          congressman:congressman(*)
        ),
        cosponsors:cosponsored_bills!bill_id(
          congressman:congressman(*)
        )
      )
    `)
    .eq('congressman_id', congressmanId);

  if (error) throw error;
  return data.map(item => ({
    ...item.bill,
    sponsor: item.bill.sponsor[0],
    cosponsors: item.bill.cosponsors
  })) as unknown as Bill[];
};

export const getCongressmanTerms = async (congressmanId: string) => {
  const { data, error } = await supabase
    .from('congressman_term')
    .select('*')
    .eq('congressman_id', congressmanId)
    .order('start_year', { ascending: false });

  if (error) throw error;
  return data;
};

// Save/Unsave Congressmen
export const saveCongressman = async (userId: string, congressmanId: string) => {
  try {
    const { data, error } = await supabase
      .from('saved_congressman')
      .insert([
        { user_id: userId, congressman_id: congressmanId }
      ])
      .select();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const unsaveCongressman = async (userId: string, congressmanId: string) => {
  try {
    const { data, error } = await supabase
      .from('saved_congressman')
      .delete()
      .match({ user_id: userId, congressman_id: congressmanId })
      .select();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const isCongressmanSaved = async (userId: string, congressmanId: string) => {
  try {
    const { data, error, count } = await supabase
      .from('saved_congressman')
      .select('*', { count: 'exact' })
      .match({ user_id: userId, congressman_id: congressmanId });

    if (error) {
      throw error;
    }

    const isSaved = (count || 0) > 0;
    return isSaved;
  } catch (error) {
    return false;
  }
};

// Save/Unsave Bills
export const saveBill = async (userId: string, billId: string) => {
  try {
    const { data, error } = await supabase
      .from('saved_bill')
      .insert([
        { user_id: userId, bill_id: billId }
      ])
      .select();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const unsaveBill = async (userId: string, billId: string) => {
  try {
    const { data, error } = await supabase
      .from('saved_bill')
      .delete()
      .match({ user_id: userId, bill_id: billId })
      .select();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const isBillSaved = async (userId: string, billId: string) => {
  try {
    const { data, error, count } = await supabase
      .from('saved_bill')
      .select('*', { count: 'exact' })
      .match({ user_id: userId, bill_id: billId });

    if (error) {
      throw error;
    }

    const isSaved = (count || 0) > 0;
    return isSaved;
  } catch (error) {
    return false;
  }
};

// Get Saved Items
export const getSavedCongressmen = async (userId: string) => {
  const { data, error } = await supabase
    .from('saved_congressman')
    .select('*, congressman:congressman_id(*)')
    .eq('user_id', userId);

  if (error) throw error;
  return data;
};

export const getSavedBills = async (userId: string) => {
  const { data, error } = await supabase
    .from('saved_bill')
    .select('*, bill:bill_id(*)')
    .eq('user_id', userId);

  if (error) throw error;
  return data;
};

export async function getBillActions(billId: string) {
  const { data, error } = await supabase
    .from('bill_action')
    .select('*')
    .eq('bill_id', billId)
    .order('date', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

// Agencies API
export const getAgencies = async (params: any = {}) => {
  let query = supabase.from('agency').select('*, parent:parent_id(id, name, short_name)');

  if (params.limit) {
    query = query.limit(params.limit);
  }

  // Search by name if provided
  if (params.search) {
    query = query.ilike('name', `%${params.search}%`);
  }

  // Filter by parent agency
  if (params.parent_id) {
    query = query.eq('parent_id', params.parent_id);
  }

  // Sort results
  const orderBy = params.order_by || 'name';
  const order = params.order || 'asc';
  query = query.order(orderBy, { ascending: order === 'asc' });

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

export const getAgencyById = async (agencyId: string) => {
  const { data, error } = await supabase
    .from('agency')
    .select('*, parent:parent_id(id, name, short_name)')
    .eq('id', agencyId)
    .single();

  if (error) throw error;
  return data;
};

export const getChildAgencies = async (parentId: string) => {
  const { data, error } = await supabase
    .from('agency')
    .select('*')
    .eq('parent_id', parentId);

  if (error) throw error;
  return data;
};

// Save/Unsave Agency
export const saveAgency = async (userId: string, agencyId: string) => {
  try {
    const { data, error } = await supabase
      .from('saved_agency')
      .insert([
        { user_id: userId, agency_id: agencyId }
      ])
      .select();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const unsaveAgency = async (userId: string, agencyId: string) => {
  try {
    const { data, error } = await supabase
      .from('saved_agency')
      .delete()
      .match({ user_id: userId, agency_id: agencyId })
      .select();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const isAgencySaved = async (userId: string, agencyId: string) => {
  try {
    const { data, error, count } = await supabase
      .from('saved_agency')
      .select('*', { count: 'exact' })
      .match({ user_id: userId, agency_id: agencyId });

    if (error) {
      throw error;
    }

    const isSaved = (count || 0) > 0;
    return isSaved;
  } catch (error) {
    return false;
  }
};

export const getSavedAgencies = async (userId: string) => {
  const { data, error } = await supabase
    .from('saved_agency')
    .select('*, agency:agency_id(*)')
    .eq('user_id', userId);

  if (error) throw error;
  return data;
};

export const getAgencyDocuments = async (agencyId: string): Promise<AgencyDocument[]> => {
  try {
    // First, get all document IDs for this agency
    const { data: agencyDocuments, error: agencyError } = await supabase
      .from('agency_agencydocument')
      .select('agency_document_id')
      .eq('agency_id', agencyId);

    if (agencyError) {
      throw agencyError;
    }

    if (!agencyDocuments || agencyDocuments.length === 0) {
      return [];
    }

    // Extract document IDs
    const documentIds = agencyDocuments.map(doc => doc.agency_document_id);

    // Then, fetch all documents with those IDs
    const { data: documents, error: documentsError } = await supabase
      .from('agency_document')
      .select('*')
      .in('id', documentIds)
      .order('publication_date', { ascending: false });

    if (documentsError) {
      throw documentsError;
    }

    return documents || [];
  } catch (error) {
    throw error;
  }
};

export const getTopLevelAgencies = async (): Promise<Agency[]> => {
  try {
    const { data, error } = await supabase
      .from('agency')
      .select('*')
      .is('parent_id', null)
      .order('name');

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    throw error;
  }
};

export const getAgencyRules = async (params: any = {}): Promise<AgencyDocument[]> => {
  try {
    // First, get all agency documents that are of type 'Rule'
    let query = supabase
      .from('agency_document')
      .select(`
        *,
        agencies:agency_agencydocument!agency_document_id(
          agency:agency(*)
        )
      `)
      .eq('type', 'Rule')
      .order('publication_date', { ascending: false });

    // Apply limit if provided
    if (params.limit) {
      query = query.limit(params.limit);
    }

    // Filter by agency if provided
    if (params.agencyId) {
      // Get documents linked to this agency
      const { data: agencyDocuments, error: agencyError } = await supabase
        .from('agency_agencydocument')
        .select('agency_document_id')
        .eq('agency_id', params.agencyId);

      if (agencyError) {
        throw agencyError;
      }

      if (!agencyDocuments || agencyDocuments.length === 0) {
        return [];
      }

      // Extract document IDs
      const documentIds = agencyDocuments.map(doc => doc.agency_document_id);
      query = query.in('id', documentIds);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data?.map(doc => ({
      ...doc,
      agency: doc.agencies?.[0]?.agency
    })) || [];
  } catch (error) {
    throw error;
  }
};

// Court Opinions API
export interface ClusterOpinion {
  id: string;
  remote_id: string;
  date: string;
  type: string;
  pdf_file_path: string;
  html_file_path: string;
  text_file_path: string;
  author: Judge;
  joined_by: Judge[];
}

export interface Cluster {
  id: string;
  remote_id: string;
  court_id: number;
  court: Court;
  slug: string;
  case_name: string;
  case_name_short: string;
  opinions: ClusterOpinion[];
}

export interface Court {
  id: number;
  name: string;
  jurisdiction: string;
  url: string;
}

export const getClusterOpinions = async (clusterId: string, params: any = {}): Promise<ClusterOpinion[]> => {
  let query = supabase
    .from('court_opinion')
    .select(`
      *,
      author:judge(*),
      joined_by:judge(*)
    `)
    .eq('cluster_id', clusterId);

  // Filter by opinion type if provided
  if (params.type) {
    query = query.eq('type', params.type);
  }

  // Sort by date (newest first by default)
  query = query.order('date', { ascending: params.oldest_first ? true : false });

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
};

export const getClusterJoinedJudges = async (clusterId: string): Promise<Judge[]> => {
  // Get all unique judges who have joined any opinion in this cluster
  const { data: opinions, error: opinionsError } = await supabase
    .from('court_opinion')
    .select(`
      joined_by:judge(*)
    `)
    .eq('cluster_id', clusterId);

  if (opinionsError) {
    throw opinionsError;
  }

  // Extract unique judges from the joined_by arrays
  const uniqueJudges = new Map<string, Judge>();
  opinions?.forEach(opinion => {
    opinion.joined_by?.forEach((judge: Judge) => {
      if (judge && judge.id) {
        uniqueJudges.set(judge.id, judge);
      }
    });
  });

  return Array.from(uniqueJudges.values());
};

export const getClusterOpinionsByType = async (clusterId: string): Promise<OpinionsByType> => {
  try {
    // First get all opinions for the cluster
    const { data: opinions, error } = await supabase
      .from('court_opinion')
      .select(`
        id,
        type,
        date,
        pdf_file_path,
        html_file_path,
        text_file_path,
        joined_by,
        author:judge!author_id(*)
      `)
      .eq('cluster_id', clusterId);

    if (error) {
      return {};
    }

    if (!opinions?.length) return {};

    // For each opinion, fetch the joined_by judges
    const opinionsWithJudges = await Promise.all(opinions.map(async opinion => {
      if (!opinion.joined_by?.length) {
        return {
          ...opinion,
          date_created: opinion.date,
          joined_by: []
        };
      }

      // Fetch all judges that joined this opinion
      const { data: judges, error: judgesError } = await supabase
        .from('judge')
        .select('*')
        .in('id', opinion.joined_by);

      if (judgesError) {
        return {
          ...opinion,
          date_created: opinion.date,
          joined_by: []
        };
      }

      return {
        ...opinion,
        date_created: opinion.date,
        joined_by: judges || []
      };
    }));

    // Group opinions by type
    const opinionsByType = opinionsWithJudges.reduce((acc, opinion) => {
      const type = opinion.type || 'unknown';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(opinion);
      return acc;
    }, {} as OpinionsByType);

    return opinionsByType;
  } catch (error) {
    return {};
  }
};

export const getCourtOpinions = async (params: any = {}) => {
  let query = supabase
    .from('court_opinion')
    .select(`
      *,
      author:judge(*),
      cluster:cluster(*),
      joined_by:judge(*)
    `);

  if (params.limit) {
    query = query.limit(params.limit);
  }

  if (params.court_id) {
    query = query.eq('court_id', params.court_id);
  }

  if (params.author_id) {
    query = query.eq('author_id', params.author_id);
  }

  if (params.cluster_id) {
    query = query.eq('cluster_id', params.cluster_id);
  }

  // Search by case name if provided
  if (params.search) {
    // Search in cluster case_name and case_name_short
    query = query.or(`cluster.case_name.ilike.%${params.search}%,cluster.case_name_short.ilike.%${params.search}%`);
  }

  // Filter by date range if provided
  if (params.start_date) {
    query = query.gte('date', params.start_date);
  }

  if (params.end_date) {
    query = query.lte('date', params.end_date);
  }

  // Sort by date (newest first by default)
  query = query.order('date', { ascending: params.oldest_first ? true : false });

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

export async function getCourtOpinionById(id: string) {
  const { data, error } = await supabase
    .from('court_opinion')
    .select(`
      *,
      court:court(*),
      author:judge(*),
      cluster:cluster(*),
      joined_by:judge(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export const getClusters = async (params: string | { court_id?: number; search?: string; limit?: number; oldest_first?: boolean } = {}): Promise<Cluster[]> => {
  try {
    let query = supabase
      .from('cluster')
      .select(`
        id,
        remote_id,
        court_id,
        court:court(*),
        slug,
        case_name,
        case_name_short,
        opinions:court_opinion!cluster_id(
          id,
          type,
          date,
          pdf_file_path,
          html_file_path,
          text_file_path
        )
      `);

    // If params is a string, treat it as a search query
    if (typeof params === 'string') {
      if (params) {
        query = query.ilike('case_name', `%${params}%`);
      }
      query = query.eq('court_id', 1); // SCOTUS ID
      query = query.limit(50);
    } else {
      // Handle object params
      if (params.court_id) {
        query = query.eq('court_id', params.court_id);
      }
      if (params.search) {
        query = query.or(`case_name.ilike.%${params.search}%,case_name_short.ilike.%${params.search}%`);
      }
      if (params.limit) {
        query = query.limit(params.limit);
      }
      // Sort results
      query = query.order('created_at', { ascending: params.oldest_first || false, nullsLast: true });
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Sort the results by the most recent opinion date in memory
    const sortedData = [...(data || [])].sort((a, b) => {
      const latestOpinionA = a.opinions?.reduce((latest, op) =>
        !latest || (op.date && op.date > latest) ? op.date : latest, null);
      const latestOpinionB = b.opinions?.reduce((latest, op) =>
        !latest || (op.date && op.date > latest) ? op.date : latest, null);

      if (!latestOpinionA && !latestOpinionB) return 0;
      if (!latestOpinionA) return 1;
      if (!latestOpinionB) return -1;

      return params.oldest_first
        ? latestOpinionA.localeCompare(latestOpinionB)
        : latestOpinionB.localeCompare(latestOpinionA);
    });

    return sortedData;
  } catch (error) {
    throw error;
  }
};

export const getClusterDetail = async (id: string): Promise<ClusterDetail | null> => {
  try {
    // First get the cluster with its opinions
    const { data, error } = await supabase
      .from('cluster')
      .select(`
        id,
        remote_id,
        case_name,
        case_name_short,
        court_id,
        slug,
        created_at,
        updated_at,
        court:court(*),
        opinions:court_opinion!cluster_id(
          id,
          type,
          date,
          pdf_file_path,
          html_file_path,
          text_file_path,
          joined_by,
          author:judge!author_id(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    if (!data) return null;

    // For each opinion, fetch the joined_by judges
    const opinionsWithJudges = await Promise.all(data.opinions.map(async opinion => {
      if (!opinion.joined_by?.length) {
        return {
          ...opinion,
          date_created: opinion.date,
          joined_by: []
        };
      }

      // Fetch all judges that joined this opinion
      const { data: judges, error: judgesError } = await supabase
        .from('judge')
        .select('*')
        .in('id', opinion.joined_by);

      if (judgesError) {
        return {
          ...opinion,
          date_created: opinion.date,
          joined_by: []
        };
      }

      return {
        ...opinion,
        date_created: opinion.date,
        joined_by: judges || []
      };
    }));

    // Since the SCDB fields don't exist in the database, we'll return null for them
    return {
      ...data,
      opinions: opinionsWithJudges,
      scdb_id: null,
      scdb_decision_direction: null,
      scdb_votes_majority: null,
      scdb_votes_minority: null
    };
  } catch (error) {
    throw error;
  }
};

// User Preferences API
export const getUserPreferences = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    // Return the first preference found, or null if none exist
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    return null;
  }
};

export const createUserPreferences = async (userId: string, preferences: { states?: string[], policy_areas?: string[] }) => {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .insert({
        user_id: userId,
        states: preferences.states || [],
        policy_areas: preferences.policy_areas || []
      })
      .select();

    if (error) {
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    throw error;
  }
};

export const updateUserPreferences = async (userId: string, preferences: { states?: string[], policy_areas?: string[] }) => {
  try {
    // First check if preferences exist
    const existing = await getUserPreferences(userId);

    if (existing) {
      // If preferences exist, delete them first

      const { error: deleteError } = await supabase
        .from('user_preferences')
        .delete()
        .eq('id', existing.id);

      if (deleteError) {
        throw deleteError;
      }
    }

    return createUserPreferences(userId, preferences);
  } catch (error) {
    throw error;
  }
};

// Judges API
export const getJudges = async (params: any = {}) => {
  let query = supabase.from('judge').select('*');

  if (params.limit) {
    query = query.limit(params.limit);
  }

  // Search by name if provided
  if (params.search) {
    query = query.or(`first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%,full_name.ilike.%${params.search}%`);
  }

  // Sort by name (alphabetical by default)
  query = query.order('last_name', { ascending: true });

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

export const getJudgeById = async (judgeId: string) => {
  const { data, error } = await supabase
    .from('judge')
    .select('*')
    .eq('id', judgeId)
    .single();

  if (error) throw error;
  return data;
};
