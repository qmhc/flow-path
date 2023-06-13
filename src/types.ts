export type Key = string | number
export type NodeState = 'success' | 'fail' | 'pending' | 'waiting'

export interface NodeOptions {
  id: Key,
  name: string,
  role: string,
  prevId?: Key | null,
  nextId?: Key | null,
  state?: NodeState,
  problem?: string
}

export interface FlowNode {
  id: Key,
  name: string,
  role: string,
  row: number,
  column: number,
  index: number,
  state: NodeState,
  problem: string,
  prev: FlowNode | null,
  next: FlowNode | null
}

export interface FlowLine {
  id: string,
  from: FlowNode,
  to: FlowNode
}
