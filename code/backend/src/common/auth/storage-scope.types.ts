export type StorageScopeCapability = 'read' | 'manage';

export type StorageScopeSummary = {
  capability: StorageScopeCapability;
  id?: string;
  inheritChildren: boolean;
  pathPrefix: string;
};
