export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    email: string | null
                    phone_number: string | null
                    team: 'logistics' | 'sponsoring' | null
                    created_at: string
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    email?: string | null
                    phone_number?: string | null
                    team?: 'logistics' | 'sponsoring' | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    email?: string | null
                    phone_number?: string | null
                    team?: 'logistics' | 'sponsoring' | null
                    created_at?: string
                }
            }
            events: {
                Row: {
                    id: number
                    name: string
                    status: 'planned' | 'ongoing' | 'finished' | null
                    created_at: string
                }
                Insert: {
                    id?: number
                    name: string
                    status?: 'planned' | 'ongoing' | 'finished' | null
                    created_at?: string
                }
                Update: {
                    id?: number
                    name?: string
                    status?: 'planned' | 'ongoing' | 'finished' | null
                    created_at?: string
                }
            }
            companies: {
                Row: {
                    id: number
                    name: string
                    status: 'contacted' | 'pending' | 'signed' | 'rejected' | null
                    contact_method: 'call' | 'email' | 'linkedin' | 'outing' | null
                    assigned_user_id: string | null
                    notes: string | null
                    contact: string | null
                    created_at: string
                }
                Insert: {
                    id?: number
                    name: string
                    status?: 'contacted' | 'pending' | 'signed' | 'rejected' | null
                    contact_method?: 'call' | 'email' | 'linkedin' | 'outing' | null
                    assigned_user_id?: string | null
                    notes?: string | null
                    contact?: string | null
                    created_at?: string
                }
                Update: {
                    id?: number
                    name?: string
                    status?: 'contacted' | 'pending' | 'signed' | 'rejected' | null
                    contact_method?: 'call' | 'email' | 'linkedin' | 'outing' | null
                    assigned_user_id?: string | null
                    notes?: string | null
                    contact?: string | null
                    created_at?: string
                }
            }
            logistics: {
                Row: {
                    id: number
                    name: string
                    type: 'hotel' | 'salle' | 'food' | 'goodies' | null
                    status: string | null
                    contact_method: 'call' | 'email' | 'linkedin' | 'outing' | null
                    assigned_user_id: string | null
                    notes: string | null
                    contact: string | null
                    created_at: string
                }
                Insert: {
                    id?: number
                    name: string
                    type?: 'hotel' | 'salle' | 'food' | 'goodies' | null
                    status?: string | null
                    contact_method?: 'call' | 'email' | 'linkedin' | 'outing' | null
                    assigned_user_id?: string | null
                    notes?: string | null
                    contact?: string | null
                    created_at?: string
                }
                Update: {
                    id?: number
                    name?: string
                    type?: 'hotel' | 'salle' | 'food' | 'goodies' | null
                    status?: string | null
                    contact_method?: 'call' | 'email' | 'linkedin' | 'outing' | null
                    assigned_user_id?: string | null
                    notes?: string | null
                    contact?: string | null
                    created_at?: string
                }
            }
            activities: {
                Row: {
                    id: number
                    user_id: string | null
                    source: 'company' | 'logistics' | null
                    source_id: number
                    contact_method: 'call' | 'email' | 'linkedin' | 'outing' | null
                    created_at: string
                }
                Insert: {
                    id?: number
                    user_id?: string | null
                    source?: 'company' | 'logistics' | null
                    source_id: number
                    contact_method?: 'call' | 'email' | 'linkedin' | 'outing' | null
                    created_at?: string
                }
                Update: {
                    id?: number
                    user_id?: string | null
                    source?: 'company' | 'logistics' | null
                    source_id?: number
                    contact_method?: 'call' | 'email' | 'linkedin' | 'outing' | null
                    created_at?: string
                }
            }
        }
    }
}
