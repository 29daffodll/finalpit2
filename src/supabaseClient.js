import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iradphcrwwokdrnhxpnd.supabase.co'; // <-- in quotes
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyYWRwaGNyd3dva2Rybmh4cG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MTI5ODEsImV4cCI6MjA2MjI4ODk4MX0.X1okOgCMPHNh_vufxDnSlENTO99tMDjkSOXMeWawNrU'; // <-- in quotes

export const supabase = createClient(supabaseUrl, supabaseKey);

const initialFormData = {
  id: '',
  name: '',
  description: '',
  sku: '',
  category_id: '', // <-- use category_id
  created_at: '',
};
