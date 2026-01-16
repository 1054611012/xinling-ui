<template>
  <div class="input-container">
    <div class="input-wrapper">
      <el-input
        type="textarea"
        v-model="localInputValue"
        :placeholder="placeholder"
        :rows="3"
        :disabled="disabled"
        @keydown.native="handleKeyDown"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="handleInput"
        class="message-input"
      ></el-input>
      <div class="input-actions-overlay">
        <div class="model-selector-container">
          <el-select
            v-model="localSelectedModel"
            placeholder="选择模型"
            size="small"
            class="input-model-selector"
            :loading="loading"
            @visible-change="handleModelSelectVisible"
            @change="handleModelChange"
          >
            <el-option
              v-for="model in modelList"
              :key="model.model"
              :label="model.model"
              :value="model.model">
            </el-option>
          </el-select>
        </div>
        <el-button
          type="primary"
          @click="sendMessage"
          :loading="isLoading"
          :disabled="!canSend"
          size="small"
          class="send-btn"
          v-if="!isLoading"
        >
          <i class="el-icon-position"></i>
        </el-button>
        <!-- 中断按钮 -->
        <el-button
          type="danger"
          @click="stopRequest"
          size="small"
          class="stop-btn"
          v-if="isLoading"
          :title="'中断当前请求 (Ctrl+Shift+C)'"
        >
          <i class="el-icon-video-pause"></i>
        </el-button>
      </div>
    </div>
    <div class="input-hint" v-show="!isFocused">Enter发送 · Shift+Enter换行</div>
  </div>
</template>

<script>
export default {
  name: 'ChatInput',
  props: {
    inputValue: {
      type: String,
      default: ''
    },
    selectedModel: {
      type: String,
      default: ''
    },
    modelList: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: '发送消息和AI聊聊吧～'
    }
  },
  data() {
    return {
      isFocused: false,
      localInputValue: this.inputValue,
        localSelectedModel: this.selectedModel
    }
  },
  computed: {
    canSend() {
      return this.localInputValue.trim() && !this.isLoading && this.localSelectedModel;
    }
  },
  watch: {
    inputValue(newVal) {
      this.localInputValue = newVal;
    },
    selectedModel(newVal) {
      this.localSelectedModel = newVal;
    }
  },
  methods: {
    handleKeyDown(event) {
      this.$emit('keydown', event);
    },
    handleFocus() {
      this.isFocused = true;
      this.$emit('focus');
    },
    handleBlur() {
      this.isFocused = false;
      this.$emit('blur');
    },
    sendMessage() {
      if (this.canSend) {
        this.$emit('send');
      }
    },
    stopRequest() {
      this.$emit('stop');
    },
    handleInput() {
      this.$emit('input', this.localInputValue);
    },
    handleModelChange(value) {
      this.$emit('update:selectedModel', value);
      // 同时更新本地值
      this.localSelectedModel = value;
    },
    handleModelSelectVisible(visible) {
      this.$emit('model-select-visible', visible);
    }
  }
}
</script>

<style scoped>
.input-container {
  padding: 16px 24px 24px 24px;
  background: #ffffff;
  border-top: none;
  position: relative;
}

.input-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-input ::v-deep .el-textarea__inner {
  background: #f7f7f7;
  color: #1a1a1a;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  padding: 16px 20px;
  font-size: 14px;
  line-height: 1.6;
  min-height: 50px;
  max-height: 150px;
  resize: none;
  transition: all 0.2s ease;
}

.message-input ::v-deep .el-textarea__inner::placeholder {
  color: #c7c7cc;
}

.message-input ::v-deep .el-textarea__inner:focus {
  outline: none;
  border-color: rgba(0, 0, 0, 0.15);
  background: #f7f7f7;
  box-shadow: none;
}

.input-actions-overlay {
  position: absolute;
  right: 16px;
  bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 10;
}

.model-selector-container {
  max-width: 180px;
}

.model-selector-container ::v-deep .el-select .el-input__inner {
  background: transparent;
  color: #1a1a1a;
  border: none;
  border-radius: 8px;
  height: 36px;
  line-height: 36px;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.model-selector-container ::v-deep .el-select .el-input__inner:focus {
  border: none;
}

.model-selector-container ::v-deep .el-select .el-input__icon {
  color: #1a1a1a;
}

.send-btn {
  background: #ececec;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  color: #1a1a1a;
  font-size: 18px;
  transition: all 0.2s ease;
}

.send-btn i {
  transform: rotate(45deg);
}

.send-btn:hover {
  background: #e0e0e0;
  transform: none;
  box-shadow: none;
}

.send-btn:active {
  transform: translateY(0);
}

.send-btn[disabled] {
  background: #f7f7f7;
  color: #c7c7cc;
  cursor: not-allowed;
}

.send-btn[disabled]:hover {
  background: #f7f7f7;
  transform: none;
  box-shadow: none;
}

.stop-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  color: #ffffff;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  padding: 0;
}

.stop-btn:hover {
  background: linear-gradient(135deg, #ff5252 0%, #e74c3c 100%);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.5);
  transform: scale(1.1);
}

.stop-btn:active {
  transform: scale(0.95);
}

/* 中断按钮样式  调整中间的大小 */
.stop-btn i {
  font-size: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-hint {
  position: absolute;
  right: 16px;
  top: -28px;
  font-size: 12px;
  color: #c7c7cc;
  background: #ffffff;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
  display: none;
}

.input-container:hover .input-hint {
  opacity: 1;
}

/* 深色模式样式 */
.dark-theme .input-container {
  padding: 20px;
  background: #1a1a1a;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.dark-theme .message-input ::v-deep .el-textarea__inner {
  background: #252525;
  color: #e0e0e0;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 16px 20px;
  min-height: 50px;
  max-height: 150px;
}

.dark-theme .message-input ::v-deep .el-textarea__inner::placeholder {
  color: #666666;
}

.dark-theme .message-input ::v-deep .el-textarea__inner:focus {
  border-color: rgba(100, 181, 246, 0.3);
  background: #2a2a2a;
  box-shadow: none;
}

.dark-theme .model-selector-container ::v-deep .el-select .el-input__inner {
  background: #1a1a1a;
  color: #e0e0e0;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  font-weight: normal;
}

.dark-theme .model-selector-container ::v-deep .el-select .el-input__inner:focus {
  border-color: rgba(100, 181, 246, 0.5);
}

.dark-theme .model-selector-container ::v-deep .el-select .el-input__icon {
  color: #666666;
}

.dark-theme .send-btn {
  background: #2a2a2a;
  color: #64b5f6;
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.dark-theme .send-btn:hover {
  background: #333333;
  transform: none;
  box-shadow: none;
}

.dark-theme .send-btn[disabled] {
  background: #1e1e1e;
  color: #4a4a4a;
}

.dark-theme .send-btn[disabled]:hover {
  background: #1e1e1e;
  transform: none;
  box-shadow: none;
}

.dark-theme .input-hint {
  color: #666666;
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: block;
}
</style>