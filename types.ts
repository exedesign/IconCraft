
export interface IconStyle {
  id: string;
  name: string;
  promptSuffix: string;
}

export interface GeneratedIcon {
  id: string;
  url: string;
  prompt: string;
  style: string;
  timestamp: number;
}

export enum GenerationState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  ERROR = 'ERROR'
}
