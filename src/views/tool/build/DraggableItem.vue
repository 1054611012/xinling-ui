<script>
import { h, resolveComponent } from 'vue'
import draggable from 'vuedraggable'
import RenderComponent from '@/utils/generator/render'
import { CopyDocument, Delete } from '@element-plus/icons-vue'

export default {
  name: 'DraggableItem',
  components: { RenderComponent, draggable },
  props: [
    'element',
    'index',
    'drawingList',
    'activeId',
    'formConf'
  ],
  emits: ['copyItem', 'deleteItem', 'activeItem'],
  render() {
    const h = this.$createElement
    const { element, index } = this

    const components = {
      itemBtns: (h, element, index) => [
        h('span', {
          class: 'drawing-item-copy',
          title: '复制',
          onClick: event => {
            this.$emit('copyItem', element, this.drawingList)
            event.stopPropagation()
          }
        }, [
          h(resolveComponent('el-icon'), null, () => h(CopyDocument))
        ]),
        h('span', {
          class: 'drawing-item-delete',
          title: '删除',
          onClick: event => {
            this.$emit('deleteItem', index, this.drawingList)
            event.stopPropagation()
          }
        }, [
          h(resolveComponent('el-icon'), null, () => h(Delete))
        ])
      ]
    }

    const layouts = {
      colFormItem: (h, element, index) => {
        let className = this.activeId === element.formId ? 'drawing-item active-from-item' : 'drawing-item'
        if (this.formConf?.unFocusedComponentBorder) className += ' unfocus-bordered'
        return h(resolveComponent('el-col'), {
          span: element.span,
          class: className,
          onClick: event => { this.$emit('activeItem', element); event.stopPropagation() }
        }, () => [
          h(resolveComponent('el-form-item'), {
            'label-width': element.labelWidth ? `${element.labelWidth}px` : null,
            label: element.label,
            required: element.required
          }, () => [
            h(RenderComponent, {
              key: element.renderKey,
              conf: element,
              onInput: event => { element.defaultValue = event }
            })
          ]),
          ...components.itemBtns(h, element, index)
        ])
      },
      rowFormItem: (h, element, index) => {
        const className = this.activeId === element.formId ? 'drawing-row-item active-from-item' : 'drawing-row-item'
        let child = renderChildren.call(this, h, element, index)
        if (element.type === 'flex') {
          child = h(resolveComponent('el-row'), {
            type: element.type,
            justify: element.justify,
            align: element.align
          }, () => child)
        }
        return h(resolveComponent('el-col'), {
          span: element.span
        }, () => [
          h(resolveComponent('el-row'), {
            gutter: element.gutter,
            class: className,
            onClick: event => { this.$emit('activeItem', element); event.stopPropagation() }
          }, () => [
            h('span', { class: 'component-name' }, () => element.componentName),
            h(draggable, {
              list: element.children,
              animation: 340,
              group: 'componentsGroup',
              class: 'drag-wrapper',
              itemKey: 'renderKey'
            }, { item: ({ element: el, index: i }) => {
              const layout = layouts[el.layout]
              if (layout) {
                return layout(h, el, i)
              }
              return layoutIsNotFound.call(this)
            }}),
            ...components.itemBtns(h, element, index)
          ])
        ])
      }
    }

    function renderChildren(h, element) {
      if (!Array.isArray(element.children)) return null
      return element.children.map((el, i) => {
        const layout = layouts[el.layout]
        if (layout) {
          return layout(h, el, i)
        }
        return layoutIsNotFound.call(this)
      })
    }

    function layoutIsNotFound() {
      throw new Error(`没有与${this.element.layout}匹配的layout`)
    }

    const layout = layouts[element.layout]
    if (layout) {
      return layout(h, element, index)
    }
    return layoutIsNotFound.call(this)
  }
}
</script>