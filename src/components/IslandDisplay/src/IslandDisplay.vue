<template>
  <div id="canvas-container"></div>
</template>

<script>

import * as THREE from "three";
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {Water} from "three/examples/jsm/objects/Water.js";
import {Sky} from "three/examples/jsm/objects/Sky.js";
import {GUI} from 'three/examples/jsm/libs/lil-gui.module.min.js';
import * as GeoTIFF from 'geotiff';

export default {
  name: 'IslandDisplay',
  props: {
    // 入参prop
    topTextureUrlProp: String,
    demTifUrlProp: String,

    heightOffsetProp: Number,
    scaleFactorProp: Number,
    positionYProp: Number,
  },
  data() {
    return {}
  },
  methods: {
    async createFunction() {
      // 工程中的常量
      const width = window.innerWidth;
      const height = window.innerHeight;

      // 海岛地块的parameter
      const parameter = {
        // 高度偏移
        heightOffset: this.heightOffsetProp,
        // 缩放因子
        scaleFactor: this.scaleFactorProp,
        // 起始地块默认高度
        positionY: this.positionYProp,
      }

      // 顶层图片地址
      const topTextureUrl = 'IslandDisplayTexture/images/yongxing.jpg';

      // 高程tif地址
      const demTifUrl = 'IslandDisplayTexture/images/dao.tif';

      // 底层材质列表
      const bottomTextureList = [
        'IslandDisplayTexture/images/side-texture.jpg',
        'IslandDisplayTexture/images/side-texture2.jpeg'
      ];

      // 侧面材质列表
      const sideTextureList = [
        'IslandDisplayTexture/images/side-texture3.jpg',
        'IslandDisplayTexture/images/side-texture4.jpeg',
      ]

      // ***************************************************************************//
      // 创建场景
      const scene = new THREE.Scene();

      // 海水
      const water = new Water(new THREE.PlaneGeometry(1000000, 1000000), {
        textureWidth: 1000,
        textureHeight: 1000,
        waterNormals: new THREE.TextureLoader().load(
            "IslandDisplayTexture/water/waternormals.jpg",
            (texture) => {
              texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }
        ),
        waterColor: 0x0072ff,
        sunColor: 0xffffff,
        fog: scene.fog !== undefined
      });
      water.material.uniforms["alpha"].value = 2;
      water.material.uniforms["distortionScale"].value = 100;
      water.rotation.x = -Math.PI / 2;
      scene.add(water);

      // 天空太阳
      const sky = new Sky();
      const sun = new THREE.Vector3(-80, 5, -100);
      sky.scale.setScalar(10000);
      sky.material.uniforms["sunPosition"].value.copy(sun).normalize();
      water.material.uniforms['sunDirection'].value.copy(sun).normalize();
      sky.material.uniforms["turbidity"].value = 1;
      sky.material.uniforms["rayleigh"].value = 1.5;
      sky.material.uniforms["mieCoefficient"].value = 0.005;
      sky.material.uniforms["mieDirectionalG"].value = 0.8;
      scene.add(sky);

      // 地块生成模块
      // 获取物体和材质 生成网络模型
      const geometry = await getGeometry();

      // 地块顶层材质
      const topTexture = new THREE.TextureLoader().load(topTextureUrl);
      const topMaterial = new THREE.MeshLambertMaterial({
        wireframe: false,
        side: THREE.DoubleSide,
        map: topTexture,
      });

      // 地块底层材质
      const bottomTexture = new THREE.TextureLoader().load(bottomTextureList[0]);
      const bottomMaterial = new THREE.MeshLambertMaterial({
        wireframe: false,
        side: THREE.DoubleSide,
        map: bottomTexture,
      });

      // 地块侧面材质
      const sideTexture = new THREE.TextureLoader().load(sideTextureList[0]);
      const sideMaterial = new THREE.MeshLambertMaterial({
        wireframe: false,
        side: THREE.DoubleSide,
        map: sideTexture
      });

      // 创建顶层网格
      const mountain = new THREE.Mesh(geometry.terrainGeometry, topMaterial);
      mountain.position.y = parameter.positionY;
      mountain.rotation.x = Math.PI / 2;
      mountain.name = 'topMesh';

      scene.add(mountain);

      // 创建侧面网格
      const frontMesh = new THREE.Mesh(geometry.sideGeometries[0], sideMaterial);
      frontMesh.name = 'sideMesh0';
      frontMesh.position.y = parameter.positionY;
      const backGeometry = new THREE.Mesh(geometry.sideGeometries[1], sideMaterial);
      backGeometry.name = 'sideMesh1';
      backGeometry.position.y = parameter.positionY;
      const leftGeometry = new THREE.Mesh(geometry.sideGeometries[2], sideMaterial);
      leftGeometry.name = 'sideMesh2';
      leftGeometry.position.y = parameter.positionY;
      const rightGeometry = new THREE.Mesh(geometry.sideGeometries[3], sideMaterial);
      rightGeometry.name = 'sideMesh3';
      rightGeometry.position.y = parameter.positionY;

      scene.add(frontMesh, backGeometry, leftGeometry, rightGeometry);

      // 创建地面网格
      const groundMesh = new THREE.Mesh(geometry.groundGeometry, bottomMaterial);
      groundMesh.rotation.x = Math.PI / 2;
      groundMesh.position.y = parameter.heightOffset + parameter.positionY;
      groundMesh.name = 'groundMesh';
      scene.add(groundMesh);

      // 获取相机
      const camera = getCamera();
      camera.position.set(500, 500, 500);
      camera.lookAt(scene.position);

      function getCamera() {
        const fov = 75;
        const aspect = width / height;
        const near = 0.1;
        const far = 10000;
        return new THREE.PerspectiveCamera(fov, aspect, near, far);
      }

      // 获取渲染器
      const renderer = getRenderer();
      renderer.setSize(width, height);
      document.getElementById("canvas-container").appendChild(renderer.domElement);

      // 渲染循环
      function render() {
        renderer.render(scene, camera);
        water.material.uniforms["time"].value += 5.0 / 60;
        requestAnimationFrame(render);
      }

      render();

      function getRenderer() {
        const renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setPixelRatio(window.devicePixelRatio || 1);
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        return renderer;
      }

      // 画布跟随窗口变化
      window.onresize = function () {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
      };

      // 定义轨道控制器
      const controls = getControls(camera, renderer.domElement);

      function getControls(camera, domElement) {
        const controls = new OrbitControls(camera, domElement);
        controls.enabled = true;
        controls.maxDistance = 2500;
        controls.minDistance = 500;
        controls.autoRotate = true;

        return controls;
      }

      // 监听变化，重新渲染
      controls.addEventListener('change', () => {
        renderer.render(scene, camera);
      });

      // 获取灯光
      const directionalLight = getDirectionalLight();
      const ambientLight = getAmbientLight();
      scene.add(directionalLight);
      scene.add(ambientLight);

      function getDirectionalLight() {
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(500, 1000, 250);

        return light;
      }

      function getAmbientLight() {
        return new THREE.AmbientLight(0xffffff, 1);
      }

      // 获取辅助坐标系
      const gridHelper = new THREE.GridHelper(2000, 40);
      const axesHelper = new THREE.AxesHelper(50000);
      scene.add(gridHelper);
      scene.add(axesHelper);

      async function getGeometry() {
        // 获取DEM 的tif文件
        const rawTiff = await GeoTIFF.fromUrl(demTifUrl);

        const tifImage = await rawTiff.getImage();
        const image = {
          width: tifImage.getWidth(),
          height: tifImage.getHeight(),
        };

        const terrainGeometry = new THREE.PlaneGeometry(
            image.width,
            image.height,
            image.width - 1,
            image.height - 1
        );

        const demData = await tifImage.readRasters({interleave: true});

        const arr1 = new Array(terrainGeometry.attributes.position.count);
        const arr = arr1.fill(1);

        arr.forEach((a, index) => {
          terrainGeometry.attributes.position.setZ(index, (demData[index] / parameter.scaleFactor) * -1);
        });

        // 创建四个侧面
        const sideGeometries = [];
        const padding = 2;
        const width = image.width;
        const height = image.height;

        // 前面
        const frontGeometry = new THREE.PlaneGeometry(width, padding, width - 1, padding - 1);
        for (let x = 0; x < width; x++) {
          const index = x;
          frontGeometry.attributes.position.setY(index, (demData[index] / parameter.scaleFactor - parameter.heightOffset));
        }
        frontGeometry.translate(0, parameter.heightOffset, image.height / 2);
        frontGeometry.computeVertexNormals();
        sideGeometries.push(frontGeometry);

        // 后面
        const backGeometry = new THREE.PlaneGeometry(width, padding, width - 1, padding - 1);
        for (let x = 0; x < width; x++) {
          const index = (height - 1) * width + x;
          backGeometry.attributes.position.setY(x, (demData[index] / parameter.scaleFactor) - parameter.heightOffset);
        }
        backGeometry.translate(0, parameter.heightOffset, -image.height / 2);
        backGeometry.computeVertexNormals();

        sideGeometries.push(backGeometry);

        // 左面
        const leftGeometry = new THREE.PlaneGeometry(height, padding, height - 1, padding - 1);
        for (let y = 0; y < height; y++) {
          const index = y * width;
          leftGeometry.attributes.position.setY(y, (demData[index] / parameter.scaleFactor - parameter.heightOffset));
        }
        leftGeometry.rotateY(Math.PI / 2);
        leftGeometry.translate(-image.width / 2, parameter.heightOffset, 0);
        leftGeometry.computeVertexNormals();
        sideGeometries.push(leftGeometry);

        // 右面
        const rightGeometry = new THREE.PlaneGeometry(height, padding, height - 1, padding - 1);
        for (let y = 0; y < height; y++) {
          const index = y * width + (width - 1);
          rightGeometry.attributes.position.setY(y, (demData[index] / parameter.scaleFactor - parameter.heightOffset));
        }
        rightGeometry.rotateY(Math.PI / 2);
        rightGeometry.translate(image.width / 2, parameter.heightOffset, 0);
        rightGeometry.computeVertexNormals();
        sideGeometries.push(rightGeometry);

        // 地面
        const groundGeometry = new THREE.PlaneGeometry(width, height, width - 1, height - 1);
        groundGeometry.computeVertexNormals();

        return {
          terrainGeometry,
          sideGeometries: [frontGeometry, backGeometry, leftGeometry, rightGeometry],
          groundGeometry
        };
      }

      let raycaster = new THREE.Raycaster();
      let mouse = new THREE.Vector2();

      document.addEventListener('click', function (event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        const meshArray = [];
        scene.children.forEach(value => {
          if (value.name) {
            meshArray.push(value);
          }
        })

        const intersects = raycaster.intersectObjects(meshArray);

        if (intersects.length > 0) {
          const intersection = intersects[0];
          const point = intersection.point;

          console.log('点坐标:', point);
        }
      }, false);


      // *************************************************************************** //
      // GUI控制器
      let lightParameters = {
        intensity: 1,
        color: 0xffffff,
        lightX: 500,
        lightY: 1000,
        lightZ: 250,
      };

      let otherParameters = {
        top: parameter.positionY,
        gridHelper: true,
        axesHelper: true,
        bottomTexture: '.IslandDisplayTexture/side-texture.jpg',
        sideTexture: 'IslandDisplayTexture/side-texture3.jpg',
      }

      let sunParameters = {
        turbidity: 1,
        rayleigh: 1.5,
      }
      let waterParameters = {
        waterColor: 0x0072ff,
        alpha: 2,
        distortionScale: 100
      }

      // 参数控制模块
      const gui = new GUI();
      gui.domElement.style.right = '20px';
      gui.domElement.style.top = '20px';
      gui.domElement.style.width = '300px';

      gui.add(otherParameters, 'top', 0, 800).onChange(value => {
        mountain.position.y = value;
        groundMesh.position.y = parameter.heightOffset + value;
        frontMesh.position.y = value;
        backGeometry.position.y = value;
        leftGeometry.position.y = value;
        rightGeometry.position.y = value;
      }).name('地块位置');
      gui.add(lightParameters, 'intensity', 0, 5.0).onChange(value => {
        directionalLight.intensity = value;
      }).name('阳光强度');
      gui.addColor(lightParameters, 'color').onChange(value => {
        directionalLight.color.set(value);
      }).name('阳光颜色');
      gui.add(lightParameters, 'lightX', -2000, 2000).onChange(value => {
        directionalLight.position.x = value;
      }).name('x方向阳光')
      gui.add(lightParameters, 'lightY', -2000, 2000).onChange(value => {
        directionalLight.position.y = value;
      }).name('y方向阳光')
      gui.add(lightParameters, 'lightZ', -2000, 2000).onChange(value => {
        directionalLight.position.z = value;
      }).name('z方向阳光')
      gui.add(lightParameters, 'intensity', 0, 5.0).onChange(value => {
        ambientLight.intensity = value;
      }).name('环境光强度');
      gui.addColor(lightParameters, 'color').onChange(value => {
        ambientLight.color.set(value);
      }).name('环境光颜色');
      gui.add(otherParameters, 'gridHelper').onChange(value => {
        gridHelper.visible = value;
      }).name('网格辅助开关');
      gui.add(otherParameters, 'axesHelper').onChange(value => {
        axesHelper.visible = value;
      }).name('坐标辅助开关');
      gui.add(otherParameters, 'sideTexture', sideTextureList).onChange(value => {
        sideMaterial.map = new THREE.TextureLoader().load(value);
        sideMaterial.needsUpdate = true
      }).name('侧面材质');
      gui.add(otherParameters, 'bottomTexture', bottomTextureList).onChange(value => {
        bottomMaterial.map = new THREE.TextureLoader().load(value);
        bottomMaterial.needsUpdate = true
      }).name('底层材质');
      gui.add(sunParameters, 'turbidity', 0, 10).onChange((value) => {
        sky.material.uniforms["turbidity"].value = value;
      }).name('浑浊度');
      gui.add(sunParameters, 'rayleigh', 0, 10).onChange((value) => {
        sky.material.uniforms["rayleigh"].value = value;
      }).name('锐利度');

      gui.add(waterParameters, 'alpha', 0, 3).onChange((value) => {
        water.material.uniforms["alpha"].value = value;
      })
      gui.add(waterParameters, 'distortionScale', 0, 240).onChange((value) => {
        water.material.uniforms["distortionScale"].value = value;
      })
      gui.addColor(waterParameters, 'waterColor').onChange(function (value) {
        water.material.uniforms["waterColor"].value = new THREE.Color(value);
      }).name('海水颜色');
    }
  },

  mounted() {
    this.createFunction();
  }
}

</script>

<style scoped>
</style>