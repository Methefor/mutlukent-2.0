'use server';

import { Database } from '@/lib/supabase/database.types';
import { createClient } from '@/lib/supabase/server';

export type Branch = Database['public']['Tables']['branches']['Row']

export async function getUserBranches(): Promise<Branch[]> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: userData } = await supabase
    .from('users')
    .select('id, role_id, branch_id, roles(name)')
    .eq('id', user.id)
    .single();

  if (!userData) throw new Error('User not found');

  const roleName = (userData.roles as any)?.name;

  // General Manager, Accountant, Warehouse → All branches
  if (roleName && ['general_manager', 'accountant', 'warehouse_manager', 'admin'].includes(roleName)) {
    const { data: branches } = await supabase
      .from('branches')
      .select('*')
      .eq('is_active', true)
      .order('name');
    return branches || [];
  }

  // Coordinator → Assigned branches
  if (roleName === 'coordinator') {
    const { data: userBranches } = await supabase
      .from('user_branches')
      .select('branch_id, branches(*)')
      .eq('user_id', user.id);
    
    // Type assertion or mapping might be needed depending on how join returns data
    // branches(*) returns the joined branch data
    // userBranches would be like [{ branch_id: '...', branches: { ...branchData } }]
    return userBranches?.map((ub: any) => ub.branches) || [];
  }

  // Branch Manager / Staff → Own branch only
  if (userData.branch_id) {
    const { data: branch } = await supabase
      .from('branches')
      .select('*')
      .eq('id', userData.branch_id)
      .single();
    return branch ? [branch] : [];
  }

  return [];
}
