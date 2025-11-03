import React, { useEffect } from 'react'; 
import Register from './component/Register.jsx';
import Login from './component/Login.jsx';
import Otp from './asset/Otp/Otp.jsx'
import { Inform } from './component/Inform.jsx';
import BEFAST_MAIN_Detail from './asset/BEFAST/BEFAST_MAIN_Detail.jsx'
import {BEFAST_MAIN_BALANCE} from './asset/BEFAST/BEFAST_MAIN_BALANCE.jsx'
import {BEFAST_MAIN_EYES} from './asset/BEFAST/BEFAST_MAIN_EYES.jsx'
import {BEFAST_MAIN_EYES2} from './asset/BEFAST/BEFAST_MAIN_EYES2.jsx'
import {BEFAST_MAIN_FACE} from './asset/BEFAST/BEFAST_MAIN_FACE.jsx'
import {BEFAST_MAIN_ARM} from './asset/BEFAST/BEFAST_MAIN_ARM.jsx'
import {BEFAST_MAIN_SPEECH} from './asset/BEFAST/BEFAST_MAIN_SPEECH.jsx'
import {BEFAST_MAIN_TIME} from './asset/BEFAST/BEFAST_MAIN_TIME.jsx'
import ArmStrengthTest from './asset/BEFAST/Assesment/ARM_ass.jsx'
import Speech from './asset/BEFAST/Assesment/Speech.jsx';
import BALANCE from './asset/BEFAST/Assesment/BALANCE.jsx'
import BALANCEIntro from './asset/BEFAST/Assesment/BalanceIntro.jsx'
import EYEsIntro from './asset/BEFAST/Assesment/EYEsIntro.jsx'
import FaceIntro from './asset/BEFAST/Assesment/FACEIntro.jsx'
import ArmIntro from './asset/BEFAST/Assesment/ARMIntro.jsx'
import FACE from './asset/BEFAST/Assesment/FACE.jsx'
import EYE from './asset/BEFAST/Assesment/EYE.jsx'
import TimeMap from './asset/BEFAST/Assesment/TimeMap.js'
import PatientDetail from './component/PatientDetail.jsx'
import {VoiceTrigger} from './component/TestVoiceSpeech.js'
import { Brain3DHeatmap } from "./component/ฺBrain3DHeatmap.jsx";


import Hospital from './asset/BEFAST/Assesment/Hospital.jsx';
import SearchByIdCardAngel from './component/SearchPatientAngel.jsx';
import DoctorDashboard from './component/Dashboard.jsx';
import Gaze from './asset/BEFAST/Assesment/GazeTest.jsx';
import Tele from './component/telemed.jsx';
import ViewportBadge from './component/ViewportBadge.jsx';
import About from './component/Aboutus.jsx';
import { Training } from './component/user-training.jsx';
import HomePage from "./component/Homepage.jsx";
import RoomPage from "./component/Room/Room.jsx";


import { useTranslation } from 'react-i18next';


import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";


function App() {
 
 const { i18n } = useTranslation();

      useEffect(() => {
    localStorage.removeItem('patientName');
    localStorage.removeItem('patientId');
  }, []);

  useEffect(() => {
    document.documentElement.lang = i18n.language;

    const font = i18n.language === 'th' ? 'Prompt' : 'Poppins';
    document.body.style.fontFamily = `'${font}', sans-serif`;
  }, [i18n.language]);

  
  return (
    <Router>
      <Routes>
        <Route
                        exact
                        path="/"
                        element={<Login />}
                    />
        <Route          path="/Register"
                        element={<Register/>}
                    />
        <Route
                        path="/Inform"
                        element={<Inform/>}
                    />
         <Route
                        path="/Otp"
                        element={<Otp/>}
                    />
        <Route
                        path="/BEFAST_MAIN_Detail"
                        element={<BEFAST_MAIN_Detail/>}
                    />
        <Route
                        path="/BEFAST_MAIN_BALANCE"
                        element={<BEFAST_MAIN_BALANCE/>}
                    />
        <Route
                        path="/BEFAST_MAIN_EYES"
                        element={<BEFAST_MAIN_EYES/>}
                    />
        <Route
                        path="/BEFAST_MAIN_EYES2"
                        element={<BEFAST_MAIN_EYES2/>}
                    />
        <Route
                        path="/BEFAST_MAIN_FACE"
                        element={<BEFAST_MAIN_FACE/>}
                    />
        <Route
                        path="/BEFAST_MAIN_ARM"
                        element={<BEFAST_MAIN_ARM/>}
                    />
        <Route
                        path="/BEFAST_MAIN_SPEECH"
                        element={<BEFAST_MAIN_SPEECH/>}
                    />
        <Route
                        path="/BEFAST_MAIN_TIME"
                        element={<BEFAST_MAIN_TIME/>}
                    />         
        <Route
                        path="/ArmStrengthTest"
                        element={<ArmStrengthTest/>}
                    />      
        <Route
                        path="/Speech"
                        element={<Speech/>}
                    />
        <Route
                        path="/BALANCE"
                        element={<BALANCE/>}
                    />
        <Route
                        path="/BALANCEIntro"
                        element={<BALANCEIntro/>}
                    />
        <Route
                        path="/EYEsIntro"
                        element={<EYEsIntro/>}
                    />
        <Route
                        path="/ArmIntro"
                        element={<ArmIntro/>}
                    />
        <Route
                        path="/FaceIntro"
                        element={<FaceIntro/>}
                    />
        <Route
                        path="/FACE"
                        element={<FACE/>}
                    />
        <Route
                        path="/EYE"
                        element={<EYE/>}
                    />  
        <Route
                        path="/TimeMap"
                        element={<TimeMap/>}
                    />
        <Route
                        path="/PatientDetail"
                        element={<PatientDetail/>}
                    />
        <Route
                        path="/VoiceTrigger"
                        element={<VoiceTrigger/>}
                    />
        <Route
                        path="/SearchByIdCardAngel"
                        element={<SearchByIdCardAngel/>}
                    />
        <Route
                        path="/Hospital"
                        element={<Hospital/>}
                    />
        <Route
                        path="/DoctorDashboard"
                        element={<DoctorDashboard/>}
                    />
        <Route
                        path="/Gaze"
                        element={<Gaze/>}
                    />
        <Route
                        path="/Training"
                        element={<Training/>}
                    />
        <Route
                        path="/Tele"
                        element={<Tele/>}
                    />
        <Route
                        path="/ViewportBadge"
                        element={<ViewportBadge/>}
                    />
        <Route
                        path="/About"
                        element={<About/>}
                    />
        <Route
                        path="/HomePage"
                        element={<HomePage/>}
                    />
        <Route
                        path="/room/:roomID"
                        element={<RoomPage/>}
                    />
        <Route
                        path="/Brain3DHeatmap"
                        element={<Brain3DHeatmap/>}
                    />

        </Routes>
    </Router>
  );
}

export default App;

