import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Modal, Badge, Spinner, Alert } from 'react-bootstrap';
import { GoogleMap, Marker, LoadScript } from '@react-google-maps/api';
import { FaPhone, FaAmbulance, FaSync, FaHospital, FaUserCheck, FaClock, FaTimes, FaMapMarkerAlt, FaCar } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Dashboard.css';
import { db , firestore} from './auth.js';
import { ref, onValue, off } from 'firebase/database'; // correct source
import { collection, onSnapshot } from 'firebase/firestore';
import BrainSide from './pic/BrainSideLogo.png';
import { Link } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

const notificationSound = new Audio('/notification.mp3');

const transformToPatient = (dataItem) => {
  const balanceResult = dataItem.balanceResult === "yes";
  const eyeTestResult = dataItem.eyeTestResult === "yes";
  const faceResult = dataItem.faceAsymmetryResult === "yes"; // <-- changed key
  const armsResult = dataItem.armResult === "yes";
  const speechResult = dataItem.speechResult === "yes";

  return {
    id: dataItem.idCard,
    name: `${dataItem.name} ${dataItem.surname}`,
    phone: dataItem.phone,
    age: parseInt(dataItem.age),
    location: dataItem.disease || "Unknown", // reuse disease as placeholder location
    lat: dataItem.lat || null,
    lng: dataItem.lng || null,
    symptoms: {
      balance: balanceResult,
      eyes: eyeTestResult,
      face: faceResult,
      arms: armsResult,
      speech: speechResult,
    },
    notes: `Balance avg: ${dataItem.balanceAverage}, Eye test missed: ${dataItem.eyeTestMissed}/${dataItem.eyeTestDotsShown}`,
    timestamp: new Date(dataItem.createdAt),
    rawData: dataItem,
    isAdmitted: false
  };
};


// Mock ambulance drivers data
const ambulanceDrivers = [
  { id: 1, name: "Driver A", phone: "0811111111", vehicle: "Ambulance 1" },
  { id: 2, name: "Driver B", phone: "0822222222", vehicle: "Ambulance 2" },
  { id: 3, name: "Driver C", phone: "0833333333", vehicle: "Ambulance 3" }
];

const DoctorDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 13.7563, lng: 100.5018 });
  const [isLoading, setIsLoading] = useState(true);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [dispatchedAmbulances, setDispatchedAmbulances] = useState([]);
  const [showArrivalAlert, setShowArrivalAlert] = useState(false);
  const [arrivingPatient, setArrivingPatient] = useState(null);
  const [showAmbulanceModal, setShowAmbulanceModal] = useState(false);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const notificationRef = useRef(null);

  const { t } = useTranslation(); // ✅ Correct usage

  const calculatePriority = (symptoms) => {
    const symptomCount = Object.values(symptoms).filter(Boolean).length;
    if (symptomCount >= 3) return 1;
    if (symptomCount === 2) return 2;
    return 3;
  };

  useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(firestore, 'patients_topform'),
    (snapshot) => {
      try {
        setIsLoading(true);
        const patientsArray = snapshot.docs.map(doc => {
          const dataItem = doc.data();
          const patient = transformToPatient(dataItem);
          return {
            ...patient,
            priority: calculatePriority(patient.symptoms)
          };
        });

        setPatients(patientsArray);
        setIsLoading(false);
      } catch (error) {
        console.error("Error processing Firestore data:", error);
        setError("Failed to process patient data. Please try again later.");
        setIsLoading(false);
      }
    },
    (error) => {
      console.error("Error loading patient data from Firestore:", error);
      setError("Failed to load patient data from Firestore.");
      setIsLoading(false);
    }
  );

  return () => unsubscribe(); // Cleanup
}, []);


  // Effect for checking ambulance arrival times
  useEffect(() => {
    if (dispatchedAmbulances.length === 0) return;

    const interval = setInterval(() => {
      const now = new Date();
      const updatedAmbulances = dispatchedAmbulances.map(ambulance => {
        const timeLeft = Math.max(0, ambulance.arrivalTime.getTime() - now.getTime());
        const minutesLeft = Math.ceil(timeLeft / (1000 * 60));
        
        // Calculate ambulance position (mock movement)
        const progress = 1 - (timeLeft / (ambulance.arrivalTime.getTime() - ambulance.dispatchTime.getTime()));
        const startLat = 13.7563; // Hospital location (mock)
        const startLng = 100.5018;
        const endLat = ambulance.patient.lat;
        const endLng = ambulance.patient.lng;
        
        const currentLat = startLat + (endLat - startLat) * progress;
        const currentLng = startLng + (endLng - startLng) * progress;
        
        return {
          ...ambulance,
          minutesLeft,
          isArriving: minutesLeft <= 5,
          currentPosition: { lat: currentLat, lng: currentLng }
        };
      });

      // Check if any ambulance has arrived (timeLeft <= 0)
      const arrivedAmbulances = updatedAmbulances.filter(a => a.minutesLeft <= 0 && !a.hasArrived);
      if (arrivedAmbulances.length > 0) {
        arrivedAmbulances.forEach(ambulance => {
          // Automatically admit patient when ambulance arrives
          setPatients(prevPatients => 
            prevPatients.map(patient => 
              patient.id === ambulance.patient.id 
                ? { ...patient, isAdmitted: true } 
                : patient
            )
          );
        });

        // Mark as arrived
        const updated = updatedAmbulances.map(a => 
          a.minutesLeft <= 0 ? {...a, hasArrived: true} : a
        );
        setDispatchedAmbulances(updated);
      }

      // Check if any ambulance is arriving in <=5 minutes
      const arrivingAmbulance = updatedAmbulances.find(a => a.minutesLeft <= 5 && !a.notified);
      if (arrivingAmbulance) {
        // Play notification sound
        if (notificationSound) {
          notificationSound.play().catch(e => console.log("Audio play failed:", e));
        }
        
        // Show alert
        setArrivingPatient(arrivingAmbulance.patient);
        setShowArrivalAlert(true);
        
        // Mark as notified
        const updated = updatedAmbulances.map(a => 
          a.id === arrivingAmbulance.id ? {...a, notified: true} : a
        );
        setDispatchedAmbulances(updated);
      } else {
        setDispatchedAmbulances(updatedAmbulances);
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [dispatchedAmbulances]);

  const toggleAdmission = (patientId) => {
    setPatients(patients.map(patient => 
      patient.id === patientId 
        ? { ...patient, isAdmitted: !patient.isAdmitted } 
        : patient
    ));
  };

  const priority1Patients = patients.filter(p => p.priority === 1 && !p.isAdmitted);
  const priority2Patients = patients.filter(p => p.priority === 2 && !p.isAdmitted);
  const priority3Patients = patients.filter(p => p.priority === 3 && !p.isAdmitted);
  const admittedPatients = patients.filter(p => p.isAdmitted);

  const openPatientModal = (patient) => {
    setSelectedPatient(patient);
    setShowModal(true);
    if (patient.lat && patient.lng) {
      setMapCenter({ lat: patient.lat, lng: patient.lng });
    }
  };

  const callPatient = (phone) => {
    alert(`Calling ${phone}`);
  };

  const callDriver = (driverPhone) => {
    alert(`Calling ambulance driver at ${driverPhone}`);
  };

  const dispatchAmbulance = () => {
    if (selectedPatient) {
      const minutes = Math.floor(Math.random() * 13) + 3;
      const arrivalTime = new Date();
      arrivalTime.setMinutes(arrivalTime.getMinutes() + minutes);
      
      const randomDriver = ambulanceDrivers[Math.floor(Math.random() * ambulanceDrivers.length)];
      
      const ambulance = {
        id: Date.now(),
        patient: selectedPatient,
        dispatchTime: new Date(),
        arrivalTime,
        minutesLeft: minutes,
        isArriving: minutes <= 5,
        notified: minutes <= 5,
        driver: randomDriver,
        currentPosition: { lat: 13.7563, lng: 100.5018 } // Start at hospital location
      };
      
      setDispatchedAmbulances([...dispatchedAmbulances, ambulance]);
      
      if (minutes <= 5) {
        if (notificationSound) {
          notificationSound.play().catch(e => console.log("Audio play failed:", e));
        }
        setArrivingPatient(selectedPatient);
        setShowArrivalAlert(true);
      }
      
      alert(`Ambulance dispatched to ${selectedPatient.name}. Estimated arrival: ${minutes} minutes.`);
      setShowModal(false);
    }
  };

  const completeAmbulance = (ambulanceId) => {
    const ambulance = dispatchedAmbulances.find(a => a.id === ambulanceId);
    if (ambulance) {
      setPatients(prevPatients => 
        prevPatients.map(patient => 
          patient.id === ambulance.patient.id 
            ? { ...patient, isAdmitted: true } 
            : patient
        )
      );
    }
    setDispatchedAmbulances(dispatchedAmbulances.filter(a => a.id !== ambulanceId));
  };

  const openAmbulanceModal = (ambulance) => {
    setSelectedAmbulance(ambulance);
    setShowAmbulanceModal(true);
    if (ambulance.currentPosition) {
      setMapCenter(ambulance.currentPosition);
    }
  };

  const refreshData = () => {
    window.location.reload();
  };

  return (
    <Container fluid className="py-3" style={{fontFamily:"poppins"}}>
        <header
          className="text-white p-3 mb-4 position-relative"
          style={{ backgroundColor: "#8865DE", borderRadius: "15px" }}
             >
          <div style={{ fontSize: "60px" }}>{t('HeadlineDashBoard')}</div>
      <Link to="/Inform" className='Back'><img
        className='BrainsideLeftTopDashBoard'
        src={BrainSide}
        alt="Brain Icon"
        style={{
          position: "absolute",
          top: "13px",
          right: "30px",
          width: "120px", // adjust size here
          height: "auto",
        }}
      />
      </Link>

      <div className="d-flex align-items-center gap-2 mt-2">
        <small>Connected to Stroke Aware Assessment System</small>
        <Button variant="light" size="sm" onClick={refreshData} style={{marginLeft:"20px"}}>
          <FaSync /> Refresh
        </Button>
      </div>
    </header>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Arrival Alert */}
      <Modal show={showArrivalAlert} onHide={() => setShowArrivalAlert(false)} centered>
        <Modal.Header closeButton className="bg-warning">
          <Modal.Title>Ambulance Arriving Soon!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <h4>
              <FaAmbulance className="me-2 text-danger" />
              Ambulance arriving in ≤5 minutes!
            </h4>
            <p className="mt-3">
              <strong>Patient:</strong> {arrivingPatient?.name}<br />
              <strong>Location:</strong> {arrivingPatient?.location}<br />
              <strong>Priority:</strong> <Badge bg={
                arrivingPatient?.priority === 1 ? 'danger' :
                arrivingPatient?.priority === 2 ? 'warning' : 'success'
              }>
                Priority {arrivingPatient?.priority}
              </Badge>
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="warning" onClick={() => setShowArrivalAlert(false)}>
            Acknowledged
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Ambulance Details Modal */}
      <Modal show={showAmbulanceModal} onHide={() => setShowAmbulanceModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaAmbulance className="me-2 text-danger" />
            Ambulance Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAmbulance && (
            <div>
              <h5>Patient Information</h5>
              <p><strong>Name:</strong> {selectedAmbulance.patient.name}</p>
              <p><strong>Location:</strong> {selectedAmbulance.patient.location}</p>
              
              <h5 className="mt-4">Ambulance Information</h5>
              <p><strong>Driver:</strong> {selectedAmbulance.driver.name}</p>
              <p><strong>Vehicle:</strong> {selectedAmbulance.driver.vehicle}</p>
              <p><strong>Contact:</strong> {selectedAmbulance.driver.phone}</p>
              <p><strong>Status:</strong> 
                <Badge bg={selectedAmbulance.isArriving ? 'danger' : 'warning'} className="ms-2">
                  {selectedAmbulance.minutesLeft} min{selectedAmbulance.minutesLeft !== 1 ? 's' : ''} remaining
                </Badge>
              </p>
              
              <div style={{ height: '250px', marginTop: '20px' }}>
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={selectedAmbulance.currentPosition || mapCenter}
                  zoom={15}
                >
                  <Marker 
                    position={selectedAmbulance.currentPosition}
                    icon={{
                      url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                      scaledSize: new window.google.maps.Size(40, 40)
                    }}
                  />
                  <Marker 
                    position={{ lat: selectedAmbulance.patient.lat, lng: selectedAmbulance.patient.lng }}
                    icon={{
                      url: selectedAmbulance.patient.priority === 1 
                        ? "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
                        : selectedAmbulance.patient.priority === 2
                          ? "https://maps.google.com/mapfiles/ms/icons/orange-dot.png"
                          : "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
                      scaledSize: new window.google.maps.Size(40, 40)
                    }}
                  />
                </GoogleMap>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => callDriver(selectedAmbulance?.driver.phone)}>
            <FaPhone /> Call Driver
          </Button>
          <Button variant="success" onClick={() => {
            if (selectedAmbulance) {
              completeAmbulance(selectedAmbulance.id);
              setShowAmbulanceModal(false);
            }
          }}>
            <FaHospital /> Complete Mission
          </Button>
          <Button variant="secondary" onClick={() => setShowAmbulanceModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      
      {isLoading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p>Loading patient data...</p>
        </div>
      ) : (
        <>
          <Row>
            {/* Priority Queues */}
            <Col md={4}>
              <Card className="priority-1 mb-4">
                <Card.Header className="bg-danger text-white">
                  <h2>Priority 1 (Critical)</h2>
                  <h6>≥3 BE-FAST symptoms</h6>
                  <Badge bg="light" text="dark">{priority1Patients.length} patients</Badge>
                </Card.Header>
                <Card.Body>
                  {priority1Patients.length > 0 ? (
                    priority1Patients.map(patient => (
                      <PatientCard 
                        key={patient.id} 
                        patient={patient} 
                        onClick={() => openPatientModal(patient)}
                      />
                    ))
                  ) : (
                    <p className="text-muted">No critical patients</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card className="priority-2 mb-4">
               <Card.Header Header className="bg-warning text-white">
                  <h2>Priority 2 (Urgent)</h2>
                  <h6>2 BE-FAST symptoms</h6>
                  <Badge bg="light" text="dark">{priority2Patients.length} patients</Badge>
                </Card.Header>
                <Card.Body>
                  {priority2Patients.length > 0 ? (
                    priority2Patients.map(patient => (
                      <PatientCard 
                        key={patient.id} 
                        patient={patient} 
                        onClick={() => openPatientModal(patient)}
                      />
                    ))
                  ) : (
                    <p className="text-muted">No urgent patients</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card className="priority-3 mb-4">
                <Card.Header className="bg-success text-white">
                  <h2>Priority 3 (Monitor)</h2>
                  <p>1 BE-FAST symptom</p>
                  <Badge bg="light" text="dark">{priority3Patients.length} patients</Badge>
                </Card.Header>
                <Card.Body>
                  {priority3Patients.length > 0 ? (
                    priority3Patients.map(patient => (
                      <PatientCard 
                        key={patient.id} 
                        patient={patient} 
                        onClick={() => openPatientModal(patient)}
                      />
                    ))
                  ) : (
                    <p className="text-muted">No patients to monitor</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Dispatched Ambulances Section */}
          {dispatchedAmbulances.length > 0 && (
            <Row className="mb-4">
              <Col xs={12}>
                <Card>
                  <Card.Header className="bg-danger text-white">
                    <h2>
                      <FaAmbulance className="me-2" />
                      Dispatched Ambulances
                      <Badge bg="light" text="dark" className="ms-2">{dispatchedAmbulances.length}</Badge>
                    </h2>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      {dispatchedAmbulances.map(ambulance => (
                        <Col md={4} key={ambulance.id}>
                          <Card className={`mb-3 ${ambulance.isArriving ? 'border-danger border-2' : ''}`}>
                            <Card.Body>
                              <div className="d-flex justify-content-between">
                                <h5>{ambulance.patient.name}</h5>
                                <div>
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    className="me-2"
                                    onClick={() => openAmbulanceModal(ambulance)}
                                  >
                                    <FaMapMarkerAlt /> Track
                                  </Button>
                                  <Button 
                                    variant="outline-success" 
                                    size="sm"
                                    onClick={() => completeAmbulance(ambulance.id)}
                                  >
                                    <FaTimes /> Complete
                                  </Button>
                                </div>
                              </div>
                              <p className="text-muted small">
                                {ambulance.patient.location}
                              </p>
                              <div className="d-flex justify-content-between align-items-center">
                                <Badge bg={ambulance.isArriving ? 'danger' : 'warning'}>
                                  <FaClock className="me-1" />
                                  {ambulance.minutesLeft} min{ambulance.minutesLeft !== 1 ? 's' : ''}
                                </Badge>
                                <small className="text-muted">
                                  Driver: {ambulance.driver.name}
                                </small>
                              </div>
                              {ambulance.isArriving && (
                                <div className="mt-2 text-center text-danger">
                                  <strong>ARRIVING SOON!</strong>
                                </div>
                              )}
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
          
          {/* Admitted Patients Section */}
          <Row className="mb-4">
            <Col xs={12}>
              <Card>
                <Card.Header className="bg-info text-white">
                  <h2>
                    <FaHospital className="me-2" />
                    Admitted Patients
                    <Badge bg="light" text="dark" className="ms-2">{admittedPatients.length}</Badge>
                  </h2>
                </Card.Header>
                <Card.Body>
                  {admittedPatients.length > 0 ? (
                    <Row>
                      {admittedPatients.map(patient => (
                        <Col md={4} key={patient.id}>
                          <Card className="mb-3">
                            <Card.Body>
                              <div className="d-flex justify-content-between">
                                <h5>{patient.name}</h5>
                                <Button 
                                  variant="outline-danger" 
                                  size="sm"
                                  onClick={() => toggleAdmission(patient.id)}
                                >
                                  Discharge
                                </Button>
                              </div>
                              <p className="text-muted small">
                                Age: {patient.age} • {patient.location}
                              </p>
                              <div className="d-flex justify-content-between">
                                <Badge bg="info">
                                  <FaUserCheck className="me-1" />
                                  Admitted
                                </Badge>
                                <Badge bg={
                                  patient.priority === 1 ? 'danger' :
                                  patient.priority === 2 ? 'warning' : 'success'
                                }>
                                  Priority {patient.priority}
                                </Badge>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <p className="text-muted">No patients currently admitted</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Map Container */}
          <Row className="mb-4">
            <Col xs={12}>
              <Card>
                <Card.Header>
                  <h2>Patient & Ambulance Locations</h2>
                </Card.Header>
                <Card.Body>
                  <div style={{ height: '400px' }}>
                    <LoadScript 
                      googleMapsApiKey="AIzaSyD4EvdwX6O1nwu6-RCbMlKuTwA1vth6AnY"
                      onLoad={() => setIsMapLoaded(true)}
                    >
                      {isMapLoaded && (
                        <GoogleMap
                          mapContainerStyle={{ width: '100%', height: '100%' }}
                          center={mapCenter}
                          zoom={6}
                        >
                          {patients.map(patient => (
                            patient.lat && patient.lng && (
                              <Marker
                                key={patient.id}
                                position={{ lat: patient.lat, lng: patient.lng }}
                                onClick={() => openPatientModal(patient)}
                                icon={{
                                  url: patient.isAdmitted 
                                    ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
                                    : patient.priority === 1 
                                      ? "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
                                      : patient.priority === 2
                                        ? "https://maps.google.com/mapfiles/ms/icons/orange-dot.png"
                                        : "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
                                  scaledSize: new window.google.maps.Size(32, 32)
                                }}
                              />
                            )
                          ))}
                          {dispatchedAmbulances.map(ambulance => (
                            ambulance.currentPosition && (
                              <Marker
                                key={`ambulance-${ambulance.id}`}
                                position={ambulance.currentPosition}
                                onClick={() => openAmbulanceModal(ambulance)}
                                icon={{
                                  url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                                  scaledSize: new window.google.maps.Size(32, 32)
                                }}
                              />
                            )
                          ))}
                        </GoogleMap>
                      )}
                    </LoadScript>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
      
      {/* Patient Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedPatient?.name || 'Patient Details'}
            {selectedPatient && (
              <>
                <Badge 
                  bg={
                    selectedPatient.priority === 1 ? 'danger' :
                    selectedPatient.priority === 2 ? 'warning' : 'success'
                  }
                  className="ms-2"
                >
                  Priority {selectedPatient.priority}
                </Badge>
                {selectedPatient.isAdmitted && (
                  <Badge bg="info" className="ms-2">
                    <FaHospital className="me-1" />
                    Admitted
                  </Badge>
                )}
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPatient && (
            <Row>
              <Col md={6}>
                <h5 style={{fontFamily:"Prompt",fontSize:"30px", textDecoration:"underline"}}>ข้อมูลผู้ป่วย</h5>
                <p><strong>ID:</strong> {selectedPatient.id}</p>
                <p><strong>Name:</strong> {selectedPatient.name}</p>
                <p><strong>Age:</strong> {selectedPatient.age}</p>
                <p><strong>Gender:</strong> {selectedPatient.rawData?.gender || 'Unknown'}</p>
                <p><strong>disease:</strong> {selectedPatient.rawData?.disease || 'Unknown'}</p>
                <p><strong>Phone:</strong> {selectedPatient.phone}</p>
                
                <h5 style={{fontFamily:"Prompt",fontSize:"30px", textDecoration:"underline"}}>ผลการประเมิน</h5>
                <p><strong>Balance Test:</strong> 
                  <Badge bg={selectedPatient.symptoms.balance ? 'danger' : 'success'} className="ms-2">
                    {selectedPatient.symptoms.balance ? 'Abnormal' : 'Normal'}
                  </Badge>
                  {selectedPatient.rawData?.balanceAverage && (
                    <span className="ms-2">(Score: {selectedPatient.rawData.balanceAverage})</span>
                  )}
                </p>
                <p><strong>Eye Test:</strong> 
                  <Badge bg={selectedPatient.symptoms.eyes ? 'danger' : 'success'} className="ms-2">
                    {selectedPatient.symptoms.eyes ? 'Abnormal' : 'Normal'}
                  </Badge>
                  {selectedPatient.rawData?.eyeTestMissed !== undefined && (
                    <span className="ms-2">(Missed: {selectedPatient.rawData.eyeTestMissed}/{selectedPatient.rawData.eyeTestDotsShown})</span>
                  )}
                </p>
                <p><strong>Face Test:</strong>
                  <Badge bg={selectedPatient.symptoms.face ? 'danger' : 'success'} className="ms-2">
                    {selectedPatient.symptoms.face ? 'Abnormal' : 'Normal'}
                  </Badge>
                </p>
                <p><strong>Arms Test:</strong>
                  <Badge bg={selectedPatient.symptoms.arms ? 'danger' : 'success'} className="ms-2">
                    {selectedPatient.symptoms.arms ? 'Abnormal' : 'Normal'}
                  </Badge>
                </p>
                <p><strong>Speech Test:</strong>
                  <Badge bg={selectedPatient.symptoms.speech ? 'danger' : 'success'} className="ms-2">
                    {selectedPatient.symptoms.speech ? 'Abnormal' : 'Normal'}
                  </Badge>
                </p>
                <p><strong>Assessment Time:</strong> {selectedPatient.rawData.formTime}</p>
              </Col>
              
              <Col md={6}>
                <h5 style={{fontFamily:"Prompt",fontSize:"30px", textDecoration:"underline"}}>ตำแหน่ง</h5>
                
                <div style={{ height: '250px', marginTop: '20px' }}>
                  {selectedPatient.lat && selectedPatient.lng ? (
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '100%' }}
                      center={{ lat: selectedPatient.lat, lng: selectedPatient.lng }}
                      zoom={15}
                    >
                      <Marker 
                        position={{ lat: selectedPatient.lat, lng: selectedPatient.lng }}
                        icon={{
                          url: selectedPatient.isAdmitted 
                            ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
                            : selectedPatient.priority === 1 
                              ? "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
                              : selectedPatient.priority === 2
                                ? "https://maps.google.com/mapfiles/ms/icons/orange-dot.png"
                                : "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
                          scaledSize: new window.google.maps.Size(40, 40)
                        }}
                      />
                      {/* Show ambulance if one is dispatched to this patient */}
                      {dispatchedAmbulances
                        .filter(a => a.patient.id === selectedPatient.id)
                        .map(ambulance => (
                          <Marker
                            key={`ambulance-${ambulance.id}`}
                            position={ambulance.currentPosition}
                            icon={{
                              url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                              scaledSize: new window.google.maps.Size(40, 40)
                            }}
                          />
                        ))
                      }
                    </GoogleMap>
                  ) : (
                    <div className="text-center text-muted" style={{ paddingTop: '100px' }}>
                      No location data available
                    </div>
                  )}
                </div>
                
                <div className="mt-3">
                  <Button 
                    variant={selectedPatient.isAdmitted ? "outline-danger" : "outline-success"}
                    className="w-100"
                    onClick={() => {
                      toggleAdmission(selectedPatient.id);
                      setShowModal(false);
                    }}
                  >
                    {selectedPatient.isAdmitted ? (
                      <>
                        <FaHospital className="me-2" />
                        Discharge Patient
                      </>
                    ) : (
                      <>
                        <FaUserCheck className="me-2" />
                        Admit Patient
                      </>
                    )}
                  </Button>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={() => callPatient(selectedPatient?.phone)}>
            <FaPhone /> Call Patient
          </Button>
          {!dispatchedAmbulances.some(a => a.patient.id === selectedPatient?.id) && (
            <Button variant="danger" onClick={dispatchAmbulance}>
              <FaAmbulance /> Dispatch Ambulance
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Audio element for notifications */}
      <audio ref={notificationRef} src="/notification.mp3" preload="auto" />
    </Container>
  );
};

const PatientCard = ({ patient, onClick }) => {
  const symptomCount = Object.values(patient.symptoms).filter(Boolean).length;
  const positiveSymptoms = Object.entries(patient.symptoms)
    .filter(([_, value]) => value)
    .map(([key]) => {
      switch(key) {
        case 'balance': return 'Balance';
        case 'eyes': return 'Eyes';
        case 'face': return 'Face';
        case 'arms': return 'Arms';
        case 'speech': return 'Speech';
        default: return key;
      }
    });
  
  return (
    <div className="patient-card" onClick={onClick}>
      <h5>{patient.name}</h5>
      <p>
        <Badge 
          bg={
            patient.priority === 1 ? 'danger' :
            patient.priority === 2 ? 'warning' : 'success'
          }
        >
          {symptomCount} symptom{symptomCount !== 1 ? 's' : ''}
        </Badge>
        {positiveSymptoms.length > 0 && (
          <span className="ms-2 small">{positiveSymptoms.join(', ')}</span>
        )}
      </p>
      <p className="text-muted small">
        {patient.rawData.formDate} • Age: {patient.age}
      </p>
    </div>
  );
};

export default DoctorDashboard;

