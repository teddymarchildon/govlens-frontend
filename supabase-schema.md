# Supabase schema

## Tables

### bill

Columns:
- id: uuid
- congress: integer
- type: string
- number: string
- title: string

### bill_text
Columns:
- id: uuid
- bill_id: FK to bill
- pdf_url: string
- html_url: string
- xml_url: string
- date: date
- pdf_file_path: string
- html_file_path: string
- xml_file_path: string

### sponsored_bills
Columns:
- id: uuid
- bill_id: FK to bill
- congressman_id: FK to congressman

### cosponsored_bills
Columns:
- id: uuid
- bill_id: FK to bill
- congressman_id: FK to congressman

### congressman
Columns:
- id: uuid
- full_name: string
- first_name: string
- middle_name: string
- last_name: string
- party: string
- state: string
- district: string
- phone: string
- website: string
- address: string
- chamber: string

### congressman_term
Columns:
- id: uuid
- congressman_id: FK to congressman
- start_year: date
- end_year: date | optional
- state: string
- district: string
- chamber: string


### committee
Columns:
- id: uuid
- name: string

### saved_congressman
Columns:
- id: uuid
- congressman_id: FK to congressman.id
- user_id: FK to user.id

### saved_bill
Columns:
- id: uuid
- bill_id: FK to bill.id
- user_id: FK to user.id

### user
Columns:
- id: uuid
- email: string
- name: string
