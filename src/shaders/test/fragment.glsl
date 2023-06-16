precision mediump float;

varying float vAudioData;
varying float vRandom;

void main()
{

    float normalizedAudio = vAudioData / 255.0;

    vec3 colorStart = vec3(0.5, 0.0, 0.5);
    //vec3 colorEnd = vec3(0.3,0.8,0.9);
    vec3 colorMid = vec3(0.0,0.5,0.5); 

    vec3 colorMid2 = vec3(0.0,0.3,0.0);

    vec3 colorEnd = vec3(0.0,0.0,1.0);   

    if(normalizedAudio < 0.3){
        vec3 interpolatedColor = mix(colorStart ,colorMid, vAudioData*0.15);
        gl_FragColor = vec4(interpolatedColor, 1.0);
    }
    else if(normalizedAudio < 0.7){
        vec3 interpolatedColor = mix(colorMid ,colorMid2, vAudioData*0.09);
        gl_FragColor = vec4(interpolatedColor, 1.0);
    }
    else if (normalizedAudio <= 1.0){
        vec3 interpolatedColor = mix(colorMid2,colorEnd, vAudioData*0.09);
        gl_FragColor = vec4(interpolatedColor, 1.0);
    }


     //vec3 interpolatedColor = mix(colorStart*2.0 ,colorEnd*0.5, vAudioData*0.09);

}