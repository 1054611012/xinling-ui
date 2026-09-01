import hasRole from './permission/hasRole'
import hasPermi from './permission/hasPermi'
import dialogDrag from './dialog/drag'
import clipboard from './module/clipboard'

const install = function(app) {
  app.directive('hasRole', hasRole)
  app.directive('hasPermi', hasPermi)
  app.directive('clipboard', clipboard)
  // 注册为 dialogDrag，模板中 v-dialog-drag / v-dialogDrag 均可命中
  app.directive('dialogDrag', dialogDrag)
}

export default install
