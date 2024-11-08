<script>
export default {
  name: "HomePage",
  methods: {
    toIslandDisplayPage() {
      this.$router.push('/IslandDisplayPage');
    },
    toLandDisplayPage() {
      this.$router.push('/LandDisplayPage');
    },
    toHelloWorldPage() {
      this.$router.push('/HelloWorld');
    },
  }
}
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <h3>jl1-3d组件测试页面</h3>
      </el-header>
      <el-main style="display: flex" >
        <el-card style="max-width: 220px; margin-left: 30px" @click=toLandDisplayPage >
          <template #header>陆地3D地块</template>
          <img
              src='testPage/Land.png'
              style="width: 100%"
          />
        </el-card>
        <el-card style="max-width: 220px; margin-left: 30px" @click=toIslandDisplayPage >
          <template #header>海岛3D地块</template>
          <img
              src='testPage/Island.png'
              style="width: 100%"
          />
        </el-card>
        <el-card style="max-width: 220px; margin-left: 30px" @click=toHelloWorldPage >
          <template #header>HelloWorld</template>
          <img
              src='testPage/hello.png'
              style="width: 100%"
          />
        </el-card>
      </el-main>
      <div style="padding-left: 52px;padding-top: 55px">
        敬请期待...
      </div>
    </el-container>
  </div>
</template>

<style scoped>

</style>