import { supabase } from './supabaseClient';

export async function saveToSupabase(title, shapes, arrows, userId = 'anonymous') {
  const diagramData = {
    title,
    shapes,
    arrows,
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('diagrams')
    .insert(diagramData)
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  return data;
}

export async function loadFromSupabase(id) {
  const { data, error } = await supabase
    .from('diagrams')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw new Error(error.message);
  return data;
}

export async function listDiagrams(userId) {
  let query = supabase
    .from('diagrams')
    .select('id, title, created_at, updated_at')
    .order('updated_at', { ascending: false });
  
  if (userId) {
    query = query.eq('user_id', userId)
  }
  
  const { data, error } = await query;
  
  if (error) throw new Error(error.message);
  return data || [];
}

export async function updateDiagram(id, title, shapes, arrows) {
  const { data, error } = await supabase
    .from('diagrams')
    .update({
      title,
      shapes,
      arrows,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteFromSupabase(id) {
  const { error } = await supabase
    .from('diagrams')
    .delete()
    .eq('id', id);
  
  if (error) throw new Error(error.message);
}