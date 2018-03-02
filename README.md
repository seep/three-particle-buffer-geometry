# three-particle-buffer-geometry

Buffer a bunch of meshes into a single BufferGeometry, with helpful vertex
attributes that make displacement shaders easy.

# Why?

Drawing thousands of individual meshes is slow, mainly because each mesh has
its own transformation matrix to update and draw call to buffer. Drawing
instanced geometry is fast but has limited support.

If you want to draw a lot of meshes really fast and can position all of them
in a vertex shader, this package will help.

# Example

```javascript
import { ShaderMaterial, Mesh } from 'three';
import { ParticleBufferGeometry, OctahedronParticleGeometry } from 'three-particle-buffer-geometry';
import fragmentShader from './particle-frag.glsl';
import vertexShader from './particle-vert.glsl';

const geometry = new ParticleBufferGeometry({
  particleGeometry: OctahedronParticleGeometry(),
  particleCount: 800,
});

const material = new ShaderMaterial({ vertexShader, fragmentShader });

const mesh = new Mesh(geometry, material);
```

```glsl
// particle-vert.glsl

attribute float pid;
attribute vec3 seed;

void main() {

  vec3 particlePosition = (seed - 0.5) * 10.0;
  vec3 vertexPosition = particlePosition + position;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPosition, 1.0);

}
```

```glsl
// particle-frag.glsl

uniform vec3 color;

void main() {

  gl_FragColor = vec4(color + light, 1.0);

}
```

# Details

The particles are all initialized around the origin. Each vertex has two custom
attributes: a particle ID stored in `pid` and a 3D vector with random values
between [0,1] in `seed`. These values are shared between all of the vertices in
a single particle, so it's easy to add per-particle randomness without mangling
the particle mesh.

The package includes some premade mesh buffers for simple geometry, as well as
support for dynamic mesh generation if you want each particle to have a unique
mesh.

# API

#### ParticleBufferGeometry({ particleCount, particleGeometry })

Builds a BufferGeometry with `particleCount` instances of the particle geometry.
The `particleGeometry` can be an object, array, or function.

- If it is an object, it must have `vertexArray` and `indexArray` properties
describing the indexed geometry.

- If it is an array, it must be a list of such objects. Each particle will be
a random element of the array.

- If it is a function, it must return such an object each time it is called.
Each particle in the BufferGeometry will be generated from this function. It
can return a different result each time.

#### FannedCircleParticleGeometry(detail = 3)

Returns fanned circle (no center vertex) vertex and index buffers, with `detail` sides.

#### IcosahedronParticleGeometry()

Returns icosahedron vertex and index buffers.

#### TetrahedronParticleGeometry()

Returns tetrahedron vertex and index buffers.

#### OctahedronParticleGeometry()

Returns octahedron vertex and index buffers.

#### DodecahedronParticleGeometry()

Returns dodecahedron vertex and index buffers.
