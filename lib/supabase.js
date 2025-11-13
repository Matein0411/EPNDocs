import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Exportar una función en lugar de una instancia
export function getSupabaseClient() {
  return createClientComponentClient()
}

// Para compatibilidad con código existente
export const supabase = createClientComponentClient()