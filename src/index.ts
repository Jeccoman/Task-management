import type { t } from "elysia";
import Elysia  from "elysia";

type Task = {
    id:string, 
    title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed'
  createdAt: Date
  updatedAt: Date
}

