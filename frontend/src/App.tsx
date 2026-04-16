import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';
import AddCropScreen from './pages/add-crop/AddCrop';
import DiseaseResult from "./pages/DiseaseDetection/DiseaseResult";

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
// import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import CommunityExpertsScreen from './pages/community/community';
import FertilizerApp from './pages/fertilizer-prediction/FertilizerPrediction';
import WeatherForecast from './pages/weather/Weather';
import MarketPrices from './pages/market-price-prediction/MarketPrice';
import Profile from './pages/Profile/UserProfile';
import GovernmentSchemes from './pages/GovernmentSchemes/GovernmentSchemes';
import BuySell from './pages/BuySell/BuySell';
import CropCalendar from './pages/CropCalendar/CropCalendar';
import DiseaseDetection from './pages/DiseaseDetection/DiseaseDetection';
import YeildPrediction from './pages/YeildPrediction/YeildPrediction';
import Login from './pages/Login/Login';
import SignUp from './pages/Signup/Signup';
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/ForgotPassword/ResetPassword";
import ChangePassword from "./pages/ForgotPassword/ChangePassword";

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/home">
          <Home />
        </Route>
        <Route exact path="/add-crop">
          <AddCropScreen />
        </Route>
        <Route exact path="/fertilizer" >
          <FertilizerApp />
        </Route>
        <Route exact path="/community" >
          <CommunityExpertsScreen />
        </Route>
        <Route exact path="/weather" >
          <WeatherForecast />
        </Route>
        <Route exact path="/market-price" >
          <MarketPrices />
        </Route>
        <Route exact path="/profile" >
          <Profile />
        </Route>
        <Route exact path="/gov-schemes" >
          <GovernmentSchemes />
        </Route>
        <Route exact path="/buy-sell" >
          <BuySell />
        </Route>
        <Route exact path="/crop-calendar" >
          <CropCalendar />
        </Route>
        <Route exact path="/disease-detection" >
          <DiseaseDetection />
        </Route>
        <Route exact path="/yeild-prediction" >
          <YeildPrediction />
        </Route>
        <Route exact path="/login" >
          <Login />
        </Route>
        <Route exact path="/signup" >
          <SignUp />
        </Route>
        <Route exact path="/">
          <Redirect to="/login" />
        </Route>
        <Route path="/disease-result" component={DiseaseResult} exact />   

        <Route path="/forgot-password" component={ForgotPassword} exact />
        <Route path="/reset-password/:token" component={ResetPassword} exact />    
        <Route path="/change-password" component={ChangePassword} exact />  
        
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
