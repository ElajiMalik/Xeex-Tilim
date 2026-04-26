export const Role = {
  CITOYEN: 'CITOYEN',
  AGENT: 'AGENT',
  CHEF_BRIGADE: 'CHEF_BRIGADE',
  ADMINISTRATEUR: 'ADMINISTRATEUR',
};

export const ROLE_LEVEL = {
  [Role.CITOYEN]: 1,
  [Role.AGENT]: 2,
  [Role.CHEF_BRIGADE]: 3,
  [Role.ADMINISTRATEUR]: 4,
};

export function hasRequiredRole(userRole, minimumRole) {
  return (ROLE_LEVEL[userRole] ?? 0) >= (ROLE_LEVEL[minimumRole] ?? 99);
}
