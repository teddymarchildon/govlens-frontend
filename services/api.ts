import { supabase } from '../lib/supabase';
import { Bill, Congressman, SavedBill, SavedCongressman } from '../types/types';

// Bills API
export const getBills = async (params: any = {}) => {
  let query = supabase.from('bill').select('*');

  if (params.limit) {
    query = query.limit(params.limit);
  }

  if (params.policy_area) {
    query = query.eq('policy_area', params.policy_area);
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
    .select('bill_id, bill:bill(*)')
    .eq('congressman_id', congressmanId);

  if (error) throw error;
  return data.map(item => item.bill) as unknown as Bill[];
};

export const getCongressmanCosponsoredBills = async (congressmanId: string): Promise<Bill[]> => {
  const { data, error } = await supabase
    .from('cosponsored_bills')
    .select('bill_id, bill:bill(*)')
    .eq('congressman_id', congressmanId);

  if (error) throw error;
  return data.map(item => item.bill) as unknown as Bill[];
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
