uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform float audioData;

attribute vec3 position;

varying float vRandom;
varying float vAudioData;

varying float x;
varying float y;
varying float z;

void main() {

    
    vAudioData = audioData;

    float normalizedAudio = audioData / 255.0;
    float minScale = 0.5;
    float maxScale = 2.0;
    float scale = mix(minScale, maxScale, normalizedAudio);
    vec3 scaledPosition = ((sin(position * scale*4.0))) * (cos(position * scale*4.0)); 
    vec4 modelPosition = modelMatrix * vec4(scaledPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;
}