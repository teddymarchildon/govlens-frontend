import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const saveItem = async (itemId: string, itemType: string) => {
  try {
    const { data, error } = await supabase
      .from('saved_items')
      .insert([
        {
          item_id: itemId,
          item_type: itemType,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }
      ]);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving item:', error);
    throw error;
  }
};
