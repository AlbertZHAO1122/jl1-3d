<template>
  <div class="container" id="canvas-container"></div>
</template>

<script>
import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {GUI} from 'three/examples/jsm/libs/lil-gui.module.min.js';
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader.js";
import * as GeoTIFF from 'geotiff';

export default {
  name: "LandDisplay",
  methods: {
    async createFunction() {
      // 工程中的常量
      const width = window.innerWidth;
      const height = window.innerHeight;

      // 山体地块的prameter
      const parameter = {
        // 高度偏移
        heightOffset: 50,
        // 缩放因子
        scaleFactor: 8,
      }
      // 顶层图片地址
      const topTextureUrl = 'LandDisplayTexture/images/jl1-mountain.png';
      // 高程tif地址
      const demTifUrl = 'LandDisplayTexture/images/agri-medium-dem.tif';

      // 天空盒列表
      const sky1 = [
        'LandDisplayTexture/skybox/skybox1/posx.jpg',
        'LandDisplayTexture/skybox/skybox1/negx.jpg',
        'LandDisplayTexture/skybox/skybox1/posy.jpg',
        'LandDisplayTexture/skybox/skybox1/negy.jpg',
        'LandDisplayTexture/skybox/skybox1/posz.jpg',
        'LandDisplayTexture/skybox/skybox1/negz.jpg',
      ]
      const sky2 = [
        'LandDisplayTexture/skybox/skybox2/posx.jpg',
        'LandDisplayTexture/skybox/skybox2/negx.jpg',
        'LandDisplayTexture/skybox/skybox2/posy.jpg',
        'LandDisplayTexture/skybox/skybox2/negy.jpg',
        'LandDisplayTexture/skybox/skybox2/posz.jpg',
        'LandDisplayTexture/skybox/skybox2/negz.jpg',
      ]
      const sky3 = [
        'LandDisplayTexture/skybox/skybox3/posx.jpg',
        'LandDisplayTexture/skybox/skybox3/negx.jpg',
        'LandDisplayTexture/skybox/skybox3/posy.jpg',
        'LandDisplayTexture/skybox/skybox3/negy.jpg',
        'LandDisplayTexture/skybox/skybox3/posz.jpg',
        'LandDisplayTexture/skybox/skybox3/negz.jpg',
      ]
      const sky4 = [
        'LandDisplayTexture/skybox/skybox4/posx.jpg',
        'LandDisplayTexture/skybox/skybox4/negx.jpg',
        'LandDisplayTexture/skybox/skybox4/posy.jpg',
        'LandDisplayTexture/skybox/skybox4/negy.jpg',
        'LandDisplayTexture/skybox/skybox4/posz.jpg',
        'LandDisplayTexture/skybox/skybox4/negz.jpg',
      ]
      const sky5 = [
        'LandDisplayTexture/skybox/skybox5/posx.jpg',
        'LandDisplayTexture/skybox/skybox5/negx.jpg',
        'LandDisplayTexture/skybox/skybox5/posy.jpg',
        'LandDisplayTexture/skybox/skybox5/negy.jpg',
        'LandDisplayTexture/skybox/skybox5/posz.jpg',
        'LandDisplayTexture/skybox/skybox5/negz.jpg',
      ]
      const sky6 = [
        'LandDisplayTexture/skybox/skybox6/posx.jpg',
        'LandDisplayTexture/skybox/skybox6/negx.jpg',
        'LandDisplayTexture/skybox/skybox6/posy.jpg',
        'LandDisplayTexture/skybox/skybox6/negy.jpg',
        'LandDisplayTexture/skybox/skybox6/posz.jpg',
        'LandDisplayTexture/skybox/skybox6/negz.jpg',
      ]
      const skyList = [sky1, sky2, sky3, sky4, sky5, sky6];

      // 底层材质列表
      const bottomTextureList = [
        'LandDisplayTexture/images/side-texture.jpg',
        'LandDisplayTexture/images/side-texture2.jpeg',
        'LandDisplayTexture/images/side-texture6.png',
        'LandDisplayTexture/images/side-texture5.png',
      ];

      // 侧面材质列表
      const sideTextureList = [
        'LandDisplayTexture/images/side-texture3.jpg',
        'LandDisplayTexture/images/side-texture4.jpg',
        'LandDisplayTexture/images/side-texture.jpg',
        'LandDisplayTexture/images/side-texture2.jpeg',
        'LandDisplayTexture/images/side-texture5.png',
        'LandDisplayTexture/images/side-texture6.png',
      ]

      // *************************************************************************** //
      // 创建场景
      const scene = new THREE.Scene();

      // 天空
      const cubeLoader = new THREE.CubeTextureLoader();
      scene.background = cubeLoader.load(sky2);

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
      mountain.position.y = 0;
      mountain.rotation.x = Math.PI / 2;
      mountain.name = 'topMesh';

      scene.add(mountain);

      // 创建侧面网格
      const frontMesh = new THREE.Mesh(geometry.sideGeometries[0], sideMaterial);
      frontMesh.name = 'sideMesh0';
      const backGeometry = new THREE.Mesh(geometry.sideGeometries[1], sideMaterial);
      backGeometry.name = 'sideMesh1';
      const leftGeometry = new THREE.Mesh(geometry.sideGeometries[2], sideMaterial);
      leftGeometry.name = 'sideMesh2';
      const rightGeometry = new THREE.Mesh(geometry.sideGeometries[3], sideMaterial);
      rightGeometry.name = 'sideMesh3';

      scene.add(frontMesh, backGeometry, leftGeometry, rightGeometry);

      // 创建地面网格
      const groundMesh = new THREE.Mesh(geometry.groundGeometry, bottomMaterial);
      groundMesh.rotation.x = Math.PI / 2;
      groundMesh.position.y = parameter.heightOffset;
      groundMesh.name = 'groundMesh';
      scene.add(groundMesh);


      // 获取相机
      const camera = getCamera();
      camera.position.set(1500, 1500, 1500);
      camera.lookAt(scene.position);

      function getCamera() {
        const fov = 75;
        const aspect = width / height;
        const near = 0.1;
        const far = 10000;
        return new THREE.PerspectiveCamera(fov, aspect, near, far);
      }

      // 模型运动模块
      // 点 -> 插值 -> 曲线
      const initialPoints = [
        new THREE.Vector3(-800, 800, -800),
        new THREE.Vector3(600, 600, -600),
        new THREE.Vector3(800, -600, 600),
        new THREE.Vector3(-600, -800, 800)
      ];
      let cubeList = [];
      for (let i = 0; i < initialPoints.length; i++) {
        const geometry = new THREE.BoxGeometry(10, 10, 10);
        const material = new THREE.MeshBasicMaterial(0xffffff);
        const cube = new THREE.Mesh(geometry, material);
        cube.position.copy(initialPoints[i]);
        cubeList.push(cube);
        scene.add(cube);
      }
      const curve = new THREE.CatmullRomCurve3(cubeList.map((cube) => cube.position));
      curve.curveType = 'chordal'; // 曲线类型
      curve.closed = true;
      const points = curve.getPoints(100); // 100等分获取曲线点数组
      const line = new THREE.LineLoop(
          new THREE.BufferGeometry().setFromPoints(points),
          new THREE.LineBasicMaterial({color: 0xffffff})
      );
      scene.add(line);

      // 卫星模型
      // const wxLoader = new FBXLoader();
      // const wxFbxUrl = '../textures/weixing.fbx';
      // wxLoader.load(wxFbxUrl, (fbx) => {
      //   fbx.position.set(-800,800,-800);
      //   fbx.rotation.x = - Math.PI / 5;
      //   fbx.rotation.y = 3 * Math.PI / 4;
      //   fbx.scale.set(0.15, 0.15, 0.15);
      //   scene.add(fbx);
      // }, (xhr) => {
      //   // 加载过程的回调函数
      //   console.log(`模型加载进度: ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`);
      // }, (error) => {
      //   // 加载出错的回调函数
      //   console.error('模型加载出错:', error);
      // });

      // 一个测试模型运动的测试物体模型
      const testMesh = new THREE.Mesh(
          new THREE.DodecahedronGeometry(60, 0),
          new THREE.MeshLambertMaterial({
            color: 0xFF5733
          })
      );
      testMesh.position.copy(initialPoints[0])
      scene.add(testMesh);

      // testMesh指的是运动的物体
      function changePosition(t) {
        const position = curve.getPointAt(t); // t: 当前点在线条上的位置百分比，后面计算
        testMesh.position.copy(position);
        return position;
      }

      function changeLookAt(t, position) {
        const tangent = curve.getTangentAt(t);
        const lookAtVec = tangent.add(position); // 位置向量和切线向量相加即为所需朝向的点向量
        testMesh.lookAt(lookAtVec);
      }

      // 获取渲染器
      const renderer = getRenderer();
      renderer.setSize(width, height);
      document.getElementById("canvas-container").appendChild(renderer.domElement);

      // 渲染循环
      function render() {
        // 环绕运动
        let time = Date.now();
        const loopTime = 25 * 1000;
        let t = (time % loopTime) / loopTime;
        const position = changePosition(t);
        changeLookAt(t, position);
        renderer.render(scene, camera);
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

      // 环境模块
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
        const light = new THREE.AmbientLight(0xffffff, 1);

        return light;
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
      // GUI控制器部分
      let lightParameters = {
        intensity: 1,
        color: 0xffffff,
        lightX: 500,
        lightY: 1000,
        lightZ: 250,
      };

      let otherParameters = {
        top: 0,
        sky: [
          'LandDisplayTexture/skybox/skybox2/posx.jpg',
          'LandDisplayTexture/skybox/skybox2/negx.jpg',
          'LandDisplayTexture/skybox/skybox2/posy.jpg',
          'LandDisplayTexture/skybox/skybox2/negy.jpg',
          'LandDisplayTexture/skybox/skybox2/posz.jpg',
          'LandDisplayTexture/skybox/skybox2/negz.jpg',
        ],
        gridHelper: true,
        axesHelper: true,
        bottomTexture: 'LandDisplayTexture/images/side-texture.jpg',
        sideTexture: 'LandDisplayTexture/images/side-texture3.jpg',
      }

      // 参数控制模块
      const gui = new GUI();
      gui.domElement.style.right = '20px';
      gui.domElement.style.top = '20px';
      gui.domElement.style.width = '300px';

      gui.add(otherParameters, 'top', 0, 800).onChange(value => {
        mountain.position.y = value;
      }).name('开盖');
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

      gui.add(otherParameters, 'sky', skyList).name('天空').onChange(value => {
        const cubeLoader = new THREE.CubeTextureLoader();
        scene.background = cubeLoader.load(value)
      });
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


      // 模型导入模块
      // 地块中的的箱子模型
      const boxLoader = new FBXLoader();
      const boxFbxUrl = 'LandDisplayTexture/models/xiangzi.fbx';
      boxLoader.load(boxFbxUrl, (fbx) => {
        fbx.position.set(-300, 180, 350);
        fbx.scale.set(80, 80, 80);
        const texture = new THREE.TextureLoader().load('LandDisplayTexture/models/xiangzi.png');
        // 将贴图应用到模型材质
        fbx.traverse(child => {
          if (child.isMesh) {
            child.material.map = texture;
          }
        });
        scene.add(fbx);
      }, (xhr) => {
        // 加载过程的回调函数
        console.log(`模型加载进度: ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`);
      }, (error) => {
        // 加载出错的回调函数
        console.error('模型加载出错:', error);
      });

      // 地面的标记模型
      // const markerLoader = new FBXLoader();
      // const markerFbxUrl = '../textures/village_sign.fbx';
      // markerLoader.load(markerFbxUrl, (fbx) => {
      //   fbx.position.set(254, 178, 341);
      //   fbx.scale.set(0.3, 0.3, 0.3);
      //   const texture = new THREE.TextureLoader().load('../textures/xiangzi.png');
      //   // 将贴图应用到模型材质
      //   fbx.traverse(child => {
      //     if (child.isMesh) {
      //       child.material.map = texture;
      //     }
      //   });
      //
      //   const position = {
      //     x: fbx.position.x,
      //     y: fbx.position.y,
      //     z: fbx.position.z
      //   };
      //
      //   const gui = new GUI();
      //   gui.domElement.style.right = '20px';
      //   gui.domElement.style.top = '350px';
      //   gui.domElement.style.width = '300px';
      //   gui.add(position, 'x', -width / 2, width / 2).onChange((val) => fbx.position.x = val);
      //   gui.add(position, 'y', -500, 500).onChange((val) => fbx.position.y = val);
      //   gui.add(position, 'z', -height / 2, height / 2).onChange((val) => fbx.position.z = val);
      //   gui.add({isShow: true}, 'isShow').onChange((val) => fbx.visible = val).name('模型显示');
      //
      //   scene.add(fbx);
      // }, (xhr) => {
      //   // 加载过程的回调函数
      //   console.log(`模型加载进度: ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`);
      // }, (error) => {
      //   // 加载出错的回调函数
      //   console.error('模型加载出错:', error);
      // });
    }
  },
  mounted() {
    this.createFunction();
  }
}
</script>

<style scoped>

</style>