<template>
  <teleport to="body">
    <div class="choose-sheet-modal" v-if="visible">
      <div class="content">
        <div class="head">
          <slot name="head">
            <div>{{ title }}</div>
          </slot>
        </div>
        <div class="body">
          <!-- <input type="text" list="sheetData" id="sheet" />
          <datalist id="sheetData">
            <option value="22">11</option>
          </datalist> -->
          <slot name="body"></slot>
        </div>
        <div class="bottom">
          <span class="btn" @click="dealConfirm">确定</span
          ><span class="btn" @click="dealClose">关闭</span>
        </div>
      </div>
    </div>
  </teleport>
</template>
<script lang="js">
import { defineComponent, onMounted } from 'vue'
export default defineComponent({
    name: '',
    emits: ['update:visible', 'confirm'],
    props: [
        'title',
        'handleConfirm',
        'handleClose',
        'visible'
    ],
    setup(props, context) {
        console.log(props)
        /**
         * @type HTMLElement
         */
        // const el = ref()
        onMounted(() => {
            // el.value = document.querySelector(`#${id}`)
        })
        function closeModal() {
            // el.style.display = 'none'
            context.emit('update:visible', false)
        }
        function dealClose() {
           context.emit('close')
            props.handleClose?.()
            closeModal()
        }
        function dealConfirm() {
            context.emit('confirm')
            props.handleConfirm?.()
            closeModal()
        }
        return {
            dealClose,
            dealConfirm
        }
    }
})
</script>
<style lang="scss">
.choose-sheet-modal {
  position: absolute;
  top: 0;
  left: 0;
  background: transparent;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;

  .content {
    display: flex;
    flex-direction: column;
    height: 200px;
    margin-top: 5%;
    padding: 12px;
    box-shadow: 0px 0px 4px 2px grey;
    .head {
    }
    .body {
      flex: 1;
      min-width: 200px;
    }

    .bottom {
      // position: ;
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      span.btn {
        padding: 2px 8px;
        border: 1px solid #b9a8a8;
        border-radius: 4px;
        cursor: pointer;
      }
      .btn:hover {
        color: #fff;
        background: #19b5f0;
      }
    }
  }
}
</style>
