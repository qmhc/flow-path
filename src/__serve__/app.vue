<template>
  <FlowPath :nodes="nodes" :role-order="roleOrder"></FlowPath>
  <FlowPath :nodes="nodes1" :role-order="roleOrder1" auto-state></FlowPath>
</template>

<script setup lang="ts">
import { FlowPath } from '..'

import type { NodeOptions } from '../types'

const nodes: NodeOptions[] = [
  { id: 1, name: '启动', role: '勘察设计院', nextId: 2, state: 'success' },
  { id: 2, name: '编制任务书', role: '勘察设计院', nextId: 3, state: 'success', problem: '逾期5天' },
  { id: 3, name: '审核任务书', role: '设计管理组', nextId: 4, state: 'success' },
  { id: 4, name: '确认任务书', role: '建设中心', nextId: 5, state: 'pending' },
  { id: 5, name: '方案', role: '勘察设计院', nextId: 6, state: 'fail' },
  { id: 6, name: '审核方案', role: '设计管理组', nextId: 7 },
  { id: 7, name: '确认方案', role: '建设中心', nextId: 8 },
  { id: 8, name: '初勘', role: '勘察设计院', nextId: 9 },
  { id: 9, name: '初步设计', role: '勘察设计院', nextId: 10 },
  { id: 10, name: '概算', role: '勘察设计院', nextId: 11 },
  { id: 11, name: '审核概算', role: '造价咨询单位', nextId: 12 },
  { id: 12, name: '专家组评审', role: '设计管理组', nextId: 13 },
  { id: 13, name: '确认概算', role: '建设中心', nextId: 14 },
  { id: 14, name: '概算报批', role: '设计管理组', nextId: 15 },
  { id: 15, name: '概算备案', role: '造价合约组' }
]

const nodes1: NodeOptions[] = [
  { id: 1, name: '编制任务书', role: '设计管理组', nextId: 2 },
  { id: 2, name: '审核任务书', role: '建设中心', nextId: 3 },
  { id: 3, name: '方案', role: '勘察设计院', nextId: 4 },
  { id: 4, name: '审核方案', role: '设计管理组', nextId: 5 },
  { id: 5, name: '委员评审', role: '建设中心一部', nextId: 6 },
  { id: 6, name: '初勘', role: '勘察设计院', nextId: 7 },
  { id: 7, name: '初步设计', role: '勘察设计院', nextId: 8 },
  { id: 8, name: '概算', role: '勘察设计院', nextId: 9 },
  { id: 9, name: '审核概算', role: '造价咨询单位', nextId: 10 },
  { id: 10, name: '专家组评审', role: '设计管理组', nextId: 11 },
  { id: 11, name: '审核概算', role: '合约造价部', nextId: 12, state: 'pending' },
  { id: 12, name: '审批初步设计', role: '建设中心', nextId: 13 },
  { id: 13, name: '概算报批', role: '设计管理组', nextId: 14 },
  { id: 14, name: '详勘', role: '勘察设计院', nextId: 15 },
  { id: 15, name: '施工图设计', role: '勘察设计院', nextId: 16 },
  { id: 16, name: '审核施工图', role: '设计管理组', nextId: 17 },
  { id: 17, name: '审批施工图', role: '建设中心', nextId: 18 },
  { id: 18, name: '施工图预算', role: '造价咨询单位', nextId: 19 },
  { id: 19, name: '审核施工图预算', role: '设计合约组', nextId: 20 },
  { id: 20, name: '审核预算', role: '合约造价部', nextId: 21 },
  { id: 21, name: '审批预算', role: '建设中心', nextId: 22 },
  { id: 22, name: '结束', role: '勘察设计院' }
]

const roleOrder = ['建设中心', '设计管理组', '造价合约组', '造价咨询单位', '勘察设计院']
// const roleOrder: string[] = []

const roleOrder1 = ['建设中心一部', '建设中心', '合约造价部', '设计管理组', '设计合约组', '造价咨询单位', '勘察设计院']
</script>
