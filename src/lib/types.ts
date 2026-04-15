export interface Profile {
  id: string
  name: string | null
  profession: string | null
  plan: 'free' | 'pro' | 'business'
  created_at: string
}

export interface QuestionOption {
  label: string
  price_add: number
}

export interface Question {
  id: string
  form_id: string
  order_index: number
  type: 'single' | 'multi' | 'number'
  label: string
  required: boolean
  options: QuestionOption[]
}

export interface Form {
  id: string
  user_id: string
  slug: string
  title: string
  description: string | null
  active: boolean
  created_at: string
}

export interface FormWithStats extends Form {
  submissions_count?: number
}

export interface Submission {
  id: string
  form_id: string
  client_name: string | null
  client_contact: string | null
  answers: Record<string, string | string[] | number>
  total_price: number
  created_at: string
}
