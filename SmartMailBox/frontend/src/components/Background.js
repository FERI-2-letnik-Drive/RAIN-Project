import { useEffect, useRef } from "react";

// Animated WebGL "blob" background in the app's green palette.
function Background() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const NUM_BLOBS = 8;
        const BLOB_RADIUS = 0.15;
        const GAUSSIAN_FACTOR = 1.0;
        const INITIAL_SPEED = 0.2;
        const VELOCITY_NOISE = 0.005;

        // Green palette (RGBA, normalized 0..1) matching the theme.
        const BLOB_COLORS = [
            [0.847, 0.953, 0.863, 1.0], // light mint
            [0.718, 0.894, 0.780, 1.0], // light seafoam
            [0.584, 0.835, 0.698, 1.0], // pale green
            [0.455, 0.776, 0.616, 1.0], // medium mint
            [0.322, 0.718, 0.533, 1.0], // jade
            [0.251, 0.569, 0.424, 1.0], // emerald
            [0.584, 0.835, 0.698, 1.0], // pale green
            [0.455, 0.776, 0.616, 1.0], // medium mint
        ];

        const vertexShaderSource = `
            attribute vec2 a_position;
            varying vec2 v_uv;
            void main(void) {
                v_uv = a_position * 0.5 + 0.5;
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;
            varying vec2 v_uv;
            uniform vec2  u_centers[${NUM_BLOBS}];
            uniform vec4  u_colors[${NUM_BLOBS}];
            uniform float u_radius;
            uniform float u_gaussianFactor;
            void main(void) {
                float sumWeight = 0.0;
                vec4  blendedColor = vec4(0.0);
                for(int i = 0; i < ${NUM_BLOBS}; i++) {
                    float d = distance(v_uv, u_centers[i]);
                    float w = exp(-u_gaussianFactor * (d * d) / (u_radius * u_radius));
                    blendedColor += w * u_colors[i];
                    sumWeight    += w;
                }
                blendedColor /= sumWeight;
                gl_FragColor  = blendedColor;
            }
        `;

        const canvas = canvasRef.current;
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        if (!gl) {
            console.warn("WebGL not supported; skipping animated background.");
            return;
        }

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        }
        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();

        function compileShader(source, type) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error("Shader compile error:", gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        }

        function createProgram(vsSource, fsSource) {
            const vs = compileShader(vsSource, gl.VERTEX_SHADER);
            const fs = compileShader(fsSource, gl.FRAGMENT_SHADER);
            if (!vs || !fs) return null;
            const prog = gl.createProgram();
            gl.attachShader(prog, vs);
            gl.attachShader(prog, fs);
            gl.linkProgram(prog);
            if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
                console.error("Program link error:", gl.getProgramInfoLog(prog));
                gl.deleteProgram(prog);
                return null;
            }
            return prog;
        }

        const program = createProgram(vertexShaderSource, fragmentShaderSource);
        if (!program) return;
        gl.useProgram(program);

        const aPositionLoc = gl.getAttribLocation(program, "a_position");
        const uCentersLoc = Array.from({ length: NUM_BLOBS }, (_, i) =>
            gl.getUniformLocation(program, `u_centers[${i}]`)
        );
        const uColorsLoc = Array.from({ length: NUM_BLOBS }, (_, i) =>
            gl.getUniformLocation(program, `u_colors[${i}]`)
        );
        const uRadiusLoc = gl.getUniformLocation(program, "u_radius");
        const uGaussianFactorLoc = gl.getUniformLocation(program, "u_gaussianFactor");

        const quadBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
        const vertices = new Float32Array([
            -1, -1, 1, -1, -1, 1,
            -1, 1, 1, -1, 1, 1,
        ]);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(aPositionLoc);
        gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);

        const blobPositions = [];
        const blobVelocities = [];
        for (let i = 0; i < NUM_BLOBS; i++) {
            blobPositions.push([Math.random(), Math.random()]);
            blobVelocities.push([
                (Math.random() - 0.5) * INITIAL_SPEED,
                (Math.random() - 0.5) * INITIAL_SPEED,
            ]);
        }

        gl.uniform1f(uRadiusLoc, BLOB_RADIUS);
        gl.uniform1f(uGaussianFactorLoc, GAUSSIAN_FACTOR);

        let lastTime = 0;
        let animationId;
        function render(now) {
            now *= 0.001;
            const deltaTime = now - (lastTime || now);
            lastTime = now;

            for (let i = 0; i < NUM_BLOBS; i++) {
                blobVelocities[i][0] += (Math.random() - 0.5) * VELOCITY_NOISE;
                blobVelocities[i][1] += (Math.random() - 0.5) * VELOCITY_NOISE;
                blobPositions[i][0] += blobVelocities[i][0] * deltaTime;
                blobPositions[i][1] += blobVelocities[i][1] * deltaTime;
                for (let c = 0; c < 2; c++) {
                    if (blobPositions[i][c] < 0.0) {
                        blobPositions[i][c] = 0.0;
                        blobVelocities[i][c] *= -1.0;
                    } else if (blobPositions[i][c] > 1.0) {
                        blobPositions[i][c] = 1.0;
                        blobVelocities[i][c] *= -1.0;
                    }
                }
            }

            for (let i = 0; i < NUM_BLOBS; i++) {
                gl.uniform2fv(uCentersLoc[i], blobPositions[i]);
                gl.uniform4fv(uColorsLoc[i], BLOB_COLORS[i % BLOB_COLORS.length]);
            }

            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            animationId = requestAnimationFrame(render);
        }
        animationId = requestAnimationFrame(render);

        // Cleanup on unmount
        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener("resize", resizeCanvas);
        };
    }, []);

    return <canvas ref={canvasRef} className="bg-canvas" />;
}

export default Background;
