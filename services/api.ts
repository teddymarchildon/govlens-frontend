import { supabase } from '../lib/supabase';
import { AgencyDocument, Bill, Congressman, SavedBill, SavedCongressman } from '../types/types';

// Storage API
export const getStoragePublicUrl = async (bucketName: string, filePath: string): Promise<string> => {
  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return data.publicUrl;
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
  console.log(`Saving congressman: userId=${userId}, congressmanId=${congressmanId}`);
  try {
    const { data, error } = await supabase
      .from('saved_congressman')
      .insert([
        { user_id: userId, congressman_id: congressmanId }
      ])
      .select();

    if (error) {
      console.error('Error saving congressman:', error);
      throw error;
    }

    console.log('Congressman saved successfully:', data);
    return data;
  } catch (error) {
    console.error('Exception saving congressman:', error);
    throw error;
  }
};

export const unsaveCongressman = async (userId: string, congressmanId: string) => {
  console.log(`Unsaving congressman: userId=${userId}, congressmanId=${congressmanId}`);
  try {
    const { data, error } = await supabase
      .from('saved_congressman')
      .delete()
      .match({ user_id: userId, congressman_id: congressmanId })
      .select();

    if (error) {
      console.error('Error unsaving congressman:', error);
      throw error;
    }

    console.log('Congressman unsaved successfully:', data);
    return data;
  } catch (error) {
    console.error('Exception unsaving congressman:', error);
    throw error;
  }
};

export const isCongressmanSaved = async (userId: string, congressmanId: string) => {
  console.log(`Checking if congressman is saved: userId=${userId}, congressmanId=${congressmanId}`);
  try {
    const { data, error, count } = await supabase
      .from('saved_congressman')
      .select('*', { count: 'exact' })
      .match({ user_id: userId, congressman_id: congressmanId });

    if (error) {
      console.error('Error checking if congressman is saved:', error);
      throw error;
    }

    const isSaved = (count || 0) > 0;
    console.log(`Congressman saved status: ${isSaved}`, data);
    return isSaved;
  } catch (error) {
    console.error('Exception checking if congressman is saved:', error);
    return false;
  }
};

// Save/Unsave Bills
export const saveBill = async (userId: string, billId: string) => {
  console.log(`Saving bill: userId=${userId}, billId=${billId}`);
  try {
    const { data, error } = await supabase
      .from('saved_bill')
      .insert([
        { user_id: userId, bill_id: billId }
      ])
      .select();

    if (error) {
      console.error('Error saving bill:', error);
      throw error;
    }

    console.log('Bill saved successfully:', data);
    return data;
  } catch (error) {
    console.error('Exception saving bill:', error);
    throw error;
  }
};

export const unsaveBill = async (userId: string, billId: string) => {
  console.log(`Unsaving bill: userId=${userId}, billId=${billId}`);
  try {
    const { data, error } = await supabase
      .from('saved_bill')
      .delete()
      .match({ user_id: userId, bill_id: billId })
      .select();

    if (error) {
      console.error('Error unsaving bill:', error);
      throw error;
    }

    console.log('Bill unsaved successfully:', data);
    return data;
  } catch (error) {
    console.error('Exception unsaving bill:', error);
    throw error;
  }
};

export const isBillSaved = async (userId: string, billId: string) => {
  console.log(`Checking if bill is saved: userId=${userId}, billId=${billId}`);
  try {
    const { data, error, count } = await supabase
      .from('saved_bill')
      .select('*', { count: 'exact' })
      .match({ user_id: userId, bill_id: billId });

    if (error) {
      console.error('Error checking if bill is saved:', error);
      throw error;
    }

    const isSaved = (count || 0) > 0;
    console.log(`Bill saved status: ${isSaved}`, data);
    return isSaved;
  } catch (error) {
    console.error('Exception checking if bill is saved:', error);
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
    console.error('Error fetching bill actions:', error);
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
  console.log(`Saving agency: userId=${userId}, agencyId=${agencyId}`);
  try {
    const { data, error } = await supabase
      .from('saved_agency')
      .insert([
        { user_id: userId, agency_id: agencyId }
      ])
      .select();

    if (error) {
      console.error('Error saving agency:', error);
      throw error;
    }

    console.log('Agency saved successfully:', data);
    return data;
  } catch (error) {
    console.error('Exception saving agency:', error);
    throw error;
  }
};

export const unsaveAgency = async (userId: string, agencyId: string) => {
  console.log(`Unsaving agency: userId=${userId}, agencyId=${agencyId}`);
  try {
    const { data, error } = await supabase
      .from('saved_agency')
      .delete()
      .match({ user_id: userId, agency_id: agencyId })
      .select();

    if (error) {
      console.error('Error unsaving agency:', error);
      throw error;
    }

    console.log('Agency unsaved successfully:', data);
    return data;
  } catch (error) {
    console.error('Exception unsaving agency:', error);
    throw error;
  }
};

export const isAgencySaved = async (userId: string, agencyId: string) => {
  console.log(`Checking if agency is saved: userId=${userId}, agencyId=${agencyId}`);
  try {
    const { data, error, count } = await supabase
      .from('saved_agency')
      .select('*', { count: 'exact' })
      .match({ user_id: userId, agency_id: agencyId });

    if (error) {
      console.error('Error checking if agency is saved:', error);
      throw error;
    }

    const isSaved = (count || 0) > 0;
    console.log(`Agency saved status: ${isSaved}`, data);
    return isSaved;
  } catch (error) {
    console.error('Exception checking if agency is saved:', error);
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
      console.error('Error fetching agency document IDs:', agencyError);
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
      console.error('Error fetching documents:', documentsError);
      throw documentsError;
    }

    return documents || [];
  } catch (error) {
    console.error('Error in getAgencyDocuments:', error);
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
      console.error('Error fetching top-level agencies:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getTopLevelAgencies:', error);
    throw error;
  }
};
