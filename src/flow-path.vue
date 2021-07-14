<template>
  <section :class="prefix">
    <div
      v-for="(role, index) in roleList"
      :key="index"
      :class="`${prefix}__row`"
      :style="{ height: `${rowHeight}px` }"
    >
      <div :class="`${prefix}__role`" :style="{ width: `${roleWidth}px` }">
        <slot name="role" :role="role">
          {{ role }}
        </slot>
      </div>
      <div
        v-for="node in roleRecord.get(index)"
        :key="node.id"
        :ref="el => setElmentToMap(el, node.id, nodeElMap)"
        :class="[
          `${prefix}__node`,
          `${prefix}__node--${node.state}`,
          node.problem ? `${prefix}__node--warning` : null
        ]"
        :style="{
          left: `${node.column * nodeOuterWidth + nodeGap / 2 + roleWidth}px`,
          width: `${nodeWidth}px`
        }"
        @click="$emit('on-node-click', node)"
      >
        <slot name="node" :node="node">
          <div :class="`${prefix}__content`">
            <div :class="`${prefix}__lebal`">
              {{ node.name }}
            </div>
            <div :class="`${prefix}__index`">
              {{ node.index }}
            </div>
          </div>
        </slot>
      </div>
    </div>
    <template v-for="line in lineList" :key="line.id">
      <div
        v-if="line.from.column !== line.to.column"
        :ref="el => setElmentToMap(el, `${line.id}-l`, lineElMap)"
        :class="[
          `${prefix}__line`,
          `${prefix}__line--horizontal`,
          `${prefix}__line--${getLineState(line)}`
        ]"
        :style="{
          top: `${(line.from.row + 0.5) * rowHeight}px`,
          left: `${(line.from.column + 0.5) * nodeOuterWidth + roleWidth}px`,
          width: `${(line.to.column - line.from.column) * nodeOuterWidth}px`
        }"
      ></div>
      <div
        v-if="line.from.row !== line.to.row"
        :ref="el => setElmentToMap(el, `${line.id}-v`, lineElMap)"
        :class="[
          `${prefix}__line`,
          `${prefix}__line--vertical`,
          `${prefix}__line--${getLineState(line)}`
        ]"
        :style="{
          top: `${(Math.min(line.from.row, line.to.row) + 0.5) * rowHeight}px`,
          left: `${(line.to.column + 0.5) * nodeOuterWidth + roleWidth}px`,
          height: `${Math.abs(line.from.row - line.to.row) * rowHeight + 0.5}px`
        }"
      ></div>
      <div
        :ref="el => setElmentToMap(el, line.id, arrowElMap)"
        :class="[
          `${prefix}__arrow`,
          `${prefix}__arrow--${getLineState(line)}`,
          line.from.row === line.to.row ? `${prefix}__arrow--horizontal` : null,
          line.from.row < line.to.row ? `${prefix}__arrow--reverse` : null
        ]"
        :style="{
          top: `${(line.to.row + 0.5) * rowHeight}px`,
          left: `${(line.to.column + 0.5) * nodeOuterWidth + roleWidth}px`
        }"
      ></div>
    </template>
  </section>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  watchEffect,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  nextTick
} from 'vue'

import type { PropType } from 'vue'
import type { Key, NodeState, NodeOptions, FlowNode, FlowLine } from './types'

const nodeStates: NodeState[] = ['success', 'fail', 'pending', 'waiting']

export default defineComponent({
  name: 'FlowMap',
  props: {
    nodes: {
      type: Array as PropType<NodeOptions[]>,
      default: () => []
    },
    roleOrder: {
      type: [Array, Function] as PropType<string[] | ((prev: string, next: string) => number)>,
      default: () => []
    },
    rowHeight: {
      type: Number,
      default: 100
    },
    nodeWidth: {
      type: Number,
      default: 120
    },
    nodeGap: {
      type: Number,
      default: 30
    },
    roleWidth: {
      type: Number,
      default: 72
    },
    autoState: {
      type: Boolean,
      default: false
    }
  },
  emits: ['on-node-click'],
  setup(props) {
    const prefix = 'flow-path'

    const roleList = ref<string[]>(null!)
    const lineList = ref<FlowLine[]>(null!)
    const roleRecord = ref(new Map<number, FlowNode[]>())

    const nodeOuterWidth = computed(() => {
      return props.nodeWidth + props.nodeGap
    })

    let nodeMap: Map<Key, NodeOptions> = null!
    let entryNode: FlowNode = null!

    watchEffect(() => {
      let entryOptions: NodeOptions = null!

      nodeMap = new Map()
      roleRecord.value.clear()
      lineList.value = []

      const roleSet = new Set<string>()

      props.nodes.forEach(node => {
        const copyNode = { ...node }

        nodeMap.set(node.id, copyNode)
        roleSet.add(node.role)
      })

      const nodeList = Array.from(nodeMap.values())

      nodeList.forEach(node => {
        if (node.nextId) {
          const next = nodeMap.get(node.nextId)

          if (next) {
            next.prevId = node.id
          }
        }

        if (node.prevId) {
          const prev = nodeMap.get(node.prevId)

          if (prev) {
            prev.nextId = node.id
          }
        }
      })

      entryOptions = nodeList.find(node => !node.prevId)!

      if (!entryOptions) {
        throw new Error('[flow-line] Losing entry node.')
      }

      roleList.value = Array.from(roleSet)

      if (typeof props.roleOrder === 'function') {
        roleList.value.sort(props.roleOrder)
      } else if (Array.isArray(props.roleOrder) && props.roleOrder.length) {
        const orderMap = props.roleOrder.reduce(
          (map, role, index) => map.set(role, index),
          new Map<string, number>()
        )

        roleList.value.sort((prev, next) => {
          if (orderMap.has(prev) && orderMap.has(next)) {
            return orderMap.get(prev)! - orderMap.get(next)!
          }

          return 0
        })
      }

      for (let i = 0, len = roleList.value.length; i < len; i++) {
        roleRecord.value.set(i, [])
      }

      entryNode = createLinkedNode(entryOptions)
      refreshNodesIndex()

      if (props.autoState) {
        let node: FlowNode | null = entryNode

        while (node) {
          const next: FlowNode | null = node.next

          if (next) {
            if (next.state !== 'fail') {
              node.state = 'success'

              if (next.state === 'pending') break
            } else {
              node.state = 'pending'
              break
            }
          }
          
          node = next
        }
      }
    })

    function createNode(options: NodeOptions): FlowNode {
      const row = roleList.value.findIndex(role => role === options.role)

      return {
        id: options.id,
        name: options.name,
        role: options.role,
        row,
        column: 0,
        index: 0,
        state: options.state && nodeStates.includes(options.state) ? options.state : 'waiting',
        problem: options.problem ?? '',
        prev: null,
        next: null
      }
    }

    function createLinkedNode(options: NodeOptions, prev?: FlowNode | null) {
      const node = createNode(options)

      if (prev) {
        node.prev = prev
        prev.next = node

        if (node.row === prev.row) {
          node.column = prev.column + 1
        } else {
          const start = prev.row < node.row ? prev.row + 1 : node.row
          const length = Math.abs(node.row - prev.row)

          // if (node.name === '审核方案') debugger

          for (let i = 0; i < length; i++) {
            const row = roleRecord.value.get(i + start)!
            const last = row[row.length - 1]

            if (last && last.column === prev.column) {
              node.column = prev.column + 1
              break
            }
          }

          if (node.column === 0) {
            node.column = prev.column
          }
        }

        const line: FlowLine = { id: `${prev.id}-${node.id}`, from: prev, to: node }

        while (hasInverseCrossLine(line)) {
          node.column += 1
        }

        lineList.value.push(line)
      }

      roleRecord.value.get(node.row)!.push(node)

      if (options.nextId) {
        const nextOptions = nodeMap.get(options.nextId)

        if (nextOptions) {
          createLinkedNode(nextOptions, node)
        }
      }

      return node
    }

    function hasInverseCrossLine(line: FlowLine) {
      if (line.from.row === line.to.row) return false

      const column = line.to.column
      const min = Math.min(line.from.row, line.to.row)
      const max = Math.max(line.from.row, line.to.row)

      const isDown = line.from.row < line.to.row

      return !!lineList.value.find(existsLine => {
        if (existsLine.to.column === column) {
          const from = existsLine.from.row
          const to = existsLine.to.row

          if (from !== to && from < to !== isDown) {
            return !(Math.min(from, to) >= max || Math.max(from, to) <= min)
          }
        }

        return false
      })
    }

    function refreshNodesIndex() {
      let node: FlowNode | null = entryNode

      while (node) {
        node.index = (node.prev?.index ?? 0) + 1
        node = node.next
      }
    }

    const nodeElMap = ref(new Map<Key, HTMLElement>())
    const lineElMap = ref(new Map<string, HTMLElement>())
    const arrowElMap = ref(new Map<string, HTMLElement>())

    onMounted(() => nextTick(fixLinePosition))

    onBeforeUpdate(() => {
      nodeElMap.value.clear()
      lineElMap.value.clear()
      arrowElMap.value.clear()
    })

    onUpdated(() => nextTick(fixLinePosition))

    function fixLinePosition() {
      const rectMap = new Map<Key, DOMRect>()
      const lineMap = new Map<Key, FlowLine>()

      nodeElMap.value.forEach((el, id) => {
        rectMap.set(id, el.getBoundingClientRect())
      })

      lineList.value.forEach(line => {
        lineMap.set(line.id, line)
      })

      lineElMap.value.forEach((el, id) => {
        const line = lineMap.get(id.slice(0, -2))

        if (!line) return

        const { from, to } = line
        const fromRect = rectMap.get(line.from.id)
        const toRect = rectMap.get(line.to.id)

        if (id.endsWith('-l') && from.column !== to.column) {
          let left = parseFloat(el.style.left)
          let width = parseFloat(el.style.width)

          if (fromRect) {
            left += fromRect.width / 2
            width -= fromRect.width / 2
          }

          if (from.row === to.row && toRect) {
            width -= toRect.width / 2
          }

          el.style.left = `${left}px`
          el.style.width = `${width}px`
        } else if (id.endsWith('-v') && from.row !== to.row) {
          let top = parseFloat(el.style.top)
          let height = parseFloat(el.style.height)

          if (fromRect) {
            if (from.column === to.column) {
              top += fromRect.height / 2
              height -= fromRect.height / 2

              if (from.row > to.row) {
                top -= fromRect.height / 2
              }
            }
          }

          // if (to.name === '审核施工图预算') debugger
          if (toRect) {
            if (from.row > to.row) {
              top += toRect.height / 2
            }

            height -= toRect.height / 2
          }

          el.style.top = `${top}px`
          el.style.height = `${height}px`
        }
      })

      arrowElMap.value.forEach((el, id) => {
        const line = lineMap.get(id)

        if (!line) return

        const { from, to } = line
        const toRect = rectMap.get(line.to.id)

        if (!toRect) return

        if (from.row === to.row) {
          el.style.left = `${parseFloat(el.style.left) - toRect.width / 2}px`
        } else {
          const top = parseFloat(el.style.top)

          if (from.row < to.row) {
            el.style.top = `${top - toRect.height / 2}px`
          } else {
            el.style.top = `${top + toRect.height / 2}px`
          }
        }
      })
    }

    function getLineState(line: FlowLine) {
      const toState = line.to.state

      return toState === 'fail'
        ? 'fail'
        : toState === 'pending'
        ? 'pending'
        : toState !== 'waiting'
        ? 'success'
        : 'waiting'
    }

    function setElmentToMap<T extends Key>(el: any, key: T, map: Map<T, HTMLElement>) {
      if (el) {
        map.set(key, el)
      }
    }

    return {
      prefix,
      roleList,
      lineList,
      roleRecord,
      nodeOuterWidth,
      nodeElMap,
      lineElMap,
      arrowElMap,

      getLineState,
      setElmentToMap
    }
  }
})
</script>
