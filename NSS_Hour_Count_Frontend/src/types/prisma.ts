export type Role = "Member" | "Excomm" | "Coordinator" | "Trio";
export type HourCategory = "Dept" | "Meet" | "Event" | "Misc";

export interface Department {
  id: number;
  name: string;
}

export interface HourLog {
  id: number;
  task: string;
  category: HourCategory;
  startTime: string;
  endTime: string;
  seniorPresent?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  department: Department;
  hourLogs: HourLog[];
  hourCountDept: number;
  hourCountMeet: number;
  hourCountEvent: number;
  hourCountMisc: number;
}
