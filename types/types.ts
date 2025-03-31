export interface Bill {
  id: string;
  congress: number;
  type: string;
  number: string;
  title: string;
  introduced_date?: string;
  policy_area?: string;
  bill_unique_id?: string;
}

export interface BillText {
  id: string;
  bill_id: string;
  pdf_url?: string;
  html_url?: string;
  xml_url?: string;
  date?: string;
  pdf_file_path?: string;
  html_file_path?: string;
  xml_file_path?: string;
}

export interface Law {
  id: string;
  congress: number;
  type: string;
  number: string;
  title: string;
  enacted_date?: string;
  unique_id: string;
  policy_area?: string;
}

export interface LawText {
  id: string;
  law_id: string;
  pdf_url?: string;
  html_url?: string;
  xml_url?: string;
  date?: string;
  pdf_file_path?: string;
  html_file_path?: string;
  xml_file_path?: string;
}

export interface Congressman {
  id: string;
  full_name: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  party: string;
  state: string;
  district?: string;
  phone?: string;
  website?: string;
  address?: string;
  bioguide_id?: string;
  chamber?: string;
}

export interface CongressmanTerm {
  id: string;
  congressman_id: string;
  start_year: string;
  end_year?: string;
  state: string;
  district?: string;
  chamber: string;
}

export interface SavedBill {
  id: string;
  bill_id: string;
  user_id: string;
  bill?: Bill;
}

export interface SavedCongressman {
  id: string;
  congressman_id: string;
  user_id: string;
  congressman?: Congressman;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}
