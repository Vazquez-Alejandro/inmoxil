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
          public_catalog_enabled: boolean
          pub_catalog_slug: string | null
          contact_email: string | null
          contact_phone: string | null
          contact_address: string | null
          social_instagram: string | null
          social_facebook: string | null
          social_twitter: string | null
          social_linkedin: string | null
          whatsapp_number: string | null
          timezone: string
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
          public_catalog_enabled?: boolean
          pub_catalog_slug?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_address?: string | null
          social_instagram?: string | null
          social_facebook?: string | null
          social_twitter?: string | null
          social_linkedin?: string | null
          whatsapp_number?: string | null
          timezone?: string
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
          public_catalog_enabled?: boolean
          pub_catalog_slug?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_address?: string | null
          social_instagram?: string | null
          social_facebook?: string | null
          social_twitter?: string | null
          social_linkedin?: string | null
          whatsapp_number?: string | null
          timezone?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          password_hash: string | null
          full_name: string | null
          workspace_id: string
          role: 'owner' | 'admin' | 'member'
          terms_accepted_at: string | null
          role_in_workspace: string | null
          phone: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash?: string | null
          full_name?: string | null
          workspace_id: string
          role?: 'owner' | 'admin' | 'member'
          terms_accepted_at?: string | null
          role_in_workspace?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string | null
          full_name?: string | null
          workspace_id?: string
          role?: 'owner' | 'admin' | 'member'
          terms_accepted_at?: string | null
          role_in_workspace?: string | null
          phone?: string | null
          avatar_url?: string | null
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
          operation_type: string
          updated_at: string
          owner_id: string | null
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
          operation_type?: string
          updated_at?: string
          owner_id?: string | null
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
          operation_type?: string
          updated_at?: string
          owner_id?: string | null
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
          type: 'purchase' | 'consumption' | 'refund' | 'bonus' | 'usage'
          description: string
          ad_id: string | null
          stripe_payment_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          amount: number
          type: 'purchase' | 'consumption' | 'refund' | 'bonus' | 'usage'
          description: string
          ad_id?: string | null
          stripe_payment_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          amount?: number
          type?: 'purchase' | 'consumption' | 'refund' | 'bonus' | 'usage'
          description?: string
          ad_id?: string | null
          stripe_payment_id?: string | null
        }
      }
      property_owners: {
        Row: {
          id: string
          workspace_id: string
          name: string
          email: string
          phone: string | null
          password_hash: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          email: string
          phone?: string | null
          password_hash?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          name?: string
          email?: string
          phone?: string | null
          password_hash?: string | null
        }
      }
      pipeline_stages: {
        Row: {
          id: string
          workspace_id: string
          name: string
          order: number
          color: string
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          order?: number
          color?: string
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          name?: string
          order?: number
          color?: string
          is_default?: boolean
        }
      }
      pipeline_leads: {
        Row: {
          id: string
          workspace_id: string
          stage_id: string
          property_id: string | null
          full_name: string
          phone: string | null
          email: string | null
          document_type: string
          document_number: string | null
          source: string
          status: string
          notes: string | null
          budget_min: number | null
          budget_max: number | null
          currency: string
          requirements: string | null
          stage_order: number
          assigned_to: string | null
          last_contact_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          stage_id: string
          property_id?: string | null
          full_name: string
          phone?: string | null
          email?: string | null
          document_type?: string
          document_number?: string | null
          source?: string
          status?: string
          notes?: string | null
          budget_min?: number | null
          budget_max?: number | null
          currency?: string
          requirements?: string | null
          stage_order?: number
          assigned_to?: string | null
          last_contact_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          stage_id?: string
          property_id?: string | null
          full_name?: string
          phone?: string | null
          email?: string | null
          document_type?: string
          document_number?: string | null
          source?: string
          status?: string
          notes?: string | null
          budget_min?: number | null
          budget_max?: number | null
          currency?: string
          requirements?: string | null
          stage_order?: number
          assigned_to?: string | null
          last_contact_at?: string | null
          updated_at?: string
        }
      }
      pipeline_activities: {
        Row: {
          id: string
          lead_id: string
          type: string
          description: string | null
          outcome: string | null
          scheduled_at: string | null
          completed_at: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          type: string
          description?: string | null
          outcome?: string | null
          scheduled_at?: string | null
          completed_at?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          type?: string
          description?: string | null
          outcome?: string | null
          scheduled_at?: string | null
          completed_at?: string | null
          created_by?: string | null
        }
      }
      contracts: {
        Row: {
          id: string
          workspace_id: string
          type: string
          status: string
          number: string | null
          title: string
          start_date: string
          end_date: string
          duration_months: number
          lessor_name: string
          lessor_document_type: string
          lessor_document_number: string
          lessor_address: string | null
          lessor_phone: string | null
          lessor_email: string | null
          lessee_name: string
          lessee_document_type: string
          lessee_document_number: string
          lessee_address: string | null
          lessee_phone: string | null
          lessee_email: string | null
          property_address: string
          property_city: string | null
          property_province: string | null
          property_description: string | null
          property_cpa: string | null
          property_registration: string | null
          amount: number
          currency: string
          adjustment_index: string | null
          adjustment_frequency_months: number
          deposit_amount: number | null
          commission_percentage: number | null
          commission_amount: number | null
          expenses_included: boolean
          expenses_amount: number | null
          clauses: Json
          notes: string | null
          last_adjustment_date: string | null
          last_adjustment_value: number | null
          next_adjustment_date: string | null
          signed_by_lessor: boolean
          signed_by_lessee: boolean
          signed_at: string | null
          property_id: string | null
          owner_id: string | null
          code: string | null
          tenant_name: string | null
          monthly_price: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          type?: string
          status?: string
          number?: string | null
          title: string
          start_date: string
          end_date: string
          duration_months: number
          lessor_name: string
          lessor_document_type?: string
          lessor_document_number: string
          lessor_address?: string | null
          lessor_phone?: string | null
          lessor_email?: string | null
          lessee_name: string
          lessee_document_type?: string
          lessee_document_number: string
          lessee_address?: string | null
          lessee_phone?: string | null
          lessee_email?: string | null
          property_address: string
          property_city?: string | null
          property_province?: string | null
          property_description?: string | null
          property_cpa?: string | null
          property_registration?: string | null
          amount: number
          currency?: string
          adjustment_index?: string | null
          adjustment_frequency_months?: number
          deposit_amount?: number | null
          commission_percentage?: number | null
          commission_amount?: number | null
          expenses_included?: boolean
          expenses_amount?: number | null
          clauses?: Json
          notes?: string | null
          last_adjustment_date?: string | null
          last_adjustment_value?: number | null
          next_adjustment_date?: string | null
          signed_by_lessor?: boolean
          signed_by_lessee?: boolean
          signed_at?: string | null
          property_id?: string | null
          owner_id?: string | null
          code?: string | null
          tenant_name?: string | null
          monthly_price?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          type?: string
          status?: string
          number?: string | null
          title?: string
          start_date?: string
          end_date?: string
          duration_months?: number
          lessor_name?: string
          lessor_document_type?: string
          lessor_document_number?: string
          lessor_address?: string | null
          lessor_phone?: string | null
          lessor_email?: string | null
          lessee_name?: string
          lessee_document_type?: string
          lessee_document_number?: string
          lessee_address?: string | null
          lessee_phone?: string | null
          lessee_email?: string | null
          property_address?: string
          property_city?: string | null
          property_province?: string | null
          property_description?: string | null
          property_cpa?: string | null
          property_registration?: string | null
          amount?: number
          currency?: string
          adjustment_index?: string | null
          adjustment_frequency_months?: number
          deposit_amount?: number | null
          commission_percentage?: number | null
          commission_amount?: number | null
          expenses_included?: boolean
          expenses_amount?: number | null
          clauses?: Json
          notes?: string | null
          last_adjustment_date?: string | null
          last_adjustment_value?: number | null
          next_adjustment_date?: string | null
          signed_by_lessor?: boolean
          signed_by_lessee?: boolean
          signed_at?: string | null
          property_id?: string | null
          owner_id?: string | null
          code?: string | null
          tenant_name?: string | null
          monthly_price?: number | null
          updated_at?: string
        }
      }
      guarantors: {
        Row: {
          id: string
          contract_id: string
          full_name: string
          document_type: string
          document_number: string
          income: number | null
          income_currency: string
          property_address: string | null
          property_value: number | null
          phone: string | null
          email: string | null
          relationship: string | null
          created_at: string
        }
        Insert: {
          id?: string
          contract_id: string
          full_name: string
          document_type?: string
          document_number: string
          income?: number | null
          income_currency?: string
          property_address?: string | null
          property_value?: number | null
          phone?: string | null
          email?: string | null
          relationship?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          contract_id?: string
          full_name?: string
          document_type?: string
          document_number?: string
          income?: number | null
          income_currency?: string
          property_address?: string | null
          property_value?: number | null
          phone?: string | null
          email?: string | null
          relationship?: string | null
        }
      }
      adjustments: {
        Row: {
          id: string
          contract_id: string
          previous_amount: number
          new_amount: number
          previous_index: number | null
          current_index: number | null
          variation: number | null
          index_type: string | null
          adjustment_date: string
          created_at: string
        }
        Insert: {
          id?: string
          contract_id: string
          previous_amount: number
          new_amount: number
          previous_index?: number | null
          current_index?: number | null
          variation?: number | null
          index_type?: string | null
          adjustment_date: string
          created_at?: string
        }
        Update: {
          id?: string
          contract_id?: string
          previous_amount?: number
          new_amount?: number
          previous_index?: number | null
          current_index?: number | null
          variation?: number | null
          index_type?: string | null
          adjustment_date?: string
        }
      }
      alerts: {
        Row: {
          id: string
          contract_id: string
          days_before: number
          channel: string
          enabled: boolean
          last_sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          contract_id: string
          days_before?: number
          channel?: string
          enabled?: boolean
          last_sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          contract_id?: string
          days_before?: number
          channel?: string
          enabled?: boolean
          last_sent_at?: string | null
        }
      }
      index_snapshots: {
        Row: {
          id: string
          type: string
          value: number
          date: string
          source: string | null
          created_at: string
        }
        Insert: {
          id?: string
          type: string
          value: number
          date: string
          source?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          type?: string
          value?: number
          date?: string
          source?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          workspace_id: string
          type: string
          title: string
          message: string | null
          link: string | null
          icon: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          type: string
          title: string
          message?: string | null
          link?: string | null
          icon?: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          type?: string
          title?: string
          message?: string | null
          link?: string | null
          icon?: string
          read?: boolean
        }
      }
      ml_tokens: {
        Row: {
          id: string
          workspace_id: string
          access_token: string
          refresh_token: string | null
          user_id: string | null
          seller_id: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          access_token: string
          refresh_token?: string | null
          user_id?: string | null
          seller_id?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          access_token?: string
          refresh_token?: string | null
          user_id?: string | null
          seller_id?: string | null
          expires_at?: string | null
          updated_at?: string
        }
      }
      scrape_schedules: {
        Row: {
          id: string
          workspace_id: string
          portal: string
          active: boolean
          frequency_hours: number
          max_items: number
          urls: string[]
          last_run_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          portal: string
          active?: boolean
          frequency_hours?: number
          max_items?: number
          urls?: string[]
          last_run_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          portal?: string
          active?: boolean
          frequency_hours?: number
          max_items?: number
          urls?: string[]
          last_run_at?: string | null
          updated_at?: string
        }
      }
      scrape_logs: {
        Row: {
          id: string
          workspace_id: string
          schedule_id: string | null
          portal: string
          status: string
          items_scraped: number
          items_imported: number
          error: string | null
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          workspace_id: string
          schedule_id?: string | null
          portal: string
          status?: string
          items_scraped?: number
          items_imported?: number
          error?: string | null
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          workspace_id?: string
          schedule_id?: string | null
          portal?: string
          status?: string
          items_scraped?: number
          items_imported?: number
          error?: string | null
          completed_at?: string | null
        }
      }
      publish_channels: {
        Row: {
          id: string
          workspace_id: string
          type: string
          label: string
          config: Json
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          type: string
          label: string
          config?: Json
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          type?: string
          label?: string
          config?: Json
          active?: boolean
          updated_at?: string
        }
      }
      publish_logs: {
        Row: {
          id: string
          workspace_id: string
          property_id: string | null
          channel_id: string | null
          channel_type: string
          property_title: string | null
          status: string
          result: Json
          error: string | null
          external_id: string | null
          external_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          property_id?: string | null
          channel_id?: string | null
          channel_type: string
          property_title?: string | null
          status: string
          result?: Json
          error?: string | null
          external_id?: string | null
          external_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          property_id?: string | null
          channel_id?: string | null
          channel_type?: string
          property_title?: string | null
          status?: string
          result?: Json
          error?: string | null
          external_id?: string | null
          external_url?: string | null
        }
      }
      commissions: {
        Row: {
          id: string
          workspace_id: string
          property_id: string | null
          lead_id: string | null
          contract_id: string | null
          title: string
          amount: number
          currency: string
          status: string
          commission_percentage: number | null
          description: string | null
          due_date: string | null
          paid_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          property_id?: string | null
          lead_id?: string | null
          contract_id?: string | null
          title: string
          amount: number
          currency?: string
          status?: string
          commission_percentage?: number | null
          description?: string | null
          due_date?: string | null
          paid_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          property_id?: string | null
          lead_id?: string | null
          contract_id?: string | null
          title?: string
          amount?: number
          currency?: string
          status?: string
          commission_percentage?: number | null
          description?: string | null
          due_date?: string | null
          paid_at?: string | null
          created_by?: string | null
          updated_at?: string
        }
      }
      role_permissions: {
        Row: {
          id: string
          workspace_id: string
          role: string
          permission: string
        }
        Insert: {
          id?: string
          workspace_id: string
          role: string
          permission: string
        }
        Update: {
          id?: string
          workspace_id?: string
          role?: string
          permission?: string
        }
      }
      whatsapp_templates: {
        Row: {
          id: string
          workspace_id: string
          name: string
          content: string
          variables: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          content: string
          variables?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          name?: string
          content?: string
          variables?: string[]
          updated_at?: string
        }
      }
      whatsapp_messages: {
        Row: {
          id: string
          workspace_id: string
          lead_id: string | null
          property_id: string | null
          direction: string
          content: string
          status: string
          sent_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          lead_id?: string | null
          property_id?: string | null
          direction?: string
          content: string
          status?: string
          sent_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          lead_id?: string | null
          property_id?: string | null
          direction?: string
          content?: string
          status?: string
        }
      }
      signature_requests: {
        Row: {
          id: string
          contract_id: string
          workspace_id: string
          signer_name: string
          signer_email: string
          signer_type: string
          token: string
          status: string
          signed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          contract_id: string
          workspace_id: string
          signer_name: string
          signer_email: string
          signer_type?: string
          token?: string
          status?: string
          signed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          contract_id?: string
          workspace_id?: string
          signer_name?: string
          signer_email?: string
          signer_type?: string
          token?: string
          status?: string
          signed_at?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          workspace_id: string
          contract_id: string | null
          property_id: string | null
          amount: number
          currency: string
          concept: string
          status: string
          due_date: string | null
          period_from: string | null
          period_to: string | null
          notes: string | null
          paid_at: string | null
          payment_method: string | null
          checkout_url: string | null
          stripe_session_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          contract_id?: string | null
          property_id?: string | null
          amount: number
          currency?: string
          concept: string
          status?: string
          due_date?: string | null
          period_from?: string | null
          period_to?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          checkout_url?: string | null
          stripe_session_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          contract_id?: string | null
          property_id?: string | null
          amount?: number
          currency?: string
          concept?: string
          status?: string
          due_date?: string | null
          period_from?: string | null
          period_to?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          checkout_url?: string | null
          stripe_session_id?: string | null
        }
      }
      tenant_access_tokens: {
        Row: {
          id: string
          workspace_id: string
          contract_id: string
          token: string
          email: string
          last_access_at: string | null
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          contract_id: string
          token?: string
          email: string
          last_access_at?: string | null
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          contract_id?: string
          token?: string
          email?: string
          last_access_at?: string | null
          expires_at?: string | null
        }
      }
      report_schedules: {
        Row: {
          id: string
          workspace_id: string
          type: string
          email: string
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          type: string
          email: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          type?: string
          email?: string
          active?: boolean
          updated_at?: string
        }
      }
      report_logs: {
        Row: {
          id: string
          workspace_id: string
          type: string
          recipient: string
          summary: Json
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          type: string
          recipient: string
          summary?: Json
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          type?: string
          recipient?: string
          summary?: Json
          status?: string
        }
      }
      password_resets: {
        Row: {
          id: string
          user_id: string
          token: string
          expires_at: string
          used: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token: string
          expires_at: string
          used?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token?: string
          expires_at?: string
          used?: boolean
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
      credit_transaction_type: 'purchase' | 'consumption' | 'refund' | 'bonus' | 'usage'
    }
  }
}
