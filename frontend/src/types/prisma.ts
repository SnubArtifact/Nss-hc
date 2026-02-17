export type Role = "Member" | "SecondYearPORHolder" | "Coordinator" | "Trio";
export type HourCategory = "Dept" | "Meet" | "Event" | "Misc" | "HR";

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
  status: "Pending" | "Approved" | "Rejected";
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  specificPosition?: string;
  department: Department;
  hourLogs: HourLog[];
  hourCountDept: number;
  hourCountMeet: number;
  hourCountEvent: number;
  hourCountMisc: number;
}
