export interface Judge {
  id: string;
  full_name: string;
}

export interface Opinion {
  id: string;
  type: string;
  date: string;
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
}

export interface ClusterDetail extends Cluster {
  scdb_id: string | null;
  scdb_decision_direction: string | null;
  scdb_votes_majority: number | null;
  scdb_votes_minority: number | null;
}

export interface OpinionsByType {
  [type: string]: Opinion[];
}
