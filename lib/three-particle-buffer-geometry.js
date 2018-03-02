'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var three = require('three');

/**
 * Build a cloud of particles that are buffered into a single mesh. The particles are all
 * initialized around the origin on the XY plane. Each vertex has two custom attributes: a particle
 * ID stored in `pid` and a 2D vector with random values between [0,1] in `seed`.
 *
 * @param opts
 * @param opts.particleCount - The number of particles to buffer.
 * @param opts.particleGeometry - An object, array, or function describing the particle geometry.
 *   If it is an object, it must have `indexArray` and `vertexArray` properties. If it is an array,
 *   it must be an array of these objects; each particle will be randomly picked from the list. If
 *   it is a function, it must return an object with these properties.
 *
 * @return {BufferGeometry}
 * @constructor
 */
function ParticleBufferGeometry(opts) {

  opts = Object.assign({

    particleCount: 1000

  }, opts);

  if (opts.particleGeometry === undefined) {

    throw new Error('You must provide a particle geometry.');

  }

  let generateParticleGeometry;

  if (typeof opts.particleGeometry === 'function') {

    generateParticleGeometry = opts.particleGeometry;

  } else if (Array.isArray(opts.particleGeometry)) {

    generateParticleGeometry = () => opts.particleGeometry[ three.Math.randInt(0, opts.particleGeometry.length - 1) ];

  } else {

    generateParticleGeometry = () => opts.particleGeometry;

  }

  const pidArray = [];
  const seedArray = [];
  const indexArray = [];
  const vertexArray = [];

  for (let i = 0; i < opts.particleCount; i++) {

    const geometry = generateParticleGeometry();

    const indexCount = geometry.indexArray.length;
    const indexOffset = vertexArray.length / 3;

    for (let j = 0; j < indexCount; j++) {

      indexArray.push(geometry.indexArray[j] + indexOffset);

    }

    const seedX = Math.random();
    const seedY = Math.random();
    const seedZ = Math.random();

    const vertexCount = geometry.vertexArray.length / 3;

    for (let j = 0; j < vertexCount; j++) {

      pidArray.push(i);
      seedArray.push(seedX, seedY, seedZ);

      const x = geometry.vertexArray[j * 3 + 0];
      const y = geometry.vertexArray[j * 3 + 1];
      const z = geometry.vertexArray[j * 3 + 2];

      vertexArray.push(x, y, z);

    }

  }

  const indexTypedArray = new Uint32Array(indexArray);
  const indexBuffer = new three.BufferAttribute(indexTypedArray, 1);

  const pidTypedArray = new Float32Array(pidArray);
  const pidBuffer = new three.BufferAttribute(pidTypedArray, 1);

  const seedTypedArray = new Float32Array(seedArray);
  const seedBuffer = new three.BufferAttribute(seedTypedArray, 3);

  const vertexTypedArray = new Float32Array(vertexArray);
  const vertexBuffer = new three.BufferAttribute(vertexTypedArray, 3);

  const geometry = new three.BufferGeometry();

  geometry.setIndex(indexBuffer);
  geometry.addAttribute('pid', pidBuffer);
  geometry.addAttribute('seed', seedBuffer);
  geometry.addAttribute('position', vertexBuffer);

  Object.defineProperties(geometry, {

    particleCount: { value: opts.particleCount, writable: false },

  });

  return geometry;

}

function FannedCircleParticleGeometry(detail = 3) {

  const indexArray = [];
  const vertexArray = [];

  for (let vertex = 0; vertex < detail; vertex++) {

    const theta = (vertex * 2 * Math.PI) / detail;
    vertexArray.push(Math.sin(theta), Math.cos(theta), 0.0);

  }

  for (let tri = 0; tri < detail - 2; tri++) {

    indexArray.push(tri + 2, tri + 1, 0);

  }

  return { indexArray, vertexArray };

}

function IcosahedronParticleGeometry() {

  const t = (1 + Math.sqrt(5)) / 2;

  const vertexArray = [
    -1, t, 0, 1, t, 0, -1, -t, 0, 1, -t, 0,
    0, -1, t, 0, 1, t, 0, -1, -t, 0, 1, -t,
    t, 0, -1, t, 0, 1, -t, 0, -1, -t, 0, 1
  ];

  const indexArray = [
    0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11,
    1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8,
    3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9,
    4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1
  ];

  return { indexArray, vertexArray };

}

function TetrahedronParticleGeometry() {

  const vertexArray = [1, 1, 1, -1, -1, 1, -1, 1, -1, 1, -1, -1];

  const indexArray = [2, 1, 0, 0, 3, 2, 1, 3, 0, 2, 3, 1];

  return { indexArray, vertexArray };

}

function OctahedronParticleGeometry() {

  const vertexArray = [
    1, 0, 0, -1, 0, 0, 0, 1, 0,
    0, -1, 0, 0, 0, 1, 0, 0, -1
  ];

  const indexArray = [
    0, 2, 4, 0, 4, 3, 0, 3, 5,
    0, 5, 2, 1, 2, 5, 1, 5, 3,
    1, 3, 4, 1, 4, 2
  ];

  return { indexArray, vertexArray };

}

function DodecahedronParticleGeometry() {

  const t = (1 + Math.sqrt(5)) / 2;
  const r = (1 / t);

  const vertexArray = [

    // (±1, ±1, ±1)
    -1, -1, -1, -1, -1, 1,
    -1, 1, -1, -1, 1, 1,
    1, -1, -1, 1, -1, 1,
    1, 1, -1, 1, 1, 1,

    // (0, ±1/φ, ±φ)
    0, -r, -t, 0, -r, t,
    0, r, -t, 0, r, t,

    // (±1/φ, ±φ, 0)
    -r, -t, 0, -r, t, 0,
    r, -t, 0, r, t, 0,

    // (±φ, 0, ±1/φ)
    -t, 0, -r, t, 0, -r,
    -t, 0, r, t, 0, r

  ];

  const indexArray = [
    3, 11, 7, 3, 7, 15, 3, 15, 13,
    7, 19, 17, 7, 17, 6, 7, 6, 15,
    17, 4, 8, 17, 8, 10, 17, 10, 6,
    8, 0, 16, 8, 16, 2, 8, 2, 10,
    0, 12, 1, 0, 1, 18, 0, 18, 16,
    6, 10, 2, 6, 2, 13, 6, 13, 15,
    2, 16, 18, 2, 18, 3, 2, 3, 13,
    18, 1, 9, 18, 9, 11, 18, 11, 3,
    4, 14, 12, 4, 12, 0, 4, 0, 8,
    11, 9, 5, 11, 5, 19, 11, 19, 7,
    19, 5, 14, 19, 14, 4, 19, 4, 17,
    1, 12, 14, 1, 14, 5, 1, 5, 9
  ];

  return { indexArray, vertexArray };

}

exports.ParticleBufferGeometry = ParticleBufferGeometry;
exports.FannedCircleParticleGeometry = FannedCircleParticleGeometry;
exports.IcosahedronParticleGeometry = IcosahedronParticleGeometry;
exports.TetrahedronParticleGeometry = TetrahedronParticleGeometry;
exports.OctahedronParticleGeometry = OctahedronParticleGeometry;
exports.DodecahedronParticleGeometry = DodecahedronParticleGeometry;
