<template>
  <el-tree
    :data="menus"
    :props="defaultProps"
    node-key="catId"
    ref="menuTree"
    @node-click="nodeClick">

  </el-tree>
</template>

<script>
export default {
  name: 'category',
  data () {
    return {
      menus: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      }
    }
  },

  created () {
    this.getMenus()
  },
  methods: {
    getMenus () {
      this.$http({
        url: this.$http.adornUrl('/product/category/list/tree'),
        method: 'get'
      }).then(({ data }) => {
        this.menus = data
      })
    },
    nodeClick (data, node, self) {
      console.log('子组件节点被点击', data, node, self)
      this.$emit('tree-node-click', data, node, self)
    }
  }
}
</script>

<style scoped>

</style>
