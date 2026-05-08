import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base mockup dimensions (iPhone 11/12/13 Pro etc.)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

// Use these functions to scale UI elements dynamically based on screen size
export const scale = (size: number) => (SCREEN_WIDTH / guidelineBaseWidth) * size;
export const verticalScale = (size: number) => (SCREEN_HEIGHT / guidelineBaseHeight) * size;
export const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

export { SCREEN_WIDTH, SCREEN_HEIGHT };
