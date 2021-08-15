<template>
  <div>
    <el-switch
      style="padding: 20px"
      v-model="draggable"
      active-text="开启拖拽">
    </el-switch>
    <el-button v-if="draggable" @click="batchSave">
      批量保存
    </el-button>
    <el-button type="danger" @click="batchDelete">批量删除</el-button>
    <el-tree
      :draggable="draggable"
      :data="menus"
      :props="defaultProps"
      show-checkbox
      node-key="catId"
      :default-expanded-keys="expandedKey"
      :expand-on-click-node="false"
      :allow-drop="allowDrop"
      @node-drop = "handleDrop"
      ref="menuTree"
    >
      <span class="custom-tree-node" slot-scope="{ node, data }">
        <span>{{ node.label }}</span>
        <span>
          <el-button
            v-if="node.level <= 2"
            type="text"
            size="mini"
            @click="() => append(data)"
          >
            Append
          </el-button>
          <el-button
            v-if="node.level <= 2"
            type="text"
            size="mini"
            @click="() => edit(data)"
          >
            Edit
          </el-button>
          <el-button
            v-if="node.childNodes.length === 0"
            type="text"
            size="mini"
            @click="() => remove(node, data)"
          >
            Delete
          </el-button>
        </span>
      </span>
    </el-tree>
    <el-dialog
      :title="title"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      width="30%"
    >
      <el-form :model="category">
        <el-form-item label="活动名称">
          <el-input v-model="category.name"></el-input>
        </el-form-item>
        <el-form-item label="计量单位">
          <el-input v-model="category.productUnit"></el-input>
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="category.icon"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitData">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// 这里可以导入其他文件（比如：组件，工具 js，第三方插件 js，json 文件，图片文件等等）
// 例如：import 《组件名称》 from '《组件路径》';

export default {
  // import 引入的组件需要注入到对象中才能使用
  components: {},
  props: {},
  data () {
    // 这里存放数据
    return {
      pCid: [],
      draggable: false,
      updateNodes: [],
      maxLevel: 0,
      productUnit: '',
      icon: '',
      title: '',
      dialogType: '',
      category: {
        name: '',
        parentCid: 0,
        catLevel: 0,
        showStatus: 1,
        sort: 0,
        catId: 0,
        productUnit: '',
        icon: ''
      },
      dialogVisible: false,
      expandedKey: [],
      menus: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      }
    }
  },
  // 计算属性 类似于 data 概念
  computed: {},
  // 监控 data 中的数据变化
  watch: {},
  // 方法集合
  methods: {
    batchDelete () {
      let checkedNodes = this.$refs.menuTree.getCheckedNodes()
      let catIds = []
      for (let i = 0; i < checkedNodes.length; i++) {
        catIds.push(checkedNodes[i].catId)
      }

      this.$confirm(`是否批量删除${catIds}?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http({
          url: this.$http.adornUrl('/product/category/delete'),
          method: 'post',
          data: this.$http.adornData(catIds, false)
        }).then(({ data }) => {
          this.$message({
            message: '保存成功！',
            type: 'success'
          })
          this.dialogVisible = false
          this.getMenus()
          debugger
          this.expandedKey = [this.category.parentCid]
        })
      }).catch(() => {

      })
    },

    batchSave () {
      this.$http({
        url: this.$http.adornUrl('/product/category/update/sort'),
        method: 'post',
        data: this.$http.adornData(this.updateNodes, false)
      }).then(({ data }) => {
        this.$message({
          message: '更新成功！',
          type: 'success'
        })
      })

      this.dialogVisible = false
      this.getMenus()
      this.expandedKey = this.pCid
      this.updateNodes = []
      this.maxLevel = 0
      // this.pCid = []
    },
    handleDrop (draggingNode, dropNode, dropType, ev) {
      console.log('tree drop: ', dropNode.label, dropType)
      // 当前节点的最新父节点
      let siblings = null
      let pCid = 0
      if (dropType === 'before' || dropType === 'after') {
        pCid = dropNode.parent.data.catId === undefined ? 0 : dropNode.parent.data.catId
        siblings = dropNode.parent.childNodes
      } else {
        pCid = dropNode.data.catId
        siblings = dropNode.childNodes
      }

      this.pCid.push(pCid)

      // 当前拖拽节点的最新顺序
      for (let i = 0; i < siblings.length; i++) {
        // 如果遍历的是正在拖拽的节点
        if (siblings[i].data.catId === draggingNode.data.catId) {
          let catLevel = draggingNode.data.catLevel
          if (siblings[i].level !== draggingNode.level) {
            // 当前节点的层级已经发生变化
            catLevel = siblings[i].level
            // 修改子节点的层级
            this.updateChildNodeLevel(siblings[i])
          }
          this.updateNodes.push({catId: siblings[i].data.catId, sort: i, parentCid: this.pCid, catLevel: catLevel})
        } else {
          this.updateNodes.push({catId: siblings[i].data.catId, sort: i})
        }
      }
      // 当前最新拖拽节点的层级
      console.log(this.updateNodes)
    },

    updateChildNodeLevel (node) {
      console.log(node)
      if (node.childNodes.length > 0) {
        for (let i = 0; i < node.childNodes.length; i++) {
          var cNode = node.childNodes[i].data
          this.updateNodes.push({catId: cNode.catId, catLevel: node.childNodes[i].level})
          this.updateChildNodeLevel(node.childNodes[i])
        }
      }
    },

    allowDrop (draggingNode, dropNode, type) {
      // 1.被拖动的节点以及所在的父节点的总层数不能大于3
      this.countNodeLevel(draggingNode)
      // 拖动节点 需要将节点在当前树中的level进行变更 而不是数据库中 因为数据可能没有更新。
      let deep = Math.abs(this.maxLevel) - draggingNode.level + 1

      if (type === 'inner') {
        return (deep + dropNode.level) <= 3
      } else {
        return (deep + dropNode.parent.level) <= 3
      }
    },

    countNodeLevel (node) {
      // 找到所有子节点, 求出最大深度
      if (node.childNodes != null && node.childNodes.length > 0) {
        for (let i = 0; i < node.childNodes.length; i++) {
          if (node.childNodes[i].catLevel > this.maxLevel) {
            this.maxLevel = node.childNodes[i].catLevel
          }
          this.countNodeLevel(node.childNodes[i])
        }
      }
    },

    edit (data) {
      console.log(data)
      this.title = '修改分类'
      this.dialogType = 'edit'
      this.dialogVisible = true
      // 发送请求获取当前节点最新的数据
      this.$http({
        url: this.$http.adornUrl(`/product/category/info/${data.catId}`),
        method: 'get',
        data: this.$http.adornData(this.category, false)
      }).then(({ data }) => {
        this.category.name = data.category.name
        this.category.catId = data.category.catId
        this.category.icon = data.category.icon
        this.category.productUnit = data.category.productUnit
        this.category.parentCid = data.category.parentCid
        this.category.catLevel = data.category.catLevel
        this.category.sort = data.category.sort
        this.category.showStatus = data.category.showStatus
      })
    },

    addCategory () {
      this.dialogVisible = false

      this.$http({
        url: this.$http.adornUrl('/product/category/save'),
        method: 'post',
        data: this.$http.adornData(this.category, false)
      }).then(({ data }) => {
        this.$message({
          message: '保存成功！',
          type: 'success'
        })
        this.dialogVisible = false
        this.getMenus()
        this.expandedKey = [this.category.parentCid]
      })
    },

    getMenus () {
      this.$http({
        url: this.$http.adornUrl('/product/category/list/tree'),
        method: 'get'
      }).then(({ data }) => {
        this.menus = data
      })
    },

    append (data) {
      this.dialogType = 'add'
      this.dialogVisible = true
      this.title = '添加分类'
      this.category.parentCid = data.catId
      this.category.catLevel = data.catLevel * 1 + 1

      this.category.name = ''
      this.category.catId = null
      this.category.icon = ''
      this.category.productUnit = ''
      this.category.sort = 0
      this.category.showStatus = 1
    },

    remove (node, data) {
      var ids = [data.catId]
      this.$confirm(`是否删除${data.name}?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http({
          url: this.$http.adornUrl('/product/category/delete'),
          method: 'post',
          data: this.$http.adornData(ids, false)
        }).then(({ data }) => {
          this.$message({
            message: '删除成功！',
            type: 'success'
          })
          this.getMenus()
          this.expandedKey = [node.parent.data.catId]
        })
      }).catch(() => { })
    },

    submitData () {
      if (this.dialogType === 'add') {
        this.addCategory()
      }

      if (this.dialogType === 'edit') {
        this.editCategory()
      }
    },

    editCategory () {
      var { catId, name, icon, productUnit } = this.category
      var data = { catId, name, icon, productUnit }

      this.$http({
        url: this.$http.adornUrl('/product/category/update'),
        method: 'post',
        data: this.$http.adornData(data, false)
      }).then(({ data }) => {
        this.$message({
          message: '修改成功！',
          type: 'success'
        })
        this.dialogVisible = false
        this.getMenus()
        this.expandedKey = [this.category.parentCid]
      })
    }

  },
  // 生命周期 - 创建完成（可以访问当前 this 实例）
  created () {
    this.getMenus()
  },
  // 生命周期 - 挂载完成（可以访问 DOM 元素）
  mounted () {

  },
  beforeCreate () {
  }, // 生命周期 - 创建之前
  beforeMount () {
  }, // 生命周期 - 挂载之前
  beforeUpdate () {
  }, // 生命周期 - 更新之前
  updated () {
  }, // 生命周期 - 更新之后
  beforeDestroy () {
  }, // 生命周期 - 销毁之前
  destroyed () {
  }, // 生命周期 - 销毁完成
  activated () {
  } // 如果页面有 keep-alive 缓存功能，这个函数会触发
}
</script>
<style lang='scss' scoped>
//@import url(); 引入公共 css 类
</style>
