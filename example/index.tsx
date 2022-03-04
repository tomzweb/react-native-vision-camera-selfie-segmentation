import { AppRegistry } from 'react-native';
import 'react-native-reanimated';
import App from './src/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
