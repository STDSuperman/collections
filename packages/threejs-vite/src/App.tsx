import { useRef, useEffect } from 'react'
import './App.css'
import * as THREE from 'three'
import Stats from 'stats.js'

function App() {
  const threeJsContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scene = new THREE.Scene()
    const height = threeJsContainerRef.current?.clientHeight || 100
    const width = threeJsContainerRef.current?.clientWidth || 100

    // init renderer
    const render = new THREE.WebGLRenderer({
      antialias: true
    })
    render.setPixelRatio(window.devicePixelRatio)
    render.sortObjects = false
    render.setSize(width, height)
    render.outputEncoding = THREE.sRGBEncoding;
    render.toneMapping = THREE.ACESFilmicToneMapping;
    render.toneMappingExposure = 0.5;
    render.setClearColor(0x8abcd1)

    // add stats
    const initStats = () => {
      const stats = new Stats()
      stats.showPanel(0)
      document.body.appendChild(stats.dom)
      return stats
    }

    const stats = initStats()

    // add camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000)
    camera.position.set(0, 0, 0)
    scene.add(camera)

    // add light
    const amLight = new THREE.AmbientLight(0x4792b9)
    scene.add(amLight)

    threeJsContainerRef?.current?.appendChild(render.domElement)

    const animate = () => {
      stats.begin()
      render?.render(scene, camera)
      requestAnimationFrame(animate)
      stats.end()
    }

    animate()
  }, [])

  return (
    <div
      className="threeJs-container"
      ref={threeJsContainerRef}
    ></div>
  )
}

export default App
