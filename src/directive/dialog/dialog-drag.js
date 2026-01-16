// 自定义指令：使 el-dialog 可拖动且可改变大小
import Vue from 'vue'

Vue.directive('dialog-drag', {
  bind(el) {
    const dialogHeaderEl = el.querySelector('.el-dialog__header');
    const dragDom = el.querySelector('.el-dialog');
    dialogHeaderEl.style.cursor = 'move';

    // 拖动逻辑
    dialogHeaderEl.onmousedown = (e) => {
      const disX = e.clientX - dialogHeaderEl.offsetLeft;
      const disY = e.clientY - dialogHeaderEl.offsetTop;
      let styL = parseFloat(window.getComputedStyle(dragDom).left);
      let styT = parseFloat(window.getComputedStyle(dragDom).top);
      document.onmousemove = function (e) {
        dragDom.style.left = e.clientX - disX + styL + 'px';
        dragDom.style.top = e.clientY - disY + styT + 'px';
      };
      document.onmouseup = function () {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };

    // 改变大小逻辑（支持按Shift等比缩放）
    const resizeEl = document.createElement('div');
    resizeEl.style.width = '10px';
    resizeEl.style.height = '10px';
    resizeEl.style.background = 'transparent';
    resizeEl.style.position = 'absolute';
    resizeEl.style.right = '0';
    resizeEl.style.bottom = '0';
    resizeEl.style.cursor = 'se-resize';
    dragDom.appendChild(resizeEl);

    resizeEl.onmousedown = (e) => {
      e.stopPropagation();
      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = dragDom.offsetWidth;
      const startHeight = dragDom.offsetHeight;
      const aspectRatio = startWidth / startHeight;

      document.onmousemove = function (e) {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        let newWidth = startWidth + deltaX;
        let newHeight = startHeight + deltaY;

        // 按住 Shift 时启用等比缩放
        if (e.shiftKey) {
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            newWidth = startWidth + deltaX;
            newHeight = newWidth / aspectRatio;
          } else {
            newHeight = startHeight + deltaY;
            newWidth = newHeight * aspectRatio;
          }
        }

        dragDom.style.width = newWidth + 'px';
        dragDom.style.height = newHeight + 'px';
      };

      document.onmouseup = function () {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };
  }
});
