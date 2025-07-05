type Id = string;


export interface ServerInfo {
  name: string;
  login_message: string;
  login_message_title: string;
  login_message_type: string;
  requires_invite: boolean;
  world: {
    hostname: string;
    min_memory: number;
    default_memory: number;
    port: number;
  }
}

export interface User {
  id: Id;
  username: string;
  avatar_id: Id | null;
  group_id: Id;
  enabled: boolean;
}

export interface Group {
  id: Id,
  name: string;
  total_memory_limit: number | null;
  per_world_memory_limit: number | null;
  world_limit: number | null;
  active_world_limit: number | null;
  storage_limit: number | null;
  config_blacklist: string[];
  config_whitelist: string[];
  config_limits: {[key: string]: string | null};
  is_privileged: boolean;
}

export interface Session {
  id: Id,
  user_id : Id,
  created: Date
  expired: boolean
}

export interface ModLoader {
  id: Id,
  name: string,
  can_load_mods: boolean,
}

export interface Version {
  id: Id,
  minecraft_version: string,
  mod_loader_id: Id,
}

export interface World {
  id: Id,
  owner_id: Id,
  name: string;
  hostname: string
  allocated_memory: number
  version_id: Id,
  enabled: boolean
}

export interface WorldStatus {
  status: string;
  code: number;
}

export interface IsValid {
  valid: boolean
}
