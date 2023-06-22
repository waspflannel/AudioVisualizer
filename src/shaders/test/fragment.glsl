precision mediump float;




varying float vAudioData;

void main() {
    float normalizedAudio = vAudioData*10.0 / 255.0;

    vec3 colorStart = vec3(1.0, 0.0, 1.0);
    vec3 colorMid = vec3(0.0, 0.4, 0.6);
    vec3 colorMid2 = vec3(1.0, 0.6, 0.0);
    vec3 colorEnd = vec3(1.0, 0.0, 1.0);   

    vec3 interpolatedColor;

    if (normalizedAudio < 0.3) {
        interpolatedColor = mix(colorStart, colorMid, normalizedAudio / 0.3);
    } else if (normalizedAudio < 0.7) {
        interpolatedColor = mix(colorMid, colorMid2, (normalizedAudio - 0.3) / 0.4);
    } else {
        interpolatedColor = mix(colorMid2, colorEnd, (normalizedAudio - 0.7) / 0.3);
    }

    gl_FragColor = vec4(interpolatedColor, 1.0);
}
