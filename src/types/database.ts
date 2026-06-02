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
      workspaces: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          primary_color: string
          secondary_color: string
          accent_color: string
          plan: 'starter' | 'pro' | 'enterprise'
          credits_remaining: number
          credits_used: number
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          primary_color?: string
          secondary_color?: string
          accent_color?: string
          plan?: 'starter' | 'pro' | 'enterprise'
          credits_remaining?: number
          credits_used?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          primary_color?: string
          secondary_color?: string
          accent_color?: string
          plan?: 'starter' | 'pro' | 'enterprise'
          credits_remaining?: number
          credits_used?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          workspace_id: string
          role: 'owner' | 'admin' | 'member'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          workspace_id: string
          role?: 'owner' | 'admin' | 'member'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          workspace_id?: string
          role?: 'owner' | 'admin' | 'member'
        }
      }
      properties: {
        Row: {
          id: string
          workspace_id: string
          portal: string
          title: string
          price: number | null
          currency: string
          price_usd: number | null
          monthly_expenses: number | null
          address: string
          street: string
          neighborhood: string
          city: string
          state: string
          country: string
          zip_code: string
          lat: number | null
          lng: number | null
          beds: number | null
          baths: number | null
          sqm: number | null
          lot_sqm: number | null
          property_type: string
          status: string
          url: string
          photos: string[]
          description: string
          features: string[]
          year_built: number | null
          garage: number | null
          publisher: string
          publisher_phone: string
          source_url: string
          scraped_at: string
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          portal: string
          title: string
          price?: number | null
          currency?: string
          price_usd?: number | null
          monthly_expenses?: number | null
          address?: string
          street?: string
          neighborhood?: string
          city?: string
          state?: string
          country?: string
          zip_code?: string
          lat?: number | null
          lng?: number | null
          beds?: number | null
          baths?: number | null
          sqm?: number | null
          lot_sqm?: number | null
          property_type?: string
          status?: string
          url?: string
          photos?: string[]
          description?: string
          features?: string[]
          year_built?: number | null
          garage?: number | null
          publisher?: string
          publisher_phone?: string
          source_url: string
          scraped_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          portal?: string
          title?: string
          price?: number | null
          currency?: string
          price_usd?: number | null
          monthly_expenses?: number | null
          address?: string
          street?: string
          neighborhood?: string
          city?: string
          state?: string
          country?: string
          zip_code?: string
          lat?: number | null
          lng?: number | null
          beds?: number | null
          baths?: number | null
          sqm?: number | null
          lot_sqm?: number | null
          property_type?: string
          status?: string
          url?: string
          photos?: string[]
          description?: string
          features?: string[]
          year_built?: number | null
          garage?: number | null
          publisher?: string
          publisher_phone?: string
          source_url?: string
          scraped_at?: string
        }
      }
      generated_ads: {
        Row: {
          id: string
          workspace_id: string
          property_id: string | null
          type: 'feed' | 'story' | 'reel' | 'meta_ad'
          image_url: string
          template_id: string
          customizations: Json
          credits_used: number
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          property_id?: string | null
          type: 'feed' | 'story' | 'reel' | 'meta_ad'
          image_url: string
          template_id: string
          customizations?: Json
          credits_used?: number
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          property_id?: string | null
          type?: 'feed' | 'story' | 'reel' | 'meta_ad'
          image_url?: string
          template_id?: string
          customizations?: Json
          credits_used?: number
        }
      }
      credit_transactions: {
        Row: {
          id: string
          workspace_id: string
          amount: number
          type: 'purchase' | 'consumption' | 'refund' | 'bonus'
          description: string
          ad_id: string | null
          stripe_payment_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          amount: number
          type: 'purchase' | 'consumption' | 'refund' | 'bonus'
          description: string
          ad_id?: string | null
          stripe_payment_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          amount?: number
          type?: 'purchase' | 'consumption' | 'refund' | 'bonus'
          description?: string
          ad_id?: string | null
          stripe_payment_id?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      deduct_credit: {
        Args: { p_workspace_id: string; p_ad_id: string }
        Returns: boolean
      }
      add_credits: {
        Args: { p_workspace_id: string; p_amount: number; p_description: string }
        Returns: boolean
      }
    }
    Enums: {
      plan_type: 'starter' | 'pro' | 'enterprise'
      user_role: 'owner' | 'admin' | 'member'
      ad_type: 'feed' | 'story' | 'reel' | 'meta_ad'
      credit_transaction_type: 'purchase' | 'consumption' | 'refund' | 'bonus'
    }
  }
}
