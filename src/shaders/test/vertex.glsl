uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform float audioData;

attribute vec3 position;
attribute float aRandom;

varying float vRandom;
varying float vAudioData;

varying float x;
varying float y;
varying float z;


void main() {

    
    vRandom = aRandom; 
    vAudioData = audioData;



    float normalizedAudio = audioData / 255.0;
    float minScale = 1.0;
    float maxScale = 2.0;
    float pulsationIntensity = 0.8;
    float pulsationOffset = 2.0;
    float scale = mix(minScale, maxScale, normalizedAudio);
    float radius = length(position.xy);
    float angle = atan(position.y, position.x);
    float pulsation = sin(radius * scale + audioData) * pulsationIntensity +pulsationOffset;
    float scaledRadius = (radius * pulsation);
    vec3 scaledPosition = vec3(cos(angle) * scaledRadius, sin(angle) * scaledRadius, position.z );
    vec4 modelPosition = modelMatrix * vec4(scaledPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;
}