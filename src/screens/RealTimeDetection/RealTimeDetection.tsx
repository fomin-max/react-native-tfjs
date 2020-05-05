import React from 'react';
import _ from 'lodash';
import { Button, View } from 'react-native';
import * as blazeface from '@tensorflow-models/blazeface';
import * as posenet from '@tensorflow-models/posenet';
import * as Permissions from 'expo-permissions';
import * as tf from '@tensorflow/tfjs';
import { Camera, PermissionStatus } from 'expo-camera';
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
import { ExpoWebGLRenderingContext } from 'expo-gl';
import Svg, { Circle, G, Line, Rect } from 'react-native-svg';
import { useNavigation } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';

import { CameraType, ModelName } from '../../features/RealTimeDetection/enums';
import { dispatch } from '../../store';
import {
  AUTO_RENDER,
  INPUT_TENSOR_HEIGHT,
  INPUT_TENSOR_WIDTH,
  MIN_KEYPOINT_POSE_SCORE,
} from '../../features/RealTimeDetection/constants';
import { isIOSPlatform, isNotNil } from '../../utils/helpers';
import { getTextureDimensions } from '../../features/RealTimeDetection/helpers';
import { styles } from './styles';
import { RootStackParamList } from '../../Navigator';
import { Screen } from '../../constants';
import { Splash } from '../Splash';

const TensorCamera = cameraWithTensors(Camera);

type RealTimeDetectionScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  Screen.RealTimeDetection
>;

interface State {
  hasCameraPermission?: boolean,
  cameraType: CameraType,
  posenetModel?: posenet.PoseNet,
  pose?: posenet.Pose,
  blazefaceModel?: blazeface.BlazeFaceModel,
  faces?: blazeface.NormalizedFace[],
  modelName: ModelName,
}

const getCameraPermissionStatus = async (): Promise<PermissionStatus> => {
  const { status } = await Permissions.askAsync(Permissions.CAMERA);

  return status;
};

export const RealTimeDetection = (): React.ReactElement => {
  const [state, setState] = React.useState<State>({
    cameraType: CameraType.Front,
    modelName: ModelName.Blazeface,
  });
  const [rafID, setRafID] = React.useState<number | null>(null);
  const [isModelFetching, setIsModelFetching] = React.useState<boolean>(true);

  const navigation = useNavigation<RealTimeDetectionScreenNavigationProp>();

  const isPosenetModel = React.useMemo(
    () => state.modelName === ModelName.Posenet,
    [state.modelName],
  );
  const isBlazefaceModel = React.useMemo(
    () => state.modelName === ModelName.Blazeface,
    [state.modelName],
  );

  React.useEffect(() => {
    (async (): Promise<void> => {
      try {
        const status = await getCameraPermissionStatus();

        const blazefaceModel = await blazeface.load();

        const posenetModel = await posenet.load({
          architecture: 'MobileNetV1',
          outputStride: 16,
          inputResolution: {
            width: INPUT_TENSOR_WIDTH,
            height: INPUT_TENSOR_HEIGHT,
          },
          multiplier: 0.75,
          quantBytes: 2,
        });

        setState({
          ...state,
          blazefaceModel,
          posenetModel,
          hasCameraPermission: status === PermissionStatus.GRANTED,
        });
      } catch (error) {
        dispatch.errors.throwError(error);
      } finally {
        setIsModelFetching(false);
      }
    })();

    return () => {
      if (rafID) {
        cancelAnimationFrame(rafID);
      }
    };
  }, []);

  const handleImageTensorReady = (
    images: IterableIterator<tf.Tensor3D>,
    updatePreview: () => void,
    gl: ExpoWebGLRenderingContext,
  ): void => {
    const estimateModel = async (): Promise<void> => {
      if (!AUTO_RENDER) {
        updatePreview();
      }

      const isPosenetModelExist = isNotNil(state.posenetModel);

      if (isPosenetModel && isPosenetModelExist) {
        const imageTensor = images.next().value;

        const pose = await state.posenetModel?.estimateSinglePose(imageTensor, {
          flipHorizontal: !isIOSPlatform(),
        });

        setState({ ...state, pose });

        tf.dispose([imageTensor]);
      }

      const isBlazefaceModelExist = isNotNil(state.blazefaceModel);

      if (isBlazefaceModel && isBlazefaceModelExist) {
        const imageTensor = images.next().value;
        const returnTensors = false;
        const faces = await state.blazefaceModel?.estimateFaces(
          imageTensor,
          returnTensors,
        );

        setState({ ...state, faces });

        tf.dispose([imageTensor]);
      }

      if (!AUTO_RENDER) {
        gl.endFrameEXP();
      }

      setRafID(requestAnimationFrame(estimateModel));
    };

    estimateModel().then(() => {});
  };

  const handleGoBack = (): void => {
    navigation.push(Screen.Main);
  };

  const renderPose = (): React.ReactElement | null => {
    const { pose } = state;

    if (!pose) return null;

    const keypoints = _.chain(pose.keypoints)
      .filter(({ score }) => score > MIN_KEYPOINT_POSE_SCORE)
      .map(({ position: { x, y } }) => (
        <Circle
          key={`skeletonkp_${_.uniqueId()}`}
          cx={x}
          cy={y}
          r="2"
          strokeWidth="0"
          fill="blue"
        />
      ))
      .value();

    const adjacentKeypoints = posenet.getAdjacentKeyPoints(
      pose.keypoints,
      MIN_KEYPOINT_POSE_SCORE,
    );

    const skeleton = adjacentKeypoints.map(([from, to]) => (
      <Line
        key={`skeletonls_${_.uniqueId()}`}
        x1={from.position.x}
        y1={from.position.y}
        x2={to.position.x}
        y2={to.position.y}
        stroke="magenta"
        strokeWidth="1"
      />
    ));

    return (
      <Svg
        height="100%"
        width="100%"
        viewBox={`0 0 ${INPUT_TENSOR_WIDTH} ${INPUT_TENSOR_HEIGHT}`}
      >
        {skeleton}
        {keypoints}
      </Svg>
    );
  };

  const renderFaces = (): React.ReactElement | null => {
    const { faces } = state;

    if (!faces) return null;

    const faceBoxes = _.map(faces, ({ topLeft, bottomRight, landmarks }) => {
      const circles = _.map(landmarks as number[][], (landmark) => (
        <Circle
          key={`landmark_${_.uniqueId()}`}
          cx={landmark[0]}
          cy={landmark[1]}
          r="2"
          strokeWidth="0"
          fill="blue"
        />
      ));

      const startX = _.head(topLeft as [number, number]) as number;
      const startY = _.last(topLeft as [number, number]) as number;
      const endX = _.head(bottomRight as [number, number]) as number;
      const endY = _.last(bottomRight as [number, number]) as number;

      return (
        <G key={`facebox_${_.uniqueId()}`}>
          <Rect
            x={startX}
            y={startY}
            fill="red"
            fillOpacity={0.2}
            width={endX - startX}
            height={endY - startY}
          />
          {circles}
        </G>
      );
    });

    const flipHorizontal = isIOSPlatform() ? 1 : -1;

    return (
      <Svg
        height="100%"
        width="100%"
        viewBox={`0 0 ${INPUT_TENSOR_WIDTH} ${INPUT_TENSOR_HEIGHT}`}
        scaleX={flipHorizontal}
      >
        {faceBoxes}
      </Svg>
    );
  };

  const textureDimensions = React.useMemo(() => getTextureDimensions(), []);

  const camView = (
    <View style={styles.cameraContainer}>
      <TensorCamera
        // Standard Camera props
        style={styles.camera}
        type={state.cameraType}
        zoom={0}
        // tensor related props
        cameraTextureHeight={textureDimensions.height}
        cameraTextureWidth={textureDimensions.width}
        resizeHeight={INPUT_TENSOR_HEIGHT}
        resizeWidth={INPUT_TENSOR_WIDTH}
        resizeDepth={3}
        onReady={handleImageTensorReady}
        autorender={AUTO_RENDER}
      />
      <View style={styles.modelResults}>
        {isPosenetModel ? renderPose() : renderFaces()}
      </View>
    </View>
  );

  if (isModelFetching) return <Splash />;

  return (
    <View style={{ width: '100%' }}>
      <View style={styles.sectionContainer}>
        <Button onPress={handleGoBack} title="Back" />
      </View>
      {camView}
    </View>
  );
};
