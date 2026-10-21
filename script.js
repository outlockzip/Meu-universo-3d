import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const status = document.getElementById("status");

// CENA
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x02030a);
scene.fog = new THREE.FogExp2(0x02030a, 0.0007);

// CÂMERA
const camera = new THREE.PerspectiveCamera(
    60,
    innerWidth / innerHeight,
    0.1,
    3000
);

camera.position.set(0, 75, 180);

// RENDERIZADOR
const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;

document.body.appendChild(renderer.domElement);

// CONTROLES DE CÂMERA
const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 12;
controls.maxDistance = 900;
controls.target.set(0, 0, 0);

// ILUMINAÇÃO
scene.add(new THREE.AmbientLight(0x7185bb, 0.7));

const luzSol = new THREE.PointLight(0xffffff, 1800, 600, 1.5);
luzSol.position.set(0, 0, 0);
scene.add(luzSol);

// ESTRELAS EM 3D
const quantidadeEstrelas = 7000;
const posicoes = new Float32Array(quantidadeEstrelas * 3);

for (let i = 0; i < quantidadeEstrelas; i++) {
    const raio = 150 + Math.random() * 1200;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    posicoes[i * 3] =
        raio * Math.sin(phi) * Math.cos(theta);

    posicoes[i * 3 + 1] =
        raio * Math.cos(phi);

    posicoes[i * 3 + 2] =
        raio * Math.sin(phi) * Math.sin(theta);
}

const geometriaEstrelas = new THREE.BufferGeometry();

geometriaEstrelas.setAttribute(
    "position",
    new THREE.BufferAttribute(posicoes, 3)
);

const materialEstrelas = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.4,
    sizeAttenuation: true
});

const estrelas = new THREE.Points(
    geometriaEstrelas,
    materialEstrelas
);

scene.add(estrelas);

// SOL
const geometriaSol = new THREE.SphereGeometry(10, 64, 64);

const materialSol = new THREE.MeshBasicMaterial({
    color: 0xffb52e
});

const sol = new THREE.Mesh(geometriaSol, materialSol);

scene.add(sol);

// BRILHO DO SOL
const glowMaterial = new THREE.SpriteMaterial({
    map: criarTexturaBrilho(),
    color: 0xff8c24,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const glow = new THREE.Sprite(glowMaterial);
glow.scale.set(65, 65, 1);

scene.add(glow);

function criarTexturaBrilho() {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;

    const ctx = canvas.getContext("2d");

    const gradient = ctx.createRadialGradient(
        64, 64, 0,
        64, 64, 64
    );

    gradient.addColorStop(0, "rgba(255,220,120,0.9)");
    gradient.addColorStop(0.2, "rgba(255,140,20,0.35)");
    gradient.addColorStop(1, "rgba(255,100,0,0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);

    const textura = new THREE.CanvasTexture(canvas);
    return textura;
}

// PLANETAS
const dadosPlanetas = [
    {
        nome: "Mercúrio",
        raio: 1.5,
        orbita: 18,
        cor: 0xaaa49c,
        velocidade: 0.9
    },
    {
        nome: "Vênus",
        raio: 2.5,
        orbita: 27,
        cor: 0xe3b875,
        velocidade: 0.65
    },
    {
        nome: "Terra",
        raio: 2.7,
        orbita: 39,
        cor: 0x258bff,
        velocidade: 0.48
    },
    {
        nome: "Marte",
        raio: 2,
        orbita: 51,
        cor: 0xe45b3c,
        velocidade: 0.38
    },
    {
        nome: "Júpiter",
        raio: 6,
        orbita: 72,
        cor: 0xd5ad85,
        velocidade: 0.23
    },
    {
        nome: "Saturno",
        raio: 5,
        orbita: 96,
        cor: 0xe6d09b,
        velocidade: 0.17,
        aneis: true
    },
    {
        nome: "Urano",
        raio: 3.5,
        orbita: 119,
        cor: 0x83e5e9,
        velocidade: 0.12
    },
    {
        nome: "Netuno",
        raio: 3.5,
        orbita: 143,
        cor: 0x426bff,
        velocidade: 0.09
    }
];

const planetas = [];

function criarPlaneta(dados) {
    const grupo = new THREE.Group();

    const geometria = new THREE.SphereGeometry(
        dados.raio,
        48,
        48
    );

    const material = new THREE.MeshStandardMaterial({
        color: dados.cor,
        roughness: 0.85,
        metalness: 0.05
    });

    const esfera = new THREE.Mesh(geometria, material);
    grupo.add(esfera);

    // Anéis de Saturno
    if (dados.aneis) {
        const geometriaAneis = new THREE.RingGeometry(
            dados.raio * 1.35,
            dados.raio * 2.2,
            96
        );

        const materialAneis = new THREE.MeshBasicMaterial({
            color: 0xc8b58f,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });

        const aneis = new THREE.Mesh(
            geometriaAneis,
            materialAneis
        );

        aneis.rotation.x = Math.PI / 2.5;
        grupo.add(aneis);
    }

    // Órbita
    const curva = new THREE.EllipseCurve(
        0, 0,
        dados.orbita, dados.orbita,
        0, Math.PI * 2,
        false,
        0
    );

    const pontos = curva.getPoints(180);

    const geometriaOrbita = new THREE.BufferGeometry()
        .setFromPoints(
            pontos.map(p => new THREE.Vector3(p.x, 0, p.y))
        );

    const linhaOrbita = new THREE.LineLoop(
        geometriaOrbita,
        new THREE.LineBasicMaterial({
            color: 0x34466e,
            transparent: true,
            opacity: 0.55
        })
    );

    scene.add(linhaOrbita);

    scene.add(grupo);

    planetas.push({
        grupo,
        dados,
        angulo: Math.random() * Math.PI * 2
    });
}

dadosPlanetas.forEach(criarPlaneta);

// ASTEROIDES
const quantidadeAsteroides = 1800;
const geometriaAsteroides = new THREE.BufferGeometry();
const posAsteroides = new Float32Array(quantidadeAsteroides * 3);

for (let i = 0; i < quantidadeAsteroides; i++) {
    const angulo = Math.random() * Math.PI * 2;
    const raio = 57 + Math.random() * 8;

    posAsteroides[i * 3] = Math.cos(angulo) * raio;
    posAsteroides[i * 3 + 1] = (Math.random() - 0.5) * 2;
    posAsteroides[i * 3 + 2] = Math.sin(angulo) * raio;
}

geometriaAsteroides.setAttribute(
    "position",
    new THREE.BufferAttribute(posAsteroides, 3)
);

const asteroides = new THREE.Points(
    geometriaAsteroides,
    new THREE.PointsMaterial({
        color: 0xa9a9a9,
        size: 0.5
    })
);

scene.add(asteroides);

// ANIMAÇÃO
const relogio = new THREE.Clock();

function animar() {
    requestAnimationFrame(animar);

    const delta = Math.min(relogio.getDelta(), 0.05);

    sol.rotation.y += delta * 0.15;
    estrelas.rotation.y += delta * 0.002;
    asteroides.rotation.y += delta * 0.025;

    planetas.forEach(({ grupo, dados, angulo }) => {
        const novoAngulo = angulo + delta * dados.velocidade * 0.12;

        grupo.position.x =
            Math.cos(novoAngulo) * dados.orbita;

        grupo.position.z =
            Math.sin(novoAngulo) * dados.orbita;

        grupo.rotation.y += delta * 0.3;

        // Atualiza o ângulo para a próxima animação
        const planeta = planetas.find(p => p.grupo === grupo);
        planeta.angulo = novoAngulo;
    });

    controls.update();
    renderer.render(scene, camera);

    status.textContent =
        `${planetas.length} planetas · ${quantidadeEstrelas.toLocaleString("pt-BR")} estrelas`;
}

window.addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
});

animar();
