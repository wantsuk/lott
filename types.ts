
export interface Prize {
  id: string;
  name: string;
  weight: number;
}

export interface AppState {
  title: string;
  prizes: Prize[];
}
