export interface Note {
  id: string
  project_id: string
  user_id: string
  content: string
  tags: string[]
  linked_doc_ids: string[]
  created_at: string
  updated_at: string
}
