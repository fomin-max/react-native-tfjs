import { Camera } from 'expo-camera';

export enum CameraType {
  Back = Camera.Constants.Type.back,
  Front = Camera.Constants.Type.front,
}

export enum ModelName {
  Posenet = 'posenet',
  Blazeface = 'blazeface',
}
