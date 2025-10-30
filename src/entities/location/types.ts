export type LocationChild = {
  id: string;
  name: string;
  altName?: string;
};

export type LocationBoundary = {
  id: string;
  name: string;
  altName?: string;
  children?: LocationChild[];
};
