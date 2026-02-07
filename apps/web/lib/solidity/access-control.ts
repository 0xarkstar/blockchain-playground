export interface RoleData {
  readonly members: readonly string[];
  readonly adminRole: string;
}

export interface AccessControlState {
  readonly owner: string;
  readonly roles: Record<string, RoleData>;
}

export interface TransactionResult {
  readonly success: boolean;
  readonly state: AccessControlState;
  readonly message: string;
  readonly revertReason?: string;
}

export interface AccessCheckResult {
  readonly allowed: boolean;
  readonly reason: string;
}

export const DEFAULT_ADMIN_ROLE =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
export const MINTER_ROLE = "MINTER_ROLE";
export const PAUSER_ROLE = "PAUSER_ROLE";
export const ADMIN_ROLE = "ADMIN_ROLE";

export function createInitialState(ownerAddress: string): AccessControlState {
  return {
    owner: ownerAddress.toLowerCase(),
    roles: {
      [DEFAULT_ADMIN_ROLE]: {
        members: [ownerAddress.toLowerCase()],
        adminRole: DEFAULT_ADMIN_ROLE,
      },
    },
  };
}

export function hasRole(
  state: AccessControlState,
  roleId: string,
  account: string,
): boolean {
  const role = state.roles[roleId];
  if (!role) return false;
  return role.members.includes(account.toLowerCase());
}

export function grantRole(
  state: AccessControlState,
  roleId: string,
  account: string,
  caller: string,
): TransactionResult {
  const normalizedAccount = account.toLowerCase();
  const normalizedCaller = caller.toLowerCase();

  const role = state.roles[roleId];
  const adminRoleId = role?.adminRole ?? DEFAULT_ADMIN_ROLE;

  if (!hasRole(state, adminRoleId, normalizedCaller)) {
    return {
      success: false,
      state,
      message: `AccessControl: account ${normalizedCaller} is missing role ${adminRoleId}`,
      revertReason: "AccessControl: sender must be an admin to grant",
    };
  }

  if (hasRole(state, roleId, normalizedAccount)) {
    return {
      success: true,
      state,
      message: `Account ${normalizedAccount} already has role ${roleId}`,
    };
  }

  const existingRole = state.roles[roleId] ?? {
    members: [],
    adminRole: DEFAULT_ADMIN_ROLE,
  };

  const newRoles = {
    ...state.roles,
    [roleId]: {
      ...existingRole,
      members: [...existingRole.members, normalizedAccount],
    },
  };

  return {
    success: true,
    state: { ...state, roles: newRoles },
    message: `Granted role ${roleId} to ${normalizedAccount}`,
  };
}

export function revokeRole(
  state: AccessControlState,
  roleId: string,
  account: string,
  caller: string,
): TransactionResult {
  const normalizedAccount = account.toLowerCase();
  const normalizedCaller = caller.toLowerCase();

  const role = state.roles[roleId];
  const adminRoleId = role?.adminRole ?? DEFAULT_ADMIN_ROLE;

  if (!hasRole(state, adminRoleId, normalizedCaller)) {
    return {
      success: false,
      state,
      message: `AccessControl: account ${normalizedCaller} is missing role ${adminRoleId}`,
      revertReason: "AccessControl: sender must be an admin to revoke",
    };
  }

  if (!hasRole(state, roleId, normalizedAccount)) {
    return {
      success: true,
      state,
      message: `Account ${normalizedAccount} does not have role ${roleId}`,
    };
  }

  const newRoles = {
    ...state.roles,
    [roleId]: {
      ...role!,
      members: role!.members.filter((m) => m !== normalizedAccount),
    },
  };

  return {
    success: true,
    state: { ...state, roles: newRoles },
    message: `Revoked role ${roleId} from ${normalizedAccount}`,
  };
}

export function renounceRole(
  state: AccessControlState,
  roleId: string,
  caller: string,
): TransactionResult {
  const normalizedCaller = caller.toLowerCase();

  if (!hasRole(state, roleId, normalizedCaller)) {
    return {
      success: false,
      state,
      message: `Account ${normalizedCaller} does not have role ${roleId}`,
      revertReason: "AccessControl: can only renounce roles for self",
    };
  }

  const role = state.roles[roleId]!;
  const newRoles = {
    ...state.roles,
    [roleId]: {
      ...role,
      members: role.members.filter((m) => m !== normalizedCaller),
    },
  };

  return {
    success: true,
    state: { ...state, roles: newRoles },
    message: `Account ${normalizedCaller} renounced role ${roleId}`,
  };
}

export function transferOwnership(
  state: AccessControlState,
  newOwner: string,
  caller: string,
): TransactionResult {
  const normalizedCaller = caller.toLowerCase();
  const normalizedNewOwner = newOwner.toLowerCase();

  if (normalizedCaller !== state.owner) {
    return {
      success: false,
      state,
      message: "Ownable: caller is not the owner",
      revertReason: "Ownable: caller is not the owner",
    };
  }

  const adminRole = state.roles[DEFAULT_ADMIN_ROLE];
  const newAdminMembers = adminRole
    ? adminRole.members
        .filter((m) => m !== normalizedCaller)
        .concat(normalizedNewOwner)
    : [normalizedNewOwner];

  const newRoles = {
    ...state.roles,
    [DEFAULT_ADMIN_ROLE]: {
      ...(adminRole ?? { adminRole: DEFAULT_ADMIN_ROLE }),
      members: newAdminMembers,
      adminRole: DEFAULT_ADMIN_ROLE,
    },
  };

  return {
    success: true,
    state: { ...state, owner: normalizedNewOwner, roles: newRoles },
    message: `Ownership transferred from ${normalizedCaller} to ${normalizedNewOwner}`,
  };
}

export function checkFunctionAccess(
  state: AccessControlState,
  caller: string,
  requiredRole: string,
): AccessCheckResult {
  const normalizedCaller = caller.toLowerCase();

  if (requiredRole === "onlyOwner") {
    return normalizedCaller === state.owner
      ? { allowed: true, reason: "Caller is the contract owner" }
      : { allowed: false, reason: "Ownable: caller is not the owner" };
  }

  return hasRole(state, requiredRole, normalizedCaller)
    ? { allowed: true, reason: `Caller has role ${requiredRole}` }
    : {
        allowed: false,
        reason: `AccessControl: account ${normalizedCaller} is missing role ${requiredRole}`,
      };
}
