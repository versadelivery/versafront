interface PermissionSubject {
  role?: string
  permissions?: string[]
}

// Espelha o User#can? da API: o dono pode tudo; os demais precisam da chave na lista de permissões.
export function hasPermission(user: PermissionSubject | null | undefined, permission: string): boolean {
  if (!user) return false
  if (user.role === 'owner') return true

  return user.permissions?.includes(permission) ?? false
}
